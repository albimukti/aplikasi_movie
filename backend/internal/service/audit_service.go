package service

import (
	"context"

	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/repository"
)

type AuditService struct {
	repo *repository.AuditRepository
}

func NewAuditService(repo *repository.AuditRepository) *AuditService {
	return &AuditService{repo: repo}
}

func (s *AuditService) ListLogs(ctx context.Context, page, limit int, contentOnly bool) ([]domain.AuditLog, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 15
	}
	offset := (page - 1) * limit
	return s.repo.List(ctx, limit, offset, contentOnly)
}
