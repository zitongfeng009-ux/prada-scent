"use client";

import { useState } from "react";
import type { Prescription } from "@/lib/types";
import { TriMappingChart } from "@/components/prescription/TriMappingChart";
import { FragranceBottleDisplay } from "@/components/prescription/FragranceBottleDisplay";
import { MeditationPlayer } from "@/components/prescription/MeditationPlayer";

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
        <TriMappingChart mapping={triMapping} />
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
          href="#"
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
