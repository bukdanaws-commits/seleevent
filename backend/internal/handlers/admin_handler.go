package handlers

import (
	"github.com/bukdanaws-commits/seleevent/backend/internal/models"
	"github.com/bukdanaws-commits/seleevent/backend/pkg/response"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// GetAdminDashboard handles GET /api/v1/admin/dashboard
func GetAdminDashboard(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Aggregate admin dashboard KPIs
		var totalUsers, totalOrders, paidOrders, pendingOrders, totalTickets int64
		var totalRevenue int64

		db.Model(&models.User{}).Count(&totalUsers)
		db.Model(&models.Order{}).Count(&totalOrders)
		db.Model(&models.Order{}).Where("status = ?", "paid").Count(&paidOrders)
		db.Model(&models.Order{}).Where("status = ?", "pending").Count(&pendingOrders)
		db.Model(&models.Ticket{}).Count(&totalTickets)
		db.Model(&models.Order{}).Where("status = ?", "paid").
			Select("COALESCE(SUM(total_amount), 0)").Scan(&totalRevenue)

		return response.OK(c, fiber.Map{
			"totalUsers":    totalUsers,
			"totalOrders":   totalOrders,
			"paidOrders":    paidOrders,
			"pendingOrders": pendingOrders,
			"totalTickets":  totalTickets,
			"totalRevenue":  totalRevenue,
		})
	}
}

// GetAdminOrders handles GET /api/v1/admin/orders
func GetAdminOrders(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		page := c.QueryInt("page", 1)
		perPage := c.QueryInt("perPage", 20)
		status := c.Query("status")

		if page < 1 {
			page = 1
		}
		if perPage < 1 || perPage > 100 {
			perPage = 20
		}
		offset := (page - 1) * perPage

		var orders []models.Order
		var total int64

		query := db.Model(&models.Order{})
		if status != "" {
			query = query.Where("status = ?", status)
		}

		query.Count(&total)
		err := query.
			Preload("User").
			Preload("Event").
			Preload("Items").
			Order("created_at DESC").
			Limit(perPage).
			Offset(offset).
			Find(&orders).Error

		if err != nil {
			return response.InternalError(c, "Failed to retrieve orders")
		}

		return response.Paginated(c, orders, total, page, perPage)
	}
}

// GetAdminUsers handles GET /api/v1/admin/users
func GetAdminUsers(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		page := c.QueryInt("page", 1)
		perPage := c.QueryInt("perPage", 20)
		role := c.Query("role")

		if page < 1 {
			page = 1
		}
		if perPage < 1 || perPage > 100 {
			perPage = 20
		}
		offset := (page - 1) * perPage

		var users []models.User
		var total int64

		query := db.Model(&models.User{})
		if role != "" {
			query = query.Where("role = ?", role)
		}

		query.Count(&total)
		err := query.
			Order("created_at DESC").
			Limit(perPage).
			Offset(offset).
			Find(&users).Error

		if err != nil {
			return response.InternalError(c, "Failed to retrieve users")
		}

		return response.Paginated(c, users, total, page, perPage)
	}
}

// GetAdminEvents handles GET /api/v1/admin/events
func GetAdminEvents(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var events []models.Event
		if err := db.Preload("TicketTypes").
			Order("created_at DESC").
			Find(&events).Error; err != nil {
			return response.InternalError(c, "Failed to retrieve events")
		}

		return response.OK(c, events)
	}
}

// GetAdminAnalytics handles GET /api/v1/admin/analytics
func GetAdminAnalytics(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		eventID := c.Query("eventId")

		var totalOrders int64
		var paidOrders int64
		var totalRevenue int64
		var totalTickets int64

		query := db.Model(&models.Order{})
		if eventID != "" {
			query = query.Where("event_id = ?", eventID)
		}

		query.Count(&totalOrders)

		paidQuery := db.Model(&models.Order{}).Where("status = ?", "paid")
		if eventID != "" {
			paidQuery = paidQuery.Where("event_id = ?", eventID)
		}
		paidQuery.Count(&paidOrders)

		revenueQuery := db.Model(&models.Order{}).Where("status = ?", "paid")
		if eventID != "" {
			revenueQuery = revenueQuery.Where("event_id = ?", eventID)
		}
		revenueQuery.Select("COALESCE(SUM(total_amount), 0)").Scan(&totalRevenue)

		ticketQuery := db.Model(&models.Ticket{})
		if eventID != "" {
			ticketQuery = ticketQuery.Joins("JOIN orders ON orders.id = tickets.order_id").Where("orders.event_id = ?", eventID)
		}
		ticketQuery.Count(&totalTickets)

		// Ticket status breakdown
		type statusCount struct {
			Status string
			Count  int64
		}
		var statusBreakdown []statusCount

		sbQuery := db.Model(&models.Ticket{}).Select("status, COUNT(*) as count").Group("status")
		if eventID != "" {
			sbQuery = sbQuery.Joins("JOIN orders ON orders.id = tickets.order_id").Where("orders.event_id = ?", eventID)
		}
		sbQuery.Scan(&statusBreakdown)

		breakdownMap := make(map[string]int64)
		for _, sb := range statusBreakdown {
			breakdownMap[sb.Status] = sb.Count
		}

		return response.OK(c, fiber.Map{
			"totalOrders":    totalOrders,
			"paidOrders":     paidOrders,
			"totalRevenue":   totalRevenue,
			"totalTickets":   totalTickets,
			"statusBreakdown": breakdownMap,
		})
	}
}
