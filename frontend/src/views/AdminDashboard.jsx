import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { 
  Clapperboard, Film, PlayCircle, RefreshCw, Plus, CheckCircle2, 
  Clock, AlertCircle, Trash2, Edit3, UploadCloud, Subtitles, 
  FolderPlus, Sparkles, Layers, ArrowUpRight, Check, X,
  FileVideo, Pause, Play, Cpu, Zap, HardDrive, Sliders, ArrowRight
} from 'lucide-react';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('movies'); // movies, transcoding, subtitles, categories, audits
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  // Movies
  const [movies, setMovies] = useState([]);
  const [movieFilter, setMovieFilter] = useState('');
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newMovie, setNewMovie] = useState({
    title: '', synopsis: '', release_year: 2026, duration_seconds: 7200,
    rating: 8.5, age_rating: '13+', poster_url: '', backdrop_url: '',
    trailer_url: '', video_source_url: '', status: 'DRAFT', is_featured: false,
    category_ids: [],
  });

  // Edit Movie States
  const [showEditMovieModal, setShowEditMovieModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [isUpdatingMovie, setIsUpdatingMovie] = useState(false);
  const [editError, setEditError] = useState('');
  const [editPosterFile, setEditPosterFile] = useState(null);
  const [editBackdropFile, setEditBackdropFile] = useState(null);

  // Large Video Upload & Transcoding States
  const [videoSourceMode, setVideoSourceMode] = useState('upload'); // 'upload' | 'url'
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null); // { progress, currentChunk, totalChunks, uploadedMB, totalMB, speed, eta }
  const [uploadStatus, setUploadStatus] = useState({ stage: 'idle', message: '' });
  const [isUploadPaused, setIsUploadPaused] = useState(false);
  const isUploadPausedRef = useRef(false);
  const [uploadError, setUploadError] = useState('');
  const [isSubmittingMovie, setIsSubmittingMovie] = useState(false);
  const [autoTranscode, setAutoTranscode] = useState(true);
  const [targetResolutions, setTargetResolutions] = useState(['1080p FHD', '720p HD', '480p SD']);

  // Direct poster & backdrop image files
  const [posterFile, setPosterFile] = useState(null);
  const [backdropFile, setBackdropFile] = useState(null);

  // Transcoding Jobs
  const [jobs, setJobs] = useState([]);
  const [showTranscodeModal, setShowTranscodeModal] = useState(false);
  const [transcodeTargetMovie, setTranscodeTargetMovie] = useState('');
  const [selectedResolutions, setSelectedResolutions] = useState(['4K (2160p)', '1080p FHD', '720p HD']);

  // Subtitles
  const [selectedMovieForSub, setSelectedMovieForSub] = useState('');
  const [movieSubtitles, setMovieSubtitles] = useState([]);
  const [newSub, setNewSub] = useState({ language_code: 'id', label: 'Bahasa Indonesia', file_url: '', is_default: true });

  // Categories
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  // Editorial Audits
  const [audits, setAudits] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, moviesRes, jobsRes, catRes, auditRes] = await Promise.all([
        api.getAdminDashboard().catch(() => null),
        api.getMovies({ limit: 50 }).catch(() => null),
        api.getMediaJobs('', 1).catch(() => null),
        api.getCategories(false).catch(() => null),
        api.getAuditLogs(1).catch(() => null),
      ]);

      if (dashRes?.data) setDashboardData(dashRes.data);
      if (moviesRes?.data) setMovies(moviesRes.data);
      if (jobsRes?.data) setJobs(jobsRes.data);
      if (catRes?.data) setCategories(catRes.data);
      if (auditRes?.data) setAudits(auditRes.data);

      if (moviesRes?.data?.length > 0 && !selectedMovieForSub) {
        setSelectedMovieForSub(moviesRes.data[0].id);
      }
    } catch (err) {
      console.error("Admin load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reload subtitles when selected movie changes
  useEffect(() => {
    if (selectedMovieForSub) {
      api.getSubtitles(selectedMovieForSub)
        .then(res => setMovieSubtitles(res.data || []))
        .catch(() => setMovieSubtitles([]));
    }
  }, [selectedMovieForSub]);

  // Movie actions
  const handlePublish = async (id) => {
    await api.publishMovie(id);
    loadData();
  };

  const handleUnpublish = async (id) => {
    await api.unpublishMovie(id);
    loadData();
  };

  const handleDeleteMovie = async (id) => {
    if (confirm("Hapus movie ini beserta seluruh aset dan subtitle?")) {
      await api.deleteMovie(id);
      loadData();
    }
  };

  const toggleUploadPause = () => {
    isUploadPausedRef.current = !isUploadPausedRef.current;
    setIsUploadPaused(isUploadPausedRef.current);
  };

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    setUploadError('');
    setIsSubmittingMovie(true);
    isUploadPausedRef.current = false;
    setIsUploadPaused(false);

    try {
      // 1. Upload poster if file provided
      let finalPoster = newMovie.poster_url;
      if (posterFile) {
        setUploadStatus({ stage: 'uploading', message: 'Mengunggah file poster...' });
        const res = await api.uploadFile(posterFile, 'posters');
        finalPoster = res.data.url;
      }

      // 2. Upload backdrop if file provided
      let finalBackdrop = newMovie.backdrop_url;
      if (backdropFile) {
        setUploadStatus({ stage: 'uploading', message: 'Mengunggah file backdrop...' });
        const res = await api.uploadFile(backdropFile, 'backdrops');
        finalBackdrop = res.data.url;
      }

      // 3. Create movie entry in DRAFT or PROCESSING status
      const willTranscode = autoTranscode && ((videoSourceMode === 'upload' && selectedVideoFile) || (videoSourceMode === 'url' && newMovie.video_source_url));
      const initialStatus = willTranscode ? 'PROCESSING' : 'DRAFT';
      const moviePayload = {
        ...newMovie,
        poster_url: finalPoster,
        backdrop_url: finalBackdrop,
        status: initialStatus,
      };

      setUploadStatus({ stage: 'init', message: 'Menyimpan metadata film ke katalog...' });
      const createRes = await api.createMovie(moviePayload);
      const createdMovie = createRes.data;

      // 4. Handle Video File Source
      if (videoSourceMode === 'upload' && selectedVideoFile) {
        setUploadStatus({ stage: 'init', message: 'Menyiapkan chunk upload video (5MB potongan)...' });
        
        await api.uploadLargeVideoResumable(selectedVideoFile, {
          chunkSize: 5 * 1024 * 1024,
          movieID: createdMovie.id,
          autoTranscode: autoTranscode,
          resolutions: targetResolutions,
          isPaused: () => isUploadPausedRef.current,
          onProgress: (p) => setUploadProgress(p),
          onStatus: (st) => setUploadStatus(st),
        });

      } else if (videoSourceMode === 'url' && newMovie.video_source_url && autoTranscode) {
        setUploadStatus({ stage: 'merging', message: 'Mendaftarkan pipeline transcoding...' });
        await api.startTranscode(createdMovie.id, newMovie.video_source_url, targetResolutions);
      }

      // Close modal and reset
      setShowAddMovieModal(false);
      setNewMovie({
        title: '', synopsis: '', release_year: 2026, duration_seconds: 7200,
        rating: 8.5, age_rating: '13+', poster_url: '', backdrop_url: '',
        trailer_url: '', video_source_url: '', status: 'DRAFT', is_featured: false,
        category_ids: [],
      });
      setSelectedVideoFile(null);
      setUploadProgress(null);
      setUploadStatus({ stage: 'idle', message: '' });
      setPosterFile(null);
      setBackdropFile(null);

      await loadData();
      setActiveTab('transcoding');

    } catch (err) {
      console.error("Movie creation/upload error:", err);
      setUploadError(err.message || "Gagal mengunggah film atau memproses video.");
    } finally {
      setIsSubmittingMovie(false);
    }
  };

  // Edit Movie Handlers
  const handleOpenEditModal = (m) => {
    setEditingMovie({
      id: m.id,
      title: m.title || '',
      synopsis: m.synopsis || '',
      release_year: m.release_year || 2026,
      duration_seconds: m.duration_seconds || 7200,
      rating: m.rating || 8.5,
      age_rating: m.age_rating || '13+',
      status: m.status || 'DRAFT',
      poster_url: m.poster_url || '',
      backdrop_url: m.backdrop_url || '',
      video_source_url: m.video_source_url || '',
      trailer_url: m.trailer_url || '',
      is_featured: !!m.is_featured,
      category_ids: m.categories ? m.categories.map(c => c.id) : [],
    });
    setEditPosterFile(null);
    setEditBackdropFile(null);
    setEditError('');
    setShowEditMovieModal(true);
  };

  const handleUpdateMovieSubmit = async (e) => {
    e.preventDefault();
    if (!editingMovie || !editingMovie.id) return;
    setIsUpdatingMovie(true);
    setEditError('');

    try {
      let finalPoster = editingMovie.poster_url;
      if (editPosterFile) {
        const res = await api.uploadFile(editPosterFile, 'posters');
        finalPoster = res.data.url;
      }

      let finalBackdrop = editingMovie.backdrop_url;
      if (editBackdropFile) {
        const res = await api.uploadFile(editBackdropFile, 'backdrops');
        finalBackdrop = res.data.url;
      }

      const payload = {
        title: editingMovie.title,
        synopsis: editingMovie.synopsis,
        release_year: Number(editingMovie.release_year),
        duration_seconds: Number(editingMovie.duration_seconds),
        rating: Number(editingMovie.rating),
        age_rating: editingMovie.age_rating,
        status: editingMovie.status,
        poster_url: finalPoster,
        backdrop_url: finalBackdrop,
        video_source_url: editingMovie.video_source_url,
        trailer_url: editingMovie.trailer_url,
        is_featured: editingMovie.is_featured,
        category_ids: editingMovie.category_ids,
      };

      await api.updateMovie(editingMovie.id, payload);
      setShowEditMovieModal(false);
      setEditingMovie(null);
      await loadData();
    } catch (err) {
      console.error("Movie update error:", err);
      setEditError(err.message || "Gagal memperbarui data film");
    } finally {
      setIsUpdatingMovie(false);
    }
  };

  // Transcoding actions
  const handleRetryJob = async (jobId) => {
    await api.retryMediaJob(jobId);
    loadData();
  };

  const handleStartTranscode = async (e) => {
    e.preventDefault();
    if (!transcodeTargetMovie) return;
    const target = movies.find(m => m.id === transcodeTargetMovie);
    await api.startTranscode(transcodeTargetMovie, target?.video_source_url || '', selectedResolutions);
    setShowTranscodeModal(false);
    loadData();
  };

  // Subtitle actions
  const handleAddSubtitle = async (e) => {
    e.preventDefault();
    if (!selectedMovieForSub) return;
    await api.createSubtitle(selectedMovieForSub, newSub);
    setNewSub({ language_code: 'id', label: 'Bahasa Indonesia', file_url: '', is_default: false });
    const res = await api.getSubtitles(selectedMovieForSub);
    setMovieSubtitles(res.data || []);
  };

  const handleDeleteSubtitle = async (id) => {
    await api.deleteSubtitle(id);
    const res = await api.getSubtitles(selectedMovieForSub);
    setMovieSubtitles(res.data || []);
  };

  // Category actions
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    await api.createCategory(newCategory);
    setNewCategory({ name: '', description: '' });
    loadData();
  };

  const handleDeleteCategory = async (id) => {
    if (confirm("Hapus kategori ini?")) {
      await api.deleteCategory(id);
      loadData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-16 animate-in fade-in duration-300">
      
      {/* Header Banner - Distinct Admin Studio Amber/Obsidian Theme */}
      <div className="relative rounded-3xl p-4 sm:p-8 overflow-hidden bg-gradient-to-r from-cinema-900 via-cinema-850 to-amber-950/40 border-2 border-amber-500/40 shadow-3d-card">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden sm:block">
          <Clapperboard className="w-64 h-64 text-amber-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] sm:text-xs font-black tracking-widest uppercase">
              <Clapperboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              CONTENT OPS STUDIO • EDITORIAL & TRANSCODING
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-wide">
              Studio Manajemen Konten <span className="text-amber-400">MovieHub</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Pusat kurasi katalog: tambah film baru, pantau antrean kompresi multi-resolusi 4K/1080p, kelola file subtitle/terjemahan, serta publikasikan konten ke katalog.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-cinema-850 hover:bg-cinema-800 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Segarkan Antrean</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-cinema-border/60 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none">
        {[
          { id: 'movies', label: 'Katalog & Publikasi', icon: Film },
          { id: 'transcoding', label: 'Pipeline Transcoding', icon: Layers },
          { id: 'subtitles', label: 'Subtitle & Terjemahan', icon: Subtitles },
          { id: 'categories', label: 'Kategori / Genre', icon: FolderPlus },
          { id: 'audits', label: 'Log Editorial', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-black font-extrabold shadow-lg'
                  : 'bg-cinema-850 text-zinc-400 hover:text-white hover:bg-cinema-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Key Metric Stats Cards for Admin */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-panel p-4 rounded-2xl border border-zinc-800 text-center">
          <div className="text-zinc-400 text-xs font-semibold">Total Movie</div>
          <div className="font-heading font-black text-2xl text-white mt-1">{dashboardData?.total_movies || 0}</div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 text-center">
          <div className="text-emerald-400 text-xs font-semibold">Published</div>
          <div className="font-heading font-black text-2xl text-emerald-400 mt-1">{dashboardData?.published_movies || 0}</div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-blue-500/30 text-center">
          <div className="text-blue-400 text-xs font-semibold">Ready to Publish</div>
          <div className="font-heading font-black text-2xl text-blue-400 mt-1">{dashboardData?.ready_movies || 0}</div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 text-center">
          <div className="text-amber-400 text-xs font-semibold">Processing</div>
          <div className="font-heading font-black text-2xl text-amber-400 mt-1">{dashboardData?.processing_movies || 0}</div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-zinc-700 text-center">
          <div className="text-zinc-400 text-xs font-semibold">Draft</div>
          <div className="font-heading font-black text-2xl text-zinc-300 mt-1">{dashboardData?.draft_movies || 0}</div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 text-center">
          <div className="text-rose-400 text-xs font-semibold">Job Gagal</div>
          <div className="font-heading font-black text-2xl text-rose-400 mt-1">{dashboardData?.failed_jobs_count || 0}</div>
        </div>
      </div>

      {/* ================= TAB 1: MOVIES ================= */}
      {activeTab === 'movies' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {['ALL', 'PUBLISHED', 'READY', 'PROCESSING', 'DRAFT'].map((st) => (
                <button
                  key={st}
                  onClick={() => setMovieFilter(st === 'ALL' ? '' : st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    (st === 'ALL' && !movieFilter) || movieFilter === st
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-cinema-850 text-zinc-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddMovieModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Movie Baru</span>
            </button>
          </div>

          {/* Movies List Table */}
          <div className="glass-panel rounded-3xl border border-zinc-800 overflow-hidden shadow-3d-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-cinema-850 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800 text-[11px]">
                  <tr>
                    <th className="p-4">Movie</th>
                    <th className="p-4">Tahun / Durasi</th>
                    <th className="p-4">Kualitas Aset</th>
                    <th className="p-4">Status Alur</th>
                    <th className="p-4 text-right">Aksi Publikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {movies
                    .filter(m => !movieFilter || m.status === movieFilter)
                    .map((m) => (
                      <tr key={m.id} className="hover:bg-cinema-850/40">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={m.poster_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100&q=80"}
                            alt={m.title}
                            className="w-12 h-16 object-cover rounded-lg border border-zinc-700 shadow-sm shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white text-sm line-clamp-1">{m.title}</div>
                            <div className="text-xs text-zinc-400 line-clamp-1">{m.synopsis}</div>
                            <div className="text-[11px] text-amber-400 font-semibold mt-0.5">
                              ⭐ {m.rating} • {m.age_rating || '13+'}
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-xs text-zinc-300">
                          <div>{m.release_year}</div>
                          <div className="text-zinc-500">{Math.floor(m.duration_seconds / 60)} Menit</div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {m.assets?.map((a) => (
                              <span key={a.id || a.resolution} className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                a.resolution === '4K' ? 'bg-cinema-red text-white' : 'bg-cinema-800 text-zinc-300'
                              }`}>
                                {a.resolution}
                              </span>
                            )) || <span className="text-zinc-500 text-xs">Belum ada</span>}
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                            m.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                            m.status === 'READY' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
                            m.status === 'PROCESSING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse' :
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {m.status}
                          </span>
                        </td>

                        <td className="p-4 text-right space-x-2">
                          {m.status === 'PUBLISHED' ? (
                            <button
                              onClick={() => handleUnpublish(m.id)}
                              className="px-3 py-1 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer"
                            >
                              Tarik Publikasi
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePublish(m.id)}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer"
                            >
                              Publish ke Katalog
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEditModal(m)}
                            className="p-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 hover:text-amber-200 border border-amber-500/40 transition-colors cursor-pointer inline-flex items-center"
                            title="Edit Informasi Film"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteMovie(m.id)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 border border-zinc-700 transition-colors cursor-pointer inline-flex items-center"
                            title="Hapus Movie"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: TRANSCODING PIPELINE ================= */}
      {activeTab === 'transcoding' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-xl text-white">
                Pipeline Transcoding & Antrean Kompresi FFmpeg
              </h2>
              <p className="text-xs text-zinc-400">
                Worker mengonversi source video master menjadi profil multi-resolusi 4K (2160p), 1080p, 720p, dan 480p.
              </p>
            </div>

            <button
              onClick={() => setShowTranscodeModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Jalankan Transcoding Baru</span>
            </button>
          </div>

          <div className="space-y-3">
            {jobs.map((j) => (
              <div key={j.id} className="glass-panel p-5 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        j.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                        j.status === 'PROCESSING' ? 'bg-amber-500/20 text-amber-400 animate-pulse' :
                        j.status === 'FAILED' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {j.status}
                      </span>
                      <span className="font-heading font-bold text-white text-base">
                        {j.movie_title || 'Movie'}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cinema-850 text-cinema-red">
                        {j.target_resolution}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-400 flex items-center gap-3">
                      <span>Source: <strong className="font-mono text-zinc-300">{j.source_file || 'master.mov'}</strong></span>
                      <span>•</span>
                      <span>Job: <strong className="font-mono text-zinc-400">{j.job_type}</strong></span>
                    </div>

                    {j.error_message && (
                      <div className="text-xs text-rose-400 flex items-center gap-1.5 pt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{j.error_message}</span>
                      </div>
                    )}
                  </div>

                  {j.status === 'FAILED' && (
                    <button
                      onClick={() => handleRetryJob(j.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Ulangi Job</span>
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                    <span>Kemajuan Transcoding</span>
                    <span className="text-amber-400">{j.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-cinema-950 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        j.status === 'COMPLETED' ? 'bg-emerald-500' :
                        j.status === 'FAILED' ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-cinema-red animate-pulse'
                      }`}
                      style={{ width: `${j.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: SUBTITLES ================= */}
      {activeTab === 'subtitles' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-xl text-white">
                Kelola Subtitle & Terjemahan Film
              </h2>
              <p className="text-xs text-zinc-400">
                Pilih film dan tautkan file subtitle VTT/SRT multi-bahasa (ID, EN, JA) untuk ditayangkan pada pemutar video.
              </p>
            </div>

            {/* Movie Selector */}
            <div className="w-full sm:w-72">
              <select
                value={selectedMovieForSub}
                onChange={(e) => setSelectedMovieForSub(e.target.value)}
                className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
              >
                {movies.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Subtitles List */}
            <div className="md:col-span-7 glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Subtitles className="w-4 h-4 text-amber-400" />
                Daftar Subtitle Terpasang
              </h3>

              <div className="space-y-3">
                {movieSubtitles.map((sub) => (
                  <div key={sub.id} className="p-3.5 rounded-xl bg-cinema-850/60 border border-zinc-800 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{sub.label}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-cinema-800 text-zinc-400">
                          {sub.language_code}
                        </span>
                        {sub.is_default && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <div className="text-zinc-500 truncate max-w-xs">{sub.file_url}</div>
                    </div>

                    <button
                      onClick={() => handleDeleteSubtitle(sub.id)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {movieSubtitles.length === 0 && (
                  <div className="text-center py-8 text-zinc-500 text-xs">
                    Belum ada subtitle terpasang untuk film ini.
                  </div>
                )}
              </div>
            </div>

            {/* Add Subtitle Form */}
            <div className="md:col-span-5 glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Tambah Subtitle Baru
              </h3>

              <form onSubmit={handleAddSubtitle} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1">Kode Bahasa</label>
                  <select
                    value={newSub.language_code}
                    onChange={(e) => {
                      const code = e.target.value;
                      let label = 'Bahasa Indonesia';
                      if (code === 'en') label = 'English [CC]';
                      if (code === 'ja') label = 'Japanese (日本語)';
                      if (code === 'es') label = 'Spanish';
                      setNewSub({ ...newSub, language_code: code, label });
                    }}
                    className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="id">id (Bahasa Indonesia)</option>
                    <option value="en">en (English)</option>
                    <option value="ja">ja (Japanese)</option>
                    <option value="es">es (Spanish)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Label Tampilan</label>
                  <input
                    type="text"
                    required
                    value={newSub.label}
                    onChange={(e) => setNewSub({ ...newSub, label: e.target.value })}
                    className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">URL File (.vtt / .srt)</label>
                  <input
                    type="text"
                    required
                    placeholder="/subtitles/movie_id.vtt"
                    value={newSub.file_url}
                    onChange={(e) => setNewSub({ ...newSub, file_url: e.target.value })}
                    className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isDefaultSub"
                    checked={newSub.is_default}
                    onChange={(e) => setNewSub({ ...newSub, is_default: e.target.checked })}
                    className="accent-amber-500"
                  />
                  <label htmlFor="isDefaultSub" className="text-zinc-300">Jadikan Subtitle Utama (Default)</label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black shadow-md mt-2 cursor-pointer"
                >
                  Pasang Subtitle
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: CATEGORIES ================= */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in duration-200">
          <div className="md:col-span-8 glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4">
            <h3 className="font-heading font-bold text-lg text-white">Daftar Kategori / Genre Film</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 rounded-xl bg-cinema-850/60 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">{cat.name}</div>
                    <div className="text-xs text-zinc-500 font-mono">/{cat.slug}</div>
                    <div className="text-[11px] text-amber-400 mt-1">{cat.movie_count || 0} Film Terdaftar</div>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4">
            <h3 className="font-heading font-bold text-base text-white">Buat Kategori Baru</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Anime Fantasy"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Deskripsi</label>
                <textarea
                  rows={3}
                  placeholder="Deskripsi singkat genre..."
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black shadow-md mt-2 cursor-pointer"
              >
                Simpan Kategori
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 5: EDITORIAL AUDITS ================= */}
      {activeTab === 'audits' && (
        <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4 animate-in fade-in duration-200">
          <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Riwayat Aktivitas Editorial Konten (Admin Scoped)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cinema-850 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Waktu</th>
                  <th className="p-3.5">Aktor</th>
                  <th className="p-3.5">Aksi</th>
                  <th className="p-3.5">Resource</th>
                  <th className="p-3.5">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {audits.map((a) => (
                  <tr key={a.id} className="hover:bg-cinema-850/40 font-sans">
                    <td className="p-3.5 text-zinc-400 font-mono text-[11px]">{new Date(a.created_at).toLocaleString('id-ID')}</td>
                    <td className="p-3.5 font-bold text-white">{a.actor_name}</td>
                    <td className="p-3.5 font-bold text-amber-400 font-mono">{a.action}</td>
                    <td className="p-3.5 text-zinc-300 font-semibold">{a.resource}</td>
                    <td className="p-3.5 text-zinc-400 text-[11px] truncate max-w-xs">{a.metadata}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Movie Modal */}
      {showAddMovieModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
          <div className="max-w-2xl w-full glass-panel p-4 sm:p-6 md:p-8 rounded-3xl border border-amber-500/40 shadow-3d-card space-y-4 my-4 sm:my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
              <h3 className="font-heading font-black text-lg sm:text-xl text-white">Tambah Film Baru ke Studio</h3>
              <button 
                onClick={() => setShowAddMovieModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMovie} className="space-y-4 text-xs overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Judul Movie</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Interstellar 4K"
                    value={newMovie.title}
                    onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                    className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Tahun Rilis</label>
                  <input
                    type="number"
                    value={newMovie.release_year}
                    onChange={(e) => setNewMovie({ ...newMovie, release_year: Number(e.target.value) })}
                    className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Sinopsis</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Sinopsis cerita film..."
                  value={newMovie.synopsis}
                  onChange={(e) => setNewMovie({ ...newMovie, synopsis: e.target.value })}
                  className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Rating (IMDb)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMovie.rating}
                    onChange={(e) => setNewMovie({ ...newMovie, rating: Number(e.target.value) })}
                    className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Klasifikasi Usia</label>
                  <select
                    value={newMovie.age_rating}
                    onChange={(e) => setNewMovie({ ...newMovie, age_rating: e.target.value })}
                    className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="SU">SU (Semua Umur)</option>
                    <option value="13+">13+</option>
                    <option value="17+">17+</option>
                    <option value="21+">21+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Durasi (detik)</label>
                  <input
                    type="number"
                    value={newMovie.duration_seconds}
                    onChange={(e) => setNewMovie({ ...newMovie, duration_seconds: Number(e.target.value) })}
                    className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Poster & Backdrop Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-semibold text-[11px]">Poster Film (Portrait)</label>
                    <label className="text-[10px] text-amber-400 hover:underline cursor-pointer flex items-center gap-1">
                      <UploadCloud className="w-3 h-3" />
                      <span>Pilih File Gambar</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setPosterFile(e.target.files[0]);
                            setNewMovie({ ...newMovie, poster_url: URL.createObjectURL(e.target.files[0]) });
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="URL Poster atau pilih file di atas..."
                    value={newMovie.poster_url}
                    onChange={(e) => {
                      setPosterFile(null);
                      setNewMovie({ ...newMovie, poster_url: e.target.value });
                    }}
                    className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                  {posterFile && (
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>File siap diunggah: {posterFile.name} ({(posterFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-semibold text-[11px]">Backdrop Latar (Landscape)</label>
                    <label className="text-[10px] text-amber-400 hover:underline cursor-pointer flex items-center gap-1">
                      <UploadCloud className="w-3 h-3" />
                      <span>Pilih File Gambar</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setBackdropFile(e.target.files[0]);
                            setNewMovie({ ...newMovie, backdrop_url: URL.createObjectURL(e.target.files[0]) });
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="URL Backdrop atau pilih file di atas..."
                    value={newMovie.backdrop_url}
                    onChange={(e) => {
                      setBackdropFile(null);
                      setNewMovie({ ...newMovie, backdrop_url: e.target.value });
                    }}
                    className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                  {backdropFile && (
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>File siap diunggah: {backdropFile.name} ({(backdropFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Source Selection (File Upload vs Direct URL) */}
              <div className="p-4 rounded-2xl bg-cinema-850/90 border border-amber-500/30 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileVideo className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white text-xs">Master Video & Sistem Konversi Format</span>
                  </div>
                  
                  {/* Mode Switcher */}
                  <div className="flex rounded-lg bg-cinema-900 p-0.5 border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setVideoSourceMode('upload')}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        videoSourceMode === 'upload' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Upload File Video
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoSourceMode('url')}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        videoSourceMode === 'url' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      URL Langsung
                    </button>
                  </div>
                </div>

                {videoSourceMode === 'upload' ? (
                  <div className="space-y-3">
                    {/* Drag and Drop Zone */}
                    <div className="border-2 border-dashed border-zinc-700 hover:border-amber-500/80 rounded-2xl p-5 text-center transition-colors bg-cinema-900/50">
                      <input
                        type="file"
                        id="video-master-input"
                        accept="video/mp4,video/x-matroska,video/quicktime,video/x-msvideo,video/webm,.mkv,.avi,.flv,.mov,.mp4,.wmv,.ts"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setSelectedVideoFile(e.target.files[0]);
                            setUploadError('');
                          }
                        }}
                      />
                      
                      {!selectedVideoFile ? (
                        <label htmlFor="video-master-input" className="cursor-pointer block space-y-2">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                            <UploadCloud className="w-6 h-6 animate-bounce" />
                          </div>
                          <div>
                            <span className="font-bold text-white text-xs block">
                              Klik atau Tarik File Video ke Sini
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              Mendukung format: <strong className="text-amber-300">MP4, MKV, AVI, MOV, WEBM, FLV, WMV</strong> (Hingga 10GB)
                            </span>
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] text-emerald-300">
                            <Zap className="w-3 h-3 text-emerald-400" />
                            <span>Fitur Zero-Memory Chunking (Anti-Lag & Anti-Timeout)</span>
                          </div>
                        </label>
                      ) : (
                        <div className="flex items-center justify-between text-left p-3 rounded-xl bg-cinema-800/80 border border-amber-500/40">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
                              <Film className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-white text-xs truncate max-w-xs sm:max-w-sm">{selectedVideoFile.name}</p>
                              <p className="text-[11px] text-zinc-400">
                                Ukuran: <strong className="text-zinc-200">{(selectedVideoFile.size / (1024 * 1024)).toFixed(1)} MB</strong> ({Math.ceil(selectedVideoFile.size / (5 * 1024 * 1024))} chunk @5MB)
                              </p>
                            </div>
                          </div>
                          
                          <label htmlFor="video-master-input" className="text-xs text-amber-400 hover:underline cursor-pointer font-semibold shrink-0 ml-3">
                            Ganti File
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Transcoding Targets & Auto Transcode */}
                    <div className="space-y-2 pt-1 border-t border-zinc-800">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pilihan Resolusi Output Konversi (FFmpeg Web-Ready):</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoTranscode}
                            onChange={(e) => setAutoTranscode(e.target.checked)}
                            className="accent-amber-500"
                          />
                          <span>Transcoding Otomatis</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['4K (2160p)', '1080p FHD', '720p HD', '480p SD'].map((res) => (
                          <label key={res} className="flex items-center gap-2 p-2 rounded-xl bg-cinema-900 border border-zinc-800 cursor-pointer text-zinc-300 hover:border-amber-500/50">
                            <input
                              type="checkbox"
                              checked={targetResolutions.includes(res)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTargetResolutions([...targetResolutions, res]);
                                } else {
                                  setTargetResolutions(targetResolutions.filter(r => r !== res));
                                }
                              }}
                              className="accent-amber-500"
                            />
                            <span className="text-[11px] font-bold">{res}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-zinc-400 text-[11px]">URL Sumber Video (MP4 / HLS / CDN)</label>
                    <input
                      type="url"
                      placeholder="https://domain.com/video/master.mp4"
                      value={newMovie.video_source_url}
                      onChange={(e) => setNewMovie({ ...newMovie, video_source_url: e.target.value })}
                      className="w-full bg-cinema-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                    />
                  </div>
                )}

                {/* Upload Progress Bar (Active when uploading) */}
                {isSubmittingMovie && uploadProgress && (
                  <div className="p-3.5 rounded-xl bg-cinema-900 border border-amber-500/50 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                        <span className="font-bold text-white">{uploadStatus.message || 'Mengunggah video...'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-amber-400 text-sm">{uploadProgress.progress}%</span>
                        <button
                          type="button"
                          onClick={toggleUploadPause}
                          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          {isUploadPaused ? <Play className="w-2.5 h-2.5 text-emerald-400" /> : <Pause className="w-2.5 h-2.5 text-amber-400" />}
                          <span>{isUploadPaused ? 'Lanjutkan' : 'Jeda'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span>Chunk {uploadProgress.currentChunk} / {uploadProgress.totalChunks} ({uploadProgress.uploadedMB} MB / {uploadProgress.totalMB} MB)</span>
                      <span>Kecepatan: {uploadProgress.speed} • ETA: {uploadProgress.eta}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Category picker checkboxes */}
              <div>
                <label className="block text-zinc-400 mb-1">Pilih Kategori / Genre:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-cinema-850 border border-zinc-800 max-h-36 overflow-y-auto">
                  {categories.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={newMovie.category_ids.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewMovie({ ...newMovie, category_ids: [...newMovie.category_ids, c.id] });
                          } else {
                            setNewMovie({ ...newMovie, category_ids: newMovie.category_ids.filter(id => id !== c.id) });
                          }
                        }}
                        className="accent-amber-500"
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Error message */}
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{uploadError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingMovie}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black shadow-lg mt-2 cursor-pointer text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              >
                {isSubmittingMovie ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sedang Memproses Upload & Transcoding...</span>
                  </>
                ) : (
                  <>
                    <Clapperboard className="w-4 h-4" />
                    <span>Simpan & Proses Film ke Studio</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Movie Modal */}
      {showEditMovieModal && editingMovie && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
          <div className="max-w-2xl w-full glass-panel p-4 sm:p-6 md:p-8 rounded-3xl border border-amber-500/50 shadow-3d-card space-y-4 my-4 sm:my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between shrink-0 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-black text-lg sm:text-xl text-white">Edit Informasi & Aset Film</h3>
              </div>
              <button 
                onClick={() => setShowEditMovieModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMovieSubmit} className="space-y-4 text-xs overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Judul Film</label>
                  <input
                    type="text"
                    required
                    value={editingMovie.title}
                    onChange={(e) => setEditingMovie({ ...editingMovie, title: e.target.value })}
                    className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Tahun Rilis</label>
                  <input
                    type="number"
                    value={editingMovie.release_year}
                    onChange={(e) => setEditingMovie({ ...editingMovie, release_year: Number(e.target.value) })}
                    className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Sinopsis Cerita</label>
                <textarea
                  rows={3}
                  required
                  value={editingMovie.synopsis}
                  onChange={(e) => setEditingMovie({ ...editingMovie, synopsis: e.target.value })}
                  className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Rating (IMDb)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingMovie.rating}
                    onChange={(e) => setEditingMovie({ ...editingMovie, rating: Number(e.target.value) })}
                    className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Klasifikasi Usia</label>
                  <select
                    value={editingMovie.age_rating}
                    onChange={(e) => setEditingMovie({ ...editingMovie, age_rating: e.target.value })}
                    className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="SU">SU (Semua Umur)</option>
                    <option value="13+">13+</option>
                    <option value="17+">17+</option>
                    <option value="21+">21+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Durasi (detik)</label>
                  <input
                    type="number"
                    value={editingMovie.duration_seconds}
                    onChange={(e) => setEditingMovie({ ...editingMovie, duration_seconds: Number(e.target.value) })}
                    className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Status & Featured Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-2xl bg-cinema-850/80 border border-zinc-800">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Status Publikasi Alur</label>
                  <select
                    value={editingMovie.status}
                    onChange={(e) => setEditingMovie({ ...editingMovie, status: e.target.value })}
                    className="w-full bg-cinema-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="DRAFT">DRAFT (Penyuntingan)</option>
                    <option value="PROCESSING">PROCESSING (Sedang Transcoding)</option>
                    <option value="READY">READY (Siap Publikasi)</option>
                    <option value="PUBLISHED">PUBLISHED (Tayang di Katalog)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-200">
                    <input
                      type="checkbox"
                      checked={editingMovie.is_featured}
                      onChange={(e) => setEditingMovie({ ...editingMovie, is_featured: e.target.checked })}
                      className="accent-amber-500 w-4 h-4"
                    />
                    <span className="font-semibold text-xs text-amber-300">Rekomendasi Utama (Featured Hero)</span>
                  </label>
                </div>
              </div>

              {/* Poster & Backdrop Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-semibold text-[11px]">Poster Film (Portrait)</label>
                    <label className="text-[10px] text-amber-400 hover:underline cursor-pointer flex items-center gap-1">
                      <UploadCloud className="w-3 h-3" />
                      <span>Ganti File Poster</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setEditPosterFile(e.target.files[0]);
                            setEditingMovie({ ...editingMovie, poster_url: URL.createObjectURL(e.target.files[0]) });
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="URL Poster..."
                    value={editingMovie.poster_url}
                    onChange={(e) => {
                      setEditPosterFile(null);
                      setEditingMovie({ ...editingMovie, poster_url: e.target.value });
                    }}
                    className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                  {editingMovie.poster_url && (
                    <div className="flex items-center gap-2 pt-1">
                      <img src={editingMovie.poster_url} alt="Preview Poster" className="w-12 h-16 object-cover rounded-lg border border-zinc-700" />
                      <span className="text-[10px] text-zinc-400">{editPosterFile ? `File baru: ${editPosterFile.name}` : 'Poster aktif saat ini'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-semibold text-[11px]">Backdrop Latar (Landscape)</label>
                    <label className="text-[10px] text-amber-400 hover:underline cursor-pointer flex items-center gap-1">
                      <UploadCloud className="w-3 h-3" />
                      <span>Ganti File Backdrop</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setEditBackdropFile(e.target.files[0]);
                            setEditingMovie({ ...editingMovie, backdrop_url: URL.createObjectURL(e.target.files[0]) });
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="URL Backdrop..."
                    value={editingMovie.backdrop_url}
                    onChange={(e) => {
                      setEditBackdropFile(null);
                      setEditingMovie({ ...editingMovie, backdrop_url: e.target.value });
                    }}
                    className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                  {editingMovie.backdrop_url && (
                    <div className="flex items-center gap-2 pt-1">
                      <img src={editingMovie.backdrop_url} alt="Preview Backdrop" className="w-24 h-14 object-cover rounded-lg border border-zinc-700" />
                      <span className="text-[10px] text-zinc-400">{editBackdropFile ? `File baru: ${editBackdropFile.name}` : 'Backdrop aktif saat ini'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Source URL */}
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">URL / Path Sumber Master Video</label>
                <input
                  type="text"
                  placeholder="URL streaming atau path file master video (/uploads/videos/...)"
                  value={editingMovie.video_source_url}
                  onChange={(e) => setEditingMovie({ ...editingMovie, video_source_url: e.target.value })}
                  className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              {/* Category picker checkboxes */}
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Pilih Kategori / Genre:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-cinema-850 border border-zinc-800 max-h-36 overflow-y-auto">
                  {categories.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={editingMovie.category_ids?.includes(c.id)}
                        onChange={(e) => {
                          const cur = editingMovie.category_ids || [];
                          if (e.target.checked) {
                            setEditingMovie({ ...editingMovie, category_ids: [...cur, c.id] });
                          } else {
                            setEditingMovie({ ...editingMovie, category_ids: cur.filter(id => id !== c.id) });
                          }
                        }}
                        className="accent-amber-500"
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Error message */}
              {editError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{editError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdatingMovie}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black shadow-lg mt-2 cursor-pointer text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              >
                {isUpdatingMovie ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Perubahan Film...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Perbarui Data Film</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
      {showTranscodeModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-6 rounded-3xl border border-amber-500/40 shadow-3d-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-white">Jalankan Transcoding Multi-Resolusi</h3>
              <button onClick={() => setShowTranscodeModal(false)}><X className="w-5 h-5 text-zinc-400" /></button>
            </div>

            <form onSubmit={handleStartTranscode} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Pilih Target Film</label>
                <select
                  required
                  value={transcodeTargetMovie}
                  onChange={(e) => setTranscodeTargetMovie(e.target.value)}
                  className="w-full bg-cinema-850 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">-- Pilih Film --</option>
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Pilih Resolusi Output:</label>
                <div className="space-y-2 p-3 rounded-xl bg-cinema-850 border border-zinc-800">
                  {['4K (2160p)', '1080p FHD', '720p HD', '480p SD'].map((res) => (
                    <label key={res} className="flex items-center gap-2 cursor-pointer text-zinc-300">
                      <input
                        type="checkbox"
                        checked={selectedResolutions.includes(res)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedResolutions([...selectedResolutions, res]);
                          } else {
                            setSelectedResolutions(selectedResolutions.filter(r => r !== res));
                          }
                        }}
                        className="accent-amber-500"
                      />
                      <span>{res}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black shadow-lg mt-2 cursor-pointer"
              >
                Mulai Antrean Transcoding
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
