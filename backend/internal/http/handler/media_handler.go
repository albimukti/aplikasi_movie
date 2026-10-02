package handler

import (
	"strconv"

	"moviehub-backend/internal/domain"
	"moviehub-backend/internal/service"
	"github.com/gofiber/fiber/v2"
)

type MediaHandler struct {
	mediaSvc *service.MediaService
}

func NewMediaHandler(mediaSvc *service.MediaService) *MediaHandler {
	return &MediaHandler{mediaSvc: mediaSvc}
}

func (h *MediaHandler) Upload(c *fiber.Ctx) error {
	subDir := c.FormValue("type", "posters") // posters, backdrops, videos, subtitles, qris
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "File upload wajib dilampirkan",
		})
	}

	url, err := h.mediaSvc.UploadFile(file, subDir)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "File berhasil diunggah",
		"data": fiber.Map{
			"url":       url,
			"filename":  file.Filename,
			"size":      file.Size,
			"mime_type": file.Header.Get("Content-Type"),
		},
	})
}

// Chunked Upload Handlers
type InitChunkRequest struct {
	Filename    string `json:"filename"`
	TotalSize   int64  `json:"total_size"`
	TotalChunks int    `json:"total_chunks"`
	SubDir      string `json:"sub_dir"`
}

func (h *MediaHandler) InitChunkUpload(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	var req InitChunkRequest
	if err := c.BodyParser(&req); err != nil || req.Filename == "" || req.TotalChunks <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "filename dan total_chunks (> 0) wajib diisi",
		})
	}

	subDir := req.SubDir
	if subDir == "" {
		subDir = "videos"
	}

	uploadID, err := h.mediaSvc.InitChunkUpload(c.Context(), actor, req.Filename, req.TotalSize, req.TotalChunks, subDir)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Sesi upload chunk berhasil dibuat",
		"data": fiber.Map{
			"upload_id":    uploadID,
			"filename":     req.Filename,
			"total_chunks": req.TotalChunks,
			"total_size":   req.TotalSize,
		},
	})
}

func (h *MediaHandler) UploadChunk(c *fiber.Ctx) error {
	uploadID := c.FormValue("upload_id")
	chunkIndexStr := c.FormValue("chunk_index")
	chunkIndex, err := strconv.Atoi(chunkIndexStr)
	if uploadID == "" || err != nil || chunkIndex < 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "upload_id dan chunk_index valid wajib dilampirkan",
		})
	}

	file, err := c.FormFile("chunk")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "File chunk tidak ditemukan dalam form data",
		})
	}

	if err := h.mediaSvc.SaveChunk(c.Context(), uploadID, chunkIndex, file); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Chunk berhasil diterima dan disimpan",
		"data": fiber.Map{
			"upload_id":   uploadID,
			"chunk_index": chunkIndex,
			"chunk_size":  file.Size,
		},
	})
}

func (h *MediaHandler) GetChunkStatus(c *fiber.Ctx) error {
	uploadID := c.Params("upload_id")
	if uploadID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "upload_id wajib diisi",
		})
	}

	completed, total, err := h.mediaSvc.GetChunkStatus(c.Context(), uploadID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"upload_id":        uploadID,
			"completed_chunks": completed,
			"total_chunks":     total,
			"completed_count":  len(completed),
		},
	})
}

type CompleteChunkRequest struct {
	UploadID      string   `json:"upload_id"`
	MovieID       string   `json:"movie_id"`
	AutoTranscode bool     `json:"auto_transcode"`
	Resolutions   []string `json:"resolutions"`
}

func (h *MediaHandler) CompleteChunkUpload(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	var req CompleteChunkRequest
	if err := c.BodyParser(&req); err != nil || req.UploadID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "upload_id wajib disertakan",
		})
	}

	res, err := h.mediaSvc.CompleteChunkUpload(c.Context(), actor, req.UploadID, req.MovieID, req.AutoTranscode, req.Resolutions)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "File video besar berhasil dirangkai dan diverifikasi",
		"data":    res,
	})
}

type TranscodeRequest struct {
	MovieID     string   `json:"movie_id"`
	SourceFile  string   `json:"source_file"`
	Resolutions []string `json:"resolutions"` // ["4K (2160p)", "1080p FHD", "720p HD", "480p SD"]
}

func (h *MediaHandler) StartTranscode(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	var req TranscodeRequest
	if err := c.BodyParser(&req); err != nil || req.MovieID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "movie_id wajib disertakan",
		})
	}

	jobs, err := h.mediaSvc.StartTranscoding(c.Context(), actor, req.MovieID, req.SourceFile, req.Resolutions)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusAccepted).JSON(fiber.Map{
		"success": true,
		"message": "Job transcoding berhasil dimasukkan ke antrean",
		"data":    jobs,
	})
}

func (h *MediaHandler) ListJobs(c *fiber.Ctx) error {
	status := c.Query("status", "")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	jobs, total, err := h.mediaSvc.ListJobs(c.Context(), status, page, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    jobs,
		"meta": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *MediaHandler) GetJob(c *fiber.Ctx) error {
	id := c.Params("id")
	job, err := h.mediaSvc.GetJob(c.Context(), id)
	if err != nil || job == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Job transcoding tidak ditemukan",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    job,
	})
}

func (h *MediaHandler) RetryJob(c *fiber.Ctx) error {
	actor := c.Locals("user").(*domain.User)
	id := c.Params("id")
	if err := h.mediaSvc.RetryJob(c.Context(), actor, id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Job transcoding berhasil dimasukkan kembali ke antrean",
	})
}
