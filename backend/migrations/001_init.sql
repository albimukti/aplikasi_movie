-- MovieHub Database Schema
-- Compatible with PostgreSQL 13+

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if restarting migration
DROP TABLE IF EXISTS watchlists CASCADE;
DROP TABLE IF EXISTS playback_sessions CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS support_qris CASCADE;
DROP TABLE IF EXISTS ad_events CASCADE;
DROP TABLE IF EXISTS ad_creatives CASCADE;
DROP TABLE IF EXISTS ad_campaigns CASCADE;
DROP TABLE IF EXISTS subtitles CASCADE;
DROP TABLE IF EXISTS media_jobs CASCADE;
DROP TABLE IF EXISTS media_assets CASCADE;
DROP TABLE IF EXISTS movie_categories CASCADE;
DROP TABLE IF EXISTS movies CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS system_configs CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'VIEWER', -- 'SUPERADMIN', 'ADMIN', 'VIEWER'
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED'
    avatar_url TEXT DEFAULT '',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Categories / Genres Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Movies Table
CREATE TABLE movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    synopsis TEXT DEFAULT '',
    release_year INT NOT NULL DEFAULT 2026,
    duration_seconds INT NOT NULL DEFAULT 0,
    rating NUMERIC(3, 1) DEFAULT 8.5,
    age_rating VARCHAR(10) DEFAULT '13+',
    poster_url TEXT DEFAULT '',
    backdrop_url TEXT DEFAULT '',
    trailer_url TEXT DEFAULT '',
    video_source_url TEXT DEFAULT '',
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'PROCESSING', 'READY', 'PUBLISHED', 'FAILED'
    is_featured BOOLEAN DEFAULT FALSE,
    views_count BIGINT DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Movie Categories Relation
CREATE TABLE movie_categories (
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, category_id)
);

-- 5. Media Assets (Multi-Quality HLS / MP4 / Thumbnails)
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'HLS', 'MP4', 'THUMBNAIL'
    resolution VARCHAR(50) NOT NULL, -- '480p', '720p', '1080p', '4K'
    codec VARCHAR(50) DEFAULT 'h264',
    bitrate INT DEFAULT 0,
    url TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'READY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Media Jobs (Transcoding & Compression Queue)
CREATE TABLE media_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
    job_type VARCHAR(50) NOT NULL DEFAULT 'TRANSCODE',
    source_file TEXT NOT NULL,
    target_resolution VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'QUEUED', -- 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'
    progress INT DEFAULT 0,
    error_message TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Subtitles Table
CREATE TABLE subtitles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL, -- 'id', 'en', 'ja', 'es'
    label VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Ad Campaigns Table
CREATE TABLE ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE'
    start_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_at TIMESTAMP WITH TIME ZONE,
    priority INT DEFAULT 1,
    frequency_rule INT DEFAULT 1, -- e.g. show every 1 movie
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Ad Creatives Table
CREATE TABLE ad_creatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'PRE_ROLL', -- 'PRE_ROLL', 'BANNER'
    title VARCHAR(255) NOT NULL,
    media_url TEXT NOT NULL,
    target_url TEXT DEFAULT '',
    duration_seconds INT DEFAULT 15,
    skip_after_seconds INT DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Ad Events (Analytics)
CREATE TABLE ad_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    creative_id UUID REFERENCES ad_creatives(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- 'impression', 'start', 'completed', 'skip', 'click'
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Support & QRIS Donation Table
CREATE TABLE support_qris (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    qris_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Refresh Tokens (JWT Rotation & Revocation)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(255) DEFAULT 'System',
    actor_role VARCHAR(50) DEFAULT 'SYSTEM',
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255) DEFAULT '',
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(100) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Playback Sessions & Continue Watching
CREATE TABLE playback_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    last_position_seconds INT DEFAULT 0,
    duration_seconds INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, movie_id)
);

-- 15. Watchlist / Bookmark
CREATE TABLE watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, movie_id)
);

