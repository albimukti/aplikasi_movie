package repository

import (
	"context"
	"database/sql"
	"errors"

	"moviehub-backend/internal/domain"
)

type SubtitleRepository struct {
	db *sql.DB
}

func NewSubtitleRepository(db *sql.DB) *SubtitleRepository {
	return &SubtitleRepository{db: db}
}

func (r *SubtitleRepository) Create(ctx context.Context, s *domain.Subtitle) error {
	query := `
		INSERT INTO subtitles (id, movie_id, language_code, label, file_url, is_default, status, created_at, updated_at)
		VALUES (COALESCE(NULLIF($1, '')::uuid, gen_random_uuid()), $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRowContext(ctx, query,
		s.ID, s.MovieID, s.LanguageCode, s.Label, s.FileURL, s.IsDefault, s.Status,
	).Scan(&s.ID, &s.CreatedAt, &s.UpdatedAt)
}

func (r *SubtitleRepository) Update(ctx context.Context, id, label, status string, isDefault bool) error {
	query := `
		UPDATE subtitles
		SET label = $1, status = $2, is_default = $3, updated_at = NOW()
		WHERE id = $4
	`
	_, err := r.db.ExecContext(ctx, query, label, status, isDefault, id)
	return err
}

func (r *SubtitleRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM subtitles WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *SubtitleRepository) ListByMovieID(ctx context.Context, movieID string, onlyActive bool) ([]domain.Subtitle, error) {
	query := `
		SELECT id, movie_id, language_code, label, file_url, is_default, status, created_at, updated_at
		FROM subtitles
		WHERE movie_id = $1 AND ($2 = FALSE OR status = 'ACTIVE')
		ORDER BY is_default DESC, label ASC
	`
	rows, err := r.db.QueryContext(ctx, query, movieID, onlyActive)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subs []domain.Subtitle
	for rows.Next() {
		var s domain.Subtitle
		if err := rows.Scan(
			&s.ID, &s.MovieID, &s.LanguageCode, &s.Label, &s.FileURL,
			&s.IsDefault, &s.Status, &s.CreatedAt, &s.UpdatedAt,
		); err != nil {
			return nil, err
		}
		subs = append(subs, s)
	}

	return subs, nil
}

func (r *SubtitleRepository) FindByID(ctx context.Context, id string) (*domain.Subtitle, error) {
	query := `
		SELECT id, movie_id, language_code, label, file_url, is_default, status, created_at, updated_at
		FROM subtitles
		WHERE id = $1
	`
	var s domain.Subtitle
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&s.ID, &s.MovieID, &s.LanguageCode, &s.Label, &s.FileURL,
		&s.IsDefault, &s.Status, &s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &s, nil
}
