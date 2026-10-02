package repository

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"moviehub-backend/internal/domain"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, u *domain.User) error {
	if u.Username == "" {
		u.Username = strings.Split(u.Email, "@")[0]
	}
	query := `
		INSERT INTO users (id, username, email, password_hash, name, role, status, avatar_url, created_at, updated_at)
		VALUES (COALESCE(NULLIF($1, '')::uuid, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRowContext(ctx, query, u.ID, u.Username, u.Email, u.PasswordHash, u.Name, u.Role, u.Status, u.AvatarURL).
		Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)
}

func (r *UserRepository) FindByEmail(ctx context.Context, identifier string) (*domain.User, error) {
	return r.FindByEmailOrUsername(ctx, identifier)
}

func (r *UserRepository) FindByEmailOrUsername(ctx context.Context, identifier string) (*domain.User, error) {
	query := `
		SELECT id, COALESCE(username, split_part(email, '@', 1)), email, password_hash, name, role, status, avatar_url, last_login_at, created_at, updated_at
		FROM users
		WHERE LOWER(email) = LOWER($1) OR (username IS NOT NULL AND LOWER(username) = LOWER($1))
		LIMIT 1
	`
	var u domain.User
	var lastLogin sql.NullTime
	err := r.db.QueryRowContext(ctx, query, identifier).Scan(
		&u.ID, &u.Username, &u.Email, &u.PasswordHash, &u.Name, &u.Role, &u.Status, &u.AvatarURL, &lastLogin, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	if lastLogin.Valid {
		u.LastLoginAt = &lastLogin.Time
	}
	return &u, nil
}

func (r *UserRepository) FindByID(ctx context.Context, id string) (*domain.User, error) {
	query := `
		SELECT id, COALESCE(username, split_part(email, '@', 1)), email, password_hash, name, role, status, avatar_url, last_login_at, created_at, updated_at
		FROM users
		WHERE id = $1
	`
	var u domain.User
	var lastLogin sql.NullTime
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&u.ID, &u.Username, &u.Email, &u.PasswordHash, &u.Name, &u.Role, &u.Status, &u.AvatarURL, &lastLogin, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	if lastLogin.Valid {
		u.LastLoginAt = &lastLogin.Time
	}
	return &u, nil
}

func (r *UserRepository) UpdateLastLogin(ctx context.Context, id string) error {
	query := `UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *UserRepository) Update(ctx context.Context, u *domain.User) error {
	if u.Username == "" {
		u.Username = strings.Split(u.Email, "@")[0]
	}
	query := `
		UPDATE users
		SET username = $1, name = $2, role = $3, status = $4, avatar_url = $5, updated_at = NOW()
		WHERE id = $6
		RETURNING updated_at
	`
	return r.db.QueryRowContext(ctx, query, u.Username, u.Name, u.Role, u.Status, u.AvatarURL, u.ID).Scan(&u.UpdatedAt)
}

func (r *UserRepository) UpdatePassword(ctx context.Context, id, passwordHash string) error {
	query := `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, passwordHash, id)
	return err
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *UserRepository) List(ctx context.Context, search, role, status string, limit, offset int) ([]domain.User, int, error) {
	countQuery := `
		SELECT COUNT(*) FROM users
		WHERE ($1 = '' OR LOWER(name) LIKE '%' || LOWER($1) || '%' OR LOWER(email) LIKE '%' || LOWER($1) || '%' OR (username IS NOT NULL AND LOWER(username) LIKE '%' || LOWER($1) || '%'))
		  AND ($2 = '' OR role = $2)
		  AND ($3 = '' OR status = $3)
	`
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, search, role, status).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `
		SELECT id, COALESCE(username, split_part(email, '@', 1)), email, name, role, status, avatar_url, last_login_at, created_at, updated_at
		FROM users
		WHERE ($1 = '' OR LOWER(name) LIKE '%' || LOWER($1) || '%' OR LOWER(email) LIKE '%' || LOWER($1) || '%' OR (username IS NOT NULL AND LOWER(username) LIKE '%' || LOWER($1) || '%'))
		  AND ($2 = '' OR role = $2)
		  AND ($3 = '' OR status = $3)
		ORDER BY created_at DESC
		LIMIT $4 OFFSET $5
	`
	rows, err := r.db.QueryContext(ctx, query, search, role, status, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var users []domain.User
	for rows.Next() {
		var u domain.User
		var lastLogin sql.NullTime
		if err := rows.Scan(&u.ID, &u.Username, &u.Email, &u.Name, &u.Role, &u.Status, &u.AvatarURL, &lastLogin, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, 0, err
		}
		if lastLogin.Valid {
			u.LastLoginAt = &lastLogin.Time
		}
		users = append(users, u)
	}

	return users, total, nil
}
