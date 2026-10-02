package repository

import (
	"context"
	"database/sql"

	"moviehub-backend/internal/domain"
)

type AuditRepository struct {
	db *sql.DB
}

func NewAuditRepository(db *sql.DB) *AuditRepository {
	return &AuditRepository{db: db}
}

func (r *AuditRepository) Log(ctx context.Context, a *domain.AuditLog) error {
	query := `
		INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, resource, resource_id, metadata, ip_address, created_at)
		VALUES (gen_random_uuid(), NULLIF($1, '')::uuid, $2, $3, $4, $5, $6, $7::jsonb, $8, NOW())
		RETURNING id, created_at
	`
	actorIDStr := ""
	if a.ActorID != nil {
		actorIDStr = *a.ActorID
	}
	metaStr := "{}"
	if a.Metadata != "" {
		metaStr = a.Metadata
	}

	return r.db.QueryRowContext(ctx, query,
		actorIDStr, a.ActorName, a.ActorRole, a.Action, a.Resource, a.ResourceID, metaStr, a.IPAddress,
	).Scan(&a.ID, &a.CreatedAt)
}

func (r *AuditRepository) List(ctx context.Context, limit, offset int, contentOnly bool) ([]domain.AuditLog, int, error) {
	countQuery := `
		SELECT COUNT(*) FROM audit_logs
		WHERE ($1 = FALSE OR resource IN ('MOVIE', 'CATEGORY', 'MEDIA', 'SUBTITLE'))
	`
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, contentOnly).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `
		SELECT id, actor_id, actor_name, actor_role, action, resource, resource_id, metadata::text, ip_address, created_at
		FROM audit_logs
		WHERE ($1 = FALSE OR resource IN ('MOVIE', 'CATEGORY', 'MEDIA', 'SUBTITLE'))
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.QueryContext(ctx, query, contentOnly, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var logs []domain.AuditLog
	for rows.Next() {
		var a domain.AuditLog
		var actorID sql.NullString
		if err := rows.Scan(
			&a.ID, &actorID, &a.ActorName, &a.ActorRole, &a.Action,
			&a.Resource, &a.ResourceID, &a.Metadata, &a.IPAddress, &a.CreatedAt,
		); err != nil {
			return nil, 0, err
		}
		if actorID.Valid {
			a.ActorID = &actorID.String
		}
		logs = append(logs, a)
	}

	return logs, total, nil
}
