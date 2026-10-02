import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { MovieCard } from '../components/MovieCard';
import { 
  Play, Info, Sparkles, Star, Clock, Filter, 
  RotateCcw, Compass, Flame, TrendingUp 
} from 'lucide-react';

export const ViewerCatalog = ({ onPlayMovie, onSelectMovie, searchQuery }) => {
  const [movies, setMovies] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [loading, setLoading] = useState(true);

  // Hero movie
  const [heroMovie, setHeroMovie] = useState(null);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      
      const [moviesRes, dashRes, catRes] = await Promise.all([
        api.getMovies({
          search: searchQuery,
          category: selectedCategory,
          sort: sortBy,
          limit: 24,
        }).catch(() => null),
        api.getViewerDashboard().catch(() => null),
        api.getCategories(true).catch(() => null),
      ]);

      if (moviesRes?.data) {
        setMovies(moviesRes.data);
        if (!heroMovie && moviesRes.data.length > 0) {
          const featured = moviesRes.data.find(m => m.is_featured) || moviesRes.data[0];
          setHeroMovie(featured);
        }
      }

      if (dashRes?.data?.continue_watching) {
        setContinueWatching(dashRes.data.continue_watching);
      }

      if (catRes?.data) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error("Failed to load catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [searchQuery, selectedCategory, sortBy]);

  return (
    <div className="space-y-8 sm:space-y-12 pb-24 md:pb-16 animate-in fade-in duration-300">
      
      {/* ================= HERO SHOWCASE BANNER ================= */}
      {heroMovie && !searchQuery && (
        <div className="relative h-[52vh] sm:h-[65vh] lg:h-[75vh] w-full overflow-hidden bg-cinema-950 -mt-4">
          <img
            src={heroMovie.backdrop_url || heroMovie.poster_url}
            alt={heroMovie.title}
            className="w-full h-full object-cover object-center filter brightness-[0.65] sm:brightness-[0.7] scale-105 animate-pulse-subtle"
          />

          {/* Seamless Cinema Dark Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-950 via-cinema-950/70 to-transparent" />

          {/* Hero Content */}
          <div className="absolute inset-0 flex items-end sm:items-center pb-6 sm:pb-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl space-y-2.5 sm:space-y-4">
                
                {/* 4K Premiere Badge */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest bg-cinema-red text-white shadow-3d-red flex items-center gap-1">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> REKOMENDASI 4K
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-zinc-300 px-2 py-0.5 rounded bg-black/60 border border-white/10">
                    ⭐ {heroMovie.rating || 9.2}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-zinc-400">
                    {heroMovie.release_year || 2026}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-800/80">
                    {heroMovie.age_rating || '13+'}
                  </span>
                </div>

                {/* Big Title */}
                <h1 className="font-heading font-black text-2xl sm:text-4xl lg:text-6xl text-white tracking-tight leading-tight drop-shadow-2xl line-clamp-2">
                  {heroMovie.title}
                </h1>

                {/* Synopsis */}
                <p className="text-zinc-300 text-xs sm:text-sm lg:text-base leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-xl drop-shadow">
                  {heroMovie.synopsis}
                </p>

                {/* Hero CTAs */}
                <div className="flex items-center gap-2.5 sm:gap-4 pt-1 sm:pt-2">
                  <button
                    onClick={() => onPlayMovie(heroMovie)}
                    className="flex-1 sm:flex-none px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl red-gradient-btn text-white font-extrabold text-xs sm:text-base flex items-center justify-center gap-2 sm:gap-3 shadow-3d-red-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                    <span>Putar Sekarang</span>
                  </button>

                  <button
                    onClick={() => onSelectMovie(heroMovie)}
                    className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-xl dark-gradient-btn text-zinc-200 hover:text-white font-bold text-xs sm:text-base flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Info className="w-4 h-4" />
                    <span>Detail Film</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* ================= CONTINUE WATCHING ROW ================= */}
        {continueWatching.length > 0 && !searchQuery && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-lg sm:text-2xl text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-cinema-red" />
                <span>Lanjutkan Menonton</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {continueWatching.map((item) => {
                const progressPercent = item.duration_seconds > 0 
                  ? Math.min(100, Math.floor((item.last_position_seconds / item.duration_seconds) * 100))
                  : 35;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      const m = movies.find(m => m.id === item.movie_id) || { id: item.movie_id, title: item.movie_title, poster_url: item.movie_poster };
                      onPlayMovie(m);
                    }}
                    className="glass-panel p-3 rounded-2xl border border-zinc-800 hover:border-cinema-red/40 transition-all flex items-center gap-3.5 cursor-pointer group hover:scale-[1.02]"
                  >
                    <div className="relative w-16 sm:w-20 h-20 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-cinema-900">
                      <img src={item.movie_poster} alt={item.movie_title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 fill-white text-white" />
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="font-bold text-white text-xs sm:text-sm truncate group-hover:text-cinema-red transition-colors">
                        {item.movie_title}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Tersisa {Math.floor((item.duration_seconds - item.last_position_seconds) / 60)} menit
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-cinema-950 overflow-hidden">
                        <div 
                          className="h-full bg-cinema-red rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= CATEGORY FILTER TABS & SORT ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          
          {/* Categories Pills - Smooth Touch Scrolling */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === ''
                  ? 'bg-cinema-red text-white shadow-3d-red'
                  : 'bg-cinema-850 text-zinc-400 hover:text-white hover:bg-cinema-800'
              }`}
            >
              Semua Genre
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id || cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.slug
                    ? 'bg-cinema-red text-white shadow-3d-red'
                    : 'bg-cinema-850 text-zinc-400 hover:text-white hover:bg-cinema-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-cinema-850 border border-cinema-border rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-300 focus:outline-none focus:border-cinema-red cursor-pointer"
            >
              <option value="popular">Paling Populer</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="latest">Rilis Terbaru</option>
              <option value="year">Tahun Produksi</option>
            </select>
          </div>

        </div>

        {/* ================= MAIN MOVIES GRID ================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-black text-lg sm:text-2xl text-white flex items-center gap-2">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-cinema-red" />
              <span>{searchQuery ? `Hasil Pencarian: "${searchQuery}"` : selectedCategory ? `Koleksi ${categories.find(c => c.slug === selectedCategory)?.name || ''}` : 'Katalog Pilihan Terbaik'}</span>
            </h2>
            <div className="text-[11px] sm:text-xs text-zinc-500 font-semibold">
              {movies.length} Film Tersedia
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                <div key={n} className="aspect-[2/3] rounded-2xl bg-cinema-850/60 animate-pulse border border-zinc-800" />
              ))}
            </div>
          ) : movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-6">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onPlay={onPlayMovie}
                  onSelect={onSelectMovie}
                />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-8 sm:p-12 rounded-3xl text-center space-y-3">
              <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-zinc-600 mx-auto" />
              <h3 className="font-heading font-bold text-base sm:text-lg text-white">Belum Ada Film / Backend Belum Terhubung</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                Frontend MovieHub telah aktif di Vercel. Untuk menampilkan seluruh film, silakan hubungkan Backend Go & PostgreSQL di Render.com. Jika baru dinyalakan, backend cloud butuh ~30 detik untuk booting.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
