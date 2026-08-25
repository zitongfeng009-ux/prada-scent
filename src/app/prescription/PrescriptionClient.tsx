"use client";

import { useState } from "react";
import type { Prescription } from "@/lib/types";
import { EMOTION_LABEL, SCENE_LABEL } from "@/lib/types";
import { TriMappingChart, type BlendStory } from "@/components/prescription/TriMappingChart";
import { FragranceBottleDisplay } from "@/components/prescription/FragranceBottleDisplay";
import { MeditationPlayer } from "@/components/prescription/MeditationPlayer";

/**
 * 生成调配链小故事（文学体裁版）
 * 体裁按日期轮换：童话 / 神话 / 短篇小说 / 散文诗。
 * 故事始终基于当天数据（天气、温度、场景、情绪、香型）动态生成，
 * 有角色、有画面、有起承转合：
 *   开场（opening）→ 环境的试炼（environmentLine）
 *   → 心事浮现（emotionLine）→ 香气揭晓（ending）。
 */
function generateBlendStory(prescription: Prescription): BlendStory {
  const { environment, user } = prescription.request;
  const top = prescription.recommendedFragrances[0];
  const primaryEmotion = user.emotions[0];
  const temp = environment.temperature;

  // 温度带（四种体裁共用的气候判断）
  const tempBand: "hot" | "cold" | "mild" =
    temp >= 30 ? "hot" : temp <= 15 ? "cold" : "mild";

  // 体裁按日期 + 情绪轮换，同一天同一输入看到同一个故事
  const genres = ["fairy", "myth", "novel", "poem"] as const;
  const day = new Date(prescription.createdAt).getDate();
  const emotionSeed = user.emotions.join("").length;
  const genre = genres[(day + emotionSeed) % genres.length];

  /* ────────────────────────────────────────────────
   * 体裁一：童话 —— 小狐狸的香气铺子
   * ──────────────────────────────────────────────── */
  if (genre === "fairy") {
    const weatherOpen: Record<string, string> = {
      sunny: "阳光亮得像刚洗过的玻璃",
      cloudy: "云朵把天空铺成了一张软软的床",
      rainy: "雨滴敲着屋檐，唱一首细细的歌",
      snowy: "雪花一片一片落下来，世界安静得像睡前",
      foggy: "雾把整条街都盖进了棉被里",
      stormy: "风雨在窗外奔跑，屋里反而格外安稳",
    };
    const sceneOpen: Record<string, string> = {
      deep_work: "你坐在桌前，想认认真真把手头的事做完",
      sleep_relax: "夜已经深了，你想把今天轻轻放下来",
      commute_subway: "你随着人流在车厢里晃啊晃",
      social_boost: "一会儿你就要走进人群，去见想见的人",
      outdoor_park: "你走到户外，风从衣角轻轻掠过",
      mercury_reversal: "这几天事情总不顺，你心里皱皱的",
    };
    const emotionHeart: Record<string, string> = {
      happy: "有一小块雀跃，像口袋里的跳跳糖",
      calm: "有一小片安静，像湖面没有风",
      irritated: "有一小团火苗，一点就着",
      anxious: "有什么东西在悄悄打结",
      sad: "有一层薄薄的雾，压在胸口",
      energetic: "有一股劲，像马上要出发的小马车",
      tired: "有一点点累，像走了很远的路",
      romantic: "有一点点柔软，想被温柔对待",
    };
    const tempAdvice: Record<"hot" | "cold" | "mild", string> = {
      hot: `小狐狸抖抖耳朵说：「${temp}℃的天，太重的香气会把人压垮，我们要找轻一点的。」`,
      cold: `小狐狸缩了缩尾巴说：「${temp}℃的风有点凉，这次的香气，要能裹住你才行。」`,
      mild: `小狐狸摇摇尾巴说：「${temp}℃，不冷不热，香气可以慢慢挑。」`,
    };
    const familyGift: Record<string, string> = {
      citrus: "一只刚熟的橘子——剥开的瞬间，阳光就咔嗒一声亮了",
      floral: "一座正在盛开的小花园——每走一步，心就软一分",
      woody: "一片安静的森林——踩着落叶，每一步都变得踏实",
      oriental: "一团琥珀色的暖光——把你从头到脚轻轻裹住",
      fresh: "雨后的一口空气——吸进去，整个人都清爽了",
      aromatic: "一条辽阔的海岸线——连呼吸都跟着开阔起来",
      chypre: "雨后湿润的林地——苔藓软软的，让人安心",
      fougere: "一片带露水的草地——草叶的清香一直沁到心里",
    };
    return {
      genre: "童话",
      title: "小狐狸的香气铺子",
      opening: `${weatherOpen[environment.weather] ?? "天色如常"}。${sceneOpen[user.scene] ?? "你过着自己的一天"}。走着走着，街角那家从没注意过的小铺子亮起了灯——招牌上画着一只小狐狸。它推开门，眨着眼睛说：「我知道你今天心里装着什么。」`,
      environmentLine: tempAdvice[tempBand],
      emotionLine: `你心里${emotionHeart[primaryEmotion] ?? "有一种说不清的心情"}。小狐狸踮起脚尖看了看你，认真地说：「那就交给香气吧，它最会照顾这样的心情。」`,
      ending: `小狐狸从架子上取下一只小小的瓶子：「你要找的，是${familyGift[top.family] ?? "一种懂你的香气"}。」——${top.name}，就是它为你准备的礼物。`,
    };
  }

  /* ────────────────────────────────────────────────
   * 体裁二：神话 —— 司香之神下凡
   * ──────────────────────────────────────────────── */
  if (genre === "myth") {
    const skyOpen: Record<string, string> = {
      sunny: "天光大亮，云海被镀成金色",
      cloudy: "云层低垂，像神殿垂下的帷幕",
      rainy: "雨神正巡视人间，雨丝如织",
      snowy: "雪落无声，天地白得像初生",
      foggy: "雾神吐息，人间隐入一片乳白",
      stormy: "风与雨在天空交战，雷声滚过山脊",
    };
    const mortalScene: Record<string, string> = {
      deep_work: "祂看见你伏在案前，想把纷乱的心绪理成一条直线",
      sleep_relax: "祂看见你在夜色里放缓呼吸，想让一天缓缓落定",
      commute_subway: "祂看见你随人潮起伏，像一粒被河流带着走的星子",
      social_boost: "祂看见你即将走进人群，去赴一场重要的相遇",
      outdoor_park: "祂看见你步入旷野，衣角被风轻轻掀起",
      mercury_reversal: "祂看见你这几日步履坎坷，眉间藏着一缕不顺",
    };
    const heartEcho: Record<string, string> = {
      happy: "你心里的欢喜如灯初上，亮得藏不住",
      calm: "你心里的平静如深潭映月，澄澈无波",
      irritated: "你心里的躁意如未熄的余烬，一吹就燃",
      anxious: "你心里的不安如暗涌，在平静的水面之下翻动",
      sad: "你心里的低落如暮色四合，轻轻压着胸口",
      energetic: "你心里的力量如满弦之弓，蓄势待发",
      tired: "你心里的疲惫如远行之人，只想被安放",
      romantic: "你心里的柔软如春藤，渴望攀附一点暖意",
    };
    const divineWord: Record<"hot" | "cold" | "mild", string> = {
      hot: `司香之神抬手探了探人间：「${temp}℃，暑气正盛。此香当轻，当凉，如风过竹林。」`,
      cold: `司香之神抬手探了探人间：「${temp}℃，寒气未散。此香当暖，当厚，如炉火映雪。」`,
      mild: `司香之神抬手探了探人间：「${temp}℃，天地温和。此香可以从容，徐徐展开。」`,
    };
    const familyGift: Record<string, string> = {
      citrus: "取晨光一缕，炼作柑橘的明亮",
      floral: "撷百花之魄，化作柔缓的花香",
      woody: "折千年之木，沉作安稳的木香",
      oriental: "燃琥珀之心，燃出温暖的东方",
      fresh: "收雨后之露，凝成洁净的清新",
      aromatic: "纳沧海之气，调出辽阔的芳香",
      chypre: "集苔林之幽，酿成深邃的甘苔",
      fougere: "采晨草之露，织成草本的清芬",
    };
    return {
      genre: "神话",
      title: "司香之神",
      opening: `传说云上有司香之神，掌人间一切气味的流转。这一日，${skyOpen[environment.weather] ?? "天色如常"}。祂拨开云层向下望去——${mortalScene[user.scene] ?? "祂看见了你的一天"}。于是祂合上香典，决定亲自下凡。`,
      environmentLine: divineWord[tempBand],
      emotionLine: `祂俯身细听，听见了你的心声：${heartEcho[primaryEmotion] ?? "那里藏着一段难以言说的心绪"}。「原来如此。」祂微微一笑，「难怪今日该由我出手。」`,
      ending: `于是祂以天地为炉，以时辰为火，${familyGift[top.family] ?? "为你炼成一缕懂你的香"}。香成之时，祂将其盛入小小的瓶中，赐名——${top.name}。`,
    };
  }

  /* ────────────────────────────────────────────────
   * 体裁三：短篇小说 —— 都市第二人称叙事
   * ──────────────────────────────────────────────── */
  if (genre === "novel") {
    const cityOpen: Record<string, string> = {
      sunny: "阳光很好，好得有点不真实",
      cloudy: "云层很厚，城市的光线像隔了一层磨砂玻璃",
      rainy: "雨下了一整天，街上的声音都变得遥远",
      snowy: "雪落下来，整座城市像被按了静音键",
      foggy: "雾很大，红绿灯在远处晕成模糊的光斑",
      stormy: "暴雨突至，行人都贴着屋檐快步走",
    };
    const youDo: Record<string, string> = {
      deep_work: "你坐在桌前，屏幕的光落在脸上，你想专注，却总有什么在分心",
      sleep_relax: "你关了灯，在黑暗里放缓呼吸，想把这一天轻轻放下",
      commute_subway: "你站在车厢里，随着人潮晃动，耳机里放着没什么印象的歌",
      social_boost: "你站在镜子前整理了一下衣领，一会儿要见的人很重要",
      outdoor_park: "你一个人走在路上，风掠过耳边，你没来由地停下脚步",
      mercury_reversal: "你又一次把事情搞砸了，站在原地，忽然觉得很没劲",
    };
    const innerLine: Record<string, string> = {
      happy: "今天心情其实不错，你只是想把这点好心情留得久一点",
      calm: "你很平静，但这种平静里有一点空，像是还缺着什么",
      irritated: "你有点烦躁，像皮肤上有细小的刺，不疼，却挥之不去",
      anxious: "你在焦虑，胃里像有一小团乱麻，你甚至说不出源头",
      sad: "你有点低落，像有一扇窗被谁悄悄关上了",
      energetic: "你精力充沛，却觉得这股劲还没找到出口",
      tired: "你累了，累得连叹气都省了，只想被什么轻轻接住",
      romantic: "你比平时柔软，像心里有个角落开着灯，等人经过",
    };
    const cityTemp: Record<"hot" | "cold" | "mild", string> = {
      hot: `${temp}℃。这样的天气，香气也要学会克制——太浓的会腻，只有清爽轻盈的，才配得上这身单薄的衣着。`,
      cold: `${temp}℃。冷的时候人想靠近温暖，香气也一样——你需要一点有温度的气味，替你抵御这条街的风。`,
      mild: `${temp}℃。这种天气最适合慢慢走，香气也可以慢慢选——不必急，好的东西经得起从容。`,
    };
    const familyFind: Record<string, string> = {
      citrus: "柑橘调——像剥开一只橘子时那一声清脆的「咔」，明亮得让人醒过来",
      floral: "花香调——像路过一座花园时忽然被按住的肩膀，柔软得让人想停留",
      woody: "木质调——像深夜书房里旧木头桌子的味道，稳得让人安心",
      oriental: "东方调——像冬天推开一家小酒馆的门，暖意扑面而来的那一瞬",
      fresh: "清新调——像一场雨停后推窗的深呼吸，干净得让人重新开始",
      aromatic: "芳香调——像站在海堤上被风灌满衣袖，辽阔得让人想走远一点",
      chypre: "甘苔调——像雨后森林深处潮湿的落叶层，深得像一句没说完的话",
      fougere: "馥奇调——像清晨草地上沾着露水的草本香，清爽得像一天刚开始",
    };
    return {
      genre: "短篇小说",
      title: `${temp}° 的转角`,
      opening: `${cityOpen[environment.weather] ?? "天色如常"}。${youDo[user.scene] ?? "你过着自己的一天"}。就是在这时候，你注意到了街角那家新开的小店，橱窗里只摆着几瓶香水，标签上写着：「按今日心情出售」。`,
      environmentLine: cityTemp[tempBand],
      emotionLine: `店主没有急着推荐，只是看了你一眼，说：「先告诉我，今天心里是什么天气？」你想了想——${innerLine[primaryEmotion] ?? "你说不上来，只是觉得哪里不太对"}。店主点点头，像是早就知道答案。`,
      ending: `「那你需要的，是${familyFind[top.family] ?? "一种懂此刻的气味"}。」店主从身后的架子上取下一只瓶子，递到你面前——${top.name}。你忽然觉得，这一天好像被轻轻接住了。`,
    };
  }

  /* ────────────────────────────────────────────────
   * 体裁四：散文诗 —— 致此刻的一封信
   * ──────────────────────────────────────────────── */
  const letterWeather: Record<string, string> = {
    sunny: "今天的光很亮，亮得让人想抬起头多看一会儿",
    cloudy: "今天的云很厚，把一切都调成了柔和的灰",
    rainy: "今天有雨，世界被洗得格外清楚又格外安静",
    snowy: "今天落雪，万物披上了安静的白",
    foggy: "今天有雾，所有的轮廓都轻了一度",
    stormy: "今天风雨正急，而你在屋内，这本身就是一种安稳",
  };
  const letterScene: Record<string, string> = {
    deep_work: "你想把心沉进手头的事里",
    sleep_relax: "你想让这一天缓缓地落下来",
    commute_subway: "你在人潮里穿行，想找一点属于自己的节奏",
    social_boost: "你要去见重要的人，想以最好的样子",
    outdoor_park: "你想去风里走一走",
    mercury_reversal: "你想把这些不顺的日子，轻轻翻过去",
  };
  const letterEmotion: Record<string, string> = {
    happy: "此刻的你，心里有一小块明亮在闪烁",
    calm: "此刻的你，安静得像一面没有风的湖",
    irritated: "此刻的你，心里有一小簇火，需要一阵凉风",
    anxious: "此刻的你，心里有些打结的地方，需要被轻轻解开",
    sad: "此刻的你，心里下着一场没人看见的小雨",
    energetic: "此刻的你，像一支上满弦的钟，蓄势待发",
    tired: "此刻的你，只想被温柔地放下",
    romantic: "此刻的你，柔软得像一封还没寄出的信",
  };
  const letterTemp: Record<"hot" | "cold" | "mild", string> = {
    hot: `${temp}℃的空气里，连呼吸都是热的。所以香气也要轻，要凉，要像一口井水那样解渴。`,
    cold: `${temp}℃，空气里有薄薄的凉。所以香气要暖，要厚，要像披在肩上的一件旧毛衣。`,
    mild: `${temp}℃，一切都刚刚好。所以香气也可以不慌不忙，像一次散步那样慢慢展开。`,
  };
  const letterFamily: Record<string, string> = {
    citrus: "于是信里出现了柑橘——明亮，坦荡，像一句脱口而出的真话",
    floral: "于是信里出现了花香——柔软，缓慢，像一个不必急着醒的梦",
    woody: "于是信里出现了木香——沉稳，可靠，像一位不必多言的老友",
    oriental: "于是信里出现了东方调——温暖，绵长，像冬夜里亮着的一盏灯",
    fresh: "于是信里出现了清新——干净，轻盈，像雨后第一口呼吸",
    aromatic: "于是信里出现了芳香——辽阔，自由，像吹过海岸的晚风",
    chypre: "于是信里出现了甘苔——深邃，安静，像雨后林地的一层绿意",
    fougere: "于是信里出现了草本——清爽，疗愈，像清晨沾着露水的草叶",
  };
  return {
    genre: "散文诗",
    title: "致此刻的你",
    opening: `${letterWeather[environment.weather] ?? "今天天色如常"}。${letterScene[user.scene] ?? "你过着自己的一天"}。这封信写给这样的你。`,
    environmentLine: letterTemp[tempBand],
    emotionLine: `${letterEmotion[primaryEmotion] ?? "此刻的你，心里有一段说不清的天气"}。别怕它，它是这封信里最重要的一行。`,
    ending: `${letterFamily[top.family] ?? "于是信里出现了一种懂你的香气"}。落款处写着它的名字——${top.name}。愿它陪你度过今天，以及往后的很多个今天。`,
  };
}

