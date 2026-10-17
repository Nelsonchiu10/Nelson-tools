"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";

type Mode = "focus" | "short" | "long";

const MODES: Record<Mode, { label: string; bg: string; accent: string }> = {
  focus: { label: "專注", bg: "from-rose-500 to-red-700", accent: "text-red-600" },
  short: { label: "短休息", bg: "from-teal-400 to-emerald-700", accent: "text-emerald-700" },
  long: { label: "長休息", bg: "from-sky-400 to-indigo-700", accent: "text-indigo-700" },
};

// 每完成幾個番茄就進入長休息
const LONG_BREAK_EVERY = 4;
const RING_RADIUS = 120;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

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
  const progress = total > 0 ? 1 - remaining / total : 0;

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
      className={`flex flex-1 flex-col items-center bg-linear-to-br ${MODES[mode].bg} px-4 py-10 text-white transition-colors duration-700`}
    >
      <h1 className="text-3xl font-black tracking-wide sm:text-4xl">🍅 番茄鐘</h1>

      {/* 模式切換 */}
      <div className="mt-6 flex rounded-full bg-black/20 p-1">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m, false)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors sm:px-6 ${
              mode === m ? `bg-white ${MODES[m].accent}` : "text-white/80 hover:text-white"
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* 倒數圓環 */}
      <div className="relative mt-8 aspect-square w-full max-w-[300px]">
        <svg viewBox="0 0 280 280" className="h-full w-full -rotate-90">
          <circle cx={140} cy={140} r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={12} />
          <circle
            cx={140}
            cy={140}
            r={RING_RADIUS}
            fill="none"
            stroke="white"
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={RING_LENGTH * (1 - progress)}
            className="transition-[stroke-dashoffset] duration-200 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-6xl font-bold tabular-nums sm:text-7xl">
            {formatTime(remaining)}
          </span>
          <span className="mt-2 text-white/80">
            {running ? `${MODES[mode].label}中…` : "已暫停"}
          </span>
        </div>
      </div>

      {/* 控制按鈕 */}
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={reset}
          className="h-12 rounded-full bg-white/15 px-5 font-bold hover:bg-white/25"
        >
          重設
        </button>
        <button
          onClick={running ? pause : start}
          className={`h-16 w-40 rounded-full bg-white text-xl font-black shadow-[0_6px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.2)] ${MODES[mode].accent}`}
        >
          {running ? "暫停" : "開始"}
        </button>
        <button
          onClick={() => nextMode(false)}
          className="h-12 rounded-full bg-white/15 px-5 font-bold hover:bg-white/25"
        >
          跳過
        </button>
      </div>
      <p className="mt-3 text-sm text-white/60">按空白鍵也能開始 / 暫停</p>

      <div className="mt-10 flex w-full max-w-md flex-col gap-4">
        {/* 目前任務 */}
        <label className="flex flex-col gap-2 rounded-2xl bg-black/15 p-4">
          <span className="text-sm font-bold text-white/80">現在要專注的事</span>
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="例如：寫完週報"
            className="rounded-lg bg-white/15 px-3 py-2 text-lg text-white outline-none placeholder:text-white/50 focus:bg-white/25"
          />
        </label>

        {/* 進度 */}
        <div className="flex items-center justify-between rounded-2xl bg-black/15 p-4">
          <div>
            <p className="text-sm font-bold text-white/80">已完成番茄</p>
            <p className="mt-1 text-2xl">
              {completed > 0 ? "🍅".repeat(Math.min(completed, 12)) : "還沒有，開始第一個吧！"}
              {completed > 12 && <span className="ml-1 text-base">×{completed}</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/70">距離長休息</p>
            <div className="mt-2 flex gap-1.5">
              {Array.from({ length: LONG_BREAK_EVERY }, (_, i) => (
                <span
                  key={i}
                  className={`h-3 w-3 rounded-full ${i < cyclePosition ? "bg-white" : "bg-white/25"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 設定 */}
        <details className="rounded-2xl bg-black/15 p-4">
          <summary className="cursor-pointer font-bold text-white/80">設定</summary>
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
                  className="rounded-lg bg-white/15 px-3 py-2 text-white outline-none focus:bg-white/25 disabled:opacity-50"
                />
              </label>
            ))}
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoStart}
              onChange={(e) => setAutoStart(e.target.checked)}
              className="h-4 w-4 accent-white"
            />
            時間到自動開始下一段
          </label>
        </details>
      </div>
    </main>
  );
}
