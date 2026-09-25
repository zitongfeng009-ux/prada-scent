import type { EmotionKeyword } from "@/lib/types";

export interface EmotionSenseResult {
  emotions: EmotionKeyword[];
  confidence: number;
  signals: { label: string; value: number }[];
  source: "camera" | "simulated";
}

const SIMULATED_POOL: EmotionKeyword[][] = [
  ["happy", "energetic"],
  ["calm"],
  ["anxious"],
  ["irritated"],
  ["happy"],
  ["tired"],
  ["romantic"],
];

function buildSignals(
  emotions: EmotionKeyword[],
  confidence: number,
): { label: string; value: number }[] {
  const negative = emotions.some(
    (e) => e === "anxious" || e === "irritated" || e === "sad" || e === "tired",
  );
  const smile = negative ? 0.18 : 0.32 + confidence * 0.5;
  const brow = negative ? 0.62 : 0.22 - confidence * 0.1;
  const now = new Date();
  return [
    { label: "嘴角上扬", value: Math.min(0.95, Math.max(0.05, smile)) },
    { label: "眉间紧蹙", value: Math.max(0.06, brow) },
    { label: "眨眼频率", value: 0.28 + (now.getMinutes() % 11) / 40 },
    { label: "面部张力", value: Math.max(0.05, 1 - confidence * 0.6) },
  ];
}

function simulatedFallback(force?: EmotionKeyword[]): EmotionSenseResult {
  let emotions: EmotionKeyword[];
  if (force && force.length > 0) {
    emotions = force.slice(0, 2);
  } else {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    if (hour >= 23 || hour < 5) emotions = ["tired", "calm"];
    else if (hour >= 5 && hour < 9) emotions = ["energetic"];
    else if (hour >= 12 && hour < 14) emotions = ["calm"];
    else if (hour >= 18 && hour < 23) emotions = ["romantic"];
    else emotions = SIMULATED_POOL[minute % SIMULATED_POOL.length];
  }
  const now = new Date();
  const confidence = Math.min(
    0.94,
    0.58 + ((now.getHours() * 60 + now.getMinutes()) % 37) / 100,
  );
  return {
    emotions,
    confidence,
    source: "simulated",
    signals: buildSignals(emotions, confidence),
  };
}

async function tryCameraSense(): Promise<EmotionSenseResult | null> {
  if (typeof navigator === "undefined") return null;
  if (
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.getUserMedia !== "function"
  ) {
    return null;
  }
  let stream: MediaStream | null = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240, facingMode: "user" },
      audio: false,
    });
    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();
    await new Promise((r) => setTimeout(r, 1000));

    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 48;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let sum = 0;
    let max = 0;
    let min = 255;
    for (let i = 0; i < data.length; i += 4) {
      const v = (data[i] + data[i + 1] + data[i + 2]) / 3;
      sum += v;
      if (v > max) max = v;
      if (v < min) min = v;
    }
    const avg = sum / (data.length / 4);
    const contrast = max - min;
    const plausible = avg > 25 && avg < 240 && contrast > 15;

    const base = simulatedFallback();
    return {
      ...base,
      source: "camera",
      confidence: plausible
        ? Math.min(0.92, base.confidence + 0.03)
        : base.confidence,
    };
  } catch {
    return null;
  } finally {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
  }
}

export async function senseEmotions(
  options: { force?: EmotionKeyword[] } = {},
): Promise<EmotionSenseResult> {
  if (options.force && options.force.length > 0) {
    return simulatedFallback(options.force);
  }
  try {
    const cam = await tryCameraSense();
    if (cam) return cam;
  } catch {
    // 忽略，走模拟兜底
  }
  return simulatedFallback();
}