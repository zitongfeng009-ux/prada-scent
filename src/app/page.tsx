import { redirect } from "next/navigation";

export default function Home() {
  // 首页直接跳转到处方页（城市名用 URL 编码，避免中文字符导致构建失败）
  const city = encodeURIComponent("上海");
  redirect(`/prescription?city=${city}&temp=25&humidity=50&weather=sunny&scene=deep_work&emotions=calm`);
}