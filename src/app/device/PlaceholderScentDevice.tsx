"use client";

import type { DeviceCommand } from "@/lib/types";
import { CARTRIDGE_LIST, CARTRIDGES } from "@/lib/data/cartridges";

/**
 * ⚠️⚠️ 临时占位设备组件 —— 待 C 角色交付后替换 ⚠️⚠️
 *
 * C 的正式组件路径：src/components/device/VirtualScentDevice.tsx
 * 落地后把 DeviceClient.tsx 里的
 *   import PlaceholderScentDevice from "./PlaceholderScentDevice";
 * 改成
 *   import VirtualScentDevice from "@/components/device/VirtualScentDevice";
 * 其余逻辑零改动 —— 两者共用同一份 props 契约 { command: DeviceCommand }。
 *
 * 本占位版刻意做得克制（Prada 极简：直角、发丝描边、无渐变滥用），
 * 但已经把 C 需要消费的数据全部按语义用上：
 *   recipe.components → 哪几个仓点亮、液位与百分比
 *   recipe.lightColor → 氛围灯主色
 *   recipe.mistColors → 出雾颜色（按配比取色）
 *   recipe.intensity  → 出雾快慢（高挥发强而短、低挥发弱而长）
 *   state             → 整机运行阶段
 */

/** 出雾节奏：挥发度越高，喷得越快越密 */
const MIST_DURATION: Record<string, string> = {
  high: "2.4s",
  medium: "3.6s",
  low: "5.2s",
};

const EMITTING: DeviceCommand["state"][] = ["releasing", "complete"];

/** 机身状态文案：complete 保留轻雾作为"余香"，但不能再说"释放中" */
const CAP_LABEL: Record<DeviceCommand["state"], string> = {
  idle: "待机",
  sensing: "感知中",
  prescribing: "分析中",
  blending: "调配中",
  releasing: "释放中",
  complete: "余香环绕",
};

