// ============================================================
// Shared Types — B 角色定义，需与 A、C 对齐
// ============================================================

/** 情绪关键词枚举 */
export type EmotionKeyword =
  | "happy"
  | "calm"
  | "irritated"
  | "anxious"
  | "sad"
  | "energetic"
  | "tired"
  | "romantic";

/** 情绪关键词 → Emoji 映射 */
export const EMOTION_EMOJI: Record<EmotionKeyword, string> = {
  happy: "😊",
  calm: "😌",
  irritated: "😤",
  anxious: "😰",
  sad: "😢",
  energetic: "⚡",
  tired: "😴",
  romantic: "🌹",
};

/** 情绪关键词中文 */
export const EMOTION_LABEL: Record<EmotionKeyword, string> = {
  happy: "开心",
  calm: "平静",
  irritated: "烦躁",
  anxious: "焦虑",
  sad: "悲伤",
  energetic: "兴奋",
  tired: "疲惫",
  romantic: "浪漫",
};

/** 场景模式枚举 */
export type SceneMode =
  | "sleep_relax"
  | "deep_work"
  | "mercury_reversal"
  | "social_boost"
  | "commute_subway"
  | "outdoor_park";

/** 场景中文标签 */
export const SCENE_LABEL: Record<SceneMode, string> = {
  sleep_relax: "睡前放松",
  deep_work: "深度高效工作",
  mercury_reversal: "水逆平复",
  social_boost: "社交提振",
  commute_subway: "通勤地铁",
  outdoor_park: "户外公园",
};

/** 天气状况 */
export type WeatherCondition =
  | "sunny"
  | "cloudy"
  | "rainy"
  | "snowy"
  | "foggy"
  | "stormy";

export const WEATHER_EMOJI: Record<WeatherCondition, string> = {
  sunny: "☀️",
  cloudy: "⛅",
  rainy: "🌧️",
  snowy: "🌨️",
  foggy: "🌫️",
  stormy: "⛈️",
};

/** 天气中文名（全站共用，避免各页自己写一份） */
export const WEATHER_LABEL: Record<WeatherCondition, string> = {
  sunny: "晴",
  cloudy: "多云",
  rainy: "下雨",
  snowy: "下雪",
  foggy: "雾",
  stormy: "雷雨",
};

/** 环境数据（A 角色提供） */
export interface EnvironmentInput {
  /** 城市名 */
  city: string;
  /** 实时温度 ℃ */
  temperature: number;
  /** 湿度 % */
  humidity: number;
  /** 天气状况 */
  weather: WeatherCondition;
  /** 纬度 */
  lat: number;
  /** 经度 */
  lng: number;
}

/** 用户输入（A 角色提供） */
export interface UserInput {
  /** 当前情绪 */
  emotions: EmotionKeyword[];
  /** 当前场景 */
  scene: SceneMode;
  /** 可选：用户自由文本倾诉 */
  freeText?: string;
}

/** 完整的疗愈请求 = 环境 + 用户输入 */
export interface HealingRequest {
  environment: EnvironmentInput;
  user: UserInput;
}

/** 香调家族 */
export type FragranceFamily =
  | "citrus"
  | "floral"
  | "woody"
  | "oriental"
  | "fresh"
  | "aromatic"
  | "chypre"
  | "fougere";

/**
 * 香调家族中文名 —— 全站唯一来源
 * 以前引擎里散落着几套三元判断，漏写 fresh 等值时会掉进 else，
 * 导致同一支香水在不同位置被叫成「经典调 / 芳香调 / 清新调」。
 * 需要展示家族名时一律用这张表，不要再写 if 链。
 */
export const FAMILY_LABEL: Record<FragranceFamily, string> = {
  citrus: "柑橘调",
  floral: "花香调",
  woody: "木质调",
  oriental: "东方调",
  fresh: "清新调",
  aromatic: "芳香调",
  chypre: "甘苔调",
  fougere: "馥奇调",
};

/** 香调层级 */
export interface OlfactoryNotes {
  top: string[];
  heart: string[];
  base: string[];
}

/** 挥发速率 */
export type Volatility = "high" | "medium" | "low";

/** 适用温度范围 */
export interface TemperatureRange {
  min: number;
  max: number;
}

/** 香氛 SKU（知识库条目） */
export interface FragranceSKU {
  id: string;
  /** 品牌 */
  brand: string;
  /** 产品名 */
  name: string;
  /** 系列 */
  collection: string;
  /** 香调家族 */
  family: FragranceFamily;
  /** 前中后调 */
  notes: OlfactoryNotes;
  /** 挥发速率 */
  volatility: Volatility;
  /** 适用温度范围 */
  tempRange: TemperatureRange;
  /** 功效标签 */
  effects: string[];
  /** 适用场景 */
  scenes: SceneMode[];
  /** 适合的情绪 */
  suitableEmotions: EmotionKeyword[];
  /** 3:4 产品图 URL */
  imageUrl: string;
  /** 购买链接 */
  purchaseUrl: string;
  /** 香水故事 / 灵感描述 */
  story: string;
}

