package handler

import (
	"strconv"

	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/service"
	"github.com/gofiber/fiber/v2"
)

type MovieHandler struct {
	movieSvc *service.MovieService
}

func NewMovieHandler(movieSvc *service.MovieService) *MovieHandler {
	return &MovieHandler{movieSvc: movieSvc}
}

func (h *MovieHandler) List(c *fiber.Ctx) error {
	search := c.Query("search", "")
	category := c.Query("category", "")
	status := c.Query("status", "")
	sortBy := c.Query("sort", "latest")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "12"))

	var isFeatured *bool
	if f := c.Query("featured", ""); f != "" {
		val := f == "true"
		isFeatured = &val
	}

	// If no user or viewer, default status to PUBLISHED unless explicitly asked by Admin
	var currentUser *domain.User
	if val := c.Locals("user"); val != nil {
		currentUser = val.(*domain.User)
	}

	if (currentUser == nil || currentUser.Role == domain.RoleViewer) && status == "" {
		status = domain.MovieStatusPublished
	}

	movies, total, err := h.movieSvc.ListMovies(c.Context(), search, category, status, sortBy, isFeatured, page, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    movies,
		"meta": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *MovieHandler) Get(c *fiber.Ctx) error {
	idOrSlug := c.Params("id_or_slug")
	incrementView := c.Query("view", "false") == "true"

	movie, err := h.movieSvc.GetMovie(c.Context(), idOrSlug, incrementView)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    movie,
	})
}

func (h *MovieHandler) Create(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	var in service.CreateMovieInput
	if err := c.BodyParser(&in); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid JSON payload",
		})
	}

	movie, err := h.movieSvc.CreateMovie(c.Context(), actor, in)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Movie berhasil dibuat",
		"data":    movie,
	})
}

func (h *MovieHandler) Update(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	id := c.Params("id")

	var in service.CreateMovieInput
	if err := c.BodyParser(&in); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid JSON payload",
		})
	}

	movie, err := h.movieSvc.UpdateMovie(c.Context(), actor, id, in)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Movie berhasil diperbarui",
		"data":    movie,
	})
}

func (h *MovieHandler) Delete(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	id := c.Params("id")

	if err := h.movieSvc.DeleteMovie(c.Context(), actor, id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Movie berhasil dihapus",
	})
}

func (h *MovieHandler) Publish(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	id := c.Params("id")

	if err := h.movieSvc.PublishMovie(c.Context(), actor, id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Movie berhasil dipublikasikan ke katalog!",
	})
}

func (h *MovieHandler) Unpublish(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	id := c.Params("id")

	if err := h.movieSvc.UnpublishMovie(c.Context(), actor, id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Movie ditarik dari status publikasi",
	})
}
