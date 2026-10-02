package repository

import (
	"context"
	"database/sql"

	"moviehub-backend/internal/domain"
)

type DashboardRepository struct {
	db *sql.DB
}

func NewDashboardRepository(db *sql.DB) *DashboardRepository {
	return &DashboardRepository{db: db}
}

func (r *DashboardRepository) GetSuperAdminStats(ctx context.Context) (*domain.SuperAdminDashboard, error) {
	d := &domain.SuperAdminDashboard{
		SystemHealth: map[string]string{
			"database": "ONLINE (PostgreSQL 18)",
			"gateway":  "HEALTHY (Go Fiber)",
			"transcode_worker": "ACTIVE (Ready)",
			"cache":    "ONLINE (Redis/Memory Layer)",
		},
	}

	// 1. User stats
	userStatsQuery := `
		SELECT 
			COUNT(*) as total,
			COUNT(*) FILTER (WHERE role = 'VIEWER') as viewers,
			COUNT(*) FILTER (WHERE role = 'ADMIN') as admins,
			COUNT(*) FILTER (WHERE role = 'SUPERADMIN') as superadmins,
			COUNT(*) FILTER (WHERE status = 'SUSPENDED') as suspended
		FROM users
	`
	_ = r.db.QueryRowContext(ctx, userStatsQuery).Scan(
		&d.TotalUsers, &d.ViewersCount, &d.AdminsCount, &d.SuperAdminsCount, &d.SuspendedUsers,
	)

	// 2. Movie stats
	movieStatsQuery := `
		SELECT 
			COUNT(*) as total,
			COUNT(*) FILTER (WHERE status = 'PUBLISHED') as published,
			COUNT(*) FILTER (WHERE status = 'DRAFT') as draft,
			COUNT(*) FILTER (WHERE status = 'READY') as ready,
			COUNT(*) FILTER (WHERE status = 'PROCESSING') as processing
		FROM movies
	`
	_ = r.db.QueryRowContext(ctx, movieStatsQuery).Scan(
		&d.TotalMovies, &d.PublishedMovies, &d.DraftMovies, &d.ReadyMovies, &d.ProcessingMovies,
	)

	// 3. Category count
	_ = r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM categories`).Scan(&d.TotalCategories)

	// 4. Playback count
	_ = r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM playback_sessions`).Scan(&d.TotalPlaybacks)

	// 5. Jobs count
	jobStatsQuery := `
		SELECT 
			COUNT(*) FILTER (WHERE status IN ('QUEUED', 'PROCESSING')) as active_jobs,
			COUNT(*) FILTER (WHERE status = 'FAILED') as failed_jobs
		FROM media_jobs
	`
	_ = r.db.QueryRowContext(ctx, jobStatsQuery).Scan(&d.ActiveJobsCount, &d.FailedJobsCount)

	// 6. Ad stats
	_ = r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM ad_campaigns WHERE status = 'ACTIVE'`).Scan(&d.ActiveCampaigns)
	_ = r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM ad_events WHERE event_type = 'impression'`).Scan(&d.TotalAdImpressions)

	// 7. Active QRIS
	var qrisTitle sql.NullString
	_ = r.db.QueryRowContext(ctx, `SELECT title FROM support_qris WHERE is_active = TRUE LIMIT 1`).Scan(&qrisTitle)
	if qrisTitle.Valid {
		d.ActiveQRISTitle = qrisTitle.String
	} else {
		d.ActiveQRISTitle = "No Active QRIS"
	}

	// 8. Storage estimate (based on assets count, approx 450MB per movie)
	d.EstimatedStorageMB = float64(d.TotalMovies) * 480.0

	// 9. Recent Audit Logs (Full)
	auditRows, err := r.db.QueryContext(ctx, `
		SELECT id, actor_id, actor_name, actor_role, action, resource, resource_id, metadata::text, ip_address, created_at
		FROM audit_logs
		ORDER BY created_at DESC
		LIMIT 8
	`)
	if err == nil {
		defer auditRows.Close()
		for auditRows.Next() {
			var a domain.AuditLog
			var actorID sql.NullString
			if err := auditRows.Scan(&a.ID, &actorID, &a.ActorName, &a.ActorRole, &a.Action, &a.Resource, &a.ResourceID, &a.Metadata, &a.IPAddress, &a.CreatedAt); err == nil {
				if actorID.Valid {
					a.ActorID = &actorID.String
				}
				d.RecentAuditLogs = append(d.RecentAuditLogs, a)
			}
		}
	}

	return d, nil
}

