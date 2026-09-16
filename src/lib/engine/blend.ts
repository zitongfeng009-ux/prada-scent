import type {
  BlendComponent,
  BlendRecipe,
  CartridgeId,
  FragranceSKU,
} from "../types";
import {
  CARTRIDGE_LIST,
  CARTRIDGES,
  CARTRIDGE_THERMAL,
  FAMILY_TO_CARTRIDGE,
  resolveCartridge,
} from "../data/cartridges";

/**
 * 调配层（AI 翻译层）—— Physical AI 闭环中的"决策 → 执行"桥梁
 *
 * 解决的问题：网页推荐的是 Prada 全目录的完整香水，而硬件精油仓数量有限。
 * 思路借鉴打印机：CMYK 四色墨盒能印出千万种颜色，靠的不是"每色一罐"，
 * 而是按比例混合。本层把一支香水的全部香材拆解归入 7 个基础仓，
 * 输出一张可执行的"配比配方卡"，交给虚拟香薰机混合释放。
 *
 * 注意：输出的是这支香水的"核心香调骨架"近似，而非精确复制整瓶香水；
 * 完整高保真体验由处方页的购买引导承接。
 */

/**
 * 香调层权重：后调是留香主体、决定"闻起来像不像"，故权重最高。
 * 前调易挥发、只负责开场感，权重最低。
 */
const LAYER_WEIGHT = { top: 1, heart: 2, base: 3 } as const;

/**
 * 香调家族偏置：相当于额外追加约 1.3 个后调香材的分量，
 * 保证"东方调就是东方调"，避免被大量次要香材稀释掉主调。
 */
const FAMILY_BIAS = 4;

/** 加权热值超过该阈值判为 warm / cool，其间为 neutral */
const THERMAL_THRESHOLD = 0.8;

function emptyScores(): Record<CartridgeId, number> {
  return {
    citrus: 0,
    floral: 0,
    woody: 0,
    oriental: 0,
    vanilla: 0,
    aromatic: 0,
    musk: 0,
  };
}

/**
 * 把任意正整数分值归一化为总和恰好 100 的百分比。
 *
 * 用"最大余数法"：先取整数部分，剩下的百分点按小数部分从大到小逐个补给
 * 最接近进位的仓。这样既保证 Σpct === 100（UI 环形图不会出现 99% / 101%），
 * 又让占比尽量贴近真实值。
 */
function normalizeToHundred(scores: Record<CartridgeId, number>): BlendComponent[] {
  const entries = CARTRIDGE_LIST.map((c) => ({
    cartridge: c.id,
    score: scores[c.id],
  })).filter((e) => e.score > 0);

  const total = entries.reduce((s, e) => s + e.score, 0);
  if (!entries.length || total <= 0) return [];

  const items = entries.map((e) => {
    const raw = (e.score / total) * 100;
    const pct = Math.floor(raw);
    return { cartridge: e.cartridge, pct, frac: raw - pct };
  });

  let used = items.reduce((s, i) => s + i.pct, 0);
  const byFrac = [...items].sort((a, b) => b.frac - a.frac);
  for (let k = 0; used < 100 && byFrac.length; k++, used++) {
    byFrac[k % byFrac.length].pct += 1;
  }

  return items
    .map(({ cartridge, pct }) => ({ cartridge, pct }))
    .sort((a, b) => b.pct - a.pct);
}

/** 单支香水 → 调配配方 */
export function computeBlendRecipe(fragrance: FragranceSKU): BlendRecipe {
  const scores = emptyScores();
  // 家族主仓：既用于偏置，也作为未识别香材的兜底归属
  const familyCartridge: CartridgeId =
    FAMILY_TO_CARTRIDGE[fragrance.family] ?? "citrus";
  const notes = fragrance.notes ?? { top: [], heart: [], base: [] };

  (Object.keys(LAYER_WEIGHT) as Array<keyof typeof LAYER_WEIGHT>).forEach((layer) => {
    (notes[layer] ?? []).forEach((note) => {
      const cartridge = resolveCartridge(note) ?? familyCartridge;
      scores[cartridge] += LAYER_WEIGHT[layer];
    });
  });

  scores[familyCartridge] += FAMILY_BIAS;

  const components = normalizeToHundred(scores);
  if (!components.length) {
    components.push({ cartridge: familyCartridge, pct: 100 });
  }

  const dominant = CARTRIDGES[components[0].cartridge];
  const thermal = components.reduce(
    (s, c) => s + (c.pct / 100) * CARTRIDGE_THERMAL[c.cartridge],
    0,
  );

  return {
    sourceFragranceId: fragrance.id,
    sourceFragranceName: fragrance.name,
    components,
    lightColor: dominant.color,
    mistColors: components.map((c) => CARTRIDGES[c.cartridge].color),
    // 高挥发 = 出雾强而短促；低挥发 = 出雾弱而绵长
    intensity: fragrance.volatility ?? "medium",
    warmth:
      thermal >= THERMAL_THRESHOLD
        ? "warm"
        : thermal <= -THERMAL_THRESHOLD
          ? "cool"
          : "neutral",
  };
}

/** 处方 Top-N 批量调配（设备页可取第一条作为主释放配方） */
export function computeBlendRecipes(
  fragrances: FragranceSKU[],
): BlendRecipe[] {
  return (fragrances ?? []).map(computeBlendRecipe);
}
