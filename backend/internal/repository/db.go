package repository

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"moviehub-backend/internal/config"
	"moviehub-backend/migrations"
	_ "github.com/lib/pq"
)

func NewDB(cfg *config.Config) (*sql.DB, error) {
	var connStr string
	if cfg.DatabaseURL != "" {
		connStr = cfg.DatabaseURL
		log.Println("[Database] Using DATABASE_URL connection string")
	} else {
		connStr = fmt.Sprintf(
			"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
			cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBSSLMode,
		)
	}

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Printf("[Database] Connected successfully to PostgreSQL database")

	// Automatic initial migration if tables are not created yet (e.g., fresh Neon/Supabase cloud DB)
	if err := autoMigrate(db); err != nil {
		log.Printf("[Database] Warning: auto-migrate check: %v", err)
	}

	return db, nil
}

func autoMigrate(db *sql.DB) error {
	var exists bool
	query := "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')"
	if err := db.QueryRow(query).Scan(&exists); err != nil {
		return fmt.Errorf("check schema exists: %w", err)
	}

	if !exists && len(migrations.InitSQL) > 0 {
		log.Println("[Database] 'users' table not found. Auto-running 001_init.sql schema & seed data...")
		if _, err := db.Exec(migrations.InitSQL); err != nil {
			return fmt.Errorf("execute init schema: %w", err)
		}
		log.Println("[Database] Initial database schema and seed data created successfully!")
	} else {
		log.Println("[Database] Database schema verified (already initialized).")
	}

	return nil
}
