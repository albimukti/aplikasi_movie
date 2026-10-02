package handler

import (
	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/service"
	"github.com/gofiber/fiber/v2"
)

type AdHandler struct {
	adSvc *service.AdService
}

func NewAdHandler(adSvc *service.AdService) *AdHandler {
	return &AdHandler{adSvc: adSvc}
}

type DecisionRequest struct {
	UserOrDeviceID string `json:"user_or_device_id"`
	MovieID        string `json:"movie_id"`
}

func (h *AdHandler) GetDecision(c *fiber.Ctx) error {
	var req DecisionRequest
	_ = c.BodyParser(&req)

	if req.UserOrDeviceID == "" {
		if val := c.Locals("user"); val != nil {
			req.UserOrDeviceID = val.(*domain.User).ID
		} else {
			req.UserOrDeviceID = c.IP()
		}
	}

	res, err := h.adSvc.GetDecision(c.Context(), req.UserOrDeviceID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    res,
	})
}

type EventRequest struct {
	SessionID  string `json:"session_id"`
	CampaignID string `json:"campaign_id"`
	CreativeID string `json:"creative_id"`
	EventType  string `json:"event_type"` // impression, start, completed, skip, click
}

func (h *AdHandler) TrackEvent(c *fiber.Ctx) error {
	var req EventRequest
	if err := c.BodyParser(&req); err != nil || req.SessionID == "" || req.EventType == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "session_id and event_type are required",
		})
	}

	var userID *string
	if val := c.Locals("user"); val != nil {
		uid := val.(*domain.User).ID
		userID = &uid
	}

	_ = h.adSvc.TrackEvent(c.Context(), req.SessionID, req.CampaignID, req.CreativeID, req.EventType, userID)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Ad event recorded",
	})
}

func (h *AdHandler) ListCampaigns(c *fiber.Ctx) error {
	campaigns, err := h.adSvc.ListCampaigns(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    campaigns,
	})
}

type CreateCampaignRequest struct {
	Name             string `json:"name"`
	Priority         int    `json:"priority"`
	FrequencyRule    int    `json:"frequency_rule"`
	Title            string `json:"title"`
	MediaURL         string `json:"media_url"`
	TargetURL        string `json:"target_url"`
	DurationSeconds  int    `json:"duration_seconds"`
	SkipAfterSeconds int    `json:"skip_after_seconds"`
}

func (h *AdHandler) CreateCampaign(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	var req CreateCampaignRequest
	if err := c.BodyParser(&req); err != nil || req.Name == "" || req.MediaURL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Campaign name and media_url are required",
		})
	}

	if req.Priority <= 0 {
		req.Priority = 5
	}
	if req.FrequencyRule <= 0 {
		req.FrequencyRule = 1
	}
	if req.DurationSeconds <= 0 {
		req.DurationSeconds = 15
	}
	if req.SkipAfterSeconds <= 0 {
		req.SkipAfterSeconds = 5
	}

	camp, err := h.adSvc.CreateCampaign(
		c.Context(), actor, req.Name, req.Priority, req.FrequencyRule,
		req.DurationSeconds, req.SkipAfterSeconds, req.Title, req.MediaURL, req.TargetURL,
	)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Campaign iklan berhasil dibuat",
		"data":    camp,
	})
}

type UpdateCampaignStatusRequest struct {
	Status string `json:"status"` // ACTIVE, INACTIVE
}

func (h *AdHandler) UpdateStatus(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	id := c.Params("id")
	var req UpdateCampaignStatusRequest
	if err := c.BodyParser(&req); err != nil || req.Status == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "status is required",
		})
	}

	if err := h.adSvc.UpdateStatus(c.Context(), actor, id, req.Status); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Status campaign berhasil diubah",
	})
}

func (h *AdHandler) DeleteCampaign(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	id := c.Params("id")

	if err := h.adSvc.DeleteCampaign(c.Context(), actor, id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Campaign berhasil dihapus",
	})
}

func (h *AdHandler) GetStats(c *fiber.Ctx) error {
	stats, err := h.adSvc.GetStats(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    stats,
	})
}
