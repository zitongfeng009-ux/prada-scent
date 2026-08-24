import type { Metadata } from "next";
import { generatePrescription } from "@/lib/engine";
import type { HealingRequest } from "@/lib/types";
import PrescriptionClient from "./PrescriptionClient";

export const metadata: Metadata = {
  title: "今日香笺 | Prada Scent Prescription",
  description: "你的专属香气疗愈处方",
};

/**
 * /prescription 处方结果页
 *
 * 支持两种模式：
 * 1. 从首页带参数跳转（SSR 渲染）
 * 2. 客户端交互触发（Client Component 处理）
 */
export default async function PrescriptionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  // 如果 URL 带有查询参数，尝试 SSR 生成处方
  let initialPrescription = null;

  if (params?.city && params?.emotions && params?.scene) {
    try {
      const request: HealingRequest = {
        environment: {
          city: params.city || "上海",
          temperature: Number(params.temp) || 25,
          humidity: Number(params.humidity) || 60,
          weather: (params.weather as any) || "cloudy",
          lat: Number(params.lat) || 31.23,
          lng: Number(params.lng) || 121.47,
        },
        user: {
          emotions: (params.emotions as any)?.split(",") || ["calm"],
          scene: (params.scene as any) || "deep_work",
        },
      };

      initialPrescription = await generatePrescription(request);
    } catch {
      // SSR 失败则交给客户端处理
    }
  }

  return <PrescriptionClient initialPrescription={initialPrescription} />;
}
