import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "问题陈述 · 为什么做这个 | Prada Scent",
  description:
    "中国用香人群渗透率只有 5%。不是不喜欢——是闻不到、选不出、买不动。",
};

/**
 * /why —— 问题陈述页（路演开场屏）
 *
 * 用途：评委一问「你们的痛点是什么」，不切 PPT，直接把这个页面点给他看。
 * 因此本页刻意做成纯静态服务端组件：无状态、无请求、不依赖引擎，
 * 断网、后端挂了、A/C 组件没到位，这一屏都还能演。
 *
 * 数据来源全部为用户提供的行业报告原文（见页脚出处），
 * 未使用任何未经验证的自造数字；口径限定条件以「注」的形式就地标注。
 */

/* ── 页面级微样式：发丝分隔线 + 悬停缓动（遵循 cubic-bezier(.25,1,.5,1)/400ms） ── */
const STYLE = `
.sa-ease { transition: all 400ms cubic-bezier(.25,1,.5,1); }
.sa-hair { border-top: 1px solid rgba(13,13,13,.10); }
.sa-cta-solid:hover { background:#F7F6F2 !important; color:#0D0D0D !important; outline:1px solid #0D0D0D; }
.sa-cta-ghost:hover { background:#0D0D0D; color:#F7F6F2; }
`;

/** 数字墙：大字号用衬线体，符合 Display 规范 */
const FIGURES: { value: string; label: string; note: string }[] = [
  {
    value: "5%",
    label: "中国用香人群渗透率",
    note: "注：渗透率口径，非购买率",
  },
  {
    value: "50%",
    label: "美国用香人群渗透率",
    note: "欧洲为 42%，同一口径",
  },
  {
    value: "≈20%",
    label: "香氛品类近五年年均复合增速",
    note: "美妆五大细分里增长最快之一",
  },
  {
    value: "1/5",
    label: "中国人均美妆消费额相当于美国的",
    note: "市场总量全球第二，人均仍极低",
  },
];

/** 三个痛点：现象 → 数据 → 我们的答案 */
const PAINS: {
  no: string;
  title: string;
  body: string;
  proof: string;
  answer: string;
}[] = [
  {
    no: "01",
    title: "闻不到",
    body: "气味是唯一一个无法通过屏幕传递的感官。用户在线上只能读文案，要真闻，就得跑专柜、闻试纸、被销售围着问。所以香氛这个增速最快的品类，在线上永远差最后一步。",
    proof: "中国用香人群渗透率 5%，美国 50%、欧洲 42%。",
    answer:
      "把「闻」搬到线上：AI 算出配方，设备真的放出这股气味。这是本站最后一个感官缺口被补上的地方。",
  },
  {
    no: "02",
    title: "选不出",
    body: "13 支香水乘以天气、温度、湿度、情绪、场景，是个靠人穷举不完的矩阵。而报告说得很清楚，进阶用户的用法是「穿香如穿衣」——每天要换。要每天换就得先买一堆瓶，这个门槛本身在压制渗透率。",
    proof:
      "香氛三类人群：新手买「不会出错的香水」→ 熟手按季节穿搭「穿香」→ 行家以沙龙香立「香水即人设」。",
    answer:
      "推荐引擎把穷举变成诊断；调配模型把「必须拥有很多瓶」改写成「7 个精油仓 + 一份 AI 配方」。高门槛品类由此降级为低门槛订阅。",
  },
  {
    no: "03",
    title: "卖错了语言",
    body: "香水今天仍在用前调、中调、后调这种成分语言卖货。但用户打开一个页面时，心里想的是「我今天很累」，不是「我要一段雪松」。",
    proof:
      "尼尔森 IQ × 美图 2025 年白皮书的核心结论：情绪价值已成为购买的核心驱动力；互动性、沉浸感与真实体验是决策关键因素；消费者需要接触更多触点才会下单。",
    answer:
      "不让用户读香调表。我们问他今天感觉怎么样、外面下没下雨，把心情翻译成一瓶香、一段故事、一次真实释放——一次交互里叠了五个触点。",
  },
];

