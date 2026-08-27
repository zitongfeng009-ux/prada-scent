# Prada Scent Companion — 三人协作开发指南

> 以香气为媒介的每日生活仪式。结合环境感知（天气/位置）、情绪场景与 AI 大模型的智能香氛伴侣。

**线上地址**: https://prada-scent-gamma.vercel.app
**GitHub 仓库**: https://github.com/zitongfeng009-ux/prada-scent

---

## 一、整体架构

```
┌──────────────────────────────────────────────────────────────────┐
│                        用户每日旅程                                │
│                                                                  │
│  ┌─────────┐     ┌──────────────┐     ┌──────────┐     ┌────── │
│  │  A 首页  │────>│  B 处方页     │────>│  C 日记页  │────>│ 报告  │ │
│  │ 感知输入  │     │ 推荐引擎      │     │ 情绪资产   │     │ 分析  │ │
│  ─────────┘     └──────────────     └──────────┘     └──────┘ │
│       │                  │                    │                   │
│  天气/情绪/场景      香氛匹配+故事生成      历史沉淀+可视化         │
│  (URL 参数传递)      (本地引擎计算)        (localStorage/Supabase) │
└──────────────────────────────────────────────────────────────────┘
```

### 数据流向

```
用户输入 ──A──> URL 参数 ──> B 处方页解析 ──> 推荐引擎计算 ──> 处方数据 ──> C 存储展示
  │                                              │
  ├─ 城市/温度/湿度/天气                              ├─ 3 款推荐香水
  ├─ 情绪（1-8 种）                                  ├─ 三元映射快照
  └─ 场景（6 选 1）                                  ├─ 能量偏离度
                                                    └─ 疗愈文案（故事+冥想）
```

### 路由与负责人

| 路由 | 页面 | 负责人 | 状态 |
|------|------|--------|------|
| `/` | 首页（感知与输入） | **A** | 🔲 待开发 |
| `/prescription` | 处方页（疗愈结果） | **B** | ✅ 已完成 |
| `/journal` | 情绪资产（日记/报告） | **C** | 🔲 待开发 |
| `/profile` | 我的（偏好/收藏/订单） | **C** | 🔲 待开发 |
| `/api/prescription` | 处方 API 端点 | **B** | ✅ 已完成 |

---

## 二、各角色职责与模块清单

### A 角色 — Environment & Input Engineer

**负责模块**：`/` 首页

- [ ] 定位获取（浏览器 Geolocation API 或 LBS）
- [ ] 天气集成（调用天气 API 获取实时数据）
- [ ] 场景选择器（6 种场景，带图标）
- [ ] 情绪关键词选择器（8 种情绪 + Emoji）
- [ ] 用户自由文本倾诉（可选输入框）
- [ ] 「获取今日香笺」按钮 → 拼接 URL 参数跳转到处方页
- [ ] 可选：用户输入校验（情绪至少 1 个、场景必须选 1 个）

**不要修改**：`/prescription` 页面、`src/lib/engine/` 推荐引擎、`src/components/prescription/` 组件

---

### B 角色 — Fragrance Intelligence & Experience Engineer（已完成）

**负责模块**：`/prescription` 处方页 + 推荐引擎

- ✅ 推荐引擎核心（天气 + 场景 + 情绪 → 多源能量偏离度计算）
- ✅ Prada 香氛知识库（13 款真实产品，含前中后调、挥发度、温度适应性）
- ✅ 疗愈叙事生成（四种文学体裁故事轮换：童话/神话/小说/散文诗）
- ✅ 情绪解析（48 种情绪×天气组合的比喻式解读）
- ✅ 三元映射可视化（环境-情绪-香氛三角图）
- ✅ 冥想播放器（微软晓晓中文语音引导 + 氛围音效）
- ✅ 真实产品图片（Prada CDN）+ 官网购买链接
- ✅ 三者契合度（最低 50% 规则）

---

### C 角色 — User Asset & Data Engineer

**负责模块**：`/journal` 情绪日记 + `/profile` 我的

