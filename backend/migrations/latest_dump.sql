--
-- PostgreSQL database dump
--

\restrict HmsLABx9IoSxVQdkfK2f5ei1ZgMUr9nIdGXUcKvCLpc4Ya3euITG0ap0lcYpF8y

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;


























































































































































































































































































































































SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.watchlists DROP CONSTRAINT IF EXISTS watchlists_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.watchlists DROP CONSTRAINT IF EXISTS watchlists_movie_id_fkey;
ALTER TABLE IF EXISTS ONLY public.support_qris DROP CONSTRAINT IF EXISTS support_qris_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.subtitles DROP CONSTRAINT IF EXISTS subtitles_movie_id_fkey;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.playback_sessions DROP CONSTRAINT IF EXISTS playback_sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.playback_sessions DROP CONSTRAINT IF EXISTS playback_sessions_movie_id_fkey;
ALTER TABLE IF EXISTS ONLY public.movies DROP CONSTRAINT IF EXISTS movies_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.movie_categories DROP CONSTRAINT IF EXISTS movie_categories_movie_id_fkey;
ALTER TABLE IF EXISTS ONLY public.movie_categories DROP CONSTRAINT IF EXISTS movie_categories_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.media_jobs DROP CONSTRAINT IF EXISTS media_jobs_movie_id_fkey;
ALTER TABLE IF EXISTS ONLY public.media_jobs DROP CONSTRAINT IF EXISTS media_jobs_asset_id_fkey;
ALTER TABLE IF EXISTS ONLY public.media_assets DROP CONSTRAINT IF EXISTS media_assets_movie_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_actor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ad_events DROP CONSTRAINT IF EXISTS ad_events_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ad_events DROP CONSTRAINT IF EXISTS ad_events_creative_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ad_events DROP CONSTRAINT IF EXISTS ad_events_campaign_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ad_creatives DROP CONSTRAINT IF EXISTS ad_creatives_campaign_id_fkey;
DROP INDEX IF EXISTS public.idx_users_role;
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_subtitles_movie_id;
DROP INDEX IF EXISTS public.idx_playback_user_movie;
DROP INDEX IF EXISTS public.idx_movies_status;
DROP INDEX IF EXISTS public.idx_movies_slug;
DROP INDEX IF EXISTS public.idx_movies_published_at;
DROP INDEX IF EXISTS public.idx_media_jobs_status;
DROP INDEX IF EXISTS public.idx_media_assets_movie_id;
DROP INDEX IF EXISTS public.idx_categories_slug;
DROP INDEX IF EXISTS public.idx_audit_logs_created_at;
DROP INDEX IF EXISTS public.idx_audit_logs_actor;
DROP INDEX IF EXISTS public.idx_ad_events_campaign;
ALTER TABLE IF EXISTS ONLY public.watchlists DROP CONSTRAINT IF EXISTS watchlists_user_id_movie_id_key;
ALTER TABLE IF EXISTS ONLY public.watchlists DROP CONSTRAINT IF EXISTS watchlists_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.system_configs DROP CONSTRAINT IF EXISTS system_configs_pkey;
ALTER TABLE IF EXISTS ONLY public.support_qris DROP CONSTRAINT IF EXISTS support_qris_pkey;
ALTER TABLE IF EXISTS ONLY public.subtitles DROP CONSTRAINT IF EXISTS subtitles_pkey;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_token_hash_key;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.playback_sessions DROP CONSTRAINT IF EXISTS playback_sessions_user_id_movie_id_key;
ALTER TABLE IF EXISTS ONLY public.playback_sessions DROP CONSTRAINT IF EXISTS playback_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.movies DROP CONSTRAINT IF EXISTS movies_slug_key;
ALTER TABLE IF EXISTS ONLY public.movies DROP CONSTRAINT IF EXISTS movies_pkey;
ALTER TABLE IF EXISTS ONLY public.movie_categories DROP CONSTRAINT IF EXISTS movie_categories_pkey;
ALTER TABLE IF EXISTS ONLY public.media_jobs DROP CONSTRAINT IF EXISTS media_jobs_pkey;
ALTER TABLE IF EXISTS ONLY public.media_assets DROP CONSTRAINT IF EXISTS media_assets_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_slug_key;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.ad_events DROP CONSTRAINT IF EXISTS ad_events_pkey;
ALTER TABLE IF EXISTS ONLY public.ad_creatives DROP CONSTRAINT IF EXISTS ad_creatives_pkey;
ALTER TABLE IF EXISTS ONLY public.ad_campaigns DROP CONSTRAINT IF EXISTS ad_campaigns_pkey;
DROP TABLE IF EXISTS public.watchlists;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.system_configs;
DROP TABLE IF EXISTS public.support_qris;
DROP TABLE IF EXISTS public.subtitles;
DROP TABLE IF EXISTS public.refresh_tokens;
DROP TABLE IF EXISTS public.playback_sessions;
DROP TABLE IF EXISTS public.movies;
DROP TABLE IF EXISTS public.movie_categories;
DROP TABLE IF EXISTS public.media_jobs;
DROP TABLE IF EXISTS public.media_assets;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.audit_logs;
DROP TABLE IF EXISTS public.ad_events;
DROP TABLE IF EXISTS public.ad_creatives;
DROP TABLE IF EXISTS public.ad_campaigns;
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ad_campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    start_at timestamp with time zone DEFAULT now(),
    end_at timestamp with time zone,
    priority integer DEFAULT 1,
    frequency_rule integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.ad_campaigns OWNER TO postgres;

