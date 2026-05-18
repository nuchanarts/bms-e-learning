import { useRef, useEffect, useCallback, useState } from 'react';
import { progressService } from '../../services/progressService';
import { useAuth } from '../../contexts/AuthContext';

interface VideoPlayerProps {
  videoId: string;
  courseId: string;
  url: string;
  duration?: number;
  resumeSeconds?: number;
  onProgress?: (percent: number, completed: boolean) => void;
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    const u = new URL(normalized);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0] || null;
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      const m = u.pathname.match(/\/(?:embed|shorts|live|v)\/([^/?]+)/);
      if (m) return m[1];
    }
  } catch {
    /* ignore */
  }
  return null;
}

function buildYouTubeEmbed(videoId: string, startSeconds?: number): string {
  const base = `https://www.youtube.com/embed/${videoId}`;
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
    vq: 'hd1080',
    hd: '1',
  });
  if (startSeconds && startSeconds > 0) params.set('start', String(Math.floor(startSeconds)));
  return `${base}?${params.toString()}`;
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ── Watermark Overlay ──────────────────────────────────────────────────────

function WatermarkOverlay({ userName }: { userName: string }) {
  const [pos, setPos] = useState({ top: 10, left: 10 });

  useEffect(() => {
    const move = () =>
      setPos({
        top: 5 + Math.random() * 70,
        left: 5 + Math.random() * 60,
      });
    const id = setInterval(move, 15000);
    return () => clearInterval(id);
  }, []);

  const now = new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <>
      {/* Moving watermark */}
      <div
        style={{
          position: 'absolute',
          top: `${pos.top}%`,
          left: `${pos.left}%`,
          pointerEvents: 'none',
          zIndex: 10,
          color: 'rgba(255,255,255,0.22)',
          fontSize: 13,
          fontWeight: 700,
          fontFamily: 'sans-serif',
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          userSelect: 'none',
          transition: 'top 1s ease, left 1s ease',
          whiteSpace: 'nowrap',
        }}
      >
        {userName} · {now}
      </div>

      {/* Fixed "ห้ามบันทึก" strip */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 10,
          color: 'rgba(255,255,255,0.12)',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'sans-serif',
          userSelect: 'none',
          letterSpacing: '0.15em',
        }}
      >
        ห้ามบันทึกหน้าจอ · ห้ามเผยแพร่ · {userName}
      </div>
    </>
  );
}

// ── Screen-Capture Blocker ─────────────────────────────────────────────────

function useScreenCaptureBlock(onDetect: () => void) {
  useEffect(() => {
    if (!navigator.mediaDevices) return;
    const original = navigator.mediaDevices.getDisplayMedia?.bind(navigator.mediaDevices);
    if (!original) return;
    (navigator.mediaDevices as any).getDisplayMedia = async (
      constraints?: MediaStreamConstraints,
    ) => {
      onDetect();
      return original(constraints);
    };
    return () => {
      (navigator.mediaDevices as any).getDisplayMedia = original;
    };
  }, [onDetect]);
}

// ── YouTube Player ─────────────────────────────────────────────────────────

