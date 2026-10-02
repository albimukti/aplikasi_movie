package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/pkg/cache"
	"moviehub-backend/internal/repository"
)

type CategoryService struct {
	repo      *repository.CategoryRepository
	auditRepo *repository.AuditRepository
	cache     *cache.Cache
}

func NewCategoryService(repo *repository.CategoryRepository, auditRepo *repository.AuditRepository, c *cache.Cache) *CategoryService {
	return &CategoryService{
		repo:      repo,
		auditRepo: auditRepo,
		cache:     c,
	}
}

func (s *CategoryService) ListAll(ctx context.Context, onlyActive bool) ([]domain.Category, error) {
	cacheKey := fmt.Sprintf("categories:list:active_%t", onlyActive)
	if val, ok := s.cache.Get(ctx, cacheKey); ok {
		var cats []domain.Category
		if err := json.Unmarshal([]byte(val), &cats); err == nil {
			return cats, nil
		}
	}

	cats, err := s.repo.ListAll(ctx, onlyActive)
	if err != nil {
		return nil, err
	}

	if data, err := json.Marshal(cats); err == nil {
		_ = s.cache.Set(ctx, cacheKey, string(data), 10*time.Minute)
	}

	return cats, nil
}

func (s *CategoryService) Create(ctx context.Context, actor *domain.User, name, description string) (*domain.Category, error) {
	slug := generateSlug(name)
	c := &domain.Category{
		Name:        name,
		Slug:        slug,
		Description: description,
		Status:      domain.UserStatusActive,
	}

	if err := s.repo.Create(ctx, c); err != nil {
		return nil, err
	}

	s.invalidateCache(ctx)

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "CREATE_CATEGORY",
			Resource:  "CATEGORY",
			ResourceID: c.ID,
			Metadata:  fmt.Sprintf(`{"name": "%s", "slug": "%s"}`, c.Name, c.Slug),
		})
	}

	return c, nil
}

func (s *CategoryService) Update(ctx context.Context, actor *domain.User, id, name, description, status string) (*domain.Category, error) {
	c, err := s.repo.FindByID(ctx, id)
	if err != nil || c == nil {
		return nil, errors.New("category not found")
	}

	if name != "" {
		c.Name = name
		c.Slug = generateSlug(name)
	}
	if description != "" {
		c.Description = description
	}
	if status != "" {
		c.Status = status
	}

	if err := s.repo.Update(ctx, c); err != nil {
		return nil, err
	}

	s.invalidateCache(ctx)

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "UPDATE_CATEGORY",
			Resource:  "CATEGORY",
			ResourceID: c.ID,
			Metadata:  fmt.Sprintf(`{"name": "%s", "status": "%s"}`, c.Name, c.Status),
		})
	}

	return c, nil
}

func (s *CategoryService) Delete(ctx context.Context, actor *domain.User, id string) error {
	c, err := s.repo.FindByID(ctx, id)
	if err != nil || c == nil {
		return errors.New("category not found")
	}

	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}

	s.invalidateCache(ctx)

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "DELETE_CATEGORY",
			Resource:  "CATEGORY",
			ResourceID: id,
			Metadata:  fmt.Sprintf(`{"name": "%s"}`, c.Name),
		})
	}

	return nil
}

func (s *CategoryService) invalidateCache(ctx context.Context) {
	_ = s.cache.Del(ctx, "categories:list:active_true")
	_ = s.cache.Del(ctx, "categories:list:active_false")
}

func generateSlug(text string) string {
	s := strings.ToLower(strings.TrimSpace(text))
	var b strings.Builder
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
		} else if r == ' ' || r == '-' || r == '_' {
			b.WriteRune('-')
		}
	}
	result := b.String()
	for strings.Contains(result, "--") {
		result = strings.ReplaceAll(result, "--", "-")
	}
	return strings.Trim(result, "-")
}
