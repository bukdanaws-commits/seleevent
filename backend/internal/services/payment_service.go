package services

import (
        "bytes"
        "crypto/sha256"
        "encoding/base64"
        "encoding/hex"
        "encoding/json"
        "fmt"
        "io"
        "net/http"
        "os"
)

// ─── Midtrans API Types ─────────────────────────────────────────────────────

// PaymentService handles Midtrans payment gateway integration.
type PaymentService struct {
        ServerKey  string
        ClientKey  string
        MerchantID string
        IsSandbox  bool
        BaseURL    string
}

// ItemDetail represents a line item sent to Midtrans.
type ItemDetail struct {
        ID       string `json:"id"`
        Price    int64  `json:"price"`
        Quantity int    `json:"quantity"`
        Name     string `json:"name"`
}

// CreateTransactionResponse is the Midtrans response for a charge request.
type CreateTransactionResponse struct {
        TransactionID string `json:"transaction_id"`
        OrderID       string `json:"order_id"`
        GrossAmount   string `json:"gross_amount"`
        PaymentType   string `json:"payment_type"`
        TransactionStatus string `json:"transaction_status"`
        // QRIS specific
        QRString string `json:"qr_string"`   // For QRIS
        // Bank Transfer specific
        VANumbers []VANumber `json:"va_numbers"` // For bank_transfer
        // GoPay / QRIS specific
        Actions []MidtransAction `json:"actions"` // For gopay actions and QRIS actions
        // Redirect URL
        RedirectURL string `json:"redirect_url"`
}

// VANumber holds the virtual account details from Midtrans.
type VANumber struct {
        Bank     string `json:"bank"`
        VANumber string `json:"va_number"`
}

// MidtransAction represents an action URL from Midtrans (deeplink, QR, etc).
type MidtransAction struct {
        Name string `json:"name"`
        URL  string `json:"url"`
        Method string `json:"method"`
}

// TransactionStatusResponse is the Midtrans response for a status check.
type TransactionStatusResponse struct {
        TransactionID     string `json:"transaction_id"`
        OrderID           string `json:"order_id"`
        GrossAmount       string `json:"gross_amount"`
        PaymentType       string `json:"payment_type"`
        TransactionStatus string `json:"transaction_status"`
        TransactionTime   string `json:"transaction_time"`
        SettlementTime    string `json:"settlement_time,omitempty"`
        StatusMessage     string `json:"status_message"`
        VANumbers         []VANumber `json:"va_numbers,omitempty"`
        FraudStatus       string `json:"fraud_status,omitempty"`
}

// NotificationResponse is the parsed Midtrans webhook notification.
type NotificationResponse struct {
        TransactionID     string `json:"transaction_id"`
        OrderID           string `json:"order_id"`
        GrossAmount       string `json:"gross_amount"`
        PaymentType       string `json:"payment_type"`
        TransactionStatus string `json:"transaction_status"`
        TransactionTime   string `json:"transaction_time"`
        SettlementTime    string `json:"settlement_time,omitempty"`
        FraudStatus       string `json:"fraud_status,omitempty"`
        StatusMessage     string `json:"status_message"`
        StatusCode        string `json:"status_code"`
        SignatureKey      string `json:"signature_key"`
        VANumbers         []VANumber `json:"va_numbers,omitempty"`
}

// NewPaymentService creates a new PaymentService reading config from env vars.
func NewPaymentService() *PaymentService {
        isSandbox := os.Getenv("MIDTRANS_IS_SANDBOX") == "true"
        baseURL := "https://api.midtrans.com"
        if isSandbox {
                baseURL = "https://api.sandbox.midtrans.com"
        }
        return &PaymentService{
                ServerKey:  os.Getenv("MIDTRANS_SERVER_KEY"),
                ClientKey:  os.Getenv("MIDTRANS_CLIENT_KEY"),
                MerchantID: os.Getenv("MIDTRANS_MERCHANT_ID"),
                IsSandbox:  isSandbox,
                BaseURL:    baseURL,
        }
}

// authHeader returns the Basic Auth header value for Midtrans API calls.
// Midtrans expects Base64(serverKey:) as the password.
func (s *PaymentService) authHeader() string {
        encoded := base64.StdEncoding.EncodeToString([]byte(s.ServerKey + ":"))
        return "Basic " + encoded
}

