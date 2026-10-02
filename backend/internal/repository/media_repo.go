package repository

import (
	"context"
	"database/sql"
	"errors"

	"moviehub-backend/internal/domain"
)

type MediaRepository struct {
	db *sql.DB
}

func NewMediaRepository(db *sql.DB) *MediaRepository {
	return &MediaRepository{db: db}
}

func (r *MediaRepository) CreateAsset(ctx context.Context, a *domain.MediaAsset) error {
	query := `
		INSERT INTO media_assets (id, movie_id, type, resolution, codec, bitrate, url, status, created_at)
		VALUES (COALESCE(NULLIF($1, '')::uuid, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8, NOW())
		RETURNING id, created_at
	`
	return r.db.QueryRowContext(ctx, query,
		a.ID, a.MovieID, a.Type, a.Resolution, a.Codec, a.Bitrate, a.URL, a.Status,
	).Scan(&a.ID, &a.CreatedAt)
}

func (r *MediaRepository) DeleteAsset(ctx context.Context, id string) error {
	query := `DELETE FROM media_assets WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *MediaRepository) CreateJob(ctx context.Context, j *domain.MediaJob) error {
	query := `
		INSERT INTO media_jobs (id, movie_id, job_type, source_file, target_resolution, status, progress, error_message, created_at, updated_at)
		VALUES (COALESCE(NULLIF($1, '')::uuid, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRowContext(ctx, query,
		j.ID, j.MovieID, j.JobType, j.SourceFile, j.TargetResolution, j.Status, j.Progress, j.ErrorMessage,
	).Scan(&j.ID, &j.CreatedAt, &j.UpdatedAt)
}

func (r *MediaRepository) UpdateJobProgress(ctx context.Context, id string, progress int, status, errMsg string) error {
	query := `
		UPDATE media_jobs
		SET progress = $1, status = $2, error_message = $3, updated_at = NOW()
		WHERE id = $4
	`
	_, err := r.db.ExecContext(ctx, query, progress, status, errMsg, id)
	return err
}

func (r *MediaRepository) GetJobByID(ctx context.Context, id string) (*domain.MediaJob, error) {
	query := `
		SELECT j.id, j.movie_id, COALESCE(m.title, 'Unknown') as movie_title, j.asset_id,
		       j.job_type, j.source_file, j.target_resolution, j.status, j.progress,
		       j.error_message, j.created_at, j.updated_at
		FROM media_jobs j
		LEFT JOIN movies m ON m.id = j.movie_id
		WHERE j.id = $1
	`
	var j domain.MediaJob
	var assetID sql.NullString
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&j.ID, &j.MovieID, &j.MovieTitle, &assetID, &j.JobType,
		&j.SourceFile, &j.TargetResolution, &j.Status, &j.Progress,
		&j.ErrorMessage, &j.CreatedAt, &j.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	if assetID.Valid {
		j.AssetID = &assetID.String
	}
	return &j, nil
}

func (r *MediaRepository) ListJobs(ctx context.Context, status string, limit, offset int) ([]domain.MediaJob, int, error) {
	countQuery := `SELECT COUNT(*) FROM media_jobs WHERE ($1 = '' OR status = $1)`
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, status).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `
		SELECT j.id, j.movie_id, COALESCE(m.title, 'Unknown') as movie_title, j.asset_id,
		       j.job_type, j.source_file, j.target_resolution, j.status, j.progress,
		       j.error_message, j.created_at, j.updated_at
		FROM media_jobs j
		LEFT JOIN movies m ON m.id = j.movie_id
		WHERE ($1 = '' OR j.status = $1)
		ORDER BY j.created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.QueryContext(ctx, query, status, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var jobs []domain.MediaJob
	for rows.Next() {
		var j domain.MediaJob
		var assetID sql.NullString
		if err := rows.Scan(
			&j.ID, &j.MovieID, &j.MovieTitle, &assetID, &j.JobType,
			&j.SourceFile, &j.TargetResolution, &j.Status, &j.Progress,
			&j.ErrorMessage, &j.CreatedAt, &j.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		if assetID.Valid {
			j.AssetID = &assetID.String
		}
		jobs = append(jobs, j)
	}

	return jobs, total, nil
}
