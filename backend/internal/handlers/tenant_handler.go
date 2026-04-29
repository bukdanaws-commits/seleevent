package handlers

import (
	"github.com/bukdanaws-commits/seleevent/backend/internal/models"
	"github.com/bukdanaws-commits/seleevent/backend/pkg/response"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// updateTenantRequest represents the request body for updating a tenant.
type updateTenantRequest struct {
	Name           *string  `json:"name"`
	FeePercentage  *float64 `json:"feePercentage"`
	PrimaryColor   *string  `json:"primaryColor"`
	SecondaryColor *string  `json:"secondaryColor"`
	MaxEvents      *int     `json:"maxEvents"`
	MaxTickets     *int     `json:"maxTickets"`
	Plan           *string  `json:"plan"`
	IsActive       *bool    `json:"isActive"`
}

// UpdateTenant handles PUT /api/v1/admin/tenants/:id
// SUPER_ADMIN only.
func UpdateTenant(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole, _ := c.Locals("userRole").(string)
		tenantID := c.Params("id")

		if tenantID == "" {
			return response.BadRequest(c, "Tenant ID is required")
		}

		// SUPER_ADMIN only
		if userRole != "SUPER_ADMIN" {
			return response.Forbidden(c, "Only SUPER_ADMIN can update tenants")
		}

		var tenant models.Tenant
		if err := db.Where("id = ?", tenantID).First(&tenant).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return response.NotFound(c, "Tenant not found")
			}
			return response.InternalError(c, "Failed to retrieve tenant")
		}

		var req updateTenantRequest
		if err := c.BodyParser(&req); err != nil {
			return response.BadRequest(c, "Invalid request body")
		}

		updates := fiber.Map{}

		if req.Name != nil {
			if *req.Name == "" {
				return response.BadRequest(c, "Name cannot be empty")
			}
			updates["name"] = *req.Name
		}
		if req.FeePercentage != nil {
			if *req.FeePercentage < 1.00 || *req.FeePercentage > 10.00 {
				return response.BadRequest(c, "Fee percentage must be between 1.00 and 10.00")
			}
			updates["fee_percentage"] = *req.FeePercentage
		}
		if req.PrimaryColor != nil {
			updates["primary_color"] = *req.PrimaryColor
		}
		if req.SecondaryColor != nil {
			updates["secondary_color"] = *req.SecondaryColor
		}
		if req.MaxEvents != nil {
			updates["max_events"] = *req.MaxEvents
		}
		if req.MaxTickets != nil {
			updates["max_tickets"] = *req.MaxTickets
		}
		if req.Plan != nil {
			updates["plan"] = *req.Plan
		}
		if req.IsActive != nil {
			updates["is_active"] = *req.IsActive
		}

		if len(updates) == 0 {
			return response.BadRequest(c, "No fields to update")
		}

		if err := db.Model(&tenant).Updates(updates).Error; err != nil {
			return response.InternalError(c, "Failed to update tenant")
		}

		// Reload to get updated data
		db.Preload("Subscriptions").Where("id = ?", tenantID).First(&tenant)

		return response.OK(c, tenant)
	}
}

// GetTenants handles GET /api/v1/admin/tenants
// SUPER_ADMIN only — list all tenants with subscription info.
func GetTenants(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole, _ := c.Locals("userRole").(string)

		// SUPER_ADMIN only
		if userRole != "SUPER_ADMIN" {
			return response.Forbidden(c, "Only SUPER_ADMIN can list tenants")
		}

		var tenants []models.Tenant
		if err := db.Preload("Subscriptions").Order("created_at DESC").Find(&tenants).Error; err != nil {
			return response.InternalError(c, "Failed to retrieve tenants")
		}

		return response.OK(c, tenants)
	}
}

// GetTenantDetail handles GET /api/v1/admin/tenants/:id
// SUPER_ADMIN only — get tenant with subscription + event count + revenue summary.
func GetTenantDetail(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole, _ := c.Locals("userRole").(string)
		tenantID := c.Params("id")

		if tenantID == "" {
			return response.BadRequest(c, "Tenant ID is required")
		}

		// SUPER_ADMIN only
		if userRole != "SUPER_ADMIN" {
			return response.Forbidden(c, "Only SUPER_ADMIN can view tenant details")
		}

		var tenant models.Tenant
		if err := db.Preload("Subscriptions").Where("id = ?", tenantID).First(&tenant).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return response.NotFound(c, "Tenant not found")
			}
			return response.InternalError(c, "Failed to retrieve tenant")
		}

		// Event count
		var eventCount int64
		db.Model(&models.Event{}).Where("tenant_id = ?", tenantID).Count(&eventCount)

		// Revenue summary: sum of paid orders for this tenant's events
		var totalRevenue int64
		var totalPlatformFee int64
		db.Model(&models.Order{}).
			Joins("JOIN events ON events.id = orders.event_id").
			Where("events.tenant_id = ? AND orders.status = ?", tenantID, "paid").
			Select("COALESCE(SUM(orders.total_amount), 0)").
			Scan(&totalRevenue)
		db.Model(&models.Order{}).
			Joins("JOIN events ON events.id = orders.event_id").
			Where("events.tenant_id = ? AND orders.status = ?", tenantID, "paid").
			Select("COALESCE(SUM(orders.platform_fee), 0)").
			Scan(&totalPlatformFee)

		return response.OK(c, fiber.Map{
			"tenant":    tenant,
			"eventCount": eventCount,
			"revenue": fiber.Map{
				"grossRevenue":     totalRevenue,
				"platformFee":      totalPlatformFee,
				"netRevenue":       totalRevenue - totalPlatformFee,
			},
		})
	}
}
