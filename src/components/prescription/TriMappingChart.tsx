"use client";

import { useState } from "react";
import type { TriMapping } from "@/lib/types";

/**
 * 香氛调配链 — 三元映射可视化（交互版）
 *
 * 用"调配故事"替代抽象三角形：
 *   环境（能量输入）→ 情绪（能量状态）→ 香氛（调配结果）
 * 三个阶段由流光粒子连接，点击卡片可展开/收起详情。
 */

type StageKey = "environment" | "emotion" | "fragrance";

const STAGE_META: Record<
  StageKey,
  { icon: string; title: string; desc: string; color: string; barLabel: string }
> = {
  environment: {
    icon: "🌤",
    title: "此刻的环境",
    desc: "你的外部世界",
    color: "#A4B0C0",
    barLabel: "环境能量",
  },
  emotion: {
    icon: "💗",
    title: "此刻的情绪",
    desc: "你的内心状态",
    color: "#E3BDB0",
    barLabel: "情绪能量",
  },
  fragrance: {
    icon: "🌸",
    title: "为你调配",
    desc: "环境与情绪的香气答案",
    color: "#D49B5B",
    barLabel: "匹配契合度",
  },
};

/** 流光粒子连接线（垂直方向） */
function FlowConnector({ color }: { color: string }) {
  return (
    <div className="flex justify-center" style={{ height: "36px" }}>
      <div className="relative w-[1px]" style={{ height: "100%", overflow: "visible" }}>
        {/* 基础线 */}
        <div
          className="absolute left-0 top-0 w-[1px] h-full"
          style={{ background: "rgba(13,13,13,0.08)" }}
        />
        {/* 流光粒子 ×2 */}
        {[0, 1].map((i) => (
          <span
            key={i}
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{
              width: "5px",
              height: "5px",
              background: color,
              opacity: 0.7,
              animation: `flowDown 2.4s linear infinite`,
              animationDelay: `${i * 1.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function TriMappingChart({ mapping }: { mapping: TriMapping }) {
  const [expanded, setExpanded] = useState<StageKey | null>(null);

  const stages: Array<{ key: StageKey; label: string; energy: number; factors: string[] }> = [
    {
      key: "environment",
      label: mapping.environment.label,
      energy: mapping.environment.energy,
      factors: mapping.environment.factors,
    },
    {
      key: "emotion",
      label: mapping.emotion.label,
      energy: mapping.emotion.energy,
      factors: mapping.emotion.factors,
    },
    {
      key: "fragrance",
      label: mapping.fragrance.label,
      energy: mapping.fragrance.energy,
      factors: mapping.fragrance.factors,
    },
  ];

  // 三者契合度：能量越接近，香氛越"懂你"
  const avg =
    (stages[0].energy + stages[1].energy + stages[2].energy) / 3;
  const harmony = Math.max(
    5,
    Math.round(
      100 -
        (Math.abs(stages[0].energy - avg) +
          Math.abs(stages[1].energy - avg) +
          Math.abs(stages[2].energy - avg)) *
          1.5
    )
  );

  const toggle = (key: StageKey) => {
    setExpanded((cur) => (cur === key ? null : key));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 流光动画 keyframes */}
      <style>{`
        @keyframes flowDown {
          0%   { top: 0; opacity: 0; }
          15%  { opacity: 0.8; }
          85%  { opacity: 0.8; }
          100% { top: 30px; opacity: 0; }
        }
        @keyframes barGrow {
          from { width: 0; }
        }
      `}</style>

      <p className="text-center text-[10px] text-neutral-400 tracking-wide mb-6">
        环境与情绪交汇，调配出属于你的香气 ↓
      </p>

      {stages.map((stage, idx) => {
        const meta = STAGE_META[stage.key];
        const isOpen = expanded === stage.key;
        return (
          <div key={stage.key}>
            {/* 阶段卡片 */}
            <button
              onClick={() => toggle(stage.key)}
              className="w-full text-left transition-all duration-400"
              style={{
                background: isOpen
                  ? `${meta.color}12`
                  : "rgba(247,246,242,0.6)",
                border: `1px solid ${isOpen ? meta.color : "rgba(13,13,13,0.08)"}`,
                padding: "16px 20px",
              }}
            >
              <div className="flex items-center gap-4">
                {/* 图标圆 */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-lg"
                  style={{
                    border: `1px solid ${meta.color}`,
                    background: isOpen ? `${meta.color}20` : "transparent",
                  }}
                >
                  {meta.icon}
                </div>

                {/* 主体 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] tracking-[0.1em] font-medium text-neutral-800">
                      {meta.title}
                    </span>
                    <span
                      className="text-xs tabular-nums"
                      style={{ color: meta.color }}
                    >
                      {stage.energy}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-0.5 truncate">
                    {stage.label}
                  </p>
                  {/* 能量条 */}
                  <div
                    className="w-full h-[3px] mt-2"
                    style={{ background: "rgba(13,13,13,0.06)" }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${stage.energy}%`,
                        background: meta.color,
                        animation: "barGrow 1.2s ease-out",
                      }}
                    />
                  </div>
                </div>

                {/* 展开指示 */}
                <span
                  className="text-[10px] text-neutral-400 transition-transform duration-300 shrink-0"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}
                >
                  ▼
                </span>
              </div>

              {/* 展开详情 */}
              {isOpen && (
                <div
                  className="mt-4 pt-3 text-[10px] leading-relaxed text-neutral-600"
                  style={{ borderTop: "1px solid rgba(13,13,13,0.06)" }}
                >
                  <p className="text-[9px] text-neutral-400 mb-2">
                    {meta.desc} · {meta.barLabel} {stage.energy}/100
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {stage.factors.map((f, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-[9px] text-neutral-600"
                        style={{
                          background: `${meta.color}14`,
                          border: `1px solid ${meta.color}40`,
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </button>

            {/* 阶段间流光连接（最后一个阶段后不画） */}
            {idx < stages.length - 1 && (
              <FlowConnector color={STAGE_META[stages[idx + 1].key].color} />
            )}
          </div>
        );
      })}

      {/* 契合度结论 */}
      <div
        className="mt-6 px-6 py-4 text-center"
        style={{
          background: "rgba(200,214,175,0.12)",
          border: "1px solid rgba(168,195,160,0.25)",
        }}
      >
        <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-1">
          三者契合度
        </p>
        <p
          className="text-2xl"
          style={{
            color: "#8FA583",
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          {harmony}
          <span className="text-sm">%</span>
        </p>
        <p className="text-[9px] text-neutral-500 mt-1">
          {harmony >= 85
            ? "今天的你与这款香气高度共鸣"
            : harmony >= 70
              ? "这款香气能很好地平衡你此刻的状态"
              : "这款香气正在温柔地接住你"}
        </p>
      </div>
    </div>
  );
}
