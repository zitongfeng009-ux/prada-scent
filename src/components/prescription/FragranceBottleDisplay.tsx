"use client";

import { useState } from "react";
import type { FragranceSKU } from "@/lib/types";

/**
 * 香水瓶展示组件
 * 展示真实产品图片 + 点击跳转 Prada 官网 + 翻转查看香调
 */
export function FragranceBottleDisplay({
  fragrance,
  rank,
}: {
  fragrance: FragranceSKU;
  rank: number;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const hasImage = fragrance.imageUrl.startsWith("http");

  const familyGradient: Record<string, string> = {
    citrus: "linear-gradient(180deg, #F5E6A3 0%, #E8D48B 50%, #D4B85C 100%)",
    floral: "linear-gradient(180deg, #F2D5D0 0%, #E3BDB0 50%, #D4A090 100%)",
    woody: "linear-gradient(180deg, #D4C5A9 0%, #B8A88A 50%, #9C8B6E 100%)",
    oriental: "linear-gradient(180deg, #D49B5B 0%, #C08545 50%, #A06E30 100%)",
    fresh: "linear-gradient(180deg, #C8E6D0 0%, #A8D4B8 50%, #88C0A0 100%)",
    aromatic: "linear-gradient(180deg, #A4B0C0 0%, #8A9AB0 50%, #7088A0 100%)",
    chypre: "linear-gradient(180deg, #C4C4B0 0%, #A8A890 50%, #8C8C70 100%)",
    fougere: "linear-gradient(180deg, #B0C4A8 0%, #98B090 50%, #809878 100%)",
  };

  return (
    <div className="relative group">
      {/* 排名标签 */}
      <div className="absolute top-0 left-0 z-10">
        <span
          className="text-[9px] uppercase tracking-[0.2em] px-2 py-1"
          style={{
            background: rank === 1 ? "#0D0D0D" : "transparent",
            color: rank === 1 ? "#F7F6F2" : "#0D0D0D",
            border:
              rank === 1 ? "none" : "1px solid rgba(13,13,13,0.2)",
          }}
        >
          第{rank}推荐
        </span>
      </div>

      {/* 可翻转卡片 */}
      <div
        className="relative cursor-pointer transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* 正面 — 产品图片 */}
        <div
          className="relative"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* 产品图片区域 */}
          <div
            className="relative overflow-hidden"
            style={{
              background: hasImage
                ? "#F7F6F2"
                : familyGradient[fragrance.family] || familyGradient.floral,
              borderRadius: "2px",
              border: "1px solid rgba(13,13,13,0.06)",
              aspectRatio: "3/4",
            }}
          >
            {hasImage ? (
              <img
                src={fragrance.imageUrl}
                alt={fragrance.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                style={{ padding: "12px" }}
              />
            ) : (
              /* CSS 瓶身回退（无图片时） */
              <div className="flex flex-col items-center justify-center h-full">
                <div
                  className="w-6 h-8"
                  style={{
                    background: "linear-gradient(180deg, #C4C4C4 0%, #A0A0A0 100%)",
                    borderRadius: "2px 2px 0 0",
                  }}
                />
                <div
                  className="w-4 h-3"
                  style={{
                    background: "linear-gradient(180deg, rgba(200,200,200,0.3) 0%, rgba(200,200,200,0.1) 100%)",
                  }}
                />
                <div
                  className="w-28 h-40 flex items-center justify-center"
                  style={{
                    background: familyGradient[fragrance.family] || familyGradient.floral,
                    borderRadius: "2px",
                  }}
                >
                  <span className="text-[8px] uppercase tracking-[0.2em] text-white/80">
                    {fragrance.brand}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 产品名 */}
          <div className="text-center mt-4 px-2">
            <h4
              className="text-xs tracking-[0.08em] mb-1"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            >
              {fragrance.name}
            </h4>
            <p className="text-[9px] uppercase tracking-[0.15em] text-neutral-400">
              {fragrance.collection}
            </p>
          </div>
        </div>

        {/* 背面 — 香调详情 */}
        <div
          className="absolute inset-0 px-4 py-6 flex flex-col justify-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "rgba(247,246,242,0.98)",
            border: "1px solid rgba(13,13,13,0.08)",
            borderRadius: "2px",
          }}
        >
          <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-4 text-center">
            香调金字塔
          </p>

          {/* 前调 */}
          <div className="mb-3">
            <p className="text-[8px] uppercase tracking-[0.15em] text-neutral-400 mb-1">
              前调
            </p>
            <p className="text-[10px] text-neutral-700">
              {fragrance.notes.top.join(" · ")}
            </p>
          </div>

          {/* 中调 */}
          <div className="mb-3">
            <p className="text-[8px] uppercase tracking-[0.15em] text-neutral-400 mb-1">
              中调
            </p>
            <p className="text-[10px] text-neutral-700">
              {fragrance.notes.heart.join(" · ")}
            </p>
          </div>

          {/* 基调 */}
          <div className="mb-4">
            <p className="text-[8px] uppercase tracking-[0.15em] text-neutral-400 mb-1">
              后调
            </p>
            <p className="text-[10px] text-neutral-700">
              {fragrance.notes.base.join(" · ")}
            </p>
          </div>

          {/* 香水故事 */}
          <div
            className="pt-3"
            style={{ borderTop: "1px solid rgba(13,13,13,0.08)" }}
          >
            <p
              className="text-[9px] leading-relaxed text-neutral-500 italic"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            >
              {fragrance.story}
            </p>
          </div>
        </div>
      </div>

      {/* 底部操作区 */}
      <div className="flex flex-col items-center gap-2 mt-2">
        <p className="text-[8px] text-neutral-300 tracking-wider">
          点击查看香调
        </p>
        {/* 点击跳转 Prada 官网 */}
        <a
          href={fragrance.purchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[8px] uppercase tracking-[0.15em] px-3 py-1.5 transition-all duration-400"
          style={{
            background: "#0D0D0D",
            color: "#F7F6F2",
            borderRadius: "0px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#F7F6F2";
            e.currentTarget.style.color = "#0D0D0D";
            e.currentTarget.style.border = "1px solid #0D0D0D";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#0D0D0D";
            e.currentTarget.style.color = "#F7F6F2";
            e.currentTarget.style.border = "none";
          }}
          onClick={(e) => e.stopPropagation()}
        >
          前往 Prada 官网购买
        </a>
      </div>
    </div>
  );
}
