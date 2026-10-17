"use client";

import { useState } from "react";

// 插畫風格用色：深棕描邊、金黃、正紅、青綠
const INK = "#3b1d1d";
const GOLD = "#ffd23f";
const GOLD_DARK = "#f4a91c";
const RED = "#e0261b";
const TEAL = "#38b2a3";

type Level = {
  name: string;
  weight: number;
  stars: number;
  // 籤枝與籤紙上吉凶標籤的底色
  color: string;
  poem: string[];
};

// weight 是抽中機率的權重，吉籤多、凶籤少
const LEVELS: Level[] = [
  { name: "大吉", weight: 10, stars: 5, color: RED, poem: ["今日諸事皆順遂，所求之事必有成", "雲開月明見前程，貴人相助福自來"] },
  { name: "中吉", weight: 15, stars: 4, color: RED, poem: ["穩步向前莫心急，好事正在路途中", "春風得意花自開，努力終有好回報"] },
  { name: "小吉", weight: 20, stars: 4, color: "#ef6a1a", poem: ["小小幸運藏身邊，留心細節有驚喜", "平凡日子亦有光，知足常樂福常在"] },
  { name: "吉", weight: 20, stars: 3, color: "#ef6a1a", poem: ["平安順利過一日，按部就班最穩當", "風平浪靜好行船，做好本分即是福"] },
  { name: "末吉", weight: 15, stars: 3, color: TEAL, poem: ["先苦後甜終有時，耐心等待轉機來", "眼前雖有小波折，堅持到底見彩虹"] },
  { name: "凶", weight: 13, stars: 2, color: "#5b6472", poem: ["今日行事宜謹慎，三思而後再行動", "退一步海闊天空，暫緩腳步避風頭"] },
  { name: "大凶", weight: 7, stars: 1, color: "#2b2b33", poem: ["物極必反否極泰來，今日低調明日好", "逆境正是磨練時，把籤綁好轉好運"] },
];

const ASPECTS = ["工作", "財運", "感情", "健康"] as const;
type Aspect = (typeof ASPECTS)[number];

const MESSAGES: Record<Aspect, { good: string[]; mid: string[]; bad: string[] }> = {
  工作: {
    good: ["靈感源源不絕，適合提出新想法", "效率極佳，拖延的任務一口氣完成", "容易得到主管或同事的肯定"],
    mid: ["按照計畫進行就不會出錯", "適合整理與收尾，不宜開新坑", "多確認一次細節會更安心"],
    bad: ["溝通容易誤會，訊息請多看一遍", "容易分心，試試番茄鐘幫助專注", "避免做重大決定，明天再說"],
  },
  財運: {
    good: ["有意外之財的機會", "適合規劃理財，眼光精準", "買東西容易遇到好折扣"],
    mid: ["收支平衡，維持現狀就好", "小額花費帶來小確幸", "記帳會讓你發現省錢空間"],
    bad: ["容易衝動購物，購物車先放著", "借錢出去要三思", "注意小額支出積少成多"],
  },
  感情: {
    good: ["桃花朵朵開，魅力大增", "與重要的人有甜蜜互動", "主動聯絡會有好消息"],
    mid: ["平淡中見真情", "適合與朋友聚聚聊聊", "多一點傾聽，關係更融洽"],
    bad: ["說話容易太直，記得多點溫柔", "別為小事鬧脾氣", "給彼此一點空間比較好"],
  },
  健康: {
    good: ["精神飽滿、活力十足", "適合運動，身體狀態很好", "睡眠品質佳，一夜好眠"],
    mid: ["記得多喝水、起來走走", "作息正常就沒問題", "適度伸展舒緩肩頸"],
    bad: ["容易疲累，今天早點睡", "注意飲食，少吃生冷", "眼睛需要休息，少滑手機"],
  },
};

const LUCKY_COLORS = ["紅色", "金色", "白色", "粉紅色", "天藍色", "草綠色", "紫色", "橘色", "米色", "黑色"];
const LUCKY_ITEMS = ["一杯熱茶", "藍色的筆", "耳機", "小盆栽", "巧克力", "手帕", "書籤", "零錢包", "香氛", "便利貼"];
const DIRECTIONS = ["東", "南", "西", "北", "東南", "東北", "西南", "西北"];

type Fortune = {
  number: number;
  level: Level;
  poem: string;
  aspects: { name: Aspect; stars: number; message: string }[];
  color: string;
  luckyNumber: number;
  item: string;
  direction: string;
  date: string;
};

