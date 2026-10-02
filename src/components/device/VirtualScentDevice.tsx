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
        {/* 出雾区：仅 releasing / complete 有雾 */}
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

        {/* 机身 */}
        <div
          className="vsd-body"
          style={{
            boxShadow: emitting ? `0 0 46px -14px ${glow}` : "none",
          }}
        >
          {/* 感知扫描线：仅 sensing */}
          <span className="vsd-scan" aria-hidden />
          {/* 分析环：仅 prescribing */}
          <span className="vsd-ring" aria-hidden />

          <span className="vsd-mark" aria-hidden />
          <p className="vsd-brand">Scent Aura</p>
          {/* 顶部出雾口 */}
          <span
            className="vsd-vent"
            style={{ background: emitting ? glow : "rgba(255,255,255,.14)" }}
          />
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
          height: 92px;
          width: 190px;
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
          100% { transform: translate(-50%, -96px) scale(2.7); opacity: 0; }
        }

        /* ── 机身 ── */
        .vsd-body {
          position: relative;
          width: 186px;
          height: 196px;
          background: #0D0D0D;
          border: 1px solid rgba(196,196,196,.28);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 30px;
          overflow: hidden;
          transition: box-shadow 1.2s cubic-bezier(.25,1,.5,1),
            border-color .6s cubic-bezier(.25,1,.5,1);
        }
        .vsd-s-sensing .vsd-body,
        .vsd-s-prescribing .vsd-body,
        .vsd-s-blending .vsd-body,
        .vsd-s-releasing .vsd-body {
          border-color: rgba(196,196,196,.5);
        }

        .vsd-vent {
          position: absolute;
          top: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 52px;
          height: 3px;
          transition: background 1s cubic-bezier(.25,1,.5,1);
        }
        .vsd-mark {
          width: 0;
          height: 0;
          border-left: 9px solid transparent;
          border-right: 9px solid transparent;
          border-top: 14px solid #C4C4C4;
        }
        .vsd-brand {
          margin-top: 14px;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 15px;
          color: #F7F6F2;
          letter-spacing: .04em;
        }

        /* ── 感知扫描线（sensing） ── */
        .vsd-scan {
          position: absolute;
          left: 0;
          right: 0;
          height: 34px;
          top: -34px;
          pointer-events: none;
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
          animation: vsd-sweep 1.5s cubic-bezier(.45,0,.55,1) infinite;
        }
        @keyframes vsd-sweep {
          0%   { top: -34px; }
          100% { top: 196px; }
        }

        /* ── 分析环（prescribing） ── */
        .vsd-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 92px;
          height: 92px;
          margin: -46px 0 0 -46px;
          border: 1px solid rgba(200,214,175,.45);
          border-top-color: #C8D6AF;
          border-radius: 50%;
          opacity: 0;
          pointer-events: none;
        }
        .vsd-s-prescribing .vsd-ring {
          opacity: 1;
          animation: vsd-spin 1.5s linear infinite;
        }
        @keyframes vsd-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
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

        @media (prefers-reduced-motion: reduce) {
          .vsd-scan, .vsd-ring, .vsd-mist, .vsd-ambient,
          .vsd-brand, .vsd-cap-state, .vsd-fill-blend, .vsd-pct-blend {
            animation: none !important;
          }
          .vsd-s-scan { opacity: .5; }
          .vsd-s-prescribing .vsd-ring { opacity: .6; }
        }
      `}</style>
    </div>
  );
}

/** 供配方卡等场景复用：仓的中文名与配色 */
export const CARTRIDGE_META = CARTRIDGES;
