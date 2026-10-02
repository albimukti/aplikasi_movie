package storage

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

type Storage struct {
	baseDir string
}

func NewStorage(baseDir string) *Storage {
	_ = os.MkdirAll(filepath.Join(baseDir, "posters"), 0755)
	_ = os.MkdirAll(filepath.Join(baseDir, "backdrops"), 0755)
	_ = os.MkdirAll(filepath.Join(baseDir, "videos"), 0755)
	_ = os.MkdirAll(filepath.Join(baseDir, "subtitles"), 0755)
	_ = os.MkdirAll(filepath.Join(baseDir, "qris"), 0755)
	_ = os.MkdirAll(filepath.Join(baseDir, "temp_chunks"), 0755)
	return &Storage{baseDir: baseDir}
}

func (s *Storage) GetBaseDir() string {
	return s.baseDir
}

var allowedImageExts = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".svg": true,
}

var allowedVideoExts = map[string]bool{
	".mp4": true, ".mkv": true, ".mov": true, ".webm": true,
	".avi": true, ".flv": true, ".ts": true, ".wmv": true, ".m4v": true,
}

var allowedSubtitleExts = map[string]bool{
	".vtt": true, ".srt": true,
}

// SaveUploadedFile validates and saves an uploaded file to the specified subdirectory
func (s *Storage) SaveUploadedFile(file *multipart.FileHeader, subDir string) (string, error) {
	ext := strings.ToLower(filepath.Ext(file.Filename))
	
	switch subDir {
	case "posters", "backdrops", "qris":
		if !allowedImageExts[ext] {
			return "", errors.New("ekstensi gambar tidak valid; diizinkan: jpg, jpeg, png, webp, svg")
		}
		if file.Size > 15*1024*1024 { // 15 MB
			return "", errors.New("ukuran gambar melebihi batas maksimum 15MB")
		}
	case "videos":
		if !allowedVideoExts[ext] {
			return "", errors.New("ekstensi video tidak valid; diizinkan: mp4, mkv, mov, webm, avi, flv, ts, wmv, m4v")
		}
		if file.Size > 10*1024*1024*1024 { // 10 GB
			return "", errors.New("ukuran file video melebihi batas maksimum 10GB")
		}
	case "subtitles":
		if !allowedSubtitleExts[ext] {
			return "", errors.New("ekstensi subtitle tidak valid; diizinkan: vtt, srt")
		}
		if file.Size > 10*1024*1024 { // 10 MB
			return "", errors.New("ukuran file subtitle melebihi batas maksimum 10MB")
		}
	default:
		return "", errors.New("subdirektori upload tidak dikenali")
	}

	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("gagal membuka file upload: %w", err)
	}
	defer src.Close()

	safeFilename := uuid.New().String() + ext
	destPath := filepath.Join(s.baseDir, subDir, safeFilename)

	dst, err := os.Create(destPath)
	if err != nil {
		return "", fmt.Errorf("gagal membuat file tujuan: %w", err)
	}
	defer dst.Close()

	// Stream copy without loading the whole file into RAM
	buf := make([]byte, 64*1024)
	if _, err = io.CopyBuffer(dst, src, buf); err != nil {
		return "", fmt.Errorf("gagal menyimpan file: %w", err)
	}

	publicURL := fmt.Sprintf("/uploads/%s/%s", subDir, safeFilename)
	return publicURL, nil
}

// Chunked Upload Support
type ChunkMeta struct {
	UploadID    string    `json:"upload_id"`
	Filename    string    `json:"filename"`
	TotalSize   int64     `json:"total_size"`
	TotalChunks int       `json:"total_chunks"`
	SubDir      string    `json:"sub_dir"`
	CreatedAt   time.Time `json:"created_at"`
}

// InitChunkUpload creates a temporary staging directory and saves metadata
func (s *Storage) InitChunkUpload(filename string, totalSize int64, totalChunks int, subDir string) (string, error) {
	ext := strings.ToLower(filepath.Ext(filename))
	if subDir == "videos" && !allowedVideoExts[ext] {
		return "", fmt.Errorf("format video %s tidak didukung; gunakan mp4, mkv, mov, webm, avi, flv, ts, wmv", ext)
	}

	uploadID := uuid.New().String()
	chunkDir := filepath.Join(s.baseDir, "temp_chunks", uploadID)
	if err := os.MkdirAll(chunkDir, 0755); err != nil {
		return "", fmt.Errorf("gagal membuat direktori chunk sementara: %w", err)
	}

	meta := ChunkMeta{
		UploadID:    uploadID,
		Filename:    filename,
		TotalSize:   totalSize,
		TotalChunks: totalChunks,
		SubDir:      subDir,
		CreatedAt:   time.Now(),
	}

	metaBytes, err := json.Marshal(meta)
	if err != nil {
		return "", err
	}

	if err := os.WriteFile(filepath.Join(chunkDir, "meta.json"), metaBytes, 0644); err != nil {
		return "", fmt.Errorf("gagal menulis metadata chunk: %w", err)
	}

	return uploadID, nil
}