const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

function pickLevel() {
  const total = LEVELS.reduce((sum, l) => sum + l.weight, 0);
  let r = Math.random() * total;
  for (const level of LEVELS) {
    r -= level.weight;
    if (r < 0) return level;
  }
  return LEVELS[LEVELS.length - 1];
}

function drawFortune(): Fortune {
  const level = pickLevel();
  const aspects = ASPECTS.map((name) => {
    // 各項運勢以總籤為基準，上下浮動一顆星
    const stars = Math.min(5, Math.max(1, level.stars + Math.floor(Math.random() * 3) - 1));
    const pool = MESSAGES[name];
    const message = pick(stars >= 4 ? pool.good : stars === 3 ? pool.mid : pool.bad);
    return { name, stars, message };
  });
  const now = new Date();
  return {
    number: Math.floor(Math.random() * 100) + 1,
    level,
    poem: pick(level.poem),
    aspects,
    color: pick(LUCKY_COLORS),
    luckyNumber: Math.floor(Math.random() * 9) + 1,
    item: pick(LUCKY_ITEMS),
    direction: pick(DIRECTIONS),
    date: `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日`,
  };
}

const CHINESE_DIGITS = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

// 1~100 轉成國字，例如 42 → 四十二
function toChineseNumber(n: number) {
  if (n === 100) return "一百";
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const tensText = tens === 0 ? "" : tens === 1 ? "十" : `${CHINESE_DIGITS[tens]}十`;
  return tensText + (ones ? CHINESE_DIGITS[ones] : "");
}

function Stars({ count }: { count: number }) {
  return (
    <span className="text-lg tracking-tight" aria-label={`${count} 顆星`}>
      <span className="text-[#f4a91c]">{"★".repeat(count)}</span>
      <span className="text-[#ecdcb0]">{"★".repeat(5 - count)}</span>
    </span>
  );
}

/* ---------- 插畫元件 ---------- */

// 頂端的「好運連連」銅錢
function Coin({ char }: { char: string }) {
  return (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] bg-[#ffd23f] shadow-[0_4px_0_#3b1d1d] sm:h-20 sm:w-20"
      style={{ borderColor: INK }}
    >
      <div
        className="flex h-[78%] w-[78%] items-center justify-center rounded-full border-[3px] bg-[#e0261b] text-2xl font-black text-white sm:text-3xl"
        style={{ borderColor: INK }}
      >
        {char}
      </div>
    </div>
  );
}

// 一支籤：尖頂、紅外框、金色內框；label 為直書文字
function Stick({ angle, length, label, fill }: { angle: number; length: number; label?: string; fill: string }) {
  const top = 210 - length;
  return (
    <g transform={`rotate(${angle} 150 300)`}>
      <path
        d={`M 128 210 L 128 ${top + 22} L 150 ${top} L 172 ${top + 22} L 172 210 Z`}
        fill={fill}
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path
        d={`M 135 210 L 135 ${top + 26} L 150 ${top + 11} L 165 ${top + 26} L 165 210 Z`}
        fill={GOLD}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d={`M 141 210 L 141 ${top + 32} L 150 ${top + 23} L 159 ${top + 32} L 159 210 Z`} fill={fill} />
      {label &&
        [...label].map((ch, i) => (
          <text
            key={i}
            x={150}
            y={top + 60 + i * 26}
            textAnchor="middle"
            fontSize={label.length > 2 ? 18 : 22}
            fontWeight={900}
            fill={INK}
            stroke={GOLD}
            strokeWidth={5}
            paintOrder="stroke"
          >
            {ch}
          </text>
        ))}
    </g>
  );
}

