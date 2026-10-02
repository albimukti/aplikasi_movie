// MovieHub Cinema - Cloud Database & API Simulator
// Ensures 24/7 uptime on Vercel even when external backend container is offline

export const MOCK_CATEGORIES = [
  { id: 'b0000000-0000-0000-0000-000000000001', name: 'Action & Adventure', slug: 'action-adventure', description: 'Adrenaline-packed blockbusters and epic quests', status: 'ACTIVE' },
  { id: 'b0000000-0000-0000-0000-000000000002', name: 'Sci-Fi & Cyberpunk', slug: 'sci-fi-cyberpunk', description: 'Futuristic technologies, dystopian worlds, and cosmos', status: 'ACTIVE' },
  { id: 'b0000000-0000-0000-0000-000000000003', name: 'Thriller & Mystery', slug: 'thriller-mystery', description: 'High-tension suspense, detectives, and plot twists', status: 'ACTIVE' },
  { id: 'b0000000-0000-0000-0000-000000000004', name: 'Drama & Romance', slug: 'drama-romance', description: 'Emotional storytelling, heartbreak, and triumph', status: 'ACTIVE' },
  { id: 'b0000000-0000-0000-0000-000000000005', name: 'Anime & Animation', slug: 'anime-animation', description: 'Top-tier animation masterpieces and fantasy worlds', status: 'ACTIVE' },
  { id: 'b0000000-0000-0000-0000-000000000006', name: 'Horror & Supernatural', slug: 'horror-supernatural', description: 'Spine-chilling scares, ghosts, and psychological horror', status: 'ACTIVE' },
  { id: 'b0000000-0000-0000-0000-000000000007', name: 'Comedy', slug: 'comedy', description: 'Laugh-out-loud humor and heartwarming comedies', status: 'ACTIVE' },
];

