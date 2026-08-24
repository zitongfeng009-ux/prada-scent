/**
 * 氛围音效生成引擎
 * 使用 Web Audio API 程序化生成冥想音效
 * 根据用户情绪 + 推荐香型动态匹配不同氛围
 */

import type { EmotionKeyword, FragranceFamily } from "../types";

// ─── 氛围场景类型 ─────────────────────────────────────────────

export type SoundscapeType =
  | "crystal_clarity"   // 水晶清澈 — 明亮铃声 + 清透音色（开心/柑橘）
  | "petal_dream"       // 花瓣梦境 — 柔和微光 + 温柔铺底（浪漫/花香）
  | "rain_calm"         // 细雨宁静 — 轻柔雨声 + 温暖铺底（平静/清新）
  | "ocean_sooth"       // 海洋抚慰 — 海浪起伏 + 深沉 drones（焦虑/烦躁）
  | "forest_ground"     // 森林扎根 — 风声穿林 + 泥土质感（木质）
  | "warm_embrace"      // 温暖拥抱 — 和声泛音 + 柔暖铺底（东方调/悲伤）
  | "night_rest"        // 夜阑安歇 — 极柔噪声 + 最少音色（疲惫/睡前）
  | "dawn_rise";        // 晨曦升起 — 渐强铺底 + 明亮点缀（兴奋/活力）

// ─── 情绪 → 氛围映射 ─────────────────────────────────────────

const EMOTION_SOUNDSCAPE: Record<EmotionKeyword, SoundscapeType> = {
  happy: "crystal_clarity",
  calm: "rain_calm",
  irritated: "ocean_sooth",
  anxious: "ocean_sooth",
  sad: "warm_embrace",
  energetic: "dawn_rise",
  tired: "night_rest",
  romantic: "petal_dream",
};

// ─── 香型 → 氛围映射 ─────────────────────────────────────────

const FAMILY_SOUNDSCAPE: Record<FragranceFamily, SoundscapeType> = {
  citrus: "crystal_clarity",
  floral: "petal_dream",
  woody: "forest_ground",
  oriental: "warm_embrace",
  fresh: "rain_calm",
  aromatic: "ocean_sooth",
  chypre: "forest_ground",
  fougere: "rain_calm",
};

// ─── 氛围音频参数 ─────────────────────────────────────────────

interface SoundscapeParams {
  // 铺底音色
  padFreq: number;         // 基础频率 Hz
  padDetune: number;       // 失谐量 cents（越多越温暖/模糊）
  padVolume: number;       // 铺底音量 0-1
  // 纹理噪声
  noiseType: "white" | "pink" | "brown";
  noiseFilterFreq: number; // 噪声滤波频率 Hz
  noiseFilterQ: number;    // 滤波共振
  noiseVolume: number;     // 噪声音量 0-1
  // LFO 调制
  lfoRate: number;         // LFO 速率 Hz（0 = 无调制）
  lfoDepth: number;        // LFO 深度
  // 点缀音
  chimeFreq: number;       // 点缀音频率 Hz（0 = 无点缀）
  chimeInterval: number;   // 点缀间隔秒
  chimeVolume: number;     // 点缀音量
}

