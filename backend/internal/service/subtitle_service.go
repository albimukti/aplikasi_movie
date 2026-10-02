package service

import (
	"context"
	"errors"
	"fmt"

	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/repository"
)

type SubtitleService struct {
	repo      *repository.SubtitleRepository
	auditRepo *repository.AuditRepository
}

func NewSubtitleService(repo *repository.SubtitleRepository, auditRepo *repository.AuditRepository) *SubtitleService {
	return &SubtitleService{
		repo:      repo,
		auditRepo: auditRepo,
	}
}

func (s *SubtitleService) ListForMovie(ctx context.Context, movieID string, onlyActive bool) ([]domain.Subtitle, error) {
	return s.repo.ListByMovieID(ctx, movieID, onlyActive)
}

func (s *SubtitleService) Create(ctx context.Context, actor *domain.User, movieID, langCode, label, fileURL string, isDefault bool) (*domain.Subtitle, error) {
	sub := &domain.Subtitle{
		MovieID:      movieID,
		LanguageCode: langCode,
		Label:        label,
		FileURL:      fileURL,
		IsDefault:    isDefault,
		Status:       "ACTIVE",
	}

	if err := s.repo.Create(ctx, sub); err != nil {
		return nil, err
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "CREATE_SUBTITLE",
			Resource:  "SUBTITLE",
			ResourceID: sub.ID,
			Metadata:  fmt.Sprintf(`{"movie_id": "%s", "lang": "%s"}`, movieID, langCode),
		})
	}

	return sub, nil
}

func (s *SubtitleService) Update(ctx context.Context, actor *domain.User, id, label, status string, isDefault bool) error {
	sub, err := s.repo.FindByID(ctx, id)
	if err != nil || sub == nil {
		return errors.New("subtitle not found")
	}

	if err := s.repo.Update(ctx, id, label, status, isDefault); err != nil {
		return err
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "UPDATE_SUBTITLE",
			Resource:  "SUBTITLE",
			ResourceID: id,
		})
	}

	return nil
}

func (s *SubtitleService) Delete(ctx context.Context, actor *domain.User, id string) error {
	sub, err := s.repo.FindByID(ctx, id)
	if err != nil || sub == nil {
		return errors.New("subtitle not found")
	}

	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "DELETE_SUBTITLE",
			Resource:  "SUBTITLE",
			ResourceID: id,
		})
	}

	return nil
}
