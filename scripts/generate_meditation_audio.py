#!/usr/bin/env python3
"""
冥想引导音频生成脚本
使用微软 Edge 神经网络语音（zh-CN-XiaoxiaoNeural 晓晓，免费）预生成中文冥想引导音频。

音频结构（拼接播放，与 agent2.ts 引导词模板保持一致）：
  情绪开头 emotion_{emotion}.mp3  —— "闭上眼睛，带着此刻的XX。"
  香型场景 family_{family}.mp3    —— "想象……"（完整场景描述）

运行：python3 scripts/generate_meditation_audio.py
输出：public/meditation/*.mp3
"""

import asyncio
from pathlib import Path

import edge_tts

# 晓晓：微软最自然的中文女声，温柔，适合冥想引导
VOICE = "zh-CN-XiaoxiaoNeural"
# 放慢语速，营造冥想节奏
RATE = "-25%"
# 略降音调，更沉稳
PITCH = "-4Hz"

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "public" / "meditation"

# ─── 情绪开头（与 agent2.ts emotionLabel 映射一致）──────────────
EMOTION_OPENINGS = {
    "happy": "闭上眼睛，带着此刻的愉悦。",
    "calm": "闭上眼睛，带着此刻的平和。",
    "irritated": "闭上眼睛，带着此刻的烦躁。",
    "anxious": "闭上眼睛，带着此刻的不安。",
    "sad": "闭上眼睛，带着此刻的忧伤。",
    "energetic": "闭上眼睛，带着此刻的活力。",
    "tired": "闭上眼睛，带着此刻的疲倦。",
    "romantic": "闭上眼睛，带着此刻的柔情。",
}

# ─── 香型场景（与 agent2.ts guides 模板一致，从"想象"开始）─────
FAMILY_SCENES = {
    "citrus": (
        "想象一道清澈的光从头顶倾泻而下，如同清晨第一缕阳光穿透水晶棱镜，"
        "在空气中折射出无数细小的光点。每一次呼吸，这些光点都在洗涤你的思绪，"
        "留下一片澄明。吸气 4 秒，屏息 4 秒，呼气 6 秒，"
        "让柑橘的清新分子唤醒每一个细胞。"
    ),
    "floral": (
        "想象你正漫步在一座盛放的花园中——玫瑰、鸢尾、橙花在脚下铺展开来。"
        "微风拂过，花瓣轻旋，每一次呼吸都将花香收入心底。放慢脚步，"
        "允许自己被这片柔软包围。吸气 4 秒，屏息 4 秒，呼气 6 秒，"
        "感受紧绷在花香中一点点消融。"
    ),
    "woody": (
        "想象你正走进一片古老的森林，脚下是松软的苔藓与落叶，"
        "头顶是层层叠叠的树冠。阳光从枝叶间洒落，形成一道道温暖的光柱。"
        "你的双脚稳稳地踩在大地上，每一次呼气都让你扎得更深。"
        "吸气 4 秒，屏息 4 秒，呼气 6 秒，感受大地的沉稳从脚底升起。"
    ),
    "oriental": (
        "想象一团温暖的琥珀色光芒从心口缓缓升起，如同被最柔软的面料轻轻包裹。"
        "空气中弥漫着香草与树脂的暖意，每一次呼吸都让这份温暖向四周扩散。"
        "允许自己感受这份安全——你值得被温柔以待。"
        "吸气 4 秒，屏息 4 秒，呼气 6 秒，让温暖渗透每一寸肌肤。"
    ),
    "fresh": (
        "想象你正漫步在一场温柔的细雨中，雨丝轻触面颊，空气清透如洗。"
        "每一滴雨水都在带走疲惫与杂念，留下的是雨后泥土与青草的清新。"
        "深呼吸，让这份洁净贯穿全身。吸气 4 秒，屏息 4 秒，呼气 6 秒，"
        "感受身心如雨洗般澄净。"
    ),
    "aromatic": (
        "想象你正站在一片辽阔的海岸线上，海浪有节奏地涌来又退去。"
        "海风带着咸湿的清新拂过面颊，每一次潮起潮落都在带走紧绷，带入宁静。"
        "让呼吸与海浪同频——吸气时海浪涌来，呼气时海浪退去。"
        "重复三次，感受焦虑如退潮般消散。"
    ),
    "chypre": (
        "想象你正赤脚走在一片湿润的森林苔藓上，脚下是柔软而厚实的大地。"
        "空气中弥漫着橡木苔与广藿香的泥土气息，头顶是参天古木交织的绿色穹顶。"
        "每一次呼气，你都与这片大地连接得更深。"
        "吸气 4 秒，屏息 4 秒，呼气 6 秒，感受根基从脚底向下延伸。"
    ),
    "fougere": (
        "想象你正站在一片雨后的草地上，空气中弥漫着薰衣草与香豆素的清甜。"
        "远处的山峦在薄雾中若隐若现，脚下的青草沾满了露珠。"
        "每一次呼吸都是大自然的馈赠，清新而治愈。"
        "吸气 4 秒，屏息 4 秒，呼气 6 秒，让草本的芬芳唤醒内在的宁静。"
    ),
}


async def generate(text: str, out_path: Path) -> None:
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(str(out_path))
    size_kb = out_path.stat().st_size / 1024
    print(f"  ✓ {out_path.name} ({size_kb:.0f} KB)")


async def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"输出目录：{OUTPUT_DIR}\n")

    print("[1/2] 生成情绪开头音频（8 个）…")
    for emotion, text in EMOTION_OPENINGS.items():
        await generate(text, OUTPUT_DIR / f"emotion_{emotion}.mp3")

    print("\n[2/2] 生成香型场景音频（8 个）…")
    for family, text in FAMILY_SCENES.items():
        await generate(text, OUTPUT_DIR / f"family_{family}.mp3")

    total = sum(f.stat().st_size for f in OUTPUT_DIR.glob("*.mp3")) / 1024
    print(f"\n完成！共 16 个文件，总计 {total:.0f} KB")


if __name__ == "__main__":
    asyncio.run(main())
