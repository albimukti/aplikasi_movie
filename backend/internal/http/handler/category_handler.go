package handler

import (
	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/service"
	"github.com/gofiber/fiber/v2"
)

type CategoryHandler struct {
	catSvc *service.CategoryService
}

func NewCategoryHandler(catSvc *service.CategoryService) *CategoryHandler {
	return &CategoryHandler{catSvc: catSvc}
}

func (h *CategoryHandler) List(c *fiber.Ctx) error {
	onlyActive := c.Query("active", "false") == "true"
	cats, err := h.catSvc.ListAll(c.Context(), onlyActive)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    cats,
	})
}

type CategoryRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Status      string `json:"status"`
}

func (h *CategoryHandler) Create(c *fiber.Ctx) error {
	var actor *domain.User
	if val := c.Locals("user"); val != nil {
		actor = val.(*domain.User)
	}

	var req CategoryRequest
	if err := c.BodyParser(&req); err != nil || req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Nama kategori wajib diisi",
		})
	}

	cat, err := h.catSvc.Create(c.Context(), actor, req.Name, req.Description)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Kategori berhasil dibuat",
		"data":    cat,
	})
}

func (h *CategoryHandler) Update(c *fiber.Ctx) error {
	var actor *domain.User
	if val := c.Locals("user"); val != nil {
		actor = val.(*domain.User)
	}
	id := c.Params("id")

	var req CategoryRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid JSON payload",
		})
	}

	cat, err := h.catSvc.Update(c.Context(), actor, id, req.Name, req.Description, req.Status)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Kategori berhasil diperbarui",
		"data":    cat,
	})
}

func (h *CategoryHandler) Delete(c *fiber.Ctx) error {
	var actor *domain.User
	if val := c.Locals("user"); val != nil {
		actor = val.(*domain.User)
	}
	id := c.Params("id")

	if err := h.catSvc.Delete(c.Context(), actor, id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Kategori berhasil dihapus",
	})
}
