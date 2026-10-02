package service

import (
	"context"

	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/repository"
)

type ConfigService struct {
	repo      *repository.ConfigRepository
	auditRepo *repository.AuditRepository
}

func NewConfigService(repo *repository.ConfigRepository, auditRepo *repository.AuditRepository) *ConfigService {
	return &ConfigService{
		repo:      repo,
		auditRepo: auditRepo,
	}
}

func (s *ConfigService) ListConfigs(ctx context.Context) ([]domain.SystemConfig, error) {
	return s.repo.List(ctx)
}

func (s *ConfigService) UpdateConfig(ctx context.Context, actor *domain.User, key, value string) error {
	if err := s.repo.Update(ctx, key, value); err != nil {
		return err
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "UPDATE_SYSTEM_CONFIG",
			Resource:  "CONFIG",
			ResourceID: key,
		})
	}

	return nil
}
