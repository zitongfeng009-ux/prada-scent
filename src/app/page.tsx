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
  const [environment, setEnvironment] =
    useState<EnvironmentInput>(mockEnvironment);

  const [selectedEmotions, setSelectedEmotions] = useState<
    EmotionKeyword[]
  >([]);

  const [selectedScene, setSelectedScene] =
    useState<SceneMode | null>(null);

  // 自由倾诉
  const [freeText, setFreeText] = useState("");

  // 定位状态
  const [locationStatus, setLocationStatus] = useState("");

  // 天气加载状态
  const [weatherLoading, setWeatherLoading] = useState(false);

  // =========================
  // 获取当前位置 + 城市 + 天气
  // =========================

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("你的浏览器不支持定位功能");
      return;
    }

    setLocationStatus("正在获取你的位置……");
    setWeatherLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // =========================
          // 1. 获取真实天气
          // =========================

          const weatherResponse = await fetch(
            `/api/weather?lat=${latitude}&lng=${longitude}`
          );

          if (!weatherResponse.ok) {
            throw new Error("天气 API 请求失败");
          }

          const weatherData = await weatherResponse.json();

          // =========================
          // 2. 获取城市名称
          // =========================

          const cityResponse = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client` +
              `?latitude=${latitude}` +
              `&longitude=${longitude}` +
              `&localityLanguage=zh`
          );

          let city = "未知城市";

          if (cityResponse.ok) {
            const cityData = await cityResponse.json();

            city =
              cityData.city ||
              cityData.locality ||
              "未知城市";
          }

          // =========================
          // 3. 更新环境数据
          // =========================

          setEnvironment((prev) => ({
            ...prev,
            city,
            lat: latitude,
            lng: longitude,
            temperature: weatherData.temperature,
            humidity: weatherData.humidity,
            weather: weatherData.weather,
          }));

          setLocationStatus(
            `位置和天气获取成功 ✓ ${city}`
          );
        } catch (error) {
          console.error(error);

          // 即使天气或城市获取失败，
          // 定位仍然成功
          setEnvironment((prev) => ({
            ...prev,
            lat: latitude,
            lng: longitude,
          }));

          setLocationStatus(
            "位置获取成功，但天气或城市暂时获取失败"
          );
        } finally {
          setWeatherLoading(false);
        }
      },
      (error) => {
        console.error(error);

        setWeatherLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus("你拒绝了定位权限");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationStatus("暂时无法获取位置信息");
        } else if (error.code === error.TIMEOUT) {
          setLocationStatus("获取位置超时，请再试一次");
        } else {
          setLocationStatus("获取位置失败，请再试一次");
        }
      }
    );
  };

  // =========================
  // 生成香氛处方
  // =========================

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
      city: environment.city,
      temp: String(environment.temperature),
      humidity: String(environment.humidity),
      weather: environment.weather,
      lat: String(environment.lat),
      lng: String(environment.lng),
      emotions: selectedEmotions.join(","),
      scene: selectedScene,
    });

    // 如果用户填写了自由倾诉，才加入 freeText
    if (freeText.trim()) {
      params.set("freeText", freeText.trim());
    }

    // 跳转到 B 负责的处方页面
    window.location.href = `/prescription?${params.toString()}`;
  };

  return (
    <main
      className="min-h-screen px-6 py-16"
      style={{ background: "#F7F6F2" }}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-12">

        {/* 页面标题 */}
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-400">
            Prada Scent
          </p>

          <h1
            className="mt-4 text-4xl tracking-tight"
            style={{
              color: "#0D0D0D",
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
          >
            今日香氛 · 随境而生
          </h1>

          <p className="mt-4 text-sm text-neutral-500">
            感知此刻的环境，找到属于你的香气
          </p>
        </div>

        {/* 天气 */}
        <WeatherCard environment={environment} />

        {/* 获取位置 */}
        <section className="w-full max-w-md text-center">
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={weatherLoading}
            className="border border-[#0D0D0D] bg-transparent px-8 py-3 text-[11px] tracking-[0.2em] text-[#0D0D0D] transition-colors duration-[400ms] hover:bg-[#0D0D0D] hover:text-[#F7F6F2] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ borderRadius: 0 }}
          >
            {weatherLoading
              ? "正在感知环境……"
              : "使用我的位置"}
          </button>

          {locationStatus && (
            <p className="mt-3 text-xs tracking-wider text-neutral-500">
              {locationStatus}
            </p>
          )}
        </section>

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

        {/* 自由倾诉 */}
        <section className="w-full max-w-md">
          <div className="mb-3">
            <h2
              className="text-xl"
              style={{
                color: "#0D0D0D",
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            >
              自由倾诉
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              还有什么想告诉香氛的？
            </p>
          </div>

          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="例如：最近工作压力有点大，晚上总是睡不好……"
            rows={4}
            maxLength={200}
            className="w-full resize-none border border-[rgba(13,13,13,0.15)] bg-transparent px-5 py-4 text-sm text-[#0D0D0D] outline-none transition-colors duration-[400ms] placeholder:text-neutral-400 focus:border-[#0D0D0D]"
            style={{ borderRadius: 2 }}
          />

          <p className="mt-2 text-right text-[10px] tracking-wider text-neutral-400">
            {freeText.length}/200
          </p>
        </section>

        {/* 生成按钮 */}
        <button
          type="button"
          onClick={handleGeneratePrescription}
          className="w-full max-w-md border border-[#0D0D0D] bg-[#0D0D0D] px-8 py-4 text-xs tracking-[0.3em] text-[#F7F6F2] transition-colors duration-[400ms] hover:bg-[#F7F6F2] hover:text-[#0D0D0D]"
          style={{ borderRadius: 0 }}
        >
          获取今日香笺
        </button>
      </div>
    </main>
  );
}