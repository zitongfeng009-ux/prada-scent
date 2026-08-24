"use client";

import { useState } from "react";
import type { Prescription, TriMapping } from "@/lib/types";

/**
 * 三元映射可视化组件
 * 环境-情绪-香氛 三角关系图
 */
export function TriMappingChart({ mapping }: { mapping: TriMapping }) {
  const [hoveredNode, setHoveredNode] = useState<
    "environment" | "emotion" | "fragrance" | null
  >(null);

  const nodes = [
    {
      key: "environment" as const,
      label: "环境",
      sublabel: mapping.environment.label,
      energy: mapping.environment.energy,
      factors: mapping.environment.factors,
      x: 50,
      y: 8,
      color: "#A4B0C0", // Cold Iris
    },
    {
      key: "emotion" as const,
      label: "情绪",
      sublabel: mapping.emotion.label,
      energy: mapping.emotion.energy,
      factors: mapping.emotion.factors,
      x: 12,
      y: 78,
      color: "#E3BDB0", // Sheer Rose
    },
    {
      key: "fragrance" as const,
      label: "香氛",
      sublabel: mapping.fragrance.label,
      energy: mapping.fragrance.energy,
      factors: mapping.fragrance.factors,
      x: 88,
      y: 78,
      color: "#D49B5B", // Warm Amber
    },
  ];

  return (
    <div className="relative w-full aspect-square max-w-[400px] mx-auto">
      {/* SVG 连线 */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      >
        {/* 三角形连线 */}
        <line
          x1={nodes[0].x}
          y1={nodes[0].y}
          x2={nodes[1].x}
          y2={nodes[1].y}
          stroke="#C4C4C4"
          strokeWidth="0.3"
          strokeDasharray="1,1"
        />
        <line
          x1={nodes[1].x}
          y1={nodes[1].y}
          x2={nodes[2].x}
          y2={nodes[2].y}
          stroke="#C4C4C4"
          strokeWidth="0.3"
          strokeDasharray="1,1"
        />
        <line
          x1={nodes[2].x}
          y1={nodes[2].y}
          x2={nodes[0].x}
          y2={nodes[0].y}
          stroke="#C4C4C4"
          strokeWidth="0.3"
          strokeDasharray="1,1"
        />
      </svg>

      {/* 节点 */}
      {nodes.map((node) => (
        <div
          key={node.key}
          className="absolute flex flex-col items-center cursor-pointer transition-all duration-500"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 1,
          }}
          onMouseEnter={() => setHoveredNode(node.key)}
          onMouseLeave={() => setHoveredNode(null)}
        >
          {/* 能量圆环 */}
          <div
            className="relative w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-500"
            style={{
              borderColor: node.color,
              background:
                hoveredNode === node.key
                  ? `${node.color}15`
                  : "transparent",
            }}
          >
            {/* 能量值 */}
            <span
              className="text-xs font-light tracking-widest"
              style={{ color: node.color }}
            >
              {node.energy}
            </span>
          </div>

          {/* 标签 */}
          <span
            className="mt-2 text-[10px] uppercase tracking-[0.15em] font-medium"
            style={{ color: "#0D0D0D" }}
          >
            {node.label}
          </span>
          <span className="mt-0.5 text-[9px] text-neutral-500 text-center max-w-[100px] truncate">
            {node.sublabel}
          </span>

          {/* 悬浮详情 */}
          {hoveredNode === node.key && (
            <div
              className="absolute top-full mt-2 px-3 py-2 text-[9px] leading-relaxed whitespace-nowrap"
              style={{
                background: "rgba(247,246,242,0.95)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(13,13,13,0.1)",
                zIndex: 10,
              }}
            >
              {node.factors.map((f, i) => (
                <div key={i} className="text-neutral-600">
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
