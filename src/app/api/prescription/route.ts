import { NextRequest, NextResponse } from "next/server";
import { generatePrescription } from "@/lib/engine";
import type { HealingRequest } from "@/lib/types";

/**
 * POST /api/prescription
 *
 * 接收 A 角色的首页输入（环境+用户数据），
 * 返回 B 角色引擎生成的处方结果
 *
 * 这是 B 角色对外暴露的 API 端点
 */
export async function POST(request: NextRequest) {
  try {
    const body: HealingRequest = await request.json();

    // 校验必填字段
    if (!body.environment || !body.user) {
      return NextResponse.json(
        { error: "Missing environment or user data" },
        { status: 400 }
      );
    }

    if (!body.user.emotions || body.user.emotions.length === 0) {
      return NextResponse.json(
        { error: "At least one emotion is required" },
        { status: 400 }
      );
    }

    // 调用推荐引擎
    const prescription = await generatePrescription(body);

    return NextResponse.json(prescription);
  } catch (error) {
    console.error("Prescription generation failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
