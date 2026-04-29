package handlers

import (
	"fmt"
	"time"

	"github.com/bukdanaws-commits/seleevent/backend/internal/models"
	"github.com/bukdanaws-commits/seleevent/backend/pkg/response"
	"github.com/bukdanaws-commits/seleevent/backend/pkg/utils"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// createEventRequest represents the request body for creating an event.
type createEventRequest struct {
	Title     string  `json:"title"`
	Subtitle  *string `json:"subtitle"`
	Date      string  `json:"date"`
	DoorsOpen *string `json:"doorsOpen"`
	Venue     string  `json:"venue"`
	City      string  `json:"city"`
	Address   *string `json:"address"`
	Capacity  int     `json:"capacity"`
	Slug      *string `json:"slug"`
}

// updateEventRequest represents the request body for updating an event.
type updateEventRequest struct {
	Title     *string `json:"title"`
	Subtitle  *string `json:"subtitle"`
	Date      *string `json:"date"`
	DoorsOpen *string `json:"doorsOpen"`
	Venue     *string `json:"venue"`
	City      *string `json:"city"`
	Address   *string `json:"address"`
	Capacity  *int    `json:"capacity"`
	Status    *string `json:"status"`
}

// CreateEvent handles POST /api/v1/admin/events
func CreateEvent(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, _ := c.Locals("userID").(string)

		var req createEventRequest
		if err := c.BodyParser(&req); err != nil {
			return response.BadRequest(c, "Invalid request body")
		}

		// Validate required fields
		if req.Title == "" {
			return response.BadRequest(c, "Title is required")
		}
		if req.Date == "" {
			return response.BadRequest(c, "Date is required")
		}
		if req.Venue == "" {
			return response.BadRequest(c, "Venue is required")
		}
		if req.City == "" {
			return response.BadRequest(c, "City is required")
		}
		if req.Capacity <= 0 {
			return response.BadRequest(c, "Capacity must be greater than 0")
		}

		// Parse date
		eventDate, err := time.Parse(time.RFC3339, req.Date)
		if err != nil {
			return response.BadRequest(c, "Invalid date format, use RFC3339 (e.g. 2025-01-15T19:00:00Z)")
		}

		// Parse doorsOpen (optional)
		var doorsOpen *time.Time
		if req.DoorsOpen != nil && *req.DoorsOpen != "" {
			parsed, err := time.Parse(time.RFC3339, *req.DoorsOpen)
			if err != nil {
				return response.BadRequest(c, "Invalid doorsOpen format, use RFC3339")
			}
			doorsOpen = &parsed
		}

		// Auto-set tenant_id from the user's tenant
		var tenantUser models.TenantUser
		if err := db.Where("user_id = ? AND is_active = ?", userID, true).First(&tenantUser).Error; err != nil {
			return response.BadRequest(c, "User is not associated with any tenant")
		}

		// Auto-generate slug from title if empty
		slug := ""
		if req.Slug != nil && *req.Slug != "" {
			slug = utils.SanitizeSlug(*req.Slug)
		} else {
			slug = utils.SanitizeSlug(req.Title)
		}

		// Ensure slug uniqueness by appending a short suffix if needed
		var existingCount int64
		db.Model(&models.Event{}).Where("slug LIKE ?", slug+"%").Count(&existingCount)
		if existingCount > 0 {
			slug = fmt.Sprintf("%s-%d", slug, existingCount+1)
		}

		event := models.Event{
			TenantID:  tenantUser.TenantID,
			Slug:      slug,
			Title:     req.Title,
			Subtitle:  req.Subtitle,
			Date:      eventDate,
			DoorsOpen: doorsOpen,
			Venue:     req.Venue,
			City:      req.City,
			Address:   req.Address,
			Capacity:  req.Capacity,
			Status:    "draft",
		}

		if err := db.Create(&event).Error; err != nil {
			return response.InternalError(c, "Failed to create event")
		}

		return response.Created(c, "Event created successfully", event)
	}
}

// GetEventDetail handles GET /api/v1/admin/events/:id
func GetEventDetail(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		eventID := c.Params("id")
		if eventID == "" {
			return response.BadRequest(c, "Event ID is required")
		}

		var event models.Event
		if err := db.Preload("TicketTypes").Where("id = ?", eventID).First(&event).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return response.NotFound(c, "Event not found")
			}
			return response.InternalError(c, "Failed to retrieve event")
		}

		return response.OK(c, event)
	}
}

