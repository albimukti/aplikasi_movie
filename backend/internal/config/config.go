package config

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL      string
	Port             string
	DBHost           string
	DBPort           string
	DBUser           string
	DBPassword       string
	DBName           string
	DBSSLMode        string
	RedisAddr        string
	RedisPassword    string
	JWTSecret        string
	JWTAccessExpiry  time.Duration
	JWTRefreshExpiry time.Duration
	UploadDir        string
	AppEnv           string
	CorsOrigins      string
}

func LoadConfig() *Config {
	_ = godotenv.Load()

	accessExp, err := time.ParseDuration(getEnv("JWT_ACCESS_EXPIRY", "60m"))
	if err != nil {
		accessExp = 60 * time.Minute
	}

	refreshExp, err := time.ParseDuration(getEnv("JWT_REFRESH_EXPIRY", "168h"))
	if err != nil {
		refreshExp = 7 * 24 * time.Hour
	}

	cfg := &Config{
		DatabaseURL:      getEnv("DATABASE_URL", ""),
		Port:             getEnv("PORT", "8080"),
		DBHost:           getEnv("DB_HOST", "localhost"),
		DBPort:           getEnv("DB_PORT", "5432"),
		DBUser:           getEnv("DB_USER", "postgres"),
		DBPassword:       getEnv("DB_PASSWORD", "P@ssw0rd"),
		DBName:           getEnv("DB_NAME", "moviehub_db"),
		DBSSLMode:        getEnv("DB_SSLMODE", "disable"),
		RedisAddr:        getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword:    getEnv("REDIS_PASSWORD", ""),
		JWTSecret:        getEnv("JWT_SECRET", "super-secret-moviehub-jwt-token-key-2026-v1"),
		JWTAccessExpiry:  accessExp,
		JWTRefreshExpiry: refreshExp,
		UploadDir:        getEnv("UPLOAD_DIR", "./uploads"),
		AppEnv:           getEnv("APP_ENV", "development"),
		CorsOrigins:      getEnv("CORS_ALLOWED_ORIGINS", ""),
	}

	log.Printf("[Config] Loaded configuration for env=%s, port=%s", cfg.AppEnv, cfg.Port)
	return cfg
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
