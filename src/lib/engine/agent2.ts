import type {
  EmotionKeyword,
  EnvironmentInput,
  FragranceSKU,
  HealingNarrative,
  SceneMode,
  TriMapping,
} from "../types";
import { EMOTION_LABEL, SCENE_LABEL, WEATHER_EMOJI } from "../types";
import type { Agent1Result } from "./agent1";
import type { RuleEngineResult } from "./ruleEngine";

/**
 * Agent 2: 生成专属"情绪&天气疗愈解说词"
 *
 * 输入：环境数据 + 用户情绪 + 场景 + Agent1 分析 + 规则引擎推荐结果
 * 输出：个性化的疗愈建议、文案与冥想引导
 */

// ─── 今日状态描述 ─────────────────────────────────────────────

function generateTodayStatus(
  env: EnvironmentInput,
  emotions: EmotionKeyword[],
  scene: SceneMode,
  agent1: Agent1Result
): string {
  const weatherEmoji = WEATHER_EMOJI[env.weather];
  const emotionLabels = emotions.map((e) => EMOTION_LABEL[e]).join("、");
  const sceneLabel = SCENE_LABEL[scene];

  let status = `${env.city} ${env.temperature}℃ ${weatherEmoji}，你在「${sceneLabel}」模式中，`;

  if (agent1.hasConflict) {
    status += `感受到${emotionLabels}的气息，与外部环境存在一些张力。`;
  } else {
    status += `内心${emotionLabels}，与此刻的环境和谐共振。`;
  }

  if (agent1.deviationScore > 30) {
    status += `你的身心能量偏离度较高，需要一缕恰到好处的香气来重新校准。`;
  } else if (agent1.deviationScore > 15) {
    status += `轻微的波动正在发生，一缕精选香气可以帮你找回平衡。`;
  } else {
    status += `此刻的你与环境高度和谐，让香气为这份美好加冕。`;
  }

  return status;
}

// ─── 香气组合说明 ─────────────────────────────────────────────

function generateScentCombination(
  topFragrance: FragranceSKU,
  env: EnvironmentInput
): string {
  const notesList = [
    ...topFragrance.notes.top,
    ...topFragrance.notes.heart,
    ...topFragrance.notes.base,
  ].join("、");

  const tempAdvice =
    env.temperature >= 30
      ? "高温天气下，这款香气的清爽前调会率先绽放，随着体温慢慢过渡到温暖的后调。"
      : env.temperature <= 10
        ? "低温环境中，这款香气的木质基调会更加持久地陪伴你，带来被包裹的安全感。"
        : "当前温度是这款香水最佳的挥发区间，三层香调会按节奏依次展开。";

  return `为你选择了 **${topFragrance.name}**——${topFragrance.family === "citrus" ? "柑橘调" : topFragrance.family === "floral" ? "花香调" : topFragrance.family === "woody" ? "木质调" : topFragrance.family === "oriental" ? "东方调" : topFragrance.family === "aromatic" ? "芳香调" : "经典调"}的精致结构。核心香材包含${notesList}。${tempAdvice}`;
}

// ─── 使用方式建议 ─────────────────────────────────────────────

function generateUsageGuide(scene: SceneMode): string {
  const guides: Record<SceneMode, string> = {
    sleep_relax:
      "睡前 15 分钟，将香水喷洒在枕畔与手腕内侧，配合缓慢深呼吸，让香气分子在温暖肌肤上缓缓释放。",
    deep_work:
      "工作前在太阳穴后方与衣领处轻点香水，让芳香分子帮助你建立专注的嗅觉锚点。",
    mercury_reversal:
      "在手腕、耳后与心口三处点涂，形成'疗愈三角区'，当你感到不安时，将手掌覆于鼻前深呼吸三次。",
    social_boost:
      "出门前在锁骨与手腕喷洒，社交场合中香气的扩散半径恰好是你个人气场的边界。",
    commute_subway:
      "在耳机与口罩之间轻喷一下，让通勤路上拥有一个只属于你的嗅觉气泡。",
    outdoor_park:
      "在脚踝与后颈处喷洒，让自然风与体温共同激活香气，与户外环境融为一体。",
  };
  return guides[scene];
}

// ─── 冥想引导 ─────────────────────────────────────────────────

