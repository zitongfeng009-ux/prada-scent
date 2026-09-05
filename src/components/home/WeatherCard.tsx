import type { EnvironmentInput } from "@/lib/types";

interface WeatherCardProps {
  environment: EnvironmentInput;
}

export default function WeatherCard({
  environment,
}: WeatherCardProps) {
  const weatherEmoji = {
    sunny: "☀️",
    cloudy: "⛅",
    rainy: "🌧️",
    snowy: "🌨️",
    foggy: "🌫️",
    stormy: "⛈️",
  };

  const weatherLabel = {
    sunny: "晴天",
    cloudy: "多云",
    rainy: "下雨",
    snowy: "下雪",
    foggy: "雾天",
    stormy: "暴风雨",
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">当前位置</p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-900">
            📍 {environment.city}
          </h2>
        </div>

        <div className="text-4xl">
          {weatherEmoji[environment.weather]}
        </div>
      </div>

      <div className="flex items-end gap-4">
        <div>
          <span className="text-5xl font-light tracking-tight text-zinc-900">
            {environment.temperature}°
          </span>
          <span className="ml-1 text-zinc-500">C</span>
        </div>

        <div className="pb-1 text-sm text-zinc-500">
          湿度 {environment.humidity}%
        </div>
      </div>

      <p className="mt-4 text-sm text-zinc-600">
        {weatherLabel[environment.weather]}
      </p>
    </div>
  );
}