import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // =========================
    // 1. 获取经纬度
    // =========================

    const { searchParams } = new URL(request.url);

    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json(
        {
          error: "缺少纬度或经度",
        },
        { status: 400 }
      );
    }

    // =========================
    // 2. 调用 Open-Meteo 获取天气
    // =========================

    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${encodeURIComponent(lat)}` +
      `&longitude=${encodeURIComponent(lng)}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code`;

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error("Open-Meteo 请求失败");
    }

    const weatherData = await weatherResponse.json();

    // =========================
    // 3. Open-Meteo 天气代码转换
    // =========================

    const weatherCode = weatherData.current.weather_code;

    let weather = "cloudy";

    if (weatherCode === 0) {
      weather = "sunny";
    } else if (
      weatherCode === 1 ||
      weatherCode === 2 ||
      weatherCode === 3
    ) {
      weather = "cloudy";
    } else if (
      weatherCode === 45 ||
      weatherCode === 48
    ) {
      weather = "foggy";
    } else if (
      weatherCode >= 51 &&
      weatherCode <= 67
    ) {
      weather = "rainy";
    } else if (
      weatherCode >= 71 &&
      weatherCode <= 77
    ) {
      weather = "snowy";
    } else if (
      weatherCode >= 80 &&
      weatherCode <= 82
    ) {
      weather = "rainy";
    } else if (
      weatherCode >= 95 &&
      weatherCode <= 99
    ) {
      weather = "stormy";
    }

    // =========================
    // 4. 返回天气数据
    // =========================

    return NextResponse.json({
      temperature: weatherData.current.temperature_2m,
      humidity: weatherData.current.relative_humidity_2m,
      weather,
    });
  } catch (error) {
    console.error("Weather API Error:", error);

    return NextResponse.json(
      {
        error: "获取天气失败",
      },
      { status: 500 }
    );
  }
}