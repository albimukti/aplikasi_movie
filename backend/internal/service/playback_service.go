package service

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/repository"
)

type PlaybackService struct {
	playbackRepo *repository.PlaybackRepository
	movieRepo    *repository.MovieRepository
	secretKey    string
}

func NewPlaybackService(playbackRepo *repository.PlaybackRepository, movieRepo *repository.MovieRepository, secretKey string) *PlaybackService {
	return &PlaybackService{
		playbackRepo: playbackRepo,
		movieRepo:    movieRepo,
		secretKey:    secretKey,
	}
}

type PlaybackSessionResponse struct {
	MovieID       string              `json:"movie_id"`
	MovieTitle    string              `json:"movie_title"`
	PlaybackToken string              `json:"playback_token"`
	ExpiresAt     int64               `json:"expires_at"`
	Streams       []domain.MediaAsset `json:"streams"`
	Subtitles     []domain.Subtitle   `json:"subtitles"`
	LastPosition  int                 `json:"last_position"`
	Duration      int                 `json:"duration"`
}

func (s *PlaybackService) CreatePlaybackSession(ctx context.Context, userID, movieID string) (*PlaybackSessionResponse, error) {
	movie, err := s.movieRepo.FindByID(ctx, movieID)
	if err != nil || movie == nil {
		return nil, errors.New("movie not found")
	}

	if movie.Status != domain.MovieStatusPublished {
		return nil, errors.New("movie belum dipublikasikan atau sedang diproses")
	}

	// Generate short-lived playback token (valid 4 hours)
	exp := time.Now().Add(4 * time.Hour).Unix()
	msg := fmt.Sprintf("%s:%s:%d", userID, movieID, exp)
	h := hmac.New(sha256.New, []byte(s.secretKey))
	h.Write([]byte(msg))
	token := hex.EncodeToString(h.Sum(nil))

	// Get existing continue watching position if user logged in
	lastPos := 0
	if userID != "" {
		sessions, _ := s.playbackRepo.GetContinueWatching(ctx, userID, 50)
		for _, sess := range sessions {
			if sess.MovieID == movieID {
				lastPos = sess.LastPositionSeconds
				break
			}
		}
	}

	return &PlaybackSessionResponse{
		MovieID:       movie.ID,
		MovieTitle:    movie.Title,
		PlaybackToken: token,
		ExpiresAt:     exp,
		Streams:       movie.Assets,
		Subtitles:     movie.Subtitles,
		LastPosition:  lastPos,
		Duration:      movie.DurationSeconds,
	}, nil
}

func (s *PlaybackService) UpdateProgress(ctx context.Context, userID, movieID string, positionSec, durationSec int, completed bool) error {
	p := &domain.PlaybackSession{
		UserID:              userID,
		MovieID:             movieID,
		LastPositionSeconds: positionSec,
		DurationSeconds:     durationSec,
		Completed:           completed,
	}
	return s.playbackRepo.UpsertProgress(ctx, p)
}

func (s *PlaybackService) GetContinueWatching(ctx context.Context, userID string) ([]domain.PlaybackSession, error) {
	return s.playbackRepo.GetContinueWatching(ctx, userID, 10)
}