export const MOCK_MOVIES = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    title: 'Tears of Steel (4K Cyberpunk)',
    slug: 'tears-of-steel',
    synopsis: 'In a dystopian future of Neo-Amsterdam, a group of scientists and soldiers attempt to reset the past to save humanity from destructive cybernetic titans.',
    release_year: 2026,
    duration_seconds: 734,
    rating: 9.2,
    age_rating: '17+',
    poster_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80',
    trailer_url: 'https://vjs.zencdn.net/v/oceans.mp4',
    video_source_url: 'https://vjs.zencdn.net/v/oceans.mp4',
    status: 'PUBLISHED',
    is_featured: true,
    views_count: 14820,
    categories: [MOCK_CATEGORIES[0], MOCK_CATEGORIES[1]],
    media_assets: [
      { id: 'm1', type: 'MP4', resolution: '4K', url: 'https://vjs.zencdn.net/v/oceans.mp4' },
      { id: 'm2', type: 'MP4', resolution: '1080p', url: 'https://vjs.zencdn.net/v/oceans.mp4' },
      { id: 'm3', type: 'MP4', resolution: '720p', url: 'https://media.w3.org/2010/05/bunny/trailer.mp4' },
    ],
    subtitles: [
      { id: 's1', language_code: 'id', label: 'Bahasa Indonesia', file_url: '/subtitles/tears_id.vtt', is_default: true },
      { id: 's2', language_code: 'en', label: 'English [CC]', file_url: '/subtitles/tears_en.vtt', is_default: false },
    ],
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    title: 'Cosmos Odyssey: Beyond The Void',
    slug: 'cosmos-odyssey',
    synopsis: 'Deep interstellar exploration uncovering an ancient cosmic beacon that alters the perception of time, space, and reality for human survivors.',
    release_year: 2025,
    duration_seconds: 912,
    rating: 8.9,
    age_rating: '13+',
    poster_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&q=80',
    trailer_url: 'https://vjs.zencdn.net/v/oceans.mp4',
    video_source_url: 'https://vjs.zencdn.net/v/oceans.mp4',
    status: 'PUBLISHED',
    is_featured: true,
    views_count: 9320,
    categories: [MOCK_CATEGORIES[1], MOCK_CATEGORIES[2]],
    media_assets: [
      { id: 'm4', type: 'MP4', resolution: '1080p', url: 'https://vjs.zencdn.net/v/oceans.mp4' },
      { id: 'm4_720', type: 'MP4', resolution: '720p', url: 'https://media.w3.org/2010/05/bunny/trailer.mp4' },
    ],
    subtitles: [
      { id: 's3', language_code: 'id', label: 'Bahasa Indonesia', file_url: '/subtitles/cosmos_id.vtt', is_default: true },
    ],
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    title: 'Big Buck Bunny: Red Revenge',
    slug: 'big-buck-bunny',
    synopsis: 'A gentle forest rabbit takes on mischievous bullies in this acclaimed animation classic, now remastered in vibrant 4K resolution and dynamic audio.',
    release_year: 2026,
    duration_seconds: 596,
    rating: 8.7,
    age_rating: 'SU',
    poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1600&q=80',
    trailer_url: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
    video_source_url: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
    status: 'PUBLISHED',
    is_featured: false,
    views_count: 22400,
    categories: [MOCK_CATEGORIES[4], MOCK_CATEGORIES[6]],
    media_assets: [
      { id: 'm5', type: 'MP4', resolution: '4K', url: 'https://media.w3.org/2010/05/bunny/trailer.mp4' },
      { id: 'm6', type: 'MP4', resolution: '1080p', url: 'https://media.w3.org/2010/05/bunny/trailer.mp4' },
      { id: 'm6_720', type: 'MP4', resolution: '720p', url: 'https://media.w3.org/2010/05/video/movie_300.mp4' },
    ],
    subtitles: [
      { id: 's4', language_code: 'id', label: 'Bahasa Indonesia', file_url: '/subtitles/bunny_id.vtt', is_default: true },
    ],
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    title: 'Sintel: The Dragon Quest',
    slug: 'sintel-dragon-quest',
    synopsis: 'A lonely warrior girl searches across snow-capped peaks and treacherous deserts to rescue her beloved baby dragon captured by a fearsome predator.',
    release_year: 2025,
    duration_seconds: 888,
    rating: 9.1,
    age_rating: '13+',
    poster_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1600&q=80',
    trailer_url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    video_source_url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    status: 'PUBLISHED',
    is_featured: false,
    views_count: 18900,
    categories: [MOCK_CATEGORIES[0], MOCK_CATEGORIES[4]],
    media_assets: [
      { id: 'm7', type: 'MP4', resolution: '1080p', url: 'https://media.w3.org/2010/05/sintel/trailer.mp4' },
      { id: 'm7_720', type: 'MP4', resolution: '720p', url: 'https://media.w3.org/2010/05/video/movie_300.mp4' },
    ],
    subtitles: [],
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    title: 'Cyber Blood: Tokyo 2099',
    slug: 'cyber-blood-tokyo-2099',
    synopsis: 'In neon-drenched Tokyo, a bounty hunter augmented with forbidden neuro-tech tracks down an AI network that gained rogue consciousness.',
    release_year: 2026,
    duration_seconds: 640,
    rating: 8.4,
    age_rating: '17+',
    poster_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&q=80',
    trailer_url: 'https://vjs.zencdn.net/v/oceans.mp4',
    video_source_url: 'https://vjs.zencdn.net/v/oceans.mp4',
    status: 'PUBLISHED',
    is_featured: false,
    views_count: 1200,
    categories: [MOCK_CATEGORIES[1]],
    media_assets: [
      { id: 'm8', type: 'MP4', resolution: '1080p', url: 'https://vjs.zencdn.net/v/oceans.mp4' },
    ],
    subtitles: [],
  },
  {
    id: 'f507a648-e31e-45b6-8ca5-3879a2b8f185',
    title: 'Neon Odyssey 2099',
    slug: 'neon-odyssey-2099',
    synopsis: 'Petualangan luar angkasa epik melintasi dimensi cyber.',
    release_year: 2026,
    duration_seconds: 7200,
    rating: 9.1,
    age_rating: '13+',
    poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800',
    backdrop_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600',
    trailer_url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    video_source_url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    status: 'PUBLISHED',
    is_featured: true,
    views_count: 3500,
    categories: [MOCK_CATEGORIES[0], MOCK_CATEGORIES[1]],
    media_assets: [
      { id: 'm9', type: 'MP4', resolution: '1080p', url: 'https://media.w3.org/2010/05/sintel/trailer.mp4' },
      { id: 'm9_720', type: 'MP4', resolution: '720p', url: 'https://media.w3.org/2010/05/bunny/trailer.mp4' },
    ],
    subtitles: [],
  },
  {
    id: '18a7e9d3-e82f-4d80-9493-0bde2332a319',
    title: 'TENSEI HITARA',
    slug: 'tensei-hitara',
    synopsis: 'Petualangan anime epik reinkarnasi dunia lain dengan kekuatan magis dan aksi pertempuran sinematik.',
    release_year: 2026,
    duration_seconds: 7199,
    rating: 8.5,
    age_rating: '13+',
    poster_url: 'https://i.pinimg.com/236x/0d/4d/ee/0d4deefe50d8d93fc68fa4b537e10770.jpg',
    backdrop_url: 'https://i.pinimg.com/236x/0d/4d/ee/0d4deefe50d8d93fc68fa4b537e10770.jpg',
    trailer_url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    video_source_url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    status: 'PUBLISHED',
    is_featured: true,
    views_count: 5120,
    categories: [MOCK_CATEGORIES[0], MOCK_CATEGORIES[3], MOCK_CATEGORIES[4], MOCK_CATEGORIES[6]],
    media_assets: [
      { id: 'm10', type: 'MP4', resolution: '1080p', url: 'https://media.w3.org/2010/05/sintel/trailer.mp4' },
      { id: 'm10_720', type: 'MP4', resolution: '720p', url: 'https://media.w3.org/2010/05/bunny/trailer.mp4' },
    ],
    subtitles: [],
  },
  {
    id: '1c2f369f-5d72-41b2-9142-f353f610eb0a',
    title: 'NEKO - 1',
    slug: 'neko-1',
    synopsis: 'Kisah petualangan karakter neko yang menggemaskan dan penuh misteri di kota metropolitan modern.',
    release_year: 2026,
    duration_seconds: 7200,
    rating: 8.5,
    age_rating: '13+',
    poster_url: 'https://i.pinimg.com/736x/b4/6d/bc/b46dbcecb6d40f6341fdfda49e8faa62.jpg',
    backdrop_url: 'https://i.pinimg.com/736x/b4/6d/bc/b46dbcecb6d40f6341fdfda49e8faa62.jpg',
    trailer_url: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
    video_source_url: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
    status: 'PUBLISHED',
    is_featured: false,
    views_count: 4200,
    categories: [MOCK_CATEGORIES[0], MOCK_CATEGORIES[4]],
    media_assets: [
      { id: 'm11', type: 'MP4', resolution: '1080p', url: 'https://media.w3.org/2010/05/bunny/trailer.mp4' },
    ],
    subtitles: [],
  },
  {
    id: '987bd41d-afc5-45f2-824b-5d4b48edc811',
    title: 'NEKO - 2',
    slug: 'neko-2',
    synopsis: 'Lanjutan kisah persahabatan dan aksi dunia fantasi neko dalam menghadapi ancaman dimensi bayangan.',
    release_year: 2026,
    duration_seconds: 7200,
    rating: 8.5,
    age_rating: '13+',
    poster_url: 'https://i.pinimg.com/736x/b3/bf/4a/b3bf4ac0d5646a4c2eaf6abfd7803ac7.jpg',
    backdrop_url: 'https://i.pinimg.com/736x/b3/bf/4a/b3bf4ac0d5646a4c2eaf6abfd7803ac7.jpg',
    trailer_url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    video_source_url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    status: 'PUBLISHED',
    is_featured: false,
    views_count: 6700,
    categories: [MOCK_CATEGORIES[0], MOCK_CATEGORIES[3], MOCK_CATEGORIES[4]],
    media_assets: [
      { id: 'm12', type: 'MP4', resolution: '1080p', url: 'https://media.w3.org/2010/05/sintel/trailer.mp4' },
    ],
    subtitles: [],
  },
  {
    id: 'c0000000-0000-0000-0000-000000000006',
    title: 'Midnight Eclipse',
    slug: 'midnight-eclipse',
    synopsis: 'A secret underground society gathers during the total solar eclipse to trigger an ancient planetary mechanism.',
    release_year: 2026,
    duration_seconds: 5400,
    rating: 8.0,
    age_rating: '13+',
    poster_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1600&q=80',
    trailer_url: 'https://vjs.zencdn.net/v/oceans.mp4',
    video_source_url: 'https://vjs.zencdn.net/v/oceans.mp4',
    status: 'PUBLISHED',
    is_featured: false,
    views_count: 980,
    categories: [MOCK_CATEGORIES[2]],
    media_assets: [
      { id: 'm13', type: 'MP4', resolution: '1080p', url: 'https://vjs.zencdn.net/v/oceans.mp4' },
    ],
    subtitles: [],
  },
];

