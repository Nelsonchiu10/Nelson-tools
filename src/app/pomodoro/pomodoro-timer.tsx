"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";

type Mode = "focus" | "short" | "long";

// 柔和配色：bg 為頁面底色漸層，color 為時鐘扇形與主按鈕色，tint 為淡色點綴
const MODES: Record<Mode, { label: string; bg: string; color: string; tint: string }> = {
  focus: { label: "專注", bg: "from-[#fdf3ee] to-[#f6ddd4]", color: "#e07a5f", tint: "#f7d9cf" },
  short: { label: "短休息", bg: "from-[#f0f8f3] to-[#d7ecdf]", color: "#5fa883", tint: "#d3eadc" },
  long: { label: "長休息", bg: "from-[#f0f4fb] to-[#d8e3f3]", color: "#6f8fc6", tint: "#d6e1f3" },
};

// 每完成幾個番茄就進入長休息
const LONG_BREAK_EVERY = 4;

// 伺服器與瀏覽器的三角函數結果在小數末幾位可能不同，取整避免 hydration 不一致
const round = (n: number) => Math.round(n * 1000) / 1000;

// 角度以「12 點鐘方向、順時針」為 0 度
function pointAt(angle: number, r: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: round(r * Math.sin(rad)), y: round(-r * Math.cos(rad)) };
}

function wedgePath(angle: number, r: number) {
  if (angle <= 0) return "";
  if (angle >= 359.99) return `M 0 ${-r} A ${r} ${r} 0 1 1 0 ${r} A ${r} ${r} 0 1 1 0 ${-r} Z`;
  const end = pointAt(angle, r);
  return `M 0 0 L 0 ${-r} A ${r} ${r} 0 ${angle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`;
}

// 數字標示間隔：優先挑能整除總分鐘數、且整圈不超過 12 個數字的最小間隔
const LABEL_STEPS = [1, 2, 3, 5, 10, 15, 30];

function pickLabelStep(totalMinutes: number) {
  const fits = LABEL_STEPS.filter((s) => totalMinutes / s <= 12);
  return fits.find((s) => totalMinutes % s === 0) ?? fits[0] ?? 60;
}

/**
 * 指針式倒數時鐘（類似 Time Timer）：
 * 整圈等於這一段的總時間（例如專注 25 分鐘），彩色扇形代表剩餘時間，
 * 隨倒數往 12 點方向縮回；指針停在扇形邊緣，指向剩餘分鐘數。
 */
function CountdownClock({ remaining, total, color, tint }: { remaining: number; total: number; color: string; tint: string }) {
  const totalMinutes = total / 60000;
  const angle = round((Math.min(remaining, total) / total) * 360);
  const hand = pointAt(angle, 66);
  const labelStep = pickLabelStep(totalMinutes);
  // 刻度間隔：短時段每 15 秒一格，一般每分鐘一格，很長的時段每 5 分鐘一格
  const tickSeconds = totalMinutes <= 10 ? 15 : totalMinutes <= 60 ? 60 : 300;
  const tickCount = Math.round((totalMinutes * 60) / tickSeconds);
  const labels = Array.from({ length: Math.ceil(totalMinutes / labelStep) }, (_, i) => i * labelStep);

  return (
    <svg viewBox="-115 -115 230 230" className="h-full w-full drop-shadow-[0_12px_24px_rgba(120,90,80,0.18)]">
      {/* 表框與表面 */}
      <circle r={112} fill={tint} />
      <circle r={104} fill="#fffdfa" />

      {/* 剩餘時間扇形 */}
      <path d={wedgePath(angle, 80)} fill={color} opacity={0.85} />

      {/* 刻度：落在數字位置的為大格 */}
      {Array.from({ length: tickCount }, (_, i) => {
        const major = (i * tickSeconds) % (labelStep * 60) === 0;
        const tickAngle = (i / tickCount) * 360;
        const a = pointAt(tickAngle, major ? 82 : 86);
        const b = pointAt(tickAngle, 90);
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#8b7d77"
            strokeWidth={major ? 2.2 : 1}
            strokeLinecap="round"
          />
        );
      })}

      {/* 分鐘數字 */}
      {labels.map((minute) => {
        const p = pointAt((minute / totalMinutes) * 360, 97);
        return (
          <text
            key={minute}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={9}
            fontWeight={700}
            fill="#8b7d77"
          >
            {minute}
          </text>
        );
      })}

      {/* 指針、中心軸 */}
      <line x1={0} y1={0} x2={hand.x} y2={hand.y} stroke="#4a403c" strokeWidth={5} strokeLinecap="round" />
      <circle r={7} fill="#4a403c" />
      <circle r={3} fill={color} />
    </svg>
  );
}

