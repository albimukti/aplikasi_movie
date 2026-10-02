package handler

import (
	"strconv"

	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/service"
	"github.com/gofiber/fiber/v2"
)

type AuditHandler struct {
	auditSvc *service.AuditService
}

func NewAuditHandler(auditSvc *service.AuditService) *AuditHandler {
	return &AuditHandler{auditSvc: auditSvc}
}

func (h *AuditHandler) List(c *fiber.Ctx) error {
	user := c.Locals("user").(*domain.User)
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "15"))

	// Admin only sees content-related audit logs, SuperAdmin sees all
	contentOnly := (user.Role == domain.RoleAdmin)

	logs, total, err := h.auditSvc.ListLogs(c.Context(), page, limit, contentOnly)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    logs,
		"meta": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}