function generateMeditationGuide(
  emotions: EmotionKeyword[],
  scene: SceneMode
): string {
  const hasAnxious = emotions.includes("anxious") || emotions.includes("irritated");
  const hasSad = emotions.includes("sad") || emotions.includes("tired");

  if (hasAnxious) {
    return `闭上眼睛，想象你正站在一片广阔的薰衣草田中。微风带着花香拂过面颊，每一次呼吸都在带走紧绷，带入宁静。吸气 4 秒，屏息 4 秒，呼气 6 秒。重复三次，感受焦虑如晨雾般消散。`;
  }
  if (hasSad) {
    return `找一个舒适的姿势，轻轻闭上眼睛。想象温暖的琥珀色光芒从心口升起，如同被最柔软的面料包裹。每一次呼吸，这份温暖都在扩散，允许自己感受这份被允许的安全。你值得被温柔以待。`;
  }
  if (scene === "sleep_relax") {
    return `平躺，双手放在腹部。感受呼吸的起伏如同海浪，每一次呼气都让身体更深地沉入柔软的床铺。从脚趾开始，逐步放松每一寸肌肉，直到头顶也融化在这片宁静中。`;
  }
  return `安静地坐着，将注意力集中在呼吸上。感受香气分子进入鼻腔，沿着嗅觉神经传递到大脑的边缘系统——那里是你的情绪中枢。每一次呼吸，你都在与自己对话。`;
}

// ─── 情绪引导语 ─────────────────────────────────────────────

function generateEmotionalGuidance(emotions: EmotionKeyword[]): string {
  const emotionLabels = emotions.map((e) => EMOTION_LABEL[e]);
  return `今天的你，带着${emotionLabels.join("与")}的能量。不需要压抑任何一种感受，让香气成为你情绪的容器——接纳、转化、升华。记住，每一种情绪都有其独特的芬芳。`;
}

// ─── 商业 CTA ─────────────────────────────────────────────────

function generateCommercialCTA(fragrance: FragranceSKU): HealingNarrative["commercialCTA"] {
  return {
    label: `探索 ${fragrance.name}`,
    fragranceId: fragrance.id,
    type: "buy_trial",
  };
}

// ─── 三元映射 ─────────────────────────────────────────────────

function generateTriMapping(
  env: EnvironmentInput,
  emotions: EmotionKeyword[],
  scene: SceneMode,
  agent1: Agent1Result,
  topFragrance: FragranceSKU
): TriMapping {
  return {
    environment: {
      label: `${env.city} ${env.temperature}℃ ${WEATHER_EMOJI[env.weather]}`,
      energy: agent1.environmentEnergy,
      factors: [
        `温度${env.temperature}℃`,
        `湿度${env.humidity}%`,
        `${SCENE_LABEL[scene]}`,
      ],
    },
    emotion: {
      label: emotions.map((e) => EMOTION_LABEL[e]).join("·"),
      energy: agent1.emotionEnergy,
      factors: emotions.map((e) => `${EMOTION_LABEL[e]} ${e === "happy" ? "😊" : e === "calm" ? "😌" : e === "irritated" ? "😤" : e === "anxious" ? "😰" : e === "sad" ? "😢" : e === "energetic" ? "⚡" : e === "tired" ? "😴" : "🌹"}`),
    },
    fragrance: {
      label: topFragrance.name,
      energy: Math.round(
        (agent1.environmentEnergy + agent1.emotionEnergy) / 2
      ),
      factors: [
        `${topFragrance.family === "citrus" ? "柑橘" : topFragrance.family === "floral" ? "花香" : topFragrance.family === "woody" ? "木质" : topFragrance.family === "oriental" ? "东方" : "芳香"}调`,
        `前调: ${topFragrance.notes.top.join(", ")}`,
        `基调: ${topFragrance.notes.base.join(", ")}`,
      ],
    },
  };
}

// ─── 主函数 ───────────────────────────────────────────────────

export function generateHealingNarrative(
  env: EnvironmentInput,
  emotions: EmotionKeyword[],
  scene: SceneMode,
  agent1Result: Agent1Result,
  ruleEngineResult: RuleEngineResult
): { narrative: HealingNarrative; triMapping: TriMapping } {
  const topFragrance = ruleEngineResult.topMatches[0];

  const narrative: HealingNarrative = {
    todayStatus: generateTodayStatus(env, emotions, scene, agent1Result),
    scentCombination: generateScentCombination(topFragrance, env),
    usageGuide: generateUsageGuide(scene),
    meditationGuide: generateMeditationGuide(emotions, scene),
    emotionalGuidance: generateEmotionalGuidance(emotions),
    commercialCTA: generateCommercialCTA(topFragrance),
  };

  const triMapping = generateTriMapping(
    env,
    emotions,
    scene,
    agent1Result,
    topFragrance
  );

  return { narrative, triMapping };
}