--
-- Name: ad_creatives; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_creatives (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_id uuid,
    type character varying(50) DEFAULT 'PRE_ROLL'::character varying NOT NULL,
    title character varying(255) NOT NULL,
    media_url text NOT NULL,
    target_url text DEFAULT ''::text,
    duration_seconds integer DEFAULT 15,
    skip_after_seconds integer DEFAULT 5,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.ad_creatives OWNER TO postgres;

--
-- Name: ad_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id character varying(255) NOT NULL,
    campaign_id uuid,
    creative_id uuid,
    user_id uuid,
    event_type character varying(50) NOT NULL,
    occurred_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.ad_events OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_id uuid,
    actor_name character varying(255) DEFAULT 'System'::character varying,
    actor_role character varying(50) DEFAULT 'SYSTEM'::character varying,
    action character varying(100) NOT NULL,
    resource character varying(100) NOT NULL,
    resource_id character varying(255) DEFAULT ''::character varying,
    metadata jsonb DEFAULT '{}'::jsonb,
    ip_address character varying(100) DEFAULT ''::character varying,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text DEFAULT ''::text,
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: media_assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    movie_id uuid,
    type character varying(50) NOT NULL,
    resolution character varying(50) NOT NULL,
    codec character varying(50) DEFAULT 'h264'::character varying,
    bitrate integer DEFAULT 0,
    url text NOT NULL,
    status character varying(50) DEFAULT 'READY'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.media_assets OWNER TO postgres;

--
-- Name: media_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    movie_id uuid,
    asset_id uuid,
    job_type character varying(50) DEFAULT 'TRANSCODE'::character varying NOT NULL,
    source_file text NOT NULL,
    target_resolution character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'QUEUED'::character varying NOT NULL,
    progress integer DEFAULT 0,
    error_message text DEFAULT ''::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.media_jobs OWNER TO postgres;

--
-- Name: movie_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movie_categories (
    movie_id uuid NOT NULL,
    category_id uuid NOT NULL
);


ALTER TABLE public.movie_categories OWNER TO postgres;

--
-- Name: movies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    synopsis text DEFAULT ''::text,
    release_year integer DEFAULT 2026 NOT NULL,
    duration_seconds integer DEFAULT 0 NOT NULL,
    rating numeric(3,1) DEFAULT 8.5,
    age_rating character varying(10) DEFAULT '13+'::character varying,
    poster_url text DEFAULT ''::text,
    backdrop_url text DEFAULT ''::text,
    trailer_url text DEFAULT ''::text,
    video_source_url text DEFAULT ''::text,
    status character varying(50) DEFAULT 'DRAFT'::character varying NOT NULL,
    is_featured boolean DEFAULT false,
    views_count bigint DEFAULT 0,
    created_by uuid,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.movies OWNER TO postgres;

--
-- Name: playback_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.playback_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    movie_id uuid,
    last_position_seconds integer DEFAULT 0,
    duration_seconds integer DEFAULT 0,
    completed boolean DEFAULT false,
    started_at timestamp with time zone DEFAULT now(),
    ended_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.playback_sessions OWNER TO postgres;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: subtitles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subtitles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    movie_id uuid,
    language_code character varying(10) NOT NULL,
    label character varying(100) NOT NULL,
    file_url text NOT NULL,
    is_default boolean DEFAULT false,
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.subtitles OWNER TO postgres;

--
-- Name: support_qris; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.support_qris (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    description text DEFAULT ''::text,
    qris_url text NOT NULL,
    is_active boolean DEFAULT false,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.support_qris OWNER TO postgres;

--
-- Name: system_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_configs (
    key character varying(100) NOT NULL,
    value text NOT NULL,
    description text DEFAULT ''::text,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.system_configs OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'VIEWER'::character varying NOT NULL,
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    avatar_url text DEFAULT ''::text,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    username character varying(100)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: watchlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.watchlists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    movie_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.watchlists OWNER TO postgres;

--
-- Data for Name: ad_campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ad_campaigns (id, name, status, start_at, end_at, priority, frequency_rule, created_at, updated_at) FROM stdin;
10000000-0000-0000-0000-000000000001	Premium Ultra 4K Cyber Soundbar Promo	ACTIVE	2026-09-21 04:15:36.662792+00	2026-10-31 04:15:36.662792+00	10	1	2026-10-01 04:15:36.662792+00	2026-10-01 04:15:36.662792+00
10000000-0000-0000-0000-000000000002	IndoGaming Gear RTX 5090 Pre-Order	ACTIVE	2026-09-26 04:15:36.662792+00	2026-10-21 04:15:36.662792+00	5	2	2026-10-01 04:15:36.662792+00	2026-10-01 04:15:36.662792+00
\.


--
-- Data for Name: ad_creatives; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ad_creatives (id, campaign_id, type, title, media_url, target_url, duration_seconds, skip_after_seconds, created_at) FROM stdin;
20000000-0000-0000-0000-000000000001	10000000-0000-0000-0000-000000000001	PRE_ROLL	Experience Sonic Clarity with MovieHub Pro Audio	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4	https://moviehub.local/upgrade	15	5	2026-10-01 04:15:36.666723+00
20000000-0000-0000-0000-000000000002	10000000-0000-0000-0000-000000000002	PRE_ROLL	Next-Gen Visuals: Powered by Antigravity Studio	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4	https://moviehub.local/promo	15	5	2026-10-01 04:15:36.666723+00
\.


--
-- Data for Name: ad_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ad_events (id, session_id, campaign_id, creative_id, user_id, event_type, occurred_at) FROM stdin;
b235e656-1a48-48c5-8e65-22018b1bddb0	79175b15-454f-4486-a951-dce05dbce5cd	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	\N	impression	2026-10-01 04:19:35.983851+00
0335bb95-fad1-4c31-8b21-9134a2376452	79175b15-454f-4486-a951-dce05dbce5cd	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	\N	skip	2026-10-01 04:19:41.64767+00
5ae43222-1100-48b2-9e3b-17b5fa7b0c94	bed9b842-e249-4339-9273-64bcdac0e60f	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	\N	impression	2026-10-01 04:20:22.899588+00
1fb1b044-5127-45bb-b1f8-f4abfe8d8bee	b9567fda-acd3-4de7-9340-1a4b57957094	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	\N	impression	2026-10-01 06:50:03.403328+00
e0ae9f54-984a-4d6d-b2e6-865953203ab0	b9567fda-acd3-4de7-9340-1a4b57957094	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	\N	skip	2026-10-01 06:50:08.867763+00
fe3cca3b-db2f-433c-bb83-e5d542f14831	e270934e-197a-4c9d-83d8-a6652dceea0e	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	\N	impression	2026-10-01 06:56:07.940475+00
8212430a-1f1b-421d-84cc-d4139ff883d7	e270934e-197a-4c9d-83d8-a6652dceea0e	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	\N	skip	2026-10-01 06:56:13.264839+00
ac032242-3328-48df-9d3c-128b38fcf4d0	df1d0518-8191-4e17-8768-9d89eba1cabb	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000003	impression	2026-10-01 07:03:14.17114+00
86a00b1d-1ea0-4af8-bd72-dd0ba66adb08	da780a99-9c01-43e3-b6ae-2e1a68569d4d	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000003	impression	2026-10-01 07:08:44.591001+00
5abf6aff-5692-43a0-a49d-c940303d520b	da780a99-9c01-43e3-b6ae-2e1a68569d4d	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000003	skip	2026-10-01 07:08:50.006228+00
5c7d6a93-c9be-47e8-ac41-7bb71f907e4b	34d8b862-c114-4a69-a639-8ea1677cb1bb	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	impression	2026-10-01 07:29:51.101938+00
2916e0a5-ed08-4514-a457-992e4203bfaf	34d8b862-c114-4a69-a639-8ea1677cb1bb	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	skip	2026-10-01 07:29:56.667171+00
3f885e31-ad3b-408e-ba50-d4cb821be681	5a54c62c-9805-4727-a085-91a03ec777d3	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	impression	2026-10-01 07:31:04.893048+00
631006cc-3491-4b63-8d43-dc032fc36264	5a54c62c-9805-4727-a085-91a03ec777d3	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	skip	2026-10-01 07:31:10.474686+00
bd389c11-59ba-4f1a-994d-da0f81ddbd81	47e501b4-567a-459f-a03c-41b7627ebc87	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	\N	impression	2026-10-01 07:42:04.929761+00
f6c42e03-62c1-48b2-8e14-f7d6b99b4e25	47e501b4-567a-459f-a03c-41b7627ebc87	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	\N	skip	2026-10-01 07:42:11.539521+00
f9ce0914-6c22-4440-9c50-61c4e594c051	2c2a925c-0db7-4e73-84b2-b1dc64386abb	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	\N	impression	2026-10-01 07:42:24.490603+00
3c2c48e2-1311-41b8-a901-02157704a500	2c2a925c-0db7-4e73-84b2-b1dc64386abb	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	\N	skip	2026-10-01 07:42:30.023318+00
780d7b31-69b6-4561-9303-6b55bd95c15e	a71ccd62-f7e9-4426-b9df-42fb2726961b	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000003	impression	2026-10-01 07:43:07.352334+00
8f5ae383-10d9-4351-bbe7-88b678500b7c	a71ccd62-f7e9-4426-b9df-42fb2726961b	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000003	skip	2026-10-01 07:43:12.75671+00
c1722c11-f758-4b65-bfa5-fd55c80a74e8	1dce4373-b93b-403c-b2aa-9d95009d2d1c	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	impression	2026-10-01 07:43:42.694449+00
66ba271c-2499-43e3-80ca-1d0908493e90	1dce4373-b93b-403c-b2aa-9d95009d2d1c	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	skip	2026-10-01 07:43:48.207901+00
643b039c-8847-449c-b7b2-fb7f553c2db9	73c8d8fc-d466-4248-94a8-e92be41b23a0	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	impression	2026-10-01 07:44:44.020534+00
2c11a795-b919-445c-b40d-efafb46b20c6	73c8d8fc-d466-4248-94a8-e92be41b23a0	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	skip	2026-10-01 07:44:49.197705+00
d6d88344-24ef-490e-80f2-4cea961b5c65	f3abefd9-9622-436a-9199-83da0228e3f9	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	impression	2026-10-01 07:47:09.823519+00
b28a0a12-06bd-4ad0-9883-d73b8ffa7b28	f3abefd9-9622-436a-9199-83da0228e3f9	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	skip	2026-10-01 07:47:15.351607+00
c6b119d4-921a-4739-82ac-017e333323a0	dba15f2c-30b2-4d01-946e-a443491ca838	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	impression	2026-10-01 08:00:08.532213+00
ad4715db-df9d-48ae-acc5-d333e7fe50b4	dba15f2c-30b2-4d01-946e-a443491ca838	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	skip	2026-10-01 08:00:13.669476+00
519be625-0a39-4c0a-835c-4255794f041f	9fceae75-4792-4b6a-9aeb-0d6b3e25be0c	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	impression	2026-10-01 08:00:27.922356+00
f75d281c-27c4-4dd7-8581-c8822cb792d9	9fceae75-4792-4b6a-9aeb-0d6b3e25be0c	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	skip	2026-10-01 08:00:33.084081+00
02a80250-99ee-4334-9f02-aec49ce04c2b	196debb8-529b-4da2-8ef0-5f6f8715b765	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	impression	2026-10-01 08:00:41.208271+00
366679c2-9267-459c-9a5f-7f8b754e9764	196debb8-529b-4da2-8ef0-5f6f8715b765	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	skip	2026-10-01 08:00:46.516499+00
476f189b-1968-427d-842a-a5847e542550	84c3da6d-c050-454f-abff-47a530abcda7	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	impression	2026-10-01 08:02:52.823702+00
bda50955-b71e-4250-bdd0-b90a2fae0a7f	84c3da6d-c050-454f-abff-47a530abcda7	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	skip	2026-10-01 08:02:58.303173+00
78210b40-37ae-4c4e-8721-6be964687e17	ee73697e-4822-4276-9836-9f8136900fa9	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	impression	2026-10-01 08:03:27.735159+00
7075ef05-a128-4c68-a369-d49cb5d30b7b	ee73697e-4822-4276-9836-9f8136900fa9	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	skip	2026-10-01 08:03:32.994571+00
65504132-2f04-466d-82c4-119ac4af6809	722b74c6-5bd2-448e-8a6f-c2a4faa2dc61	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	impression	2026-10-01 08:04:33.792342+00
a6942c68-8dec-4ff9-94d9-5e8684956d8d	722b74c6-5bd2-448e-8a6f-c2a4faa2dc61	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	skip	2026-10-01 08:04:39.016681+00
892e923d-734f-45f4-920c-b5a140d4040e	4302f9ce-0728-47b2-9fce-259cf63ea010	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	impression	2026-10-01 08:23:33.895501+00
b3ae4a06-2ad8-444f-bc0d-037fdee7f7e2	4302f9ce-0728-47b2-9fce-259cf63ea010	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	skip	2026-10-01 08:23:39.334391+00
941da6c9-f510-4830-954f-1e5d6c6594ac	7e2d76b4-2802-4e5a-8d28-a9251286b2de	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	impression	2026-10-01 08:27:49.850249+00
2d09b0c1-4ab4-4afe-8067-c9d37a905375	7e2d76b4-2802-4e5a-8d28-a9251286b2de	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	skip	2026-10-01 08:27:55.258397+00
8321e06a-57e6-4fef-81c5-c228b0b174de	ade6e7b6-3804-4a6d-bb4c-5f86a7640430	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	\N	impression	2026-10-01 09:38:32.739282+00
ca764ca9-1089-4506-a813-7776b52fbde9	ade6e7b6-3804-4a6d-bb4c-5f86a7640430	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	\N	skip	2026-10-01 09:38:38.230626+00
a69a9aaa-afa2-4875-98bc-d0c80d1e7041	756e7f60-11c6-4893-8ad4-3cedf5739a4c	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	impression	2026-10-02 09:13:11.786807+00
a9893e85-635d-46b5-b8b7-33c4bc926ea1	756e7f60-11c6-4893-8ad4-3cedf5739a4c	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	skip	2026-10-02 09:13:17.693038+00
f2590dec-eaac-4a59-966d-e3717955acf7	bebfd5f3-55e4-489d-9fb4-59099bb6339b	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	\N	impression	2026-10-02 09:55:58.775912+00
300988fa-bdec-40c5-bc73-66bf1d1d6639	bebfd5f3-55e4-489d-9fb4-59099bb6339b	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	\N	skip	2026-10-02 09:56:04.497737+00
13c3f288-89dd-453f-a445-45982905857b	05f0f3b7-3b8b-4048-b490-b7efcbba7077	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	impression	2026-10-02 11:48:51.616979+00
c94efd60-a301-4a7d-a1a0-95f6d4262f38	05f0f3b7-3b8b-4048-b490-b7efcbba7077	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	skip	2026-10-02 11:48:56.991766+00
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, actor_id, actor_name, actor_role, action, resource, resource_id, metadata, ip_address, created_at) FROM stdin;
40000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000001	Master Super Admin	SUPERADMIN	SYSTEM_INITIALIZE	DATABASE	SCHEMA_V1	{"status": "successful", "version": "1.0"}	127.0.0.1	2026-10-01 04:15:36.675507+00
40000000-0000-0000-0000-000000000002	a0000000-0000-0000-0000-000000000001	Master Super Admin	SUPERADMIN	CREATE	QRIS	30000000-0000-0000-0000-000000000001	{"title": "Dukung Pengembangan MovieHub"}	127.0.0.1	2026-10-01 04:15:36.675507+00
40000000-0000-0000-0000-000000000003	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	PUBLISH	MOVIE	c0000000-0000-0000-0000-000000000001	{"title": "Tears of Steel (4K Cyberpunk)"}	127.0.0.1	2026-10-01 04:15:36.675507+00
7acb5a19-da88-4974-9263-d40ba9a3b3ac	a0000000-0000-0000-0000-000000000001	Master Super Admin	SUPERADMIN	LOGIN	AUTH		{"email": "superadmin@moviehub.com"}	172.19.0.1	2026-10-01 04:22:52.306141+00
52d79d92-e793-419f-89fa-2f8611d52451	a0000000-0000-0000-0000-000000000001	Master Super Admin	SUPERADMIN	LOGIN	AUTH		{"email": "superadmin@moviehub.com"}	172.19.0.1	2026-10-01 06:51:46.211472+00
125c2cd0-1982-4bf5-9f01-a99ac4ff26f4	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	LOGIN	AUTH		{"email": "admin@moviehub.com"}	172.19.0.1	2026-10-01 06:51:52.338247+00
bfc585c8-4755-475d-b163-282b1ba5ed53	a0000000-0000-0000-0000-000000000003	Movie Enthusiast	VIEWER	LOGIN	AUTH		{"email": "user@moviehub.com"}	172.19.0.1	2026-10-01 06:52:00.402545+00
218811dc-1695-4629-843c-952f72be8f56	a0000000-0000-0000-0000-000000000001	Master Super Admin	SUPERADMIN	LOGIN	AUTH		{"email": "superadmin@moviehub.com"}	172.19.0.5	2026-10-01 06:52:45.268953+00
08f3c6ec-3487-4f70-8244-51c6ba55d037	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	LOGIN	AUTH		{"email": "admin@moviehub.com"}	172.19.0.5	2026-10-01 06:53:39.000401+00
22d20cec-37b7-4275-9272-83fe238d3b76	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	PUBLISH_MOVIE	MOVIE	c0000000-0000-0000-0000-000000000005	{"title": "Cyber Blood: Tokyo 2099"}		2026-10-01 06:55:59.020752+00
1e3ea507-e290-488c-96f2-d5d40c5ccda5	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	PUBLISH_MOVIE	MOVIE	c0000000-0000-0000-0000-000000000006	{"title": "Midnight Eclipse (Processing)"}		2026-10-01 06:56:00.426936+00
7d261ad3-f221-4ec7-ae8e-48973c50749b	a0000000-0000-0000-0000-000000000003	Movie Enthusiast	VIEWER	LOGIN	AUTH		{"email": "user@moviehub.com"}	172.19.0.5	2026-10-01 07:03:09.701619+00
b3b2266c-da45-4190-b7e4-84869a9d8be1	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	LOGIN	AUTH		{"email": "admin@moviehub.com"}	172.19.0.1	2026-10-01 07:06:52.014893+00
69cc9ec4-9168-4ee4-812f-c12e0c34310d	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	LOGIN	AUTH		{"email": "admin@moviehub.com"}	172.19.0.1	2026-10-01 07:07:25.520954+00
a7451b8b-45c6-41a4-b7ef-3cfc394c5474	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	UPLOAD_VIDEO_CHUNKED	MEDIA		{"url": "/uploads/videos/f74a5adb-d460-4272-b723-96265fb2a8a5.mkv", "filename": "cyberpunk_2099_trailer.mkv", "size_bytes": 6291456}		2026-10-01 07:07:26.119929+00
20d35f95-826f-484a-abb2-7daa09490501	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	LOGIN	AUTH		{"email": "admin@moviehub.com"}	172.19.0.1	2026-10-01 07:08:22.79939+00
12a250a7-669e-4c73-9553-a214eedb0710	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	CREATE_MOVIE	MOVIE	f507a648-e31e-45b6-8ca5-3879a2b8f185	{"title": "Neon Odyssey 2099", "status": "PROCESSING"}		2026-10-01 07:08:22.825469+00
9249740f-f702-46c0-aee0-34a2696d1db3	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	START_TRANSCODE	MEDIA	f507a648-e31e-45b6-8ca5-3879a2b8f185	{"movie_title": "Neon Odyssey 2099", "resolutions": 2}		2026-10-01 07:08:23.287151+00
ef6f2f15-0905-4d38-95ef-b3806f63e83b	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	UPLOAD_VIDEO_CHUNKED	MEDIA	f507a648-e31e-45b6-8ca5-3879a2b8f185	{"url": "/uploads/videos/801bcaec-8b81-46ff-a436-9a603c874501.mp4", "filename": "neon_odyssey_4k_master.mp4", "size_bytes": 4194304}		2026-10-01 07:08:23.290611+00
81430f95-e087-40f0-9450-572b2abd881f	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	LOGIN	AUTH		{"email": "admin@moviehub.com"}	172.19.0.5	2026-10-01 07:09:10.271023+00
8a80d43b-05b5-469a-a9a4-f14ecafd71b0	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	PUBLISH_MOVIE	MOVIE	f507a648-e31e-45b6-8ca5-3879a2b8f185	{"title": "Neon Odyssey 2099"}		2026-10-01 07:09:13.867753+00
604439af-63f0-4515-afa7-12b9f2cb0186	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	LOGIN	AUTH		{"email": "admin@moviehub.com"}	172.19.0.5	2026-10-01 07:18:16.002322+00
170cc4e7-ad13-4bfb-a9a4-d5a24f1c9158	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	CREATE_MOVIE	MOVIE	af696033-f206-4b34-a34d-494d00230ff5	{"title": "TENSEI SITARA EPISODE 14", "status": "PROCESSING"}		2026-10-01 07:28:59.367522+00
51f8a02c-e9e6-45b3-acef-966dfa3b357f	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	START_TRANSCODE	MEDIA	af696033-f206-4b34-a34d-494d00230ff5	{"movie_title": "TENSEI SITARA EPISODE 14", "resolutions": 4}		2026-10-01 07:29:22.650816+00
24e02b13-1894-4333-ae06-92953c29366a	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	UPLOAD_VIDEO_CHUNKED	MEDIA	af696033-f206-4b34-a34d-494d00230ff5	{"url": "/uploads/videos/9dd9f3d2-d7aa-4630-b55b-f022fd02e21a.mkv", "filename": "Otakudesu.io_TenseiSlime.S4--14_Mkv720p.mkv", "size_bytes": 249271368}		2026-10-01 07:29:22.654611+00
dcb7897e-3e00-49e3-b662-15ddf0cc7420	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	PUBLISH_MOVIE	MOVIE	af696033-f206-4b34-a34d-494d00230ff5	{"title": "TENSEI SITARA EPISODE 14"}		2026-10-01 07:29:45.179349+00
0d09dfb9-7d70-4079-a6ec-e59fba15319e	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	UNPUBLISH_MOVIE	MOVIE	af696033-f206-4b34-a34d-494d00230ff5	{"title": "TENSEI SITARA EPISODE 14"}		2026-10-01 07:30:23.099429+00
8b0999bd-69fb-442d-bf87-57f1b9731f1a	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	PUBLISH_MOVIE	MOVIE	af696033-f206-4b34-a34d-494d00230ff5	{"title": "TENSEI SITARA EPISODE 14"}		2026-10-01 07:30:24.168606+00
8f873ad5-57bd-4345-8dfb-e5b7a55fe1e3	a0000000-0000-0000-0000-000000000003	Movie Enthusiast	VIEWER	LOGIN	AUTH		{"email": "user@moviehub.com"}	172.19.0.1	2026-10-01 07:43:04.782837+00
64910b87-1580-45da-bb36-02cbae958664	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	LOGIN	AUTH		{"email": "admin@moviehub.com"}	172.19.0.1	2026-10-01 07:43:35.168249+00
1ea81d02-31e5-4dc3-a898-5d0bd9f80fef	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	LOGIN	AUTH		{"email": "admin@moviehub.com"}	172.19.0.1	2026-10-01 07:58:05.772074+00
0999a634-8ade-4368-9158-ebdfba7293d6	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	UPDATE_MOVIE	MOVIE	af696033-f206-4b34-a34d-494d00230ff5	{"title": "TENSEI SITARA EPISODE 14 [Updated 4K Edition]", "status": "PUBLISHED"}		2026-10-01 07:58:05.832445+00
d101b0c9-0a5e-4267-adfa-a260cf4a0f55	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	UPDATE_MOVIE	MOVIE	af696033-f206-4b34-a34d-494d00230ff5	{"title": "TENSEI SITARA EPISODE 14 [Updated 4K Edition]", "status": "PUBLISHED"}		2026-10-01 08:00:01.196419+00
74256275-e30c-42a0-a408-1df0af7ac118	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	DELETE_MOVIE	MOVIE	af696033-f206-4b34-a34d-494d00230ff5	{"title": "TENSEI SITARA EPISODE 14 [Updated 4K Edition]"}		2026-10-01 08:01:21.776975+00
9ffbf613-1052-4e66-b41e-16c1af11ade2	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	CREATE_MOVIE	MOVIE	18a7e9d3-e82f-4d80-9493-0bde2332a319	{"title": "TENSEI HITARA", "status": "PROCESSING"}		2026-10-01 08:01:59.266502+00
368537b3-52d7-414c-a828-ef44d40ea274	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	START_TRANSCODE	MEDIA	18a7e9d3-e82f-4d80-9493-0bde2332a319	{"movie_title": "TENSEI HITARA", "resolutions": 4}		2026-10-01 08:02:30.772958+00
d26dfe41-c331-47e5-a934-c1e3672a9062	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	UPLOAD_VIDEO_CHUNKED	MEDIA	18a7e9d3-e82f-4d80-9493-0bde2332a319	{"url": "/uploads/videos/f6692850-9c51-4cde-a438-bf8923ebe461.mkv", "filename": "Otakudesu.io_TenseiSlime.S4--14_Mkv720p.mkv", "size_bytes": 249271368}		2026-10-01 08:02:30.776896+00
5bb7533a-103b-4e59-8dd6-e2fcf2e92d08	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	PUBLISH_MOVIE	MOVIE	18a7e9d3-e82f-4d80-9493-0bde2332a319	{"title": "TENSEI HITARA"}		2026-10-01 08:02:44.747295+00
c6293c61-683c-4329-8349-a410d8652133	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	UPDATE_MOVIE	MOVIE	18a7e9d3-e82f-4d80-9493-0bde2332a319	{"title": "TENSEI HITARA", "status": "PUBLISHED"}		2026-10-01 08:03:21.226939+00
80a2da43-fdea-47d0-b9e5-3c1788bd9483	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	LOGIN	AUTH		{"email": "admin@moviehub.com"}	172.19.0.2	2026-10-02 09:12:35.332591+00
af133985-9cd5-4e72-9655-c19735bf3442	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	UPDATE_MOVIE	MOVIE	18a7e9d3-e82f-4d80-9493-0bde2332a319	{"title": "TENSEI HITARA", "status": "PUBLISHED"}		2026-10-02 09:13:02.445024+00
cf80a062-cbe4-41ba-bcdc-fcedab9f63e5	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	LOGIN	AUTH		{"email": "admin@moviehub.com"}	172.19.0.2	2026-10-02 11:39:14.729771+00
58d75ac2-5d24-49d8-a415-cb61eb883cc6	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	CREATE_MOVIE	MOVIE	1c2f369f-5d72-41b2-9142-f353f610eb0a	{"title": "NEKO - 1", "status": "PROCESSING"}		2026-10-02 11:41:21.523087+00
b60cdf56-4e08-4f40-a899-f848f7864eec	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	START_TRANSCODE	MEDIA	1c2f369f-5d72-41b2-9142-f353f610eb0a	{"movie_title": "NEKO - 1", "resolutions": 4}		2026-10-02 11:42:40.337069+00
2e3bd796-8b61-4087-b0bf-aa24cc2393eb	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	UPLOAD_VIDEO_CHUNKED	MEDIA	1c2f369f-5d72-41b2-9142-f353f610eb0a	{"url": "/uploads/videos/dfbeecec-a805-4c76-a6ef-faf90cf8f53e.mp4", "filename": "[NekoPoi] Kohakuiro no Hunter The Animation - 01 [1080P] [nekopoi.care].mp4", "size_bytes": 348315501}		2026-10-02 11:42:40.341202+00
0e9c6722-e4a7-49aa-8e66-8a6c10211be9	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	CREATE_MOVIE	MOVIE	987bd41d-afc5-45f2-824b-5d4b48edc811	{"title": "NEKO - 2", "status": "PROCESSING"}		2026-10-02 11:43:55.165917+00
4d7e6ced-10a1-40c7-8148-3cd95885a0c6	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	START_TRANSCODE	MEDIA	987bd41d-afc5-45f2-824b-5d4b48edc811	{"movie_title": "NEKO - 2", "resolutions": 4}		2026-10-02 11:46:11.865147+00
da77398d-eeed-4d9a-8a36-715b3ce31946	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	UPLOAD_VIDEO_CHUNKED	MEDIA	987bd41d-afc5-45f2-824b-5d4b48edc811	{"url": "/uploads/videos/2235d324-13e0-4eed-be7c-1d87e6b4997f.mp4", "filename": "[NekoPoi] Kohakuiro no Hunter The Animation - 02 [1080P] [nekopoi.care].mp4", "size_bytes": 203635140}		2026-10-02 11:46:11.872448+00
7ba5b66c-ef24-4765-8537-95ddc4feec7c	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	PUBLISH_MOVIE	MOVIE	987bd41d-afc5-45f2-824b-5d4b48edc811	{"title": "NEKO - 2"}		2026-10-02 11:48:14.895065+00
e8a58806-967b-4e72-be79-1ede19a1da4b	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	UNPUBLISH_MOVIE	MOVIE	987bd41d-afc5-45f2-824b-5d4b48edc811	{"title": "NEKO - 2"}		2026-10-02 11:48:16.010979+00
26058a3e-1f7f-4983-8beb-88d9aafe6fe4	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	PUBLISH_MOVIE	MOVIE	1c2f369f-5d72-41b2-9142-f353f610eb0a	{"title": "NEKO - 1"}		2026-10-02 11:48:17.605935+00
9b2d8571-9b61-44b4-a545-2e9c00c65c8e	a0000000-0000-0000-0000-000000000002	Content Ops Admin	ADMIN	PUBLISH_MOVIE	MOVIE	987bd41d-afc5-45f2-824b-5d4b48edc811	{"title": "NEKO - 2"}		2026-10-02 11:48:20.800302+00
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, description, status, created_at, updated_at) FROM stdin;
b0000000-0000-0000-0000-000000000001	Action & Adventure	action-adventure	Adrenaline-packed blockbusters and epic quests	ACTIVE	2026-10-01 04:15:36.61946+00	2026-10-01 04:15:36.61946+00
b0000000-0000-0000-0000-000000000002	Sci-Fi & Cyberpunk	sci-fi-cyberpunk	Futuristic technologies, dystopian worlds, and cosmos	ACTIVE	2026-10-01 04:15:36.61946+00	2026-10-01 04:15:36.61946+00
b0000000-0000-0000-0000-000000000003	Thriller & Mystery	thriller-mystery	High-tension suspense, detectives, and plot twists	ACTIVE	2026-10-01 04:15:36.61946+00	2026-10-01 04:15:36.61946+00
b0000000-0000-0000-0000-000000000004	Drama & Romance	drama-romance	Emotional storytelling, heartbreak, and triumph	ACTIVE	2026-10-01 04:15:36.61946+00	2026-10-01 04:15:36.61946+00
b0000000-0000-0000-0000-000000000005	Anime & Animation	anime-animation	Top-tier animation masterpieces and fantasy worlds	ACTIVE	2026-10-01 04:15:36.61946+00	2026-10-01 04:15:36.61946+00
b0000000-0000-0000-0000-000000000006	Horror & Supernatural	horror-supernatural	Spine-chilling scares, ghosts, and psychological horror	ACTIVE	2026-10-01 04:15:36.61946+00	2026-10-01 04:15:36.61946+00
b0000000-0000-0000-0000-000000000007	Comedy	comedy	Laugh-out-loud humor and heartwarming comedies	ACTIVE	2026-10-01 04:15:36.61946+00	2026-10-01 04:15:36.61946+00
\.


--
-- Data for Name: media_assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media_assets (id, movie_id, type, resolution, codec, bitrate, url, status, created_at) FROM stdin;
d0000000-0000-0000-0000-000000000001	c0000000-0000-0000-0000-000000000001	MP4	4K	h265	18000000	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4	READY	2026-10-01 04:15:36.646652+00
d0000000-0000-0000-0000-000000000002	c0000000-0000-0000-0000-000000000001	MP4	1080p	h264	8000000	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4	READY	2026-10-01 04:15:36.646652+00
d0000000-0000-0000-0000-000000000003	c0000000-0000-0000-0000-000000000001	MP4	720p	h264	4000000	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4	READY	2026-10-01 04:15:36.646652+00
d0000000-0000-0000-0000-000000000004	c0000000-0000-0000-0000-000000000001	MP4	480p	h264	1500000	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4	READY	2026-10-01 04:15:36.646652+00
d0000000-0000-0000-0000-000000000005	c0000000-0000-0000-0000-000000000002	MP4	1080p	h264	8000000	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4	READY	2026-10-01 04:15:36.646652+00
d0000000-0000-0000-0000-000000000006	c0000000-0000-0000-0000-000000000002	MP4	720p	h264	4000000	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4	READY	2026-10-01 04:15:36.646652+00
d0000000-0000-0000-0000-000000000007	c0000000-0000-0000-0000-000000000003	MP4	4K	h265	16000000	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4	READY	2026-10-01 04:15:36.646652+00
d0000000-0000-0000-0000-000000000008	c0000000-0000-0000-0000-000000000003	MP4	1080p	h264	8000000	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4	READY	2026-10-01 04:15:36.646652+00
d0000000-0000-0000-0000-000000000009	c0000000-0000-0000-0000-000000000004	MP4	1080p	h264	8000000	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4	READY	2026-10-01 04:15:36.646652+00
aa766b88-0d04-45da-9926-6999a1ffb72e	c0000000-0000-0000-0000-000000000006	MP4	1080p	h264	8000000	raw_eclipse_source_master.mov	READY	2026-10-01 04:15:45.066035+00
cd4a5a4e-f75e-4687-bd50-6150aed4f893	f507a648-e31e-45b6-8ca5-3879a2b8f185	MP4	1080p	h264	8000000	/uploads/videos/801bcaec-8b81-46ff-a436-9a603c874501.mp4	READY	2026-10-01 07:08:24.462304+00
ee2374e2-d7cd-4744-bbfc-45133dc3dcf1	f507a648-e31e-45b6-8ca5-3879a2b8f185	MP4	720p	h264	4000000	/uploads/videos/801bcaec-8b81-46ff-a436-9a603c874501.mp4	READY	2026-10-01 07:08:26.357988+00
b7076565-b9f9-4853-99a5-5aba1743124d	18a7e9d3-e82f-4d80-9493-0bde2332a319	MP4	720p	h264	4000000	/uploads/videos/18a7e9d3-e82f-4d80-9493-0bde2332a319_720p.mp4	READY	2026-10-01 08:22:03.014392+00
43ca6ae2-15e2-4520-ad7e-76e71e2bfb57	18a7e9d3-e82f-4d80-9493-0bde2332a319	MP4	4K	h264	18000000	/uploads/videos/f6692850-9c51-4cde-a438-bf8923ebe461.mkv	READY	2026-10-01 08:36:56.310083+00
\.


--
-- Data for Name: media_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media_jobs (id, movie_id, asset_id, job_type, source_file, target_resolution, status, progress, error_message, created_at, updated_at) FROM stdin;
e0000000-0000-0000-0000-000000000001	c0000000-0000-0000-0000-000000000006	\N	TRANSCODE_4K	raw_eclipse_source_master.mov	4K (2160p)	PROCESSING	68		2026-10-01 04:00:36.652752+00	2026-10-01 04:15:36.652752+00
e0000000-0000-0000-0000-000000000003	c0000000-0000-0000-0000-000000000005	\N	TRANSCODE_4K	cyberblood_master.mov	4K (2160p)	COMPLETED	100		2026-10-01 02:15:36.652752+00	2026-10-01 04:15:36.652752+00
e0000000-0000-0000-0000-000000000004	c0000000-0000-0000-0000-000000000005	\N	AUDIO_NORMALIZE	cyberblood_master.mov	5.1 Surround	FAILED	42	FFmpeg warning: invalid DTS audio frame packet header at 00:03:12	2026-10-01 01:15:36.652752+00	2026-10-01 04:15:36.652752+00
e0000000-0000-0000-0000-000000000002	c0000000-0000-0000-0000-000000000006	\N	TRANSCODE_1080P	raw_eclipse_source_master.mov	1080p FHD	COMPLETED	100		2026-10-01 04:00:36.652752+00	2026-10-01 04:15:45.08133+00
9d553ab9-a81d-48f8-b7fb-af1b06cb2b10	18a7e9d3-e82f-4d80-9493-0bde2332a319	\N	TRANSCODE	/uploads/videos/f6692850-9c51-4cde-a438-bf8923ebe461.mkv	720p HD	COMPLETED	100		2026-10-01 08:02:30.761945+00	2026-10-01 08:22:03.037612+00
2f3783af-0c9d-4d73-9928-d622a2247323	f507a648-e31e-45b6-8ca5-3879a2b8f185	\N	TRANSCODE	/uploads/videos/801bcaec-8b81-46ff-a436-9a603c874501.mp4	1080p FHD	COMPLETED	100		2026-10-01 07:08:23.280824+00	2026-10-01 07:08:24.466046+00
0efd61ff-55ed-43a8-86df-2a8fa32f0210	f507a648-e31e-45b6-8ca5-3879a2b8f185	\N	TRANSCODE	/uploads/videos/801bcaec-8b81-46ff-a436-9a603c874501.mp4	720p HD	COMPLETED	100		2026-10-01 07:08:23.284044+00	2026-10-01 07:08:26.370496+00
38604687-0667-4076-83dd-b04cdbea1b04	18a7e9d3-e82f-4d80-9493-0bde2332a319	\N	TRANSCODE	/uploads/videos/f6692850-9c51-4cde-a438-bf8923ebe461.mkv	480p SD	PROCESSING	65		2026-10-01 08:02:30.765604+00	2026-10-01 08:22:03.090947+00
f8b93161-349b-4f10-acc1-1bd6c6ffbc42	18a7e9d3-e82f-4d80-9493-0bde2332a319	\N	TRANSCODE	/uploads/videos/f6692850-9c51-4cde-a438-bf8923ebe461.mkv	4K (2160p)	COMPLETED	100		2026-10-01 08:02:30.769416+00	2026-10-01 08:36:56.323008+00
09eaa131-e71a-4805-8b09-a734094d10f5	1c2f369f-5d72-41b2-9142-f353f610eb0a	\N	TRANSCODE	/uploads/videos/dfbeecec-a805-4c76-a6ef-faf90cf8f53e.mp4	720p HD	QUEUED	0		2026-10-02 11:42:40.324518+00	2026-10-02 11:42:40.324518+00
ecb53015-65d1-48f4-a1ab-ea2c94b2f6d2	1c2f369f-5d72-41b2-9142-f353f610eb0a	\N	TRANSCODE	/uploads/videos/dfbeecec-a805-4c76-a6ef-faf90cf8f53e.mp4	480p SD	QUEUED	0		2026-10-02 11:42:40.329253+00	2026-10-02 11:42:40.329253+00
51c91707-dae7-4a5b-bc3c-125af6e6e7cc	1c2f369f-5d72-41b2-9142-f353f610eb0a	\N	TRANSCODE	/uploads/videos/dfbeecec-a805-4c76-a6ef-faf90cf8f53e.mp4	4K (2160p)	QUEUED	0		2026-10-02 11:42:40.333116+00	2026-10-02 11:42:40.333116+00
1db9a2ac-2401-4c0d-a153-c46407326f27	18a7e9d3-e82f-4d80-9493-0bde2332a319	\N	TRANSCODE	/uploads/videos/f6692850-9c51-4cde-a438-bf8923ebe461.mkv	1080p FHD	PROCESSING	65		2026-10-01 08:02:30.757083+00	2026-10-01 08:02:31.979391+00
f18e1990-8cb8-4792-91d4-28d40dc5a9b7	1c2f369f-5d72-41b2-9142-f353f610eb0a	\N	TRANSCODE	/uploads/videos/dfbeecec-a805-4c76-a6ef-faf90cf8f53e.mp4	1080p FHD	PROCESSING	65		2026-10-02 11:42:40.31836+00	2026-10-02 11:42:41.587135+00
a2c8d977-77bd-4288-8e3d-f2b6d4213cf9	987bd41d-afc5-45f2-824b-5d4b48edc811	\N	TRANSCODE	/uploads/videos/2235d324-13e0-4eed-be7c-1d87e6b4997f.mp4	1080p FHD	QUEUED	0		2026-10-02 11:46:11.834418+00	2026-10-02 11:46:11.834418+00
bf1af38c-7590-4d37-bbe9-eddb26ad5158	987bd41d-afc5-45f2-824b-5d4b48edc811	\N	TRANSCODE	/uploads/videos/2235d324-13e0-4eed-be7c-1d87e6b4997f.mp4	720p HD	QUEUED	0		2026-10-02 11:46:11.845263+00	2026-10-02 11:46:11.845263+00
a740316b-a730-45c1-8777-b0613e29ee5c	987bd41d-afc5-45f2-824b-5d4b48edc811	\N	TRANSCODE	/uploads/videos/2235d324-13e0-4eed-be7c-1d87e6b4997f.mp4	480p SD	QUEUED	0		2026-10-02 11:46:11.850224+00	2026-10-02 11:46:11.850224+00
34aa13c9-ef00-4521-9a1e-87d994eb51ff	987bd41d-afc5-45f2-824b-5d4b48edc811	\N	TRANSCODE	/uploads/videos/2235d324-13e0-4eed-be7c-1d87e6b4997f.mp4	4K (2160p)	QUEUED	0		2026-10-02 11:46:11.85513+00	2026-10-02 11:46:11.85513+00
\.


--
-- Data for Name: movie_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movie_categories (movie_id, category_id) FROM stdin;
c0000000-0000-0000-0000-000000000001	b0000000-0000-0000-0000-000000000001
c0000000-0000-0000-0000-000000000001	b0000000-0000-0000-0000-000000000002
c0000000-0000-0000-0000-000000000002	b0000000-0000-0000-0000-000000000002
c0000000-0000-0000-0000-000000000002	b0000000-0000-0000-0000-000000000003
c0000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000005
c0000000-0000-0000-0000-000000000003	b0000000-0000-0000-0000-000000000007
c0000000-0000-0000-0000-000000000004	b0000000-0000-0000-0000-000000000001
c0000000-0000-0000-0000-000000000004	b0000000-0000-0000-0000-000000000005
c0000000-0000-0000-0000-000000000005	b0000000-0000-0000-0000-000000000002
c0000000-0000-0000-0000-000000000006	b0000000-0000-0000-0000-000000000003
18a7e9d3-e82f-4d80-9493-0bde2332a319	b0000000-0000-0000-0000-000000000001
18a7e9d3-e82f-4d80-9493-0bde2332a319	b0000000-0000-0000-0000-000000000004
18a7e9d3-e82f-4d80-9493-0bde2332a319	b0000000-0000-0000-0000-000000000005
18a7e9d3-e82f-4d80-9493-0bde2332a319	b0000000-0000-0000-0000-000000000007
1c2f369f-5d72-41b2-9142-f353f610eb0a	b0000000-0000-0000-0000-000000000001
1c2f369f-5d72-41b2-9142-f353f610eb0a	b0000000-0000-0000-0000-000000000005
987bd41d-afc5-45f2-824b-5d4b48edc811	b0000000-0000-0000-0000-000000000005
987bd41d-afc5-45f2-824b-5d4b48edc811	b0000000-0000-0000-0000-000000000001
987bd41d-afc5-45f2-824b-5d4b48edc811	b0000000-0000-0000-0000-000000000004
\.


--
-- Data for Name: movies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movies (id, title, slug, synopsis, release_year, duration_seconds, rating, age_rating, poster_url, backdrop_url, trailer_url, video_source_url, status, is_featured, views_count, created_by, published_at, created_at, updated_at) FROM stdin;
c0000000-0000-0000-0000-000000000001	Tears of Steel (4K Cyberpunk)	tears-of-steel	In a dystopian future of Neo-Amsterdam, a group of scientists and soldiers attempt to reset the past to save humanity from destructive cybernetic titans.	2026	734	9.2	17+	https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80	https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4	PUBLISHED	t	14820	a0000000-0000-0000-0000-000000000001	2026-09-26 04:15:36.626801+00	2026-10-01 04:15:36.626801+00	2026-10-01 04:15:36.626801+00
c0000000-0000-0000-0000-000000000002	Cosmos Odyssey: Beyond The Void	cosmos-odyssey	Deep interstellar exploration uncovering an ancient cosmic beacon that alters the perception of time, space, and reality for human survivors.	2025	912	8.9	13+	https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80	https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&q=80	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4	PUBLISHED	t	9320	a0000000-0000-0000-0000-000000000002	2026-09-28 04:15:36.626801+00	2026-10-01 04:15:36.626801+00	2026-10-01 04:15:36.626801+00
c0000000-0000-0000-0000-000000000003	Big Buck Bunny: Red Revenge	big-buck-bunny	A gentle forest rabbit takes on mischievous bullies in this acclaimed animation classic, now remastered in vibrant 4K resolution and dynamic audio.	2026	596	8.7	SU	https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80	https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1600&q=80	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4	PUBLISHED	f	22400	a0000000-0000-0000-0000-000000000002	2026-09-21 04:15:36.626801+00	2026-10-01 04:15:36.626801+00	2026-10-01 04:15:36.626801+00
c0000000-0000-0000-0000-000000000004	Sintel: The Dragon Quest	sintel-dragon-quest	A lonely warrior girl searches across snow-capped peaks and treacherous deserts to rescue her beloved baby dragon captured by a fearsome predator.	2025	888	9.1	13+	https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80	https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1600&q=80	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4	PUBLISHED	f	18900	a0000000-0000-0000-0000-000000000002	2026-09-24 04:15:36.626801+00	2026-10-01 04:15:36.626801+00	2026-10-01 04:15:36.626801+00
c0000000-0000-0000-0000-000000000005	Cyber Blood: Tokyo 2099	cyber-blood-tokyo-2099	In neon-drenched Tokyo, a bounty hunter augmented with forbidden neuro-tech tracks down an AI network that gained rogue consciousness.	2026	640	8.4	17+	https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80	https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&q=80	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4	PUBLISHED	f	1200	a0000000-0000-0000-0000-000000000002	2026-10-01 06:55:59.005508+00	2026-10-01 04:15:36.626801+00	2026-10-01 06:55:59.005508+00
c0000000-0000-0000-0000-000000000006	Midnight Eclipse (Processing)	midnight-eclipse	A secret underground society gathers during the total solar eclipse to trigger an ancient planetary mechanism.	2026	0	0.0	13+	https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&q=80	https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1600&q=80			PUBLISHED	f	0	a0000000-0000-0000-0000-000000000002	2026-10-01 06:56:00.413668+00	2026-10-01 04:15:36.626801+00	2026-10-01 06:56:00.413668+00
f507a648-e31e-45b6-8ca5-3879a2b8f185	Neon Odyssey 2099	neon-odyssey-2099	Petualangan luar angkasa epik melintasi dimensi cyber.	2026	7200	9.1	13+	https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800	https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600		/uploads/videos/801bcaec-8b81-46ff-a436-9a603c874501.mp4	PUBLISHED	t	0	a0000000-0000-0000-0000-000000000002	2026-10-01 07:09:13.860278+00	2026-10-01 07:08:22.81871+00	2026-10-01 07:09:13.860278+00
18a7e9d3-e82f-4d80-9493-0bde2332a319	TENSEI HITARA	tensei-hitara	ANIME	2026	7199	8.5	13+	https://i.pinimg.com/236x/0d/4d/ee/0d4deefe50d8d93fc68fa4b537e10770.jpg	https://i.pinimg.com/236x/0d/4d/ee/0d4deefe50d8d93fc68fa4b537e10770.jpg		/uploads/videos/f6692850-9c51-4cde-a438-bf8923ebe461.mkv	PUBLISHED	t	0	a0000000-0000-0000-0000-000000000002	2026-10-01 08:02:44.732156+00	2026-10-01 08:01:59.249157+00	2026-10-02 09:13:02.434439+00
1c2f369f-5d72-41b2-9142-f353f610eb0a	NEKO - 1	neko-1	NEKO	2026	7200	8.5	13+	https://i.pinimg.com/736x/b4/6d/bc/b46dbcecb6d40f6341fdfda49e8faa62.jpg	https://i.pinimg.com/736x/b4/6d/bc/b46dbcecb6d40f6341fdfda49e8faa62.jpg		/uploads/videos/dfbeecec-a805-4c76-a6ef-faf90cf8f53e.mp4	PUBLISHED	f	0	a0000000-0000-0000-0000-000000000002	2026-10-02 11:48:17.537854+00	2026-10-02 11:41:21.486813+00	2026-10-02 11:48:17.537854+00
987bd41d-afc5-45f2-824b-5d4b48edc811	NEKO - 2	neko-2	NEKO - 2	2026	7200	8.5	13+	https://i.pinimg.com/736x/b3/bf/4a/b3bf4ac0d5646a4c2eaf6abfd7803ac7.jpg	https://i.pinimg.com/736x/b3/bf/4a/b3bf4ac0d5646a4c2eaf6abfd7803ac7.jpg		/uploads/videos/2235d324-13e0-4eed-be7c-1d87e6b4997f.mp4	PUBLISHED	f	0	a0000000-0000-0000-0000-000000000002	2026-10-02 11:48:20.781881+00	2026-10-02 11:43:55.083403+00	2026-10-02 11:48:20.781881+00
\.


--
-- Data for Name: playback_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.playback_sessions (id, user_id, movie_id, last_position_seconds, duration_seconds, completed, started_at, ended_at, created_at, updated_at) FROM stdin;
50000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000003	c0000000-0000-0000-0000-000000000001	320	734	f	2026-10-01 04:15:36.681214+00	\N	2026-10-01 04:15:36.681214+00	2026-10-01 02:15:36.681214+00
50000000-0000-0000-0000-000000000002	a0000000-0000-0000-0000-000000000003	c0000000-0000-0000-0000-000000000002	450	912	f	2026-10-01 04:15:36.681214+00	\N	2026-10-01 04:15:36.681214+00	2026-09-30 04:15:36.681214+00
13f10d89-574b-40db-b02f-513cb75efe87	a0000000-0000-0000-0000-000000000002	18a7e9d3-e82f-4d80-9493-0bde2332a319	993	1440	f	2026-10-02 09:13:27.784078+00	\N	2026-10-02 09:13:27.784078+00	2026-10-02 09:32:17.78452+00
fa2888ba-5b9b-4ecb-8159-0122663dcf72	a0000000-0000-0000-0000-000000000002	1c2f369f-5d72-41b2-9142-f353f610eb0a	390	1658	f	2026-10-02 11:49:09.277523+00	\N	2026-10-02 11:49:09.277523+00	2026-10-02 11:49:19.246178+00
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token_hash, expires_at, revoked_at, created_at) FROM stdin;
b7c40d1b-cf31-45ff-a5dc-e32a892f40ab	a0000000-0000-0000-0000-000000000001	76f7d8e3570def79d0928453529b3c44f8c4a70a9bdcbd18570ac50f552a230c	2026-10-08 04:22:52.301124+00	\N	2026-10-01 04:22:52.302051+00
18dad52c-1bee-4ae7-b3c4-a49551bf70c6	a0000000-0000-0000-0000-000000000001	f19f178f81fbf833cc83184ee7e62cf71a42a1b09a164072e98da74338130cc3	2026-10-08 06:51:46.206549+00	\N	2026-10-01 06:51:46.207916+00
1b12c313-bc8a-40b9-81d3-1e9790306a2e	a0000000-0000-0000-0000-000000000002	73e43154a33cbe0b80212adb202b4ce849914b6417de8c82e06a8c3cc3cd151b	2026-10-08 06:51:52.335212+00	\N	2026-10-01 06:51:52.335664+00
81b20e09-11c7-423d-95df-c3e23781581e	a0000000-0000-0000-0000-000000000003	abca36d8599988e75d246ba7163dadbc387f8b1cd50ad7ae35f66b4efc0fe945	2026-10-08 06:52:00.39931+00	\N	2026-10-01 06:52:00.399751+00
f3b7de5a-b1d7-493e-95a7-7246f7bba38e	a0000000-0000-0000-0000-000000000001	136ad5ecdfde61059505aa69fcaad258cee8389bdfa8c62ce4efd0937f226374	2026-10-08 06:52:45.263486+00	2026-10-01 06:53:29.783299+00	2026-10-01 06:52:45.2641+00
0a016be3-1b49-4fa2-99f6-bda585335edd	a0000000-0000-0000-0000-000000000002	56383cf45aac76096189acd520ba03105937d28be7e2a70ec479ffcc4600a9a4	2026-10-08 06:53:38.995388+00	2026-10-01 06:56:02.59495+00	2026-10-01 06:53:38.996255+00
3746b5af-8824-4f94-b25a-b3a8a39a36ec	a0000000-0000-0000-0000-000000000002	0ea043056d0fd0edb0d22d258280efd16bc85f850d60ef64007d498e25d8e287	2026-10-08 07:06:52.007302+00	\N	2026-10-01 07:06:52.008766+00
5a90cd89-d61f-4f22-8a6a-cf668f4d36b2	a0000000-0000-0000-0000-000000000002	ba95919cb17395bc4d9002bb814123435332aa944b021c0b342310be7eb6003b	2026-10-08 07:07:25.517661+00	\N	2026-10-01 07:07:25.518028+00
e3de1310-e3e3-4284-9d0d-caaaed181442	a0000000-0000-0000-0000-000000000002	9703382bb353b925a2cee9473b1648708d19a11194a193b2a4275c4594b8935e	2026-10-08 07:08:22.796177+00	\N	2026-10-01 07:08:22.796605+00
2cd63228-da21-4f89-b0ee-784e529e744a	a0000000-0000-0000-0000-000000000003	be99cefcdc859953f0f45f77a97eae1848003e3310f4d3c2e324206674ce264c	2026-10-08 07:03:09.696439+00	2026-10-01 07:08:59.672341+00	2026-10-01 07:03:09.69744+00
5d8fd274-d1d6-4a10-8a23-3c3fb0b230a7	a0000000-0000-0000-0000-000000000002	90941b32f8e7a70bcc36a563405fa357750c6d529dc2a440cfcfcd97f7904794	2026-10-08 07:09:10.266097+00	\N	2026-10-01 07:09:10.266727+00
d099dab8-8433-465a-ac97-7c1354a777a7	a0000000-0000-0000-0000-000000000002	a890c2cf44e8d9f549ad80b045e628f84579258b18f343571e5dd930101620c5	2026-10-08 07:18:15.997098+00	\N	2026-10-01 07:18:15.998432+00
feca93af-1d5a-47a8-a9f0-259809115fd0	a0000000-0000-0000-0000-000000000003	4b7d58a18e06a3a543a75af9fed5ead28d58171aaaa7262911bfb066643799c6	2026-10-08 07:43:04.765085+00	2026-10-01 07:43:26.853069+00	2026-10-01 07:43:04.767781+00
20038c6f-81b2-4240-b7a0-23821c43de96	a0000000-0000-0000-0000-000000000002	a562bbc44848d64df0aab0160792f332cb82a292989d9151af1b1b48ec560397	2026-10-08 07:43:35.138652+00	\N	2026-10-01 07:43:35.140139+00
3b64ffc6-e970-4e28-8ea3-35cef806316a	a0000000-0000-0000-0000-000000000002	ddf78689f669f13dfc3570b613420721397f17bac1695c887f4312258bfeaf4c	2026-10-08 07:58:05.767786+00	\N	2026-10-01 07:58:05.768503+00
5b75f97b-d59f-49d3-8453-77a12d8e13aa	a0000000-0000-0000-0000-000000000002	052b0249f6cada25f5ad45799c0389a4263540c35b5c6709e021d33abb28aa4b	2026-10-09 09:12:35.323+00	\N	2026-10-02 09:12:35.325849+00
dbba2ffb-5ab0-421a-87d1-00e9e1d4aa53	a0000000-0000-0000-0000-000000000002	d9c0cbc24af44ba22106ab4d91f4a62c1a5b3ac25861eed1142e1ceddc2bd0a5	2026-10-09 11:39:14.675427+00	\N	2026-10-02 11:39:14.681405+00
\.