function FortuneScene({ shaking, fortune }: { shaking: boolean; fortune: Fortune | null }) {
  const centerLabel = shaking ? "…" : fortune ? fortune.level.name : "求籤";
  const centerFill = fortune && !shaking ? fortune.level.color : RED;

  return (
    <svg viewBox="0 0 300 360" className="w-full max-w-[360px] overflow-visible">
      {/* 裝飾：元寶、綠珠、銅錢燈籠 */}
      <g stroke={INK} strokeWidth={3} strokeLinejoin="round">
        <path d="M 6 200 Q 10 228 42 230 Q 74 228 78 200 Q 64 210 42 210 Q 20 210 6 200 Z" fill={GOLD} />
        <ellipse cx={42} cy={196} rx={18} ry={14} fill={GOLD} />
        <path d="M 4 198 Q 20 186 26 196" fill="none" />
        <circle cx={278} cy={96} r={13} fill="#5fbf4a" />
        <circle cx={274} cy={92} r={4} fill="#d6f5c9" stroke="none" />
        <circle cx={34} cy={300} r={17} fill="#5fbf4a" />
        <circle cx={29} cy={295} r={5} fill="#d6f5c9" stroke="none" />
        <circle cx={268} cy={262} r={26} fill={RED} />
        <circle cx={268} cy={262} r={17} fill={GOLD_DARK} />
        <path d="M 268 251 L 271 259 L 279 262 L 271 265 L 268 273 L 265 265 L 257 262 L 265 259 Z" fill={INK} stroke="none" />
      </g>

      {/* 籤枝（在筒子後面），搖動時跟筒子一起動 */}
      <g className={shaking ? "origin-bottom animate-shake [transform-box:fill-box]" : ""}>
        <Stick angle={-34} length={120} fill={RED} />
        <Stick angle={34} length={120} fill={RED} />
        <Stick angle={-17} length={140} fill={RED} />
        <Stick angle={17} length={140} fill={RED} />
        <g
          style={{
            transform: fortune && !shaking ? "translateY(-30px)" : "none",
            transition: "transform 0.6s cubic-bezier(0.2, 1.4, 0.4, 1)",
          }}
        >
          <Stick angle={0} length={165} label={centerLabel} fill={centerFill} />
        </g>

        {/* 六角籤筒 */}
        <g stroke={INK} strokeWidth={3} strokeLinejoin="round">
          <path d="M 70 196 L 104 186 L 104 340 L 70 326 Z" fill={GOLD_DARK} />
          <path d="M 196 186 L 230 196 L 230 326 L 196 340 Z" fill={GOLD_DARK} />
          <rect x={104} y={186} width={92} height={154} fill={GOLD} />
          {/* 筒口 */}
          <path d="M 62 192 L 104 178 L 196 178 L 238 192 L 230 202 L 196 194 L 104 194 L 70 202 Z" fill={GOLD} />
          {/* 小銅錢 */}
          <circle cx={150} cy={216} r={9} fill={GOLD_DARK} />
          <rect x={146} y={212} width={8} height={8} fill={GOLD} transform="rotate(45 150 216)" />
          <circle cx={150} cy={316} r={9} fill={GOLD_DARK} />
          <rect x={146} y={312} width={8} height={8} fill={GOLD} transform="rotate(45 150 316)" />
          {/* 中央菱形「籤」字牌 */}
          <rect x={126} y={242} width={48} height={48} rx={6} fill={TEAL} transform="rotate(45 150 266)" />
          <rect x={132} y={248} width={36} height={36} rx={4} fill={RED} transform="rotate(45 150 266)" />
        </g>
        <text x={150} y={276} textAnchor="middle" fontSize={26} fontWeight={900} fill="white">
          籤
        </text>
      </g>

      {/* 底部雲朵 */}
      <g fill={GOLD} stroke={INK} strokeWidth={3}>
        <circle cx={40} cy={350} r={34} />
        <circle cx={92} cy={340} r={28} />
        <circle cx={208} cy={340} r={28} />
        <circle cx={262} cy={350} r={34} />
        <circle cx={150} cy={362} r={30} />
      </g>
      {/* 蓋掉雲朵下半部重疊的描邊，讓底部成為一整片雲 */}
      <g fill={GOLD}>
        <circle cx={40} cy={358} r={30} />
        <circle cx={92} cy={350} r={24} />
        <circle cx={208} cy={350} r={24} />
        <circle cx={262} cy={358} r={30} />
        <rect x={40} y={352} width={222} height={30} />
      </g>
    </svg>
  );
}

