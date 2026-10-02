package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"moviehub-backend/internal/config"
	httpPkg "moviehub-backend/internal/http"
	"moviehub-backend/internal/http/handler"
	"moviehub-backend/internal/pkg/cache"
	"moviehub-backend/internal/pkg/captcha"
	"moviehub-backend/internal/pkg/jwt"
	"moviehub-backend/internal/pkg/storage"
	"moviehub-backend/internal/pkg/worker"
	"moviehub-backend/internal/repository"
	"moviehub-backend/internal/service"

	"github.com/gofiber/fiber/v2"
)

func main() {
	log.Println("==================================================")
	log.Println("       MovieHub Streaming API Gateway (Go Fiber)  ")
	log.Println("==================================================")

	// 1. Config
	cfg := config.LoadConfig()

	// 2. Database
	db, err := repository.NewDB(cfg)
	if err != nil {
		log.Fatalf("[Fatal] Failed to connect to database: %v", err)
	}
	defer db.Close()

	// 3. Cache (Redis with Memory Fallback)
	c := cache.NewCache(cfg.RedisAddr, cfg.RedisPassword)

	// 4. Packages
	tokenSvc := jwt.NewTokenService(cfg.JWTSecret, cfg.JWTAccessExpiry, cfg.JWTRefreshExpiry)
	captchaMgr := captcha.NewManager(c)
	storageMgr := storage.NewStorage(cfg.UploadDir)

	// 5. Repositories
	userRepo := repository.NewUserRepository(db)
	tokenRepo := repository.NewRefreshTokenRepository(db)
	catRepo := repository.NewCategoryRepository(db)
	movieRepo := repository.NewMovieRepository(db)
	mediaRepo := repository.NewMediaRepository(db)
	subRepo := repository.NewSubtitleRepository(db)
	adRepo := repository.NewAdRepository(db)
	supportRepo := repository.NewSupportRepository(db)
	auditRepo := repository.NewAuditRepository(db)
	playbackRepo := repository.NewPlaybackRepository(db)
	dashRepo := repository.NewDashboardRepository(db)
	cfgRepo := repository.NewConfigRepository(db)

	// 6. Transcoding Background Worker
	transcodeWorker := worker.NewTranscodingWorker(db, mediaRepo, movieRepo, cfg.UploadDir)
	transcodeWorker.Start()
	defer transcodeWorker.Stop()

	// 7. Services
	authSvc := service.NewAuthService(userRepo, tokenRepo, auditRepo, tokenSvc, captchaMgr)
	userSvc := service.NewUserService(userRepo, auditRepo)
	catSvc := service.NewCategoryService(catRepo, auditRepo, c)
	movieSvc := service.NewMovieService(movieRepo, auditRepo)
	mediaSvc := service.NewMediaService(mediaRepo, movieRepo, auditRepo, storageMgr)
	subSvc := service.NewSubtitleService(subRepo, auditRepo)
	adSvc := service.NewAdService(adRepo, auditRepo, c)
	supportSvc := service.NewSupportService(supportRepo, auditRepo)
	playbackSvc := service.NewPlaybackService(playbackRepo, movieRepo, cfg.JWTSecret)
	dashSvc := service.NewDashboardService(dashRepo, movieRepo, catRepo, playbackRepo)
	auditSvc := service.NewAuditService(auditRepo)
	configSvc := service.NewConfigService(cfgRepo, auditRepo)

	// 8. Handlers
	authHandler := handler.NewAuthHandler(authSvc)
	userHandler := handler.NewUserHandler(userSvc)
	catHandler := handler.NewCategoryHandler(catSvc)
	movieHandler := handler.NewMovieHandler(movieSvc)
	mediaHandler := handler.NewMediaHandler(mediaSvc)
	subHandler := handler.NewSubtitleHandler(subSvc)
	adHandler := handler.NewAdHandler(adSvc)
	supportHandler := handler.NewSupportHandler(supportSvc)
	playbackHandler := handler.NewPlaybackHandler(playbackSvc)
	dashHandler := handler.NewDashboardHandler(dashSvc)
	auditHandler := handler.NewAuditHandler(auditSvc)
	configHandler := handler.NewConfigHandler(configSvc)

	// 9. Fiber App
	app := fiber.New(fiber.Config{
		AppName:      "MovieHub API Gateway v1.0",
		ServerHeader: "MovieHub-Gateway",
		BodyLimit:    500 * 1024 * 1024, // 500MB
	})

	// 10. Wire Routes
	httpPkg.SetupRouter(httpPkg.RouterParams{
		App:              app,
		UserRepo:         userRepo,
		TokenSvc:         tokenSvc,
		AuthHandler:      authHandler,
		UserHandler:      userHandler,
		CategoryHandler:  catHandler,
		MovieHandler:     movieHandler,
		MediaHandler:     mediaHandler,
		SubtitleHandler:  subHandler,
		AdHandler:        adHandler,
		SupportHandler:   supportHandler,
		PlaybackHandler:  playbackHandler,
		DashboardHandler: dashHandler,
		AuditHandler:     auditHandler,
		ConfigHandler:    configHandler,
		UploadDir:        cfg.UploadDir,
		CorsOrigins:      cfg.CorsOrigins,
	})

	// Graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-sigChan
		log.Println("[Server] Shutting down gracefully...")
		_ = app.Shutdown()
	}()

	addr := ":" + cfg.Port
	log.Printf("[Server] MovieHub API Gateway listening on http://localhost%s", addr)
	if err := app.Listen(addr); err != nil {
		log.Printf("[Server] Server stopped: %v", err)
	}
}