--
-- Data for Name: subtitles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subtitles (id, movie_id, language_code, label, file_url, is_default, status, created_at, updated_at) FROM stdin;
f0000000-0000-0000-0000-000000000001	c0000000-0000-0000-0000-000000000001	id	Bahasa Indonesia	/subtitles/tears_id.vtt	t	ACTIVE	2026-10-01 04:15:36.658389+00	2026-10-01 04:15:36.658389+00
f0000000-0000-0000-0000-000000000002	c0000000-0000-0000-0000-000000000001	en	English [CC]	/subtitles/tears_en.vtt	f	ACTIVE	2026-10-01 04:15:36.658389+00	2026-10-01 04:15:36.658389+00
f0000000-0000-0000-0000-000000000003	c0000000-0000-0000-0000-000000000001	ja	Japanese (日本語)	/subtitles/tears_ja.vtt	f	ACTIVE	2026-10-01 04:15:36.658389+00	2026-10-01 04:15:36.658389+00
f0000000-0000-0000-0000-000000000004	c0000000-0000-0000-0000-000000000002	id	Bahasa Indonesia	/subtitles/cosmos_id.vtt	t	ACTIVE	2026-10-01 04:15:36.658389+00	2026-10-01 04:15:36.658389+00
f0000000-0000-0000-0000-000000000005	c0000000-0000-0000-0000-000000000002	en	English	/subtitles/cosmos_en.vtt	f	ACTIVE	2026-10-01 04:15:36.658389+00	2026-10-01 04:15:36.658389+00
f0000000-0000-0000-0000-000000000006	c0000000-0000-0000-0000-000000000003	id	Bahasa Indonesia	/subtitles/bunny_id.vtt	t	ACTIVE	2026-10-01 04:15:36.658389+00	2026-10-01 04:15:36.658389+00
\.


