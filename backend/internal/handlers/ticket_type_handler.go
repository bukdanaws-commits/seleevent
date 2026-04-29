package handlers

import (
	"github.com/bukdanaws-commits/seleevent/backend/internal/models"
	"github.com/bukdanaws-commits/seleevent/backend/pkg/response"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// createTicketTypeRequest represents the request body for creating a ticket type.
type createTicketTypeRequest struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
	Price       int     `json:"price"`
	Quota       int     `json:"quota"`
	Tier        *string `json:"tier"`
	Zone        *string `json:"zone"`
	Emoji       *string `json:"emoji"`
	Benefits    *string `json:"benefits"`
}

// updateTicketTypeRequest represents the request body for updating a ticket type.
type updateTicketTypeRequest struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	Price       *int    `json:"price"`
	Quota       *int    `json:"quota"`
	Tier        *string `json:"tier"`
	Zone        *string `json:"zone"`
	Emoji       *string `json:"emoji"`
	Benefits    *string `json:"benefits"`
}

// CreateTicketType handles POST /api/v1/admin/events/:eventId/ticket-types
func CreateTicketType(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, _ := c.Locals("userID").(string)
		eventID := c.Params("eventId")

		if eventID == "" {
			return response.BadRequest(c, "Event ID is required")
		}

		var req createTicketTypeRequest
		if err := c.BodyParser(&req); err != nil {
			return response.BadRequest(c, "Invalid request body")
		}

		// Validate required fields
		if req.Name == "" {
			return response.BadRequest(c, "Name is required")
		}
		if req.Price < 0 {
			return response.BadRequest(c, "Price must be greater than or equal to 0")
		}
		if req.Quota <= 0 {
			return response.BadRequest(c, "Quota must be greater than 0")
		}

		// Validate event exists
		var event models.Event
		if err := db.Where("id = ?", eventID).First(&event).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return response.NotFound(c, "Event not found")
			}
			return response.InternalError(c, "Failed to retrieve event")
		}

		// Auto-set tenant_id from event
		tenantID := event.TenantID

		// ORGANIZER: verify they belong to the same tenant
		userRole, _ := c.Locals("userRole").(string)
		if userRole == "ORGANIZER" {
			var tenantUser models.TenantUser
			if err := db.Where("user_id = ? AND is_active = ?", userID, true).First(&tenantUser).Error; err != nil {
				return response.Forbidden(c, "You are not associated with any tenant")
			}
			if tenantUser.TenantID != tenantID {
				return response.Forbidden(c, "You can only create ticket types for events in your own tenant")
			}
		}

		// Default tier to "floor" if not provided
		tier := "floor"
		if req.Tier != nil && *req.Tier != "" {
			tier = *req.Tier
		}

		ticketType := models.TicketType{
			TenantID:    tenantID,
			EventID:     eventID,
			Name:        req.Name,
			Description: req.Description,
			Price:       req.Price,
			Quota:       req.Quota,
			Sold:        0,
			Tier:        tier,
			Zone:        req.Zone,
			Emoji:       req.Emoji,
			Benefits:    req.Benefits,
		}

		if err := db.Create(&ticketType).Error; err != nil {
			return response.InternalError(c, "Failed to create ticket type")
		}

		return response.Created(c, "Ticket type created successfully", ticketType)
	}
}

// UpdateTicketType handles PUT /api/v1/admin/ticket-types/:id
func UpdateTicketType(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, _ := c.Locals("userID").(string)
		userRole, _ := c.Locals("userRole").(string)
		ticketTypeID := c.Params("id")

		if ticketTypeID == "" {
			return response.BadRequest(c, "Ticket type ID is required")
		}

		var ticketType models.TicketType
		if err := db.Where("id = ?", ticketTypeID).First(&ticketType).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return response.NotFound(c, "Ticket type not found")
			}
			return response.InternalError(c, "Failed to retrieve ticket type")
		}

		// ORGANIZER can only update their own tenant's ticket types
		if userRole == "ORGANIZER" {
			var tenantUser models.TenantUser
			if err := db.Where("user_id = ? AND is_active = ?", userID, true).First(&tenantUser).Error; err != nil {
				return response.Forbidden(c, "You are not associated with any tenant")
			}
			if ticketType.TenantID != tenantUser.TenantID {
				return response.Forbidden(c, "You can only update ticket types in your own tenant")
			}
		}

		var req updateTicketTypeRequest
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
		if req.Description != nil {
			updates["description"] = *req.Description
		}
		if req.Price != nil {
			if *req.Price < 0 {
				return response.BadRequest(c, "Price must be greater than or equal to 0")
			}
			updates["price"] = *req.Price
		}
		if req.Quota != nil {
			if *req.Quota <= 0 {
				return response.BadRequest(c, "Quota must be greater than 0")
			}
			updates["quota"] = *req.Quota
		}
		if req.Tier != nil {
			updates["tier"] = *req.Tier
		}
		if req.Zone != nil {
			updates["zone"] = *req.Zone
		}
		if req.Emoji != nil {
			updates["emoji"] = *req.Emoji
		}
		if req.Benefits != nil {
			updates["benefits"] = *req.Benefits
		}

		if len(updates) == 0 {
			return response.BadRequest(c, "No fields to update")
		}

		if err := db.Model(&ticketType).Updates(updates).Error; err != nil {
			return response.InternalError(c, "Failed to update ticket type")
		}

		// Reload to get updated data
		db.Where("id = ?", ticketTypeID).First(&ticketType)

		return response.OK(c, ticketType)
	}
}

// DeleteTicketType handles DELETE /api/v1/admin/ticket-types/:id
// SUPER_ADMIN only — soft delete (sets deleted_at).
func DeleteTicketType(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole, _ := c.Locals("userRole").(string)
		ticketTypeID := c.Params("id")

		if ticketTypeID == "" {
			return response.BadRequest(c, "Ticket type ID is required")
		}

		// SUPER_ADMIN only
		if userRole != "SUPER_ADMIN" {
			return response.Forbidden(c, "Only SUPER_ADMIN can delete ticket types")
		}

		var ticketType models.TicketType
		if err := db.Where("id = ?", ticketTypeID).First(&ticketType).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return response.NotFound(c, "Ticket type not found")
			}
			return response.InternalError(c, "Failed to retrieve ticket type")
		}

		if err := db.Delete(&ticketType).Error; err != nil {
			return response.InternalError(c, "Failed to delete ticket type")
		}

		return response.Success(c, "Ticket type deleted successfully", nil)
	}
}
