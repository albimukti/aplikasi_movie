package repository

import (
	"context"
	"database/sql"

	"moviehub-backend/internal/domain"
)

type ConfigRepository struct {
	db *sql.DB
}

func NewConfigRepository(db *sql.DB) *ConfigRepository {
	return &ConfigRepository{db: db}
}

func (r *ConfigRepository) List(ctx context.Context) ([]domain.SystemConfig, error) {
	query := `SELECT key, value, description, updated_at FROM system_configs ORDER BY key ASC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var configs []domain.SystemConfig
	for rows.Next() {
		var c domain.SystemConfig
		if err := rows.Scan(&c.Key, &c.Value, &c.Description, &c.UpdatedAt); err != nil {
			return nil, err
		}
		configs = append(configs, c)
	}
	return configs, nil
}

func (r *ConfigRepository) Update(ctx context.Context, key, value string) error {
	query := `
		INSERT INTO system_configs (key, value, updated_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
	`
	_, err := r.db.ExecContext(ctx, query, key, value)
	return err
}