- [ ] 情绪日记列表（读取 localStorage 中的处方历史）
- [ ] 单条日记详情（复用三元映射可视化 + 疗愈文案展示）
- [ ] 能量趋势图（周度/月度 score 曲线，双轴对比 environmentEnergy vs emotionEnergy）
- [ ] 热力图（x 轴=日期，y 轴=场景，颜色深度=score）
- [ ] 香气人格分析（基于历史推荐数据计算用户偏好画像）
- [ ] 收藏处方功能
- [ ] 试香订单跳转（通过 commercialCTA 的 purchaseUrl）
- [ ] 隐私与数据管理（清除本地数据、导出等）

**不要修改**：`/prescription` 页面、`src/lib/engine/` 推荐引擎

---

## 三、数据接口规范

### A → B：URL 参数传递

A 在用户点击「获取今日香笺」后，拼接以下参数跳转到处方页：

```
/prescription?city=广州&temp=28&humidity=75&weather=rainy&lat=23.13&lng=113.26&emotions=anxious,irritated&scene=deep_work
```

#### 参数说明

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `city` | string | ✅ | 城市名（中文） | `"广州"` |
| `temp` | string | ✅ | 温度（摄氏度） | `"28"` |
| `humidity` | string | ✅ | 湿度（百分比 0-100） | `"75"` |
| `weather` | string | ✅ | 天气（6 选 1，英文小写） | `"rainy"` |
| `lat` | string | ✅ | 纬度 | `"23.13"` |
| `lng` | string | ✅ | 经度 | `"113.26"` |
| `emotions` | string | ✅ | 情绪（逗号分隔，至少 1 个） | `"anxious,irritated"` |
| `scene` | string | ✅ | 场景（6 选 1，英文小写） | `"deep_work"` |

> ⚠️ **重要**：中文城市名必须用 `encodeURIComponent()` 编码，否则 Vercel 构建会失败。

#### A 的代码示例

```javascript
// 用户点击按钮后
const params = new URLSearchParams({
  city: encodeURIComponent("广州"),   // 中文必须编码！
  temp: "28",
  humidity: "75",
  weather: "rainy",
  lat: "23.13",
  lng: "113.26",
  emotions: "anxious,irritated",     // 逗号分隔，不要空格
  scene: "deep_work"
});

window.location.href = `/prescription?${params.toString()}`;
```

#### 枚举值速查表

**weather（6 种）**：`sunny` 晴 | `cloudy` 多云 | `rainy` 雨 | `snowy` 雪 | `foggy` 雾 | `stormy` 暴风雨

**emotions（8 种）**：`happy` 😊 | `calm` 😌 | `irritated`  | `anxious` 😰 | `sad` 😢 | `energetic` ⚡ | `tired` 😴 | `romantic` 

**scene（6 种）**：`sleep_relax` 睡前放松 | `deep_work` 深度工作 | `mercury_reversal` 水逆平复 | `social_boost` 社交提振 | `commute_subway` 通勤地铁 | `outdoor_park` 户外公园

---

### B → C：Prescription 数据结构

B 每次生成处方后，数据会存入 `localStorage`（key: `prada-prescriptions`），C 从中读取。

#### 处方整体结构

```typescript
interface Prescription {
  id: string;                    // 唯一 ID，如 "rx-1724317600000-a3b2c1"
  createdAt: string;             // ISO 8601 时间戳
  request: HealingRequest;       // 原始输入快照
  energyDeviation: EnergyDeviation; // 能量偏离度
  recommendedFragrances: FragranceSKU[]; // Top 3 推荐香水
  healingNarrative: HealingNarrative;    // 疗愈文案
  triMapping: TriMappingSnapshot;        // 三元映射快照
}
```

#### energyDeviation（能量偏离度）

| 字段 | 类型 | 范围 | C 的用途 |
|------|------|------|---------|
| `score` | number | 0-100 | 能量报告主指标，越大越不协调 |
| `environmentEnergy` | number | 0-100 | 双轴对比图的环境能量线 |
| `emotionEnergy` | number | 0-100 | 情绪波动曲线 |
| `sceneEnergy` | number | 0-100 | 场景需求能量 |
| `hasConflict` | boolean | true/false | 标记冲突日 |
| `conflictDescription` | string | 中文 | 日记备注说明 |

