"use client";

import type { EmotionKeyword } from "@/lib/types";
import {
  EMOTION_EMOJI,
  EMOTION_LABEL,
} from "@/lib/types";

interface EmotionSelectorProps {
  selectedEmotions: EmotionKeyword[];
  onChange: (emotions: EmotionKeyword[]) => void;
}

const emotions: EmotionKeyword[] = [
  "happy",
  "calm",
  "irritated",
  "anxious",
  "sad",
  "energetic",
  "tired",
  "romantic",
];

export default function EmotionSelector({
  selectedEmotions,
  onChange,
}: EmotionSelectorProps) {
  const toggleEmotion = (emotion: EmotionKeyword) => {
    if (selectedEmotions.includes(emotion)) {
      onChange(
        selectedEmotions.filter((item) => item !== emotion)
      );
    } else {
      onChange([...selectedEmotions, emotion]);
    }
  };

  return (
    <section className="w-full max-w-2xl">
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">
          你的情绪
        </p>

        <h2
          className="mt-2 text-2xl"
          style={{
            color: "#0D0D0D",
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          此刻的你是什么心情？
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          可以选择多个最贴近你此刻状态的情绪
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {emotions.map((emotion) => {
          const selected = selectedEmotions.includes(emotion);

          return (
            <button
              key={emotion}
              type="button"
              onClick={() => toggleEmotion(emotion)}
              className={`border p-4 text-left transition-colors duration-[400ms] ${
                selected
                  ? "border-[#0D0D0D] bg-[#0D0D0D]"
                  : "border-[rgba(13,13,13,0.12)] bg-transparent hover:border-[#0D0D0D]"
              }`}
              style={{ borderRadius: 2 }}
            >
              <div className="text-2xl">
                {EMOTION_EMOJI[emotion]}
              </div>

              <div
                className={`mt-2 font-medium ${
                  selected ? "text-[#F7F6F2]" : "text-[#0D0D0D]"
                }`}
              >
                {EMOTION_LABEL[emotion]}
              </div>

              <div
                className={`mt-1 text-[10px] tracking-wider ${
                  selected ? "text-[#F7F6F2]/60" : "text-neutral-400"
                }`}
              >
                {selected ? "已选择" : "点击选择"}
              </div>
            </button>
          );
        })}
      </div>

      {selectedEmotions.length === 0 && (
        <p className="mt-3 text-xs tracking-wider text-neutral-400">
          至少选择一种情绪
        </p>
      )}
    </section>
  );
}