package service

import (
	"context"

	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/repository"
)

type DashboardService struct {
	dashRepo     *repository.DashboardRepository
	movieRepo    *repository.MovieRepository
	categoryRepo *repository.CategoryRepository
	playbackRepo *repository.PlaybackRepository
}

func NewDashboardService(
	dashRepo *repository.DashboardRepository,
	movieRepo *repository.MovieRepository,
	categoryRepo *repository.CategoryRepository,
	playbackRepo *repository.PlaybackRepository,
) *DashboardService {
	return &DashboardService{
		dashRepo:     dashRepo,
		movieRepo:    movieRepo,
		categoryRepo: categoryRepo,
		playbackRepo: playbackRepo,
	}
}

func (s *DashboardService) GetSuperAdminDashboard(ctx context.Context) (*domain.SuperAdminDashboard, error) {
	return s.dashRepo.GetSuperAdminStats(ctx)
}

func (s *DashboardService) GetAdminDashboard(ctx context.Context) (*domain.AdminDashboard, error) {
	return s.dashRepo.GetAdminStats(ctx)
}

func (s *DashboardService) GetViewerDashboard(ctx context.Context, userID string) (*domain.ViewerDashboard, error) {
	var continueWatching []domain.PlaybackSession
	if userID != "" {
		continueWatching, _ = s.playbackRepo.GetContinueWatching(ctx, userID, 6)
	}

	isFeatured := true
	featured, _, _ := s.movieRepo.List(ctx, "", "", domain.MovieStatusPublished, "latest", &isFeatured, 5, 0)
	trending, _, _ := s.movieRepo.List(ctx, "", "", domain.MovieStatusPublished, "popular", nil, 10, 0)
	recentlyAdded, _, _ := s.movieRepo.List(ctx, "", "", domain.MovieStatusPublished, "latest", nil, 10, 0)
	categories, _ := s.categoryRepo.ListAll(ctx, true)

	return &domain.ViewerDashboard{
		ContinueWatching: continueWatching,
		FeaturedMovies:   featured,
		TrendingMovies:   trending,
		RecentlyAdded:    recentlyAdded,
		Categories:       categories,
	}, nil
}
