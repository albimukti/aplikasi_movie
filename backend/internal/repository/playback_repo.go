package repository

import (
	"context"
	"database/sql"

	"moviehub-backend/internal/domain"
)

type PlaybackRepository struct {
	db *sql.DB
}

func NewPlaybackRepository(db *sql.DB) *PlaybackRepository {
	return &PlaybackRepository{db: db}
}

func (r *PlaybackRepository) UpsertProgress(ctx context.Context, p *domain.PlaybackSession) error {
	query := `
		INSERT INTO playback_sessions (id, user_id, movie_id, last_position_seconds, duration_seconds, completed, started_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
		ON CONFLICT (user_id, movie_id)
		DO UPDATE SET
			last_position_seconds = EXCLUDED.last_position_seconds,
			duration_seconds = EXCLUDED.duration_seconds,
			completed = EXCLUDED.completed,
			ended_at = CASE WHEN EXCLUDED.completed THEN NOW() ELSE playback_sessions.ended_at END,
			updated_at = NOW()
	`
	_, err := r.db.ExecContext(ctx, query,
		p.UserID, p.MovieID, p.LastPositionSeconds, p.DurationSeconds, p.Completed,
	)
	return err
}

func (r *PlaybackRepository) GetContinueWatching(ctx context.Context, userID string, limit int) ([]domain.PlaybackSession, error) {
	query := `
		SELECT ps.id, ps.user_id, ps.movie_id, m.title as movie_title, m.poster_url as movie_poster,
		       m.duration_seconds as movie_duration, ps.last_position_seconds, ps.duration_seconds,
		       ps.completed, ps.started_at, ps.ended_at, ps.created_at, ps.updated_at
		FROM playback_sessions ps
		JOIN movies m ON m.id = ps.movie_id
		WHERE ps.user_id = $1 AND ps.completed = FALSE AND ps.last_position_seconds > 10 AND m.status = 'PUBLISHED'
		ORDER BY ps.updated_at DESC
		LIMIT $2
	`
	rows, err := r.db.QueryContext(ctx, query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []domain.PlaybackSession
	for rows.Next() {
		var ps domain.PlaybackSession
		var endedAt sql.NullTime
		if err := rows.Scan(
			&ps.ID, &ps.UserID, &ps.MovieID, &ps.MovieTitle, &ps.MoviePoster,
			&ps.MovieDuration, &ps.LastPositionSeconds, &ps.DurationSeconds,
			&ps.Completed, &ps.StartedAt, &endedAt, &ps.CreatedAt, &ps.UpdatedAt,
		); err != nil {
			return nil, err
		}
		if endedAt.Valid {
			ps.EndedAt = &endedAt.Time
		}
		sessions = append(sessions, ps)
	}

	return sessions, nil
}

func (r *PlaybackRepository) CountTotalSessions(ctx context.Context) (int64, int64, error) {
	query := `
		SELECT 
			COUNT(*) as total,
			COUNT(*) FILTER (WHERE started_at >= CURRENT_DATE) as today
		FROM playback_sessions
	`
	var total, today int64
	err := r.db.QueryRowContext(ctx, query).Scan(&total, &today)
	if err != nil {
		return 0, 0, err
	}
	return total, today, nil
}
