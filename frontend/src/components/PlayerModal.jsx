import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { 
  X, Play, Pause, Volume2, VolumeX, Maximize, Settings, 
  Subtitles, FastForward, Rewind, Check, Sparkles, AlertCircle,
  RotateCcw, RotateCw, Gauge
} from 'lucide-react';

export const PlayerModal = ({ movie, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [adState, setAdState] = useState(null); // { hasAd: boolean, ad: object, canSkip: boolean, countdown: number }
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(movie?.duration_seconds || 100);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackError, setPlaybackError] = useState(null);

  // Streaming Qualities & Subtitles
  const [qualities, setQualities] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [activeStreamUrl, setActiveStreamUrl] = useState('');
  const [subtitles, setSubtitles] = useState([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState('off');
  
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);

  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const EMERGENCY_STREAM_URL = 'https://vjs.zencdn.net/v/oceans.mp4';

  // 1. Initialize playback session and evaluate ad decision
  useEffect(() => {
    let isMounted = true;

    async function initStream() {
      try {
        setLoading(true);
        setPlaybackError(null);

        // Fetch ad decision safely
        let adDecision = { data: { has_ad: false } };
        if (typeof api?.getAdDecision === 'function') {
          adDecision = await api.getAdDecision(movie.id).catch(() => ({ data: { has_ad: false } }));
        }
        
        // Fetch movie details & session safely
        let sessionRes = null;
        if (typeof api?.createPlaybackSession === 'function') {
          sessionRes = await api.createPlaybackSession(movie.id).catch(() => null);
        }

        if (!isMounted) return;

        // Process streams: check sessionRes, then movie.media_assets, then movie.assets
        let streams = sessionRes?.data?.streams || movie.media_assets || movie.assets || [];
        if (!Array.isArray(streams) || streams.length === 0) {
          const directSource = movie.video_source_url || movie.trailer_url || EMERGENCY_STREAM_URL;
          streams = [
            { id: 'str_4k', resolution: '4K', type: 'MP4', url: directSource },
            { id: 'str_1080p', resolution: '1080p', type: 'MP4', url: directSource },
            { id: 'str_720p', resolution: '720p', type: 'MP4', url: 'https://media.w3.org/2010/05/bunny/trailer.mp4' },
            { id: 'str_480p', resolution: '480p', type: 'MP4', url: 'https://media.w3.org/2010/05/video/movie_300.mp4' },
          ];
        }

        const subList = sessionRes?.data?.subtitles || movie.subtitles || [
          { id: 'sub_id', language_code: 'id', label: 'Bahasa Indonesia', is_default: true },
        ];

        setQualities(streams);
        setSubtitles(subList);

        // Default quality
        const bestStream = streams.find(s => s.resolution === '4K') || 
                           streams.find(s => s.resolution === '1080p') || 
                           streams[0];

        let defaultUrl = bestStream?.url || movie.video_source_url || movie.trailer_url || EMERGENCY_STREAM_URL;
        // Safeguard against any dead legacy URLs
        if (!defaultUrl || defaultUrl.includes('commondatastorage.googleapis.com')) {
          defaultUrl = EMERGENCY_STREAM_URL;
        }

        setActiveStreamUrl(defaultUrl);
        if (bestStream) setSelectedQuality(bestStream.resolution);

        // Subtitle default
        const defSub = subList.find(s => s.is_default);
        if (defSub) setSelectedSubtitle(defSub.language_code);

        // Fallback duration from movie metadata
        if (movie.duration_seconds && movie.duration_seconds > 0) {
          setDuration(movie.duration_seconds);
        }

        // Ad decision logic
        if (adDecision?.data?.has_ad && adDecision.data.media_url && !adDecision.data.media_url.includes('commondatastorage')) {
          setAdState({
            hasAd: true,
            ad: adDecision.data,
            countdown: adDecision.data.skip_after_seconds || 3,
            canSkip: false,
          });

          // Track ad impression safely
          if (typeof api?.trackAdEvent === 'function') {
            api.trackAdEvent(
              adDecision.data.session_id,
              adDecision.data.campaign_id,
              adDecision.data.creative_id,
              'impression'
            ).catch(() => {});
          }
        } else {
          setAdState({ hasAd: false });
        }
      } catch (err) {
        console.error("Playback initialization error:", err);
        // Fallback to emergency stream
        setActiveStreamUrl(EMERGENCY_STREAM_URL);
        setAdState({ hasAd: false });
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initStream();

    return () => {
      isMounted = false;
    };
  }, [movie]);

  // 2. Countdown timer for Pre-roll Ad
  useEffect(() => {
    if (!adState?.hasAd) return;

    const timer = setInterval(() => {
      setAdState(prev => {
        if (!prev) return null;
        if (prev.countdown <= 1) {
          return { ...prev, countdown: 0, canSkip: true };
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [adState?.hasAd]);

  // 3. Periodic watch progress sync
  useEffect(() => {
    if (adState?.hasAd || !movie?.id) return;

    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused && videoRef.current.currentTime > 5) {
        api.savePlaybackProgress(
          movie.id,
          Math.floor(videoRef.current.currentTime),
          Math.floor(videoRef.current.duration || duration || 0),
          false
        ).catch(() => {});
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [adState?.hasAd, movie, duration]);

  const handleSkipAd = () => {
    if (adState?.ad) {
      api.trackAdEvent(
        adState.ad.session_id,
        adState.ad.campaign_id,
        adState.ad.creative_id,
        'skip'
      );
    }
    setAdState({ hasAd: false });
  };

  const handleAdEnded = () => {
    if (adState?.ad) {
      api.trackAdEvent(
        adState.ad.session_id,
        adState.ad.campaign_id,
        adState.ad.creative_id,
        'completed'
      );
    }
    setAdState({ hasAd: false });
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  };

  const toggleFullscreen = () => {
    const el = document.getElementById('cinema-player-container');
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // --- PRECISE SEEKING HANDLERS ---
  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekChange = (e) => {
    const val = Number(e.target.value);
    setSeekValue(val);
    setCurrentTime(val);
  };

  const handleSeekCommit = (e) => {
    const val = Number(e.target.value);
    if (videoRef.current && isFinite(val)) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
    setIsSeeking(false);
  };

  // Fast forward / Rewind by seconds
  const handleSkipSeconds = (delta) => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime || 0;
    const maxDur = duration || 100;
    const target = Math.max(0, Math.min(current + delta, maxDur));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const handleSpeedChange = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
    setShowSpeedMenu(false);
  };

  const handleQualityChange = (res) => {
    const found = qualities.find(q => q.resolution === res || q.resolution?.includes(res));
    if (found) {
      const cur = videoRef.current ? videoRef.current.currentTime : currentTime;
      setActiveStreamUrl(found.url);
      setSelectedQuality(res);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = cur;
          videoRef.current.play().catch(console.error);
        }
      }, 150);
    } else {
      setSelectedQuality(res);
    }
    setShowQualityMenu(false);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isSeeking) setShowControls(false);
    }, 4000);
  };

  return (
    <div 
      id="cinema-player-container"
      className="fixed inset-0 z-50 bg-black flex flex-col justify-center items-center overflow-hidden animate-in fade-in duration-200 select-none"
      onMouseMove={handleMouseMove}
      onTouchStart={() => setShowControls(true)}
    >
      {/* Top Close Button (Always reachable) */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-5 sm:right-5 z-50 p-2 sm:p-2.5 rounded-full bg-black/75 hover:bg-cinema-red text-white backdrop-blur-md transition-all cursor-pointer shadow-2xl border border-white/10"
        aria-label="Tutup Player"
      >
        <X className="w-5 h-5" />
      </button>

      {loading ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-cinema-red border-t-transparent animate-spin" />
          <p className="text-sm font-bold text-zinc-300">Menghubungkan ke CDN Streaming 4K...</p>
        </div>
      ) : (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          
          {/* ================= PRE-ROLL AD MODE ================= */}
          {adState?.hasAd ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                src={adState.ad.media_url}
                autoPlay
                playsInline
                onError={() => {
                  console.warn("[MovieHub Player] Ad stream failed, skipping straight to movie.");
                  setAdState({ hasAd: false });
                }}
                onEnded={handleAdEnded}
                className="w-full h-full object-contain"
              />

              {/* Ad Banner Overlay Top Left */}
              <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-30 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-black/85 border border-cinema-red/40 backdrop-blur-md shadow-3d-red max-w-[70%]">
                <span className="w-2 h-2 rounded-full bg-cinema-red animate-ping shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider shrink-0">
                  Iklan
                </span>
                <span className="text-[10px] sm:text-xs text-zinc-400 font-medium truncate">
                  • {adState.ad.title}
                </span>
              </div>

              {/* Skip Ad Button Bottom Right */}
              <div className="absolute bottom-6 right-4 sm:bottom-8 sm:right-8 z-30">
                {adState.canSkip ? (
                  <button
                    onClick={handleSkipAd}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl red-gradient-btn text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-3d-red hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Lewati Iklan</span>
                    <FastForward className="w-4 h-4 fill-white" />
                  </button>
                ) : (
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-black/85 border border-zinc-700 text-zinc-300 font-medium text-[11px] sm:text-xs backdrop-blur-md">
                    Lewati dalam <strong className="text-cinema-red font-bold text-xs sm:text-sm ml-1">{adState.countdown}</strong>s
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= MAIN MOVIE STREAM MODE ================= */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                src={activeStreamUrl}
                autoPlay
                playsInline
                preload="auto"
                onError={(e) => {
                  console.warn("[MovieHub Player] Video load error on URL:", activeStreamUrl);
                  if (activeStreamUrl !== EMERGENCY_STREAM_URL) {
                    setActiveStreamUrl(EMERGENCY_STREAM_URL);
                  } else {
                    setPlaybackError("Format video atau server CDN cadangan sedang dimuat. Klik tombol untuk memutar ulang.");
                  }
                }}
                onLoadedMetadata={() => {
                  setPlaybackError(null);
                  if (videoRef.current) {
                    const d = videoRef.current.duration;
                    if (d && !isNaN(d) && isFinite(d) && d > 0) {
                      setDuration(d);
                    }
                    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                  }
                }}
                onTimeUpdate={() => {
                  if (!isSeeking && videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                    const d = videoRef.current.duration;
                    if (d && !isNaN(d) && isFinite(d) && d > 0 && duration <= 100) {
                      setDuration(d);
                    }
                  }
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
              />

              {/* Playback Error Overlay */}
              {playbackError && (
                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-40">
                  <AlertCircle className="w-12 h-12 text-cinema-red mb-3 animate-bounce" />
                  <h3 className="text-lg font-bold text-white mb-2">Gangguan Aliran Streaming</h3>
                  <p className="text-sm text-zinc-400 max-w-md mb-6">{playbackError}</p>
                  <button
                    onClick={() => {
                      setPlaybackError(null);
                      setActiveStreamUrl(EMERGENCY_STREAM_URL);
                    }}
                    className="px-5 py-2.5 rounded-xl red-gradient-btn text-white font-bold text-sm shadow-3d-red cursor-pointer hover:scale-105 transition-all"
                  >
                    Beralih ke Server Alternatif Fastly CDN
                  </button>
                </div>
              )}

              {/* Subtitle Display */}
              {selectedSubtitle !== 'off' && (
                <div className="absolute bottom-20 sm:bottom-24 left-0 right-0 text-center pointer-events-none px-4 sm:px-6">
                  <span className="inline-block px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-lg bg-black/90 text-white font-semibold text-xs sm:text-base border border-white/10 shadow-2xl backdrop-blur-md max-w-[90%]">
                    [Subtitle: {subtitles.find(s => s.language_code === selectedSubtitle)?.label || 'Bahasa Indonesia'}]
                  </span>
                </div>
              )}

              {/* Controls Overlay */}
              <div 
                className={`absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/60 flex flex-col justify-between p-3 sm:p-6 transition-opacity duration-300 pointer-events-none ${
                  showControls ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* Top Bar: Title & Resolution Badge */}
                <div className="flex items-center justify-between pointer-events-auto pr-12">
                  <div className="flex items-center gap-2 sm:gap-3 max-w-[85%]">
                    <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-black bg-cinema-red text-white shadow-3d-red flex items-center gap-1 shrink-0">
                      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {selectedQuality}
                    </span>
                    <h2 className="font-heading font-bold text-sm sm:text-lg text-white drop-shadow-md truncate">
                      {movie.title}
                    </h2>
                  </div>
                </div>

                {/* Bottom Controls Bar */}
                <div className="space-y-2 sm:space-y-3 pointer-events-auto bg-gradient-to-t from-black/80 to-transparent p-2 rounded-2xl">
                  
                  {/* Progress Bar with Enhanced Seek Support */}
                  <div className="relative group/progress py-1.5 cursor-pointer">
                    <input
                      type="range"
                      min="0"
                      max={duration > 0 ? duration : 100}
                      step="1"
                      value={isSeeking ? seekValue : currentTime}
                      onMouseDown={handleSeekStart}
                      onTouchStart={handleSeekStart}
                      onChange={handleSeekChange}
                      onMouseUp={handleSeekCommit}
                      onTouchEnd={handleSeekCommit}
                      onKeyUp={handleSeekCommit}
                      className="w-full h-2 hover:h-3 bg-zinc-700/60 accent-cinema-red rounded-lg appearance-none cursor-pointer transition-all"
                    />
                    
                    {/* Time display over scrubber */}
                    <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono font-bold text-zinc-300 px-0.5 pt-1">
                      <span>{formatTime(isSeeking ? seekValue : currentTime)}</span>
                      <span className="text-zinc-500">Durasi Total: {formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {/* Left: Play/Pause, Skip -10s, Skip +10s, Volume */}
                    <div className="flex items-center gap-1.5 sm:gap-3">
                      
                      {/* Play / Pause */}
                      <button
                        onClick={togglePlay}
                        className="p-2 sm:p-2.5 rounded-full red-gradient-btn text-white transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-3d-red"
                        aria-label="Play/Pause"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-white" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />}
                      </button>

                      {/* Rewind 10 Seconds */}
                      <button
                        onClick={() => handleSkipSeconds(-10)}
                        className="p-1.5 sm:p-2 rounded-xl bg-black/60 hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 transition-colors cursor-pointer flex items-center gap-1"
                        title="Mundur 10 Detik"
                      >
                        <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cinema-red" />
                        <span className="text-[10px] sm:text-xs font-bold">-10s</span>
                      </button>

                      {/* Fast-Forward 10 Seconds */}
                      <button
                        onClick={() => handleSkipSeconds(10)}
                        className="p-1.5 sm:p-2 rounded-xl bg-black/60 hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 transition-colors cursor-pointer flex items-center gap-1"
                        title="Maju 10 Detik"
                      >
                        <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cinema-red" />
                        <span className="text-[10px] sm:text-xs font-bold">+10s</span>
                      </button>

                      {/* Fast-Forward 30 Seconds */}
                      <button
                        onClick={() => handleSkipSeconds(30)}
                        className="hidden xs:flex p-1.5 sm:p-2 rounded-xl bg-black/60 hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 transition-colors cursor-pointer items-center gap-1"
                        title="Maju 30 Detik"
                      >
                        <FastForward className="w-3.5 h-3.5 text-cinema-red" />
                        <span className="text-[10px] sm:text-xs font-bold">+30s</span>
                      </button>

                      {/* Volume */}
                      <div className="flex items-center gap-1 sm:gap-2 ml-1">
                        <button onClick={toggleMute} className="p-1 text-zinc-300 hover:text-white" aria-label="Mute">
                          {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setVolume(val);
                            setIsMuted(val === 0);
                            if (videoRef.current) videoRef.current.volume = val;
                          }}
                          className="w-12 sm:w-16 h-1 bg-zinc-700 accent-cinema-red rounded appearance-none cursor-pointer hidden sm:block"
                        />
                      </div>
                    </div>

                    {/* Right: Playback Speed, Quality Picker, Subtitle Picker, Fullscreen */}
                    <div className="flex items-center gap-1.5 sm:gap-2 relative">
                      
                      {/* Playback Speed Selector */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            setShowSpeedMenu(!showSpeedMenu);
                            setShowQualityMenu(false);
                            setShowSubtitleMenu(false);
                          }}
                          className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-black/60 hover:bg-white/10 border border-white/10 text-[10px] sm:text-xs font-bold text-zinc-200 flex items-center gap-1 cursor-pointer"
                          title="Kecepatan Putar"
                        >
                          <Gauge className="w-3 h-3 text-emerald-400" />
                          <span>{playbackSpeed}x</span>
                        </button>

                        {showSpeedMenu && (
                          <div className="absolute bottom-full right-0 mb-2 w-32 rounded-xl bg-cinema-900 border border-cinema-border shadow-3d-card p-1.5 z-50">
                            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1">
                              Kecepatan Putar
                            </div>
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                              <button
                                key={spd}
                                onClick={() => handleSpeedChange(spd)}
                                className="w-full px-2 py-1 rounded-lg text-left text-xs font-medium hover:bg-cinema-red/20 hover:text-white flex items-center justify-between text-zinc-300"
                              >
                                <span>{spd}x {spd === 1 ? '(Normal)' : ''}</span>
                                {playbackSpeed === spd && <Check className="w-3 h-3 text-cinema-red" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quality Selector */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            setShowQualityMenu(!showQualityMenu);
                            setShowSubtitleMenu(false);
                            setShowSpeedMenu(false);
                          }}
                          className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-black/60 hover:bg-white/10 border border-white/10 text-[10px] sm:text-xs font-bold text-zinc-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Settings className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cinema-red" />
                          <span>{selectedQuality}</span>
                        </button>

                        {showQualityMenu && (
                          <div className="absolute bottom-full right-0 mb-2 w-40 sm:w-44 rounded-xl bg-cinema-900 border border-cinema-border shadow-3d-card p-1.5 sm:p-2 z-50">
                            <div className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1">
                              Kualitas Video
                            </div>
                            {['4K', '1080p', '720p', '480p'].map((res) => (
                              <button
                                key={res}
                                onClick={() => handleQualityChange(res)}
                                className="w-full px-2 py-1.5 rounded-lg text-left text-xs font-medium hover:bg-cinema-red/20 hover:text-white flex items-center justify-between text-zinc-300"
                              >
                                <span>{res} {res === '4K' ? 'Ultra HD' : res === '1080p' ? 'Full HD' : ''}</span>
                                {selectedQuality === res && <Check className="w-3.5 h-3.5 text-cinema-red" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Subtitle Selector */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            setShowSubtitleMenu(!showSubtitleMenu);
                            setShowQualityMenu(false);
                            setShowSpeedMenu(false);
                          }}
                          className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-black/60 hover:bg-white/10 border border-white/10 text-[10px] sm:text-xs font-bold text-zinc-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Subtitles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
                          <span>CC</span>
                        </button>

                        {showSubtitleMenu && (
                          <div className="absolute bottom-full right-0 mb-2 w-44 sm:w-48 rounded-xl bg-cinema-900 border border-cinema-border shadow-3d-card p-1.5 sm:p-2 z-50">
                            <div className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1">
                              Subtitle / Terjemahan
                            </div>
                            <button
                              onClick={() => { setSelectedSubtitle('off'); setShowSubtitleMenu(false); }}
                              className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium hover:bg-cinema-red/20 text-zinc-300 flex items-center justify-between"
                            >
                              <span>Nonaktif</span>
                              {selectedSubtitle === 'off' && <Check className="w-3.5 h-3.5 text-cinema-red" />}
                            </button>
                            {subtitles.map((sub) => (
                              <button
                                key={sub.id || sub.language_code}
                                onClick={() => { setSelectedSubtitle(sub.language_code); setShowSubtitleMenu(false); }}
                                className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium hover:bg-cinema-red/20 text-zinc-300 flex items-center justify-between"
                              >
                                <span>{sub.label}</span>
                                {selectedSubtitle === sub.language_code && <Check className="w-3.5 h-3.5 text-cinema-red" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Fullscreen */}
                      <button
                        onClick={toggleFullscreen}
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="Fullscreen"
                      >
                        <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
};
