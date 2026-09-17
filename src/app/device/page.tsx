import type { Metadata } from "next";
import type {
  EmotionKeyword,
  EnvironmentInput,
  SceneMode,
  WeatherCondition,
} from "@/lib/types";
import DeviceClient from "./DeviceClient";

export const metadata: Metadata = {
  title: "Scent Aura · 虚拟智能香薰机 | Prada Scent",
  description: "感知你的此刻，由 AI 现场调配并释放属于你的香气",
};

/** 兜底环境：直接访问 /device（不带参数）时也能完整演示 */
const FALLBACK_ENVIRONMENT: EnvironmentInput = {
  city: "广州",
  temperature: 28,
  humidity: 75,
  weather: "rainy",
  lat: 23.13,
  lng: 113.26,
};

const VALID_SCENES: SceneMode[] = [
  "sleep_relax",
  "deep_work",
  "mercury_reversal",
  "social_boost",
  "commute_subway",
  "outdoor_park",
];

const VALID_EMOTIONS: EmotionKeyword[] = [
  "happy",
  "calm",
  "irritated",
  "anxious",
  "sad",
  "energetic",
  "tired",
  "romantic",
];

/**
 * /device —— 虚拟智能香薰机 Demo
 *
 * 环境数据沿用首页 → 处方页已有的 URL 参数契约
 * （city / temp / humidity / weather / lat / lng / scene），
 * 因此 A、B 在首页与处方页加入口时，直接拼同样的 query 即可。
 *
 * 情绪不在这里取：它由感知层在运行时给出，
 * 所以处方是客户端 POST /api/prescription 生成的，不做 SSR。
 *
 * 额外支持 ?emotion=anxious（多个用逗号）强制指定情绪：
 * 感知层未接入真实摄像头前，靠它保证路演结果可复现。
 */
export default async function DevicePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const environment: EnvironmentInput = params?.city
    ? {
        city: params.city,
        temperature: Number(params.temp) || FALLBACK_ENVIRONMENT.temperature,
        humidity: Number(params.humidity) || FALLBACK_ENVIRONMENT.humidity,
        weather: (params.weather as WeatherCondition) || FALLBACK_ENVIRONMENT.weather,
        lat: Number(params.lat) || FALLBACK_ENVIRONMENT.lat,
        lng: Number(params.lng) || FALLBACK_ENVIRONMENT.lng,
      }
    : FALLBACK_ENVIRONMENT;

  const scene: SceneMode =
    params?.scene && (VALID_SCENES as string[]).includes(params.scene)
      ? (params.scene as SceneMode)
      : "deep_work";

  // 路演可复现：仅保留合法的情绪枚举值
  // 单数 emotion 与复数 emotions 都接受：处方页入口用前者，
  // 首页现有链接用后者，这样 A 接入口时直接拼原 query 也能用。
  const forcedEmotions = (params?.emotion ?? params?.emotions ?? "")
    .split(",")
    .filter((e): e is EmotionKeyword =>
      (VALID_EMOTIONS as string[]).includes(e.trim()),
    );

  return (
    <DeviceClient
      environment={environment}
      scene={scene}
      forcedEmotions={forcedEmotions}
    />
  );
}