export const MOCK_USERS = [
  { id: 'a0000000-0000-0000-0000-000000000001', username: 'superadmin', email: 'superadmin@moviehub.com', name: 'Master Super Admin', role: 'SUPERADMIN', status: 'ACTIVE' },
  { id: 'a0000000-0000-0000-0000-000000000002', username: 'admin', email: 'admin@moviehub.com', name: 'Content Ops Admin', role: 'ADMIN', status: 'ACTIVE' },
  { id: 'a0000000-0000-0000-0000-000000000003', username: 'user', email: 'user@moviehub.com', name: 'Movie Enthusiast', role: 'VIEWER', status: 'ACTIVE' },
];

export const MOCK_QRIS = [
  { id: 'q1', name: 'BCA QRIS Dinamis 0% MDR', qris_image_url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=500&q=80', account_number: '8820-9912-3401', account_holder: 'PT MOVIEHUB DIGITAL INDONESIA', is_active: true },
  { id: 'q2', name: 'Gopay / ShopeePay Merchant QRIS', qris_image_url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=500&q=80', account_number: '0812-9876-5432', account_holder: 'MOVIEHUB OFFICIAL', is_active: false },
];

export const MOCK_ADS = [
  {
    id: 'ad1',
    title: 'MovieHub Cinema Pro 4K Trailer',
    media_url: 'https://media.w3.org/2010/05/video/movie_300.mp4',
    target_url: 'https://moviehub-cinema.vercel.app',
    duration_seconds: 10,
    skip_after_seconds: 3,
  },
];

export function handleMockRequest(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const [path, queryString] = endpoint.split('?');
  const params = new URLSearchParams(queryString || '');

  // 1. CAPTCHA
  if (path === '/auth/captcha') {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40"><rect width="100%" height="100%" fill="#1f1f23"/><text x="50%" y="60%" font-size="20" font-weight="bold" fill="#E50914" text-anchor="middle" dominant-baseline="middle" letter-spacing="4">${code}</text></svg>`;
    const base64 = `data:image/svg+xml;base64,${btoa(svg)}`;
    return {
      success: true,
      data: {
        id: 'c_' + Date.now(),
        image: base64,
        code,
      },
    };
  }

  // 2. LOGIN
  if (path === '/auth/login' && method === 'POST') {
    const body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
    const username = (body.username || '').trim().toLowerCase();
    
    let user = MOCK_USERS.find(u => u.username === username || u.email.toLowerCase() === username);
    if (!user) {
      if (username === 'superadmin') user = MOCK_USERS[0];
      else if (username === 'admin') user = MOCK_USERS[1];
      else user = MOCK_USERS[2];
    }

    const token = `moviehub_jwt_${user.role.toLowerCase()}_${Date.now()}`;
    return {
      success: true,
      data: {
        access_token: token,
        refresh_token: token + '_ref',
        user,
      },
    };
  }

  // 3. REGISTER
  if (path === '/auth/register' && method === 'POST') {
    const body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
    const user = {
      id: 'u_' + Date.now(),
      username: body.email?.split('@')[0] || 'user_' + Date.now(),
      email: body.email,
      name: body.name || 'Movie Fan',
      role: 'VIEWER',
      status: 'ACTIVE',
    };
    MOCK_USERS.push(user);
    const token = `moviehub_jwt_viewer_${Date.now()}`;
    return {
      success: true,
      data: {
        access_token: token,
        refresh_token: token + '_ref',
        user,
      },
    };
  }

  // 4. ME
  if (path === '/auth/me') {
    const token = localStorage.getItem('moviehub_token') || '';
    let user = MOCK_USERS[0];
    if (token.includes('admin')) user = MOCK_USERS[1];
    if (token.includes('viewer')) user = MOCK_USERS[2];
    return { success: true, data: user };
  }

  // 5. REFRESH & LOGOUT
  if (path === '/auth/refresh') {
    const token = `moviehub_jwt_refreshed_${Date.now()}`;
    return { success: true, data: { access_token: token, refresh_token: token } };
  }
  if (path === '/auth/logout') {
    return { success: true, message: 'Logged out' };
  }

  // 6. CATEGORIES
  if (path === '/categories') {
    return { success: true, data: MOCK_CATEGORIES };
  }

  // 7. MOVIES LIST & FILTER
  if (path === '/movies') {
    let list = [...MOCK_MOVIES];
    const search = (params.get('search') || '').toLowerCase();
    const category = params.get('category') || '';
    const sort = params.get('sort') || 'popular';

    if (search) {
      list = list.filter(m => m.title.toLowerCase().includes(search) || m.synopsis.toLowerCase().includes(search));
    }
    if (category) {
      list = list.filter(m => m.categories?.some(c => c.slug === category));
    }

    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sort === 'latest') list.sort((a, b) => b.release_year - a.release_year);
    else list.sort((a, b) => b.views_count - a.views_count);

    return {
      success: true,
      data: list,
      meta: { total: list.length, page: 1, limit: 50 },
    };
  }

  // 8. MOVIE DETAIL
  const detailMatch = path.match(/^\/movies\/([^/]+)$/);
  if (detailMatch) {
    const idOrSlug = detailMatch[1];
    const movie = MOCK_MOVIES.find(m => m.id === idOrSlug || m.slug === idOrSlug) || MOCK_MOVIES[0];
    return { success: true, data: movie };
  }

  // 9. VIEWER DASHBOARD
  if (path === '/dashboard/viewer') {
    return {
      success: true,
      data: {
        continue_watching: [
          {
            id: 'cw1',
            movie: MOCK_MOVIES[0],
            movie_id: MOCK_MOVIES[0].id,
            progress_seconds: 320,
            duration_seconds: MOCK_MOVIES[0].duration_seconds,
            last_watched_at: new Date().toISOString(),
          },
        ],
        featured: MOCK_MOVIES.filter(m => m.is_featured),
        popular: MOCK_MOVIES.slice(0, 4),
      },
    };
  }

  // 10. SUPERADMIN DASHBOARD
  if (path === '/dashboard/superadmin') {
    return {
      success: true,
      data: {
        total_users: MOCK_USERS.length,
        total_movies: MOCK_MOVIES.length,
        total_views: MOCK_MOVIES.reduce((acc, m) => acc + (m.views_count || 0), 0),
        total_categories: MOCK_CATEGORIES.length,
        active_campaigns: MOCK_ADS.length,
        system_status: 'OPTIMAL (24/7 Vercel Cloud)',
        storage_used: '2.4 GB',
        cloud_region: 'sin1 (Singapore Edge)',
      },
    };
  }

  // 11. ADMIN DASHBOARD
  if (path === '/dashboard/admin') {
    return {
      success: true,
      data: {
        total_movies: MOCK_MOVIES.length,
        total_categories: MOCK_CATEGORIES.length,
        active_streams: 142,
        pending_transcode_jobs: 0,
      },
    };
  }

  // 12. SUPPORT QRIS
  if (path === '/support/qris' || path === '/support/qris/all') {
    return { success: true, data: MOCK_QRIS };
  }

  // 13. ADS
  if (path === '/ads' || path === '/ads/campaigns') {
    return { success: true, data: MOCK_ADS };
  }
  if (path === '/ads/stats') {
    return {
      success: true,
      data: {
        total_impressions: 28450,
        total_clicks: 1940,
        ctr: '6.8%',
        revenue: 'Rp 4.250.000',
      },
    };
  }

  // 14. USERS
  if (path === '/users') {
    return { success: true, data: MOCK_USERS };
  }

  // 15. MEDIA JOBS & AUDIT
  if (path === '/media/jobs') {
    return {
      success: true,
      data: [
        { id: 'j1', movie_id: MOCK_MOVIES[0].id, job_type: 'TRANSCODE_4K', target_resolution: '4K (2160p)', status: 'COMPLETED', progress: 100, created_at: new Date().toISOString() },
        { id: 'j2', movie_id: MOCK_MOVIES[1].id, job_type: 'TRANSCODE_1080P', target_resolution: '1080p FHD', status: 'COMPLETED', progress: 100, created_at: new Date().toISOString() },
      ],
    };
  }
  if (path === '/audit/logs') {
    return {
      success: true,
      data: [
        { id: 'l1', action: 'CLOUD_ACTIVE', details: 'Aplikasi MovieHub aktif 24/7 di Vercel Global Edge', created_at: new Date().toISOString(), actor_id: MOCK_USERS[0].id },
      ],
    };
  }
  if (path === '/configs') {
    return {
      success: true,
      data: [
        { key: 'APP_NAME', value: 'MovieHub Cinema', description: 'Platform Title' },
        { key: 'STREAM_QUALITY_DEFAULT', value: '1080p', description: 'Default Player Resolution' },
      ],
    };
  }

  // 16. PLAYBACK SESSION & STREAM RESOLUTION
  if (path === '/playback/session') {
    const body = typeof options.body === 'string' ? JSON.parse(options.body || '{}') : (options.body || {});
    const movieId = body.movie_id;
    const movie = MOCK_MOVIES.find(m => m.id === movieId || m.slug === movieId) || MOCK_MOVIES[0];
    const streams = (movie.media_assets && movie.media_assets.length > 0)
      ? movie.media_assets
      : [
          { id: 's_4k', resolution: '4K', type: 'MP4', url: movie.video_source_url || 'https://vjs.zencdn.net/v/oceans.mp4' },
          { id: 's_1080p', resolution: '1080p', type: 'MP4', url: movie.video_source_url || 'https://vjs.zencdn.net/v/oceans.mp4' },
          { id: 's_720p', resolution: '720p', type: 'MP4', url: 'https://media.w3.org/2010/05/bunny/trailer.mp4' },
          { id: 's_480p', resolution: '480p', type: 'MP4', url: 'https://media.w3.org/2010/05/video/movie_300.mp4' },
        ];

    return {
      success: true,
      data: {
        session_id: 'session_' + Date.now(),
        movie_id: movie.id,
        streams,
        subtitles: movie.subtitles || [
          { id: 'sub_id', language_code: 'id', label: 'Bahasa Indonesia', is_default: true },
          { id: 'sub_en', language_code: 'en', label: 'English [CC]', is_default: false },
        ],
      },
    };
  }

  // 17. PLAYBACK PROGRESS
  if (path === '/playback/progress') {
    return { success: true, message: 'Playback progress recorded' };
  }

  // 18. ADS DECISION
  if (path === '/ads/decision') {
    // Deliver smooth ad experience or instant movie play
    return {
      success: true,
      data: {
        has_ad: false, // Instant stream start without blocking on ads
        ad: MOCK_ADS[0],
        session_id: 'ad_sess_' + Date.now(),
        campaign_id: 'camp_1',
        creative_id: 'creat_1',
      },
    };
  }

  // 19. ADS EVENTS
  if (path === '/ads/events') {
    return { success: true, message: 'Ad event tracked' };
  }

  // Default fallback for any unhandled endpoint
  return { success: true, data: [] };
}