/**
 * 处方页客户端组件
 * 处理交互、展示推荐结果
 */
export default function PrescriptionClient({
  initialPrescription,
}: {
  initialPrescription: Prescription | null;
}) {
  const [prescription, setPrescription] =
    useState<Prescription | null>(initialPrescription);
  const [loading, setLoading] = useState(false);

  // Loading 状态
  if (loading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F7F6F2" }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full mx-auto mb-4 animate-pulse"
            style={{ border: "1px solid rgba(13,13,13,0.1)" }}
          />
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            正在分析你的香气档案...
          </p>
        </div>
      </main>
    );
  }

  // 无数据状态
  if (!prescription) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F7F6F2" }}
      >
        <div className="text-center max-w-sm px-6">
          <h2
            className="text-lg mb-3"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: "#0D0D0D",
            }}
          >
            今日香笺
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed mb-6">
            请先回到首页，选择你的情绪与场景，
            <br />
            让 AI 为你调配专属疗愈香气。
          </p>
          <a
            href="/"
            className="inline-block px-8 py-3 text-[10px] uppercase tracking-[0.15em] transition-all duration-400"
            style={{
              background: "#0D0D0D",
              color: "#F7F6F2",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F7F6F2";
              e.currentTarget.style.color = "#0D0D0D";
              e.currentTarget.style.border = "1px solid #0D0D0D";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#0D0D0D";
              e.currentTarget.style.color = "#F7F6F2";
              e.currentTarget.style.border = "none";
            }}
          >
            返回首页
          </a>
        </div>
      </main>
    );
  }

  const { healingNarrative, triMapping, recommendedFragrances, energyDeviation } =
    prescription;

  // CTA 对应的香水（按 commercialCTA.fragranceId 查找，找不到则用第一推荐）
  const ctaFragrance =
    recommendedFragrances.find(
      (f) => f.id === healingNarrative.commercialCTA.fragranceId
    ) || recommendedFragrances[0];

  return (
    <main className="min-h-screen" style={{ background: "#F7F6F2" }}>
      {/* ─── Header ─── */}
      <header
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(247,246,242,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(13,13,13,0.06)",
        }}
      >
        <a href="/" className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          ← 返回
        </a>
        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
          今日香笺
        </span>
        <span className="text-[10px] text-neutral-300">
          {new Date(prescription.createdAt).toLocaleDateString("zh-CN")}
        </span>
      </header>

      {/* ─── Section 1: 今日状态 ─── */}
      <section className="px-6 pt-12 pb-8 max-w-2xl mx-auto">
        <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-3">
          今日状态
        </p>
        <p
          className="text-sm leading-relaxed text-neutral-700"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {healingNarrative.todayStatus}
        </p>

        {/* 冲突提示 */}
        {energyDeviation.hasConflict && (
          <div
            className="mt-4 px-4 py-3 text-[10px] leading-relaxed text-neutral-600"
            style={{
              background: "rgba(200,214,175,0.15)",
              border: "1px solid rgba(168,195,160,0.3)",
            }}
          >
            ⚡ {energyDeviation.conflictDescription}
          </div>
        )}
      </section>

      {/* ─── Section 2: 三元映射 ─── */}
      <section className="px-6 py-8 max-w-2xl mx-auto">
        <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-6 text-center">
          你的香气诞生记 · 一个为你而写的短篇故事 · 点击探索每个阶段
        </p>
        <TriMappingChart mapping={triMapping} story={generateBlendStory(prescription)} />
      </section>

      {/* ─── Section 3: 推荐香水展示 ─── */}
      <section className="px-6 py-8 max-w-3xl mx-auto">
        <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-6 text-center">
          推荐香氛
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {recommendedFragrances.map((fragrance, idx) => (
            <FragranceBottleDisplay
              key={fragrance.id}
              fragrance={fragrance}
              rank={idx + 1}
            />
          ))}
        </div>
      </section>

      {/* ─── Section 4: 使用建议 + 香气组合 ─── */}
      <section className="px-6 py-8 max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 香气组合 */}
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-3">
              香气组合
            </p>
            <p className="text-[11px] leading-relaxed text-neutral-600">
              {healingNarrative.scentCombination}
            </p>
          </div>

          {/* 使用方式 */}
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-3">
              使用建议
            </p>
            <p className="text-[11px] leading-relaxed text-neutral-600">
              {healingNarrative.usageGuide}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Section 5: 冥想播放器 ─── */}
      <section className="px-6 py-8 max-w-2xl mx-auto">
        <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-6 text-center">
          冥想时刻
        </p>
        <MeditationPlayer
          guideText={healingNarrative.meditationGuide}
          emotions={prescription.request.user.emotions}
          fragranceFamily={recommendedFragrances[0]?.family || "floral"}
        />
      </section>

      {/* ─── Section 6: 情绪引导 ─── */}
      <section className="px-6 py-8 max-w-lg mx-auto text-center">
        <div
          className="px-8 py-6"
          style={{
            borderTop: "1px solid rgba(13,13,13,0.08)",
            borderBottom: "1px solid rgba(13,13,13,0.08)",
          }}
        >
          <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-3">
            情绪引导
          </p>
          <p
            className="text-xs leading-relaxed text-neutral-600 italic"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {healingNarrative.emotionalGuidance}
          </p>
        </div>
      </section>

      {/* ─── Section 7: 商业 CTA ─── */}
      <section className="px-6 py-12 max-w-2xl mx-auto text-center">
        <a
          href={ctaFragrance.purchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-10 py-4 text-[10px] uppercase tracking-[0.15em] transition-all duration-400"
          style={{
            background: "#0D0D0D",
            color: "#F7F6F2",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#F7F6F2";
            e.currentTarget.style.color = "#0D0D0D";
            e.currentTarget.style.outline = "1px solid #0D0D0D";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#0D0D0D";
            e.currentTarget.style.color = "#F7F6F2";
            e.currentTarget.style.outline = "none";
          }}
        >
          {healingNarrative.commercialCTA.label}
        </a>
        <p className="mt-3 text-[8px] text-neutral-400 tracking-wider">
          试香装购买 · 定制礼盒 · 订阅服务
        </p>
      </section>
    </main>
  );
}
