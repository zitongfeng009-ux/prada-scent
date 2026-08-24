import type {
  EmotionKeyword,
  EnvironmentInput,
  SceneMode,
  WeatherCondition,
} from "../types";

/**
 * Agent 1: 多源能量偏离度计算器
 *
 * 融合天气 + 场景 + 情绪，计算"多源能量偏离度"
 * 核心逻辑：
 *   1. 环境能量：基于温度、湿度、天气计算外部环境能量值
 *   2. 情绪能量：基于用户情绪关键词计算内在情绪能量值
 *   3. 场景能量：基于场景模式计算场景期望能量值
 *   4. 偏离度 = 三者之间的差异程度，用于判断是否需要"冲突消解"
 */

// ─── 能量映射表 ───────────────────────────────────────────────

/** 天气 → 基础能量值 (0-100) */
const WEATHER_ENERGY: Record<WeatherCondition, number> = {
  sunny: 80,
  cloudy: 55,
  rainy: 35,
  snowy: 25,
  foggy: 30,
  stormy: 15,
};

/** 情绪 → 基础能量值 (0-100) */
const EMOTION_ENERGY: Record<EmotionKeyword, number> = {
  happy: 85,
  calm: 60,
  irritated: 30,
  anxious: 25,
  sad: 20,
  energetic: 90,
  tired: 15,
  romantic: 65,
};

/** 场景 → 期望能量值 (0-100) */
const SCENE_ENERGY: Record<SceneMode, number> = {
  sleep_relax: 20,
  deep_work: 70,
  mercury_reversal: 40,
  social_boost: 80,
  commute_subway: 50,
  outdoor_park: 75,
};

/** 温度舒适度调整系数：偏离 22℃ 越远，环境能量惩罚越大 */
function temperatureAdjustment(temp: number): number {
  const optimal = 22;
  const deviation = Math.abs(temp - optimal);
  // 每偏离 1℃ 扣 2 分，最多扣 30
  return Math.max(-30, -deviation * 2);
}

/** 湿度舒适度调整：偏离 50% 越远越不舒服 */
function humidityAdjustment(humidity: number): number {
  const optimal = 50;
  const deviation = Math.abs(humidity - optimal);
  return Math.max(-20, -deviation * 0.4);
}

// ─── 核心计算 ─────────────────────────────────────────────────

export interface Agent1Result {
  environmentEnergy: number;
  emotionEnergy: number;
  sceneEnergy: number;
  deviationScore: number;
  hasConflict: boolean;
  conflictDescription?: string;
  /** 推荐的目标能量区间：low / medium / high */
  targetEnergyZone: "low" | "medium" | "high";
}

/**
 * 计算多源能量偏离度
 */
export function calculateEnergyDeviation(
  env: EnvironmentInput,
  emotions: EmotionKeyword[],
  scene: SceneMode
): Agent1Result {
  // 1. 环境能量
  const weatherBase = WEATHER_ENERGY[env.weather];
  const tempAdj = temperatureAdjustment(env.temperature);
  const humAdj = humidityAdjustment(env.humidity);
  const environmentEnergy = Math.max(
    0,
    Math.min(100, weatherBase + tempAdj + humAdj)
  );

  // 2. 情绪能量（多情绪取均值）
  const emotionSum = emotions.reduce((sum, e) => sum + EMOTION_ENERGY[e], 0);
  const emotionEnergy = emotions.length > 0 ? emotionSum / emotions.length : 50;

  // 3. 场景期望能量
  const sceneEnergy = SCENE_ENERGY[scene];

  // 4. 偏离度 = 三源之间的标准差
  const mean = (environmentEnergy + emotionEnergy + sceneEnergy) / 3;
  const variance =
    ((environmentEnergy - mean) ** 2 +
      (emotionEnergy - mean) ** 2 +
      (sceneEnergy - mean) ** 2) /
    3;
  const deviationScore = Math.round(Math.sqrt(variance));

  // 5. 冲突检测
  const hasConflict = detectConflict(env, emotions, scene);
  const conflictDescription = hasConflict
    ? generateConflictDescription(env, emotions, scene)
    : undefined;

  // 6. 目标能量区间：基于场景期望，做平衡
  const targetEnergyZone = getTargetZone(sceneEnergy, emotionEnergy);

  return {
    environmentEnergy: Math.round(environmentEnergy),
    emotionEnergy: Math.round(emotionEnergy),
    sceneEnergy,
    deviationScore,
    hasConflict,
    conflictDescription,
    targetEnergyZone,
  };
}

// ─── 冲突检测 ─────────────────────────────────────────────────

function detectConflict(
  env: EnvironmentInput,
  emotions: EmotionKeyword[],
  scene: SceneMode
): boolean {
  // 冲突类型 1：高温 + 低落情绪 → 需要清凉透气而非浓郁厚重
  if (env.temperature >= 35 && emotions.some((e) => ["sad", "tired"].includes(e))) {
    return true;
  }
  // 冲突类型 2：寒冷 + 烦躁 → 需要温暖包容而非冰冷清爽
  if (env.temperature <= 10 && emotions.includes("irritated")) {
    return true;
  }
  // 冲突类型 3：高能量场景 + 低能量情绪
  const sceneNeed = SCENE_ENERGY[scene];
  const emotionAvg =
    emotions.reduce((s, e) => s + EMOTION_ENERGY[e], 0) / Math.max(emotions.length, 1);
  if (sceneNeed - emotionAvg > 40) {
    return true;
  }
  return false;
}

function generateConflictDescription(
  env: EnvironmentInput,
  emotions: EmotionKeyword[],
  scene: SceneMode
): string {
  if (env.temperature >= 35 && emotions.some((e) => ["sad", "tired"].includes(e))) {
    return `当前高温 ${env.temperature}℃，但你感到低落。我们将选择清凉透气的香气（如松针/雪松），而非浓郁甜腻的琥珀檀香，兼顾生理舒适与心理抚慰。`;
  }
  if (env.temperature <= 10 && emotions.includes("irritated")) {
    return `气温仅 ${env.temperature}℃，加上烦躁情绪。我们将选择温暖包容的木质调，而非冰冷清爽的柑橘调，给你被包裹的安全感。`;
  }
  return `当前场景「${scene}」需要较高能量，但你的情绪能量偏低。我们将选择渐进式提振的香气组合。`;
}

// ─── 目标能量区间 ──────────────────────────────────────────────

function getTargetZone(
  sceneEnergy: number,
  emotionEnergy: number
): "low" | "medium" | "high" {
  // 目标：在场景期望和当前情绪之间找到平衡
  const target = (sceneEnergy + emotionEnergy) / 2;
  if (target < 40) return "low";
  if (target < 70) return "medium";
  return "high";
}
