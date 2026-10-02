package repository

import (
	"context"
	"database/sql"
	"errors"

	"moviehub-backend/internal/domain"
)

type CategoryRepository struct {
	db *sql.DB
}

func NewCategoryRepository(db *sql.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) Create(ctx context.Context, c *domain.Category) error {
	query := `
		INSERT INTO categories (id, name, slug, description, status, created_at, updated_at)
		VALUES (COALESCE(NULLIF($1, '')::uuid, gen_random_uuid()), $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRowContext(ctx, query, c.ID, c.Name, c.Slug, c.Description, c.Status).
		Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
}

func (r *CategoryRepository) Update(ctx context.Context, c *domain.Category) error {
	query := `
		UPDATE categories
		SET name = $1, slug = $2, description = $3, status = $4, updated_at = NOW()
		WHERE id = $5
		RETURNING updated_at
	`
	return r.db.QueryRowContext(ctx, query, c.Name, c.Slug, c.Description, c.Status, c.ID).Scan(&c.UpdatedAt)
}

func (r *CategoryRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM categories WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *CategoryRepository) FindByID(ctx context.Context, id string) (*domain.Category, error) {
	query := `
		SELECT c.id, c.name, c.slug, c.description, c.status, c.created_at, c.updated_at,
		       (SELECT COUNT(*) FROM movie_categories mc WHERE mc.category_id = c.id) as movie_count
		FROM categories c
		WHERE c.id = $1
	`
	var c domain.Category
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&c.ID, &c.Name, &c.Slug, &c.Description, &c.Status, &c.CreatedAt, &c.UpdatedAt, &c.MovieCount,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &c, nil
}

func (r *CategoryRepository) FindBySlug(ctx context.Context, slug string) (*domain.Category, error) {
	query := `
		SELECT c.id, c.name, c.slug, c.description, c.status, c.created_at, c.updated_at,
		       (SELECT COUNT(*) FROM movie_categories mc WHERE mc.category_id = c.id) as movie_count
		FROM categories c
		WHERE c.slug = $1
	`
	var c domain.Category
	err := r.db.QueryRowContext(ctx, query, slug).Scan(
		&c.ID, &c.Name, &c.Slug, &c.Description, &c.Status, &c.CreatedAt, &c.UpdatedAt, &c.MovieCount,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &c, nil
}

func (r *CategoryRepository) ListAll(ctx context.Context, onlyActive bool) ([]domain.Category, error) {
	query := `
		SELECT c.id, c.name, c.slug, c.description, c.status, c.created_at, c.updated_at,
		       (SELECT COUNT(*) FROM movie_categories mc 
		        JOIN movies m ON m.id = mc.movie_id 
		        WHERE mc.category_id = c.id AND ($1 = FALSE OR m.status = 'PUBLISHED')) as movie_count
		FROM categories c
		WHERE ($1 = FALSE OR c.status = 'ACTIVE')
		ORDER BY c.name ASC
	`
	rows, err := r.db.QueryContext(ctx, query, onlyActive)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []domain.Category
	for rows.Next() {
		var c domain.Category
		if err := rows.Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.Status, &c.CreatedAt, &c.UpdatedAt, &c.MovieCount); err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}

	return categories, nil
}
