package service

import (
	"context"
	"errors"
	"fmt"
	"mime/multipart"

	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/pkg/storage"
	"moviehub-backend/internal/repository"
)

type MediaService struct {
	mediaRepo *repository.MediaRepository
	movieRepo *repository.MovieRepository
	auditRepo *repository.AuditRepository
	storage   *storage.Storage
}

func NewMediaService(
	mediaRepo *repository.MediaRepository,
	movieRepo *repository.MovieRepository,
	auditRepo *repository.AuditRepository,
	storage *storage.Storage,
) *MediaService {
	return &MediaService{
		mediaRepo: mediaRepo,
		movieRepo: movieRepo,
		auditRepo: auditRepo,
		storage:   storage,
	}
}

func (s *MediaService) UploadFile(file *multipart.FileHeader, subDir string) (string, error) {
	return s.storage.SaveUploadedFile(file, subDir)
}

func (s *MediaService) InitChunkUpload(ctx context.Context, actor *domain.User, filename string, totalSize int64, totalChunks int, subDir string) (string, error) {
	if subDir == "" {
		subDir = "videos"
	}
	return s.storage.InitChunkUpload(filename, totalSize, totalChunks, subDir)
}

func (s *MediaService) SaveChunk(ctx context.Context, uploadID string, chunkIndex int, file *multipart.FileHeader) error {
	return s.storage.SaveChunk(uploadID, chunkIndex, file)
}

func (s *MediaService) GetChunkStatus(ctx context.Context, uploadID string) ([]int, int, error) {
	return s.storage.GetChunkStatus(uploadID)
}

type CompleteUploadResult struct {
	VideoURL   string            `json:"video_url"`
	LocalPath  string            `json:"local_path"`
	Filename   string            `json:"filename"`
	Size       int64             `json:"size"`
	MovieID    string            `json:"movie_id,omitempty"`
	QueuedJobs []domain.MediaJob `json:"queued_jobs,omitempty"`
}

func (s *MediaService) CompleteChunkUpload(ctx context.Context, actor *domain.User, uploadID, movieID string, autoTranscode bool, resolutions []string) (*CompleteUploadResult, error) {
	publicURL, localPath, filename, size, err := s.storage.MergeChunks(uploadID)
	if err != nil {
		return nil, err
	}

	result := &CompleteUploadResult{
		VideoURL:  publicURL,
		LocalPath: localPath,
		Filename:  filename,
		Size:      size,
		MovieID:   movieID,
	}

	if movieID != "" {
		movie, err := s.movieRepo.FindByID(ctx, movieID)
		if err == nil && movie != nil {
			movie.VideoSourceURL = publicURL
			if autoTranscode {
				movie.Status = domain.MovieStatusProcessing
			}
			_ = s.movieRepo.Update(ctx, movie, nil)
		}
	}

	if autoTranscode && movieID != "" {
		jobs, err := s.StartTranscoding(ctx, actor, movieID, publicURL, resolutions)
		if err == nil {
			result.QueuedJobs = jobs
		}
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "UPLOAD_VIDEO_CHUNKED",
			Resource:  "MEDIA",
			ResourceID: movieID,
			Metadata:  fmt.Sprintf(`{"filename": "%s", "size_bytes": %d, "url": "%s"}`, filename, size, publicURL),
		})
	}

	return result, nil
}

func (s *MediaService) StartTranscoding(ctx context.Context, actor *domain.User, movieID, sourceFile string, resolutions []string) ([]domain.MediaJob, error) {
	movie, err := s.movieRepo.FindByID(ctx, movieID)
	if err != nil || movie == nil {
		return nil, errors.New("movie not found")
	}

	if len(resolutions) == 0 {
		resolutions = []string{"1080p FHD", "720p HD", "480p SD"}
	}

	// Update movie to PROCESSING
	movie.Status = domain.MovieStatusProcessing
	if sourceFile != "" {
		movie.VideoSourceURL = sourceFile
	}
	_ = s.movieRepo.Update(ctx, movie, nil)

	var createdJobs []domain.MediaJob
	for _, res := range resolutions {
		job := &domain.MediaJob{
			MovieID:          movieID,
			JobType:          "TRANSCODE",
			SourceFile:       sourceFile,
			TargetResolution: res,
			Status:           domain.JobStatusQueued,
			Progress:         0,
		}

		if err := s.mediaRepo.CreateJob(ctx, job); err == nil {
			createdJobs = append(createdJobs, *job)
		}
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "START_TRANSCODE",
			Resource:  "MEDIA",
			ResourceID: movieID,
			Metadata:  fmt.Sprintf(`{"movie_title": "%s", "resolutions": %d}`, movie.Title, len(resolutions)),
		})
	}

	return createdJobs, nil
}

func (s *MediaService) ListJobs(ctx context.Context, status string, page, limit int) ([]domain.MediaJob, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit
	return s.mediaRepo.ListJobs(ctx, status, limit, offset)
}

func (s *MediaService) GetJob(ctx context.Context, id string) (*domain.MediaJob, error) {
	return s.mediaRepo.GetJobByID(ctx, id)
}

func (s *MediaService) RetryJob(ctx context.Context, actor *domain.User, id string) error {
	job, err := s.mediaRepo.GetJobByID(ctx, id)
	if err != nil || job == nil {
		return errors.New("job not found")
	}

	err = s.mediaRepo.UpdateJobProgress(ctx, id, 0, domain.JobStatusQueued, "")
	if err != nil {
		return err
	}

	if actor != nil {
		_ = s.auditRepo.Log(ctx, &domain.AuditLog{
			ActorID:   &actor.ID,
			ActorName: actor.Name,
			ActorRole: actor.Role,
			Action:    "RETRY_TRANSCODE_JOB",
			Resource:  "MEDIA",
			ResourceID: id,
			Metadata:  fmt.Sprintf(`{"movie_id": "%s", "target_resolution": "%s"}`, job.MovieID, job.TargetResolution),
		})
	}

	return nil
}
