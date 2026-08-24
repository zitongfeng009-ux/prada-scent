# 给 A 角色（首页 / 定位 / 天气 / 情绪输入）的对接说明

## 你是谁

你负责首页，用户在首页上选择完情绪和场景后，需要把数据传给 B（推荐引擎），B 算完之后跳转到处方页展示结果。

## 你需要做什么

用户在首页操作完后，你需要把以下两组数据打包好，传给 B。

---

## 第一组数据：环境信息（你从天气接口拿到的）

请确保包含以下 6 个字段，一个不能少：

| 字段名 | 含义 | 格式 | 举例 |
|--------|------|------|------|
| city | 城市名 | 中文文字 | "广州" |
| temperature | 当前温度 | 数字（摄氏度） | 28 |
| humidity | 当前湿度 | 数字（百分比） | 75 |
| weather | 天气状况 | 只能是以下 6 个英文词之一 | "rainy" |
| lat | 纬度 | 数字 | 23.13 |
| lng | 经度 | 数字 | 113.26 |

**weather 只能填这 6 个值（必须英文）：**
- sunny = 晴天
- cloudy = 多云
- rainy = 下雨
- snowy = 下雪
- foggy = 雾天
- stormy = 暴风雨

---

## 第二组数据：用户选择（用户在首页选的）

### 情绪（可以选多个，至少选 1 个）

**只能从以下 8 个里选（必须用英文）：**

| 英文值 | 中文含义 | 对应 Emoji |
|--------|---------|-----------|
| happy | 开心 | 😊 |
| calm | 平静 | 😌 |
| irritated | 烦躁 | 😤 |
| anxious | 焦虑 | 😰 |
| sad | 悲伤 | 😢 |
| energetic | 兴奋 | ⚡ |
| tired | 疲惫 | 😴 |
| romantic | 浪漫 | 🌹 |

### 场景（只能选 1 个）

**只能从以下 6 个里选（必须用英文）：**

| 英文值 | 中文含义 |
|--------|---------|
| sleep_relax | 睡前放松 |
| deep_work | 深度高效工作 |
| mercury_reversal | 水逆平复 |
| social_boost | 社交提振 |
| commute_subway | 通勤地铁 |
| outdoor_park | 户外公园 |

### 用户自由倾诉（可选）

用户如果输入了一段文字倾诉，也一起传过来，没有就不传。

---

## 怎么传给 B（已确定：URL 跳转）

A 在首页用户点击「获取今日香笺」按钮后，把数据拼到网址后面，直接跳转到处方页。

### 跳转地址格式

```
/prescription?city=广州&temp=28&humidity=75&weather=rainy&lat=23.13&lng=113.26&emotions=anxious,irritated&scene=deep_work
```

### 每个参数说明

| 参数名 | 对应字段 | 注意 |
|--------|---------|------|
| city | 城市名 | 中文直接写 |
| temp | 温度 | 数字，注意参数名是 temp 不是 temperature |
| humidity | 湿度 | 数字 |
| weather | 天气 | 英文，6 选 1 |
| lat | 纬度 | 数字 |
| lng | 经度 | 数字 |
| emotions | 情绪 | 多个用逗号隔开，如 anxious,irritated |
| scene | 场景 | 英文，6 选 1 |

### A 的代码大概长这样

```javascript
// 用户点击按钮后
const params = new URLSearchParams({
  city: "广州",
  temp: "28",
  humidity: "75",
  weather: "rainy",
  lat: "23.13",
  lng: "113.26",
  emotions: "anxious,irritated",  // 逗号分隔
  scene: "deep_work"
});

// 跳转到处方页
window.location.href = `/prescription?${params.toString()}`;
```

注意：所有值都要转成字符串传给 URLSearchParams，数字也要加引号。

---

## 完整的数据长什么样（给 agent 看的示例）

一个完整的例子，用户在广州，28度下雨，感到焦虑和烦躁，正在工作：

```json
{
  "environment": {
    "city": "广州",
    "temperature": 28,
    "humidity": 75,
    "weather": "rainy",
    "lat": 23.13,
    "lng": 113.26
  },
  "user": {
    "emotions": ["anxious", "irritated"],
    "scene": "deep_work"
  }
}
```

---

## 重要提醒

1. **英文值必须拼写完全一致**，大小写也要一致（全小写）
2. **情绪至少选 1 个**，不然 B 没法算
3. **场景只能选 1 个**
4. weather 只能是那 6 个英文词之一，不能传中文
5. 所有类型定义在 `src/lib/types/index.ts`，你的 agent 可以直接 import 使用
