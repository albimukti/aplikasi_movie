package handler

import (
	"strconv"

	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/service"
	"github.com/gofiber/fiber/v2"
)

type UserHandler struct {
	userSvc *service.UserService
}

func NewUserHandler(userSvc *service.UserService) *UserHandler {
	return &UserHandler{userSvc: userSvc}
}

func (h *UserHandler) List(c *fiber.Ctx) error {
	search := c.Query("search", "")
	role := c.Query("role", "")
	status := c.Query("status", "")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	users, total, err := h.userSvc.ListUsers(c.Context(), search, role, status, page, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    users,
		"meta": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

type CreateUserRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

func (h *UserHandler) Create(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	var req CreateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid JSON payload",
		})
	}

	if req.Email == "" || req.Password == "" || req.Name == "" || req.Role == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Name, email, password, and role are required",
		})
	}

	user, err := h.userSvc.CreateUser(c.Context(), actor, req.Name, req.Email, req.Password, req.Role)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "User berhasil dibuat",
		"data":    user,
	})
}

type UpdateUserRequest struct {
	Name   string `json:"name"`
	Role   string `json:"role"`
	Status string `json:"status"`
}

func (h *UserHandler) Update(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	id := c.Params("id")
	var req UpdateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid JSON payload",
		})
	}

	user, err := h.userSvc.UpdateUser(c.Context(), actor, id, req.Name, req.Role, req.Status)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "User berhasil diperbarui",
		"data":    user,
	})
}

func (h *UserHandler) Delete(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	id := c.Params("id")

	if actor.ID == id {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Tidak dapat menghapus akun Anda sendiri",
		})
	}

	if err := h.userSvc.DeleteUser(c.Context(), actor, id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "User berhasil dihapus",
	})
}
