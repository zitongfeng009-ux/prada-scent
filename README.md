# Prada Scent Companion — 今日香笺

以香气为媒介的每日生活仪式。结合环境感知（天气/位置）、情绪场景与 AI 大模型的智能香氛伴侣小程序。

## 核心场景

> "今天是什么日子？今天的我适合什么气息？"

用户每天打开小程序，就像翻开一页属于自己的「今日香笺」。

## 技术栈

- **框架**: Next.js 16 + React 19 + TypeScript
- **样式**: Tailwind CSS 4
- **数据**: Supabase（计划中）
- **部署**: Vercel（计划中）

## 项目架构

```
│ 1. 情绪+场景 │───> │ 2. AI 智能匹配 │───> │ 3. 嗅觉疗愈 │───> │ 4. 情绪资产 │
 (情绪问卷+场景+天气)   (大模型+香氛知识库)    (个性化推荐)     (情绪日记/报告)
```

### 路由

| 路由 | 页面 | 负责人 |
|------|------|--------|
| `/` | 首页（感知与输入） | A |
| `/prescription` | 处方页（疗愈结果） | B |
| `/journal` | 情绪资产（日记/报告） | C |
| `/profile` | 我的（偏好/收藏/订单） | C |

## 三人分工

| 角色 | 职责 | 负责模块 |
|------|------|---------|
| **A** — Environment & Input Engineer | 首页、定位、天气、场景、情绪输入 | `/` 首页 |
| **B** — Fragrance Intelligence & Experience Engineer | 推荐引擎、香气配方、三元映射、3D 展示、冥想体验 | `/prescription` 处方页 |
| **C** — User Asset & Data Engineer | 情绪日记、数据可视化、香气人格、收藏、订单、隐私 | `/journal` + `/profile` |

## 数据传递方式

**A → B**: URL 跳转（参数拼在网址后面）
```
/prescription?city=广州&temp=28&humidity=75&weather=rainy&lat=23.13&lng=113.26&emotions=anxious,irritated&scene=deep_work
```

**B → C**: Prescription 数据结构（B 生成处方后，C 存储和展示）

## 快速开始

```bash
# 克隆项目
git clone <repo-url>
cd prada-scent

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000 查看首页。

测试处方页（B 角色核心页面）：
```
http://localhost:3000/prescription?city=guangzhou&temp=28&humidity=75&weather=rainy&lat=23.13&lng=113.26&emotions=anxious,irritated&scene=deep_work
```

## Git 分支策略

```
main          ← 稳定版本
  └─ develop  ← 开发主线
       ├─ feature/a-homepage      ← A 负责
       ├─ feature/b-prescription  ← B 负责（已完成）
       └─ feature/c-journal       ← C 负责
```

## UI 设计规范

- **Prada Black**: `#0D0D0D`（主色）
- **Prada Off-White**: `#F7F6F2`（背景）
- **Prada Mint**: `#C8D6AF`（强调色）
- **字体**: Bodoni/Didot（标题）+ Inter（正文）
- **风格**: 极简、冷感优雅、几何线条、大量留白
- **按钮**: 0px 圆角、全大写、宽字距

## Prada 香氛知识库

包含 13 款真实 Prada 在售产品的完整数据：
- 前中后调（来自 Prada 官网 + 香水时代）
- 挥发度、温度适应性、功效标签
- 真实产品图片（Prada CDN）
- 官网购买链接
