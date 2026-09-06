"use client";

import { useEffect, useState } from "react";
import type {
  Prescription,
  EmotionKeyword,
  FragranceFamily,
  SceneMode,
} from "@/lib/types";
import {
  EMOTION_EMOJI,
  EMOTION_LABEL,
  WEATHER_EMOJI,
  SCENE_LABEL,
} from "@/lib/types";

// ─── 常量 ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "prada-prescriptions";

const FAMILY_LABEL: Record<FragranceFamily, string> = {
  citrus: "柑橘调",
  floral: "花香调",
  woody: "木质调",
  oriental: "东方调",
  fresh: "清新调",
  aromatic: "芳香调",
  chypre: "西普调",
  fougere: "馥奇调",
};

const FAMILY_COLOR: Record<FragranceFamily, string> = {
  citrus: "#E8B84B",
  floral: "#E8A0B4",
  woody: "#A07850",
  oriental: "#C07840",
  fresh: "#5CB8B2",
  aromatic: "#7A9E6A",
  chypre: "#8B7355",
  fougere: "#6A9A6A",
};

const CTA_TYPE_LABEL: Record<string, string> = {
  buy_trial: "购买试香装",
  buy_full: "购买正装",
  subscribe: "订阅替换芯",
  gift_box: "定制礼盒",
};

// ─── 工具函数 ──────────────────────────────────────────────────────────────

