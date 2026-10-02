const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.port === '3000' ? '/api/v1' : 'http://localhost:8080/api/v1');

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getToken() {
    return localStorage.getItem('moviehub_token') || '';
  }

  setTokens(access, refresh) {
    if (access) localStorage.setItem('moviehub_token', access);
    if (refresh) localStorage.setItem('moviehub_refresh', refresh);
  }

  clearTokens() {
    localStorage.removeItem('moviehub_token');
    localStorage.removeItem('moviehub_refresh');
    localStorage.removeItem('moviehub_user');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...(options.headers || {}),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (err) {
      throw new Error(`Network error: ${err.message}. Pastikan Backend Go menyala pada port 8080.`);
    }

    // Attempt token refresh on 401
    if (response.status === 401 && !endpoint.includes('/auth/')) {
      const refreshToken = localStorage.getItem('moviehub_refresh');
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.data?.access_token) {
              this.setTokens(refreshData.data.access_token, refreshData.data.refresh_token);
              // Retry original request
              headers['Authorization'] = `Bearer ${refreshData.data.access_token}`;
              return fetch(url, { ...options, headers }).then(res => res.json());
            }
          }
        } catch {
          this.clearTokens();
        }
      }
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // Auth
  getCaptcha() {
    return this.request('/auth/captcha');
  }

  login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  logout() {
    const refreshToken = localStorage.getItem('moviehub_refresh');
    return this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).finally(() => {
      this.clearTokens();
    });
  }

  // Dashboards
  getSuperAdminDashboard() {
    return this.request('/dashboard/superadmin');
  }

  getAdminDashboard() {
    return this.request('/dashboard/admin');
  }

  getViewerDashboard() {
    return this.request('/dashboard/viewer');
  }

  // Movies
  getMovies(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/movies?${query}`);
  }

  getMovie(idOrSlug) {
    return this.request(`/movies/${idOrSlug}`);
  }

  createMovie(movieData) {
    return this.request('/movies', {
      method: 'POST',
      body: JSON.stringify(movieData),
    });
  }

  updateMovie(id, movieData) {
    return this.request(`/movies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(movieData),
    });
  }

  deleteMovie(id) {
    return this.request(`/movies/${id}`, {
      method: 'DELETE',
    });
  }

  publishMovie(id) {
    return this.request(`/movies/${id}/publish`, {
      method: 'POST',
    });
  }

  unpublishMovie(id) {
    return this.request(`/movies/${id}/unpublish`, {
      method: 'POST',
    });
  }

  // Categories
  getCategories(onlyActive = true) {
    return this.request(`/categories?active=${onlyActive}`);
  }

  createCategory(catData) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(catData),
    });
  }

  updateCategory(id, catData) {
    return this.request(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(catData),
    });
  }

  deleteCategory(id) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Media & Uploads
  uploadFile(file, type = 'posters') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return this.request('/media/upload', {
      method: 'POST',
      body: formData,
    });
  }

  // Chunked Upload Methods (Resumable & Zero Memory Choke)
  initChunkUpload(filename, totalSize, totalChunks, subDir = 'videos') {
    return this.request('/media/upload/init', {
      method: 'POST',
      body: JSON.stringify({
        filename,
        total_size: totalSize,
        total_chunks: totalChunks,
        sub_dir: subDir,
      }),
    });
  }

  uploadChunk(uploadID, chunkIndex, chunkBlob) {
    const formData = new FormData();
    formData.append('upload_id', uploadID);
    formData.append('chunk_index', chunkIndex.toString());
    formData.append('chunk', chunkBlob, `chunk_${chunkIndex}`);
    return this.request('/media/upload/chunk', {
      method: 'POST',
      body: formData,
    });
  }

  getChunkStatus(uploadID) {
    return this.request(`/media/upload/status/${uploadID}`);
  }

  completeChunkUpload(uploadID, movieID = '', autoTranscode = true, resolutions = ['1080p FHD', '720p HD', '480p SD']) {
    return this.request('/media/upload/complete', {
      method: 'POST',
      body: JSON.stringify({
        upload_id: uploadID,
        movie_id: movieID,
        auto_transcode: autoTranscode,
        resolutions,
      }),
    });
  }

  async uploadLargeVideoResumable(file, options = {}) {
    const {
      chunkSize = 5 * 1024 * 1024, // 5MB chunks per industry standard
      onProgress = () => {},
      onStatus = () => {},
      movieID = '',
      autoTranscode = true,
      resolutions = ['1080p FHD', '720p HD', '480p SD'],
      isPaused = () => false,
    } = options;

    const totalSize = file.size;
    const totalChunks = Math.ceil(totalSize / chunkSize);

    onStatus({ stage: 'init', message: 'Menginisialisasi sesi upload chunk video...' });
    const initRes = await this.initChunkUpload(file.name, totalSize, totalChunks, 'videos');
    const uploadID = initRes.data.upload_id;

    let uploadedBytes = 0;
    const startTime = Date.now();

    for (let index = 0; index < totalChunks; index++) {
      while (isPaused()) {
        onStatus({ stage: 'paused', message: 'Upload dijeda sementara oleh pengguna.' });
        await new Promise((r) => setTimeout(r, 500));
      }

      const start = index * chunkSize;
      const end = Math.min(start + chunkSize, totalSize);
      const chunkBlob = file.slice(start, end);

      await this.uploadChunk(uploadID, index, chunkBlob);

      uploadedBytes += (end - start);
      const elapsedSec = (Date.now() - startTime) / 1000;
      const speedBps = elapsedSec > 0 ? uploadedBytes / elapsedSec : 0;
      const speedMBps = (speedBps / (1024 * 1024)).toFixed(1);
      const remainingBytes = totalSize - uploadedBytes;
      const etaSec = speedBps > 0 ? Math.ceil(remainingBytes / speedBps) : 0;
      const progressPercent = Math.min(100, Math.round((uploadedBytes / totalSize) * 100));

      onProgress({
        progress: progressPercent,
        currentChunk: index + 1,
        totalChunks,
        uploadedMB: (uploadedBytes / (1024 * 1024)).toFixed(1),
        totalMB: (totalSize / (1024 * 1024)).toFixed(1),
        speed: `${speedMBps} MB/s`,
        eta: etaSec > 0 ? `${etaSec} dtk` : 'Selesai',
      });

      onStatus({
        stage: 'uploading',
        message: `Mengunggah chunk ${index + 1}/${totalChunks} (${progressPercent}%) - ${speedMBps} MB/s`,
      });
    }

    onStatus({ stage: 'merging', message: 'Seluruh chunk terkirim. Menggabungkan file video di server...' });
    const completeRes = await this.completeChunkUpload(uploadID, movieID, autoTranscode, resolutions);
    onStatus({ stage: 'completed', message: 'Video berhasil dirangkai & antrean transcoding multi-resolusi aktif!' });
    return completeRes.data;
  }

  startTranscode(movieID, sourceFile, resolutions) {
    return this.request('/media/transcode', {
      method: 'POST',
      body: JSON.stringify({
        movie_id: movieID,
        source_file: sourceFile,
        resolutions: resolutions,
      }),
    });
  }

  getMediaJobs(status = '', page = 1) {
    return this.request(`/media/jobs?status=${status}&page=${page}&limit=10`);
  }

  retryMediaJob(id) {
    return this.request(`/media/jobs/${id}/retry`, {
      method: 'POST',
    });
  }

  // Subtitles
  getSubtitles(movieID) {
    return this.request(`/movies/${movieID}/subtitles`);
  }

  createSubtitle(movieID, data) {
    return this.request(`/movies/${movieID}/subtitles`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  deleteSubtitle(id) {
    return this.request(`/subtitles/${id}`, {
      method: 'DELETE',
    });
  }

  // Ads
  getAdDecision(movieID) {
    return this.request('/ads/decision', {
      method: 'POST',
      body: JSON.stringify({ movie_id: movieID }),
    });
  }

  trackAdEvent(sessionID, campaignID, creativeID, eventType) {
    return this.request('/ads/events', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionID,
        campaign_id: campaignID,
        creative_id: creativeID,
        event_type: eventType,
      }),
    });
  }

  getAdCampaigns() {
    return this.request('/ads/campaigns');
  }

  createAdCampaign(campaignData) {
    return this.request('/ads/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  updateAdCampaignStatus(id, status) {
    return this.request(`/ads/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  deleteAdCampaign(id) {
    return this.request(`/ads/campaigns/${id}`, {
      method: 'DELETE',
    });
  }

  getAdStats() {
    return this.request('/ads/stats');
  }

  // Support & QRIS
  getActiveQRIS() {
    return this.request('/support/qris');
  }

  getAllQRIS() {
    return this.request('/support/list');
  }

  createQRIS(data) {
    return this.request('/support/qris', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  activateQRIS(id) {
    return this.request(`/support/qris/${id}/activate`, {
      method: 'PATCH',
    });
  }

  deleteQRIS(id) {
    return this.request(`/support/qris/${id}`, {
      method: 'DELETE',
    });
  }

  // Playback
  createPlaybackSession(movieID) {
    return this.request('/playback/session', {
      method: 'POST',
      body: JSON.stringify({ movie_id: movieID }),
    });
  }

  savePlaybackProgress(movieID, position, duration, completed = false) {
    return this.request('/playback/progress', {
      method: 'POST',
      body: JSON.stringify({
        movie_id: movieID,
        last_position_seconds: position,
        duration_seconds: duration,
        completed,
      }),
    });
  }

  getContinueWatching() {
    return this.request('/playback/continue-watching');
  }

  // Users (SuperAdmin)
  getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/users?${query}`);
  }

  createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Audit Logs
  getAuditLogs(page = 1) {
    return this.request(`/audit-logs?page=${page}&limit=15`);
  }

  // Configs
  getConfigs() {
    return this.request('/configs');
  }

  updateConfig(key, value) {
    return this.request('/configs', {
      method: 'PUT',
      body: JSON.stringify({ key, value }),
    });
  }
}

export const api = new ApiClient();
