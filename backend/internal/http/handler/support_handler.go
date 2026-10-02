package handler

import (
	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/service"
	"github.com/gofiber/fiber/v2"
)

type SupportHandler struct {
	supportSvc *service.SupportService
}

func NewSupportHandler(supportSvc *service.SupportService) *SupportHandler {
	return &SupportHandler{supportSvc: supportSvc}
}

func (h *SupportHandler) GetActive(c *fiber.Ctx) error {
	qris, err := h.supportSvc.GetActive(c.Context())
	if err != nil || qris == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "QRIS aktif belum disetel",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    qris,
	})
}

func (h *SupportHandler) List(c *fiber.Ctx) error {
	list, err := h.supportSvc.ListAll(c.Context())
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

type CreateQRISRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	QRISURL     string `json:"qris_url"`
	IsActive    bool   `json:"is_active"`
}

func (h *SupportHandler) Create(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	var req CreateQRISRequest
	if err := c.BodyParser(&req); err != nil || req.Title == "" || req.QRISURL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "title and qris_url are required",
		})
	}

	qris, err := h.supportSvc.CreateOrUpdate(c.Context(), actor, req.Title, req.Description, req.QRISURL, req.IsActive)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "QRIS dukungan berhasil disimpan",
		"data":    qris,
	})
}

func (h *SupportHandler) Activate(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	id := c.Params("id")

	if err := h.supportSvc.SetActive(c.Context(), actor, id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "QRIS aktif berhasil diperbarui",
	})
}

func (h *SupportHandler) Delete(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	id := c.Params("id")

	if err := h.supportSvc.Delete(c.Context(), actor, id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "QRIS berhasil dihapus",
	})
}