export default function FortuneDraw() {
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [shaking, setShaking] = useState(false);

  function draw() {
    if (shaking) return;
    setFortune(null);
    setShaking(true);
    setTimeout(() => {
      setFortune(drawFortune());
      setShaking(false);
    }, 1500);
  }

  return (
    <main className="relative flex flex-1 flex-col items-center overflow-hidden bg-[#f15a24] px-4 pb-14 pt-10">
      {/* 放射光芒背景 */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-conic-gradient(from_0deg_at_50%_30%,#f7931e_0deg_9deg,#ef4123_9deg_18deg)] opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,214,64,0.75)_0%,transparent_45%)]" />

      <div className="relative flex w-full max-w-md flex-col items-center">
        {/* 標題牌匾 */}
        <h1
          className="rounded-xl border-[3px] bg-[#38b2a3] p-1.5 shadow-[0_4px_0_#3b1d1d]"
          style={{ borderColor: INK }}
        >
          <span
            className="block rounded-lg border-[3px] bg-[#ffd23f] px-8 py-1.5 text-2xl font-black tracking-[0.25em] sm:text-3xl"
            style={{ borderColor: INK, color: INK }}
          >
            今日行大運
          </span>
        </h1>

        <div className="mt-5 flex gap-2 sm:gap-3">
          {["好", "運", "連", "連"].map((c, i) => (
            <Coin key={i} char={c} />
          ))}
        </div>

        <button onClick={draw} disabled={shaking} aria-label="搖籤筒抽籤" className="mt-6 w-full disabled:cursor-wait">
          <FortuneScene shaking={shaking} fortune={fortune} />
        </button>

        {/* 主按鈕 */}
        <button
          onClick={draw}
          disabled={shaking}
          className="relative z-10 -mt-6 rounded-xl border-[3px] bg-[#38b2a3] p-1.5 shadow-[0_5px_0_#3b1d1d] transition active:translate-y-1 active:shadow-[0_1px_0_#3b1d1d] disabled:opacity-80"
          style={{ borderColor: INK }}
        >
          <span
            className="block rounded-lg border-[3px] bg-[#e0261b] px-12 py-2 text-2xl font-black tracking-[0.2em] text-[#ffd23f]"
            style={{ borderColor: INK }}
          >
            {shaking ? "搖籤中…" : fortune ? "再抽一次" : "試試手氣"}
          </span>
        </button>

        {/* 籤紙 */}
        {fortune && (
          <article
            className="mt-10 w-full origin-top animate-reveal overflow-hidden rounded-2xl border-[3px] bg-[#fff6dc] shadow-[6px_6px_0_#3b1d1d]"
            style={{ borderColor: INK, color: INK }}
          >
            <div
              className="flex items-center justify-between border-b-[3px] bg-[#e0261b] px-5 py-2.5 font-bold text-[#ffd23f]"
              style={{ borderColor: INK }}
            >
              <span>第 {toChineseNumber(fortune.number)} 籤</span>
              <span className="text-sm">{fortune.date}</span>
            </div>

            <div className="flex gap-5 border-b-[3px] border-dashed px-5 py-6" style={{ borderColor: GOLD_DARK }}>
              <div
                className="self-center rounded-xl border-[3px] p-1"
                style={{ borderColor: INK, background: TEAL }}
              >
                <span
                  className="block rounded-lg border-[3px] px-3 py-3 text-4xl font-black text-[#ffd23f] [text-orientation:upright] [writing-mode:vertical-rl]"
                  style={{ borderColor: INK, background: fortune.level.color }}
                >
                  {fortune.level.name}
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-center gap-2">
                <p className="text-sm font-bold opacity-60">今日運勢</p>
                <Stars count={fortune.level.stars} />
                <p className="text-lg font-black leading-relaxed">{fortune.poem}</p>
              </div>
            </div>

            <ul className="flex flex-col gap-3 px-5 py-5">
              {fortune.aspects.map((a) => (
                <li key={a.name} className="flex items-start gap-3">
                  <span
                    className="shrink-0 rounded-full border-2 px-3 py-0.5 text-sm font-black text-white"
                    style={{ borderColor: INK, background: TEAL }}
                  >
                    {a.name}
                  </span>
                  <div className="flex flex-1 flex-col">
                    <Stars count={a.stars} />
                    <p className="text-sm opacity-75">{a.message}</p>
                  </div>
                </li>
              ))}
            </ul>

            <dl
              className="grid grid-cols-2 gap-3 border-t-[3px] bg-[#ffd23f] px-5 py-4 text-sm sm:grid-cols-4"
              style={{ borderColor: INK }}
            >
              {[
                ["幸運色", fortune.color],
                ["幸運數字", fortune.luckyNumber],
                ["幸運物", fortune.item],
                ["吉方位", fortune.direction],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col items-center">
                  <dt className="opacity-70">{label}</dt>
                  <dd className="font-black text-[#e0261b]">{value}</dd>
                </div>
              ))}
            </dl>
          </article>
        )}
      </div>
    </main>
  );
}