// UpdateEvent handles PUT /api/v1/admin/events/:id
func UpdateEvent(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, _ := c.Locals("userID").(string)
		userRole, _ := c.Locals("userRole").(string)
		eventID := c.Params("id")

		if eventID == "" {
			return response.BadRequest(c, "Event ID is required")
		}

		var event models.Event
		if err := db.Where("id = ?", eventID).First(&event).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return response.NotFound(c, "Event not found")
			}
			return response.InternalError(c, "Failed to retrieve event")
		}

		// ORGANIZER can only update their own tenant's events
		if userRole == "ORGANIZER" {
			var tenantUser models.TenantUser
			if err := db.Where("user_id = ? AND is_active = ?", userID, true).First(&tenantUser).Error; err != nil {
				return response.Forbidden(c, "You are not associated with any tenant")
			}
			if event.TenantID != tenantUser.TenantID {
				return response.Forbidden(c, "You can only update events in your own tenant")
			}
		}

		var req updateEventRequest
		if err := c.BodyParser(&req); err != nil {
			return response.BadRequest(c, "Invalid request body")
		}

		updates := fiber.Map{}

		if req.Title != nil {
			if *req.Title == "" {
				return response.BadRequest(c, "Title cannot be empty")
			}
			updates["title"] = *req.Title
		}
		if req.Subtitle != nil {
			updates["subtitle"] = *req.Subtitle
		}
		if req.Date != nil {
			parsed, err := time.Parse(time.RFC3339, *req.Date)
			if err != nil {
				return response.BadRequest(c, "Invalid date format, use RFC3339")
			}
			updates["date"] = parsed
		}
		if req.DoorsOpen != nil {
			if *req.DoorsOpen == "" {
				updates["doors_open"] = nil
			} else {
				parsed, err := time.Parse(time.RFC3339, *req.DoorsOpen)
				if err != nil {
					return response.BadRequest(c, "Invalid doorsOpen format, use RFC3339")
				}
				updates["doors_open"] = parsed
			}
		}
		if req.Venue != nil {
			if *req.Venue == "" {
				return response.BadRequest(c, "Venue cannot be empty")
			}
			updates["venue"] = *req.Venue
		}
		if req.City != nil {
			if *req.City == "" {
				return response.BadRequest(c, "City cannot be empty")
			}
			updates["city"] = *req.City
		}
		if req.Address != nil {
			updates["address"] = *req.Address
		}
		if req.Capacity != nil {
			if *req.Capacity <= 0 {
				return response.BadRequest(c, "Capacity must be greater than 0")
			}
			updates["capacity"] = *req.Capacity
		}
		if req.Status != nil {
			// Validate status transitions
			validTransitions := map[string][]string{
				"draft":     {"published", "cancelled"},
				"published": {"ongoing", "cancelled"},
				"ongoing":   {"completed", "cancelled"},
				"cancelled": {},
				"completed": {},
			}
			allowed, ok := validTransitions[event.Status]
			if !ok {
				return response.BadRequest(c, fmt.Sprintf("Current status '%s' is invalid", event.Status))
			}

			isAllowed := false
			for _, s := range allowed {
				if s == *req.Status {
					isAllowed = true
					break
				}
			}
			if !isAllowed {
				return response.BadRequest(c, fmt.Sprintf("Cannot transition event status from '%s' to '%s'", event.Status, *req.Status))
			}
			updates["status"] = *req.Status
		}

		if len(updates) == 0 {
			return response.BadRequest(c, "No fields to update")
		}

		if err := db.Model(&event).Updates(updates).Error; err != nil {
			return response.InternalError(c, "Failed to update event")
		}

		// Reload the event to get updated data
		db.Preload("TicketTypes").Where("id = ?", eventID).First(&event)

		return response.OK(c, event)
	}
}

// DeleteEvent handles DELETE /api/v1/admin/events/:id
// SUPER_ADMIN only — soft delete (sets deleted_at).
func DeleteEvent(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole, _ := c.Locals("userRole").(string)
		eventID := c.Params("id")

		if eventID == "" {
			return response.BadRequest(c, "Event ID is required")
		}

		// SUPER_ADMIN only
		if userRole != "SUPER_ADMIN" {
			return response.Forbidden(c, "Only SUPER_ADMIN can delete events")
		}

		var event models.Event
		if err := db.Where("id = ?", eventID).First(&event).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return response.NotFound(c, "Event not found")
			}
			return response.InternalError(c, "Failed to retrieve event")
		}

		if err := db.Delete(&event).Error; err != nil {
			return response.InternalError(c, "Failed to delete event")
		}

		return response.Success(c, "Event deleted successfully", nil)
	}
}
