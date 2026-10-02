package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"moviehub-backend/internal/domain"
)

type MovieRepository struct {
	db *sql.DB
}

func NewMovieRepository(db *sql.DB) *MovieRepository {
	return &MovieRepository{db: db}
}

func (r *MovieRepository) Create(ctx context.Context, m *domain.Movie, categoryIDs []string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO movies (
			id, title, slug, synopsis, release_year, duration_seconds, rating, age_rating,
			poster_url, backdrop_url, trailer_url, video_source_url, status, is_featured,
			created_by, created_at, updated_at
		)
		VALUES (
			COALESCE(NULLIF($1, '')::uuid, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8,
			$9, $10, $11, $12, $13, $14,
			NULLIF($15, '')::uuid, NOW(), NOW()
		)
		RETURNING id, created_at, updated_at
	`
	createdByStr := ""
	if m.CreatedBy != nil {
		createdByStr = *m.CreatedBy
	}

	err = tx.QueryRowContext(ctx, query,
		m.ID, m.Title, m.Slug, m.Synopsis, m.ReleaseYear, m.DurationSeconds, m.Rating, m.AgeRating,
		m.PosterURL, m.BackdropURL, m.TrailerURL, m.VideoSourceURL, m.Status, m.IsFeatured,
		createdByStr,
	).Scan(&m.ID, &m.CreatedAt, &m.UpdatedAt)
	if err != nil {
		return err
	}

	// Insert categories relations
	if len(categoryIDs) > 0 {
		catQuery := `INSERT INTO movie_categories (movie_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`
		stmt, err := tx.PrepareContext(ctx, catQuery)
		if err != nil {
			return err
		}
		defer stmt.Close()

		for _, catID := range categoryIDs {
			if catID != "" {
				if _, err := stmt.ExecContext(ctx, m.ID, catID); err != nil {
					return err
				}
			}
		}
	}

	return tx.Commit()
}

func (r *MovieRepository) Update(ctx context.Context, m *domain.Movie, categoryIDs []string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
		UPDATE movies
		SET title = $1, slug = $2, synopsis = $3, release_year = $4, duration_seconds = $5,
		    rating = $6, age_rating = $7, poster_url = $8, backdrop_url = $9, trailer_url = $10,
		    video_source_url = $11, status = $12, is_featured = $13, updated_at = NOW()
		WHERE id = $14
		RETURNING updated_at
	`
	err = tx.QueryRowContext(ctx, query,
		m.Title, m.Slug, m.Synopsis, m.ReleaseYear, m.DurationSeconds,
		m.Rating, m.AgeRating, m.PosterURL, m.BackdropURL, m.TrailerURL,
		m.VideoSourceURL, m.Status, m.IsFeatured, m.ID,
	).Scan(&m.UpdatedAt)
	if err != nil {
		return err
	}

	if categoryIDs != nil {
		// Replace categories
		if _, err := tx.ExecContext(ctx, `DELETE FROM movie_categories WHERE movie_id = $1`, m.ID); err != nil {
			return err
		}
		if len(categoryIDs) > 0 {
			catQuery := `INSERT INTO movie_categories (movie_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`
			stmt, err := tx.PrepareContext(ctx, catQuery)
			if err != nil {
				return err
			}
			defer stmt.Close()
			for _, catID := range categoryIDs {
				if catID != "" {
					if _, err := stmt.ExecContext(ctx, m.ID, catID); err != nil {
						return err
					}
				}
			}
		}
	}

	return tx.Commit()
}

func (r *MovieRepository) Publish(ctx context.Context, id string) error {
	query := `UPDATE movies SET status = 'PUBLISHED', published_at = NOW(), updated_at = NOW() WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *MovieRepository) Unpublish(ctx context.Context, id string) error {
	query := `UPDATE movies SET status = 'READY', updated_at = NOW() WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *MovieRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM movies WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *MovieRepository) IncrementViews(ctx context.Context, id string) error {
	query := `UPDATE movies SET views_count = views_count + 1 WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *MovieRepository) FindByID(ctx context.Context, id string) (*domain.Movie, error) {
	return r.fetchSingle(ctx, "m.id = $1", id)
}

func (r *MovieRepository) FindBySlug(ctx context.Context, slug string) (*domain.Movie, error) {
	return r.fetchSingle(ctx, "m.slug = $1", slug)
}

func (r *MovieRepository) FindByIDOrSlug(ctx context.Context, idOrSlug string) (*domain.Movie, error) {
	return r.fetchSingle(ctx, "m.id::text = $1 OR m.slug = $1", idOrSlug)
}

func (r *MovieRepository) fetchSingle(ctx context.Context, condition string, arg interface{}) (*domain.Movie, error) {
	query := fmt.Sprintf(`
		SELECT m.id, m.title, m.slug, m.synopsis, m.release_year, m.duration_seconds,
		       m.rating, m.age_rating, m.poster_url, m.backdrop_url, m.trailer_url,
		       m.video_source_url, m.status, m.is_featured, m.views_count,
		       m.created_by, m.published_at, m.created_at, m.updated_at
		FROM movies m
		WHERE %s
	`, condition)

	var m domain.Movie
	var createdBy sql.NullString
	var publishedAt sql.NullTime

	err := r.db.QueryRowContext(ctx, query, arg).Scan(
		&m.ID, &m.Title, &m.Slug, &m.Synopsis, &m.ReleaseYear, &m.DurationSeconds,
		&m.Rating, &m.AgeRating, &m.PosterURL, &m.BackdropURL, &m.TrailerURL,
		&m.VideoSourceURL, &m.Status, &m.IsFeatured, &m.ViewsCount,
		&createdBy, &publishedAt, &m.CreatedAt, &m.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	if createdBy.Valid {
		m.CreatedBy = &createdBy.String
	}
	if publishedAt.Valid {
		m.PublishedAt = &publishedAt.Time
	}

	// Fetch Categories
	catQuery := `
		SELECT c.id, c.name, c.slug, c.description, c.status, c.created_at, c.updated_at
		FROM categories c
		JOIN movie_categories mc ON mc.category_id = c.id
		WHERE mc.movie_id = $1
		ORDER BY c.name ASC
	`
	catRows, err := r.db.QueryContext(ctx, catQuery, m.ID)
	if err == nil {
		defer catRows.Close()
		for catRows.Next() {
			var c domain.Category
			if err := catRows.Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.Status, &c.CreatedAt, &c.UpdatedAt); err == nil {
				m.Categories = append(m.Categories, c)
			}
		}
	}

	// Fetch Assets
	assetQuery := `
		SELECT id, movie_id, type, resolution, codec, bitrate, url, status, created_at
		FROM media_assets
		WHERE movie_id = $1
		ORDER BY CASE 
			WHEN resolution = '4K' THEN 1
			WHEN resolution = '1080p' THEN 2
			WHEN resolution = '720p' THEN 3
			WHEN resolution = '480p' THEN 4
			ELSE 5 END
	`
	assetRows, err := r.db.QueryContext(ctx, assetQuery, m.ID)
	if err == nil {
		defer assetRows.Close()
		for assetRows.Next() {
			var a domain.MediaAsset
			if err := assetRows.Scan(&a.ID, &a.MovieID, &a.Type, &a.Resolution, &a.Codec, &a.Bitrate, &a.URL, &a.Status, &a.CreatedAt); err == nil {
				m.Assets = append(m.Assets, a)
			}
		}
	}

	// Fetch Subtitles
	subQuery := `
		SELECT id, movie_id, language_code, label, file_url, is_default, status, created_at, updated_at
		FROM subtitles
		WHERE movie_id = $1 AND status = 'ACTIVE'
		ORDER BY is_default DESC, label ASC
	`
	subRows, err := r.db.QueryContext(ctx, subQuery, m.ID)
	if err == nil {
		defer subRows.Close()
		for subRows.Next() {
			var s domain.Subtitle
			if err := subRows.Scan(&s.ID, &s.MovieID, &s.LanguageCode, &s.Label, &s.FileURL, &s.IsDefault, &s.Status, &s.CreatedAt, &s.UpdatedAt); err == nil {
				m.Subtitles = append(m.Subtitles, s)
			}
		}
	}

	return &m, nil
}

func (r *MovieRepository) List(ctx context.Context, search, categorySlug, status, sortBy string, isFeatured *bool, limit, offset int) ([]domain.Movie, int, error) {
	var conditions []string
	var args []interface{}
	argIdx := 1

	if search != "" {
		conditions = append(conditions, fmt.Sprintf("(LOWER(m.title) LIKE $%d OR LOWER(m.synopsis) LIKE $%d)", argIdx, argIdx))
		args = append(args, "%"+strings.ToLower(search)+"%")
		argIdx++
	}

	if status != "" {
		conditions = append(conditions, fmt.Sprintf("m.status = $%d", argIdx))
		args = append(args, status)
		argIdx++
	}

	if isFeatured != nil {
		conditions = append(conditions, fmt.Sprintf("m.is_featured = $%d", argIdx))
		args = append(args, *isFeatured)
		argIdx++
	}

	if categorySlug != "" {
		conditions = append(conditions, fmt.Sprintf(`EXISTS (
			SELECT 1 FROM movie_categories mc
			JOIN categories c ON c.id = mc.category_id
			WHERE mc.movie_id = m.id AND c.slug = $%d
		)`, argIdx))
		args = append(args, categorySlug)
		argIdx++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// Count Query
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM movies m %s", whereClause)
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// Order by
	orderClause := "ORDER BY m.created_at DESC"
	switch sortBy {
	case "popular":
		orderClause = "ORDER BY m.views_count DESC, m.rating DESC"
	case "rating":
		orderClause = "ORDER BY m.rating DESC, m.views_count DESC"
	case "year":
		orderClause = "ORDER BY m.release_year DESC, m.created_at DESC"
	case "title":
		orderClause = "ORDER BY m.title ASC"
	case "latest":
		orderClause = "ORDER BY COALESCE(m.published_at, m.created_at) DESC"
	}

	query := fmt.Sprintf(`
		SELECT m.id, m.title, m.slug, m.synopsis, m.release_year, m.duration_seconds,
		       m.rating, m.age_rating, m.poster_url, m.backdrop_url, m.trailer_url,
		       m.video_source_url, m.status, m.is_featured, m.views_count,
		       m.created_by, m.published_at, m.created_at, m.updated_at
		FROM movies m
		%s
		%s
		LIMIT $%d OFFSET $%d
	`, whereClause, orderClause, argIdx, argIdx+1)

	args = append(args, limit, offset)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var movies []domain.Movie
	for rows.Next() {
		var m domain.Movie
		var createdBy sql.NullString
		var publishedAt sql.NullTime

		if err := rows.Scan(
			&m.ID, &m.Title, &m.Slug, &m.Synopsis, &m.ReleaseYear, &m.DurationSeconds,
			&m.Rating, &m.AgeRating, &m.PosterURL, &m.BackdropURL, &m.TrailerURL,
			&m.VideoSourceURL, &m.Status, &m.IsFeatured, &m.ViewsCount,
			&createdBy, &publishedAt, &m.CreatedAt, &m.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		if createdBy.Valid {
			m.CreatedBy = &createdBy.String
		}
		if publishedAt.Valid {
			m.PublishedAt = &publishedAt.Time
		}

		// Quick fetch categories for card display
		catRows, err := r.db.QueryContext(ctx, `
			SELECT c.id, c.name, c.slug, c.description, c.status, c.created_at, c.updated_at
			FROM categories c
			JOIN movie_categories mc ON mc.category_id = c.id
			WHERE mc.movie_id = $1
		`, m.ID)
		if err == nil {
			for catRows.Next() {
				var c domain.Category
				if err := catRows.Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.Status, &c.CreatedAt, &c.UpdatedAt); err == nil {
					m.Categories = append(m.Categories, c)
				}
			}
			catRows.Close()
		}

		movies = append(movies, m)
	}

	return movies, total, nil
}