const SOUNDSCAPE_PARAMS: Record<SoundscapeType, SoundscapeParams> = {
  crystal_clarity: {
    padFreq: 528,        // 528Hz "爱之频率"
    padDetune: 5,
    padVolume: 0.06,
    noiseType: "pink",
    noiseFilterFreq: 4000,
    noiseFilterQ: 0.5,
    noiseVolume: 0.015,
    lfoRate: 0.1,
    lfoDepth: 20,
    chimeFreq: 1046,     // C6 高音
    chimeInterval: 4,
    chimeVolume: 0.04,
  },
  petal_dream: {
    padFreq: 396,        // 396Hz "释放恐惧"
    padDetune: 12,
    padVolume: 0.07,
    noiseType: "pink",
    noiseFilterFreq: 2000,
    noiseFilterQ: 0.8,
    noiseVolume: 0.01,
    lfoRate: 0.08,
    lfoDepth: 15,
    chimeFreq: 784,      // G5
    chimeInterval: 6,
    chimeVolume: 0.03,
  },
  rain_calm: {
    padFreq: 174,        // 174Hz "基础放松"
    padDetune: 8,
    padVolume: 0.05,
    noiseType: "pink",
    noiseFilterFreq: 1500,
    noiseFilterQ: 1.2,
    noiseVolume: 0.06,   // 雨声为主
    lfoRate: 0.05,
    lfoDepth: 10,
    chimeFreq: 0,        // 无点缀
    chimeInterval: 0,
    chimeVolume: 0,
  },
  ocean_sooth: {
    padFreq: 132,        // 132Hz 深沉
    padDetune: 15,
    padVolume: 0.06,
    noiseType: "brown",
    noiseFilterFreq: 800,
    noiseFilterQ: 1.5,
    noiseVolume: 0.08,   // 海浪为主
    lfoRate: 0.07,       // 海浪起伏节奏
    lfoDepth: 40,
    chimeFreq: 0,
    chimeInterval: 0,
    chimeVolume: 0,
  },
  forest_ground: {
    padFreq: 198,        // 198Hz 大地感
    padDetune: 10,
    padVolume: 0.05,
    noiseType: "brown",
    noiseFilterFreq: 600,
    noiseFilterQ: 0.8,
    noiseVolume: 0.04,   // 风声穿林
    lfoRate: 0.03,
    lfoDepth: 25,
    chimeFreq: 440,      // A4 自然音
    chimeInterval: 8,
    chimeVolume: 0.02,
  },
  warm_embrace: {
    padFreq: 285,        // 285Hz 温暖
    padDetune: 20,       // 大失谐 = 温暖模糊
    padVolume: 0.08,
    noiseType: "brown",
    noiseFilterFreq: 400,
    noiseFilterQ: 0.5,
    noiseVolume: 0.02,
    lfoRate: 0.04,
    lfoDepth: 12,
    chimeFreq: 330,      // E4
    chimeInterval: 7,
    chimeVolume: 0.025,
  },
  night_rest: {
    padFreq: 111,        // 111Hz 极低沉
    padDetune: 5,
    padVolume: 0.03,     // 极轻
    noiseType: "brown",
    noiseFilterFreq: 300,
    noiseFilterQ: 0.3,
    noiseVolume: 0.025,
    lfoRate: 0.02,
    lfoDepth: 8,
    chimeFreq: 0,
    chimeInterval: 0,
    chimeVolume: 0,
  },
  dawn_rise: {
    padFreq: 432,        // 432Hz "自然频率"
    padDetune: 8,
    padVolume: 0.07,
    noiseType: "pink",
    noiseFilterFreq: 3000,
    noiseFilterQ: 0.6,
    noiseVolume: 0.02,
    lfoRate: 0.15,       // 较快节奏 = 活力
    lfoDepth: 18,
    chimeFreq: 880,      // A5 明亮
    chimeInterval: 3,
    chimeVolume: 0.035,
  },
};

// ─── 氛围音效名称（中文） ─────────────────────────────────────

export const SOUNDSCAPE_LABEL: Record<SoundscapeType, string> = {
  crystal_clarity: "水晶清澈",
  petal_dream: "花瓣梦境",
  rain_calm: "细雨宁静",
  ocean_sooth: "海洋抚慰",
  forest_ground: "森林扎根",
  warm_embrace: "温暖拥抱",
  night_rest: "夜阑安歇",
  dawn_rise: "晨曦升起",
};

// ─── 根据香型决定氛围场景（与引导词场景一致）──────────────────

export function resolveSoundscape(
  _emotions: EmotionKeyword[],
  fragranceFamily: FragranceFamily
): SoundscapeType {
  // 场景由香型决定（引导词也基于香型，两者必须一致）
  return FAMILY_SOUNDSCAPE[fragranceFamily];
}

// ─── 情绪 → 音效参数微调 ─────────────────────────────────────
// 场景不变，但情绪会影响音效的“色调”：
// 焦虑/烦躁 → 更深沉、更慢、更包裹
// 开心/兴奋 → 更明亮、更快、更活泼
// 悲伤/疲惫 → 更轻柔、更缓慢

interface EmotionModifier {
  padDetuneDelta: number;
  padVolumeFactor: number;
  noiseVolumeFactor: number;
  lfoRateFactor: number;
  lfoDepthFactor: number;
  chimeVolumeFactor: number;
  fadeInSeconds: number;
}

