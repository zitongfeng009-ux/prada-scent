import type { Metadata } from "next";
import DiaryClient from "./DiaryClient";

export const metadata: Metadata = {
  title: "情绪日记 | Prada Scent Prescription",
  description: "你的香气情绪资产——回顾每一份专属疗愈处方",
};

/**
 * /diary 情绪日记页
 *
 * 纯客户端渲染：从 localStorage 读取 prada-prescriptions 历史记录并展示。
 */
export default function DiaryPage() {
  return <DiaryClient />;
}
