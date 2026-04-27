package handlers

import (
	"github.com/bukdanaws-commits/seleevent/backend/internal/services"
	"github.com/bukdanaws-commits/seleevent/backend/pkg/response"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// ─── Payment Handler ─────────────────────────────────────────────────────────

// createPaymentRequest is the request body for creating a payment.
type createPaymentRequest struct {
	OrderID     string `json:"orderId"`
	PaymentType string `json:"paymentType"` // "qris", "bank_transfer", "gopay"
	Bank        string `json:"bank,omitempty"` // Optional: for bank_transfer (default: bca)
}

// CreatePayment handles POST /api/v1/payment/create
// Creates a Midtrans payment transaction for an existing order.
func CreatePayment(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, ok := c.Locals("userID").(string)
		if !ok {
			return response.Unauthorized(c, "Not authenticated")
		}

		var req createPaymentRequest
		if err := c.BodyParser(&req); err != nil {
			return response.BadRequest(c, "Invalid request body")
		}

		if req.OrderID == "" {
			return response.BadRequest(c, "orderId is required")
		}
		if req.PaymentType == "" {
			return response.BadRequest(c, "paymentType is required")
		}
		if req.PaymentType != "qris" && req.PaymentType != "bank_transfer" && req.PaymentType != "gopay" {
			return response.BadRequest(c, "paymentType must be one of: qris, bank_transfer, gopay")
		}

		// Get the order
		orderService := services.NewOrderService(db)
		order, err := orderService.GetOrderByID(req.OrderID)
		if err != nil {
			return response.NotFound(c, "Order not found")
		}

		// Verify the order belongs to the user
		if order.UserID != userID {
			return response.Forbidden(c, "You do not have access to this order")
		}

		// Only pending orders can be paid
		if order.Status != "pending" {
			return response.BadRequest(c, "Order is not in pending status")
		}

		// Check if order has expired
		if order.ExpiresAt != nil && order.ExpiresAt.Unix() < c.Context().Time().Unix() {
			return response.BadRequest(c, "Order has expired")
		}

		// Build item details for Midtrans
		var items []services.ItemDetail
		for _, item := range order.Items {
			items = append(items, services.ItemDetail{
				ID:       item.TicketTypeID,
				Price:    int64(item.PricePerTicket),
				Quantity: item.Quantity,
				Name:     item.TicketType.Name,
			})
		}

		// Get user info for customer details
		var user struct {
			Name  string `json:"name"`
			Email string `json:"email"`
		}
		db.Table("users").Where("id = ?", userID).Select("name, email").Scan(&user)

		// Create Midtrans transaction
		paymentService := services.NewPaymentService()
		var midtransResp *services.CreateTransactionResponse

		switch req.PaymentType {
		case "qris":
			midtransResp, err = paymentService.CreateQRISTransaction(
				order.OrderCode, int64(order.TotalAmount), user.Name, user.Email, items,
			)
		case "bank_transfer":
			midtransResp, err = paymentService.CreateBankTransferTransaction(
				order.OrderCode, int64(order.TotalAmount), user.Name, user.Email, items, req.Bank,
			)
		case "gopay":
			midtransResp, err = paymentService.CreateGoPayTransaction(
				order.OrderCode, int64(order.TotalAmount), user.Name, user.Email, items,
			)
		}

		if err != nil {
			return response.InternalError(c, "Failed to create payment: "+err.Error())
		}

		// Update order with payment type
		paymentTypeStr := req.PaymentType
		midtransID := midtransResp.TransactionID
		db.Model(order).Updates(map[string]interface{}{
			"payment_type":            paymentTypeStr,
			"midtrans_transaction_id": midtransID,
		})

		// Build response data
		respData := fiber.Map{
			"orderId":         order.OrderCode,
			"transactionId":   midtransResp.TransactionID,
			"paymentType":     req.PaymentType,
			"grossAmount":     midtransResp.GrossAmount,
			"transactionStatus": midtransResp.TransactionStatus,
		}

		// Add payment-type-specific data
		switch req.PaymentType {
		case "qris":
			respData["qrString"] = midtransResp.QRString
			// Find QR action URL
			for _, action := range midtransResp.Actions {
				if action.Name == "generate-qr-code" {
					respData["qrUrl"] = action.URL
				}
			}
		case "bank_transfer":
			if len(midtransResp.VANumbers) > 0 {
				respData["vaNumber"] = midtransResp.VANumbers[0].VANumber
				respData["bank"] = midtransResp.VANumbers[0].Bank
			}
		case "gopay":
			respData["actions"] = midtransResp.Actions
			for _, action := range midtransResp.Actions {
				if action.Name == "deeplink-redirect" {
					respData["redirectUrl"] = action.URL
				}
			}
		}

		return response.OK(c, respData)
	}
}

// PaymentCallback handles POST /api/v1/payment/callback
// This is the Midtrans webhook notification endpoint (NO AUTH).
func PaymentCallback(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		payload := c.Body()

		paymentService := services.NewPaymentService()
		notif, err := paymentService.HandleNotification(payload)
		if err != nil {
			return response.BadRequest(c, "Invalid notification: "+err.Error())
		}

		// Process the payment callback
		orderService := services.NewOrderService(db)
		if err := orderService.ProcessPaymentCallback(
			notif.OrderID,
			notif.PaymentType,
			notif.TransactionStatus,
			notif.TransactionID,
		); err != nil {
			return response.InternalError(c, "Failed to process payment callback: "+err.Error())
		}

		// Always return 200 to Midtrans to acknowledge receipt
		return c.JSON(fiber.Map{
			"success": true,
			"message": "Notification processed",
		})
	}
}

// GetPaymentStatus handles GET /api/v1/payment/status/:orderId
// Checks payment status from Midtrans and updates local order.
func GetPaymentStatus(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, ok := c.Locals("userID").(string)
		if !ok {
			return response.Unauthorized(c, "Not authenticated")
		}

		orderID := c.Params("orderId")
		if orderID == "" {
			return response.BadRequest(c, "orderId is required")
		}

		// Get the order
		orderService := services.NewOrderService(db)
		order, err := orderService.GetOrderByID(orderID)
		if err != nil {
			return response.NotFound(c, "Order not found")
		}

		// Verify the order belongs to the user
		if order.UserID != userID {
			return response.Forbidden(c, "You do not have access to this order")
		}

		// Check Midtrans status
		paymentService := services.NewPaymentService()
		midtransStatus, err := paymentService.CheckTransactionStatus(order.OrderCode)
		if err != nil {
			// Return local status if Midtrans check fails
			return response.OK(c, fiber.Map{
				"orderId":      order.OrderCode,
				"orderStatus":  order.Status,
				"paymentType":  order.PaymentType,
				"paidAt":       order.PaidAt,
				"source":       "local",
			})
		}

		return response.OK(c, fiber.Map{
			"orderId":          order.OrderCode,
			"orderStatus":     midtransStatus.TransactionStatus,
			"paymentType":     midtransStatus.PaymentType,
			"transactionId":   midtransStatus.TransactionID,
			"grossAmount":     midtransStatus.GrossAmount,
			"transactionTime": midtransStatus.TransactionTime,
			"settlementTime":  midtransStatus.SettlementTime,
			"fraudStatus":     midtransStatus.FraudStatus,
			"source":          "midtrans",
		})
	}
}
