"use client";

import { useState } from "react";
import type { Prescription } from "@/lib/types";
import { EMOTION_LABEL, SCENE_LABEL } from "@/lib/types";
import { TriMappingChart, type BlendStory } from "@/components/prescription/TriMappingChart";
import { FragranceBottleDisplay } from "@/components/prescription/FragranceBottleDisplay";
import { MeditationPlayer } from "@/components/prescription/MeditationPlayer";

/**
 * 生成调配链小故事
 * 环境+场景开场 → 环境旁白 → 情绪旁白 → 香型揭晓，
 * 完整讲述"从环境、场景、情绪到推荐香型"的推导过程。
 */
function generateBlendStory(prescription: Prescription): BlendStory {
  const { environment, user } = prescription.request;
  const top = prescription.recommendedFragrances[0];

  // ─ 开场：天气 + 场景 ─
  const weatherPhrase: Record<string, string> = {
    sunny: "阳光正好", cloudy: "云层低垂", rainy: "细雨如帘",
    snowy: "雪花纷飞", foggy: "雾气弥漫", stormy: "风雨交加",
  };
  const opening = `${environment.city}，${environment.temperature}℃，${weatherPhrase[environment.weather] ?? "天色如常"}。你在「${SCENE_LABEL[user.scene]}」里，写下了今天香气故事的第一页。`;

  // ─ 环境旁白：温度决定香气需求 ─
  const environmentLine =
    environment.temperature >= 30
      ? "环境先开口了：高温之下，空气渴望一份轻盈与清凉。"
      : environment.temperature <= 15
        ? "环境先开口了：微凉之中，空气悄悄寻觅着温暖。"
        : "环境先开口了：温度刚好，一切都从容不迫。";

  // ─ 情绪旁白：情绪定调 ─
  const emotionPhrase: Record<string, string> = {
    happy: "跳跃的开心，想被明亮的香气点亮",
    calm: "平静的心，想被温柔地延续",
    irritated: "烦躁的褶皱，需要一双抚平它的手",
    anxious: "不安的心，正在寻找落脚的地方",
    sad: "忧伤，想要一个温暖的拥抱",
    energetic: "满满的活力，想与明亮的香调共舞",
    tired: "疲惫的身体，想被轻柔地托住",
    romantic: "温柔的情意，想在花香里多停留一会儿",
  };
  const primaryEmotion = user.emotions[0];
  const emotionLine = primaryEmotion
    ? `然后，情绪接过了话：此刻的${EMOTION_LABEL[primaryEmotion]}——${emotionPhrase[primaryEmotion] ?? "正在寻找属于自己的香气"}。`
    : "然后，情绪接过了话：此刻的平静，想找到一款懂它的香气。";

  // ─ 香型揭晓 ─
  const familyPhrase: Record<string, string> = {
    citrus: "明亮通透的柑橘调，像清晨第一缕光",
    floral: "柔软绽放的花香调，像一座正在盛开的花园",
    woody: "沉稳踏实的木质调，像一片古老的森林",
    oriental: "温暖绵长的东方调，像一团琥珀色的光",
    fresh: "洁净清透的清新调，像一场雨后的空气",
    aromatic: "辽阔舒展的芳香调，像站在海边的风",
    chypre: "深邃泥土感的甘苔调，像雨后湿润的林地",
    fougere: "草本清新的馥奇调，像带着露水的草地",
  };
  const ending = `环境与情绪在此交汇——答案，是${familyPhrase[top.family] ?? "一款懂你的香气"}。${top.name}，为你而来。`;

  return { opening, environmentLine, emotionLine, ending };
}

/**
 * 处方页客户端组件
 * 处理交互、展示推荐结果
 */
