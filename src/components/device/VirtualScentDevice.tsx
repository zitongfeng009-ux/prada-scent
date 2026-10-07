"use client";

import type { Cartridge, DeviceCommand, DeviceState } from "@/lib/types";
import { CARTRIDGE_LIST, CARTRIDGES } from "@/lib/data/cartridges";

/**
 * VirtualScentDevice —— 虚拟香薰机视觉层（C · 执行层）
 *
 * 设计约束（见 docs/pitch.md §4 C 交付清单与 §7）：
 *   ① 一切表现由 command.state 推导；组件内不造数据、不自建定时器改状态、不发请求。
 *   ② 六个状态肉眼可辨：idle / sensing / prescribing / blending / releasing / complete。
 *   ③ 前三个状态 recipe 尚为 undefined，必须照常渲染。
 *   ④ 仓的中文名 / emoji / 颜色一律取自 CARTRIDGES，不写死。
 *   ⑤ 未参与配方的仓显示 0% 并压暗，与待机态的「—」明确区分。
 *
 * 数据来源只有 props 一份：state 决定整机阶段，recipe 决定液位 / 配比 / 氛围灯 / 出雾。
 * 所有界面文案为中文；配色与线条遵循 UI设计规范.md（Off-White 底、1px 发丝线、0 圆角）。
 *
 * v2 机身改为「扩香机」结构：穹顶（气孔阵列 + 液压表）→ 束腰液仓（余量视窗）→ 底座，
 * 顶部出雾口随状态亮起。六个状态各有独立动作：气孔检测 / 液压表指针扫动 / 三叶风扇 /
 * 余量视窗填充 / 出雾 / 余香呼吸。机身仍以 Prada Black 为主，符合品牌冷感基调。
 */

/** 六个状态的先后顺序，用于机身上的阶段指示灯 */
const STATE_ORDER: DeviceState[] = [
  "idle",
  "sensing",
  "prescribing",
  "blending",
  "releasing",
  "complete",
];

/** 机身状态文案：complete 保留轻雾作为「余香」，但不得再说「释放中」 */
const CAP_LABEL: Record<DeviceState, string> = {
  idle: "待机",
  sensing: "感知中",
  prescribing: "分析中",
  blending: "配比跳动",
  releasing: "出雾中",
  complete: "余香环绕",
};

/** 当前阶段的动作说明，让六个状态在文字上也互相区分 */
const PHASE_NOTE: Record<DeviceState, string> = {
  idle: "等待开始感知",
  sensing: "读取此刻情绪",
  prescribing: "生成香气处方",
  blending: "计算七仓配比",
  releasing: "混合释放香气",
  complete: "香气缓缓散开",
};

/** 出雾节奏：挥发度越高，喷得越快越密 */
const MIST_DURATION: Record<string, string> = {
  high: "2.4s",
  medium: "3.6s",
  low: "5.2s",
};

/** 只有这两个状态真正向外释放气味 */
const EMITTING: DeviceState[] = ["releasing", "complete"];

/** 仓内液体是否可见：待机与感知中尚未出配方，液位为空 */
const LIQUID_VISIBLE: DeviceState[] = [
  "blending",
  "releasing",
  "complete",
];

/** 数值跳动动画只在 blending 期间出现 */
const BLENDING: DeviceState[] = ["blending"];

/** 穹顶侧面气孔阵列：用固定几何生成，不含任何状态数据 */
const VENT_DOTS = [0, 1, 2, 3, 4];

/** 底座散热格栅 */
const BASE_SLATS = [0, 1, 2, 3];

