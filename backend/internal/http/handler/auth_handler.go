package handler

import (
	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/service"
	"github.com/gofiber/fiber/v2"
)

type AuthHandler struct {
	authSvc *service.AuthService
}

func NewAuthHandler(authSvc *service.AuthService) *AuthHandler {
	return &AuthHandler{authSvc: authSvc}
}

func (h *AuthHandler) GetCaptcha(c *fiber.Ctx) error {
	challenge, err := h.authSvc.GetCaptcha()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membuat challenge CAPTCHA",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    challenge,
	})
}

type LoginRequest struct {
	Email           string `json:"email"`
	Username        string `json:"username"`
	EmailOrUsername string `json:"email_or_username"`
	Login           string `json:"login"`
	Password        string `json:"password"`
	CaptchaID       string `json:"captcha_id"`
	CaptchaCode     string `json:"captcha_code"`
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Payload JSON tidak valid",
		})
	}

	identifier := req.Email
	if identifier == "" {
		identifier = req.Username
	}
	if identifier == "" {
		identifier = req.EmailOrUsername
	}
	if identifier == "" {
		identifier = req.Login
	}

	if identifier == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Username/Email dan password wajib diisi",
		})
	}

	ip := c.IP()
	res, err := h.authSvc.Login(c.Context(), identifier, req.Password, req.CaptchaID, req.CaptchaCode, ip)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Login berhasil",
		"data":    res,
	})
}

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Payload JSON tidak valid",
		})
	}

	if req.Name == "" || req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Nama, email, dan password wajib diisi",
		})
	}

	ip := c.IP()
	res, err := h.authSvc.Register(c.Context(), req.Name, req.Email, req.Password, ip)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Registrasi akun berhasil",
		"data":    res,
	})
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

func (h *AuthHandler) Refresh(c *fiber.Ctx) error {
	var req RefreshRequest
	if err := c.BodyParser(&req); err != nil || req.RefreshToken == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "refresh_token wajib disediakan",
		})
	}

	res, err := h.authSvc.Refresh(c.Context(), req.RefreshToken)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Token berhasil diperbarui",
		"data":    res,
	})
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	var req RefreshRequest
	_ = c.BodyParser(&req)

	var userID string
	if val := c.Locals("user"); val != nil {
		if u, ok := val.(*domain.User); ok {
			userID = u.ID
		}
	}

	_ = h.authSvc.Logout(c.Context(), req.RefreshToken, userID)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Logout berhasil",
	})
}

func (h *AuthHandler) GetMe(c *fiber.Ctx) error {
	user := c.Locals("user").(*domain.User)
	return c.JSON(fiber.Map{
		"success": true,
		"data":    user,
	})
}

type UpdateProfileRequest struct {
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url"`
}

func (h *AuthHandler) UpdateProfile(c *fiber.Ctx) error {
	user := c.Locals("user").(*domain.User)
	var req UpdateProfileRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Payload JSON tidak valid",
		})
	}

	updated, err := h.authSvc.UpdateProfile(c.Context(), user.ID, req.Name, req.AvatarURL)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Profil berhasil diperbarui",
		"data":    updated,
	})
}