/** 从 localStorage 读取处方列表，按时间倒序排列 */
function loadPrescriptions(): Prescription[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const list: Prescription[] = Array.isArray(parsed) ? parsed : [parsed];
    return list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

/** 统计香调偏好（最多 top-3） */
function topFamilies(
  list: Prescription[]
): { family: FragranceFamily; count: number }[] {
  const tally: Partial<Record<FragranceFamily, number>> = {};
  list.forEach((rx) =>
    rx.recommendedFragrances.forEach((f) => {
      tally[f.family] = (tally[f.family] ?? 0) + 1;
    })
  );
  return (Object.entries(tally) as [FragranceFamily, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([family, count]) => ({ family, count }));
}

/** 统计最常见情绪 */
function topEmotions(
  list: Prescription[]
): { emotion: EmotionKeyword; count: number }[] {
  const tally: Partial<Record<EmotionKeyword, number>> = {};
  list.forEach((rx) =>
    rx.request.user.emotions.forEach((e) => {
      tally[e] = (tally[e] ?? 0) + 1;
    })
  );
  return (Object.entries(tally) as [EmotionKeyword, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([emotion, count]) => ({ emotion, count }));
}

/** 计算平均能量偏离度 */
function avgScore(list: Prescription[]): number {
  if (!list.length) return 0;
  return Math.round(
    list.reduce((s, rx) => s + rx.energyDeviation.score, 0) / list.length
  );
}

/** 冲突日占比 */
function conflictRate(list: Prescription[]): number {
  if (!list.length) return 0;
  return Math.round(
    (list.filter((rx) => rx.energyDeviation.hasConflict).length /
      list.length) *
      100
  );
}

/** 格式化日期：MM/DD */
function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, "0")}`;
}

/** 格式化时间：HH:mm */
function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** 格式化完整时间 */
function fmtFull(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

/** 截断文字 */
function truncate(text: string, len = 50): string {
  return text.length > len ? text.slice(0, len) + "…" : text;
}

// ─── 能量得分环形可视化 ────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 100) * circumference;
  const color =
    score >= 70 ? "#C84B4B" : score >= 40 ? "#E8A44A" : "#8BB87A";

  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke="rgba(13,13,13,0.08)"
        strokeWidth="3"
      />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeLinecap="round"
      />
      {/* counter-rotate the text so it reads upright despite the outer -90° SVG rotation */}
      <g transform="rotate(90 28 28)">
        <text
          x="28"
          y="33"
          textAnchor="middle"
          fontSize="11"
          fill="#0D0D0D"
          fontFamily="Georgia, serif"
        >
          {score}
        </text>
      </g>
    </svg>
  );
}

// ─── 处方卡片 ─────────────────────────────────────────────────────────────

function PrescriptionCard({
  rx,
  index,
}: {
  rx: Prescription;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const topFrag = rx.recommendedFragrances[0];
  const emotions = rx.request.user.emotions;
  const { environment } = rx.request;
  const weatherEmoji = WEATHER_EMOJI[environment.weather] ?? "🌤";
  const sceneLabel = SCENE_LABEL[rx.request.user.scene as SceneMode] ?? rx.request.user.scene;
  const familyColor = FAMILY_COLOR[topFrag?.family] ?? "#888";

  return (
    <article
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(13,13,13,0.07)",
        marginBottom: "1px",
      }}
    >
      {/* ── 卡片头部（始终可见） ── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left"
        aria-expanded={expanded}
      >
        <div className="px-5 py-4 flex items-start gap-4">
          {/* 左侧：日期 + 序号 */}
          <div
            className="flex-shrink-0 flex flex-col items-center justify-center"
            style={{ width: 48 }}
          >
            <span
              className="text-[9px] uppercase tracking-[0.15em]"
              style={{ color: "rgba(13,13,13,0.3)" }}
            >
              #{String(index + 1).padStart(2, "0")}
            </span>
            <span
              className="text-base leading-tight mt-0.5"
              style={{
                fontFamily: "Georgia, serif",
                color: "#0D0D0D",
              }}
            >
              {fmtDate(rx.createdAt)}
            </span>
            <span
              className="text-[9px]"
              style={{ color: "rgba(13,13,13,0.4)" }}
            >
              {fmtTime(rx.createdAt)}
            </span>
          </div>

          {/* 中间：情绪 + 城市 + 摘要 */}
          <div className="flex-1 min-w-0">
            {/* 行一：天气城市 + 场景 */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px]">
                {weatherEmoji} {environment.city} {environment.temperature}℃
              </span>
              <span
                className="text-[8px] px-1.5 py-0.5 rounded-full"
                style={{
                  background: "rgba(13,13,13,0.05)",
                  color: "rgba(13,13,13,0.5)",
                }}
              >
                {sceneLabel}
              </span>
            </div>

            {/* 行二：情绪标签 */}
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              {emotions.map((e) => (
                <span
                  key={e}
                  className="text-[9px] px-1.5 py-0.5"
                  style={{
                    background: "rgba(13,13,13,0.04)",
                    color: "#0D0D0D",
                  }}
                >
                  {EMOTION_EMOJI[e as EmotionKeyword]}{" "}
                  {EMOTION_LABEL[e as EmotionKeyword] ?? e}
                </span>
              ))}
            </div>

            {/* 行三：今日状态摘要 */}
            <p
              className="text-[10px] leading-relaxed"
              style={{ color: "rgba(13,13,13,0.55)", fontStyle: "italic" }}
            >
              {truncate(rx.healingNarrative.todayStatus, 55)}
            </p>
          </div>

          {/* 右侧：香水 + 能量得分 */}
          <div className="flex-shrink-0 flex flex-col items-end gap-2">
            {/* 香调色块 + 名称 */}
            {topFrag && (
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[8px] px-2 py-0.5"
                  style={{
                    background: familyColor + "22",
                    color: familyColor,
                    border: `1px solid ${familyColor}44`,
                  }}
                >
                  {FAMILY_LABEL[topFrag.family]}
                </span>
              </div>
            )}
            {topFrag && (
              <span
                className="text-[9px] text-right"
                style={{
                  color: "rgba(13,13,13,0.6)",
                  maxWidth: 80,
                  wordBreak: "break-all",
                }}
              >
                {topFrag.name}
              </span>
            )}
            {/* 冲突标记 */}
            {rx.energyDeviation.hasConflict && (
              <span className="text-[8px]" style={{ color: "#C84B4B" }}>
                ⚡ 冲突
              </span>
            )}
            {/* 展开箭头 */}
            <span
              className="text-[9px] mt-auto"
              style={{
                color: "rgba(13,13,13,0.3)",
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
                display: "inline-block",
              }}
            >
              ▾
            </span>
          </div>
        </div>
      </button>

      {/* ── 展开详情 ── */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid rgba(13,13,13,0.06)",
            background: "#FAFAF8",
          }}
        >
          {/* 详情：完整日期 */}
          <div className="px-5 pt-4 pb-2">
            <p
              className="text-[9px] uppercase tracking-[0.15em] mb-1"
              style={{ color: "rgba(13,13,13,0.35)" }}
            >
              {fmtFull(rx.createdAt)}
            </p>
          </div>

          {/* 能量分析三列 */}
          <div className="px-5 pb-4 grid grid-cols-3 gap-3">
            {[
              { label: "环境能量", val: rx.energyDeviation.environmentEnergy },
              { label: "情绪能量", val: rx.energyDeviation.emotionEnergy },
              { label: "综合偏离", val: rx.energyDeviation.score },
            ].map(({ label, val }) => (
              <div
                key={label}
                className="flex flex-col items-center py-2"
                style={{
                  border: "1px solid rgba(13,13,13,0.06)",
                  background: "#fff",
                }}
              >
                <ScoreRing score={val} />
                <span
                  className="text-[8px] mt-1 tracking-wider uppercase"
                  style={{ color: "rgba(13,13,13,0.4)" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* 冲突描述 */}
          {rx.energyDeviation.hasConflict &&
            rx.energyDeviation.conflictDescription && (
              <div
                className="mx-5 mb-4 px-3 py-2 text-[10px] leading-relaxed"
                style={{
                  background: "rgba(200,75,75,0.06)",
                  border: "1px solid rgba(200,75,75,0.15)",
                  color: "#C84B4B",
                }}
              >
                ⚡ {rx.energyDeviation.conflictDescription}
              </div>
            )}

          {/* 三元映射 */}
          <div className="px-5 pb-4">
            <p
              className="text-[9px] uppercase tracking-[0.15em] mb-2"
              style={{ color: "rgba(13,13,13,0.35)" }}
            >
              三元映射
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: "环境",
                  data: rx.triMapping.environment,
                  icon: weatherEmoji,
                },
                { label: "情绪", data: rx.triMapping.emotion, icon: "💫" },
                { label: "香氛", data: rx.triMapping.fragrance, icon: "🌿" },
              ].map(({ label, data, icon }) => (
                <div
                  key={label}
                  className="p-2"
                  style={{ border: "1px solid rgba(13,13,13,0.06)", background: "#fff" }}
                >
                  <p className="text-[9px] mb-1" style={{ color: "rgba(13,13,13,0.4)" }}>
                    {icon} {label}
                  </p>
                  <p
                    className="text-[10px] font-medium mb-1"
                    style={{ color: "#0D0D0D" }}
                  >
                    {data.label}
                  </p>
                  <p
                    className="text-[8px] leading-relaxed"
                    style={{ color: "rgba(13,13,13,0.45)" }}
                  >
                    {data.factors.slice(0, 3).join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 今日状态（完整） */}
          <div className="px-5 pb-4">
            <p
              className="text-[9px] uppercase tracking-[0.15em] mb-2"
              style={{ color: "rgba(13,13,13,0.35)" }}
            >
              今日状态
            </p>
            <p
              className="text-[11px] leading-relaxed"
              style={{
                color: "rgba(13,13,13,0.7)",
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
              }}
            >
              {rx.healingNarrative.todayStatus}
            </p>
          </div>

          {/* 情绪引导语 */}
          <div className="px-5 pb-4">
            <p
              className="text-[9px] uppercase tracking-[0.15em] mb-2"
              style={{ color: "rgba(13,13,13,0.35)" }}
            >
              情绪寄语
            </p>
            <p
              className="text-[11px] leading-relaxed"
              style={{
                color: "rgba(13,13,13,0.6)",
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
              }}
            >
              {rx.healingNarrative.emotionalGuidance}
            </p>
          </div>

          {/* 推荐香水列表 */}
          <div className="px-5 pb-4">
            <p
              className="text-[9px] uppercase tracking-[0.15em] mb-2"
              style={{ color: "rgba(13,13,13,0.35)" }}
            >
              推荐香氛
            </p>
            <div className="flex flex-col gap-2">
              {rx.recommendedFragrances.map((frag, i) => (
                <div
                  key={frag.id}
                  className="flex items-start gap-3 px-3 py-2"
                  style={{
                    border: "1px solid rgba(13,13,13,0.06)",
                    background: "#fff",
                  }}
                >
                  {/* 产品图 */}
                  {frag.imageUrl && (
                    <div
                      className="flex-shrink-0 overflow-hidden"
                      style={{ width: 32, height: 42, background: "rgba(13,13,13,0.04)" }}
                    >
                      <img
                        src={frag.imageUrl}
                        alt={frag.name}
                        width={32}
                        height={42}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  {/* 排名 */}
                  <span
                    className="text-[8px] flex-shrink-0 pt-0.5"
                    style={{ color: "rgba(13,13,13,0.3)" }}
                  >
                    0{i + 1}
                  </span>
                  {/* 名称 + 调性 + 故事 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium" style={{ color: "#0D0D0D" }}>
                      {frag.name}
                    </p>
                    <p className="text-[9px] mb-1" style={{ color: "rgba(13,13,13,0.45)" }}>
                      {FAMILY_LABEL[frag.family]} · 前调:{" "}
                      {frag.notes.top.slice(0, 2).join(", ")}
                    </p>
                    {frag.story && (
                      <p
                        className="text-[9px] leading-relaxed"
                        style={{
                          color: "rgba(13,13,13,0.38)",
                          fontFamily: "Georgia, serif",
                          fontStyle: "italic",
                        }}
                      >
                        {frag.story}
                      </p>
                    )}
                  </div>
                  {/* 购买 */}
                  <a
                    href={frag.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-[8px] uppercase tracking-wider px-2 py-1"
                    style={{
                      border: "1px solid rgba(13,13,13,0.15)",
                      color: "rgba(13,13,13,0.5)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    探索
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* 使用建议 + 香气组合 */}
          <div className="px-5 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p
                className="text-[9px] uppercase tracking-[0.15em] mb-1.5"
                style={{ color: "rgba(13,13,13,0.35)" }}
              >
                使用建议
              </p>
              <p
                className="text-[10px] leading-relaxed"
                style={{ color: "rgba(13,13,13,0.55)" }}
              >
                {rx.healingNarrative.usageGuide}
              </p>
            </div>
            <div>
              <p
                className="text-[9px] uppercase tracking-[0.15em] mb-1.5"
                style={{ color: "rgba(13,13,13,0.35)" }}
              >
                香气组合
              </p>
              <p
                className="text-[10px] leading-relaxed"
                style={{ color: "rgba(13,13,13,0.55)" }}
              >
                {rx.healingNarrative.scentCombination}
              </p>
            </div>
          </div>

          {/* 冥想引导 */}
          <div className="px-5 pb-4">
            <p
              className="text-[9px] uppercase tracking-[0.15em] mb-2"
              style={{ color: "rgba(13,13,13,0.35)" }}
            >
              冥想引导
            </p>
            <p
              className="text-[11px] leading-relaxed"
              style={{
                color: "rgba(13,13,13,0.6)",
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
              }}
            >
              {rx.healingNarrative.meditationGuide}
            </p>
          </div>

          {/* CTA 按钮 */}
          <div className="px-5 pb-5">
            <a
              href={
                rx.recommendedFragrances.find(
                  (f) => f.id === rx.healingNarrative.commercialCTA.fragranceId
                )?.purchaseUrl ?? rx.recommendedFragrances[0]?.purchaseUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-2.5 text-[9px] uppercase tracking-[0.15em] transition-all duration-300"
              style={{ background: "#0D0D0D", color: "#F7F6F2" }}
              onClick={(e) => e.stopPropagation()}
            >
              {rx.healingNarrative.commercialCTA.label}
            </a>
            <span
              className="ml-3 text-[8px]"
              style={{ color: "rgba(13,13,13,0.35)" }}
            >
              {CTA_TYPE_LABEL[rx.healingNarrative.commercialCTA.type] ?? ""}
            </span>
          </div>
        </div>
      )}
    </article>
  );
}

// ─── 统计面板 ─────────────────────────────────────────────────────────────

function StatsPanel({ list }: { list: Prescription[] }) {
  const families = topFamilies(list);
  const emotions = topEmotions(list);
  const avg = avgScore(list);
  const cRate = conflictRate(list);

  return (
    <div
      className="mb-8 p-5"
      style={{
        background: "#fff",
        border: "1px solid rgba(13,13,13,0.07)",
      }}
    >
      <p
        className="text-[9px] uppercase tracking-[0.2em] mb-4"
        style={{ color: "rgba(13,13,13,0.35)" }}
      >
        香气人格概览 · {list.length} 次记录
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 平均能量 */}
        <div>
          <p
            className="text-[8px] uppercase tracking-wider mb-1"
            style={{ color: "rgba(13,13,13,0.35)" }}
          >
            平均失衡指数
          </p>
          <div className="flex items-baseline gap-1">
            <span
              className="text-2xl"
              style={{
                fontFamily: "Georgia, serif",
                color: avg >= 60 ? "#C84B4B" : avg >= 35 ? "#E8A44A" : "#8BB87A",
              }}
            >
              {avg}
            </span>
            <span className="text-[8px]" style={{ color: "rgba(13,13,13,0.35)" }}>
              / 100
            </span>
          </div>
        </div>

        {/* 冲突率 */}
        <div>
          <p
            className="text-[8px] uppercase tracking-wider mb-1"
            style={{ color: "rgba(13,13,13,0.35)" }}
          >
            冲突日占比
          </p>
          <div className="flex items-baseline gap-1">
            <span
              className="text-2xl"
              style={{
                fontFamily: "Georgia, serif",
                color: cRate >= 50 ? "#C84B4B" : "#0D0D0D",
              }}
            >
              {cRate}%
            </span>
          </div>
        </div>

        {/* 偏好香调 */}
        <div>
          <p
            className="text-[8px] uppercase tracking-wider mb-1"
            style={{ color: "rgba(13,13,13,0.35)" }}
          >
            偏好香调
          </p>
          <div className="flex flex-col gap-1 mt-1">
            {families.map(({ family, count }) => (
              <div key={family} className="flex items-center gap-1.5">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: FAMILY_COLOR[family] }}
                />
                <span className="text-[9px]" style={{ color: "#0D0D0D" }}>
                  {FAMILY_LABEL[family]}
                </span>
                <span
                  className="text-[8px]"
                  style={{ color: "rgba(13,13,13,0.35)" }}
                >
                  ×{count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 常见情绪 */}
        <div>
          <p
            className="text-[8px] uppercase tracking-wider mb-1"
            style={{ color: "rgba(13,13,13,0.35)" }}
          >
            常见情绪
          </p>
          <div className="flex flex-col gap-1 mt-1">
            {emotions.map(({ emotion, count }) => (
              <div key={emotion} className="flex items-center gap-1.5">
                <span className="text-[10px]">
                  {EMOTION_EMOJI[emotion as EmotionKeyword]}
                </span>
                <span className="text-[9px]" style={{ color: "#0D0D0D" }}>
                  {EMOTION_LABEL[emotion as EmotionKeyword]}
                </span>
                <span
                  className="text-[8px]"
                  style={{ color: "rgba(13,13,13,0.35)" }}
                >
                  ×{count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 主页面组件 ────────────────────────────────────────────────────────────

export default function DiaryClient() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<FragranceFamily | "all">("all");

  useEffect(() => {
    setPrescriptions(loadPrescriptions());
    setLoaded(true);
  }, []);

  // 按香调筛选
  const filtered =
    filter === "all"
      ? prescriptions
      : prescriptions.filter((rx) =>
          rx.recommendedFragrances.some((f) => f.family === filter)
        );

  // 已出现过的香调（用于过滤器）
  const usedFamilies = Array.from(
    new Set(
      prescriptions.flatMap((rx) =>
        rx.recommendedFragrances.map((f) => f.family)
      )
    )
  ) as FragranceFamily[];

  // ── SSR 占位 / 加载中 ──
  if (!loaded) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F7F6F2" }}
      >
        <p
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "rgba(13,13,13,0.3)" }}
        >
          读取香气档案...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: "#F7F6F2" }}>
      {/* ─── Header ─── */}
      <header
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(247,246,242,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(13,13,13,0.06)",
        }}
      >
        <a
          href="/"
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "rgba(13,13,13,0.4)" }}
        >
          ← 返回
        </a>
        <span
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "rgba(13,13,13,0.6)" }}
        >
          情绪日记
        </span>
        <span
          className="text-[10px]"
          style={{ color: "rgba(13,13,13,0.3)" }}
        >
          {prescriptions.length} 条记录
        </span>
      </header>

      <div className="px-4 md:px-6 max-w-2xl mx-auto pt-8 pb-16">
        {/* ─── 空状态 ─── */}
        {prescriptions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-16 h-16 rounded-full mb-6 flex items-center justify-center"
              style={{ border: "1px solid rgba(13,13,13,0.08)" }}
            >
              <span className="text-2xl">🌿</span>
            </div>
            <h2
              className="text-base mb-3"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: "#0D0D0D",
              }}
            >
              香气日记尚为空白
            </h2>
            <p
              className="text-[11px] leading-relaxed max-w-xs"
              style={{ color: "rgba(13,13,13,0.45)" }}
            >
              每次获得专属处方后，
              <br />
              它会自动保存在这里，成为你的情绪资产。
            </p>
            <a
              href="/"
              className="mt-8 inline-block px-8 py-3 text-[10px] uppercase tracking-[0.15em] transition-all duration-300"
              style={{ background: "#0D0D0D", color: "#F7F6F2" }}
            >
              开始第一次处方
            </a>
          </div>
        )}

        {/* ─── 有记录状态 ─── */}
        {prescriptions.length > 0 && (
          <>
            {/* 统计面板 */}
            <StatsPanel list={prescriptions} />

            {/* 香调过滤器 */}
            {usedFamilies.length > 1 && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                  className="text-[8px] uppercase tracking-wider mr-1"
                  style={{ color: "rgba(13,13,13,0.35)" }}
                >
                  香调筛选
                </span>
                <button
                  onClick={() => setFilter("all")}
                  className="text-[8px] px-2 py-1 uppercase tracking-wider transition-all"
                  style={{
                    border: "1px solid rgba(13,13,13,0.15)",
                    background: filter === "all" ? "#0D0D0D" : "transparent",
                    color: filter === "all" ? "#F7F6F2" : "rgba(13,13,13,0.5)",
                  }}
                >
                  全部
                </button>
                {usedFamilies.map((fam) => (
                  <button
                    key={fam}
                    onClick={() => setFilter(fam)}
                    className="text-[8px] px-2 py-1 uppercase tracking-wider transition-all"
                    style={{
                      border: `1px solid ${filter === fam ? FAMILY_COLOR[fam] : "rgba(13,13,13,0.12)"}`,
                      background:
                        filter === fam ? FAMILY_COLOR[fam] + "18" : "transparent",
                      color:
                        filter === fam
                          ? FAMILY_COLOR[fam]
                          : "rgba(13,13,13,0.5)",
                    }}
                  >
                    {FAMILY_LABEL[fam]}
                  </button>
                ))}
              </div>
            )}

            {/* 记录数提示 */}
            {filter !== "all" && (
              <p
                className="text-[9px] mb-3"
                style={{ color: "rgba(13,13,13,0.35)" }}
              >
                显示 {filtered.length} / {prescriptions.length} 条记录
              </p>
            )}

            {/* 处方卡片列表 */}
            <div>
              {filtered.map((rx, i) => (
                <PrescriptionCard key={rx.id} rx={rx} index={i} />
              ))}
            </div>

            {/* 底部 CTA */}
            <div className="mt-10 text-center">
              <a
                href="/"
                className="inline-block px-8 py-3 text-[10px] uppercase tracking-[0.15em] transition-all duration-300"
                style={{
                  border: "1px solid rgba(13,13,13,0.2)",
                  color: "rgba(13,13,13,0.6)",
                  background: "transparent",
                }}
              >
                + 新建今日处方
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
