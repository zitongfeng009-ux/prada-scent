"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { EmotionKeyword, FragranceFamily } from "@/lib/types";
import {
  AmbientAudioEngine,
  resolveSoundscape,
  soundscapeDescription,
  type SoundscapeType,
} from "@/lib/engine/ambientAudio";

/**
 * 沉浸式冥想播放器
 * 根据用户情绪 + 推荐香型 自动生成匹配的氛围音效
 * 同时提供 UCLA 免费引导冥想音频
 */

// UCLA 引导冥想音频（Creative Commons CC BY-NC-ND 4.0）
const GUIDED_TRACKS = [
  {
    id: "breathing",
    title: "呼吸引导冥想",
    subtitle: "Breathing Meditation · UCLA Mindful",
    url: "https://d1cy5zxxhbcbkk.cloudfront.net/guided-meditations/01_Breathing_Meditation.mp3",
    duration: 300,
  },
  {
    id: "body-scan",
    title: "身体扫描冥想",
    subtitle: "Short Body Scan · UCLA Mindful",
    url: "https://d1cy5zxxhbcbkk.cloudfront.net/guided-meditations/Body-Scan-Meditation.mp3",
    duration: 180,
  },
  {
    id: "body-sound",
    title: "身音冥想",
    subtitle: "Body and Sound · UCLA Mindful",
    url: "https://d1cy5zxxhbcbkk.cloudfront.net/guided-meditations/Body-Sound-Meditation.mp3",
    duration: 180,
  },
];

type PlayMode = "ambient" | "guided";

export function MeditationPlayer({
  guideText,
  emotions,
  fragranceFamily,
}: {
  guideText: string;
  emotions: EmotionKeyword[];
  fragranceFamily: FragranceFamily;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showText, setShowText] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>("ambient");
  const [currentTrack, setCurrentTrack] = useState(0);

  const engineRef = useRef<AmbientAudioEngine | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 根据香型解析氛围场景（与引导词一致），情绪微调音色
  const soundscape: SoundscapeType = resolveSoundscape(emotions, fragranceFamily);
  const soundscapeLabel = soundscapeDescription(soundscape, emotions);
  const track = GUIDED_TRACKS[currentTrack];

  // 初始化氛围引擎
  useEffect(() => {
    engineRef.current = new AmbientAudioEngine();
    return () => {
      engineRef.current?.stop();
    };
  }, []);

  // 播放/暂停
  const togglePlay = useCallback(() => {
    if (!isPlaying) {
      setShowText(true);
      if (playMode === "ambient") {
        engineRef.current?.start(soundscape, emotions);
      } else {
        const audio = new Audio(track.url);
        audio.play().catch(() => {});
        audioRef.current = audio;
        // 同步进度
        const sync = () => {
          if (audio.duration && !isNaN(audio.duration)) {
            setProgress((audio.currentTime / audio.duration) * 100);
          }
          animFrameRef.current = requestAnimationFrame(sync);
        };
        animFrameRef.current = requestAnimationFrame(sync);
        audio.addEventListener("ended", () => {
          setIsPlaying(false);
          setProgress(0);
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        });
      }
    } else {
      // 暂停
      if (playMode === "ambient") {
        engineRef.current?.stop();
      } else {
        audioRef.current?.pause();
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      }
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, playMode, soundscape, track.url, emotions]);

  // 切换模式
  const switchMode = (mode: PlayMode) => {
    if (isPlaying) {
      if (playMode === "ambient") engineRef.current?.stop();
      else {
        audioRef.current?.pause();
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      }
      setIsPlaying(false);
      setProgress(0);
    }
    setPlayMode(mode);
  };

  // 切换引导冥想曲目
  const switchTrack = (index: number) => {
    if (isPlaying && playMode === "guided") {
      audioRef.current?.pause();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setIsPlaying(false);
      setProgress(0);
    }
    setCurrentTrack(index);
  };

  // 清理
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      audioRef.current?.pause();
    };
  }, []);

  const formatTime = (pct: number) => {
    const dur = playMode === "guided" ? track.duration : 300;
    const seconds = Math.floor((pct / 100) * dur);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatDuration = () => {
    if (playMode === "guided") {
      const m = Math.floor(track.duration / 60);
      const s = track.duration % 60;
      return `${m}:${s.toString().padStart(2, "0")}`;
    }
    return "∞";
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
      <div className="text-center mb-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">
          沉浸式冥想
        </p>
        <h3
          className="text-sm tracking-[0.1em]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {playMode === "ambient" ? soundscapeLabel : track.title}
        </h3>
        {playMode === "guided" && (
          <p className="text-[9px] text-neutral-400 mt-1">{track.subtitle}</p>
        )}
        {playMode === "ambient" && (
          <p className="text-[9px] text-neutral-400 mt-1">
            基于你的情绪与推荐香型生成
          </p>
        )}
      </div>

      {/* 模式切换 */}
      <div className="flex justify-center gap-2 mb-5">
        <button
          onClick={() => switchMode("ambient")}
          className="text-[8px] uppercase tracking-[0.12em] px-3 py-1.5 transition-all duration-400"
          style={{
            background: playMode === "ambient" ? "#0D0D0D" : "transparent",
            color: playMode === "ambient" ? "#F7F6F2" : "#999",
            border:
              playMode === "ambient"
                ? "1px solid #0D0D0D"
                : "1px solid rgba(13,13,13,0.15)",
            borderRadius: "0px",
          }}
        >
          氛围音效
        </button>
        <button
          onClick={() => switchMode("guided")}
          className="text-[8px] uppercase tracking-[0.12em] px-3 py-1.5 transition-all duration-400"
          style={{
            background: playMode === "guided" ? "#0D0D0D" : "transparent",
            color: playMode === "guided" ? "#F7F6F2" : "#999",
            border:
              playMode === "guided"
                ? "1px solid #0D0D0D"
                : "1px solid rgba(13,13,13,0.15)",
            borderRadius: "0px",
          }}
        >
          引导冥想
        </button>
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
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="relative z-10">
              <rect x="3" y="2" width="3.5" height="12" fill="#0D0D0D" />
              <rect x="9.5" y="2" width="3.5" height="12" fill="#0D0D0D" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="relative z-10">
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

      {/* 引导冥想曲目选择（仅引导模式） */}
      {playMode === "guided" && (
        <div className="flex justify-center gap-2 mb-5">
          {GUIDED_TRACKS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => switchTrack(i)}
              className="text-[8px] tracking-[0.08em] px-2 py-1 transition-all duration-300"
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
      )}

      {/* 氛围音效信息（仅氛围模式） */}
      {playMode === "ambient" && (
        <div className="text-center mb-5">
          <p className="text-[8px] text-neutral-400 tracking-wide">
            氛围：{soundscapeLabel} · 香型：{fragranceFamily}
          </p>
        </div>
      )}

      {/* 冥想引导文案 */}
      {showText && (
        <div className="text-center transition-opacity duration-1000" style={{ opacity: 1 }}>
          <p
            className="text-xs leading-relaxed text-neutral-600 italic"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            &ldquo;{guideText}&rdquo;
          </p>
        </div>
      )}

      {/* 来源声明 */}
      <div className="text-center mt-6 pt-4" style={{ borderTop: "1px solid rgba(13,13,13,0.06)" }}>
        <p className="text-[7px] text-neutral-300 tracking-wide">
          {playMode === "ambient"
            ? "氛围音效由 Web Audio API 实时生成"
            : "引导音频：UCLA Mindful · Diana Winston · CC BY-NC-ND 4.0"}
        </p>
      </div>
    </div>
  );
}
