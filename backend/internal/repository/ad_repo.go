package repository

import (
	"context"
	"database/sql"
	"errors"

	"moviehub-backend/internal/domain"
)

type AdRepository struct {
	db *sql.DB
}

func NewAdRepository(db *sql.DB) *AdRepository {
	return &AdRepository{db: db}
}

// GetDecision picks the highest priority active ad campaign and a creative for pre-roll
func (r *AdRepository) GetDecision(ctx context.Context) (*domain.AdCampaign, *domain.AdCreative, error) {
	queryCamp := `
		SELECT id, name, status, start_at, end_at, priority, frequency_rule, created_at, updated_at
		FROM ad_campaigns
		WHERE status = 'ACTIVE' 
		  AND start_at <= NOW() 
		  AND (end_at IS NULL OR end_at >= NOW())
		ORDER BY priority DESC, created_at DESC
		LIMIT 1
	`
	var camp domain.AdCampaign
	var endAt sql.NullTime
	err := r.db.QueryRowContext(ctx, queryCamp).Scan(
		&camp.ID, &camp.Name, &camp.Status, &camp.StartAt, &endAt,
		&camp.Priority, &camp.FrequencyRule, &camp.CreatedAt, &camp.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil, nil
		}
		return nil, nil, err
	}
	if endAt.Valid {
		camp.EndAt = &endAt.Time
	}

	queryCreative := `
		SELECT id, campaign_id, type, title, media_url, target_url, duration_seconds, skip_after_seconds, created_at
		FROM ad_creatives
		WHERE campaign_id = $1 AND type = 'PRE_ROLL'
		ORDER BY RANDOM()
		LIMIT 1
	`
	var cr domain.AdCreative
	err = r.db.QueryRowContext(ctx, queryCreative, camp.ID).Scan(
		&cr.ID, &cr.CampaignID, &cr.Type, &cr.Title, &cr.MediaURL,
		&cr.TargetURL, &cr.DurationSeconds, &cr.SkipAfterSeconds, &cr.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return &camp, nil, nil
		}
		return nil, nil, err
	}

	return &camp, &cr, nil
}

func (r *AdRepository) RecordEvent(ctx context.Context, ev *domain.AdEvent) error {
	query := `
		INSERT INTO ad_events (id, session_id, campaign_id, creative_id, user_id, event_type, occurred_at)
		VALUES (gen_random_uuid(), $1, $2, $3, NULLIF($4, '')::uuid, $5, NOW())
		RETURNING id, occurred_at
	`
	userIDStr := ""
	if ev.UserID != nil {
		userIDStr = *ev.UserID
	}
	return r.db.QueryRowContext(ctx, query,
		ev.SessionID, ev.CampaignID, ev.CreativeID, userIDStr, ev.EventType,
	).Scan(&ev.ID, &ev.OccurredAt)
}

func (r *AdRepository) ListCampaigns(ctx context.Context) ([]domain.AdCampaign, error) {
	query := `
		SELECT id, name, status, start_at, end_at, priority, frequency_rule, created_at, updated_at
		FROM ad_campaigns
		ORDER BY priority DESC, created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var campaigns []domain.AdCampaign
	for rows.Next() {
		var c domain.AdCampaign
		var endAt sql.NullTime
		if err := rows.Scan(
			&c.ID, &c.Name, &c.Status, &c.StartAt, &endAt,
			&c.Priority, &c.FrequencyRule, &c.CreatedAt, &c.UpdatedAt,
		); err != nil {
			return nil, err
		}
		if endAt.Valid {
			c.EndAt = &endAt.Time
		}

		// Fetch creatives
		crRows, err := r.db.QueryContext(ctx, `
			SELECT id, campaign_id, type, title, media_url, target_url, duration_seconds, skip_after_seconds, created_at
			FROM ad_creatives
			WHERE campaign_id = $1
		`, c.ID)
		if err == nil {
			for crRows.Next() {
				var cr domain.AdCreative
				if err := crRows.Scan(
					&cr.ID, &cr.CampaignID, &cr.Type, &cr.Title, &cr.MediaURL,
					&cr.TargetURL, &cr.DurationSeconds, &cr.SkipAfterSeconds, &cr.CreatedAt,
				); err == nil {
					c.Creatives = append(c.Creatives, cr)
				}
			}
			crRows.Close()
		}

		campaigns = append(campaigns, c)
	}

	return campaigns, nil
}

func (r *AdRepository) CreateCampaign(ctx context.Context, c *domain.AdCampaign, cr *domain.AdCreative) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO ad_campaigns (id, name, status, start_at, end_at, priority, frequency_rule, created_at, updated_at)
		VALUES (COALESCE(NULLIF($1, '')::uuid, gen_random_uuid()), $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	err = tx.QueryRowContext(ctx, query,
		c.ID, c.Name, c.Status, c.StartAt, c.EndAt, c.Priority, c.FrequencyRule,
	).Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return err
	}

	if cr != nil {
		crQuery := `
			INSERT INTO ad_creatives (id, campaign_id, type, title, media_url, target_url, duration_seconds, skip_after_seconds, created_at)
			VALUES (COALESCE(NULLIF($1, '')::uuid, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8, NOW())
			RETURNING id, created_at
		`
		err = tx.QueryRowContext(ctx, crQuery,
			cr.ID, c.ID, cr.Type, cr.Title, cr.MediaURL, cr.TargetURL, cr.DurationSeconds, cr.SkipAfterSeconds,
		).Scan(&cr.ID, &cr.CreatedAt)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *AdRepository) DeleteCampaign(ctx context.Context, id string) error {
	query := `DELETE FROM ad_campaigns WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *AdRepository) UpdateStatus(ctx context.Context, id, status string) error {
	query := `UPDATE ad_campaigns SET status = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, status, id)
	return err
}

func (r *AdRepository) GetStats(ctx context.Context) (map[string]interface{}, error) {
	query := `
		SELECT 
			COUNT(*) as total_events,
			COUNT(*) FILTER (WHERE event_type = 'impression') as impressions,
			COUNT(*) FILTER (WHERE event_type = 'completed') as completions,
			COUNT(*) FILTER (WHERE event_type = 'skip') as skips,
			COUNT(*) FILTER (WHERE event_type = 'click') as clicks
		FROM ad_events
	`
	var total, imp, comp, skip, click int64
	err := r.db.QueryRowContext(ctx, query).Scan(&total, &imp, &comp, &skip, &click)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"total_events": total,
		"impressions":  imp,
		"completions":  comp,
		"skips":        skip,
		"clicks":       click,
	}, nil
}
