"use client";

import type { SceneMode } from "@/lib/types";
import { SCENE_LABEL } from "@/lib/types";

interface SceneSelectorProps {
  selectedScene: SceneMode | null;
  onChange: (scene: SceneMode | null) => void;
}

const scenes: SceneMode[] = [
  "sleep_relax",
  "deep_work",
  "mercury_reversal",
  "social_boost",
  "commute_subway",
  "outdoor_park",
];

export default function SceneSelector({
  selectedScene,
  onChange,
}: SceneSelectorProps) {
  const handleSceneClick = (scene: SceneMode) => {
    // 如果点击的是当前已经选中的场景，则取消选择
    if (selectedScene === scene) {
      onChange(null);
    } else {
      // 如果点击的是其他场景，则切换到这个场景
      onChange(scene);
    }
  };

  return (
    <section className="w-full max-w-2xl">
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">
          你的场景
        </p>

        <h2
          className="mt-2 text-2xl"
          style={{
            color: "#0D0D0D",
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          你现在身处什么场景？
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          选择一个最符合你此刻状态的场景
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {scenes.map((scene) => {
          const selected = selectedScene === scene;

          return (
            <button
              key={scene}
              type="button"
              onClick={() => handleSceneClick(scene)}
              className={`border p-4 text-left transition-colors duration-[400ms] ${
                selected
                  ? "border-[#0D0D0D] bg-[#0D0D0D]"
                  : "border-[rgba(13,13,13,0.12)] bg-transparent hover:border-[#0D0D0D]"
              }`}
              style={{ borderRadius: 2 }}
            >
              <div
                className={`font-medium ${
                  selected ? "text-[#F7F6F2]" : "text-[#0D0D0D]"
                }`}
              >
                {SCENE_LABEL[scene]}
              </div>

              <div
                className={`mt-1 text-[10px] tracking-wider ${
                  selected ? "text-[#F7F6F2]/60" : "text-neutral-400"
                }`}
              >
                {selected ? "已选择" : "点击选择"}
              </div>
            </button>
          );
        })}
      </div>

      {!selectedScene && (
        <p className="mt-3 text-xs tracking-wider text-neutral-400">
          请选择一个场景
        </p>
      )}
    </section>
  );
}