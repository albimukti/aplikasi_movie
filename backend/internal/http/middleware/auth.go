package middleware

import (
	"strings"

	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/pkg/jwt"
	"moviehub-backend/internal/repository"
	"github.com/gofiber/fiber/v2"
)

func JWTAuth(tokenSvc *jwt.TokenService, userRepo *repository.UserRepository) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Header otentikasi (Authorization) diperlukan",
			})
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Format token otentikasi tidak valid. Gunakan format 'Bearer <token>'",
			})
		}

		claims, err := tokenSvc.ValidateAccessToken(parts[1])
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Token tidak valid atau telah kedaluwarsa",
				"error":   err.Error(),
			})
		}

		// Retrieve active user from DB
		user, err := userRepo.FindByID(c.Context(), claims.Sub)
		if err != nil || user == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Pengguna tidak ditemukan",
			})
		}

		if user.Status == domain.UserStatusSuspended {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"message": "Akun Anda telah ditangguhkan (SUSPENDED)",
			})
		}

		c.Locals("user", user)
		c.Locals("claims", claims)
		return c.Next()
	}
}

func OptionalAuth(tokenSvc *jwt.TokenService, userRepo *repository.UserRepository) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && strings.EqualFold(parts[0], "Bearer") {
				if claims, err := tokenSvc.ValidateAccessToken(parts[1]); err == nil {
					if user, err := userRepo.FindByID(c.Context(), claims.Sub); err == nil && user != nil {
						c.Locals("user", user)
						c.Locals("claims", claims)
					}
				}
			}
		}
		return c.Next()
	}
}

func RequireRoles(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		val := c.Locals("user")
		if val == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Diperlukan login terlebih dahulu",
			})
		}

		user, ok := val.(*domain.User)
		if !ok {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Internal context error",
			})
		}

		for _, role := range allowedRoles {
			if user.Role == role {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Akses ditolak: role Anda tidak memiliki izin untuk fitur ini",
		})
	}
}
