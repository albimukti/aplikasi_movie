package repository

import (
	"context"
	"database/sql"
	"errors"

	"moviehub-backend/internal/domain"
)

type RefreshTokenRepository struct {
	db *sql.DB
}

func NewRefreshTokenRepository(db *sql.DB) *RefreshTokenRepository {
	return &RefreshTokenRepository{db: db}
}

func (r *RefreshTokenRepository) Save(ctx context.Context, token *domain.RefreshToken) error {
	query := `
		INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at)
		VALUES ($1, $2, $3, NOW())
		RETURNING id, created_at
	`
	return r.db.QueryRowContext(ctx, query, token.UserID, token.TokenHash, token.ExpiresAt).
		Scan(&token.ID, &token.CreatedAt)
}

func (r *RefreshTokenRepository) FindValid(ctx context.Context, tokenHash string) (*domain.RefreshToken, error) {
	query := `
		SELECT id, user_id, token_hash, expires_at, revoked_at, created_at
		FROM refresh_tokens
		WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()
	`
	var t domain.RefreshToken
	var revokedAt sql.NullTime
	err := r.db.QueryRowContext(ctx, query, tokenHash).Scan(
		&t.ID, &t.UserID, &t.TokenHash, &t.ExpiresAt, &revokedAt, &t.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	if revokedAt.Valid {
		t.RevokedAt = &revokedAt.Time
	}
	return &t, nil
}

func (r *RefreshTokenRepository) Revoke(ctx context.Context, tokenHash string) error {
	query := `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1`
	_, err := r.db.ExecContext(ctx, query, tokenHash)
	return err
}

func (r *RefreshTokenRepository) RevokeAllUserTokens(ctx context.Context, userID string) error {
	query := `UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1`
	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}
