package handler

import (
	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/service"
	"github.com/gofiber/fiber/v2"
)

type ConfigHandler struct {
	cfgSvc *service.ConfigService
}

func NewConfigHandler(cfgSvc *service.ConfigService) *ConfigHandler {
	return &ConfigHandler{cfgSvc: cfgSvc}
}

func (h *ConfigHandler) List(c *fiber.Ctx) error {
	configs, err := h.cfgSvc.ListConfigs(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    configs,
	})
}

type UpdateConfigRequest struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

func (h *ConfigHandler) Update(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	var req UpdateConfigRequest
	if err := c.BodyParser(&req); err != nil || req.Key == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "key and value are required",
		})
	}

	if err := h.cfgSvc.UpdateConfig(c.Context(), actor, req.Key, req.Value); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Konfigurasi sistem berhasil diperbarui",
	})
}
