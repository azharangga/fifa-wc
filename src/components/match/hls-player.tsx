"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Hls from "hls.js";
import {
  Loader2,
  Radio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Tv,
  Settings,
  Gauge,
  SkipForward,
  SkipBack,
  MapPin,
  PictureInPicture2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useTranslation } from "@/components/layout/language-provider";

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function HLSPlayer({
  url,
  channelId,
  channelName,
  onResolutionChange,
}: {
  url: string;
  channelId: string;
  channelName?: string;
  onResolutionChange?: (res: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [isAtLiveEdge, setIsAtLiveEdge] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [currentChannelId, setCurrentChannelId] = useState(channelId);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [currentResolution, setCurrentResolution] = useState<string>("HD");
  const { t } = useTranslation();

  // Sync resolution to parent callback
  useEffect(() => {
    onResolutionChange?.(currentResolution);
  }, [currentResolution, onResolutionChange]);

  // Auto-hide controls after 3s when playing
  useEffect(() => {
    if (isPlaying && !showSpeedMenu) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, showSpeedMenu]);

  const revealControls = useCallback(() => {
    setShowControls(true);
  }, []);

  if (currentChannelId !== channelId) {
    setCurrentChannelId(channelId);
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);
    setCurrentResolution("HD");
  }

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let onLoadedMetadata: (() => void) | null = null;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      video.muted = false;
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,          // Disable LL mode to avoid micro-stalls
        maxBufferLength: 45,            // Pre-load up to 45 seconds of video stream
        maxMaxBufferLength: 90,         // Cache up to 90 seconds maximum
        maxBufferSize: 120 * 1024 * 1024, // 120MB buffer limit
        liveSyncDuration: 15,           // Target 15 seconds behind live edge to establish a safe margin
        liveMaxLatencyDuration: 25,     // Sync back if latency exceeds 25 seconds
        enableSoftwareAES: true,
        // Aggressive retries for network drops
        manifestLoadingTimeOut: 20000,
        manifestLoadingMaxRetry: 6,
        levelLoadingTimeOut: 20000,
        levelLoadingMaxRetry: 6,
        fragLoadingTimeOut: 30000,
        fragLoadingMaxRetry: 8,
      });
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        const levels = hls.levels;
        if (levels && levels.length > 0) {
          const defaultLevel = hls.currentLevel >= 0 ? hls.currentLevel : 0;
          const level = levels[defaultLevel];
          if (level && level.height) {
            setCurrentResolution(`${level.height}p`);
          }
        }
        video.play().catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        const levels = hls.levels;
        const level = levels[data.level];
        if (level && level.height) {
          setCurrentResolution(`${level.height}p`);
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("hlsNetworkError");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError("hlsMediaError");
              hls.recoverMediaError();
              break;
            default:
              setError("hlsStreamError");
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.muted = false;
      setIsLoading(false);

      onLoadedMetadata = () => {
        if (video.videoHeight) {
          setCurrentResolution(`${video.videoHeight}p`);
        }
      };
      video.addEventListener("loadedmetadata", onLoadedMetadata);

      video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {});
      });
    } else {
      hlsRef.current = null;
      window.requestAnimationFrame(() => {
        setError("hlsNotSupported");
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video && onLoadedMetadata) {
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
      }
    };
  }, [url, channelId]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const checkLiveEdge = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLive(true);

    if (video.seekable && video.seekable.length > 0) {
      const end = video.seekable.end(video.seekable.length - 1);
      const diff = end - video.currentTime;
      const atLive = diff < 18;
      setIsAtLiveEdge(atLive);

      // Auto-sync back to live if lag drifts beyond 35 seconds
      if (diff > 35) {
        video.currentTime = Math.max(0, end - 15);
      }
    } else {
      setIsAtLiveEdge(true);
    }
  }, []);

  const syncToLive = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.seekable && video.seekable.length > 0) {
      const end = video.seekable.end(video.seekable.length - 1);
      video.currentTime = Math.max(0, end - 15);
      if (video.paused) {
        video.play().catch(() => {});
      }
      setIsAtLiveEdge(true);
    }
  }, []);

  // Video events and synchronization listener
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      checkLiveEdge();
    };
    const onDurationChange = () => {
      setDuration(video.duration);
      checkLiveEdge();
    };
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
      if (video.videoHeight) {
        setCurrentResolution(`${video.videoHeight}p`);
      }
    };
    const onSeeking = () => setIsBuffering(true);
    const onSeeked = () => {
      setIsBuffering(false);
      checkLiveEdge();
    };
    const onResize = () => {
      if (video.videoHeight) {
        setCurrentResolution(`${video.videoHeight}p`);
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("seeking", onSeeking);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("resize", onResize);

    // Initial check
    if (video.videoHeight) {
      setCurrentResolution(`${video.videoHeight}p`);
    }

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("seeking", onSeeking);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("resize", onResize);
    };
  }, [checkLiveEdge]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (video.paused) {
        await video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch {
      // autoplay blocked
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    setVolume(val);
    video.volume = val;
    video.muted = val === 0;
    setIsMuted(val === 0);
  };

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;
    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // fullscreen not supported
    }
  }, []);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (e) {
      console.error("PiP failed:", e);
    }
  }, []);

  const changeSpeed = useCallback((speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  }, []);

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  }, []);

  const formatTime = (s: number) => {
    if (!isFinite(s)) return "--:--";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          togglePlay();
          revealControls();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          revealControls();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          revealControls();
          break;
        case "p":
          e.preventDefault();
          togglePiP();
          revealControls();
          break;
        case "arrowright":
          e.preventDefault();
          skip(10);
          revealControls();
          break;
        case "arrowleft":
          e.preventDefault();
          skip(-10);
          revealControls();
          break;
        case "arrowup":
          e.preventDefault();
          setVolume((v) => {
            const nv = Math.min(1, v + 0.1);
            if (videoRef.current) {
              videoRef.current.volume = nv;
              videoRef.current.muted = false;
              setIsMuted(false);
            }
            return nv;
          });
          revealControls();
          break;
        case "arrowdown":
          e.preventDefault();
          setVolume((v) => {
            const nv = Math.max(0, v - 0.1);
            if (videoRef.current) {
              videoRef.current.volume = nv;
              videoRef.current.muted = nv === 0;
              setIsMuted(nv === 0);
            }
            return nv;
          });
          revealControls();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen, togglePiP, revealControls, skip]);

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-2xl overflow-hidden group aspect-video w-full"
      style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
      onMouseMove={() => { revealControls(); setIsHovering(true); }}
      onMouseLeave={() => { isPlaying && setShowControls(false); setIsHovering(false); setShowSpeedMenu(false); }}
    >
      <video
        ref={videoRef}
        className="w-full h-full bg-black object-contain cursor-pointer"
        playsInline
        autoPlay
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onDoubleClick={toggleFullscreen}
      />

      {/* ── Loading State ── */}
      {isLoading && !error && (
        <div className="absolute inset-0 bg-[#0c0c0c] z-20 flex flex-col justify-between p-4 select-none">
          {/* Top bar skeleton */}
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-2">
              <div className="w-12 h-5 rounded bg-white/5 animate-pulse" />
              <div className="w-10 h-5 rounded bg-white/5 animate-pulse" />
              <div className="w-14 h-5 rounded bg-white/5 animate-pulse" />
            </div>
            <div className="w-28 h-5 rounded bg-white/5 animate-pulse" />
          </div>
          {/* Center Play Button Skeleton */}
          <div className="flex items-center justify-center">
            <div className="w-[76px] h-[76px] rounded-full bg-white/5 animate-pulse" />
          </div>
          {/* Bottom Bar Skeleton */}
          <div className="w-full space-y-3">
            <div className="w-full h-1 rounded bg-white/5 animate-pulse" />
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded bg-white/5 animate-pulse" />
                <div className="w-8 h-8 rounded bg-white/5 animate-pulse" />
                <div className="w-8 h-8 rounded bg-white/5 animate-pulse" />
                <div className="w-20 h-4 rounded bg-white/5 animate-pulse self-center" />
              </div>
              <div className="flex gap-3">
                <div className="w-12 h-8 rounded bg-white/5 animate-pulse" />
                <div className="w-8 h-8 rounded bg-white/5 animate-pulse" />
                <div className="w-8 h-8 rounded bg-white/5 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Error State ── */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 gap-4 p-6 text-center z-20">
          <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
            <Radio className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white max-w-sm tracking-tight">{t(error)}</p>
            <p className="text-xs text-white/40 mt-1.5 font-medium">{t("chooseDifferentChannel")}</p>
          </div>
        </div>
      )}

      {/* ── Buffering/Lag State ── */}
      {isBuffering && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/15 z-10 pointer-events-none">
          <Loader2 className="h-10 w-10 text-white/90 animate-spin stroke-[1.5]" />
        </div>
      )}

      {/* â”€â”€ Center Play Overlay â”€â”€ */}
      {!isPlaying && !isLoading && !error && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
          style={{ background: "radial-gradient(circle at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)" }}
          onClick={togglePlay}
        >
          <div className="relative">
            {/* Outer glow ring */}
            <div
              className="absolute inset-0 rounded-full transition-all duration-500"
              style={{
                width: "88px",
                height: "88px",
                margin: "-6px",
                background: "rgba(255,255,255,0.08)",
                transform: isHovering ? "scale(1.15)" : "scale(1)",
              }}
            />
            {/* Main button */}
            <button
              className="relative w-[76px] h-[76px] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: "rgba(255,255,255,0.95)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <Play className="h-7 w-7 fill-black text-black translate-x-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Top Bar (Channel Info) ── */}
      <div
        className={`absolute top-0 left-0 right-0 z-10 transition-all duration-300 ${
          showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {isAtLiveEdge ? (
              <div className="flex items-center gap-1.5 bg-red-500 px-2 py-0.5 rounded-md select-none cursor-default">
                <span className="relative flex h-2 w-2 shrink-0 aspect-square">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75 shrink-0"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white shrink-0"></span>
                </span>
                <span className="text-[9px] text-white font-extrabold tracking-wider uppercase">{t("liveIndicator")}</span>
              </div>
            ) : (
              <button
                onClick={syncToLive}
                className="flex items-center gap-1.5 bg-black/55 hover:bg-black/80 px-2 py-0.5 rounded-md select-none text-[9px] text-white/90 border border-white/10 font-extrabold tracking-wider uppercase cursor-pointer transition-all active:scale-95 animate-pulse"
                title="Click to sync to live edge"
              >
                <span className="h-2 w-2 rounded-full bg-gray-400 shrink-0 aspect-square" />
                <span>{t("liveIndicator")}</span>
              </button>
            )}
            <Badge variant="outline" className="text-[10px] font-bold text-white/70 border-white/15 rounded-md h-6 px-1.5 uppercase">
              {currentResolution === "HD" ? "HD" : `HD • ${currentResolution}`}
            </Badge>
          </div>
          {channelName && (
            <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-semibold bg-black/45 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm select-none">
              <Tv className="h-3 w-3 text-white/70 shrink-0" />
              <span>{channelName}</span>
            </div>
          )}
        </div>
      </div>

      {/* â”€â”€ Bottom Control Bar â”€â”€ */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 transition-all duration-300 ${
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pb-3 pt-4">
          <div className="flex items-center justify-between gap-2">
            {/* Left controls */}
            <div className="flex items-center gap-1.5">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 fill-white" />
                )}
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1.5 group/volume">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  <VolumeIcon className="h-4 w-4" />
                </button>
                <div className="relative w-16 md:w-0 md:group-hover/volume:w-20 overflow-hidden transition-all duration-300 flex items-center h-8">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 md:w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                    style={{ accentColor: "white" }}
                  />
                </div>
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1">
              {/* Speed selector */}
              {!isLive && (
                <div className="relative">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
                      >
                        <Gauge className="h-3.5 w-3.5" />
                        {playbackSpeed !== 1 && (
                          <span className="text-[10px] font-bold">{playbackSpeed}x</span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{t("playbackSpeed")}</TooltipContent>
                  </Tooltip>

                  {/* Speed dropdown */}
                  {showSpeedMenu && (
                    <div
                      className="absolute bottom-full right-0 mb-2 rounded-xl overflow-hidden"
                      style={{
                        background: "rgba(20,20,20,0.95)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
                      }}
                    >
                      {PLAYBACK_SPEEDS.map((speed) => (
                        <button
                          key={speed}
                          onClick={() => changeSpeed(speed)}
                          className="w-full px-4 py-2 text-left text-xs font-medium transition-colors hover:bg-white/10"
                          style={{
                            color: speed === playbackSpeed ? "#ffffff" : "rgba(255,255,255,0.5)",
                            background: speed === playbackSpeed ? "rgba(255,255,255,0.08)" : "transparent",
                            minWidth: "80px",
                          }}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PiP */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={togglePiP}
                    className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <PictureInPicture2 className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{t("pictureInPicture")}</TooltipContent>
              </Tooltip>

              {/* Fullscreen */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                  >
                    {isFullscreen ? (
                      <Minimize className="h-4 w-4" />
                    ) : (
                      <Maximize className="h-4 w-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{t("fullscreen")}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
