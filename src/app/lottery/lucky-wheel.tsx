"use client";

import { useMemo, useState } from "react";

const SLICE_COLORS = ["#fff3df", "#ffc98b"];
// 名單為奇數時，最後一格用第三個顏色，避免和第一格同色相鄰
const ODD_LAST_COLOR = "#ffdcae";
const BULB_COUNT = 20;
const SPIN_SECONDS = 5;
const RADIUS = 100;
const TEXT_RADIUS = 70;

// 伺服器與瀏覽器的三角函數結果在小數末幾位可能不同，取整避免 hydration 不一致
const round = (n: number) => Math.round(n * 1000) / 1000;

// 角度以「12 點鐘方向、順時針」為 0 度
function pointAt(angle: number, r: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: round(r * Math.sin(rad)), y: round(-r * Math.cos(rad)) };
}

function slicePath(start: number, end: number) {
  const a = pointAt(start, RADIUS);
  const b = pointAt(end, RADIUS);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M 0 0 L ${a.x} ${a.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${b.x} ${b.y} Z`;
}

function truncate(name: string, max: number) {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

export default function LuckyWheel() {
  const [input, setInput] = useState("小明\n小華\n小美\n阿強\n小芳\n大偉");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [removeWinner, setRemoveWinner] = useState(false);

  const names = useMemo(
    () =>
      input
        .split("\n")
        .map((n) => n.trim())
        .filter(Boolean),
    [input],
  );

  const sliceAngle = names.length > 0 ? 360 / names.length : 360;
  const fontSize = 14;
  const arcAtText =
    names.length < 2 ? 2 * TEXT_RADIUS : (2 * Math.PI * TEXT_RADIUS) / names.length;
  const canSpin = !spinning && names.length >= 2;

  const tickerItems =
    history.length > 0
      ? history.slice(0, 10).map((n) => `🎉 恭喜 ${n} 中獎！`)
      : ["歡迎來到幸運大轉盤", "在下方輸入名單，點擊「立即抽獎」開始"];

  function spin() {
    if (!canSpin) return;

    const index = Math.floor(Math.random() * names.length);
    // 在扇形內隨機偏移一點，避免每次都停在正中央
    const jitter = (Math.random() - 0.5) * sliceAngle * 0.7;
    const targetAngle = (index + 0.5) * sliceAngle + jitter;
    // 轉盤順時針轉 R 度後，指針（12 點鐘）會指向轉盤上的 -R 度
    const target = (((360 - targetAngle) % 360) + 360) % 360;
    const current = ((rotation % 360) + 360) % 360;
    const delta = (((target - current) % 360) + 360) % 360;

    setWinner(null);
    setPendingIndex(index);
    setSpinning(true);
    setRotation(rotation + 360 * 6 + delta);
  }

  function handleSpinEnd() {
    if (pendingIndex === null) return;
    const name = names[pendingIndex];
    setSpinning(false);
    setPendingIndex(null);
    setWinner(name);
    setHistory((h) => [name, ...h]);
    if (removeWinner) {
      const lines = input.split("\n");
      const at = lines.findIndex((l) => l.trim() === name);
      if (at !== -1) {
        lines.splice(at, 1);
        setInput(lines.join("\n"));
      }
    }
  }

  return (
    <div className="relative z-10 flex w-full flex-col items-center">
      {/* 跑馬燈 */}
      <div className="w-full overflow-hidden bg-black/30 py-1.5 text-sm text-amber-100">
        <div className="inline-block animate-marquee whitespace-nowrap pl-[100%]">
          {tickerItems.map((t, i) => (
            <span key={i} className="mr-16">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* 標題 */}
      <h1
        className={`mt-8 -skew-x-6 [filter:drop-shadow(0_3px_0_#db2777)_drop-shadow(0_6px_10px_rgba(0,0,0,0.35))] bg-linear-to-b from-white via-yellow-100 to-amber-300 bg-clip-text text-5xl font-black tracking-widest text-transparent sm:text-6xl`}
      >
        幸運大轉盤
      </h1>
      <p className="mt-3 rounded-full bg-black/25 px-4 py-1 text-sm text-violet-100">
        本次名單共 {names.length} 人
      </p>

      <div className="mt-8 flex w-full max-w-5xl flex-col items-center gap-10 px-4 lg:flex-row lg:items-start lg:justify-center">
        {/* 轉盤舞台 */}
        <section className="flex w-full max-w-[440px] flex-col items-center">
          <div className="relative z-10 aspect-square w-full">
            {/* 外圈 + 燈泡（不轉動） */}
            <svg
              viewBox="-110 -110 220 220"
              className="absolute inset-0 h-full w-full drop-shadow-[0_0_25px_rgba(236,72,153,0.6)]"
            >
              <defs>
                <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f9a8d4" />
                  <stop offset="50%" stopColor="#f472b6" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
              </defs>
              <circle r={109} fill="url(#rim)" />
              <circle r={95} fill="#9d174d" />
              {Array.from({ length: BULB_COUNT }, (_, i) => {
                const p = pointAt((i * 360) / BULB_COUNT, 102);
                return (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={3.6}
                    fill="#fff7d6"
                    // 奇偶燈泡錯開半個週期交替閃爍，轉動時閃得更快
                    className={spinning ? "animate-bulb-fast" : "animate-bulb"}
                    style={{ animationDelay: i % 2 ? (spinning ? "0.15s" : "0.6s") : "0s" }}
                  />
                );
              })}
            </svg>

            {/* 扇形（會轉動） */}
            <div className="absolute inset-[8.2%]">
              <svg
                viewBox="-100 -100 200 200"
                className="h-full w-full"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning
                    ? `transform ${SPIN_SECONDS}s cubic-bezier(0.15, 0.85, 0.15, 1)`
                    : "none",
                }}
                onTransitionEnd={handleSpinEnd}
              >
                {names.length < 2 ? (
                  <circle r={RADIUS} fill={SLICE_COLORS[0]} />
                ) : (
                  names.map((_, i) => (
                    <path
                      key={i}
                      d={slicePath(i * sliceAngle, (i + 1) * sliceAngle)}
                      fill={
                        names.length % 2 === 1 && i === names.length - 1
                          ? ODD_LAST_COLOR
                          : SLICE_COLORS[i % 2]
                      }
                      stroke="#f9a8d4"
                      strokeWidth={0.6}
                    />
                  ))
                )}
                {names.map((name, i) => {
                  const mid = round((i + 0.5) * sliceAngle);
                  const label = truncate(name, 8);
                  // 依扇形在文字位置的弧長縮放字級，避免名字超出格子
                  const size = round(
                    Math.max(5, Math.min(fontSize, (arcAtText * 0.8) / label.length)),
                  );
                  return (
                    <text
                      key={i}
                      transform={`rotate(${mid}) translate(0 ${-TEXT_RADIUS})`}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#c2410c"
                      fontSize={size}
                      fontWeight={800}
                    >
                      {label}
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* 中央按鈕 + 指針（不轉動） */}
            <div className="absolute left-1/2 top-1/2 flex w-[26%] -translate-x-1/2 -translate-y-1/2 flex-col items-center">
              <div className="absolute bottom-[90%] h-0 w-0 border-x-[16px] border-b-[44px] border-x-transparent border-b-amber-300" />
              <div className="absolute bottom-[93%] h-0 w-0 border-x-[11px] border-b-[34px] border-x-transparent border-b-red-500" />
              <button
                onClick={spin}
                disabled={!canSpin}
                className="relative aspect-square w-full rounded-full border-[5px] border-amber-300 bg-linear-to-b from-red-400 to-red-600 text-lg font-black leading-tight text-white shadow-[0_4px_0_#7f1d1d,0_8px_16px_rgba(0,0,0,0.4)] transition-transform hover:scale-105 active:translate-y-0.5 active:shadow-[0_2px_0_#7f1d1d] disabled:cursor-not-allowed disabled:hover:scale-100 sm:text-2xl"
              >
                {spinning ? (
                  "抽獎中"
                ) : (
                  <>
                    立即
                    <br />
                    抽獎
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 底座 */}
          <div className="relative -mt-10 flex h-24 w-3/5 items-end justify-center rounded-t-[50%] bg-linear-to-b from-fuchsia-500 to-purple-800 pb-3 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
            <span className="rounded-full bg-black/30 px-4 py-1 text-sm font-bold text-amber-100">
              {names.length < 2 ? "請至少輸入兩個名字" : `名單剩餘 ${names.length} 人`}
            </span>
          </div>
          <div className="h-4 w-4/5 rounded-full bg-linear-to-b from-purple-700 to-purple-950 shadow-lg" />
        </section>

        {/* 名單面板 */}
        <aside className="flex w-full max-w-[440px] flex-col gap-4 rounded-2xl border border-white/15 bg-white/10 p-5 text-violet-50 shadow-xl backdrop-blur lg:w-80">
          <label className="flex flex-col gap-2">
            <span className="font-bold text-amber-200">
              抽獎名單（一行一個，共 {names.length} 人）
            </span>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={spinning}
              rows={10}
              placeholder="輸入名字，一行一個"
              className="resize-y rounded-xl border border-white/20 bg-black/25 p-3 text-white outline-none placeholder:text-violet-300/60 focus:border-amber-300 disabled:opacity-60"
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={removeWinner}
              onChange={(e) => setRemoveWinner(e.target.checked)}
              className="h-4 w-4 accent-amber-400"
            />
            抽中後從名單移除
          </label>

          {history.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-200">中獎紀錄</span>
                <button
                  onClick={() => setHistory([])}
                  className="text-sm text-violet-200 hover:text-white"
                >
                  清除
                </button>
              </div>
              <ol className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-xl bg-black/25 p-3">
                {history.map((name, i) => (
                  <li key={i}>
                    <span className="mr-2 text-amber-300">#{history.length - i}</span>
                    {name}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </aside>
      </div>

      {/* 中獎彈窗 */}
      {winner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setWinner(null)}
        >
          <div
            className={`flex animate-pop w-full max-w-sm flex-col items-center gap-3 rounded-3xl border-4 border-amber-300 bg-linear-to-b from-fuchsia-600 to-purple-900 p-8 text-center shadow-[0_0_40px_rgba(251,191,36,0.5)]`}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-5xl">🎉</span>
            <p className="text-lg font-bold text-amber-100">恭喜中獎</p>
            <p className="break-all text-4xl font-black text-white">{winner}</p>
            <button
              onClick={() => setWinner(null)}
              className="mt-4 rounded-full bg-linear-to-b from-amber-300 to-amber-500 px-10 py-2.5 font-bold text-red-700 shadow-[0_4px_0_#b45309] active:translate-y-0.5 active:shadow-[0_2px_0_#b45309]"
            >
              太棒了！
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