-- 16. System Configs
CREATE TABLE system_configs (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_movies_slug ON movies(slug);
CREATE INDEX idx_movies_status ON movies(status);
CREATE INDEX idx_movies_published_at ON movies(published_at);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_media_assets_movie_id ON media_assets(movie_id);
CREATE INDEX idx_media_jobs_status ON media_jobs(status);
CREATE INDEX idx_subtitles_movie_id ON subtitles(movie_id);
CREATE INDEX idx_ad_events_campaign ON ad_events(campaign_id);
CREATE INDEX idx_playback_user_movie ON playback_sessions(user_id, movie_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- SEED DATA
-- Default Users:
-- SuperAdmin: superadmin / superadmin@moviehub.com / SuperAdmin123!
-- Admin: admin / admin@moviehub.com / Admin123!
-- Viewer: user / user@moviehub.com / User123!
INSERT INTO users (id, username, email, password_hash, name, role, status) VALUES
('a0000000-0000-0000-0000-000000000001', 'superadmin', 'superadmin@moviehub.com', '$2a$10$P0UTlQQ3A2AbkPDcd7nWBesZaKg/ok6r874GUjmiI/om.sYVW5y3q', 'Master Super Admin', 'SUPERADMIN', 'ACTIVE'),
('a0000000-0000-0000-0000-000000000002', 'admin', 'admin@moviehub.com', '$2a$10$fLbLPk6h0LwrjSGjydxQ4eqCelxbYyii4Z94I12rSw2ocpKXsYU0.', 'Content Ops Admin', 'ADMIN', 'ACTIVE'),
('a0000000-0000-0000-0000-000000000003', 'user', 'user@moviehub.com', '$2a$10$1LzxwT2kSKQ4ASL.rW77K.DcM.gAIhR4QJf6Pic/ipJoMhwpcqbdC', 'Movie Enthusiast', 'VIEWER', 'ACTIVE');

-- Default Categories
INSERT INTO categories (id, name, slug, description, status) VALUES
('b0000000-0000-0000-0000-000000000001', 'Action & Adventure', 'action-adventure', 'Adrenaline-packed blockbusters and epic quests', 'ACTIVE'),
('b0000000-0000-0000-0000-000000000002', 'Sci-Fi & Cyberpunk', 'sci-fi-cyberpunk', 'Futuristic technologies, dystopian worlds, and cosmos', 'ACTIVE'),
('b0000000-0000-0000-0000-000000000003', 'Thriller & Mystery', 'thriller-mystery', 'High-tension suspense, detectives, and plot twists', 'ACTIVE'),
('b0000000-0000-0000-0000-000000000004', 'Drama & Romance', 'drama-romance', 'Emotional storytelling, heartbreak, and triumph', 'ACTIVE'),
('b0000000-0000-0000-0000-000000000005', 'Anime & Animation', 'anime-animation', 'Top-tier animation masterpieces and fantasy worlds', 'ACTIVE'),
('b0000000-0000-0000-0000-000000000006', 'Horror & Supernatural', 'horror-supernatural', 'Spine-chilling scares, ghosts, and psychological horror', 'ACTIVE'),
('b0000000-0000-0000-0000-000000000007', 'Comedy', 'comedy', 'Laugh-out-loud humor and heartwarming comedies', 'ACTIVE');

-- Default Movies (High Quality Real Playable Demo Streams)
INSERT INTO movies (id, title, slug, synopsis, release_year, duration_seconds, rating, age_rating, poster_url, backdrop_url, trailer_url, video_source_url, status, is_featured, views_count, created_by, published_at) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'Tears of Steel (4K Cyberpunk)',
    'tears-of-steel',
    'In a dystopian future of Neo-Amsterdam, a group of scientists and soldiers attempt to reset the past to save humanity from destructive cybernetic titans.',
    2026,
    734,
    9.2,
    '17+',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'PUBLISHED',
    TRUE,
    14820,
    'a0000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '5 days'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'Cosmos Odyssey: Beyond The Void',
    'cosmos-odyssey',
    'Deep interstellar exploration uncovering an ancient cosmic beacon that alters the perception of time, space, and reality for human survivors.',
    2025,
    912,
    8.9,
    '13+',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'PUBLISHED',
    TRUE,
    9320,
    'a0000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '3 days'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'Big Buck Bunny: Red Revenge',
    'big-buck-bunny',
    'A gentle forest rabbit takes on mischievous bullies in this acclaimed animation classic, now remastered in vibrant 4K resolution and dynamic audio.',
    2026,
    596,
    8.7,
    'SU',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
    'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1600&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'PUBLISHED',
    FALSE,
    22400,
    'a0000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '10 days'
),
(
    'c0000000-0000-0000-0000-000000000004',
    'Sintel: The Dragon Quest',
    'sintel-dragon-quest',
    'A lonely warrior girl searches across snow-capped peaks and treacherous deserts to rescue her beloved baby dragon captured by a fearsome predator.',
    2025,
    888,
    9.1,
    '13+',
    'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1600&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'PUBLISHED',
    FALSE,
    18900,
    'a0000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '7 days'
),
(
    'c0000000-0000-0000-0000-000000000005',
    'Cyber Blood: Tokyo 2099',
    'cyber-blood-tokyo-2099',
    'In neon-drenched Tokyo, a bounty hunter augmented with forbidden neuro-tech tracks down an AI network that gained rogue consciousness.',
    2026,
    640,
    8.4,
    '17+',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    'READY',
    FALSE,
    1200,
    'a0000000-0000-0000-0000-000000000002',
    NULL
),
(
    'c0000000-0000-0000-0000-000000000006',
    'Midnight Eclipse (Processing)',
    'midnight-eclipse',
    'A secret underground society gathers during the total solar eclipse to trigger an ancient planetary mechanism.',
    2026,
    0,
    0.0,
    '13+',
    'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&q=80',
    'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1600&q=80',
    '',
    '',
    'PROCESSING',
    FALSE,
    0,
    'a0000000-0000-0000-0000-000000000002',
    NULL
);

-- Map Movie Categories
INSERT INTO movie_categories (movie_id, category_id) VALUES
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'), -- Action
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002'), -- Sci-Fi
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002'), -- Sci-Fi
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003'), -- Thriller
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005'), -- Anime/Animation
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000007'), -- Comedy
('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001'), -- Action
('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000005'), -- Anime/Animation
('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002'), -- Sci-Fi
('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003'); -- Thriller

-- Media Assets Multi-Resolution (480p, 720p, 1080p, 4K)
INSERT INTO media_assets (id, movie_id, type, resolution, codec, bitrate, url, status) VALUES
-- Tears of Steel Assets
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'MP4', '4K', 'h265', 18000000, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'READY'),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'MP4', '1080p', 'h264', 8000000, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'READY'),
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'MP4', '720p', 'h264', 4000000, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'READY'),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'MP4', '480p', 'h264', 1500000, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'READY'),
-- Cosmos Odyssey Assets
('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'MP4', '1080p', 'h264', 8000000, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'READY'),
('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 'MP4', '720p', 'h264', 4000000, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'READY'),
-- Big Buck Bunny Assets
('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000003', 'MP4', '4K', 'h265', 16000000, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'READY'),
('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000003', 'MP4', '1080p', 'h264', 8000000, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'READY'),
-- Sintel Assets
('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000004', 'MP4', '1080p', 'h264', 8000000, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 'READY');

-- Media Transcoding Jobs (Active / Demo Progress)
INSERT INTO media_jobs (id, movie_id, job_type, source_file, target_resolution, status, progress, error_message, created_at) VALUES
('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'TRANSCODE_4K', 'raw_eclipse_source_master.mov', '4K (2160p)', 'PROCESSING', 68, '', NOW() - INTERVAL '15 minutes'),
('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000006', 'TRANSCODE_1080P', 'raw_eclipse_source_master.mov', '1080p FHD', 'QUEUED', 0, '', NOW() - INTERVAL '15 minutes'),
('e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000005', 'TRANSCODE_4K', 'cyberblood_master.mov', '4K (2160p)', 'COMPLETED', 100, '', NOW() - INTERVAL '2 hours'),
('e0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000005', 'AUDIO_NORMALIZE', 'cyberblood_master.mov', '5.1 Surround', 'FAILED', 42, 'FFmpeg warning: invalid DTS audio frame packet header at 00:03:12', NOW() - INTERVAL '3 hours');

-- Subtitles
INSERT INTO subtitles (id, movie_id, language_code, label, file_url, is_default, status) VALUES
('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'id', 'Bahasa Indonesia', '/subtitles/tears_id.vtt', TRUE, 'ACTIVE'),
('f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'en', 'English [CC]', '/subtitles/tears_en.vtt', FALSE, 'ACTIVE'),
('f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'ja', 'Japanese (日本語)', '/subtitles/tears_ja.vtt', FALSE, 'ACTIVE'),
('f0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'id', 'Bahasa Indonesia', '/subtitles/cosmos_id.vtt', TRUE, 'ACTIVE'),
('f0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'en', 'English', '/subtitles/cosmos_en.vtt', FALSE, 'ACTIVE'),
('f0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', 'id', 'Bahasa Indonesia', '/subtitles/bunny_id.vtt', TRUE, 'ACTIVE');

-- Ad Campaigns
INSERT INTO ad_campaigns (id, name, status, start_at, end_at, priority, frequency_rule) VALUES
('10000000-0000-0000-0000-000000000001', 'Premium Ultra 4K Cyber Soundbar Promo', 'ACTIVE', NOW() - INTERVAL '10 days', NOW() + INTERVAL '30 days', 10, 1),
('10000000-0000-0000-0000-000000000002', 'IndoGaming Gear RTX 5090 Pre-Order', 'ACTIVE', NOW() - INTERVAL '5 days', NOW() + INTERVAL '20 days', 5, 2);

-- Ad Creatives (High quality sample video ad)
INSERT INTO ad_creatives (id, campaign_id, type, title, media_url, target_url, duration_seconds, skip_after_seconds) VALUES
(
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'PRE_ROLL',
    'Experience Sonic Clarity with MovieHub Pro Audio',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://moviehub.local/upgrade',
    15,
    5
),
(
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'PRE_ROLL',
    'Next-Gen Visuals: Powered by Antigravity Studio',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://moviehub.local/promo',
    15,
    5
);

-- Support / QRIS
INSERT INTO support_qris (id, title, description, qris_url, is_active, created_by) VALUES
(
    '30000000-0000-0000-0000-000000000001',
    'Dukung Pengembangan MovieHub Streaming',
    'Setiap donasi membantu kami membiayai server CDN kecepatan tinggi, lisensi film indie 4K, dan biaya operasional server. Terima kasih atas apresiasi Anda!',
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021226600014ID.LINKAJA.WWW011893600918000000000002150000000000000000303UME51440014ID.CO.QRIS.WWW0215ID10200234567890303UME5204549953033605802ID5916MOVIEHUB+INDONESIA6007JAKARTA61051234062070703A016304D12F',
    TRUE,
    'a0000000-0000-0000-0000-000000000001'
);

-- Initial Audit Logs
INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, resource, resource_id, metadata, ip_address) VALUES
('40000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Master Super Admin', 'SUPERADMIN', 'SYSTEM_INITIALIZE', 'DATABASE', 'SCHEMA_V1', '{"version": "1.0", "status": "successful"}', '127.0.0.1'),
('40000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Master Super Admin', 'SUPERADMIN', 'CREATE', 'QRIS', '30000000-0000-0000-0000-000000000001', '{"title": "Dukung Pengembangan MovieHub"}', '127.0.0.1'),
('40000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Content Ops Admin', 'ADMIN', 'PUBLISH', 'MOVIE', 'c0000000-0000-0000-0000-000000000001', '{"title": "Tears of Steel (4K Cyberpunk)"}', '127.0.0.1');

-- Playback Sessions (Initial Continue Watching)
INSERT INTO playback_sessions (id, user_id, movie_id, last_position_seconds, duration_seconds, completed, updated_at) VALUES
('50000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 320, 734, FALSE, NOW() - INTERVAL '2 hours'),
('50000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 450, 912, FALSE, NOW() - INTERVAL '1 day');

-- Initial System Configs
INSERT INTO system_configs (key, value, description) VALUES
('SITE_NAME', 'MovieHub Cinema', 'Streaming Platform Name'),
('DEFAULT_QUALITY', '1080p', 'Default playback resolution'),
('MAX_UPLOAD_SIZE_MB', '5120', 'Max upload file size in Megabytes'),
('ALLOW_REGISTRATION', 'true', 'Enable viewer registration'),
('AD_ENABLED', 'true', 'Enable video advertisements before playback'),
('MAINTENANCE_MODE', 'false', 'Enable maintenance mode');
