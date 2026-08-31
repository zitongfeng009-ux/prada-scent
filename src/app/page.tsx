"use client";

import { useState } from "react";

import WeatherCard from "@/components/home/WeatherCard";
import EmotionSelector from "@/components/home/EmotionSelector";
import SceneSelector from "@/components/home/SceneSelector";

import type {
  EnvironmentInput,
  EmotionKeyword,
  SceneMode,
} from "@/lib/types";

const mockEnvironment: EnvironmentInput = {
  city: "广州",
  temperature: 28,
  humidity: 75,
  weather: "rainy",
  lat: 23.13,
  lng: 113.26,
};

export default function Home() {
  const [selectedEmotions, setSelectedEmotions] = useState<
    EmotionKeyword[]
  >([]);

  const [selectedScene, setSelectedScene] =
    useState<SceneMode | null>(null);

  const handleGeneratePrescription = () => {
    // 情绪至少选择一个
    if (selectedEmotions.length === 0) {
      alert("请至少选择一种情绪");
      return;
    }

    // 场景必须选择一个
    if (!selectedScene) {
      alert("请选择一个场景");
      return;
    }

    // 使用 URLSearchParams 自动进行 URL 编码
    const params = new URLSearchParams({
      city: mockEnvironment.city,
      temp: String(mockEnvironment.temperature),
      humidity: String(mockEnvironment.humidity),
      weather: mockEnvironment.weather,
      lat: String(mockEnvironment.lat),
      lng: String(mockEnvironment.lng),
      emotions: selectedEmotions.join(","),
      scene: selectedScene,
    });

    // 跳转到 B 负责的处方页面
    window.location.href = `/prescription?${params.toString()}`;
  };

  return (
    <main className="min-h-screen bg-purple-50 px-6 py-12">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-10">
        {/* 页面标题 */}
        <div className="text-center">
          <p className="text-sm tracking-[0.3em] text-purple-500">
            PRADA SCENT
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900">
            今日香氛 · 随境而生
          </h1>

          <p className="mt-3 text-zinc-500">
            感知此刻的环境，找到属于你的香气
          </p>
        </div>

        {/* 天气 */}
        <WeatherCard environment={mockEnvironment} />

        {/* 情绪 */}
        <EmotionSelector
          selectedEmotions={selectedEmotions}
          onChange={setSelectedEmotions}
        />

        {/* 场景 */}
        <SceneSelector
          selectedScene={selectedScene}
          onChange={setSelectedScene}
        />

        {/* 生成按钮 */}
        <button
          type="button"
          onClick={handleGeneratePrescription}
          className="w-full max-w-md rounded-full bg-purple-600 px-8 py-4 text-base font-medium text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-xl active:scale-[0.98]"
        >
          获取今日香笺
        </button>
      </div>
    </main>
  );
}