export default function PrescriptionClient({
  initialPrescription,
}: {
  initialPrescription: Prescription | null;
}) {
  const [prescription, setPrescription] =
    useState<Prescription | null>(initialPrescription);
  const [loading, setLoading] = useState(false);

  // Loading 状态
  if (loading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F7F6F2" }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full mx-auto mb-4 animate-pulse"
            style={{ border: "1px solid rgba(13,13,13,0.1)" }}
          />
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            正在分析你的香气档案...
          </p>
        </div>
      </main>
    );
  }

  // 无数据状态
  if (!prescription) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F7F6F2" }}
      >
        <div className="text-center max-w-sm px-6">
          <h2
            className="text-lg mb-3"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: "#0D0D0D",
            }}
          >
            今日香笺
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed mb-6">
            请先回到首页，选择你的情绪与场景，
            <br />
            让 AI 为你调配专属疗愈香气。
          </p>
          <a
            href="/"
            className="inline-block px-8 py-3 text-[10px] uppercase tracking-[0.15em] transition-all duration-400"
            style={{
              background: "#0D0D0D",
              color: "#F7F6F2",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F7F6F2";
              e.currentTarget.style.color = "#0D0D0D";
              e.currentTarget.style.border = "1px solid #0D0D0D";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#0D0D0D";
              e.currentTarget.style.color = "#F7F6F2";
              e.currentTarget.style.border = "none";
            }}
          >
            返回首页
          </a>
        </div>
      </main>
    );
  }

  const { healingNarrative, triMapping, recommendedFragrances, energyDeviation } =
    prescription;

  // CTA 对应的香水（按 commercialCTA.fragranceId 查找，找不到则用第一推荐）
  const ctaFragrance =
    recommendedFragrances.find(
      (f) => f.id === healingNarrative.commercialCTA.fragranceId
    ) || recommendedFragrances[0];

  return (
    <main className="min-h-screen" style={{ background: "#F7F6F2" }}>
      {/* ─── Header ─── */}
      <header
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(247,246,242,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(13,13,13,0.06)",
        }}
      >
        <a href="/" className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          ← 返回
        </a>
        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
          今日香笺
        </span>
        <span className="text-[10px] text-neutral-300">
          {new Date(prescription.createdAt).toLocaleDateString("zh-CN")}
        </span>
      </header>

      {/* ─── Section 1: 今日状态 ─── */}
      <section className="px-6 pt-12 pb-8 max-w-2xl mx-auto">
        <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-3">
          今日状态
        </p>
        <p
          className="text-sm leading-relaxed text-neutral-700"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {healingNarrative.todayStatus}
        </p>

        {/* 冲突提示 */}
        {energyDeviation.hasConflict && (
          <div
            className="mt-4 px-4 py-3 text-[10px] leading-relaxed text-neutral-600"
            style={{
              background: "rgba(200,214,175,0.15)",
              border: "1px solid rgba(168,195,160,0.3)",
            }}
          >
            ⚡ {energyDeviation.conflictDescription}
          </div>
        )}
      </section>

      {/* ─── Section 2: 三元映射 ─── */}
      <section className="px-6 py-8 max-w-2xl mx-auto">
        <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-6 text-center">
          你的香气诞生记 · 点击探索每个阶段
        </p>
        <TriMappingChart mapping={triMapping} story={generateBlendStory(prescription)} />
      </section>

      {/* ─── Section 3: 推荐香水展示 ─── */}
      <section className="px-6 py-8 max-w-3xl mx-auto">
        <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-6 text-center">
          推荐香氛
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {recommendedFragrances.map((fragrance, idx) => (
            <FragranceBottleDisplay
              key={fragrance.id}
              fragrance={fragrance}
              rank={idx + 1}
            />
          ))}
        </div>
      </section>

      {/* ─── Section 4: 使用建议 + 香气组合 ─── */}
      <section className="px-6 py-8 max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 香气组合 */}
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-3">
              香气组合
            </p>
            <p className="text-[11px] leading-relaxed text-neutral-600">
              {healingNarrative.scentCombination}
            </p>
          </div>

          {/* 使用方式 */}
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-3">
              使用建议
            </p>
            <p className="text-[11px] leading-relaxed text-neutral-600">
              {healingNarrative.usageGuide}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Section 5: 冥想播放器 ─── */}
      <section className="px-6 py-8 max-w-2xl mx-auto">
        <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-6 text-center">
          冥想时刻
        </p>
        <MeditationPlayer
          guideText={healingNarrative.meditationGuide}
          emotions={prescription.request.user.emotions}
          fragranceFamily={recommendedFragrances[0]?.family || "floral"}
        />
      </section>

      {/* ─── Section 6: 情绪引导 ─── */}
      <section className="px-6 py-8 max-w-lg mx-auto text-center">
        <div
          className="px-8 py-6"
          style={{
            borderTop: "1px solid rgba(13,13,13,0.08)",
            borderBottom: "1px solid rgba(13,13,13,0.08)",
          }}
        >
          <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-3">
            情绪引导
          </p>
          <p
            className="text-xs leading-relaxed text-neutral-600 italic"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {healingNarrative.emotionalGuidance}
          </p>
        </div>
      </section>

      {/* ─── Section 7: 商业 CTA ─── */}
      <section className="px-6 py-12 max-w-2xl mx-auto text-center">
        <a
          href={ctaFragrance.purchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-10 py-4 text-[10px] uppercase tracking-[0.15em] transition-all duration-400"
          style={{
            background: "#0D0D0D",
            color: "#F7F6F2",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#F7F6F2";
            e.currentTarget.style.color = "#0D0D0D";
            e.currentTarget.style.outline = "1px solid #0D0D0D";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#0D0D0D";
            e.currentTarget.style.color = "#F7F6F2";
            e.currentTarget.style.outline = "none";
          }}
        >
          {healingNarrative.commercialCTA.label}
        </a>
        <p className="mt-3 text-[8px] text-neutral-400 tracking-wider">
          试香装购买 · 定制礼盒 · 订阅服务
        </p>
      </section>
    </main>
  );
}