--
-- Data for Name: support_qris; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.support_qris (id, title, description, qris_url, is_active, created_by, created_at, updated_at) FROM stdin;
30000000-0000-0000-0000-000000000001	Dukung Pengembangan MovieHub Streaming	Setiap donasi membantu kami membiayai server CDN kecepatan tinggi, lisensi film indie 4K, dan biaya operasional server. Terima kasih atas apresiasi Anda!	https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021226600014ID.LINKAJA.WWW011893600918000000000002150000000000000000303UME51440014ID.CO.QRIS.WWW0215ID10200234567890303UME5204549953033605802ID5916MOVIEHUB+INDONESIA6007JAKARTA61051234062070703A016304D12F	t	a0000000-0000-0000-0000-000000000001	2026-10-01 04:15:36.671851+00	2026-10-01 04:15:36.671851+00
\.


--
-- Data for Name: system_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_configs (key, value, description, updated_at) FROM stdin;
SITE_NAME	MovieHub Cinema	Streaming Platform Name	2026-10-01 04:15:36.685898+00
DEFAULT_QUALITY	1080p	Default playback resolution	2026-10-01 04:15:36.685898+00
MAX_UPLOAD_SIZE_MB	5120	Max upload file size in Megabytes	2026-10-01 04:15:36.685898+00
ALLOW_REGISTRATION	true	Enable viewer registration	2026-10-01 04:15:36.685898+00
AD_ENABLED	true	Enable video advertisements before playback	2026-10-01 04:15:36.685898+00
MAINTENANCE_MODE	false	Enable maintenance mode	2026-10-01 04:15:36.685898+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, name, role, status, avatar_url, last_login_at, created_at, updated_at, username) FROM stdin;
a0000000-0000-0000-0000-000000000001	superadmin@moviehub.com	$2a$10$P0UTlQQ3A2AbkPDcd7nWBesZaKg/ok6r874GUjmiI/om.sYVW5y3q	Master Super Admin	SUPERADMIN	ACTIVE		2026-10-01 06:52:45.257374+00	2026-10-01 04:15:36.613827+00	2026-10-01 06:52:45.257374+00	superadmin
a0000000-0000-0000-0000-000000000003	user@moviehub.com	$2a$10$1LzxwT2kSKQ4ASL.rW77K.DcM.gAIhR4QJf6Pic/ipJoMhwpcqbdC	Movie Enthusiast	VIEWER	ACTIVE		2026-10-01 07:43:04.752466+00	2026-10-01 04:15:36.613827+00	2026-10-01 07:43:04.752466+00	user
a0000000-0000-0000-0000-000000000002	admin@moviehub.com	$2a$10$fLbLPk6h0LwrjSGjydxQ4eqCelxbYyii4Z94I12rSw2ocpKXsYU0.	Content Ops Admin	ADMIN	ACTIVE		2026-10-02 11:39:14.575572+00	2026-10-01 04:15:36.613827+00	2026-10-02 11:39:14.575572+00	admin
\.


