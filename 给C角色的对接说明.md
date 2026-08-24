# 给 C 角色（情绪日记 / 数据可视化 / 香气人格 / 收藏 / 订单 / 隐私）的对接说明

## 你是谁

你负责情绪资产页（/journal）和我的页面（/profile）。你需要从 B（推荐引擎）拿到每次生成的"疗愈处方"数据，用来做日记记录、能量报告、香气人格分析等。

## 你需要知道什么

B 每次推荐完成后，会生成一份完整的"处方"，你拿这份数据来沉淀用户的情绪资产。

---

## B 给你的数据结构（处方 Prescription）

每次用户获得推荐后，B 会生成以下结构的数据。你需要存储和展示它。

### 处方整体结构

| 字段名 | 含义 | 你需要用它做什么 |
|--------|------|-----------------|
| id | 处方唯一编号（如 "rx-1724317600000-a3b2c1"） | 作为日记条目的唯一标识 |
| createdAt | 生成时间（ISO 格式时间戳） | 情绪日历的时间轴 |
| request | 用户的原始输入快照 | 回溯当时的环境和情绪 |
| energyDeviation | 能量偏离度分析 | 热力图、趋势曲线 |
| recommendedFragrances | 推荐的 3 款香水（数组） | 收藏处方、使用轨迹 |
| healingNarrative | 疗愈解说词（完整文案） | 日记内容展示 |
| triMapping | 环境-情绪-香氛三元映射 | 日记可视化 |

---

### 一、原始输入快照（request）

这就是用户当时的环境和情绪状态，和 A 传过来的一模一样：

| 字段 | 含义 | 举例 |
|------|------|------|
| request.environment.city | 城市 | "广州" |
| request.environment.temperature | 温度 | 28 |
| request.environment.humidity | 湿度 | 75 |
| request.environment.weather | 天气（英文） | "rainy" |
| request.user.emotions | 情绪（英文数组） | ["anxious", "irritated"] |
| request.user.scene | 场景（英文） | "deep_work" |

**你可以用这组数据画"天气-情绪-香氛"历史轨迹图。**

---

### 二、能量偏离度（energyDeviation）

这是 B 的 Agent 1 计算出来的能量分析：

| 字段 | 含义 | 取值范围 | 你能用来做什么 |
|------|------|---------|---------------|
| score | 综合偏离度 | 0-100，越大表示身心越不协调 | 能量报告的"失衡指数" |
| environmentEnergy | 环境能量 | 0-100 | 热力图中的环境温度影响 |
| emotionEnergy | 情绪能量 | 0-100 | 情绪波动曲线 |
| sceneEnergy | 场景能量 | 0-100（固定值） | 对比用户实际状态和场景需求 |
| hasConflict | 是否存在冲突 | true / false | 标记"冲突日" |
| conflictDescription | 冲突描述 | 中文文字 | 日记中的备注说明 |

**你的周度/月度能量报告可以用 score 做趋势线，用 environmentEnergy 和 emotionEnergy 做双轴对比图。**

---

### 三、推荐香水列表（recommendedFragrances）

B 会返回按匹配度排序的 3 款香水，每款包含：

| 字段 | 含义 | 举例 |
|------|------|------|
| id | 香水唯一 ID | "prada-paradoxe" |
| brand | 品牌 | "Prada" |
| name | 产品名 | "Prada Paradoxe" |
| collection | 系列 | "Paradoxe" |
| family | 香调家族 | "floral"（花香调）|
| notes.top | 前调（数组） | ["Neroli", "Bergamot"] |
| notes.heart | 中调（数组） | ["Jasmine Sambac"] |
| notes.base | 后调（数组） | ["Vanilla", "White Musk"] |
| story | 香水故事 | 中文描述文字 |
| imageUrl | 产品图片路径 | "/fragrances/prada-paradoxe.jpg" |
| purchaseUrl | 购买链接 | "/buy/prada-paradoxe" |