const EMOTION_MODIFIER: Record<EmotionKeyword, EmotionModifier> = {
  happy:     { padDetuneDelta: -3,  padVolumeFactor: 1.0, noiseVolumeFactor: 0.8, lfoRateFactor: 1.3, lfoDepthFactor: 0.8, chimeVolumeFactor: 1.4, fadeInSeconds: 1.5 },
  calm:      { padDetuneDelta: 0,   padVolumeFactor: 1.0, noiseVolumeFactor: 1.0, lfoRateFactor: 1.0, lfoDepthFactor: 1.0, chimeVolumeFactor: 1.0, fadeInSeconds: 2.0 },
  irritated: { padDetuneDelta: 8,   padVolumeFactor: 1.2, noiseVolumeFactor: 1.3, lfoRateFactor: 0.7, lfoDepthFactor: 1.4, chimeVolumeFactor: 0.5, fadeInSeconds: 3.0 },
  anxious:   { padDetuneDelta: 10,  padVolumeFactor: 1.3, noiseVolumeFactor: 1.4, lfoRateFactor: 0.6, lfoDepthFactor: 1.5, chimeVolumeFactor: 0.4, fadeInSeconds: 3.5 },
  sad:       { padDetuneDelta: 5,   padVolumeFactor: 1.1, noiseVolumeFactor: 0.9, lfoRateFactor: 0.8, lfoDepthFactor: 1.2, chimeVolumeFactor: 0.7, fadeInSeconds: 3.0 },
  energetic: { padDetuneDelta: -5,  padVolumeFactor: 1.1, noiseVolumeFactor: 0.7, lfoRateFactor: 1.5, lfoDepthFactor: 0.7, chimeVolumeFactor: 1.5, fadeInSeconds: 1.0 },
  tired:     { padDetuneDelta: 3,   padVolumeFactor: 0.7, noiseVolumeFactor: 0.6, lfoRateFactor: 0.5, lfoDepthFactor: 0.8, chimeVolumeFactor: 0.3, fadeInSeconds: 4.0 },
  romantic:  { padDetuneDelta: 6,   padVolumeFactor: 1.0, noiseVolumeFactor: 0.8, lfoRateFactor: 0.9, lfoDepthFactor: 1.1, chimeVolumeFactor: 1.2, fadeInSeconds: 2.5 },
};

/** 合并多个情绪修饰符（取各维度的平均值） */
function mergeEmotionModifiers(emotions: EmotionKeyword[]): EmotionModifier {
  const neutral: EmotionModifier = {
    padDetuneDelta: 0, padVolumeFactor: 1, noiseVolumeFactor: 1,
    lfoRateFactor: 1, lfoDepthFactor: 1, chimeVolumeFactor: 1, fadeInSeconds: 2,
  };
  if (emotions.length === 0) return neutral;
  const mods = emotions.map((e) => EMOTION_MODIFIER[e]);
  return {
    padDetuneDelta: mods.reduce((s, m) => s + m.padDetuneDelta, 0) / mods.length,
    padVolumeFactor: mods.reduce((s, m) => s + m.padVolumeFactor, 0) / mods.length,
    noiseVolumeFactor: mods.reduce((s, m) => s + m.noiseVolumeFactor, 0) / mods.length,
    lfoRateFactor: mods.reduce((s, m) => s + m.lfoRateFactor, 0) / mods.length,
    lfoDepthFactor: mods.reduce((s, m) => s + m.lfoDepthFactor, 0) / mods.length,
    chimeVolumeFactor: mods.reduce((s, m) => s + m.chimeVolumeFactor, 0) / mods.length,
    fadeInSeconds: mods.reduce((s, m) => s + m.fadeInSeconds, 0) / mods.length,
  };
}

/** 将情绪修饰符应用到基础参数上 */
function applyEmotionModifier(
  base: SoundscapeParams,
  mod: EmotionModifier
): SoundscapeParams {
  return {
    ...base,
    padDetune: base.padDetune + mod.padDetuneDelta,
    padVolume: Math.min(0.15, base.padVolume * mod.padVolumeFactor),
    noiseVolume: Math.min(0.15, base.noiseVolume * mod.noiseVolumeFactor),
    lfoRate: Math.max(0.01, base.lfoRate * mod.lfoRateFactor),
    lfoDepth: base.lfoDepth * mod.lfoDepthFactor,
    chimeVolume: Math.min(0.08, base.chimeVolume * mod.chimeVolumeFactor),
  };
}

// ─── 氛围场景中文标签（含情绪色调描述）────────────────────────

export function soundscapeDescription(
  soundscape: SoundscapeType,
  emotions: EmotionKeyword[]
): string {
  const baseLabel = SOUNDSCAPE_LABEL[soundscape];
  if (emotions.length === 0) return baseLabel;
  const emotionTones: Record<EmotionKeyword, string> = {
    happy: "明朗", calm: "平和", irritated: "深沉", anxious: "包裹",
    sad: "柔缓", energetic: "跃动", tired: "轻眠", romantic: "温柔",
  };
  const tones = emotions.map((e) => emotionTones[e]).join("·");
  return `${baseLabel} · ${tones}`;
}