/** 多源能量偏离度计算结果 */
export interface EnergyDeviation {
  /** 综合偏离度 0-100 */
  score: number;
  /** 环境能量值 */
  environmentEnergy: number;
  /** 情绪能量值 */
  emotionEnergy: number;
  /** 场景能量值 */
  sceneEnergy: number;
  /** 冲突标记 */
  hasConflict: boolean;
  /** 冲突描述 */
  conflictDescription?: string;
}

/** 推荐处方（B 角色输出，C 角色消费） */
export interface Prescription {
  id: string;
  createdAt: string;
  /** 请求快照 */
  request: HealingRequest;
  /** 能量偏离度 */
  energyDeviation: EnergyDeviation;
  /** 推荐的香氛 SKU 列表（按匹配度排序） */
  recommendedFragrances: FragranceSKU[];
  /** 专属疗愈解说词（Agent 2 生成） */
  healingNarrative: HealingNarrative;
  /** 三元映射数据 */
  triMapping: TriMapping;
}

/** Agent 2 生成的疗愈解说词 */
export interface HealingNarrative {
  /** 今日状态描述 */
  todayStatus: string;
  /** 香气组合说明 */
  scentCombination: string;
  /** 使用方式建议 */
  usageGuide: string;
  /** 冥想引导文案 */
  meditationGuide: string;
  /** 情绪引导语 */
  emotionalGuidance: string;
  /** 商业动作 CTA */
  commercialCTA: {
    label: string;
    fragranceId: string;
    type: "buy_trial" | "buy_full" | "subscribe" | "gift_box";
  };
}

/** 环境-情绪-香氛 三元映射 */
export interface TriMapping {
  environment: {
    label: string;
    energy: number;
    factors: string[];
  };
  emotion: {
    label: string;
    energy: number;
    factors: string[];
  };
  fragrance: {
    label: string;
    energy: number;
    factors: string[];
  };
}

// ============================================================
// 虚拟香薰机 · 调配层接口契约（B 定义，A / C 对接）
// ============================================================

/**
 * 7 个基础香调精油仓
 *
 * 设计原理：设备的仓不装"整瓶香水"，而是装调香师用的基础香料原液。
 * 这 7 个仓由 Prada 全目录 13 款香水的真实 notes 反推归纳而成，
 * 因此任何一款推荐都能被这几个仓"调配"出来——就像打印机用 CMYK
 * 四色墨盒印出千万种颜色。
 */
export type CartridgeId =
  | "citrus"   // 柑橘清新
  | "floral"   // 花香
  | "woody"    // 木质
  | "oriental" // 东方琥珀
  | "vanilla"  // 香草甜香
  | "aromatic" // 芳香辛香
  | "musk";    // 麝香定香

/** 精油仓定义 */
export interface Cartridge {
  id: CartridgeId;
  /** 仓名（中文） */
  label: string;
  emoji: string;
  /** 主色，用于仓体辉光 / 氛围灯 / 出雾混色 */
  color: string;
  /** 该仓覆盖的香料关键词，供 notes → 仓 映射使用 */
  keywords: string[];
}

/** 单个精油仓的出雾占比 */
export interface BlendComponent {
  cartridge: CartridgeId;
  /** 百分比，所有 component 之和恒为 100 */
  pct: number;
}

/** 调配层输出：一次"实时调配"的完整配方卡 */
export interface BlendRecipe {
  sourceFragranceId: string;
  sourceFragranceName: string;
  /** 按 pct 降序排列 */
  components: BlendComponent[];
  /** 氛围灯主色 = 占比最高仓的颜色 */
  lightColor: string;
  /** 出雾混合色，顺序与 components 一致 */
  mistColors: string[];
  /** 出雾强度：沿用挥发度（高挥发 = 强而短，低挥发 = 弱而长） */
  intensity: Volatility;
  /** 冷暖调性：由各仓热值按配比加权得出 */
  warmth: "cool" | "neutral" | "warm";
}

/** 虚拟香薰机状态机 */
export type DeviceState =
  | "idle"
  | "sensing"
  | "prescribing"
  | "blending"
  | "releasing"
  | "complete";

/** B → C 的设备指令（C 的香薰机组件只消费此结构，不自行造数据） */
export interface DeviceCommand {
  state: DeviceState;
  /** blending 及之后阶段有值 */
  recipe?: BlendRecipe;
}