**你的"香氛使用轨迹"可以用这些数据显示用户用过哪些香水。"收藏处方"需要存储完整信息。"试香订单"用 id 和 purchaseUrl 做购买跳转。**

**family 可能的值（8 种）：**
- citrus = 柑橘调
- floral = 花香调
- woody = 木质调
- oriental = 东方调
- fresh = 清新调
- aromatic = 芳香调
- chypre = 西普调
- fougere = 馥奇调

---

### 四、疗愈解说词（healingNarrative）

这是 B 的 Agent 2 生成的个性化文案：

| 字段 | 含义 | 你能用来做什么 |
|------|------|---------------|
| todayStatus | 今日状态描述（一段中文） | 日记的"今日摘要" |
| scentCombination | 香气组合说明 | 日记详情展示 |
| usageGuide | 使用方式建议 | 日记详情展示 |
| meditationGuide | 冥想引导文案 | 日记中可回听冥想 |
| emotionalGuidance | 情绪引导语 | 日记的"情绪寄语" |
| commercialCTA | 商业推荐（见下方） | 试香订单入口 |

**commercialCTA 结构：**

| 字段 | 含义 | 可能的值 |
|------|------|---------|
| label | 按钮文字 | "探索 Prada Paradoxe" |
| fragranceId | 推荐的香水 ID | "prada-paradoxe" |
| type | 商业动作类型 | 见下方 |

**type 只能是这 4 种之一：**
- buy_trial = 购买试香装
- buy_full = 购买正装
- subscribe = 订阅替换芯
- gift_box = 定制礼盒

---

### 五、三元映射（triMapping）

环境-情绪-香氛的三角关系数据：

| 字段 | 含义 | 举例 |
|------|------|------|
| triMapping.environment.label | 环境标签 | "广州 28℃ 🌧️" |
| triMapping.environment.energy | 环境能量值 | 45 |
| triMapping.environment.factors | 影响因素列表 | ["温度28℃", "湿度75%", "深度高效工作"] |
| triMapping.emotion.label | 情绪标签 | "焦虑·烦躁" |
| triMapping.emotion.energy | 情绪能量值 | 25 |
| triMapping.emotion.factors | 情绪详情 | ["焦虑 😰", "烦躁 😤"] |
| triMapping.fragrance.label | 推荐香水名 | "Prada Paradoxe" |
| triMapping.fragrance.energy | 香水能量值 | 35 |
| triMapping.fragrance.factors | 香调信息 | ["花香调", "前调: Neroli, Bergamot", "基调: Vanilla, White Musk"] |

**你可以在日记中复用这个三元映射做可视化展示。**

---

## 你的"香气人格"功能怎么用这些数据

用户的"香水人格"（类似 MBTI）可以基于以下维度分析：

| 分析维度 | 数据来源 | 怎么算 |
|---------|---------|--------|
| 偏好香调 | 多次推荐的 fragrances.family | 统计出现最多的 family |
| 情绪倾向 | 多次记录的 emotions | 统计最常见的情绪组合 |
| 场景偏好 | 多次记录的 scene | 统计最常用的场景 |
| 能量模式 | 多次记录的 energyDeviation.score | 平均值 + 波动范围 |
| 环境敏感度 | environmentEnergy 与 emotionEnergy 的关系 | 是否容易受天气影响 |

---

## 重要提醒

1. **所有英文枚举值必须完全匹配**（全小写，下划线分隔）
2. **情绪 8 种**：happy, calm, irritated, anxious, sad, energetic, tired, romantic
3. **场景 6 种**：sleep_relax, deep_work, mercury_reversal, social_boost, commute_subway, outdoor_park
4. **天气 6 种**：sunny, cloudy, rainy, snowy, foggy, stormy
5. **香调 8 种**：citrus, floral, woody, oriental, fresh, aromatic, chypre, fougere
6. 所有类型定义在 `src/lib/types/index.ts`，你的 agent 可以直接 import 使用
7. 当前数据用本地 JSON 模拟，后续迁移 Supabase 时表结构按上述字段设计即可
