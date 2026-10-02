package service

import (
	"context"
	"errors"
	"fmt"

	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/pkg/captcha"
	"moviehub-backend/internal/pkg/jwt"
	"moviehub-backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo   *repository.UserRepository
	tokenRepo  *repository.RefreshTokenRepository
	auditRepo  *repository.AuditRepository
	tokenSvc   *jwt.TokenService
	captchaMgr *captcha.Manager
}

func NewAuthService(
	userRepo *repository.UserRepository,
	tokenRepo *repository.RefreshTokenRepository,
	auditRepo *repository.AuditRepository,
	tokenSvc *jwt.TokenService,
	captchaMgr *captcha.Manager,
) *AuthService {
	return &AuthService{
		userRepo:   userRepo,
		tokenRepo:  tokenRepo,
		auditRepo:  auditRepo,
		tokenSvc:   tokenSvc,
		captchaMgr: captchaMgr,
	}
}

type AuthResponse struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	ExpiresIn    int          `json:"expires_in"` // seconds
	User         *domain.User `json:"user"`
	Permissions  []string     `json:"permissions"`
}

func (s *AuthService) GetCaptcha() (*captcha.CaptchaChallenge, error) {
	return s.captchaMgr.Generate()
}

func (s *AuthService) Login(ctx context.Context, identifier, password, captchaID, captchaCode, ip string) (*AuthResponse, error) {
	// 1. Verify CAPTCHA
	if captchaID != "" || captchaCode != "" {
		if !s.captchaMgr.Verify(captchaID, captchaCode) {
			return nil, errors.New("kode CAPTCHA tidak valid atau sudah kedaluwarsa")
		}
	}

	// 2. Find user by email or username
	user, err := s.userRepo.FindByEmailOrUsername(ctx, identifier)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("username/email atau password salah")
	}

	// 3. Check status
	if user.Status == domain.UserStatusSuspended {
		return nil, errors.New("akun Anda telah ditangguhkan (SUSPENDED). Hubungi SuperAdmin")
	}

	// 4. Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, errors.New("username/email atau password salah")
	}

	// 5. Update last login
	_ = s.userRepo.UpdateLastLogin(ctx, user.ID)

	// 6. Generate tokens
	permissions := jwt.GetPermissionsForRole(user.Role)
	accessToken, err := s.tokenSvc.GenerateAccessToken(user.ID, user.Role, user.Email, user.Name, permissions)
	if err != nil {
		return nil, fmt.Errorf("failed to sign access token: %w", err)
	}

	rawRefresh, tokenHash, exp := s.tokenSvc.GenerateRefreshToken()
	rt := &domain.RefreshToken{
		UserID:    user.ID,
		TokenHash: tokenHash,
		ExpiresAt: exp,
	}
	_ = s.tokenRepo.Save(ctx, rt)

	// 7. Audit log
	_ = s.auditRepo.Log(ctx, &domain.AuditLog{
		ActorID:   &user.ID,
		ActorName: user.Name,
		ActorRole: user.Role,
		Action:    "LOGIN",
		Resource:  "AUTH",
		Metadata:  fmt.Sprintf(`{"email": "%s"}`, user.Email),
		IPAddress: ip,
	})

	return &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: rawRefresh,
		ExpiresIn:    3600,
		User:         user,
		Permissions:  permissions,
	}, nil
}

func (s *AuthService) Register(ctx context.Context, name, email, password, ip string) (*AuthResponse, error) {
	existing, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("email sudah terdaftar di sistem")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &domain.User{
		Name:         name,
		Email:        email,
		PasswordHash: string(hash),
		Role:         domain.RoleViewer,
		Status:       domain.UserStatusActive,
		AvatarURL:    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80",
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	_ = s.auditRepo.Log(ctx, &domain.AuditLog{
		ActorID:   &user.ID,
		ActorName: user.Name,
		ActorRole: user.Role,
		Action:    "REGISTER",
		Resource:  "USER",
		ResourceID: user.ID,
		IPAddress: ip,
	})

	return s.Login(ctx, email, password, "", "", ip)
}

func (s *AuthService) Refresh(ctx context.Context, rawRefresh string) (*AuthResponse, error) {
	tokenHash := jwt.HashToken(rawRefresh)
	tokenRecord, err := s.tokenRepo.FindValid(ctx, tokenHash)
	if err != nil || tokenRecord == nil {
		return nil, errors.New("refresh token tidak valid atau telah kedaluwarsa")
	}

	// Revoke current token (rotation strategy)
	_ = s.tokenRepo.Revoke(ctx, tokenHash)

	user, err := s.userRepo.FindByID(ctx, tokenRecord.UserID)
	if err != nil || user == nil || user.Status != domain.UserStatusActive {
		return nil, errors.New("pengguna tidak aktif")
	}

	permissions := jwt.GetPermissionsForRole(user.Role)
	accessToken, err := s.tokenSvc.GenerateAccessToken(user.ID, user.Role, user.Email, user.Name, permissions)
	if err != nil {
		return nil, err
	}

	newRaw, newHash, exp := s.tokenSvc.GenerateRefreshToken()
	_ = s.tokenRepo.Save(ctx, &domain.RefreshToken{
		UserID:    user.ID,
		TokenHash: newHash,
		ExpiresAt: exp,
	})

	return &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: newRaw,
		ExpiresIn:    3600,
		User:         user,
		Permissions:  permissions,
	}, nil
}

func (s *AuthService) Logout(ctx context.Context, rawRefresh, userID string) error {
	if rawRefresh != "" {
		tokenHash := jwt.HashToken(rawRefresh)
		_ = s.tokenRepo.Revoke(ctx, tokenHash)
	}
	if userID != "" {
		_ = s.tokenRepo.RevokeAllUserTokens(ctx, userID)
	}
	return nil
}

func (s *AuthService) GetProfile(ctx context.Context, userID string) (*domain.User, error) {
	return s.userRepo.FindByID(ctx, userID)
}

func (s *AuthService) UpdateProfile(ctx context.Context, userID, name, avatarURL string) (*domain.User, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil || user == nil {
		return nil, errors.New("user not found")
	}

	user.Name = name
	if avatarURL != "" {
		user.AvatarURL = avatarURL
	}

	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}