// SaveChunk writes a single chunk directly to disk via streaming
func (s *Storage) SaveChunk(uploadID string, chunkIndex int, file *multipart.FileHeader) error {
	chunkDir := filepath.Join(s.baseDir, "temp_chunks", uploadID)
	if _, err := os.Stat(chunkDir); os.IsNotExist(err) {
		return errors.New("sesi upload chunk tidak ditemukan atau sudah kedaluwarsa")
	}

	src, err := file.Open()
	if err != nil {
		return fmt.Errorf("gagal membaca chunk data: %w", err)
	}
	defer src.Close()

	chunkPath := filepath.Join(chunkDir, fmt.Sprintf("chunk_%d", chunkIndex))
	dst, err := os.Create(chunkPath)
	if err != nil {
		return fmt.Errorf("gagal membuat chunk di disk: %w", err)
	}
	defer dst.Close()

	buf := make([]byte, 32*1024)
	if _, err = io.CopyBuffer(dst, src, buf); err != nil {
		return fmt.Errorf("gagal menulis chunk: %w", err)
	}

	return nil
}

// GetChunkStatus returns list of uploaded chunk indices for resumable uploads
func (s *Storage) GetChunkStatus(uploadID string) ([]int, int, error) {
	chunkDir := filepath.Join(s.baseDir, "temp_chunks", uploadID)
	metaBytes, err := os.ReadFile(filepath.Join(chunkDir, "meta.json"))
	if err != nil {
		return nil, 0, errors.New("sesi upload chunk tidak ditemukan")
	}

	var meta ChunkMeta
	if err := json.Unmarshal(metaBytes, &meta); err != nil {
		return nil, 0, err
	}

	entries, err := os.ReadDir(chunkDir)
	if err != nil {
		return nil, 0, err
	}

	var completed []int
	for _, entry := range entries {
		if strings.HasPrefix(entry.Name(), "chunk_") {
			idxStr := strings.TrimPrefix(entry.Name(), "chunk_")
			if idx, err := strconv.Atoi(idxStr); err == nil {
				completed = append(completed, idx)
			}
		}
	}

	return completed, meta.TotalChunks, nil
}

// MergeChunks assembles all chunk files sequentially on disk and returns the final public URL & path
func (s *Storage) MergeChunks(uploadID string) (string, string, string, int64, error) {
	chunkDir := filepath.Join(s.baseDir, "temp_chunks", uploadID)
	metaBytes, err := os.ReadFile(filepath.Join(chunkDir, "meta.json"))
	if err != nil {
		return "", "", "", 0, errors.New("sesi upload chunk tidak ditemukan")
	}

	var meta ChunkMeta
	if err := json.Unmarshal(metaBytes, &meta); err != nil {
		return "", "", "", 0, err
	}

	ext := strings.ToLower(filepath.Ext(meta.Filename))
	if ext == "" {
		ext = ".mp4"
	}
	safeFilename := uuid.New().String() + ext
	destPath := filepath.Join(s.baseDir, meta.SubDir, safeFilename)

	finalFile, err := os.Create(destPath)
	if err != nil {
		return "", "", "", 0, fmt.Errorf("gagal membuat file video gabungan: %w", err)
	}
	defer finalFile.Close()

	buf := make([]byte, 128*1024)
	var totalWritten int64

	// Sequentially stitch chunks
	for i := 0; i < meta.TotalChunks; i++ {
		chunkPath := filepath.Join(chunkDir, fmt.Sprintf("chunk_%d", i))
		chunkFile, err := os.Open(chunkPath)
		if err != nil {
			_ = os.Remove(destPath)
			return "", "", "", 0, fmt.Errorf("chunk index %d hilang atau belum selesai diunggah: %w", i, err)
		}

		n, err := io.CopyBuffer(finalFile, chunkFile, buf)
		chunkFile.Close()
		if err != nil {
			_ = os.Remove(destPath)
			return "", "", "", 0, fmt.Errorf("gagal merangkai chunk %d: %w", i, err)
		}
		totalWritten += n
	}

	// Clean up temporary chunks directory
	_ = os.RemoveAll(chunkDir)

	publicURL := fmt.Sprintf("/uploads/%s/%s", meta.SubDir, safeFilename)
	return publicURL, destPath, meta.Filename, totalWritten, nil
}
