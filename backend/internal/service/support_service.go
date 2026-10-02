package service

import (
	"context"
	"fmt"

	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/repository"
)

type SupportService struct {
	repo      *repository.SupportRepository
	auditRepo *repository.AuditRepository
}

func NewSupportService(repo *repository.SupportRepository, auditRepo *repository.AuditRepository) *SupportService {
	return &SupportService{
		repo:      repo,
		auditRepo: auditRepo,
	}
}

func (s *SupportService) GetActive(ctx context.Context) (*domain.SupportQRIS, error) {
	return s.repo.GetActive(ctx)
}

func (s *SupportService) ListAll(ctx context.Context) ([]domain.SupportQRIS, error) {
	return s.repo.ListAll(ctx)
}

func (s *SupportService) CreateOrUpdate(ctx context.Context, actor *domain.User, title, description, qrisURL string, isActive bool) (*domain.SupportQRIS, error) {
	q := &domain.SupportQRIS{
		Title:       title,
		Description: description,
		QRISURL:     qrisURL,
		IsActive:    isActive,
	}

	if actor != nil {
		q.CreatedBy = &actor.ID
	}

	if err := s.repo.Create(ctx, q); err != nil {
		return nil, err
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "CREATE_QRIS",
			Resource:  "QRIS",
			ResourceID: q.ID,
			Metadata:  fmt.Sprintf(`{"title": "%s", "active": %t}`, q.Title, q.IsActive),
		})
	}

	return q, nil
}

func (s *SupportService) SetActive(ctx context.Context, actor *domain.User, id string) error {
	if err := s.repo.SetActive(ctx, id); err != nil {
		return err
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "ACTIVATE_QRIS",
			Resource:  "QRIS",
			ResourceID: id,
		})
	}

	return nil
}

func (s *SupportService) Delete(ctx context.Context, actor *domain.User, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "DELETE_QRIS",
			Resource:  "QRIS",
			ResourceID: id,
		})
	}

	return nil
}
