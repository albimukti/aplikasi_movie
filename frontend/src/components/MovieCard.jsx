import React from 'react';
import { Play, Star, Clock, Sparkles } from 'lucide-react';

export const MovieCard = ({ movie, onPlay, onSelect }) => {
  const has4K = movie.assets?.some(a => a.resolution === '4K') || movie.title?.toLowerCase().includes('4k');
  
  const formatDuration = (seconds) => {
    if (!seconds) return '1j 45m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}j ${mins}m` : `${mins}m`;
  };

  return (
    <div 
      onClick={() => onSelect(movie)}
      className="group relative rounded-2xl overflow-hidden glass-card cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:z-20 active:scale-[0.98]"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-cinema-900">
        <img
          src={movie.poster_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80"}
          alt={movie.title}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/25 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

        {/* Badges on Top */}
        <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 flex items-center justify-between pointer-events-none gap-1">
          {has4K ? (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black tracking-wider uppercase bg-cinema-red text-white shadow-3d-red flex items-center gap-0.5 sm:gap-1">
              <Sparkles className="w-2.5 h-2.5" /> 4K ULTRA
            </span>
          ) : (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-cinema-850/80 text-zinc-300 border border-zinc-700/60 backdrop-blur-md">
              FHD 1080P
            </span>
          )}

          <span className="px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-black/60 text-zinc-300 border border-white/10 backdrop-blur-md">
            {movie.age_rating || '13+'}
          </span>
        </div>

        {/* Center Hover / Touch Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(movie);
            }}
            className="w-11 h-11 sm:w-14 sm:h-14 rounded-full red-gradient-btn flex items-center justify-center shadow-3d-red-lg text-white hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            aria-label="Putar Film"
          >
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white ml-0.5" />
          </button>
        </div>

        {/* Bottom Card Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4 space-y-1 sm:space-y-1.5">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold flex-wrap">
            <span className="flex items-center gap-0.5 sm:gap-1 text-cinema-gold font-bold">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-cinema-gold text-cinema-gold" />
              {movie.rating ? Number(movie.rating).toFixed(1) : '8.5'}
            </span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-300">{movie.release_year || 2026}</span>
            <span className="text-zinc-500 hidden xs:inline">•</span>
            <span className="text-zinc-400 hidden xs:flex items-center gap-1 text-[10px] sm:text-[11px]">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {formatDuration(movie.duration_seconds)}
            </span>
          </div>

          <h3 className="font-heading font-bold text-xs sm:text-sm md:text-base text-white group-hover:text-cinema-red transition-colors line-clamp-1">
            {movie.title}
          </h3>

          {/* Categories */}
          <div className="flex items-center gap-1 flex-wrap pt-0.5">
            {movie.categories?.slice(0, 1).map((cat) => (
              <span 
                key={cat.id || cat.name}
                className="text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full bg-cinema-800/80 text-zinc-300 border border-zinc-700/40 truncate max-w-[100px]"
              >
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