function describeRemaining(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  if (totalSeconds < 60) return `還剩 ${totalSeconds} 秒`;
  return `還剩 ${Math.ceil(totalSeconds / 60)} 分鐘`;
}

function formatTime(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// 用 Web Audio 播三聲提示音，不需要額外的音檔
function playChime() {
  try {
    const ctx = new AudioContext();
    [0, 0.35, 0.7].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.3);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {
    // 瀏覽器不支援就略過
  }
}

function notify(body: string) {
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification("番茄鐘", { body });
  }
}

export default function PomodoroTimer() {
  const [minutes, setMinutes] = useState<Record<Mode, number>>({
    focus: 25,
    short: 5,
    long: 15,
  });
  const [mode, setMode] = useState<Mode>("focus");
  const [remaining, setRemaining] = useState(25 * 60 * 1000);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [autoStart, setAutoStart] = useState(false);
  const [task, setTask] = useState("");
  // 以結束時間戳計算剩餘時間，分頁在背景被降速時也不會跑慢
  const endAtRef = useRef(0);

  const total = minutes[mode] * 60 * 1000;
  const theme = MODES[mode];

  function switchMode(next: Mode, start: boolean) {
    const ms = minutes[next] * 60 * 1000;
    setMode(next);
    setRemaining(ms);
    setRunning(start);
    if (start) endAtRef.current = Date.now() + ms;
  }

  function start() {
    endAtRef.current = Date.now() + remaining;
    setRunning(true);
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  function pause() {
    setRemaining(Math.max(0, endAtRef.current - Date.now()));
    setRunning(false);
  }

  function reset() {
    setRunning(false);
    setRemaining(total);
  }

  function nextMode(countFocus: boolean) {
    if (mode === "focus") {
      const done = countFocus ? completed + 1 : completed;
      if (countFocus) setCompleted(done);
      const isLong = countFocus && done % LONG_BREAK_EVERY === 0;
      switchMode(isLong ? "long" : "short", autoStart);
    } else {
      switchMode("focus", autoStart);
    }
  }

  function updateMinutes(target: Mode, value: number) {
    const v = Math.min(120, Math.max(1, Math.round(value) || 1));
    setMinutes((m) => ({ ...m, [target]: v }));
    if (target === mode && !running) setRemaining(v * 60 * 1000);
  }

  const onFinish = useEffectEvent(() => {
    playChime();
    notify(mode === "focus" ? "專注時間結束，休息一下吧！" : "休息結束，繼續加油！");
    nextMode(true);
  });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const left = endAtRef.current - Date.now();
      if (left <= 0) {
        clearInterval(id);
        setRemaining(0);
        onFinish();
      } else {
        setRemaining(left);
      }
    }, 200);
    return () => clearInterval(id);
  }, [running, mode]);

  // 在瀏覽器分頁標題顯示倒數
  useEffect(() => {
    const original = document.title;
    document.title = `${formatTime(remaining)} · ${MODES[mode].label} | 番茄鐘`;
    return () => {
      document.title = original;
    };
  }, [remaining, mode]);

  const onSpaceKey = useEffectEvent((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (e.code !== "Space" || tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;
    e.preventDefault();
    if (running) pause();
    else start();
  });

  useEffect(() => {
    window.addEventListener("keydown", onSpaceKey);
    return () => window.removeEventListener("keydown", onSpaceKey);
  }, []);

  const cyclePosition = completed % LONG_BREAK_EVERY;

  return (
    <main
      className={`flex flex-1 flex-col items-center bg-linear-to-br ${theme.bg} px-4 py-10 text-[#4a403c] transition-colors duration-700`}
    >
      <h1 className="text-3xl font-black tracking-wide sm:text-4xl">🍅 番茄鐘</h1>

      {/* 模式切換 */}
      <div className="mt-6 flex rounded-full bg-white/55 p-1 shadow-sm backdrop-blur">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m, false)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors sm:px-6 ${
              mode === m ? "bg-white shadow-sm" : "text-[#8b7d77] hover:text-[#4a403c]"
            }`}
            style={mode === m ? { color: MODES[m].color } : undefined}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* 指針倒數時鐘 */}
      <div className="mt-8 aspect-square w-full max-w-[320px]">
        <CountdownClock remaining={remaining} total={total} color={theme.color} tint={theme.tint} />
      </div>
      <p className="mt-4 text-lg font-bold">
        {describeRemaining(remaining)}
        <span className="ml-2 text-sm font-normal text-[#8b7d77]">
          {running ? `· ${theme.label}中` : "· 已暫停"}
        </span>
      </p>

      {/* 控制按鈕 */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={reset}
          className="h-12 rounded-full bg-white/60 px-5 font-bold text-[#6b5f5a] shadow-sm hover:bg-white/90"
        >
          重設
        </button>
        <button
          onClick={running ? pause : start}
          className="h-16 w-40 rounded-full text-xl font-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition hover:brightness-105 active:translate-y-0.5"
          style={{ background: theme.color }}
        >
          {running ? "暫停" : "開始"}
        </button>
        <button
          onClick={() => nextMode(false)}
          className="h-12 rounded-full bg-white/60 px-5 font-bold text-[#6b5f5a] shadow-sm hover:bg-white/90"
        >
          跳過
        </button>
      </div>
      <p className="mt-3 text-sm text-[#8b7d77]">按空白鍵也能開始 / 暫停</p>

      <div className="mt-10 flex w-full max-w-md flex-col gap-4">
        {/* 目前任務 */}
        <label className="flex flex-col gap-2 rounded-2xl bg-white/55 p-4 shadow-sm">
          <span className="text-sm font-bold text-[#8b7d77]">現在要專注的事</span>
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="例如：寫完週報"
            className="rounded-lg bg-white/80 px-3 py-2 text-lg outline-none placeholder:text-[#b8aca6] focus:bg-white"
          />
        </label>

        {/* 進度 */}
        <div className="flex items-center justify-between rounded-2xl bg-white/55 p-4 shadow-sm">
          <div>
            <p className="text-sm font-bold text-[#8b7d77]">已完成番茄</p>
            <p className={`mt-1 ${completed > 0 ? "text-2xl" : "text-base"}`}>
              {completed > 0 ? "🍅".repeat(Math.min(completed, 12)) : "還沒有，開始第一個吧！"}
              {completed > 12 && <span className="ml-1 text-base">×{completed}</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#8b7d77]">距離長休息</p>
            <div className="mt-2 flex gap-1.5">
              {Array.from({ length: LONG_BREAK_EVERY }, (_, i) => (
                <span
                  key={i}
                  className="h-3 w-3 rounded-full"
                  style={{ background: i < cyclePosition ? theme.color : theme.tint }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 設定 */}
        <details className="rounded-2xl bg-white/55 p-4 shadow-sm">
          <summary className="cursor-pointer font-bold text-[#8b7d77]">設定</summary>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {(Object.keys(MODES) as Mode[]).map((m) => (
              <label key={m} className="flex flex-col gap-1 text-sm">
                {MODES[m].label}（分鐘）
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={minutes[m]}
                  disabled={running}
                  onChange={(e) => updateMinutes(m, Number(e.target.value))}
                  className="rounded-lg bg-white/80 px-3 py-2 outline-none focus:bg-white disabled:opacity-50"
                />
              </label>
            ))}
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoStart}
              onChange={(e) => setAutoStart(e.target.checked)}
              className="h-4 w-4"
              style={{ accentColor: theme.color }}
            />
            時間到自動開始下一段
          </label>
        </details>
      </div>
    </main>
  );
}
