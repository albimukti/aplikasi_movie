package http

import (
	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/http/handler"
	"moviehub-backend/internal/http/middleware"
	"moviehub-backend/internal/pkg/jwt"
	"moviehub-backend/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

type RouterParams struct {
	App             *fiber.App
	UserRepo        *repository.UserRepository
	TokenSvc        *jwt.TokenService
	AuthHandler     *handler.AuthHandler
	UserHandler     *handler.UserHandler
	CategoryHandler *handler.CategoryHandler
	MovieHandler    *handler.MovieHandler
	MediaHandler    *handler.MediaHandler
	SubtitleHandler *handler.SubtitleHandler
	AdHandler       *handler.AdHandler
	SupportHandler  *handler.SupportHandler
	PlaybackHandler *handler.PlaybackHandler
	DashboardHandler *handler.DashboardHandler
	AuditHandler    *handler.AuditHandler
	ConfigHandler   *handler.ConfigHandler
	UploadDir       string
	CorsOrigins     string
}

func SetupRouter(p RouterParams) {
	app := p.App

	// Determine allowed CORS origins
	allowOrigins := "http://localhost:5173, http://127.0.0.1:5173, http://localhost:3000, http://127.0.0.1:3000, http://localhost:8080, https://*.vercel.app, https://*.netlify.app"
	if p.CorsOrigins == "*" {
		allowOrigins = "*"
	} else if p.CorsOrigins != "" {
		allowOrigins = allowOrigins + ", " + p.CorsOrigins
	}

	// Global Middlewares
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     allowOrigins,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Request-ID, Range",
		ExposeHeaders:    "Content-Range, Accept-Ranges, Content-Length",
		AllowMethods:     "GET, POST, HEAD, PUT, DELETE, PATCH, OPTIONS",
		AllowCredentials: true,
	}))
	app.Use(middleware.StructuredLogger())

	// Static route for uploaded media with full Byte-Range streaming for seeking/forwarding
	app.Static("/uploads", p.UploadDir, fiber.Static{
		ByteRange: true,
		Browse:    false,
		Download:  false,
		Compress:  false,
	})

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "healthy",
			"service": "MovieHub Fiber API Gateway",
			"version": "1.0.0",
		})
	})

	api := app.Group("/api/v1")

	// Middleware shortcuts
	jwtAuth := middleware.JWTAuth(p.TokenSvc, p.UserRepo)
	optionalAuth := middleware.OptionalAuth(p.TokenSvc, p.UserRepo)
	requireAdminOrSuper := middleware.RequireRoles(domain.RoleAdmin, domain.RoleSuperAdmin)
	requireSuperOnly := middleware.RequireRoles(domain.RoleSuperAdmin)

	// --- 1. AUTH ROUTES ---
	auth := api.Group("/auth")
	auth.Get("/captcha", p.AuthHandler.GetCaptcha)
	auth.Post("/login", p.AuthHandler.Login)
	auth.Post("/register", p.AuthHandler.Register)
	auth.Post("/refresh", p.AuthHandler.Refresh)
	auth.Post("/logout", p.AuthHandler.Logout)
	auth.Get("/me", jwtAuth, p.AuthHandler.GetMe)
	auth.Put("/profile", jwtAuth, p.AuthHandler.UpdateProfile)

	// --- 2. USER ROUTES (SuperAdmin Only) ---
	users := api.Group("/users", jwtAuth, requireSuperOnly)
	users.Get("/", p.UserHandler.List)
	users.Post("/", p.UserHandler.Create)
	users.Patch("/:id", p.UserHandler.Update)
	users.Delete("/:id", p.UserHandler.Delete)

	// --- 3. CATEGORY ROUTES ---
	categories := api.Group("/categories")
	categories.Get("/", p.CategoryHandler.List)
	categories.Post("/", jwtAuth, requireAdminOrSuper, p.CategoryHandler.Create)
	categories.Patch("/:id", jwtAuth, requireAdminOrSuper, p.CategoryHandler.Update)
	categories.Delete("/:id", jwtAuth, requireAdminOrSuper, p.CategoryHandler.Delete)

	// --- 4. MOVIE ROUTES ---
	movies := api.Group("/movies")
	movies.Get("/", optionalAuth, p.MovieHandler.List)
	movies.Get("/:id_or_slug", optionalAuth, p.MovieHandler.Get)
	movies.Post("/", jwtAuth, requireAdminOrSuper, p.MovieHandler.Create)
	movies.Patch("/:id", jwtAuth, requireAdminOrSuper, p.MovieHandler.Update)
	movies.Put("/:id", jwtAuth, requireAdminOrSuper, p.MovieHandler.Update)
	movies.Delete("/:id", jwtAuth, requireAdminOrSuper, p.MovieHandler.Delete)
	movies.Post("/:id/publish", jwtAuth, requireAdminOrSuper, p.MovieHandler.Publish)
	movies.Post("/:id/unpublish", jwtAuth, requireAdminOrSuper, p.MovieHandler.Unpublish)

	// Movie Subtitles sub-resource
	movies.Get("/:id/subtitles", p.SubtitleHandler.ListForMovie)
	movies.Post("/:id/subtitles", jwtAuth, requireAdminOrSuper, p.SubtitleHandler.Create)

	// Standalone Subtitle management
	subtitles := api.Group("/subtitles", jwtAuth, requireAdminOrSuper)
	subtitles.Patch("/:id", p.SubtitleHandler.Update)
	subtitles.Delete("/:id", p.SubtitleHandler.Delete)

	// --- 5. MEDIA & TRANSCODING ROUTES ---
	media := api.Group("/media")
	media.Post("/upload", jwtAuth, requireAdminOrSuper, p.MediaHandler.Upload)
	media.Post("/upload/init", jwtAuth, requireAdminOrSuper, p.MediaHandler.InitChunkUpload)
	media.Post("/upload/chunk", jwtAuth, requireAdminOrSuper, p.MediaHandler.UploadChunk)
	media.Get("/upload/status/:upload_id", jwtAuth, requireAdminOrSuper, p.MediaHandler.GetChunkStatus)
	media.Post("/upload/complete", jwtAuth, requireAdminOrSuper, p.MediaHandler.CompleteChunkUpload)
	media.Post("/transcode", jwtAuth, requireAdminOrSuper, p.MediaHandler.StartTranscode)
	media.Get("/jobs", jwtAuth, requireAdminOrSuper, p.MediaHandler.ListJobs)
	media.Get("/jobs/:id", jwtAuth, requireAdminOrSuper, p.MediaHandler.GetJob)
	media.Post("/jobs/:id/retry", jwtAuth, requireAdminOrSuper, p.MediaHandler.RetryJob)

	// --- 6. ADVERTISEMENT ROUTES ---
	ads := api.Group("/ads")
	ads.Post("/decision", optionalAuth, p.AdHandler.GetDecision)
	ads.Post("/events", optionalAuth, p.AdHandler.TrackEvent)
	ads.Get("/campaigns", jwtAuth, requireAdminOrSuper, p.AdHandler.ListCampaigns)
	ads.Post("/campaigns", jwtAuth, requireSuperOnly, p.AdHandler.CreateCampaign)
	ads.Patch("/campaigns/:id", jwtAuth, requireSuperOnly, p.AdHandler.UpdateStatus)
	ads.Delete("/campaigns/:id", jwtAuth, requireSuperOnly, p.AdHandler.DeleteCampaign)
	ads.Get("/stats", jwtAuth, requireSuperOnly, p.AdHandler.GetStats)

	// --- 7. SUPPORT / QRIS ROUTES ---
	support := api.Group("/support")
	support.Get("/qris", p.SupportHandler.GetActive)
	support.Get("/list", jwtAuth, requireSuperOnly, p.SupportHandler.List)
	support.Post("/qris", jwtAuth, requireSuperOnly, p.SupportHandler.Create)
	support.Patch("/qris/:id/activate", jwtAuth, requireSuperOnly, p.SupportHandler.Activate)
	support.Delete("/qris/:id", jwtAuth, requireSuperOnly, p.SupportHandler.Delete)

	// --- 8. PLAYBACK & STREAMING ROUTES ---
	playback := api.Group("/playback")
	playback.Post("/session", optionalAuth, p.PlaybackHandler.CreateSession)
	playback.Post("/progress", jwtAuth, p.PlaybackHandler.UpdateProgress)
	playback.Get("/continue-watching", jwtAuth, p.PlaybackHandler.GetContinueWatching)

	// --- 9. DASHBOARD ROUTES (Role-Differentiated) ---
	dashboard := api.Group("/dashboard")
	dashboard.Get("/superadmin", jwtAuth, requireSuperOnly, p.DashboardHandler.GetSuperAdminDashboard)
	dashboard.Get("/admin", jwtAuth, requireAdminOrSuper, p.DashboardHandler.GetAdminDashboard)
	dashboard.Get("/viewer", optionalAuth, p.DashboardHandler.GetViewerDashboard)

	// --- 10. AUDIT LOGS ---
	audit := api.Group("/audit-logs", jwtAuth, requireAdminOrSuper)
	audit.Get("/", p.AuditHandler.List)

	// --- 11. SYSTEM CONFIGS ---
	configs := api.Group("/configs", jwtAuth, requireSuperOnly)
	configs.Get("/", p.ConfigHandler.List)
	configs.Put("/", p.ConfigHandler.Update)
}
