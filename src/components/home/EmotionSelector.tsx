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
        <p className="text-sm tracking-wide text-purple-500">
          YOUR EMOTION
        </p>

        <h2 className="mt-1 text-2xl font-semibold text-zinc-900">
          此刻的你是什么心情？
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
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
              className={`rounded-2xl border p-4 text-left transition-all ${
                selected
                  ? "border-purple-500 bg-purple-100 shadow-sm"
                  : "border-zinc-200 bg-white hover:border-purple-300 hover:bg-purple-50"
              }`}
            >
              <div className="text-2xl">
                {EMOTION_EMOJI[emotion]}
              </div>

              <div className="mt-2 font-medium text-zinc-900">
                {EMOTION_LABEL[emotion]}
              </div>

              <div className="mt-1 text-xs text-zinc-400">
                {selected ? "已选择" : "点击选择"}
              </div>
            </button>
          );
        })}
      </div>

      {selectedEmotions.length === 0 && (
        <p className="mt-3 text-sm text-zinc-400">
          至少选择一种情绪
        </p>
      )}
    </section>
  );
}