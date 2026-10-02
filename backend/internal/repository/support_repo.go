package repository

import (
	"context"
	"database/sql"
	"errors"

	"moviehub-backend/internal/domain"
)

type SupportRepository struct {
	db *sql.DB
}

func NewSupportRepository(db *sql.DB) *SupportRepository {
	return &SupportRepository{db: db}
}

func (r *SupportRepository) GetActive(ctx context.Context) (*domain.SupportQRIS, error) {
	query := `
		SELECT id, title, description, qris_url, is_active, created_by, created_at, updated_at
		FROM support_qris
		WHERE is_active = TRUE
		ORDER BY updated_at DESC
		LIMIT 1
	`
	var s domain.SupportQRIS
	var createdBy sql.NullString
	err := r.db.QueryRowContext(ctx, query).Scan(
		&s.ID, &s.Title, &s.Description, &s.QRISURL, &s.IsActive, &createdBy, &s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	if createdBy.Valid {
		s.CreatedBy = &createdBy.String
	}
	return &s, nil
}

func (r *SupportRepository) ListAll(ctx context.Context) ([]domain.SupportQRIS, error) {
	query := `
		SELECT id, title, description, qris_url, is_active, created_by, created_at, updated_at
		FROM support_qris
		ORDER BY created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.SupportQRIS
	for rows.Next() {
		var s domain.SupportQRIS
		var createdBy sql.NullString
		if err := rows.Scan(
			&s.ID, &s.Title, &s.Description, &s.QRISURL, &s.IsActive, &createdBy, &s.CreatedAt, &s.UpdatedAt,
		); err != nil {
			return nil, err
		}
		if createdBy.Valid {
			s.CreatedBy = &createdBy.String
		}
		list = append(list, s)
	}

	return list, nil
}

func (r *SupportRepository) Create(ctx context.Context, s *domain.SupportQRIS) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if s.IsActive {
		// Deactivate others
		if _, err := tx.ExecContext(ctx, `UPDATE support_qris SET is_active = FALSE`); err != nil {
			return err
		}
	}

	query := `
		INSERT INTO support_qris (id, title, description, qris_url, is_active, created_by, created_at, updated_at)
		VALUES (COALESCE(NULLIF($1, '')::uuid, gen_random_uuid()), $2, $3, $4, $5, NULLIF($6, '')::uuid, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	createdByStr := ""
	if s.CreatedBy != nil {
		createdByStr = *s.CreatedBy
	}

	err = tx.QueryRowContext(ctx, query,
		s.ID, s.Title, s.Description, s.QRISURL, s.IsActive, createdByStr,
	).Scan(&s.ID, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *SupportRepository) SetActive(ctx context.Context, id string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, `UPDATE support_qris SET is_active = FALSE`); err != nil {
		return err
	}
	if _, err := tx.ExecContext(ctx, `UPDATE support_qris SET is_active = TRUE, updated_at = NOW() WHERE id = $1`, id); err != nil {
		return err
	}

	return tx.Commit()
}

func (r *SupportRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM support_qris WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
