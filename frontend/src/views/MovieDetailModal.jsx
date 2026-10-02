import React from 'react';
import { 
  X, Play, Star, Clock, Calendar, Shield, Sparkles, 
  Languages, Film, CheckCircle2 
} from 'lucide-react';

export const MovieDetailModal = ({ movie, onClose, onPlay }) => {
  if (!movie) return null;

  const has4K = movie.assets?.some(a => a.resolution === '4K') || movie.title?.toLowerCase().includes('4k');

  const formatDuration = (seconds) => {
    if (!seconds) return '1 Jam 45 Menit';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs} Jam ${mins} Menit` : `${mins} Menit`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-cinema-900 border border-cinema-border rounded-3xl overflow-hidden shadow-3d-card my-4 sm:my-8 max-h-[92vh] flex flex-col">
        
        {/* Backdrop Banner Header */}
        <div className="relative h-60 sm:h-80 md:h-96 w-full overflow-hidden bg-cinema-950 shrink-0">
          <img
            src={movie.backdrop_url || movie.poster_url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80"}
            alt={movie.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-900 via-cinema-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-900 via-cinema-900/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 sm:p-2.5 rounded-full bg-black/70 hover:bg-cinema-red text-white backdrop-blur-md transition-all cursor-pointer shadow-lg"
            aria-label="Tutup Detail"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Quick Info on Banner */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 z-10">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {has4K ? (
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-black bg-cinema-red text-white shadow-3d-red flex items-center gap-1">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> 4K ULTRA HD
                  </span>
                ) : (
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-bold bg-cinema-800 text-zinc-300 border border-zinc-700">
                    FHD 1080P
                  </span>
                )}
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-bold bg-black/60 text-zinc-300 border border-white/10">
                  {movie.age_rating || '13+'}
                </span>
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  STATUS: {movie.status || 'PUBLISHED'}
                </span>
              </div>

              <h1 className="font-heading font-black text-xl sm:text-3xl md:text-4xl text-white tracking-wide leading-tight line-clamp-2">
                {movie.title}
              </h1>
            </div>

            {/* Main Action Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  onClose();
                  onPlay(movie);
                }}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-xl red-gradient-btn text-white font-bold text-xs sm:text-base flex items-center justify-center gap-2 sm:gap-2.5 shadow-3d-red hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                <span>Putar Film</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body - Scrollable */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 overflow-y-auto">
          
          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-cinema-850/60 border border-zinc-800">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 text-cinema-gold shrink-0">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-cinema-gold" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs text-zinc-400 font-medium">Rating IMDb</div>
                <div className="font-bold text-white text-xs sm:text-sm truncate">{movie.rating || '8.5'} / 10</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs text-zinc-400 font-medium">Durasi</div>
                <div className="font-bold text-white text-xs sm:text-sm truncate">{formatDuration(movie.duration_seconds)}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs text-zinc-400 font-medium">Tahun Rilis</div>
                <div className="font-bold text-white text-xs sm:text-sm truncate">{movie.release_year || 2026}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs text-zinc-400 font-medium">Klasifikasi Usia</div>
                <div className="font-bold text-white text-xs sm:text-sm truncate">{movie.age_rating || '13+'}</div>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-1.5 sm:space-y-2">
            <h3 className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Sinopsis Cerita
            </h3>
            <p className="text-zinc-300 text-xs sm:text-sm md:text-base leading-relaxed">
              {movie.synopsis || "Sebuah petualangan sinematik yang memukau dengan visual 4K Ultra HD dan teknologi tata suara mutakhir. Saksikan aksi epik para protagonis dalam menyelamatkan dunia."}
            </p>
          </div>

          {/* Categories & Genres */}
          <div className="space-y-2">
            <h3 className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Genre & Kategori
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {movie.categories?.length > 0 ? (
                movie.categories.map((c) => (
                  <span
                    key={c.id || c.name}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-cinema-850 border border-zinc-700/60 text-zinc-200"
                  >
                    {c.name}
                  </span>
                ))
              ) : (
                ['Action', 'Sci-Fi', 'Thriller'].map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-cinema-850 border border-zinc-700/60 text-zinc-200"
                  >
                    {g}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Streaming Qualities Available */}
          <div className="p-4 rounded-2xl bg-cinema-950 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
              <Film className="w-4 h-4 text-cinema-red" />
              <span>Dukungan Format & Kualitas Multi-Stream:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { res: '4K Ultra HD', spec: '3840x2160 • HEVC/H.265' },
                { res: '1080p Full HD', spec: '1920x1080 • AVC/H.264' },
                { res: '720p HD', spec: '1280x720 • Mobile Ready' },
                { res: '480p SD', spec: '854x480 • Hemat Kuota' },
              ].map((q) => (
                <div key={q.res} className="p-2.5 rounded-xl bg-cinema-900 border border-zinc-800/80 text-center space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{q.res}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500">{q.spec}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
