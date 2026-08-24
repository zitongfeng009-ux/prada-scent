import type {
  EmotionKeyword,
  EnvironmentInput,
  FragranceFamily,
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

// ─── 冥想引导（基于推荐香水香型，与氛围音效场景一致）──────────

/**
 * 根据推荐香水的香型家族生成冥想引导词
 * 场景与 ambientAudio.ts 中的香型→氛围映射完全对齐：
 *   citrus  → 水晶清澈（明亮光芒）
 *   floral  → 花瓣梦境（花园漫步）
 *   woody   → 森林扎根（林间漫步）
 *   oriental→ 温暖拥抱（琥珀暖光）
 *   fresh   → 细雨宁静（雨中漫步）
 *   aromatic→ 海洋抚慰（海岸潮汐）
 *   chypre  → 森林扎根（苔藓大地）
 *   fougere → 细雨宁静（草本清露）
 */
function generateMeditationGuide(
  fragranceFamily: FragranceFamily,
  emotions: EmotionKeyword[]
): string {
  const emotionLabel = emotions.length > 0
    ? `带着此刻的${emotions.map((e) => {
        const m: Record<EmotionKeyword, string> = {
          happy: "愉悦", calm: "平和", irritated: "烦躁", anxious: "不安",
          sad: "忧伤", energetic: "活力", tired: "疲倦", romantic: "柔情",
        };
        return m[e];
      }).join("与")}`
    : "此刻";

  const guides: Record<FragranceFamily, string> = {
    citrus: `闭上眼睛，${emotionLabel}。想象一道清澈的光从头顶倾泻而下，如同清晨第一缕阳光穿透水晶棱镜，在空气中折射出无数细小的光点。每一次呼吸，这些光点都在洗涤你的思绪，留下一片澄明。吸气 4 秒，屏息 4 秒，呼气 6 秒，让柑橘的清新分子唤醒每一个细胞。`,
    floral: `闭上眼睛，${emotionLabel}。想象你正漫步在一座盛放的花园中——玫瑰、鸢尾、橙花在脚下铺展开来。微风拂过，花瓣轻旋，每一次呼吸都将花香收入心底。放慢脚步，允许自己被这片柔软包围。吸气 4 秒，屏息 4 秒，呼气 6 秒，感受紧绷在花香中一点点消融。`,
    woody: `闭上眼睛，${emotionLabel}。想象你正走进一片古老的森林，脚下是松软的苔藓与落叶，头顶是层层叠叠的树冠。阳光从枝叶间洒落，形成一道道温暖的光柱。你的双脚稳稳地踩在大地上，每一次呼气都让你扎得更深。吸气 4 秒，屏息 4 秒，呼气 6 秒，感受大地的沉稳从脚底升起。`,
    oriental: `闭上眼睛，${emotionLabel}。想象一团温暖的琥珀色光芒从心口缓缓升起，如同被最柔软的面料轻轻包裹。空气中弥漫着香草与树脂的暖意，每一次呼吸都让这份温暖向四周扩散。允许自己感受这份安全——你值得被温柔以待。吸气 4 秒，屏息 4 秒，呼气 6 秒，让温暖渗透每一寸肌肤。`,
    fresh: `闭上眼睛，${emotionLabel}。想象你正漫步在一场温柔的细雨中，雨丝轻触面颊，空气清透如洗。每一滴雨水都在带走疲惫与杂念，留下的是雨后泥土与青草的清新。深呼吸，让这份洁净贯穿全身。吸气 4 秒，屏息 4 秒，呼气 6 秒，感受身心如雨洗般澄净。`,
    aromatic: `闭上眼睛，${emotionLabel}。想象你正站在一片辽阔的海岸线上，海浪有节奏地涌来又退去。海风带着咸湿的清新拂过面颊，每一次潮起潮落都在带走紧绷，带入宁静。让呼吸与海浪同频——吸气时海浪涌来，呼气时海浪退去。重复三次，感受焦虑如退潮般消散。`,
    chypre: `闭上眼睛，${emotionLabel}。想象你正赤脚走在一片湿润的森林苔藓上，脚下是柔软而厚实的大地。空气中弥漫着橡木苔与广藿香的泥土气息，头顶是参天古木交织的绿色穹顶。每一次呼气，你都与这片大地连接得更深。吸气 4 秒，屏息 4 秒，呼气 6 秒，感受根基从脚底向下延伸。`,
    fougere: `闭上眼睛，${emotionLabel}。想象你正站在一片雨后的草地上，空气中弥漫着薰衣草与香豆素的清甜。远处的山峦在薄雾中若隐若现，脚下的青草沾满了露珠。每一次呼吸都是大自然的馈赠，清新而治愈。吸气 4 秒，屏息 4 秒，呼气 6 秒，让草本的芬芳唤醒内在的宁静。`,
  };

  return guides[fragranceFamily];
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
    meditationGuide: generateMeditationGuide(topFragrance.family, emotions),
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
