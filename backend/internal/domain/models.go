package domain

import (
	"time"
)

// Roles
const (
	RoleSuperAdmin = "SUPERADMIN"
	RoleAdmin      = "ADMIN"
	RoleViewer     = "VIEWER"
)

// User Statuses
const (
	UserStatusActive    = "ACTIVE"
	UserStatusSuspended = "SUSPENDED"
)

// Movie Statuses
const (
	MovieStatusDraft      = "DRAFT"
	MovieStatusProcessing = "PROCESSING"
	MovieStatusReady      = "READY"
	MovieStatusPublished  = "PUBLISHED"
	MovieStatusFailed     = "FAILED"
)

// Job Statuses
const (
	JobStatusQueued     = "QUEUED"
	JobStatusProcessing = "PROCESSING"
	JobStatusCompleted  = "COMPLETED"
	JobStatusFailed     = "FAILED"
)

// User Model
type User struct {
	ID           string     `json:"id"`
	Username     string     `json:"username"`
	Email        string     `json:"email"`
	PasswordHash string     `json:"-"`
	Name         string     `json:"name"`
	Role         string     `json:"role"`
	Status       string     `json:"status"`
	AvatarURL    string     `json:"avatar_url"`
	LastLoginAt  *time.Time `json:"last_login_at,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// Category Model
type Category struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	MovieCount  int       `json:"movie_count,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Movie Model
type Movie struct {
	ID              string        `json:"id"`
	Title           string        `json:"title"`
	Slug            string        `json:"slug"`
	Synopsis        string        `json:"synopsis"`
	ReleaseYear     int           `json:"release_year"`
	DurationSeconds int           `json:"duration_seconds"`
	Rating          float64       `json:"rating"`
	AgeRating       string        `json:"age_rating"`
	PosterURL       string        `json:"poster_url"`
	BackdropURL     string        `json:"backdrop_url"`
	TrailerURL      string        `json:"trailer_url"`
	VideoSourceURL  string        `json:"video_source_url"`
	Status          string        `json:"status"`
	IsFeatured      bool          `json:"is_featured"`
	ViewsCount      int64         `json:"views_count"`
	CreatedBy       *string       `json:"created_by,omitempty"`
	PublishedAt     *time.Time    `json:"published_at,omitempty"`
	CreatedAt       time.Time     `json:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at"`
	Categories      []Category    `json:"categories,omitempty"`
	Assets          []MediaAsset  `json:"assets,omitempty"`
	Subtitles       []Subtitle    `json:"subtitles,omitempty"`
}

// Media Asset Model
type MediaAsset struct {
	ID         string    `json:"id"`
	MovieID    string    `json:"movie_id"`
	Type       string    `json:"type"`       // 'HLS', 'MP4', 'THUMBNAIL'
	Resolution string    `json:"resolution"` // '480p', '720p', '1080p', '4K'
	Codec      string    `json:"codec"`
	Bitrate    int       `json:"bitrate"`
	URL        string    `json:"url"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
}

// Media Job Model
type MediaJob struct {
	ID               string    `json:"id"`
	MovieID          string    `json:"movie_id"`
	MovieTitle       string    `json:"movie_title,omitempty"`
	AssetID          *string   `json:"asset_id,omitempty"`
	JobType          string    `json:"job_type"`
	SourceFile       string    `json:"source_file"`
	TargetResolution string    `json:"target_resolution"`
	Status           string    `json:"status"`
	Progress         int       `json:"progress"`
	ErrorMessage     string    `json:"error_message"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// Subtitle Model
type Subtitle struct {
	ID           string    `json:"id"`
	MovieID      string    `json:"movie_id"`
	LanguageCode string    `json:"language_code"`
	Label        string    `json:"label"`
	FileURL      string    `json:"file_url"`
	IsDefault    bool      `json:"is_default"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Ad Campaign Model
type AdCampaign struct {
	ID            string       `json:"id"`
	Name          string       `json:"name"`
	Status        string       `json:"status"`
	StartAt       time.Time    `json:"start_at"`
	EndAt         *time.Time   `json:"end_at,omitempty"`
	Priority      int          `json:"priority"`
	FrequencyRule int          `json:"frequency_rule"`
	Creatives     []AdCreative `json:"creatives,omitempty"`
	CreatedAt     time.Time    `json:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at"`
}

// Ad Creative Model
type AdCreative struct {
	ID               string    `json:"id"`
	CampaignID       string    `json:"campaign_id"`
	Type             string    `json:"type"`
	Title            string    `json:"title"`
	MediaURL         string    `json:"media_url"`
	TargetURL        string    `json:"target_url"`
	DurationSeconds  int       `json:"duration_seconds"`
	SkipAfterSeconds int       `json:"skip_after_seconds"`
	CreatedAt        time.Time `json:"created_at"`
}

// Ad Event Model
type AdEvent struct {
	ID          string    `json:"id"`
	SessionID   string    `json:"session_id"`
	CampaignID  string    `json:"campaign_id"`
	CreativeID  string    `json:"creative_id"`
	UserID      *string   `json:"user_id,omitempty"`
	EventType   string    `json:"event_type"` // impression, start, completed, skip, click
	OccurredAt  time.Time `json:"occurred_at"`
}

// Support / QRIS Model
type SupportQRIS struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	QRISURL     string    `json:"qris_url"`
	IsActive    bool      `json:"is_active"`
	CreatedBy   *string   `json:"created_by,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Refresh Token Model
type RefreshToken struct {
	ID        string     `json:"id"`
	UserID    string     `json:"user_id"`
	TokenHash string     `json:"token_hash"`
	ExpiresAt time.Time  `json:"expires_at"`
	RevokedAt *time.Time `json:"revoked_at,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
}

// Audit Log Model
type AuditLog struct {
	ID         string    `json:"id"`
	ActorID    *string   `json:"actor_id,omitempty"`
	ActorName  string    `json:"actor_name"`
	ActorRole  string    `json:"actor_role"`
	Action     string    `json:"action"`
	Resource   string    `json:"resource"`
	ResourceID string    `json:"resource_id"`
	Metadata   string    `json:"metadata"`
	IPAddress  string    `json:"ip_address"`
	CreatedAt  time.Time `json:"created_at"`
}

// Playback Session Model
type PlaybackSession struct {
	ID                  string     `json:"id"`
	UserID              string     `json:"user_id"`
	MovieID             string     `json:"movie_id"`
	MovieTitle          string     `json:"movie_title,omitempty"`
	MoviePoster         string     `json:"movie_poster,omitempty"`
	MovieDuration       int        `json:"movie_duration,omitempty"`
	LastPositionSeconds int        `json:"last_position_seconds"`
	DurationSeconds     int        `json:"duration_seconds"`
	Completed           bool       `json:"completed"`
	StartedAt           time.Time  `json:"started_at"`
	EndedAt             *time.Time `json:"ended_at,omitempty"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
}

// Watchlist Model
type Watchlist struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	MovieID   string    `json:"movie_id"`
	Movie     *Movie    `json:"movie,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

// System Config Model
type SystemConfig struct {
	Key         string    `json:"key"`
	Value       string    `json:"value"`
	Description string    `json:"description"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// SuperAdmin Dashboard Aggregate
type SuperAdminDashboard struct {
	TotalUsers         int                 `json:"total_users"`
	ViewersCount       int                 `json:"viewers_count"`
	AdminsCount        int                 `json:"admins_count"`
	SuperAdminsCount   int                 `json:"superadmins_count"`
	SuspendedUsers     int                 `json:"suspended_users"`
	TotalMovies        int                 `json:"total_movies"`
	PublishedMovies    int                 `json:"published_movies"`
	DraftMovies        int                 `json:"draft_movies"`
	ReadyMovies        int                 `json:"ready_movies"`
	ProcessingMovies   int                 `json:"processing_movies"`
	TotalCategories    int                 `json:"total_categories"`
	TotalPlaybacks     int64               `json:"total_playbacks"`
	EstimatedStorageMB float64             `json:"estimated_storage_mb"`
	ActiveJobsCount    int                 `json:"active_jobs_count"`
	FailedJobsCount    int                 `json:"failed_jobs_count"`
	ActiveCampaigns    int                 `json:"active_campaigns"`
	TotalAdImpressions int64               `json:"total_ad_impressions"`
	ActiveQRISTitle    string              `json:"active_qris_title"`
	RecentAuditLogs    []AuditLog          `json:"recent_audit_logs"`
	SystemHealth       map[string]string   `json:"system_health"`
}

// Admin Dashboard Aggregate
type AdminDashboard struct {
	TotalMovies      int         `json:"total_movies"`
	PublishedMovies  int         `json:"published_movies"`
	DraftMovies      int         `json:"draft_movies"`
	ReadyMovies      int         `json:"ready_movies"`
	ProcessingMovies int         `json:"processing_movies"`
	FailedMovies     int         `json:"failed_movies"`
	TotalCategories  int         `json:"total_categories"`
	TotalSubtitles   int         `json:"total_subtitles"`
	ActiveJobsCount  int         `json:"active_jobs_count"`
	FailedJobsCount  int         `json:"failed_jobs_count"`
	RecentJobs       []MediaJob  `json:"recent_jobs"`
	RecentMovies     []Movie     `json:"recent_movies"`
	RecentAudits     []AuditLog  `json:"recent_audits"`
}

// Viewer Dashboard Aggregate
type ViewerDashboard struct {
	ContinueWatching []PlaybackSession `json:"continue_watching"`
	FeaturedMovies   []Movie           `json:"featured_movies"`
	TrendingMovies   []Movie           `json:"trending_movies"`
	RecentlyAdded    []Movie           `json:"recently_added"`
	Categories       []Category        `json:"categories"`
}
