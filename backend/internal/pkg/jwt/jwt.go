package jwt

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type CustomClaims struct {
	Sub         string   `json:"sub"`
	Role        string   `json:"role"`
	Email       string   `json:"email"`
	Name        string   `json:"name"`
	Permissions []string `json:"permissions"`
	Jti         string   `json:"jti"`
	jwt.RegisteredClaims
}

type TokenService struct {
	secretKey     []byte
	accessExpiry  time.Duration
	refreshExpiry time.Duration
}

func NewTokenService(secretKey string, accessExpiry, refreshExpiry time.Duration) *TokenService {
	return &TokenService{
		secretKey:     []byte(secretKey),
		accessExpiry:  accessExpiry,
		refreshExpiry: refreshExpiry,
	}
}

func (s *TokenService) GenerateAccessToken(userID, role, email, name string, permissions []string) (string, error) {
	now := time.Now()
	jti := uuid.New().String()

	claims := CustomClaims{
		Sub:         userID,
		Role:        role,
		Email:       email,
		Name:        name,
		Permissions: permissions,
		Jti:         jti,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(s.accessExpiry)),
			ID:        jti,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secretKey)
}

func (s *TokenService) ValidateAccessToken(tokenStr string) (*CustomClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return s.secretKey, nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*CustomClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid or expired token")
	}

	return claims, nil
}

func (s *TokenService) GenerateRefreshToken() (string, string, time.Time) {
	rawToken := uuid.New().String() + "-" + uuid.New().String()
	hash := sha256.Sum256([]byte(rawToken))
	hashStr := hex.EncodeToString(hash[:])
	expiresAt := time.Now().Add(s.refreshExpiry)
	return rawToken, hashStr, expiresAt
}

func HashToken(rawToken string) string {
	hash := sha256.Sum256([]byte(rawToken))
	return hex.EncodeToString(hash[:])
}

// Map permissions according to PDF matrix
func GetPermissionsForRole(role string) []string {
	switch role {
	case "SUPERADMIN":
		return []string{
			"movie:create", "movie:read", "movie:update", "movie:delete", "movie:publish",
			"category:create", "category:read", "category:update", "category:delete",
			"media:upload", "media:transcode",
			"subtitle:create", "subtitle:update", "subtitle:delete",
			"ad:create", "ad:read", "ad:update", "ad:delete",
			"qris:manage", "user:manage", "audit:view", "system:configure",
		}
	case "ADMIN":
		return []string{
			"movie:create", "movie:read", "movie:update", "movie:delete", "movie:publish",
			"category:create", "category:read", "category:update", "category:delete",
			"media:upload", "media:transcode",
			"subtitle:create", "subtitle:update", "subtitle:delete",
			"audit:view",
		}
	default:
		return []string{
			"movie:read", "playback:stream",
		}
	}
}
