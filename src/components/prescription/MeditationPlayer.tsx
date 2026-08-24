"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { EmotionKeyword, FragranceFamily } from "@/lib/types";
import {
  AmbientAudioEngine,
  resolveSoundscape,
  soundscapeDescription,
} from "@/lib/engine/ambientAudio";

/**
 * 沉浸式冥想播放器
 *
 * 模式一「氛围音效」：Web Audio API 根据香型+情绪实时生成
 * 模式二「语音引导」：浏览器中文语音（SpeechSynthesis）朗读
 *   基于推荐香型生成的引导词，句间留白，同时低音量播放氛围背景
 */

type PlayMode = "ambient" | "guided";

/** 语音引导：语速（低于正常，营造冥想节奏） */
const SPEECH_RATE = 0.72;
/** 语音引导：句间停顿毫秒 */
const SENTENCE_PAUSE_MS = 2600;
/** 语音引导：背景氛围音量（低音量铺底） */
const GUIDED_BG_VOLUME = 0.35;

/** 将中文文本按句切分 */
function splitSentences(text: string): string[] {
  return text.match(/[^。！？]+[。！？]?/g)?.map((s) => s.trim()) ?? [text];
}

/** 估算语音引导总时长（秒）：语速约 2.5 字/秒 + 句间停顿 */
function estimateGuidedDuration(text: string): number {
  const sentences = splitSentences(text);
  return Math.round(text.length / 2.5 + sentences.length * (SENTENCE_PAUSE_MS / 1000));
}

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
  const [hasChineseVoice, setHasChineseVoice] = useState(true);

  const engineRef = useRef<AmbientAudioEngine | null>(null);
  const stopRequestedRef = useRef(false);

  // 根据香型解析氛围场景（与引导词一致），情绪微调音色
  const soundscape = resolveSoundscape(emotions, fragranceFamily);
  const soundscapeLabel = soundscapeDescription(soundscape, emotions);
  const guidedDuration = estimateGuidedDuration(guideText);

  // 初始化氛围引擎 + 检测中文语音
  useEffect(() => {
    engineRef.current = new AmbientAudioEngine();

    // SpeechSynthesis 语音列表可能异步加载
    const checkVoices = () => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        setHasChineseVoice(false);
        return;
      }
      const voices = window.speechSynthesis.getVoices();
      setHasChineseVoice(voices.length === 0 || voices.some((v) => v.lang.startsWith("zh")));
    };
    checkVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.addEventListener("voiceschanged", checkVoices);
    }

    return () => {
      stopRequestedRef.current = true;
      engineRef.current?.stop();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.removeEventListener("voiceschanged", checkVoices);
      }
    };
  }, []);

  /** 选择中文语音（优先 zh-CN） */
  const pickChineseVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang === "zh-CN") ||
      voices.find((v) => v.lang.startsWith("zh")) ||
      null
    );
  };

  /** 朗读一句话（Promise 在朗读结束时 resolve） */
  const speakSentence = (text: string) =>
    new Promise<void>((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        resolve();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = SPEECH_RATE;
      utterance.pitch = 0.9;
      const voice = pickChineseVoice();
      if (voice) utterance.voice = voice;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });

  const waitMs = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

  /** 停止所有播放 */
  const stopAll = useCallback(() => {
    stopRequestedRef.current = true;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    engineRef.current?.stop();
  }, []);

  /** 语音引导模式：逐句朗读 + 句间留白 + 低音量氛围背景 */
  const startGuided = useCallback(async () => {
    stopRequestedRef.current = false;
    // 低音量氛围背景（与引导词同场景）
    engineRef.current?.start(soundscape, emotions, GUIDED_BG_VOLUME);

    const sentences = splitSentences(guideText);
    for (let i = 0; i < sentences.length; i++) {
      if (stopRequestedRef.current) return;
      setProgress(Math.round((i / sentences.length) * 100));
      await speakSentence(sentences[i]);
      if (stopRequestedRef.current) return;
      // 最后一句后不再停顿
      if (i < sentences.length - 1) {
        await waitMs(SENTENCE_PAUSE_MS);
      }
    }
    if (stopRequestedRef.current) return;

    // 朗读结束：淡出背景，回到初始状态
    setProgress(100);
    engineRef.current?.stop();
    await waitMs(1200);
    if (stopRequestedRef.current) return;
    setIsPlaying(false);
    setProgress(0);
  }, [soundscape, emotions, guideText]);

  // 播放/暂停
  const togglePlay = useCallback(() => {
    if (!isPlaying) {
      setShowText(true);
      if (playMode === "ambient") {
        engineRef.current?.start(soundscape, emotions);
        setIsPlaying(true);
      } else {
        setIsPlaying(true);
        void startGuided();
      }
    } else {
      stopAll();
      setIsPlaying(false);
      setProgress(0);
    }
  }, [isPlaying, playMode, soundscape, emotions, startGuided, stopAll]);

  // 切换模式
  const switchMode = (mode: PlayMode) => {
    if (isPlaying) {
      stopAll();
      setIsPlaying(false);
      setProgress(0);
    }
    setPlayMode(mode);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds) % 60;
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
      <div className="text-center mb-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">
          沉浸式冥想
        </p>
        <h3
          className="text-sm tracking-[0.1em]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {playMode === "ambient" ? soundscapeLabel : "中文语音引导冥想"}
        </h3>
        {playMode === "guided" && (
          <p className="text-[9px] text-neutral-400 mt-1">
            背景氛围：{soundscapeLabel}
          </p>
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
          语音引导
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
            className="absolute left-0 top-0 h-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: "#A8C3A0",
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[9px] text-neutral-400 tabular-nums">
            {formatTime((progress / 100) * (playMode === "guided" ? guidedDuration : 300))}
          </span>
          <span className="text-[9px] text-neutral-400 tabular-nums">
            {playMode === "guided" ? formatTime(guidedDuration) : "∞"}
          </span>
        </div>
      </div>

      {/* 语音引导信息（仅引导模式） */}
      {playMode === "guided" && (
        <div className="text-center mb-5">
          <p className="text-[8px] text-neutral-400 tracking-wide">
            {hasChineseVoice
              ? "引导词基于推荐香型生成 · 逐句朗读 · 句间留白"
              : "当前浏览器缺少中文语音，将仅播放背景氛围"}
          </p>
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
            : "中文语音由浏览器语音合成生成 · 背景音效 Web Audio API 实时生成"}
        </p>
      </div>
    </div>
  );
}
