"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type {
  BlendRecipe,
  DeviceCommand,
  DeviceState,
  EmotionKeyword,
  EnvironmentInput,
  Prescription,
  SceneMode,
} from "@/lib/types";
import { EMOTION_EMOJI, EMOTION_LABEL, SCENE_LABEL, WEATHER_EMOJI, WEATHER_LABEL } from "@/lib/types";
import { computeBlendRecipe } from "@/lib/engine/blend";
import { CARTRIDGES } from "@/lib/data/cartridges";
// ⚠️ A 交付后改为：import { senseEmotions } from "@/lib/ai/emotionDetection";
import { senseEmotions, type EmotionSenseResult } from "./placeholderSense";
// ⚠️ C 交付后改为：import VirtualScentDevice from "@/components/device/VirtualScentDevice";
import PlaceholderScentDevice from "./PlaceholderScentDevice";

/**
 * /device —— Prada Scent Aura 虚拟智能香薰机
 *
 * Physical AI 闭环的完整演示：感知 → 决策 → 执行。
 * 本页由 B 负责编排，三个环节分别对应 A 的感知模块、B 的引擎与调配层、
 * C 的设备呈现组件；后两者目前用占位实现，替换入口已标注在 import 处。
 */

/** 三阶段流水线定义（与三人分工一一对应） */
const PIPELINE: { key: DeviceState[]; layer: string; title: string; note: string }[] = [
  { key: ["sensing"], layer: "感知层", title: "读取此刻情绪", note: "摄像头 · 面部特征读数" },
  { key: ["prescribing"], layer: "决策层", title: "生成香气处方", note: "能量偏离度 · 全目录匹配" },
  { key: ["blending"], layer: "决策层", title: "实时调配配方", note: "香材拆解 → 7 仓配比" },
  { key: ["releasing", "complete"], layer: "执行层", title: "混合释放香气", note: "点亮精油仓 · 出雾 · 氛围灯" },
];

const LABEL: Record<DeviceState, string> = {
  idle: "待机",
  sensing: "感知中",
  prescribing: "分析中",
  blending: "调配中",
  releasing: "释放中",
  complete: "已完成",
};

