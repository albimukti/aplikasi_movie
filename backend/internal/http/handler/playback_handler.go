package handler

import (
	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/service"
	"github.com/gofiber/fiber/v2"
)

type PlaybackHandler struct {
	playbackSvc *service.PlaybackService
}

func NewPlaybackHandler(playbackSvc *service.PlaybackService) *PlaybackHandler {
	return &PlaybackHandler{playbackSvc: playbackSvc}
}

type PlaybackSessionRequest struct {
	MovieID string `json:"movie_id"`
}

func (h *PlaybackHandler) CreateSession(c *fiber.Ctx) error {
	var req PlaybackSessionRequest
	if err := c.BodyParser(&req); err != nil || req.MovieID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "movie_id wajib disertakan",
		})
	}

	var userID string
	if val := c.Locals("user"); val != nil {
		userID = val.(*domain.User).ID
	}

	session, err := h.playbackSvc.CreatePlaybackSession(c.Context(), userID, req.MovieID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    session,
	})
}

type UpdateProgressRequest struct {
	MovieID             string `json:"movie_id"`
	LastPositionSeconds int    `json:"last_position_seconds"`
	DurationSeconds     int    `json:"duration_seconds"`
	Completed           bool   `json:"completed"`
}

func (h *PlaybackHandler) UpdateProgress(c *fiber.Ctx) error {
	user := c.Locals("user").(*domain.User)
	var req UpdateProgressRequest
	if err := c.BodyParser(&req); err != nil || req.MovieID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "movie_id is required",
		})
	}

	_ = h.playbackSvc.UpdateProgress(c.Context(), user.ID, req.MovieID, req.LastPositionSeconds, req.DurationSeconds, req.Completed)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Progress recorded",
	})
}

func (h *PlaybackHandler) GetContinueWatching(c *fiber.Ctx) error {
	user := c.Locals("user").(*domain.User)
	list, err := h.playbackSvc.GetContinueWatching(c.Context(), user.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    list,
	})
}
