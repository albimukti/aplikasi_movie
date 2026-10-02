package service

import (
	"context"
	"errors"
	"fmt"

	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	userRepo  *repository.UserRepository
	auditRepo *repository.AuditRepository
}

func NewUserService(userRepo *repository.UserRepository, auditRepo *repository.AuditRepository) *UserService {
	return &UserService{
		userRepo:  userRepo,
		auditRepo: auditRepo,
	}
}

func (s *UserService) ListUsers(ctx context.Context, search, role, status string, page, limit int) ([]domain.User, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit
	return s.userRepo.List(ctx, search, role, status, limit, offset)
}

func (s *UserService) CreateUser(ctx context.Context, actor *domain.User, name, email, password, role string) (*domain.User, error) {
	existing, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("email sudah terdaftar")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	u := &domain.User{
		Name:         name,
		Email:        email,
		PasswordHash: string(hash),
		Role:         role,
		Status:       domain.UserStatusActive,
		AvatarURL:    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80",
	}

	if err := s.userRepo.Create(ctx, u); err != nil {
		return nil, err
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "CREATE_USER",
			Resource:  "USER",
			ResourceID: u.ID,
			Metadata:  fmt.Sprintf(`{"email": "%s", "role": "%s"}`, u.Email, u.Role),
		})
	}

	return u, nil
}

func (s *UserService) UpdateUser(ctx context.Context, actor *domain.User, id, name, role, status string) (*domain.User, error) {
	u, err := s.userRepo.FindByID(ctx, id)
	if err != nil || u == nil {
		return nil, errors.New("user not found")
	}

	if name != "" {
		u.Name = name
	}
	if role != "" {
		u.Role = role
	}
	if status != "" {
		u.Status = status
	}

	if err := s.userRepo.Update(ctx, u); err != nil {
		return nil, err
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "UPDATE_USER",
			Resource:  "USER",
			ResourceID: u.ID,
			Metadata:  fmt.Sprintf(`{"role": "%s", "status": "%s"}`, u.Role, u.Status),
		})
	}

	return u, nil
}

func (s *UserService) DeleteUser(ctx context.Context, actor *domain.User, id string) error {
	u, err := s.userRepo.FindByID(ctx, id)
	if err != nil || u == nil {
		return errors.New("user not found")
	}

	if err := s.userRepo.Delete(ctx, id); err != nil {
		return err
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "DELETE_USER",
			Resource:  "USER",
			ResourceID: id,
			Metadata:  fmt.Sprintf(`{"deleted_email": "%s"}`, u.Email),
		})
	}

	return nil
}