--
-- Data for Name: watchlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.watchlists (id, user_id, movie_id, created_at) FROM stdin;
\.


--
-- Name: ad_campaigns ad_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_campaigns
    ADD CONSTRAINT ad_campaigns_pkey PRIMARY KEY (id);


--
-- Name: ad_creatives ad_creatives_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_creatives
    ADD CONSTRAINT ad_creatives_pkey PRIMARY KEY (id);


--
-- Name: ad_events ad_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_events
    ADD CONSTRAINT ad_events_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: media_assets media_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_pkey PRIMARY KEY (id);


--
-- Name: media_jobs media_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_jobs
    ADD CONSTRAINT media_jobs_pkey PRIMARY KEY (id);


--
-- Name: movie_categories movie_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movie_categories
    ADD CONSTRAINT movie_categories_pkey PRIMARY KEY (movie_id, category_id);


--
-- Name: movies movies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_pkey PRIMARY KEY (id);


--
-- Name: movies movies_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_slug_key UNIQUE (slug);


--
-- Name: playback_sessions playback_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playback_sessions
    ADD CONSTRAINT playback_sessions_pkey PRIMARY KEY (id);


--
-- Name: playback_sessions playback_sessions_user_id_movie_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playback_sessions
    ADD CONSTRAINT playback_sessions_user_id_movie_id_key UNIQUE (user_id, movie_id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: subtitles subtitles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtitles
    ADD CONSTRAINT subtitles_pkey PRIMARY KEY (id);


--
-- Name: support_qris support_qris_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_qris
    ADD CONSTRAINT support_qris_pkey PRIMARY KEY (id);


--
-- Name: system_configs system_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_configs
    ADD CONSTRAINT system_configs_pkey PRIMARY KEY (key);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: watchlists watchlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlists
    ADD CONSTRAINT watchlists_pkey PRIMARY KEY (id);


--
-- Name: watchlists watchlists_user_id_movie_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlists
    ADD CONSTRAINT watchlists_user_id_movie_id_key UNIQUE (user_id, movie_id);


--
-- Name: idx_ad_events_campaign; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ad_events_campaign ON public.ad_events USING btree (campaign_id);


--
-- Name: idx_audit_logs_actor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_actor ON public.audit_logs USING btree (actor_id);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_categories_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categories_slug ON public.categories USING btree (slug);


--
-- Name: idx_media_assets_movie_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_assets_movie_id ON public.media_assets USING btree (movie_id);


--
-- Name: idx_media_jobs_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_jobs_status ON public.media_jobs USING btree (status);


--
-- Name: idx_movies_published_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movies_published_at ON public.movies USING btree (published_at);


--
-- Name: idx_movies_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movies_slug ON public.movies USING btree (slug);


--
-- Name: idx_movies_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movies_status ON public.movies USING btree (status);


--
-- Name: idx_playback_user_movie; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_playback_user_movie ON public.playback_sessions USING btree (user_id, movie_id);


--
-- Name: idx_subtitles_movie_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subtitles_movie_id ON public.subtitles USING btree (movie_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: ad_creatives ad_creatives_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_creatives
    ADD CONSTRAINT ad_creatives_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.ad_campaigns(id) ON DELETE CASCADE;


--
-- Name: ad_events ad_events_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_events
    ADD CONSTRAINT ad_events_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.ad_campaigns(id) ON DELETE CASCADE;


--
-- Name: ad_events ad_events_creative_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_events
    ADD CONSTRAINT ad_events_creative_id_fkey FOREIGN KEY (creative_id) REFERENCES public.ad_creatives(id) ON DELETE CASCADE;


--
-- Name: ad_events ad_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_events
    ADD CONSTRAINT ad_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: media_assets media_assets_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE;


--
-- Name: media_jobs media_jobs_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_jobs
    ADD CONSTRAINT media_jobs_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.media_assets(id) ON DELETE SET NULL;


--
-- Name: media_jobs media_jobs_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_jobs
    ADD CONSTRAINT media_jobs_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE;


--
-- Name: movie_categories movie_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movie_categories
    ADD CONSTRAINT movie_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: movie_categories movie_categories_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movie_categories
    ADD CONSTRAINT movie_categories_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE;


--
-- Name: movies movies_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: playback_sessions playback_sessions_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playback_sessions
    ADD CONSTRAINT playback_sessions_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE;


--
-- Name: playback_sessions playback_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playback_sessions
    ADD CONSTRAINT playback_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: subtitles subtitles_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtitles
    ADD CONSTRAINT subtitles_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE;


--
-- Name: support_qris support_qris_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_qris
    ADD CONSTRAINT support_qris_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: watchlists watchlists_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlists
    ADD CONSTRAINT watchlists_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE;


--
-- Name: watchlists watchlists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlists
    ADD CONSTRAINT watchlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict HmsLABx9IoSxVQdkfK2f5ei1ZgMUr9nIdGXUcKvCLpc4Ya3euITG0ap0lcYpF8y

