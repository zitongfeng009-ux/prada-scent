import type { Cartridge, CartridgeId, FragranceFamily } from "../types";

/**
 * 7 个基础香调精油仓 —— 虚拟香薰机的"物理库存"
 *
 * 这些仓不是凭空设计的：keywords 汇总自 src/lib/data/fragrances.ts 中
 * Prada 全目录 13 款香水的全部真实香材（前 / 中 / 后调共约 40 个），
 * 再按调香逻辑归并为 7 类基础原液。因此任何一款推荐都能由这 7 个仓调配出来。
 *
 * color 沿用项目既有香调配色体系（与 C 的情绪日记、B 的处方页一致）。
 */
export const CARTRIDGES: Record<CartridgeId, Cartridge> = {
  citrus: {
    id: "citrus",
    label: "柑橘清新仓",
    emoji: "🍋",
    color: "#E8B84B",
    keywords: ["柠檬", "橘", "柑", "橙", "梨", "松香", "生姜", "佛手", "葡萄柚"],
  },
  floral: {
    id: "floral",
    label: "花香仓",
    emoji: "🌸",
    color: "#E8A0B4",
    keywords: ["橙花", "茉莉", "鸢尾", "天竺葵", "玫瑰", "依兰", "紫罗兰", "晚香玉", "桂花"],
  },
  woody: {
    id: "woody",
    label: "木质仓",
    emoji: "🌲",
    color: "#A07850",
    keywords: ["檀香", "雪松", "香根草", "藿香", "乌木", "沉香", "橡木苔"],
  },
  oriental: {
    id: "oriental",
    label: "东方琥珀仓",
    emoji: "🔥",
    color: "#C07840",
    keywords: ["琥珀", "安息香", "焚香", "龙涎", "乳香"],
  },
  vanilla: {
    id: "vanilla",
    label: "香草甜香仓",
    emoji: "🍦",
    color: "#D9B24B",
    keywords: ["香草", "焦糖", "开心果", "坚果", "蜂蜜"],
  },
  aromatic: {
    id: "aromatic",
    label: "芳香辛香仓",
    emoji: "🌿",
    color: "#7A9E6A",
    keywords: ["薰衣草", "鼠尾草", "艾蒿", "马黛茶", "胡椒", "小豆蔻", "藏红花", "胡萝卜籽", "迷迭香", "罗勒"],
  },
  musk: {
    id: "musk",
    label: "麝香定香仓",
    emoji: "🤍",
    color: "#C7B8E8",
    keywords: ["麝香", "绒面革", "皮革", "龙涎酮"],
  },
};

export const CARTRIDGE_LIST: Cartridge[] = Object.values(CARTRIDGES);

/**
 * 香料 → 精油仓 的匹配优先级
 *
 * 顺序很关键：必须"特异性高的先匹配"。例如 橙花 / 橙花油 属花香，
 * 但字面含"橙"，若先跑 citrus 就会被错归到柑橘仓，故 floral 排在 citrus 前。
 */
const MATCH_ORDER: CartridgeId[] = [
  "musk",
  "vanilla",
  "woody",
  "oriental",
  "aromatic",
  "floral",
  "citrus",
];

/**
 * 把一条真实香材名归到某个精油仓；无法归类时返回 null（由调用方决定兜底策略）。
 *
 * 采用 includes 子串匹配，因此 "琥珀(Ambrofix)"、"白麝香(Serenolide)"、
 * "降龙涎香醚(Ambroxan)" 这类带英文后缀的写法都能正确命中。
 */
export function resolveCartridge(note: string): CartridgeId | null {
  const clean = String(note || "").trim();
  if (!clean) return null;
  for (const id of MATCH_ORDER) {
    if (CARTRIDGES[id].keywords.some((kw) => clean.includes(kw))) return id;
  }
  return null;
}

/** 香调家族 → 主仓，用于调配时的 family 偏置，以及未识别香材的兜底 */
export const FAMILY_TO_CARTRIDGE: Record<FragranceFamily, CartridgeId> = {
  citrus: "citrus",
  floral: "floral",
  woody: "woody",
  oriental: "oriental",
  fresh: "citrus",
  aromatic: "aromatic",
  chypre: "woody",
  fougere: "aromatic",
};

/**
 * 各仓的冷暖热值：正为温暖包裹，负为清凉通透，0 为中性。
 * 配方算完后按 pct 加权求和，得出整张配方的调性。
 */
export const CARTRIDGE_THERMAL: Record<CartridgeId, number> = {
  oriental: 2,
  vanilla: 2,
  musk: 2,
  woody: 1,
  floral: 0,
  aromatic: 0,
  citrus: -2,
};
