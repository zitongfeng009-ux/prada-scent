import type { Agent1Result } from "./agent1";
import type {
  EmotionKeyword,
  EnvironmentInput,
  FragranceSKU,
  SceneMode,
} from "../types";
import { fragranceDatabase } from "../data/fragrances";

/**
 * 规则引擎：匹配 Prada 香氛知识库
 *
 * 基于 Agent 1 的能量偏离度结果，从知识库中筛选并排序最匹配的香氛 SKU
 *
 * 匹配维度：
 *   1. 温度适应性（权重 30%）
 *   2. 情绪匹配度（权重 30%）
 *   3. 场景匹配度（权重 25%）
 *   4. 挥发度适配（权重 15%）
 */

// ─── 评分函数 ─────────────────────────────────────────────────

/** 温度适应性评分 (0-100) */
function scoreTemperature(
  temp: number,
  range: { min: number; max: number }
): number {
  if (temp >= range.min && temp <= range.max) return 100;
  const distance =
    temp < range.min ? range.min - temp : temp - range.max;
  // 每超出 1℃ 扣 10 分
  return Math.max(0, 100 - distance * 10);
}

/** 情绪匹配度评分 (0-100) */
function scoreEmotionMatch(
  userEmotions: EmotionKeyword[],
  suitableEmotions: EmotionKeyword[]
): number {
  if (userEmotions.length === 0) return 50; // 无情绪输入时中性分
  const matched = userEmotions.filter((e) => suitableEmotions.includes(e));
  return Math.round((matched.length / userEmotions.length) * 100);
}

/** 场景匹配度评分 (0-100) */
function scoreSceneMatch(
  scene: SceneMode,
  suitableScenes: SceneMode[]
): number {
  return suitableScenes.includes(scene) ? 100 : 20;
}

/** 挥发度适配评分 (0-100) */
function scoreVolatility(
  temp: number,
  volatility: "high" | "medium" | "low"
): number {
  // 高温适合高挥发（清爽），低温适合低挥发（持久温暖）
  if (temp >= 30) {
    return volatility === "high" ? 100 : volatility === "medium" ? 60 : 30;
  }
  if (temp >= 18) {
    return volatility === "medium" ? 100 : volatility === "high" ? 70 : 60;
  }
  // 低温
  return volatility === "low" ? 100 : volatility === "medium" ? 70 : 40;
}

// ─── 冲突消解加权 ─────────────────────────────────────────────

/**
 * 当 Agent 1 检测到冲突时，调整评分权重
 * 例：高温+低落 → 温度适应性权重提升到 45%，情绪匹配降到 20%
 */
function getWeights(
  agent1: Agent1Result
): {
  temp: number;
  emotion: number;
  scene: number;
  volatility: number;
} {
  if (agent1.hasConflict) {
    // 冲突时优先保证生理舒适
    return { temp: 0.4, emotion: 0.2, scene: 0.25, volatility: 0.15 };
  }
  // 正常情况
  return { temp: 0.3, emotion: 0.3, scene: 0.25, volatility: 0.15 };
}

// ─── 主函数 ───────────────────────────────────────────────────

export interface RuleEngineResult {
  scored: Array<{
    fragrance: FragranceSKU;
    totalScore: number;
    breakdown: {
      tempScore: number;
      emotionScore: number;
      sceneScore: number;
      volatilityScore: number;
    };
  }>;
  topMatches: FragranceSKU[];
}

/**
 * 执行规则匹配，返回排序后的推荐列表
 */
export function matchFragrances(
  env: EnvironmentInput,
  emotions: EmotionKeyword[],
  scene: SceneMode,
  agent1Result: Agent1Result,
  topN: number = 3
): RuleEngineResult {
  const weights = getWeights(agent1Result);

  const scored = fragranceDatabase.map((fragrance) => {
    const tempScore = scoreTemperature(env.temperature, fragrance.tempRange);
    const emotionScore = scoreEmotionMatch(emotions, fragrance.suitableEmotions);
    const sceneScore = scoreSceneMatch(scene, fragrance.scenes);
    const volatilityScore = scoreVolatility(env.temperature, fragrance.volatility);

    const totalScore = Math.round(
      tempScore * weights.temp +
        emotionScore * weights.emotion +
        sceneScore * weights.scene +
        volatilityScore * weights.volatility
    );

    return {
      fragrance,
      totalScore,
      breakdown: { tempScore, emotionScore, sceneScore, volatilityScore },
    };
  });

  // 按总分降序排列
  scored.sort((a, b) => b.totalScore - a.totalScore);

  return {
    scored,
    topMatches: scored.slice(0, topN).map((s) => s.fragrance),
  };
}
