"use client";

import { useState, useRef, useEffect } from "react";

/**
 * 沉浸式冥想播放器
 * Prada 极简风格音频播放器
 * 音频来源：UCLA Mindful (Creative Commons Attribution-NonCommercial-NoDerivatives 4.0)
 */

const MEDITATION_TRACKS = [
  {
    id: "breathing",
    title: "呼吸引导冥想",
    subtitle: "Breathing Meditation",
    url: "https://d1cy5zxxhbcbkk.cloudfront.net/guided-meditations/01_Breathing_Meditation.mp3",
    duration: 300, // 5 分钟
  },
  {
    id: "body-scan",
    title: "身体扫描冥想",
    subtitle: "Short Body Scan",
    url: "https://d1cy5zxxhbcbkk.cloudfront.net/guided-meditations/Body-Scan-Meditation.mp3",
    duration: 180, // 3 分钟
  },
  {
    id: "body-sound",
    title: "身音冥想",
    subtitle: "Body and Sound Meditation",
    url: "https://d1cy5zxxhbcbkk.cloudfront.net/guided-meditations/Body-Sound-Meditation.mp3",
    duration: 180, // 3 分钟
  },
];

export function MeditationPlayer({
  guideText,
}: {
  guideText: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showText, setShowText] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const track = MEDITATION_TRACKS[currentTrack];

  // 初始化音频元素
  useEffect(() => {
    const audio = new Audio(track.url);
    audio.preload = "metadata";
    audio.addEventListener("canplaythrough", () => setAudioLoaded(true));
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setProgress(0);
    });
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [track.url]);

  // 播放/暂停同步
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
      // 用 requestAnimationFrame 同步进度
      const updateProgress = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
        animFrameRef.current = requestAnimationFrame(updateProgress);
      };
      animFrameRef.current = requestAnimationFrame(updateProgress);
    } else {
      audio.pause();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (!isPlaying) {
      setShowText(true);
    }
    setIsPlaying(!isPlaying);
  };

  const switchTrack = (index: number) => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTrack(index);
    setShowText(false);
  };

  const formatTime = (pct: number) => {
    const seconds = Math.floor((pct / 100) * track.duration);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatDuration = () => {
    const m = Math.floor(track.duration / 60);
    const s = track.duration % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="w-full max-w-md mx-auto px-6 py-8"
      style={{
        background: "rgba(247,246,242,0.6)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(13,13,13,0.08)",
      }}
    >
      {/* 标题 */}
      <div className="text-center mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">
          沉浸式冥想
        </p>
        <h3
          className="text-sm tracking-[0.1em]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {track.title}
        </h3>
        <p className="text-[9px] text-neutral-400 mt-1">{track.subtitle}</p>
      </div>

      {/* 呼吸波纹动画 */}
      <div className="flex justify-center mb-6">
        <button
          onClick={togglePlay}
          className="relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700"
          style={{
            border: "1px solid rgba(13,13,13,0.15)",
            background: isPlaying
              ? "rgba(200,214,175,0.15)"
              : "transparent",
          }}
        >
          {/* 波纹圈 */}
          {isPlaying && (
            <>
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  border: "1px solid rgba(200,214,175,0.3)",
                  animationDuration: "3s",
                }}
              />
              <span
                className="absolute -inset-3 rounded-full animate-pulse"
                style={{
                  border: "1px solid rgba(200,214,175,0.15)",
                  animationDuration: "4s",
                }}
              />
            </>
          )}

          {/* 播放/暂停图标 */}
          {isPlaying ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="relative z-10"
            >
              <rect x="3" y="2" width="3.5" height="12" fill="#0D0D0D" />
              <rect x="9.5" y="2" width="3.5" height="12" fill="#0D0D0D" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="relative z-10"
            >
              <path d="M4 2L14 8L4 14V2Z" fill="#0D0D0D" />
            </svg>
          )}
        </button>
      </div>

      {/* 进度条 */}
      <div className="mb-4">
        <div
          className="w-full h-[1px] relative"
          style={{ background: "rgba(13,13,13,0.1)" }}
        >
          <div
            className="absolute left-0 top-0 h-full transition-all duration-100"
            style={{
              width: `${progress}%`,
              background: "#A8C3A0",
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[9px] text-neutral-400 tabular-nums">
            {formatTime(progress)}
          </span>
          <span className="text-[9px] text-neutral-400 tabular-nums">
            {formatDuration()}
          </span>
        </div>
      </div>

      {/* 曲目选择 */}
      <div className="flex justify-center gap-3 mb-5">
        {MEDITATION_TRACKS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => switchTrack(i)}
            className="text-[8px] uppercase tracking-[0.1em] px-2 py-1 transition-all duration-300"
            style={{
              background: i === currentTrack ? "#0D0D0D" : "transparent",
              color: i === currentTrack ? "#F7F6F2" : "#999",
              border:
                i === currentTrack
                  ? "1px solid #0D0D0D"
                  : "1px solid rgba(13,13,13,0.15)",
              borderRadius: "0px",
            }}
          >
            {t.title}
          </button>
        ))}
      </div>

      {/* 冥想引导文案 */}
      {showText && (
        <div
          className="text-center transition-opacity duration-1000"
          style={{ opacity: showText ? 1 : 0 }}
        >
          <p
            className="text-xs leading-relaxed text-neutral-600 italic"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
          >
            &ldquo;{guideText}&rdquo;
          </p>
        </div>
      )}

      {/* 音频来源声明 */}
      <div className="text-center mt-6 pt-4" style={{ borderTop: "1px solid rgba(13,13,13,0.06)" }}>
        <p className="text-[7px] text-neutral-300 tracking-wide">
          音频来源：UCLA Mindful · Diana Winston · CC BY-NC-ND 4.0
        </p>
      </div>
    </div>
  );
}
