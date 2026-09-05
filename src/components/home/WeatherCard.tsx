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
    <div
      className="w-full max-w-md border border-[rgba(13,13,13,0.08)] p-6 backdrop-blur-md"
      style={{
        background: "rgba(255,255,255,0.5)",
        borderRadius: 2,
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            当前位置
          </p>
          <h2
            className="mt-1 text-2xl"
            style={{
              color: "#0D0D0D",
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
          >
            {environment.city}
          </h2>
        </div>

        <div className="text-4xl">
          {weatherEmoji[environment.weather]}
        </div>
      </div>

      <div className="flex items-end gap-4">
        <div>
          <span
            className="text-5xl font-light tracking-tight"
            style={{
              color: "#0D0D0D",
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
          >
            {environment.temperature}°
          </span>
          <span className="ml-1 text-neutral-500">C</span>
        </div>

        <div className="pb-1 text-sm text-neutral-500">
          湿度 {environment.humidity}%
        </div>
      </div>

      <p className="mt-4 text-sm text-neutral-600">
        {weatherLabel[environment.weather]}
      </p>
    </div>
  );
}