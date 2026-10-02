package service

import (
	"context"
	"errors"
	"fmt"

	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/repository"
)

type MovieService struct {
	movieRepo *repository.MovieRepository
	auditRepo *repository.AuditRepository
}

func NewMovieService(movieRepo *repository.MovieRepository, auditRepo *repository.AuditRepository) *MovieService {
	return &MovieService{
		movieRepo: movieRepo,
		auditRepo: auditRepo,
	}
}

type CreateMovieInput struct {
	Title           string   `json:"title"`
	Synopsis        string   `json:"synopsis"`
	ReleaseYear     int      `json:"release_year"`
	DurationSeconds int      `json:"duration_seconds"`
	Rating          float64  `json:"rating"`
	AgeRating       string   `json:"age_rating"`
	PosterURL       string   `json:"poster_url"`
	BackdropURL     string   `json:"backdrop_url"`
	TrailerURL      string   `json:"trailer_url"`
	VideoSourceURL  string   `json:"video_source_url"`
	Status          string   `json:"status"` // DRAFT, READY, PUBLISHED
	IsFeatured      bool     `json:"is_featured"`
	CategoryIDs     []string `json:"category_ids"`
}

func (s *MovieService) CreateMovie(ctx context.Context, actor *domain.User, in CreateMovieInput) (*domain.Movie, error) {
	if in.Title == "" {
		return nil, errors.New("judul movie wajib diisi")
	}

	slug := generateSlug(in.Title)
	status := in.Status
	if status == "" {
		status = domain.MovieStatusDraft
	}

	m := &domain.Movie{
		Title:           in.Title,
		Slug:            slug,
		Synopsis:        in.Synopsis,
		ReleaseYear:     in.ReleaseYear,
		DurationSeconds: in.DurationSeconds,
		Rating:          in.Rating,
		AgeRating:       in.AgeRating,
		PosterURL:       in.PosterURL,
		BackdropURL:     in.BackdropURL,
		TrailerURL:      in.TrailerURL,
		VideoSourceURL:  in.VideoSourceURL,
		Status:          status,
		IsFeatured:      in.IsFeatured,
	}

	if actor != nil {
		m.CreatedBy = &actor.ID
	}

	if err := s.movieRepo.Create(ctx, m, in.CategoryIDs); err != nil {
		return nil, err
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "CREATE_MOVIE",
			Resource:  "MOVIE",
			ResourceID: m.ID,
			Metadata:  fmt.Sprintf(`{"title": "%s", "status": "%s"}`, m.Title, m.Status),
		})
	}

	return s.movieRepo.FindByID(ctx, m.ID)
}

func (s *MovieService) UpdateMovie(ctx context.Context, actor *domain.User, id string, in CreateMovieInput) (*domain.Movie, error) {
	m, err := s.movieRepo.FindByID(ctx, id)
	if err != nil || m == nil {
		return nil, errors.New("movie not found")
	}

	if in.Title != "" {
		m.Title = in.Title
		m.Slug = generateSlug(in.Title)
	}
	if in.Synopsis != "" {
		m.Synopsis = in.Synopsis
	}
	if in.ReleaseYear > 0 {
		m.ReleaseYear = in.ReleaseYear
	}
	if in.DurationSeconds > 0 {
		m.DurationSeconds = in.DurationSeconds
	}
	if in.Rating > 0 {
		m.Rating = in.Rating
	}
	if in.AgeRating != "" {
		m.AgeRating = in.AgeRating
	}
	if in.PosterURL != "" {
		m.PosterURL = in.PosterURL
	}
	if in.BackdropURL != "" {
		m.BackdropURL = in.BackdropURL
	}
	if in.TrailerURL != "" {
		m.TrailerURL = in.TrailerURL
	}
	if in.VideoSourceURL != "" {
		m.VideoSourceURL = in.VideoSourceURL
	}
	if in.Status != "" {
		m.Status = in.Status
	}
	m.IsFeatured = in.IsFeatured

	if err := s.movieRepo.Update(ctx, m, in.CategoryIDs); err != nil {
		return nil, err
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "UPDATE_MOVIE",
			Resource:  "MOVIE",
			ResourceID: m.ID,
			Metadata:  fmt.Sprintf(`{"title": "%s", "status": "%s"}`, m.Title, m.Status),
		})
	}

	return s.movieRepo.FindByID(ctx, m.ID)
}

func (s *MovieService) PublishMovie(ctx context.Context, actor *domain.User, id string) error {
	m, err := s.movieRepo.FindByID(ctx, id)
	if err != nil || m == nil {
		return errors.New("movie not found")
	}

	if err := s.movieRepo.Publish(ctx, id); err != nil {
		return err
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "PUBLISH_MOVIE",
			Resource:  "MOVIE",
			ResourceID: id,
			Metadata:  fmt.Sprintf(`{"title": "%s"}`, m.Title),
		})
	}

	return nil
}

func (s *MovieService) UnpublishMovie(ctx context.Context, actor *domain.User, id string) error {
	m, err := s.movieRepo.FindByID(ctx, id)
	if err != nil || m == nil {
		return errors.New("movie not found")
	}

	if err := s.movieRepo.Unpublish(ctx, id); err != nil {
		return err
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "UNPUBLISH_MOVIE",
			Resource:  "MOVIE",
			ResourceID: id,
			Metadata:  fmt.Sprintf(`{"title": "%s"}`, m.Title),
		})
	}

	return nil
}

func (s *MovieService) DeleteMovie(ctx context.Context, actor *domain.User, id string) error {
	m, err := s.movieRepo.FindByID(ctx, id)
	if err != nil || m == nil {
		return errors.New("movie not found")
	}

	if err := s.movieRepo.Delete(ctx, id); err != nil {
		return err
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "DELETE_MOVIE",
			Resource:  "MOVIE",
			ResourceID: id,
			Metadata:  fmt.Sprintf(`{"title": "%s"}`, m.Title),
		})
	}

	return nil
}

func (s *MovieService) GetMovie(ctx context.Context, idOrSlug string, incrementView bool) (*domain.Movie, error) {
	m, err := s.movieRepo.FindByIDOrSlug(ctx, idOrSlug)
	if err != nil || m == nil {
		return nil, errors.New("movie not found")
	}

	if incrementView {
		_ = s.movieRepo.IncrementViews(ctx, m.ID)
	}

	return m, nil
}

func (s *MovieService) ListMovies(ctx context.Context, search, categorySlug, status, sortBy string, isFeatured *bool, page, limit int) ([]domain.Movie, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 12
	}
	offset := (page - 1) * limit

	return s.movieRepo.List(ctx, search, categorySlug, status, sortBy, isFeatured, limit, offset)
}
