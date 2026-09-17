import type { EmotionKeyword } from "@/lib/types";

/**
 * 情绪感知结果 —— A 角色的输出契约
 *
 * A 在 feature 分支实现真实摄像头版本时，只需保证返回同样的结构，
 * 设备页无需任何改动即可切换。
 */
export interface EmotionSenseResult {
  /** 识别出的情绪，按置信度降序，1-2 个 */
  emotions: EmotionKeyword[];
  /** 整体置信度 0-1 */
  confidence: number;
  /** 面部特征读数，仅用于界面展示"AI 看到了什么" */
  signals: { label: string; value: number }[];
  /** 数据来源，界面据此标注"摄像头"或"模拟" */
  source: "camera" | "simulated";
}

/**
 * ⚠️⚠️ 临时占位实现 —— 待 A 角色交付后替换 ⚠️⚠️
 *
 * A 的正式模块路径：src/lib/ai/emotionDetection.ts
 * 落地后只需把 DeviceClient.tsx 里的
 *   import { senseEmotions } from "./placeholderSense";
 * 改成
 *   import { senseEmotions } from "@/lib/ai/emotionDetection";
 * 其余逻辑零改动。
 *
 * 本占位版故意见底不调用 getUserMedia：
 * 1. 不弹摄像头授权，保证任何电脑打开就能一路演示到底；
 * 2. 把"感知"这层的接口形状先固定下来，让 A / C 不必互相等待。
 *
 * 模拟策略用"当前时刻"作种子，输出看起来有依据、也可复现：
 * 深夜判疲惫、清晨判兴奋、午后按分钟数在几组情绪间轮换。
 *
 * 路演可用 `force` 强制指定情绪，让演示结果不依赖现场时钟
 * （设备页已接上 ?emotion=anxious 这种 URL 参数）。
 */
export async function senseEmotions(
  options: { force?: EmotionKeyword[] } = {},
): Promise<EmotionSenseResult> {
  // 模拟一次推理耗时，让界面有机会走完"感知中"的过场
  await new Promise((resolve) => setTimeout(resolve, 1800));

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  let emotions: EmotionKeyword[];
  if (options.force?.length) {
    emotions = options.force.slice(0, 2);
  } else if (hour >= 23 || hour < 5) {
    emotions = ["tired", "calm"];
  } else if (hour >= 5 && hour < 9) {
    emotions = ["energetic"];
  } else if (hour >= 12 && hour < 14) {
    emotions = ["calm"];
  } else if (hour >= 18 && hour < 23) {
    emotions = ["romantic"];
  } else {
    const pool: EmotionKeyword[][] = [
      ["happy", "energetic"],
      ["calm"],
      ["anxious"],
      ["irritated"],
      ["happy"],
    ];
    emotions = pool[minute % pool.length];
  }

  // 读数与所选情绪弱相关，保证界面数字不自相矛盾
  const base = 0.58 + ((hour * 60 + minute) % 37) / 100;
  const confidence = Math.min(0.94, base);
  const smile = Math.min(0.95, 0.3 + confidence * 0.5);
  const brow = Math.max(
    0.06,
    emotions.some((e) => e === "anxious" || e === "irritated")
      ? 0.62
      : 0.22 - confidence * 0.1,
  );

  return {
    emotions,
    confidence,
    source: "simulated",
    signals: [
      { label: "嘴角上扬", value: smile },
      { label: "眉间紧蹙", value: brow },
      { label: "眨眼频率", value: 0.28 + (minute % 11) / 40 },
      { label: "面部张力", value: 1 - confidence * 0.6 },
    ],
  };
}
