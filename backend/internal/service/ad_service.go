package service

import (
	"context"
	"fmt"
	"time"

	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/pkg/cache"
	"moviehub-backend/internal/repository"
	"github.com/google/uuid"
)

type AdService struct {
	adRepo    *repository.AdRepository
	auditRepo *repository.AuditRepository
	cache     *cache.Cache
}

func NewAdService(adRepo *repository.AdRepository, auditRepo *repository.AuditRepository, c *cache.Cache) *AdService {
	return &AdService{
		adRepo:    adRepo,
		auditRepo: auditRepo,
		cache:     c,
	}
}

type AdDecisionResponse struct {
	HasAd            bool               `json:"has_ad"`
	SessionID        string             `json:"session_id"`
	CampaignID       string             `json:"campaign_id,omitempty"`
	CreativeID       string             `json:"creative_id,omitempty"`
	Title            string             `json:"title,omitempty"`
	MediaURL         string             `json:"media_url,omitempty"`
	TargetURL        string             `json:"target_url,omitempty"`
	DurationSeconds  int                `json:"duration_seconds,omitempty"`
	SkipAfterSeconds int                `json:"skip_after_seconds,omitempty"`
}

func (s *AdService) GetDecision(ctx context.Context, userOrDeviceID string) (*AdDecisionResponse, error) {
	campaign, creative, err := s.adRepo.GetDecision(ctx)
	if err != nil || campaign == nil || creative == nil {
		return &AdDecisionResponse{
			HasAd:     false,
			SessionID: uuid.New().String(),
		}, nil
	}

	// Check frequency rule with Redis/Cache
	if userOrDeviceID != "" && campaign.FrequencyRule > 1 {
		freqKey := fmt.Sprintf("ad:freq:%s:%s", userOrDeviceID, campaign.ID)
		count, _ := s.cache.Incr(ctx, freqKey, 2*time.Hour)
		if count%int64(campaign.FrequencyRule) != 1 {
			// Skip ad based on frequency cap
			return &AdDecisionResponse{
				HasAd:     false,
				SessionID: uuid.New().String(),
			}, nil
		}
	}

	sessionID := uuid.New().String()

	return &AdDecisionResponse{
		HasAd:            true,
		SessionID:        sessionID,
		CampaignID:       campaign.ID,
		CreativeID:       creative.ID,
		Title:            creative.Title,
		MediaURL:         creative.MediaURL,
		TargetURL:        creative.TargetURL,
		DurationSeconds:  creative.DurationSeconds,
		SkipAfterSeconds: creative.SkipAfterSeconds,
	}, nil
}

func (s *AdService) TrackEvent(ctx context.Context, sessionID, campaignID, creativeID, eventType string, userID *string) error {
	ev := &domain.AdEvent{
		SessionID:  sessionID,
		CampaignID: campaignID,
		CreativeID: creativeID,
		EventType:  eventType,
		UserID:     userID,
	}
	return s.adRepo.RecordEvent(ctx, ev)
}

func (s *AdService) ListCampaigns(ctx context.Context) ([]domain.AdCampaign, error) {
	return s.adRepo.ListCampaigns(ctx)
}

func (s *AdService) CreateCampaign(ctx context.Context, actor *domain.User, name string, priority, frequencyRule, duration, skipAfter int, title, mediaURL, targetURL string) (*domain.AdCampaign, error) {
	camp := &domain.AdCampaign{
		Name:          name,
		Status:        "ACTIVE",
		StartAt:       time.Now(),
		Priority:      priority,
		FrequencyRule: frequencyRule,
	}

	creative := &domain.AdCreative{
		Type:             "PRE_ROLL",
		Title:            title,
		MediaURL:         mediaURL,
		TargetURL:        targetURL,
		DurationSeconds:  duration,
		SkipAfterSeconds: skipAfter,
	}

	if err := s.adRepo.CreateCampaign(ctx, camp, creative); err != nil {
		return nil, err
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "CREATE_AD_CAMPAIGN",
			Resource:  "AD_CAMPAIGN",
			ResourceID: camp.ID,
			Metadata:  fmt.Sprintf(`{"name": "%s"}`, camp.Name),
		})
	}

	return camp, nil
}

func (s *AdService) UpdateStatus(ctx context.Context, actor *domain.User, id, status string) error {
	err := s.adRepo.UpdateStatus(ctx, id, status)
	if err != nil {
		return err
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "UPDATE_AD_CAMPAIGN",
			Resource:  "AD_CAMPAIGN",
			ResourceID: id,
			Metadata:  fmt.Sprintf(`{"status": "%s"}`, status),
		})
	}

	return nil
}

func (s *AdService) DeleteCampaign(ctx context.Context, actor *domain.User, id string) error {
	err := s.adRepo.DeleteCampaign(ctx, id)
	if err != nil {
		return err
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "DELETE_AD_CAMPAIGN",
			Resource:  "AD_CAMPAIGN",
			ResourceID: id,
		})
	}

	return nil
}

func (s *AdService) GetStats(ctx context.Context) (map[string]interface{}, error) {
	return s.adRepo.GetStats(ctx)
}
