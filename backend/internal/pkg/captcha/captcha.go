package captcha

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"
	"strings"
	"time"

	"moviehub-backend/internal/pkg/cache"
	"github.com/google/uuid"
)

type CaptchaChallenge struct {
	ID       string `json:"captcha_id"`
	SVGImage string `json:"captcha_svg"`
	ExpiresIn int   `json:"expires_in"` // seconds
}

type Manager struct {
	cache *cache.Cache
}

func NewManager(c *cache.Cache) *Manager {
	return &Manager{cache: c}
}

// Generate creates a random alphanumeric challenge and renders it as an SVG
func (m *Manager) Generate() (*CaptchaChallenge, error) {
	chars := "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
	codeLen := 5
	var code strings.Builder
	for i := 0; i < codeLen; i++ {
		idx, err := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
		if err != nil {
			return nil, err
		}
		code.WriteByte(chars[idx.Int64()])
	}

	secretCode := code.String()
	id := uuid.New().String()

	// Store in cache for 5 minutes
	ctx := context.Background()
	cacheKey := "captcha:" + id
	_ = m.cache.Set(ctx, cacheKey, strings.ToUpper(secretCode), 5*time.Minute)

	svg := renderSVG(secretCode)

	return &CaptchaChallenge{
		ID:        id,
		SVGImage:  svg,
		ExpiresIn: 300,
	}, nil
}

// Verify validates that the submitted code matches the stored one
func (m *Manager) Verify(id string, answer string) bool {
	if id == "" || answer == "" {
		return false
	}
	ctx := context.Background()
	cacheKey := "captcha:" + id
	stored, found := m.cache.Get(ctx, cacheKey)
	if !found {
		return false
	}

	// Single use: delete after check
	_ = m.cache.Del(ctx, cacheKey)

	return strings.EqualFold(strings.TrimSpace(answer), strings.TrimSpace(stored))
}

func renderSVG(code string) string {
	width := 180
	height := 60
	colors := []string{"#E50914", "#FF3B30", "#FF6B6B", "#FA5252", "#E03131"}

	var charElements strings.Builder
	startX := 24
	spacing := 28

	for i, ch := range code {
		x := startX + (i * spacing)
		y := 38 + ((i%2)*6 - 3)
		rot := ((i * 7) % 25) - 12
		color := colors[i%len(colors)]

		charElements.WriteString(fmt.Sprintf(
			`<text x="%d" y="%d" font-family="'Courier New', monospace" font-size="28" font-weight="bold" fill="%s" transform="rotate(%d %d %d)" filter="url(#glow)">%c</text>`,
			x, y, color, rot, x, y, ch,
		))
	}

	svg := fmt.Sprintf(
		`<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d" style="background: #111116; border-radius: 8px; border: 1px solid rgba(229,9,20,0.3);">
			<defs>
				<filter id="glow" x="-20%%" y="-20%%" width="140%%" height="140%%">
					<feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#E50914" flood-opacity="0.4"/>
				</filter>
				<pattern id="noise" width="10" height="10" patternUnits="userSpaceOnUse">
					<circle cx="2" cy="2" r="0.8" fill="#ffffff" opacity="0.12" />
					<circle cx="7" cy="8" r="0.7" fill="#ffffff" opacity="0.1" />
				</pattern>
			</defs>
			<rect width="100%%" height="100%%" fill="#141419" />
			<rect width="100%%" height="100%%" fill="url(#noise)" />
			<line x1="10" y1="15" x2="170" y2="48" stroke="#E50914" stroke-width="1.5" opacity="0.4" />
			<line x1="15" y1="45" x2="165" y2="20" stroke="#888888" stroke-width="1.2" opacity="0.3" stroke-dasharray="3,3" />
			<circle cx="40" cy="25" r="14" fill="none" stroke="#FF4D4D" stroke-width="0.8" opacity="0.25" />
			<circle cx="130" cy="35" r="18" fill="none" stroke="#FF4D4D" stroke-width="0.8" opacity="0.2" />
			%s
		</svg>`,
		width, height, width, height, charElements.String(),
	)

	return svg
}