export default function DeviceClient({
  environment,
  scene,
  forcedEmotions = [],
}: {
  environment: EnvironmentInput;
  scene: SceneMode;
  /** 路演用：URL 传入时固定感知结果，保证演示可复现 */
  forcedEmotions?: EmotionKeyword[];
}) {
  const [state, setState] = useState<DeviceState>("idle");
  const [sense, setSense] = useState<EmotionSenseResult | null>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [recipe, setRecipe] = useState<BlendRecipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const command = useMemo<DeviceCommand>(
    () => ({ state, recipe: recipe ?? undefined }),
    [state, recipe],
  );

  /**
   * 回处方页的链接：必须把本页的环境 / 场景 / 情绪原样带回去，
   * 否则用户点「查看完整处方」会落到一份与刚释放的香气无关的默认处方。
   * 注意 /prescription 用的是复数 emotions，/device 入口用的是单数 emotion。
   */
  const prescriptionHref = useMemo(() => {
    const emotions = sense?.emotions ?? forcedEmotions;
    if (!emotions.length) return "/prescription";
    const q = new URLSearchParams({
      city: environment.city,
      temp: String(environment.temperature),
      humidity: String(environment.humidity),
      weather: environment.weather,
      lat: String(environment.lat),
      lng: String(environment.lng),
      scene,
      emotions: emotions.join(","),
    });
    return `/prescription?${q.toString()}`;
  }, [environment, scene, sense, forcedEmotions]);

  const run = useCallback(async () => {
    setError(null);
    setRecipe(null);
    setPrescription(null);
    setSense(null);

    try {
      // ── ① 感知 ───────────────────────────────────────────
      setState("sensing");
      const sensed = await senseEmotions({
        force: forcedEmotions.length ? forcedEmotions : undefined,
      });
      setSense(sensed);

      // ── ② 决策：调用现有推荐引擎 ─────────────────────────
      setState("prescribing");
      const res = await fetch("/api/prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          environment,
          user: { emotions: sensed.emotions as EmotionKeyword[], scene },
        }),
      });
      if (!res.ok) throw new Error(`处方生成失败（${res.status}）`);
      const rx: Prescription = await res.json();
      const top = rx.recommendedFragrances?.[0];
      if (!top) throw new Error("推荐引擎未返回可用香氛");
      setPrescription(rx);

      // ── ③ 决策：调配层把香材翻译成精油仓配比 ──────────────
      setState("blending");
      const blended = computeBlendRecipe(top);
      await new Promise((r) => setTimeout(r, 1500)); // 留出让评委看清配比生成的时间
      setRecipe(blended);

      // ── ④ 执行：设备混合释放 ─────────────────────────────
      setState("releasing");
      audioRef.current?.play().catch(() => void 0); // 无手势/被拦截时静默跳过
      setTimeout(() => setState("complete"), 9000);
    } catch (e) {
      setState("idle");
      setError(e instanceof Error ? e.message : "设备流程中断，请重试");
    }
  }, [environment, scene, forcedEmotions]);

  const busy = state !== "idle" && state !== "complete";
  const activeStep = PIPELINE.findIndex((p) => p.key.includes(state));
  const finished = state === "complete";
  const primaryEmotion = sense?.emotions[0];
  const fragranceFamily = prescription?.recommendedFragrances[0]?.family;

  return (
    <main className="min-h-screen px-6 py-8" style={{ background: "#F7F6F2" }}>
      {/* 顶栏 */}
      <div className="mx-auto flex max-w-5xl items-center justify-between border-b pb-4"
        style={{ borderColor: "rgba(13,13,13,.08)" }}>
        <div className="flex items-center gap-6">
          <a href="/" className="text-[9px] uppercase tracking-[.24em] text-neutral-400 hover:text-neutral-900">
            ← 返回
          </a>
          {/* 路演用：评委一问痛点，不切 PPT，当场点给他看 */}
          <a href="/why" className="text-[9px] uppercase tracking-[.24em] text-neutral-400 hover:text-neutral-900">
            问题陈述
          </a>
        </div>
        <span className="text-[9px] uppercase tracking-[.24em] text-neutral-500">
          Prada · Scent Aura
        </span>
        <span className="text-[9px] uppercase tracking-[.24em]" style={{ color: "#A8C3A0" }}>
          {LABEL[state]}
        </span>
      </div>

      <div className="mx-auto grid max-w-5xl gap-10 pt-10 lg:grid-cols-[1.05fr_1fr]">
        {/* ── 左：叙事与控制 ── */}
        <section>
          <h1 className="font-serif text-[30px] leading-tight" style={{ color: "#0D0D0D" }}>
            随境而生，
            <br />
            应需而调。
          </h1>
          <p className="mt-4 max-w-md text-[12px] leading-relaxed text-neutral-500">
            这不是一台装着所有香水的机器。它只备有 7 个基础香调仓，
            由 AI 读懂你此刻的状态后，现场算出一份配比，把它们混合释放——
            就像打印机用四色墨盒印出千万种颜色。
          </p>

          {/* 流水线 */}
          <ol className="mt-8 space-y-2">
            {PIPELINE.map((step, i) => {
              // 终态时四步全算走完，避免最后一格永远停在 ●
              const done = finished || activeStep > i;
              const on = activeStep === i && !finished;
              return (
                <li key={step.title}
                  className="flex items-center gap-4 border px-4 py-3 transition-all duration-500"
                  style={{
                    borderColor: on || done ? "rgba(13,13,13,.5)" : "rgba(13,13,13,.1)",
                    background: on ? "#0D0D0D" : "transparent",
                  }}>
                  <span className="w-14 shrink-0 text-[8px] uppercase tracking-[.18em]"
                    style={{ color: on ? "rgba(247,246,242,.5)" : "rgba(13,13,13,.32)" }}>
                    {step.layer}
                  </span>
                  <span className="flex-1 text-[12px]" style={{ color: on ? "#F7F6F2" : "#0D0D0D" }}>
                    {step.title}
                    <span className="ml-3 text-[9px] tracking-wider"
                      style={{ color: on ? "rgba(247,246,242,.45)" : "rgba(13,13,13,.35)" }}>
                      {step.note}
                    </span>
                  </span>
                  <span className="text-[10px]" style={{ color: on ? "#C8D6AF" : done ? "#0D0D0D" : "rgba(13,13,13,.2)" }}>
                    {on ? "●" : done ? "✓" : "○"}
                  </span>
                </li>
              );
            })}
          </ol>

          {/* 感知读数 */}
          {sense && (
            <div className="mt-6 border p-4" style={{ borderColor: "rgba(13,13,13,.1)" }}>
              <p className="text-[8px] uppercase tracking-[.2em] text-neutral-400">感知结果</p>
              <p className="mt-2 text-[13px]">
                {sense.emotions.map((e) => `${EMOTION_EMOJI[e] ?? ""} ${EMOTION_LABEL[e] ?? e}`).join("　")}
                <span className="ml-3 text-[10px] text-neutral-400">
                  置信度 {(sense.confidence * 100).toFixed(0)}%
                </span>
              </p>
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
                {sense.signals.map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="w-16 text-[9px] text-neutral-400">{s.label}</span>
                    <span className="h-[2px] flex-1" style={{ background: "rgba(13,13,13,.08)" }}>
                      <span className="block h-full" style={{ width: `${s.value * 100}%`, background: "rgba(13,13,13,.45)" }} />
                    </span>
                    <span className="w-8 shrink-0 text-right text-[9px] tabular-nums text-neutral-500">
                      {s.value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              {sense.source === "simulated" && (
                <p className="mt-3 text-[8px] uppercase tracking-[.16em] text-neutral-300">
                  当前为模拟感知 · 待接入摄像头模块
                </p>
              )}
            </div>
          )}

          {/* AI 配方卡 */}
          {recipe && (
            <div className="mt-6 border p-5" style={{ borderColor: "rgba(13,13,13,.14)", background: "#fff" }}>
              <p className="text-[8px] uppercase tracking-[.2em] text-neutral-400">AI 现场调配</p>
              <p className="mt-1 font-serif text-[17px]">
                {recipe.sourceFragranceName}
              </p>
              <p className="mt-1 text-[10px] text-neutral-400">
                核心香调骨架近似 · 出雾{recipe.intensity === "high" ? "强而短促" : recipe.intensity === "low" ? "弱而绵长" : "适中"} ·{" "}
                {recipe.warmth === "warm" ? "暖调包裹" : recipe.warmth === "cool" ? "凉调通透" : "中性平衡"}
              </p>
              <ul className="mt-4 space-y-2">
                {recipe.components.map((c) => {
                  const cart = CARTRIDGES[c.cartridge];
                  return (
                    <li key={c.cartridge} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-[10px] text-neutral-600">
                        {cart.emoji} {cart.label}
                      </span>
                      <span className="h-[6px] flex-1" style={{ background: "rgba(13,13,13,.06)" }}>
                        <span className="block h-full transition-all duration-1000"
                          style={{ width: `${c.pct}%`, background: cart.color }} />
                      </span>
                      <span className="w-9 shrink-0 text-right text-[10px] tabular-nums text-neutral-500">
                        {c.pct}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {error && (
            <p className="mt-6 border px-4 py-3 text-[11px]" style={{ borderColor: "rgba(192,120,64,.4)", color: "#C07840" }}>
              {error}
            </p>
          )}

          {/* 操作 */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={run}
              disabled={busy}
              className="border px-8 py-3 text-[9px] uppercase tracking-[.24em] transition-colors duration-500
                enabled:hover:bg-[#F7F6F2] enabled:hover:text-[#0D0D0D] disabled:opacity-30"
              style={{ background: "#0D0D0D", borderColor: "#0D0D0D", color: "#F7F6F2" }}>
              {busy ? "运行中" : state === "complete" ? "重新感知" : "开始感知"}
            </button>
            <a href={prescriptionHref}
              className="border border-neutral-900 px-8 py-3 text-[9px] uppercase tracking-[.24em] text-neutral-900 transition-colors duration-500 hover:bg-neutral-900 hover:text-[#F7F6F2]">
              查看完整处方
            </a>
          </div>

          <p className="mt-4 text-[9px] leading-relaxed text-neutral-400">
            {environment.city} {environment.temperature}℃ ·{" "}
            {WEATHER_EMOJI[environment.weather]} {WEATHER_LABEL[environment.weather]} · 湿度{" "}
            {environment.humidity}% · {SCENE_LABEL[scene]}
          </p>
        </section>

        {/* ── 右：虚拟设备 ── */}
        <section className="flex flex-col items-center justify-start">
          <PlaceholderScentDevice command={command} />

          {primaryEmotion && (
            <p className="mt-6 text-[9px] uppercase tracking-[.2em] text-neutral-400">
              为 {EMOTION_LABEL[primaryEmotion]} 而调
            </p>
          )}

          {/* 处方页承接：完整体验 → 购买 */}
          {prescription && (state === "releasing" || state === "complete") && (
            <div className="mt-5 w-full max-w-sm border p-4" style={{ borderColor: "rgba(13,13,13,.1)" }}>
              <p className="text-[8px] uppercase tracking-[.2em] text-neutral-400">此刻你闻到的</p>
              <p className="mt-2 text-[11px] leading-relaxed text-neutral-600">
                {prescription.healingNarrative.scentCombination}
              </p>
              <p className="mt-3 text-[9px] leading-relaxed text-neutral-400">
                设备释放的是核心香调近似；完整的一瓶{" "}
                <span style={{ color: "#0D0D0D" }}>{recipe?.sourceFragranceName}</span>
                ，可在处方页拥有。
              </p>
            </div>
          )}

          {fragranceFamily && (
            <audio ref={audioRef} src={`/meditation/family_${fragranceFamily}.mp3`} preload="none" loop />
          )}
        </section>
      </div>
    </main>
  );
}