function YouTubePlayer({
  ytId,
  videoId,
  courseId,
  duration,
  resumeSeconds,
  onProgress,
}: {
  ytId: string;
  videoId: string;
  courseId: string;
  duration?: number;
  resumeSeconds?: number;
  onProgress?: (percent: number, completed: boolean) => void;
}) {
  const { user } = useAuth();
  const watchedRef = useRef(resumeSeconds ?? 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedRef = useRef(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [elapsed, setElapsed] = useState(resumeSeconds ?? 0);

  useScreenCaptureBlock(
    useCallback(() => {
      setBlocked(true);
      setPlaying(false);
    }, []),
  );

  const saveProgress = useCallback(
    async (watchedSecs: number) => {
      if (!duration || duration <= 0) return;
      const percent = Math.min(100, (watchedSecs / duration) * 100);
      if (Math.abs(percent - savedRef.current) < 2) return;
      savedRef.current = percent;
      try {
        const result = await progressService.save({
          videoId,
          courseId,
          percent,
          watchedSeconds: Math.floor(watchedSecs),
        });
        onProgress?.(percent, result.videoCompleted);
      } catch {
        /* silent */
      }
    },
    [videoId, courseId, duration, onProgress],
  );

  // Auto-start timer on mount
  useEffect(() => {
    setPlaying(true);
  }, [ytId]);

  // Tick every second while playing
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        watchedRef.current += 1;
        setElapsed(watchedRef.current);
        if (watchedRef.current % 5 === 0) saveProgress(watchedRef.current);
        // Auto-complete when reached duration
        if (duration && watchedRef.current >= duration) {
          setPlaying(false);
          saveProgress(duration);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, saveProgress, duration]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (watchedRef.current > 0) saveProgress(watchedRef.current);
    };
  }, [saveProgress]);

  // Listen for YouTube API ready event and set quality to hd1080
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data?.event === 'onReady' || data?.info === 1) {
          iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'setPlaybackQuality', args: ['hd1080'] }),
            '*',
          );
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const embedUrl = buildYouTubeEmbed(ytId, resumeSeconds);
  const percent = duration ? Math.min(100, Math.round((elapsed / duration) * 100)) : 0;
  const remaining = duration ? Math.max(0, duration - elapsed) : 0;

  return (
    <div style={{ position: 'relative' }}>
      {/* Video container with protection */}
      <div
        style={{
          position: 'relative',
          paddingTop: '56.25%',
          background: '#000',
          borderRadius: 8,
          overflow: 'hidden',
          userSelect: 'none',
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <iframe
          src={embedUrl}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            pointerEvents: 'auto',
          }}
        />

        {/* Watermark */}
        {user && <WatermarkOverlay userName={user.name} />}

        {/* Screen-capture blocker overlay */}
        {blocked && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 20,
              background: 'rgba(0,0,0,0.92)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 40 }}>🚫</div>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>ห้ามบันทึกหน้าจอ</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
              กรุณาหยุดการบันทึกก่อนดูวีดีโอต่อ
            </div>
            <button
              onClick={() => setBlocked(false)}
              style={{
                marginTop: 8,
                padding: '8px 20px',
                borderRadius: 20,
                border: 'none',
                background: 'var(--primary)',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              รับทราบ
            </button>
          </div>
        )}
      </div>

      {/* Progress bar + timer */}
      {duration && duration > 0 && (
        <div style={{ background: 'var(--bg)', borderRadius: '0 0 8px 8px', padding: '10px 14px' }}>
          {/* Progress bar */}
          <div
            style={{
              height: 4,
              background: 'var(--border)',
              borderRadius: 2,
              marginBottom: 8,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${percent}%`,
                background:
                  percent >= 100
                    ? 'linear-gradient(90deg,#10B981,#34D399)'
                    : 'linear-gradient(90deg,#2563EB,#60A5FA)',
                borderRadius: 2,
                transition: 'width 0.5s',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
            <button
              onClick={() => setPlaying((p) => !p)}
              style={{
                padding: '4px 14px',
                borderRadius: 20,
                border: 'none',
                background: playing ? '#EF4444' : 'var(--primary)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {playing ? '⏸ หยุด' : '▶ เล่น'}
            </button>

            <span style={{ color: 'var(--text-muted)' }}>
              {formatTime(elapsed)} / {formatTime(duration)}
            </span>

            <span
              style={{
                marginLeft: 'auto',
                fontWeight: 700,
                color: percent >= 100 ? '#10B981' : 'var(--primary)',
              }}
            >
              {percent >= 100 ? '✅ ดูครบแล้ว' : `${percent}% · เหลือ ${formatTime(remaining)}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main VideoPlayer ───────────────────────────────────────────────────────

export function VideoPlayer({
  videoId,
  courseId,
  url,
  duration,
  resumeSeconds,
  onProgress,
}: VideoPlayerProps) {
  const ytId = getYouTubeId(url);
  if (ytId) {
    return (
      <YouTubePlayer
        ytId={ytId}
        videoId={videoId}
        courseId={courseId}
        duration={duration}
        resumeSeconds={resumeSeconds}
        onProgress={onProgress}
      />
    );
  }
  return (
    <NativeVideoPlayer
      videoId={videoId}
      courseId={courseId}
      url={url}
      resumeSeconds={resumeSeconds}
      onProgress={onProgress}
    />
  );
}

// ── Native Video Player ────────────────────────────────────────────────────

function NativeVideoPlayer({
  videoId,
  courseId,
  url,
  resumeSeconds,
  onProgress,
}: Omit<VideoPlayerProps, 'duration'>) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumedRef = useRef(false);
  const [blocked, setBlocked] = useState(false);

  useScreenCaptureBlock(useCallback(() => setBlocked(true), []));

  const saveProgress = useCallback(
    async (percent: number, watchedSeconds?: number) => {
      try {
        const result = await progressService.save({ videoId, courseId, percent, watchedSeconds });
        onProgress?.(percent, result.videoCompleted);
      } catch {
        /* silent */
      }
    },
    [videoId, courseId, onProgress],
  );

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.duration === 0) return;
    const percent = (video.currentTime / video.duration) * 100;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => saveProgress(percent, Math.floor(video.currentTime)),
      5000,
    );
  }, [saveProgress]);

  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) return;
    heartbeatRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.paused || video.duration === 0) return;
      saveProgress((video.currentTime / video.duration) * 100, Math.floor(video.currentTime));
    }, 5000);
  }, [saveProgress]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const handlePauseOrEnd = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.duration === 0) return;
    stopHeartbeat();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    saveProgress((video.currentTime / video.duration) * 100, Math.floor(video.currentTime));
  }, [saveProgress, stopHeartbeat]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      stopHeartbeat();
    };
  }, [stopHeartbeat]);

  return (
    <div
      style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', userSelect: 'none' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <video
        ref={videoRef}
        src={url}
        controls
        controlsList="nodownload nofullscreen"
        disablePictureInPicture
        style={{ width: '100%', display: 'block', background: '#000' }}
        onLoadedMetadata={() => {
          if (resumeSeconds && resumeSeconds > 0 && !resumedRef.current && videoRef.current) {
            resumedRef.current = true;
            videoRef.current.currentTime = resumeSeconds;
          }
        }}
        onTimeUpdate={handleTimeUpdate}
        onPlay={startHeartbeat}
        onPause={handlePauseOrEnd}
        onEnded={handlePauseOrEnd}
      />

      {/* Watermark */}
      {user && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <WatermarkOverlay userName={user.name} />
        </div>
      )}

      {/* Screen-capture block */}
      {blocked && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 40 }}>🚫</div>
          <div style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>ห้ามบันทึกหน้าจอ</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
            กรุณาหยุดการบันทึกก่อนดูวีดีโอต่อ
          </div>
          <button
            onClick={() => setBlocked(false)}
            style={{
              marginTop: 8,
              padding: '8px 20px',
              borderRadius: 20,
              border: 'none',
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            รับทราบ
          </button>
        </div>
      )}
    </div>
  );
}
