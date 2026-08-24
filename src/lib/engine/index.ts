import type { HealingRequest, Prescription } from "../types";
import { calculateEnergyDeviation } from "./agent1";
import { matchFragrances } from "./ruleEngine";
import { generateHealingNarrative } from "./agent2";

/**
 * 推荐引擎编排器
 *
 * 串联 Agent 1 → 规则引擎 → Agent 2 的完整流程
 * 这是 B 角色对外暴露的核心 API
 */

export async function generatePrescription(
  request: HealingRequest
): Promise<Prescription> {
  const { environment, user } = request;

  // Step 1: Agent 1 — 多源能量偏离度计算
  const agent1Result = calculateEnergyDeviation(
    environment,
    user.emotions,
    user.scene
  );

  // Step 2: 规则引擎 — 匹配香氛知识库
  const ruleEngineResult = matchFragrances(
    environment,
    user.emotions,
    user.scene,
    agent1Result,
    3 // 返回 Top 3
  );

  // Step 3: Agent 2 — 生成疗愈解说词 + 三元映射
  const { narrative, triMapping } = generateHealingNarrative(
    environment,
    user.emotions,
    user.scene,
    agent1Result,
    ruleEngineResult
  );

  // 组装处方
  const prescription: Prescription = {
    id: `rx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    request,
    energyDeviation: {
      score: agent1Result.deviationScore,
      environmentEnergy: agent1Result.environmentEnergy,
      emotionEnergy: agent1Result.emotionEnergy,
      sceneEnergy: agent1Result.sceneEnergy,
      hasConflict: agent1Result.hasConflict,
      conflictDescription: agent1Result.conflictDescription,
    },
    recommendedFragrances: ruleEngineResult.topMatches,
    healingNarrative: narrative,
    triMapping,
  };

  return prescription;
}
