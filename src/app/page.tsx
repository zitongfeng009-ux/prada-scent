import { redirect } from "next/navigation";

export default function Home() {
  // 首页直接跳转到处方页
  redirect("/prescription?city=上海&temp=25&humidity=50&weather=sunny&scene=deep_work&emotions=calm");
}