// makeRequest is a helper to make HTTP requests to the Midtrans API.
func (s *PaymentService) makeRequest(method, path string, body interface{}) ([]byte, int, error) {
        var reqBody io.Reader
        if body != nil {
                jsonData, err := json.Marshal(body)
                if err != nil {
                        return nil, 0, fmt.Errorf("failed to marshal request body: %w", err)
                }
                reqBody = bytes.NewBuffer(jsonData)
        }

        req, err := http.NewRequest(method, s.BaseURL+path, reqBody)
        if err != nil {
                return nil, 0, fmt.Errorf("failed to create request: %w", err)
        }

        req.Header.Set("Content-Type", "application/json")
        req.Header.Set("Accept", "application/json")
        req.Header.Set("Authorization", s.authHeader())

        client := &http.Client{}
        resp, err := client.Do(req)
        if err != nil {
                return nil, 0, fmt.Errorf("failed to send request: %w", err)
        }
        defer resp.Body.Close()

        respBody, err := io.ReadAll(resp.Body)
        if err != nil {
                return nil, resp.StatusCode, fmt.Errorf("failed to read response: %w", err)
        }

        return respBody, resp.StatusCode, nil
}

// CreateTransaction creates a new payment transaction via Midtrans.
// It supports qris, bank_transfer, and gopay payment types.
func (s *PaymentService) CreateTransaction(orderID string, grossAmount int64, customerName string, customerEmail string, items []ItemDetail) (*CreateTransactionResponse, error) {
        payload := map[string]interface{}{
                "payment_type": "", // will be set by specific payment type below; not used at top level
                "transaction_details": map[string]interface{}{
                        "order_id":     orderID,
                        "gross_amount": grossAmount,
                },
                "customer_details": map[string]interface{}{
                        "first_name": customerName,
                        "email":      customerEmail,
                },
                "item_details": items,
        }

        // Default: we don't set payment_type at top level for charge endpoint.
        // The charge endpoint requires payment_type to determine the flow.
        // For the generic charge endpoint, payment_type must be specified.
        // We'll handle this in the handler by calling specific methods.

        respBody, statusCode, err := s.makeRequest("POST", "/v2/charge", payload)
        if err != nil {
                return nil, fmt.Errorf("midtrans charge request failed: %w", err)
        }

        if statusCode != 200 && statusCode != 201 && statusCode != 202 {
                return nil, fmt.Errorf("midtrans charge failed (status %d): %s", statusCode, string(respBody))
        }

        var result CreateTransactionResponse
        if err := json.Unmarshal(respBody, &result); err != nil {
                return nil, fmt.Errorf("failed to parse midtrans response: %w", err)
        }

        return &result, nil
}

// CreateQRISTransaction creates a QRIS payment transaction.
func (s *PaymentService) CreateQRISTransaction(orderID string, grossAmount int64, customerName string, customerEmail string, items []ItemDetail) (*CreateTransactionResponse, error) {
        payload := map[string]interface{}{
                "payment_type": "qris",
                "transaction_details": map[string]interface{}{
                        "order_id":     orderID,
                        "gross_amount": grossAmount,
                },
                "customer_details": map[string]interface{}{
                        "first_name": customerName,
                        "email":      customerEmail,
                },
                "item_details": items,
        }

        respBody, statusCode, err := s.makeRequest("POST", "/v2/charge", payload)
        if err != nil {
                return nil, fmt.Errorf("midtrans qris charge request failed: %w", err)
        }

        if statusCode != 200 && statusCode != 201 && statusCode != 202 {
                return nil, fmt.Errorf("midtrans qris charge failed (status %d): %s", statusCode, string(respBody))
        }

        var result CreateTransactionResponse
        if err := json.Unmarshal(respBody, &result); err != nil {
                return nil, fmt.Errorf("failed to parse midtrans qris response: %w", err)
        }

        return &result, nil
}

