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
        <p className="text-sm tracking-wide text-purple-500">
          YOUR SCENE
        </p>

        <h2 className="mt-1 text-2xl font-semibold text-zinc-900">
          你现在身处什么场景？
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
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
              className={`rounded-2xl border p-4 text-left transition-all ${
                selected
                  ? "border-purple-500 bg-purple-100 shadow-sm"
                  : "border-zinc-200 bg-white hover:border-purple-300 hover:bg-purple-50"
              }`}
            >
              <div className="font-medium text-zinc-900">
                {SCENE_LABEL[scene]}
              </div>

              <div className="mt-1 text-xs text-zinc-400">
                {selected ? "已选择" : "点击选择"}
              </div>
            </button>
          );
        })}
      </div>

      {!selectedScene && (
        <p className="mt-3 text-sm text-zinc-400">
          请选择一个场景
        </p>
      )}
    </section>
  );
}