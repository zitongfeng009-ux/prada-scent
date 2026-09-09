"use client";

/**
 * 情绪日记页面（C 角色重构版）
 *
 * C 提供的是一份自包含的 vanilla HTML（含 MBTI 香气人格分析、情绪趋势折线图、
 * 力导向香气地图、气味详情抽屉、漂流瓶分享等复杂逻辑），完整保留在
 * public/diary-app.html 中，通过全屏 iframe 挂载到 /diary 路由。
 *
 * 采用 iframe 的原因：
 * 1. 零转换风险 —— 完整保留 C 的力导向布局、Canvas 卡片生成、base64 编解码、音频联动；
 * 2. CSS 完全隔离 —— C 的全局 reset（* { margin:0 }）与 body 背景不会污染主站样式；
 * 3. localStorage 同源共享 —— 处方数据（prada-prescriptions）在主站与 iframe 间实时互通；
 * 4. HTML 内已注入 <base target="_top" />，内部 "/" 链接会在顶层窗口跳转，不会困在 iframe 内。
 */
export default function DiaryClient() {
  return (
    <iframe
      src="/diary-app.html"
      title="情绪日记 · Prada 香气地图"
      style={{
        display: "block",
        width: "100%",
        height: "100vh",
        border: "none",
      }}
    />
  );
}