export default function WhyPage() {
  return (
    <main
      className="min-h-screen px-6 py-8"
      style={{ background: "#F7F6F2" }}
    >
      <style>{STYLE}</style>

      {/* ── 顶栏 ── */}
      <div
        className="mx-auto flex max-w-4xl items-center justify-between border-b pb-4"
        style={{ borderColor: "rgba(13,13,13,.08)" }}
      >
        <a
          href="/"
          className="sa-ease text-[9px] uppercase tracking-[.24em] text-neutral-400 hover:text-neutral-900"
        >
          ← 返回
        </a>
        <span className="text-[9px] uppercase tracking-[.24em] text-neutral-500">
          Prada · Scent Aura
        </span>
        <span className="text-[9px] uppercase tracking-[.24em] text-neutral-400">
          问题陈述
        </span>
      </div>

      <div className="mx-auto max-w-4xl">
        {/* ── 开场：一句总纲 ── */}
        <section className="py-20 sm:py-28">
          <p className="text-[9px] uppercase tracking-[.28em] text-neutral-400">
            为什么做这个
          </p>
          <h1
            className="mt-8 text-3xl leading-[1.25] sm:text-[42px] sm:leading-[1.2]"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: "#0D0D0D",
              letterSpacing: "-.01em",
            }}
          >
            中国只有 5% 的人用香水。
            <br />
            美国是 50%。
          </h1>
          <p
            className="mt-8 text-base leading-relaxed text-neutral-600 italic sm:text-lg"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            不是不喜欢。是闻不到、选不出、买不动。
          </p>
        </section>

        {/* ── 数字墙 ── */}
        <section className="sa-hair py-14">
          <p className="text-[9px] uppercase tracking-[.28em] text-neutral-400 mb-10">
            先看四个数字
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
            {FIGURES.map((f) => (
              <div key={f.label}>
                <p
                  className="text-4xl leading-none"
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    color: "#0D0D0D",
                  }}
                >
                  {f.value}
                </p>
                <p className="mt-4 text-[11px] leading-relaxed text-neutral-700">
                  {f.label}
                </p>
                <p className="mt-2 text-[9px] leading-relaxed text-neutral-400">
                  {f.note}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 三个痛点 ── */}
        <section className="sa-hair py-14">
          <p className="text-[9px] uppercase tracking-[.28em] text-neutral-400 mb-4">
            卡住渗透率的三道墙
          </p>
          {PAINS.map((p) => (
            <article key={p.no} className="sa-hair py-10 first:border-t-0">
              <div className="flex items-baseline gap-5">
                <span
                  className="text-[11px] tabular-nums text-neutral-300"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {p.no}
                </span>
                <h2
                  className="text-2xl"
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    color: "#0D0D0D",
                  }}
                >
                  {p.title}
                </h2>
              </div>

              <p className="mt-5 max-w-2xl text-[13px] leading-[1.9] text-neutral-700">
                {p.body}
              </p>

              <p className="mt-5 max-w-2xl border-l pl-4 text-[11px] leading-relaxed text-neutral-500"
                style={{ borderColor: "#C4C4C4" }}>
                {p.proof}
              </p>

              <p
                className="mt-6 inline-block py-3 pr-4 text-[11px] leading-relaxed"
                style={{
                  background: "#EAE8E3",
                  color: "#0D0D0D",
                  borderLeft: "2px solid #C8D6AF",
                  paddingLeft: "14px",
                }}
              >
                <span className="mr-2 text-[9px] uppercase tracking-[.2em] text-neutral-500">
                  我们的答案
                </span>
                {p.answer}
              </p>
            </article>
          ))}
        </section>

        {/* ── 解法：三层闭环 ── */}
        <section className="sa-hair py-14">
          <p className="text-[9px] uppercase tracking-[.28em] text-neutral-400 mb-10">
            我们要做的，是把这三步一次补上
          </p>
          <ol className="grid gap-px sm:grid-cols-1 md:grid-cols-3" style={{ background: "rgba(13,13,13,.1)" }}>
            {[
              {
                layer: "感知",
                text: "摄像头读情绪，天气 API 读环境。用户不填问卷，只需被看见。",
              },
              {
                layer: "决策",
                text: "能量偏离度诊断 → 香调匹配 → 生成专属叙事，再把它翻译成 7 个精油仓各开多少。",
              },
              {
                layer: "执行",
                text: "设备按配比混合释放：仓体液位、出雾节奏、氛围灯色，全部由同一份配方驱动。",
              },
            ].map((s) => (
              <li key={s.layer} className="p-7" style={{ background: "#F7F6F2" }}>
                <span className="mb-4 block h-px w-7" style={{ background: "#C8D6AF" }} />
                <p
                  className="text-[9px] uppercase tracking-[.24em]"
                  style={{ color: "#0D0D0D" }}
                >
                  {s.layer}
                </p>
                <p className="mt-4 text-[12px] leading-[1.9] text-neutral-700">
                  {s.text}
                </p>
              </li>
            ))}
          </ol>

          <p className="mt-10 text-[12px] leading-relaxed text-neutral-600">
            而这三层之间的交接物，不是一段给人看的文案，是一份机器可读的气味配方：
          </p>
          <pre
            className="mt-4 overflow-x-auto border p-5 text-[10px] leading-relaxed"
            style={{
              borderColor: "rgba(13,13,13,.1)",
              background: "#EAE8E3",
              color: "#0D0D0D",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
{`{ "state": "releasing",
  "recipe": {
    "components": [ { "cartridge": "citrus",   "pct": 58 },
                    { "cartridge": "woody",    "pct": 25 },
                    { "cartridge": "floral",   "pct": 17 } ],
    "intensity": "high",  "warmth": "cool",  "lightColor": "#E8B84B" } }`}
          </pre>
          <p className="mt-4 text-[10px] leading-relaxed text-neutral-400">
            上面这份是 Prada Infusion 辛爽生姜 的真实输出：58 + 25 + 17 = 100。
            全目录 13 款香水、41 个真实香材全部命中映射，无一兜底。
            换壳不换脑——同一份指令可以驱动冷扩香机、微孔雾化模组或展厅定制装置。
          </p>
        </section>

        {/* ── 诚实边界 ── */}
        <section className="sa-hair py-14">
          <p className="text-[9px] uppercase tracking-[.28em] text-neutral-400 mb-8">
            我们不说谎的部分
          </p>
          <p
            className="max-w-2xl text-[15px] leading-[2] text-neutral-700 italic"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            我们没有做出真机，也不宣称 7 个仓能复刻一瓶成品香水——那是几十种香料、
            酒精浓度与熟成时间的结果。设备释放的是这支香的
            <span style={{ color: "#0D0D0D" }}>核心香调骨架近似</span>
            ；完整保真的处方、故事与购买路径，留在网页上。
            而真实扩香机的行业规格本来就是 4 到 8 个仓，我们不是简化，
            我们是照着物理约束设计的。
          </p>
          <p className="mt-8 max-w-2xl text-[12px] leading-[1.9] text-neutral-600">
            但这件事的价值不在于我们做了个玩具，而在于：当 AI 能把「你今天焦虑」
            翻译成「柑橘 58、木质 25、花香 17」，「屏幕上闻不到气味」就不再是物理限制，
            而是一个工程问题。工程问题是可以被解决的。
          </p>
        </section>

        {/* ── 入口 ── */}
        <section className="sa-hair py-16 text-center">
          <p className="text-[9px] uppercase tracking-[.28em] text-neutral-400 mb-8">
            看它跑起来
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/"
              className="sa-cta-solid sa-ease inline-block px-10 py-4 text-[10px] uppercase tracking-[.15em]"
              style={{ background: "#0D0D0D", color: "#F7F6F2" }}
            >
              从首页完整演示 →
            </a>
            <a
              href="/device"
              className="sa-cta-ghost sa-ease inline-block px-10 py-4 text-[10px] uppercase tracking-[.15em]"
              style={{ border: "1px solid #0D0D0D", color: "#0D0D0D" }}
            >
              直接看虚拟香薰机
            </a>
          </div>
        </section>

        {/* ── 出处 ── */}
        <footer className="sa-hair py-12">
          <p className="text-[9px] uppercase tracking-[.28em] text-neutral-400 mb-5">
            数据出处
          </p>
          <ul className="space-y-3 text-[10px] leading-relaxed text-neutral-500">
            <li>
              埃森哲《中国美妆行业观察》：用香人群渗透率（中国 5% / 美国 50% /
              欧洲 42%）、香氛品类近五年年复合增速、中国人均美妆消费额、
              香氛品类三类人群趋势分层。
            </li>
            <li>
              尼尔森 IQ × 美图《洞见美力：2025 美图护肤彩妆白皮书》（2025.10.23）：
              情绪价值成为核心驱动力、互动性与沉浸感及真实体验影响决策、
              消费者需接触更多触点方可下单。
            </li>
            <li>
              精油仓配比、香材映射覆盖率、配方加总恒为 100：
              来自本站自身算法输出，可现场换任意一款香水复算验证。
            </li>
            <li className="pt-2 text-neutral-400">
              口径提示：文中「5%」为用香人群渗透率，不等于购买率；
              本页未使用任何无出处的自造统计数字。
            </li>
          </ul>
        </footer>
      </div>
    </main>
  );
}
