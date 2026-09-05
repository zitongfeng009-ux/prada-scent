# Prada Scent — UI Design System 设计规范（完整版）

> 本文档是 B 角色页面（处方页）实际使用的完整设计规范。
> **A 角色（首页）和 C 角色（日记页/我的页）开发时必须遵循本规范**，保证三个页面视觉统一。
> 可直接把「Prompt 正文」部分复制给你的开发 agent 使用。

---

## Prompt 正文（复制给 agent 用）

```
你正在为 Prada 香氛推荐小程序开发界面。请严格遵循以下 Design System：

【品牌身份与设计哲学】
- 品牌：Prada Perfume — 高级时尚与知识极简主义结合
- 设计哲学：冷感优雅、颠覆性奢华、结构化现代主义
- 品牌故事锚点：1913 米兰遗产（结构化精准、Saffiano 皮革、银色五金）；
  尼龙革命（实用反叛、高端奢华与现代功能材料的平衡）；
  当代艺术与建筑（干净几何网格、大量留白、策划性不对称）

【色彩系统】
- Prada Black（主深色）#0D0D0D：高对比度奢华背景，非纯黑哑光质感
- Prada Off-White（主浅色/页面背景）#F7F6F2：暖调瓷/石膏色调，避免临床白
- Prada Mint / Nylon Green（签名强调色）#C8D6AF 或 #A8C3A0：
  仅用于 CTA、激活状态、高亮，不可大面积使用
- Saffiano Warm Gray（次要背景/卡片）#EAE8E3
- Silver / Chrome Foil（边框与五金）#C4C4C4：细 1px 描边、发丝线
- Perfume Liquid Accents（仅限香水液体预览表面）：
  #D49B5B 暖琥珀、#E3BDB0 透明玫瑰、#A4B0C0 冷鸢尾
- 禁止使用规范外的颜色（如紫色、蓝色渐变等）

【排版规范】
- 主标题 / Display：Bodoni / Didot / 高对比衬线体，大字号，tight tracking
  （代码中可用 Georgia, 'Times New Roman', serif 作为等效实现）
- 副标题 / Subtitles：Futura / Helvetica Neue，全大写，中等字重，
  宽字距 letter-spacing: 0.15em（Tailwind: tracking-widest）
- 正文：Inter / SF Pro Text，无衬线，字重 300/400，中性色调
- 叙事/故事文案：Georgia / Times New Roman 衬线体 + 斜体（italic）
- 界面所有文案必须为中文（数据枚举值除外）

【表面、纹理与层级】
- 边框：超细 1px 发丝边框（#0D0D0D @ 10% 透明度 或 #C4C4C4）
- 圆角：严格 0px 或最大 2px（rounded-none / rounded-sm），禁止软圆角和药丸按钮
- 阴影：零厚重投影，用微妙环境遮蔽或锐利线条框架代替弥散阴影
- 可选纹理：Digital Saffiano（1px 交叉编织微纹理）、
  Glassmorphism（backdrop-filter: blur(16px) + 5% 白色透明度，参考香水瓶玻璃）

【按钮与 CTA】
- Primary CTA：实心黑底 #0D0D0D + Off-White 文字 #F7F6F2，0px 圆角，
  全大写宽字距；悬停反转（Off-White 底 + 黑字 + 1px 黑边框）
- Secondary CTA：透明背景 + 1px 实心黑/银边框
- 选择器（情绪/场景等）：极简单选/复选框，细自定义边框，选中态用 Mint 或黑底反白

【布局网格】
- 12 列流体网格，超宽边距（桌面端 80px+），杂志编辑式设计
- 大量留白；产品图统一 3:4 宽高比，居中于 Off-White 背景配细边框

【动效与微交互】
- 缓动曲线：cubic-bezier(0.25, 1, 0.5, 1)（smooth luxury ease）
- 悬停过渡：400ms 慢速（赋予重量感与奢华感）
- 图片悬停：超微妙缩放 scale(1.03)

【文案风格】
- 全中文界面，简洁优雅，与 Prada 高端定位一致
- 数据可视化必须叙事化：用故事/卡片/展开详情表达数据关系，
  禁止抽象裸图表和模板腔拼接句（参考处方页"香气诞生记"的四种文学体裁实现）
```

---

## 速查表

| 项目 | 规范 |
|------|------|
| 主色 | Prada Black `#0D0D0D` |
| 页面背景 | Prada Off-White `#F7F6F2` |
| 强调色（仅 CTA/高亮） | Prada Mint `#C8D6AF` |
| 卡片背景 | Saffiano Warm Gray `#EAE8E3` |
| 边框 | `#C4C4C4` 或黑 @10%，1px 发丝线 |
| 标题字体 | Bodoni / Didot（代码等效：Georgia serif） |
| 副标题 | 全大写 + `tracking-widest`（0.15em） |
| 正文字体 | Inter，字重 300/400 |
| 故事文案 | Georgia serif + 斜体 |
| 圆角 | 0px（最大 2px） |
| 阴影 | 无厚重投影 |
| 按钮 | 黑底白字、0 圆角、全大写宽字距、悬停反转 |
| 动效 | 400ms、`cubic-bezier(0.25, 1, 0.5, 1)`、悬停 `scale(1.03)` |
| 语言 | 全中文界面 |

---

## B 角色页面中的实际实现参考

| 规范点 | 实现位置 |
|--------|---------|
| 页面背景 `#F7F6F2` | `src/app/prescription/PrescriptionClient.tsx` |
| 故事衬线斜体排版 | `src/components/prescription/TriMappingChart.tsx` |
| 黑底白字 0 圆角按钮 + 悬停反转 | `src/components/prescription/FragranceBottleDisplay.tsx` |
| 1px 发丝边框卡片 | `src/components/prescription/TriMappingChart.tsx` |
| 产品图 3:4 宽高比 | `FragranceBottleDisplay.tsx`（`aspectRatio: "3/4"`） |
| 悬停 `scale(1.03)` + 400ms | `FragranceBottleDisplay.tsx` |

---

## ⚠️ 当前待修复：A 角色首页不符合本规范

A 的首页（`src/app/page.tsx`）目前使用了 `bg-purple-50`、`text-purple-500` 等紫色系样式，
**违反本规范**。需按上述 Prompt 重做首页配色与排版：
背景改 `#F7F6F2`、强调改 `#C8D6AF`/黑、标题改衬线体、按钮改 0 圆角黑底。