#### recommendedFragrances（推荐香水）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | SKU 唯一 ID，如 `"prada-paradoxe"` |
| `brand` | string | 品牌，如 `"Prada"` |
| `name` | string | 产品名，如 `"Prada Paradoxe"` |
| `collection` | string | 系列名 |
| `family` | string | 香调家族（8 种之一，见下方） |
| `notes.top` | string[] | 前调 |
| `notes.heart` | string[] | 中调 |
| `notes.base` | string[] | 后调 |
| `story` | string | 香水故事（中文） |
| `imageUrl` | string | 产品图片路径 |
| `purchaseUrl` | string | 购买链接 |

**family 枚举（8 种）**：`citrus` 柑橘调 | `floral` 花香调 | `woody` 木质调 | `oriental` 东方调 | `fresh` 清新调 | `aromatic` 芳香调 | `chypre` 西普调 | `fougere` 馥奇调

#### healingNarrative（疗愈文案）

| 字段 | 说明 | C 的用途 |
|------|------|---------|
| `todayStatus` | 今日状态描述 | 日记摘要 |
| `scentCombination` | 香气组合说明 | 日记详情 |
| `usageGuide` | 使用方式建议 | 日记详情 |
| `meditationGuide` | 冥想引导文案 | 冥想回听 |
| `emotionalGuidance` | 情绪引导语 | 每日金句 |
| `commercialCTA.label` | 按钮文字 | 试香订单入口 |
| `commercialCTA.fragranceId` | 香水 ID | 订单关联 |
| `commercialCTA.type` | 商业类型 | `buy_trial` / `buy_full` / `subscribe` / `gift_box` |

#### triMapping（三元映射）

```
环境 ──energy──> 情绪 ──energy──> 香氛
  │                │                │
  label            label            label
  factors          factors          factors
```

每个节点包含：`label`（展示标签）、`energy`（能量值 0-100）、`factors`（影响因素数组）

---

## 四、Git 分支策略与合并流程

### 分支结构

```
main                    ← 稳定版本（线上生产环境）
  └─ develop            ← 开发主线（集成测试）
       ├─ feature/a-homepage      ← A 负责
       ├─ feature/b-prescription  ← B 负责（已完成）
       └─ feature/c-journal       ← C 负责
```

### 合并流程（每人相同）

```
1. 从 develop 创建自己的 feature 分支
   git checkout develop
   git pull origin develop
   git checkout -b feature/a-homepage    # 或 feature/c-journal

2. 在自己的分支上开发、提交
   git add -A
   git commit -m "feat: 描述你的改动"

3. 开发完成后，合并回 develop
   git checkout develop
   git pull origin develop               # 先拉最新，解决可能的冲突
   git merge feature/a-homepage --no-ff
   git push origin develop

4. 测试通过后，合并到 main 触发线上部署
   git checkout main
   git pull origin main
   git merge develop --no-ff
   git push origin main
```

### 冲突预防规则

1. **各改各的文件**：A 改 `src/app/page.tsx` 和首页相关组件，C 改 `src/app/journal/` 和 `src/app/profile/`，B 改 `src/lib/engine/` 和 `src/components/prescription/`
2. **合并前先 pull**：每次合并前必须 `git pull origin develop`
3. **不要直接改 main**：所有改动先走 develop
4. **提交信息要清晰**：用 `feat:` / `fix:` / `docs:` 前缀

### 类型定义共享

所有共享类型定义在 `src/lib/types/index.ts`，A 和 C 可以直接 import 使用，不要重复定义。

---

## 五、Vercel 部署与监控

### 线上地址

| 环境 | 地址 | 说明 |
|------|------|------|
| **生产环境** | https://prada-scent-gamma.vercel.app | 合并到 main 后自动部署 |
| **GitHub 仓库** | https://github.com/zitongfeng009-ux/prada-scent | 代码托管 |

### 部署触发规则

