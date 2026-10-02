package handler

import (
	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/service"
	"github.com/gofiber/fiber/v2"
)

type SubtitleHandler struct {
	subSvc *service.SubtitleService
}

func NewSubtitleHandler(subSvc *service.SubtitleService) *SubtitleHandler {
	return &SubtitleHandler{subSvc: subSvc}
}

func (h *SubtitleHandler) ListForMovie(c *fiber.Ctx) error {
	movieID := c.Params("id")
	onlyActive := c.Query("active", "true") == "true"

	subs, err := h.subSvc.ListForMovie(c.Context(), movieID, onlyActive)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    subs,
	})
}

type CreateSubtitleRequest struct {
	LanguageCode string `json:"language_code"`
	Label        string `json:"label"`
	FileURL      string `json:"file_url"`
	IsDefault    bool   `json:"is_default"`
}

func (h *SubtitleHandler) Create(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	movieID := c.Params("id")

	var req CreateSubtitleRequest
	if err := c.BodyParser(&req); err != nil || req.LanguageCode == "" || req.FileURL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "language_code, label, and file_url are required",
		})
	}

	sub, err := h.subSvc.Create(c.Context(), actor, movieID, req.LanguageCode, req.Label, req.FileURL, req.IsDefault)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Subtitle berhasil ditambahkan",
		"data":    sub,
	})
}

type UpdateSubtitleRequest struct {
	Label     string `json:"label"`
	Status    string `json:"status"`
	IsDefault bool   `json:"is_default"`
}

func (h *SubtitleHandler) Update(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	id := c.Params("id")

	var req UpdateSubtitleRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid JSON payload",
		})
	}

	if err := h.subSvc.Update(c.Context(), actor, id, req.Label, req.Status, req.IsDefault); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Subtitle berhasil diperbarui",
	})
}

func (h *SubtitleHandler) Delete(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	id := c.Params("id")

	if err := h.subSvc.Delete(c.Context(), actor, id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Subtitle berhasil dihapus",
	})
}