// ─── 音频引擎类 ─────────────────────────────────────────────

export class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private nodes: AudioNode[] = [];
  private chimeTimer: ReturnType<typeof setInterval> | null = null;
  private masterGain: GainNode | null = null;
  private isRunning = false;

  /** 启动氛围音效（可传入情绪来微调音色，volumeScale 控制总音量） */
  start(soundscape: SoundscapeType, emotions: EmotionKeyword[] = [], volumeScale = 1) {
    if (this.isRunning) this.stop();

    // 基础参数 + 情绪微调
    const baseParams = SOUNDSCAPE_PARAMS[soundscape];
    const emotionMod = mergeEmotionModifiers(emotions);
    const params = applyEmotionModifier(baseParams, emotionMod);

    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);

    // 淡入（情绪越不安，淡入越慢；音量按需缩放）
    const target = Math.min(1, Math.max(0, volumeScale));
    this.masterGain.gain.linearRampToValueAtTime(
      target, this.ctx.currentTime + emotionMod.fadeInSeconds
    );

    // 1. 铺底音色（双振荡器 + 失谐）
    this.createPad(params);

    // 2. 纹理噪声
    this.createNoise(params);

    // 3. 点缀音
    if (params.chimeFreq > 0) {
      this.createChime(params);
    }

    this.isRunning = true;
  }

  /** 停止音效 */
  stop() {
    if (this.masterGain && this.ctx) {
      // 淡出
      this.masterGain.gain.linearRampToValueAtTime(
        0, this.ctx.currentTime + 1
      );
      setTimeout(() => this.cleanup(), 1200);
    } else {
      this.cleanup();
    }
  }

  private cleanup() {
    if (this.chimeTimer) {
      clearInterval(this.chimeTimer);
      this.chimeTimer = null;
    }
    this.nodes.forEach((n) => {
      try {
        if (n instanceof OscillatorNode) n.stop();
        n.disconnect();
      } catch {}
    });
    this.nodes = [];
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.masterGain = null;
    this.isRunning = false;
  }

  /** 创建铺底音色 */
  private createPad(params: SoundscapeParams) {
    if (!this.ctx || !this.masterGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = "sine";
    osc1.frequency.value = params.padFreq;
    osc2.type = "sine";
    osc2.frequency.value = params.padFreq;
    osc2.detune.value = params.padDetune;

    filter.type = "lowpass";
    filter.frequency.value = 800;
    filter.Q.value = 0.5;

    gain.gain.value = params.padVolume;

    // LFO 调制频率
    if (params.lfoRate > 0) {
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.value = params.lfoRate;
      lfoGain.gain.value = params.lfoDepth;
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);
      lfo.start();
      this.nodes.push(lfo, lfoGain);
    }

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    this.nodes.push(osc1, osc2, filter, gain);
  }

  /** 创建纹理噪声（雨声/海浪/风声） */
  private createNoise(params: SoundscapeParams) {
    if (!this.ctx || !this.masterGain) return;

    // 生成噪声 buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (params.noiseType === "white") {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (params.noiseType === "pink") {
      // Paul Kellett 粉色噪声算法
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else {
      // 棕色噪声
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * white) / 1.02;
        last = data[i];
        data[i] *= 3.5;
      }
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = params.noiseFilterFreq;
    filter.Q.value = params.noiseFilterQ;

    const gain = this.ctx.createGain();
    gain.gain.value = params.noiseVolume;

    // LFO 调制噪声音量（海浪起伏效果）
    if (params.lfoRate > 0 && params.noiseType === "brown") {
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.value = params.lfoRate * 0.5;
      lfoGain.gain.value = params.noiseVolume * 0.5;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
      this.nodes.push(lfo, lfoGain);
    }

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    this.nodes.push(source, filter, gain);
  }

  /** 创建点缀音（铃声/水滴） */
  private createChime(params: SoundscapeParams) {
    if (!this.ctx || !this.masterGain) return;

    const playChime = () => {
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = params.chimeFreq;

      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(
        params.chimeVolume, this.ctx.currentTime + 0.1
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001, this.ctx.currentTime + 3
      );

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start();
      osc.stop(this.ctx.currentTime + 3.5);
    };

    // 首次延迟 2 秒后开始
    setTimeout(() => {
      playChime();
      this.chimeTimer = setInterval(playChime, params.chimeInterval * 1000);
    }, 2000);
  }
}
