package handler

import (
	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/service"
	"github.com/gofiber/fiber/v2"
)

type DashboardHandler struct {
	dashSvc *service.DashboardService
}

func NewDashboardHandler(dashSvc *service.DashboardService) *DashboardHandler {
	return &DashboardHandler{dashSvc: dashSvc}
}

func (h *DashboardHandler) GetSuperAdminDashboard(c *fiber.Ctx) error {
	data, err := h.dashSvc.GetSuperAdminDashboard(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    data,
	})
}

func (h *DashboardHandler) GetAdminDashboard(c *fiber.Ctx) error {
	data, err := h.dashSvc.GetAdminDashboard(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    data,
	})
}

func (h *DashboardHandler) GetViewerDashboard(c *fiber.Ctx) error {
	var userID string
	if val := c.Locals("user"); val != nil {
		userID = val.(*domain.User).ID
	}

	data, err := h.dashSvc.GetViewerDashboard(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    data,
	})
}
