"use client";

import { useState, useRef, useEffect } from "react";

/**
 * 沉浸式冥想播放器
 * Prada 极简风格音频播放器
 */
export function MeditationPlayer({
  guideText,
}: {
  guideText: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showText, setShowText] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const duration = 180; // 3 分钟冥想

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 100 / (duration * 10);
        });
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (!isPlaying) {
      setShowText(true);
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (pct: number) => {
    const seconds = Math.floor((pct / 100) * duration);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
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
          呼吸引导冥想
        </h3>
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
            3:00
          </span>
        </div>
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
    </div>
  );
}