export default function VirtualScentDevice({
  command,
}: {
  command: DeviceCommand;
}) {
  const { state, recipe } = command;

  const emitting = EMITTING.includes(state);
  const liquidVisible = LIQUID_VISIBLE.includes(state);
  const blending = BLENDING.includes(state);
  /** 配方是否已算出：决定未参与仓显示「0%」还是「—」 */
  const settled = !!recipe;
  const mistDur = MIST_DURATION[recipe?.intensity ?? "medium"] ?? "3.6s";
  const glow = recipe?.lightColor ?? "#C4C4C4";
  const activeIndex = STATE_ORDER.indexOf(state);

  /** sensing 的扫描与检测环完全由 CSS 依 vsd-s-sensing 派生，无需在此判断 */
  const prescribing = state === "prescribing";
  /** 释放完成才出现日记入口，避免演示过程中被提前点走 */
  const finished = state === "complete";

  /** 液压表（realistic pressure gauge）：仅 prescribing 阶段扫动，静止时指向低液仓 */
  const gaugeAngle = prescribing ? -140 : blending ? -160 : -180;
  /** 液仓余量视窗：出配方后按最强仓占比抬升 */
  const reserveLevel = liquidVisible
    ? Math.min(
        1,
        Math.max(
          0.18,
          (recipe?.components.reduce((m, c) => Math.max(m, c.pct), 0) ?? 0) / 100,
        ),
      )
    : 0;

  const pctOf = (id: string) =>
    recipe?.components.find((c) => c.cartridge === id)?.pct ?? 0;

  const vials = CARTRIDGE_LIST.map((cart: Cartridge, i: number) => {
    const pct = pctOf(cart.id);
    const participating = pct > 0;
    const on = liquidVisible && participating;
    return (
      <div key={cart.id} className="vsd-vial-wrap">
        <div
          className={`vsd-vial${on ? " vsd-vial-on" : ""}`}
          style={
            {
              "--vsd-liquid": cart.color,
              "--vsd-level": `${pct / 100}`,
              "--vsd-delay": `${i * 70}ms`,
            } as React.CSSProperties
          }
        >
          <span
            className={`vsd-fill${on ? " vsd-fill-on" : ""}${
              blending ? " vsd-fill-blend" : ""
            }`}
          />
        </div>
        <span
          className="vsd-emoji"
          style={{ opacity: on ? 1 : settled ? 0.26 : 1 }}
        >
          {cart.emoji}
        </span>
        <span
          className={`vsd-pct${on ? " vsd-pct-on" : ""}${
            blending && on ? " vsd-pct-blend" : ""
          }`}
          style={{ color: on ? cart.color : "rgba(13,13,13,.28)" }}
        >
          {on ? `${pct}%` : settled ? "0%" : "—"}
        </span>
      </div>
    );
  });

  return (
    <div className={`vsd-root vsd-s-${state}`}>
      {/* 氛围灯：主色由占比最高的仓决定 */}
      <div
        className="vsd-ambient"
        style={
          {
            "--vsd-glow": glow,
          } as React.CSSProperties
        }
      />

      <div className="vsd-stage">
        {/* 出雾区：仅 releasing / complete 有雾，从顶部出雾口升起 */}
        <div className="vsd-mist-zone">
          {emitting &&
            (recipe?.mistColors ?? []).slice(0, 5).map((color, i) => (
              <span
                key={`${color}-${i}`}
                className="vsd-mist"
                style={{
                  left: `${34 + i * 8}%`,
                  background: color,
                  animationDuration: mistDur,
                  animationDelay: `${i * 0.45}s`,
                }}
              />
            ))}
        </div>

        {/* ── 机身：扩香机 ── */}
        <div
          className="vsd-body"
          style={
            { "--vsd-glow": glow } as React.CSSProperties
          }
        >
          {/* 感知扫描线：仅 sensing */}
          <span className="vsd-scan" aria-hidden />

          {/* ① 穹顶：顶部出雾口 + 气孔阵列 */}
          <div className="vsd-dome">
            <span className="vsd-nozzle" aria-hidden />
            <span className="vsd-nozzle-slit" aria-hidden />
            <div className="vsd-vents" aria-hidden>
              {VENT_DOTS.map((n) => (
                <span key={n} className="vsd-vent-dot" />
              ))}
            </div>
          </div>

          {/* ② 束腰液仓：三元映射 + 液压表 + 余量视窗 */}
          <div className="vsd-waist">
            {/* 三元映射：三枚三角随状态依次点亮 */}
            <div className="vsd-tri" aria-hidden>
              <span className="vsd-tri-a" />
              <span className="vsd-tri-b" />
              <span className="vsd-tri-c" />
            </div>

            {/* 液压表：prescribing 阶段指针扫动（组件只读 state，不驱动数值变化） */}
            <div className="vsd-gauge" aria-hidden>
              <svg viewBox="0 0 48 48" className="vsd-gauge-svg">
                <circle
                  className="vsd-gauge-track"
                  cx="24"
                  cy="24"
                  r="18"
                  fill="none"
                  strokeWidth="1"
                />
                {/* 刻度：固定几何 */}
                {[0, 1, 2, 3, 4, 5, 6].map((n) => {
                  const a = (-210 + n * 30) * (Math.PI / 180);
                  return (
                    <line
                      key={n}
                      className="vsd-gauge-tick"
                      x1={24 + Math.cos(a) * 18}
                      y1={24 + Math.sin(a) * 18}
                      x2={24 + Math.cos(a) * 15}
                      y2={24 + Math.sin(a) * 15}
                      strokeWidth="1"
                    />
                  );
                })}
                <line
                  className="vsd-gauge-needle"
                  x1="24"
                  y1="24"
                  x2="24"
                  y2="11"
                  strokeWidth="1.5"
                  style={{ ["--vsd-needle" as string]: `${gaugeAngle}deg` }}
                />
                <circle className="vsd-gauge-hub" cx="24" cy="24" r="1.8" />
              </svg>
            </div>

            {/* 液仓余量视窗：出配方后按占比最高的仓抬升 */}
            <div className="vsd-reserve" aria-hidden>
              <span
                className="vsd-reserve-fill"
                style={{
                  height: `${reserveLevel * 100}%`,
                  background: glow,
                }}
              />
            </div>
          </div>

          {/* ③ 底座：品牌铭牌 + 风道 + 散热格栅 */}
          <div className="vsd-base">
            <span className="vsd-mark" aria-hidden />
            <p className="vsd-brand">Scent Aura</p>

            {/* 风道：sensing 检测 / prescribing 旋转，两态动作不同 */}
            <div className="vsd-duct" aria-hidden>
              <svg viewBox="0 0 48 48" className="vsd-duct-svg">
                <circle
                  className="vsd-duct-housing"
                  cx="24"
                  cy="24"
                  r="21"
                  fill="none"
                  strokeWidth="1"
                />
                <g className="vsd-blades">
                  {[0, 120, 240].map((deg) => (
                    <path
                      key={deg}
                      className="vsd-blade"
                      d="M24 24 Q 40 20 43 24 Q 40 28 24 24 Z"
                      transform={`rotate(${deg} 24 24)`}
                    />
                  ))}
                  <circle className="vsd-hub" cx="24" cy="24" r="3.2" />
                </g>
                {/* 检测环：sensing 时逐步扫过 */}
                <circle
                  className="vsd-detect"
                  cx="24"
                  cy="24"
                  r="21"
                  fill="none"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            <div className="vsd-base-slats" aria-hidden>
              {BASE_SLATS.map((n) => (
                <span key={n} className="vsd-base-slat" />
              ))}
            </div>
          </div>
        </div>

        {/* 胶囊标签：六态各自的阶段文案 */}
        <div className="vsd-cap">
          <span className="vsd-cap-state">{CAP_LABEL[state]}</span>
          <span className="vsd-cap-note">{PHASE_NOTE[state]}</span>
        </div>

        {/* 阶段指示灯：把六态顺序可视化 */}
        <div className="vsd-steps" aria-hidden>
          {STATE_ORDER.map((s, i) => (
            <span
              key={s}
              className={`vsd-step${i < activeIndex ? " vsd-step-done" : ""}${
                i === activeIndex ? " vsd-step-on" : ""
              }`}
            />
          ))}
        </div>

        {/* 精油仓阵列：7 个基础香调仓 */}
        <div className="vsd-rack">
          <p className="vsd-rack-title">
            七仓基础香调 · 现场调配
          </p>
          <div className="vsd-rack-row">{vials}</div>
        </div>

        {/* 释放完成 → 情绪日记入口（只在 complete 态出现） */}
        {finished && (
          <div className="vsd-diary">
            <p className="vsd-diary-quote">闻过一次不算体验，它记得你</p>
            <a href="/diary" className="vsd-diary-btn">
              查看情绪日记
            </a>
          </div>
        )}
      </div>

      <style>{`
        .vsd-root {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 8px 0 4px;
        }

        .vsd-ambient {
          position: absolute;
          inset: -12% -6%;
          pointer-events: none;
          background: radial-gradient(
            60% 55% at 50% 46%,
            var(--vsd-glow) 0%,
            transparent 70%
          );
          opacity: 0.12;
          transition: opacity 1.2s cubic-bezier(.25,1,.5,1),
            background 1.2s cubic-bezier(.25,1,.5,1);
        }
        .vsd-s-sensing .vsd-ambient { opacity: 0.3; }
        .vsd-s-prescribing .vsd-ambient { opacity: 0.34; }
        .vsd-s-blending .vsd-ambient { opacity: 0.46; }
        .vsd-s-releasing .vsd-ambient { opacity: 0.72; }
        .vsd-s-complete .vsd-ambient {
          opacity: 0.4;
          animation: vsd-breathe 5.6s cubic-bezier(.25,1,.5,1) infinite;
        }
        @keyframes vsd-breathe {
          0%, 100% { opacity: 0.42; }
          50%      { opacity: 0.24; }
        }

        .vsd-stage {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* ── 出雾 ── */
        .vsd-mist-zone {
          position: relative;
          height: 84px;
          width: 210px;
        }
        .vsd-mist {
          position: absolute;
          bottom: 0;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          filter: blur(5px);
          opacity: 0;
          animation-name: vsd-rise;
          animation-iteration-count: infinite;
          animation-timing-function: cubic-bezier(.25,1,.5,1);
        }
        .vsd-s-complete .vsd-mist {
          filter: blur(8px);
          animation-duration: 8s !important;
        }
        @keyframes vsd-rise {
          0%   { transform: translate(-50%, 0) scale(.5); opacity: 0; }
          18%  { opacity: .82; }
          100% { transform: translate(-50%, -88px) scale(2.7); opacity: 0; }
        }

        /* ── 机身（扩香机）── */
        .vsd-body {
          position: relative;
          width: 210px;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow: hidden;
          background: #0D0D0D;
          border: 1px solid rgba(196,196,196,.28);
          border-radius: 78px 78px 0 0;
          transition: box-shadow 1.2s cubic-bezier(.25,1,.5,1),
            border-color .6s cubic-bezier(.25,1,.5,1);
        }
        .vsd-s-sensing .vsd-body,
        .vsd-s-prescribing .vsd-body,
        .vsd-s-blending .vsd-body,
        .vsd-s-releasing .vsd-body {
          border-color: rgba(196,196,196,.5);
        }

        /* ① 穹顶 */
        .vsd-dome {
          position: relative;
          width: 100%;
          height: 74px;
          display: flex;
          justify-content: center;
        }

        /* 顶部出雾口 */
        .vsd-nozzle {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 54px;
          height: 7px;
          background: #1A1A1A;
          border: 1px solid rgba(196,196,196,.32);
          border-top: none;
          border-radius: 0 0 4px 4px;
          transition: background 1s cubic-bezier(.25,1,.5,1),
            box-shadow 1s cubic-bezier(.25,1,.5,1);
        }
        .vsd-s-releasing .vsd-nozzle,
        .vsd-s-complete .vsd-nozzle {
          background: var(--vsd-glow);
          box-shadow: 0 0 18px -2px var(--vsd-glow);
        }
        .vsd-nozzle-slit {
          position: absolute;
          top: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 1px;
          background: rgba(247,246,242,.18);
          transition: opacity .8s cubic-bezier(.25,1,.5,1);
        }
        .vsd-s-releasing .vsd-nozzle-slit,
        .vsd-s-complete .vsd-nozzle-slit { opacity: 0; }

        /* 穹顶气孔阵列：sensing 进入检测态时逐孔亮起 */
        .vsd-vents {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 7px;
        }
        .vsd-vent-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(247,246,242,.16);
          transition: background .45s cubic-bezier(.25,1,.5,1),
            box-shadow .45s cubic-bezier(.25,1,.5,1);
        }
        .vsd-s-sensing .vsd-vent-dot,
        .vsd-s-prescribing .vsd-vent-dot,
        .vsd-s-blending .vsd-vent-dot,
        .vsd-s-releasing .vsd-vent-dot,
        .vsd-s-complete .vsd-vent-dot {
          background: var(--vsd-glow);
        }
        .vsd-s-sensing .vsd-vent-dot {
          animation: vsd-dot 1.2s cubic-bezier(.25,1,.5,1) infinite;
        }
        .vsd-s-sensing .vsd-vent-dot:nth-child(2) { animation-delay: .12s; }
        .vsd-s-sensing .vsd-vent-dot:nth-child(3) { animation-delay: .24s; }
        .vsd-s-sensing .vsd-vent-dot:nth-child(4) { animation-delay: .36s; }
        .vsd-s-sensing .vsd-vent-dot:nth-child(5) { animation-delay: .48s; }
        @keyframes vsd-dot {
          0%, 100% { box-shadow: none; opacity: .45; }
          50%      { box-shadow: 0 0 10px 0 var(--vsd-glow); opacity: 1; }
        }

        /* ② 束腰液仓 */
        .vsd-waist {
          position: relative;
          width: 168px;
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          border-top: 1px solid rgba(196,196,196,.14);
          border-bottom: 1px solid rgba(196,196,196,.14);
        }

        /* 三元映射：三枚小三角，随阶段依次点亮（体现三元映射的视觉语言） */
        .vsd-tri {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .vsd-tri span {
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 8px solid rgba(247,246,242,.2);
          transition: border-top-color .5s cubic-bezier(.25,1,.5,1);
        }
        .vsd-s-sensing .vsd-tri-a,
        .vsd-s-prescribing .vsd-tri-a,
        .vsd-s-prescribing .vsd-tri-b,
        .vsd-s-blending .vsd-tri-a,
        .vsd-s-blending .vsd-tri-b,
        .vsd-s-blending .vsd-tri-c,
        .vsd-s-releasing .vsd-tri span,
        .vsd-s-complete .vsd-tri span {
          border-top-color: var(--vsd-glow);
        }

        /* 液压表 */
        .vsd-gauge-svg { width: 42px; height: 42px; display: block; }
        .vsd-gauge-track,
        .vsd-gauge-tick { stroke: rgba(247,246,242,.22); }
        .vsd-gauge-needle {
          stroke: rgba(247,246,242,.75);
          transform-origin: 24px 24px;
          transform: rotate(var(--vsd-needle));
          transition: transform 1.4s cubic-bezier(.25,1,.5,1);
        }
        .vsd-s-prescribing .vsd-gauge-needle {
          animation: vsd-needle 1.6s cubic-bezier(.25,1,.5,1) infinite alternate;
        }
        @keyframes vsd-needle {
          from { transform: rotate(-205deg); }
          to   { transform: rotate(-120deg); }
        }
        .vsd-gauge-hub { fill: rgba(247,246,242,.55); }

        /* 液仓余量视窗 */
        .vsd-reserve {
          position: relative;
          width: 16px;
          height: 40px;
          border: 1px solid rgba(196,196,196,.3);
          background: rgba(247,246,242,.05);
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }
        .vsd-reserve-fill {
          width: 100%;
          transition: height 1.2s cubic-bezier(.25,1,.5,1),
            background 1.2s cubic-bezier(.25,1,.5,1);
        }

        /* ③ 底座 */
        .vsd-base {
          position: relative;
          width: 100%;
          height: 156px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 14px;
        }
        .vsd-mark {
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 12px solid #C4C4C4;
        }
        .vsd-brand {
          margin-top: 10px;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 14px;
          color: #F7F6F2;
          letter-spacing: .04em;
        }

        /* 风道：三叶风扇 + 检测环 */
        .vsd-duct {
          margin-top: 10px;
          width: 48px;
          height: 48px;
        }
        .vsd-duct-svg { width: 48px; height: 48px; display: block; }
        .vsd-duct-housing { stroke: rgba(196,196,196,.3); }
        .vsd-blade {
          fill: rgba(247,246,242,.16);
          transition: fill .6s cubic-bezier(.25,1,.5,1);
        }
        .vsd-hub { fill: rgba(247,246,242,.3); }
        .vsd-s-prescribing .vsd-blade,
        .vsd-s-blending .vsd-blade,
        .vsd-s-releasing .vsd-blade,
        .vsd-s-complete .vsd-blade {
          fill: var(--vsd-glow);
          opacity: .55;
        }
        /* prescribing 才真正转起来 */
        .vsd-s-prescribing .vsd-blades {
          transform-origin: 24px 24px;
          animation: vsd-spin 1.1s linear infinite;
        }
        @keyframes vsd-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* 检测环：sensing 时扫过一圈 */
        .vsd-detect {
          stroke: #C8D6AF;
          opacity: 0;
          transform-origin: 24px 24px;
        }
        .vsd-s-sensing .vsd-detect {
          opacity: 1;
          stroke-dasharray: 26 106;
          animation: vsd-detect 1.4s linear infinite;
        }
        @keyframes vsd-detect {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        /* 分析中风扇在转，检测环换成常显细环 */
        .vsd-s-prescribing .vsd-detect {
          opacity: .5;
          stroke-dasharray: none;
        }

        /* 散热格栅 */
        .vsd-base-slats {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4px;
        }
        .vsd-base-slat {
          width: 22px;
          height: 2px;
          background: rgba(247,246,242,.1);
          transition: background .6s cubic-bezier(.25,1,.5,1);
        }
        .vsd-s-releasing .vsd-base-slat,
        .vsd-s-complete .vsd-base-slat {
          background: rgba(247,246,242,.24);
        }

        /* ── 感知扫描线（sensing） ── */
        .vsd-scan {
          position: absolute;
          left: 0;
          right: 0;
          height: 34px;
          top: -34px;
          pointer-events: none;
          z-index: 2;
          opacity: 0;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(200,214,175,.5),
            rgba(200,214,175,.9),
            transparent
          );
        }
        .vsd-s-sensing .vsd-scan {
          opacity: 1;
          animation: vsd-sweep 1.6s cubic-bezier(.45,0,.55,1) infinite;
        }
        @keyframes vsd-sweep {
          0%   { top: -34px; }
          100% { top: 292px; }
        }

        /* 分析中让品牌字轻微呼吸，区别于待机 */
        .vsd-s-prescribing .vsd-brand,
        .vsd-s-sensing .vsd-brand {
          animation: vsd-fade 1.5s cubic-bezier(.25,1,.5,1) infinite;
        }
        @keyframes vsd-fade {
          0%, 100% { opacity: 1; }
          50%      { opacity: .42; }
        }

        /* ── 状态胶囊 ── */
        .vsd-cap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          margin-top: 14px;
          padding: 7px 18px;
          border: 1px solid rgba(13,13,13,.12);
          background: #EAE8E3;
          min-width: 168px;
          transition: border-color .5s cubic-bezier(.25,1,.5,1);
        }
        .vsd-s-blending .vsd-cap,
        .vsd-s-releasing .vsd-cap,
        .vsd-s-complete .vsd-cap {
          border-color: rgba(13,13,13,.34);
        }
        .vsd-cap-state {
          font-size: 10px;
          letter-spacing: .22em;
          color: #0D0D0D;
        }
        .vsd-cap-note {
          font-size: 8px;
          letter-spacing: .14em;
          color: rgba(13,13,13,.42);
        }
        .vsd-s-blending .vsd-cap-state {
          animation: vsd-tick .5s steps(2, end) infinite;
        }
        @keyframes vsd-tick {
          0%   { opacity: 1; }
          100% { opacity: .55; }
        }

        /* ── 阶段指示灯 ── */
        .vsd-steps {
          display: flex;
          gap: 6px;
          margin-top: 10px;
        }
        .vsd-step {
          width: 16px;
          height: 2px;
          background: rgba(13,13,13,.12);
          transition: background .4s cubic-bezier(.25,1,.5,1);
        }
        .vsd-step-done { background: rgba(13,13,13,.5); }
        .vsd-step-on { background: #0D0D0D; }
        .vsd-s-releasing .vsd-step-on,
        .vsd-s-complete .vsd-step-on { background: #A8C3A0; }

        /* ── 精油仓阵列 ── */
        .vsd-rack {
          margin-top: 16px;
          padding: 12px 16px 14px;
          border: 1px solid rgba(13,13,13,.1);
          background: rgba(255,255,255,.5);
        }
        .vsd-rack-title {
          font-size: 8px;
          letter-spacing: .2em;
          text-align: center;
          color: rgba(13,13,13,.34);
          margin-bottom: 10px;
        }
        .vsd-rack-row {
          display: flex;
          gap: 9px;
        }
        .vsd-vial-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 34px;
        }
        .vsd-vial {
          position: relative;
          width: 16px;
          height: 58px;
          border: 1px solid rgba(13,13,13,.16);
          background: #F7F6F2;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          transition: border-color .5s cubic-bezier(.25,1,.5,1),
            opacity .5s cubic-bezier(.25,1,.5,1);
        }
        .vsd-vial-on { border-color: rgba(13,13,13,.4); }
        .vsd-fill {
          width: 100%;
          height: 100%;
          transform: scaleY(0);
          transform-origin: 50% 100%;
          background: var(--vsd-liquid);
          opacity: 0;
          transition: transform .9s cubic-bezier(.25,1,.5,1),
            opacity .5s cubic-bezier(.25,1,.5,1),
            box-shadow .9s cubic-bezier(.25,1,.5,1);
        }
        .vsd-fill-on {
          transform: scaleY(var(--vsd-level));
          opacity: 1;
          box-shadow: 0 0 12px -2px var(--vsd-liquid);
        }
        /* 配比跳动：液面轻微波动 + 补间，读起来像"正在计算" */
        .vsd-fill-blend {
          animation: vsd-surge 700ms cubic-bezier(.25,1,.5,1) var(--vsd-delay)
            both;
        }
        @keyframes vsd-surge {
          0%   { transform: scaleY(0); }
          62%  { transform: scaleY(calc(var(--vsd-level) * 1.14)); }
          100% { transform: scaleY(var(--vsd-level)); }
        }

        .vsd-emoji {
          margin-top: 6px;
          font-size: 12px;
          line-height: 1;
          transition: opacity .5s cubic-bezier(.25,1,.5,1);
        }
        .vsd-pct {
          margin-top: 3px;
          font-size: 8px;
          letter-spacing: .06em;
          font-variant-numeric: tabular-nums;
          transition: color .5s cubic-bezier(.25,1,.5,1);
        }
        .vsd-pct-blend {
          animation: vsd-flash 620ms cubic-bezier(.25,1,.5,1) var(--vsd-delay)
            both;
        }
        @keyframes vsd-flash {
          0%   { opacity: .2; }
          55%  { opacity: 1; }
          100% { opacity: 1; }
        }

        /* ── 释放完成后的日记入口 ── */
        .vsd-diary {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          animation: vsd-in .7s cubic-bezier(.25,1,.5,1) both;
        }
        @keyframes vsd-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .vsd-diary-quote {
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          font-size: 10px;
          color: rgba(13,13,13,.45);
          letter-spacing: .04em;
        }
        .vsd-diary-btn {
          display: inline-block;
          border: 1px solid #0D0D0D;
          padding: 11px 30px;
          font-size: 9px;
          letter-spacing: .24em;
          color: #0D0D0D;
          background: transparent;
          text-decoration: none;
          transition: background .4s cubic-bezier(.25,1,.5,1),
            color .4s cubic-bezier(.25,1,.5,1);
        }
        .vsd-diary-btn:hover {
          background: #0D0D0D;
          color: #F7F6F2;
        }

        @media (prefers-reduced-motion: reduce) {
          .vsd-scan, .vsd-mist, .vsd-ambient, .vsd-brand,
          .vsd-cap-state, .vsd-fill-blend, .vsd-pct-blend,
          .vsd-vent-dot, .vsd-blades, .vsd-detect, .vsd-gauge-needle,
          .vsd-diary {
            animation: none !important;
          }
          .vsd-s-sensing .vsd-scan { opacity: .5; }
          .vsd-s-prescribing .vsd-detect { opacity: .6; }
          .vsd-s-sensing .vsd-vent-dot { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/** 供配方卡等场景复用：仓的中文名与配色 */
export const CARTRIDGE_META = CARTRIDGES;