- 推送到 `main` 分支 → 自动触发生产环境部署
- 推送到 `develop` 分支 → 自动触发预览环境部署
- 部署通常需要 1-2 分钟

### 部署状态检查

1. **查看部署历史**：https://vercel.com/perfume8/prada-scent/deployments
   - 绿色 ✅ = 部署成功
   - 红色 ❌ = 构建失败（点击看 Logs 排查）

2. **查看实时日志**：在 Deployments 页面点击某条记录 → Logs 标签页

3. **常见构建失败原因**：
   - TypeScript 类型错误 → 本地先跑 `npm run build` 验证
   - 中文 URL 参数未编码 → 用 `encodeURIComponent()`
   - 缺少依赖 → 确保 `npm install` 后提交

### 本地开发验证

```bash
# 克隆项目
git clone git@github.com:zitongfeng009-ux/prada-scent.git
cd prada-scent

# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 打开 http://localhost:3000

# 测试处方页（模拟 A 的跳转）
# http://localhost:3000/prescription?city=上海&temp=28&humidity=65&weather=sunny&scene=deep_work&emotions=anxious

# 构建验证（推送前必跑）
npm run build
```

---

## 六、UI 设计规范

| 项目 | 规范 |
|------|------|
| **主色** | Prada Black `#0D0D0D` |
| **背景** | Prada Off-White `#F7F6F2` |
| **强调色** | Prada Mint `#C8D6AF` |
| **标题字体** | Bodoni / Didot（衬线体） |
| **正文字体** | Inter（无衬线体） |
| **故事字体** | Georgia / Times New Roman（衬线体，斜体） |
| **风格** | 极简、冷感优雅、几何线条、大量留白 |
| **按钮** | 0px 圆角、全大写、宽字距 |
| **语言** | 全中文界面（枚举值用英文） |

---

## 七、快速开始（给 A 和 C）

### 第 1 步：克隆仓库

```bash
git clone git@github.com:zitongfeng009-ux/prada-scent.git
cd prada-scent
```

### 第 2 步：安装依赖 & 启动

```bash
npm install
npm run dev
```

打开 http://localhost:3000 查看当前效果（会跳转到 B 的处方页）。

### 第 3 步：创建你的分支

```bash
# A 角色
git checkout -b feature/a-homepage

# C 角色
git checkout -b feature/c-journal
```

### 第 4 步：开始开发

- A：修改 `src/app/page.tsx` 做首页，完成后跳转到处方页
- C：创建 `src/app/journal/page.tsx` 做日记页，从 localStorage 读取处方数据

### 第 5 步：推送 & 合并

```bash
git add -A
git commit -m "feat: 你的改动描述"
git push origin feature/a-homepage    # 或 feature/c-journal
# 然后按上面的合并流程合并到 develop → main
```

---

## 八、对接文档索引

| 文档 | 内容 | 读者 |
|------|------|------|
| 本文档 | 三人协作总览 | A + B + C |
| `给A角色的对接说明.md` | A→B 接口详细规范 | A |
| `给C角色的对接说明.md` | B→C 数据结构详细规范 | C |
| `src/lib/types/index.ts` | 所有 TypeScript 类型定义 | A + C |

---

## 九、常见问题

**Q: 我的页面打开是 Next.js 默认页？**
A: 首页 `/` 目前会跳转到处方页。A 完成首页开发后替换掉 `src/app/page.tsx` 即可。

**Q: 处方页打不开 / 404？**
A: 确保 URL 参数完整，至少需要 `city`、`temp`、`humidity`、`weather`、`emotions`、`scene` 六个参数。

**Q: 合并时冲突了怎么办？**
A: 大概率是 `package.json` 或 `package-lock.json` 冲突。保留双方依赖，手动合并后 `npm install` 重新生成 lock 文件。

**Q: 线上部署失败了？**
A: 先在本地跑 `npm run build`，确保构建通过再推送。查看 Vercel Deployments 页面的 Logs 定位错误。

**Q: 中文城市名导致构建失败？**
A: 所有进入 URL 的中文必须用 `encodeURIComponent()` 编码，不能直接写中文字符。