export default function PlaceholderScentDevice({
  command,
}: {
  command: DeviceCommand;
}) {
  const { state, recipe } = command;
  const emitting = EMITTING.includes(state);
  const pctOf = (id: string) =>
    recipe?.components.find((c) => c.cartridge === id)?.pct ?? 0;
  const mistDur = MIST_DURATION[recipe?.intensity ?? "medium"] ?? "3.6s";
  const glow = recipe?.lightColor ?? "#C4C4C4";

  return (
    <div className="sa-root">
      {/* 氛围灯：主色由占比最高的仓决定 */}
      <div
        className="sa-ambient"
        style={{
          background: `radial-gradient(60% 55% at 50% 62%, ${glow}${
            emitting ? "3c" : "14"
          } 0%, transparent 70%)`,
          opacity: state === "idle" ? 0.35 : 1,
        }}
      />

      {/* 机身 */}
      <div className="sa-stage">
        {/* 出雾 */}
        <div className="sa-mist-zone">
          {emitting &&
            (recipe?.mistColors ?? []).slice(0, 5).map((color, i) => (
              <span
                key={`${color}-${i}`}
                className="sa-mist"
                style={{
                  left: `${38 + i * 6}%`,
                  background: color,
                  animationDuration: mistDur,
                  animationDelay: `${i * 0.42}s`,
                }}
              />
            ))}
        </div>

        <div
          className="sa-body"
          style={{ boxShadow: emitting ? `0 0 44px -14px ${glow}` : "none" }}
        >
          {/* Prada 式倒三角标识 */}
          <span className="sa-mark" aria-hidden />
          <p className="sa-brand">Scent Aura</p>
          <p className="sa-cap">{CAP_LABEL[state]}</p>
          {/* 顶部出雾口 */}
          <span
            className="sa-vent"
            style={{ background: emitting ? glow : "rgba(255,255,255,.14)" }}
          />
        </div>

        {/* 精油仓阵列：7 个基础香调仓 */}
        <div className="sa-rack">
          {CARTRIDGE_LIST.map((cart) => {
            const pct = pctOf(cart.id);
            const active = pct > 0 && (state === "blending" || emitting);
            // 配方已算出但本仓占比 0：显示「0%」并压暗 emoji，与待机态的「—（尚未感知）」区分
            const settled = !!recipe;
            return (
              <div key={cart.id} className="sa-vial-wrap">
                <div className="sa-vial">
                  <span
                    className="sa-vial-fill"
                    style={{
                      height: `${active ? Math.max(pct, 8) : 0}%`,
                      background: cart.color,
                      boxShadow: active ? `0 0 12px -2px ${cart.color}` : "none",
                    }}
                  />
                </div>
                <span
                  className="sa-vial-emoji"
                  style={{ opacity: active || !settled ? 1 : 0.3 }}
                >
                  {cart.emoji}
                </span>
                <span
                  className="sa-vial-pct"
                  style={{ color: active ? cart.color : "rgba(13,13,13,.28)" }}
                >
                  {active ? `${pct}%` : settled ? "0%" : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .sa-root { position: relative; width: 100%; display:flex; justify-content:center; padding: 8px 0 4px; }
        .sa-ambient { position:absolute; inset:-12% -6%; pointer-events:none; transition: opacity 1.2s cubic-bezier(.25,1,.5,1), background 1.2s cubic-bezier(.25,1,.5,1); }
        .sa-stage { position: relative; display:flex; flex-direction:column; align-items:center; }

        .sa-mist-zone { position: relative; height: 92px; width: 180px; }
        .sa-mist { position:absolute; bottom:0; width:9px; height:9px; border-radius:50%;
          filter: blur(5px); opacity:0; animation-name: sa-rise; animation-iteration-count:infinite;
          animation-timing-function: cubic-bezier(.25,1,.5,1); }
        @keyframes sa-rise {
          0%   { transform: translate(-50%, 0) scale(.5); opacity:0; }
          18%  { opacity:.85; }
          100% { transform: translate(-50%, -96px) scale(2.7); opacity:0; }
        }

        .sa-body { position:relative; width:186px; height:196px; background:#0D0D0D;
          border:1px solid rgba(196,196,196,.28); display:flex; flex-direction:column;
          align-items:center; justify-content:flex-start; padding-top:26px;
          transition: box-shadow 1.2s cubic-bezier(.25,1,.5,1); }
        .sa-vent { position:absolute; top:-2px; left:50%; transform:translateX(-50%);
          width:52px; height:3px; transition: background 1s; }
        .sa-mark { width:0; height:0; border-left:9px solid transparent; border-right:9px solid transparent;
          border-top:14px solid #C4C4C4; }
        .sa-brand { margin-top:14px; font-family: Georgia, 'Times New Roman', serif; font-size:15px;
          color:#F7F6F2; letter-spacing:.04em; }
        .sa-cap { margin-top:10px; font-size:8px; text-transform:uppercase; letter-spacing:.28em;
          color:rgba(247,246,242,.42); }

        .sa-rack { display:flex; gap:9px; margin-top:18px; padding:14px 16px;
          border:1px solid rgba(13,13,13,.1); background:rgba(255,255,255,.5); }
        .sa-vial-wrap { display:flex; flex-direction:column; align-items:center; width:34px; }
        .sa-vial { position:relative; width:16px; height:58px; border:1px solid rgba(13,13,13,.16);
          background:#F7F6F2; overflow:hidden; display:flex; align-items:flex-end; }
        .sa-vial-fill { width:100%; transition: height .9s cubic-bezier(.25,1,.5,1),
          box-shadow .9s cubic-bezier(.25,1,.5,1); }
        .sa-vial-emoji { margin-top:6px; font-size:12px; line-height:1; }
        .sa-vial-pct { margin-top:3px; font-size:8px; letter-spacing:.06em; font-variant-numeric:tabular-nums; }
      `}</style>
    </div>
  );
}

/** 供配方卡展示时复用：仓的中文名与配色 */
export const CARTRIDGE_META = CARTRIDGES;