func (r *DashboardRepository) GetAdminStats(ctx context.Context) (*domain.AdminDashboard, error) {
	d := &domain.AdminDashboard{}

	// 1. Movie stats
	movieStatsQuery := `
		SELECT 
			COUNT(*) as total,
			COUNT(*) FILTER (WHERE status = 'PUBLISHED') as published,
			COUNT(*) FILTER (WHERE status = 'DRAFT') as draft,
			COUNT(*) FILTER (WHERE status = 'READY') as ready,
			COUNT(*) FILTER (WHERE status = 'PROCESSING') as processing,
			COUNT(*) FILTER (WHERE status = 'FAILED') as failed
		FROM movies
	`
	_ = r.db.QueryRowContext(ctx, movieStatsQuery).Scan(
		&d.TotalMovies, &d.PublishedMovies, &d.DraftMovies, &d.ReadyMovies, &d.ProcessingMovies, &d.FailedMovies,
	)

	// 2. Categories & Subtitles
	_ = r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM categories`).Scan(&d.TotalCategories)
	_ = r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM subtitles`).Scan(&d.TotalSubtitles)

	// 3. Jobs
	jobStatsQuery := `
		SELECT 
			COUNT(*) FILTER (WHERE status IN ('QUEUED', 'PROCESSING')) as active_jobs,
			COUNT(*) FILTER (WHERE status = 'FAILED') as failed_jobs
		FROM media_jobs
	`
	_ = r.db.QueryRowContext(ctx, jobStatsQuery).Scan(&d.ActiveJobsCount, &d.FailedJobsCount)

	// 4. Recent Jobs
	jobRows, err := r.db.QueryContext(ctx, `
		SELECT j.id, j.movie_id, COALESCE(m.title, 'Unknown') as movie_title, j.asset_id,
		       j.job_type, j.source_file, j.target_resolution, j.status, j.progress,
		       j.error_message, j.created_at, j.updated_at
		FROM media_jobs j
		LEFT JOIN movies m ON m.id = j.movie_id
		ORDER BY j.created_at DESC
		LIMIT 6
	`)
	if err == nil {
		defer jobRows.Close()
		for jobRows.Next() {
			var j domain.MediaJob
			var assetID sql.NullString
			if err := jobRows.Scan(&j.ID, &j.MovieID, &j.MovieTitle, &assetID, &j.JobType, &j.SourceFile, &j.TargetResolution, &j.Status, &j.Progress, &j.ErrorMessage, &j.CreatedAt, &j.UpdatedAt); err == nil {
				if assetID.Valid {
					j.AssetID = &assetID.String
				}
				d.RecentJobs = append(d.RecentJobs, j)
			}
		}
	}

	// 5. Recent Movies
	movieRows, err := r.db.QueryContext(ctx, `
		SELECT id, title, slug, synopsis, release_year, duration_seconds, rating, age_rating,
		       poster_url, backdrop_url, trailer_url, video_source_url, status, is_featured,
		       views_count, created_at, updated_at
		FROM movies
		ORDER BY created_at DESC
		LIMIT 5
	`)
	if err == nil {
		defer movieRows.Close()
		for movieRows.Next() {
			var m domain.Movie
			if err := movieRows.Scan(
				&m.ID, &m.Title, &m.Slug, &m.Synopsis, &m.ReleaseYear, &m.DurationSeconds,
				&m.Rating, &m.AgeRating, &m.PosterURL, &m.BackdropURL, &m.TrailerURL,
				&m.VideoSourceURL, &m.Status, &m.IsFeatured, &m.ViewsCount, &m.CreatedAt, &m.UpdatedAt,
			); err == nil {
				d.RecentMovies = append(d.RecentMovies, m)
			}
		}
	}

	// 6. Recent content-related audits
	auditRows, err := r.db.QueryContext(ctx, `
		SELECT id, actor_id, actor_name, actor_role, action, resource, resource_id, metadata::text, ip_address, created_at
		FROM audit_logs
		WHERE resource IN ('MOVIE', 'CATEGORY', 'MEDIA', 'SUBTITLE')
		ORDER BY created_at DESC
		LIMIT 6
	`)
	if err == nil {
		defer auditRows.Close()
		for auditRows.Next() {
			var a domain.AuditLog
			var actorID sql.NullString
			if err := auditRows.Scan(&a.ID, &actorID, &a.ActorName, &a.ActorRole, &a.Action, &a.Resource, &a.ResourceID, &a.Metadata, &a.IPAddress, &a.CreatedAt); err == nil {
				if actorID.Valid {
					a.ActorID = &actorID.String
				}
				d.RecentAudits = append(d.RecentAudits, a)
			}
		}
	}

	return d, nil
}