// CreateBankTransferTransaction creates a bank transfer (VA) payment transaction.
func (s *PaymentService) CreateBankTransferTransaction(orderID string, grossAmount int64, customerName string, customerEmail string, items []ItemDetail, bank string) (*CreateTransactionResponse, error) {
        if bank == "" {
                bank = "bca" // default to BCA
        }
        payload := map[string]interface{}{
                "payment_type": "bank_transfer",
                "transaction_details": map[string]interface{}{
                        "order_id":     orderID,
                        "gross_amount": grossAmount,
                },
                "customer_details": map[string]interface{}{
                        "first_name": customerName,
                        "email":      customerEmail,
                },
                "item_details": items,
                "bank_transfer": map[string]interface{}{
                        "bank": bank,
                },
        }

        respBody, statusCode, err := s.makeRequest("POST", "/v2/charge", payload)
        if err != nil {
                return nil, fmt.Errorf("midtrans bank_transfer charge request failed: %w", err)
        }

        if statusCode != 200 && statusCode != 201 && statusCode != 202 {
                return nil, fmt.Errorf("midtrans bank_transfer charge failed (status %d): %s", statusCode, string(respBody))
        }

        var result CreateTransactionResponse
        if err := json.Unmarshal(respBody, &result); err != nil {
                return nil, fmt.Errorf("failed to parse midtrans bank_transfer response: %w", err)
        }

        return &result, nil
}

// CreateGoPayTransaction creates a GoPay e-wallet payment transaction.
func (s *PaymentService) CreateGoPayTransaction(orderID string, grossAmount int64, customerName string, customerEmail string, items []ItemDetail) (*CreateTransactionResponse, error) {
        payload := map[string]interface{}{
                "payment_type": "gopay",
                "transaction_details": map[string]interface{}{
                        "order_id":     orderID,
                        "gross_amount": grossAmount,
                },
                "customer_details": map[string]interface{}{
                        "first_name": customerName,
                        "email":      customerEmail,
                },
                "item_details": items,
        }

        respBody, statusCode, err := s.makeRequest("POST", "/v2/charge", payload)
        if err != nil {
                return nil, fmt.Errorf("midtrans gopay charge request failed: %w", err)
        }

        if statusCode != 200 && statusCode != 201 && statusCode != 202 {
                return nil, fmt.Errorf("midtrans gopay charge failed (status %d): %s", statusCode, string(respBody))
        }

        var result CreateTransactionResponse
        if err := json.Unmarshal(respBody, &result); err != nil {
                return nil, fmt.Errorf("failed to parse midtrans gopay response: %w", err)
        }

        return &result, nil
}

// CheckTransactionStatus checks the current status of a transaction.
func (s *PaymentService) CheckTransactionStatus(orderID string) (*TransactionStatusResponse, error) {
        path := fmt.Sprintf("/v2/%s/status", orderID)
        respBody, statusCode, err := s.makeRequest("GET", path, nil)
        if err != nil {
                return nil, fmt.Errorf("midtrans status check request failed: %w", err)
        }

        if statusCode != 200 {
                return nil, fmt.Errorf("midtrans status check failed (status %d): %s", statusCode, string(respBody))
        }

        var result TransactionStatusResponse
        if err := json.Unmarshal(respBody, &result); err != nil {
                return nil, fmt.Errorf("failed to parse midtrans status response: %w", err)
        }

        return &result, nil
}

// HandleNotification parses and validates a Midtrans webhook notification payload.
func (s *PaymentService) HandleNotification(payload []byte) (*NotificationResponse, error) {
        var notif NotificationResponse
        if err := json.Unmarshal(payload, &notif); err != nil {
                return nil, fmt.Errorf("failed to parse notification payload: %w", err)
        }

        // Verify signature key: SHA256(orderId + statusCode + grossAmount + serverKey)
        if !s.VerifySignature(notif.OrderID, notif.StatusCode, notif.GrossAmount, notif.SignatureKey) {
                return nil, fmt.Errorf("invalid signature key — possible fraud")
        }

        return &notif, nil
}

// VerifySignature verifies the Midtrans signature key.
// Signature = SHA256(orderId + statusCode + grossAmount + serverKey)
func (s *PaymentService) VerifySignature(orderID, statusCode, grossAmount, signatureKey string) bool {
        input := orderID + statusCode + grossAmount + s.ServerKey
        hash := sha256.Sum256([]byte(input))
        expectedSig := hex.EncodeToString(hash[:])
        return expectedSig == signatureKey
}

// CancelTransaction cancels a transaction via Midtrans.
func (s *PaymentService) CancelTransaction(orderID string) error {
        path := fmt.Sprintf("/v2/%s/cancel", orderID)
        respBody, statusCode, err := s.makeRequest("POST", path, nil)
        if err != nil {
                return fmt.Errorf("midtrans cancel request failed: %w", err)
        }

        if statusCode != 200 && statusCode != 201 && statusCode != 412 {
                // 412 means already settled/captured, which is acceptable
                return fmt.Errorf("midtrans cancel failed (status %d): %s", statusCode, string(respBody))
        }

        return nil
}
