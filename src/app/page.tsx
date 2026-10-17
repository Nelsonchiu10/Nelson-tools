import Link from "next/link";
import { EditNameButton, NameDialog, OwnerPrefix } from "./owner-name";

const TOOLS = [
  { href: "/lottery", name: "幸運大轉盤", emoji: "🎡" },
  { href: "/pomodoro", name: "番茄鐘", emoji: "🍅" },
  { href: "/fortune", name: "好運抽籤", emoji: "🎋" },
];

const MARQUEE_WORDS = ["抽獎", "專注", "運勢", "免安裝", "免註冊", "手機也能用", "好運連連", "效率滿點"];

const SCENES = [
  { emoji: "🎉", title: "尾牙、社團抽獎", text: "把名單貼進轉盤，全場一起盯著指針倒數，氣氛直接拉滿。", tool: "幸運大轉盤", href: "/lottery" },
  { emoji: "📚", title: "讀書、趕報告", text: "專注 25 分鐘、休息 5 分鐘，分頁標題就看得到倒數。", tool: "番茄鐘", href: "/pomodoro" },
  { emoji: "☀️", title: "出門前討個好兆頭", text: "搖一搖籤筒，看看今天的工作、財運、感情與健康。", tool: "好運抽籤", href: "/fortune" },
];

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-clip bg-[#0b0814] text-white">
      {/* 全頁極光背景 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[900px] overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-violet-600/40 blur-[120px]" />
        <div className="absolute right-[-10%] top-20 h-[480px] w-[480px] rounded-full bg-rose-500/30 blur-[120px]" />
        <div className="absolute left-1/3 top-[420px] h-[400px] w-[400px] rounded-full bg-amber-400/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[56px_56px] mask-[radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      </div>

      <SiteHeader />

      <main className="relative flex-1">
        <Hero />
        <MarqueeBand />
        <ToolsBento />
        <Scenes />
        <FinalCta />
      </main>

      <SiteFooter />
      <NameDialog />
    </div>
  );
}

/* ---------- Header ---------- */

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-white/10 bg-white/5 pl-3 pr-2 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 font-black">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-violet-500 via-rose-500 to-amber-400 text-lg">
            🧰
          </span>
          <span className="hidden sm:inline">
            <OwnerPrefix />
            小工具箱
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-bold">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-full px-3 py-2 text-white/70 transition hover:bg-white/10 hover:text-white sm:px-4"
            >
              <span className="sm:hidden">{tool.emoji}</span>
              <span className="hidden sm:inline">{tool.name}</span>
            </Link>
          ))}
          <EditNameButton />
          <a
            href="#tools"
            className="ml-1 rounded-full bg-white px-4 py-2 text-[#0b0814] transition hover:bg-amber-300"
          >
            開始玩
          </a>
        </nav>
      </div>
    </header>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="relative mx-auto grid max-w-6xl items-center gap-16 px-4 pb-24 pt-16 sm:pt-24 lg:grid-cols-[1.1fr_1fr]">
      <div className="text-center lg:text-left">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/80 backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          3 個工具上線中 · 免安裝 · 免註冊
        </span>

        <h1 className="mt-8 text-6xl font-black leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl">
          <OwnerPrefix />
          <span className="mt-2 block bg-linear-to-r from-violet-400 via-rose-400 via-50% to-amber-300 bg-size-[200%_auto] bg-clip-text pb-2 text-transparent motion-safe:animate-gradient">
            小工具箱
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-white/65 sm:text-lg lg:mx-0">
          抽獎要公平、工作要專注、出門想討個好兆頭。
          <br className="hidden sm:block" />
          三個好玩又實用的小工具，打開瀏覽器就能用。
        </p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
          <a
            href="#tools"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-violet-500 via-rose-500 to-amber-400 px-8 py-4 text-lg font-black shadow-[0_10px_40px_rgba(244,63,94,0.45)] transition hover:scale-[1.03]"
          >
            探索工具
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
          <Link
            href="/fortune"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-lg font-bold backdrop-blur transition hover:bg-white/10"
          >
            🎋 先抽今日運勢
          </Link>
        </div>

        <dl className="mt-12 flex justify-center gap-10 lg:justify-start">
          {[
            ["3", "實用工具"],
            ["0", "需要安裝"],
            ["100%", "免費使用"],
          ].map(([value, label]) => (
            <div key={label}>
              <dt className="text-3xl font-black">{value}</dt>
              <dd className="mt-1 text-sm text-white/50">{label}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* 漂浮的工具卡片拼貼 */}
      <div className="relative mx-auto h-[360px] w-[88%] max-w-[440px] sm:h-[480px] sm:w-full">
        <Link
          href="/lottery"
          className="absolute left-0 top-4 w-[58%] -rotate-6 transition hover:z-20 hover:rotate-0 hover:scale-105"
        >
          <div className="rounded-3xl border border-white/15 bg-linear-to-br from-[#4c1d95] to-[#2a0a5e] p-5 shadow-2xl motion-safe:animate-float">
            <MiniWheel />
            <p className="mt-4 text-center font-black">🎡 幸運大轉盤</p>
          </div>
        </Link>
        <Link
          href="/pomodoro"
          className="absolute right-0 top-0 w-[48%] rotate-6 transition hover:z-20 hover:rotate-0 hover:scale-105"
        >
          <div className="rounded-3xl border border-white/60 bg-linear-to-br from-[#fdf3ee] to-[#f6ddd4] p-5 text-[#4a403c] shadow-2xl motion-safe:animate-float [animation-delay:-2s]">
            <MiniClock />
            <p className="mt-3 text-center font-black">🍅 番茄鐘</p>
          </div>
        </Link>
        <Link
          href="/fortune"
          className="absolute bottom-0 right-[8%] z-10 w-[50%] rotate-3 transition hover:z-20 hover:rotate-0 hover:scale-105"
        >
          <div className="overflow-hidden rounded-3xl border-[3px] border-[#3b1d1d] bg-[#f15a24] shadow-2xl motion-safe:animate-float [animation-delay:-4s]">
            <MiniFortune />
          </div>
        </Link>
      </div>
    </section>
  );
}

/* ---------- 跑馬燈帶 ---------- */

function MarqueeBand() {
  const words = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
  return (
    <div className="relative -rotate-2 overflow-hidden border-y-2 border-[#0b0814] bg-amber-300 py-4 text-[#0b0814]">
      <div className="flex w-max motion-safe:animate-marquee-loop">
        {words.map((w, i) => (
          <span key={i} className="flex items-center whitespace-nowrap px-6 text-2xl font-black sm:text-3xl">
            {w}
            <span className="ml-12 text-rose-600">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- 工具 Bento ---------- */

function ToolsBento() {
  return (
    <section id="tools" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-28">
      <SectionTitle eyebrow="TOOLS" title="挑一個開始玩" text="每個工具都有自己的個性，點進去就能直接使用。" />

      <div className="mt-14 grid gap-5 md:grid-cols-6">
        {/* 轉盤：大格 */}
        <Link
          href="/lottery"
          className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-linear-to-br from-[#4c1d95] via-[#3b0f7a] to-[#1e0b46] p-8 md:col-span-4 md:row-span-2"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-fuchsia-500/30 blur-3xl" />
          <ToolBadge>01 · 抽獎</ToolBadge>
          <h3 className="mt-4 text-4xl font-black">幸運大轉盤</h3>
          <p className="mt-3 max-w-sm text-white/70">
            輸入名單、按下按鈕，燈泡閃爍、轉盤飛轉，指針停在哪裡誰就是幸運兒。
          </p>
          <ul className="mt-5 flex flex-wrap gap-2 text-sm">
            {["自訂名單", "抽中自動移除", "中獎紀錄"].map((f) => (
              <li key={f} className="rounded-full bg-white/10 px-3 py-1">
                {f}
              </li>
            ))}
          </ul>
          <div className="mx-auto mt-8 w-64 max-w-full transition-transform duration-700 group-hover:scale-105 md:absolute md:-bottom-16 md:right-8 md:mt-0 md:w-80">
            <MiniWheel spinOnHover />
          </div>
          <GoArrow />
        </Link>

        {/* 番茄鐘 */}
        <Link
          href="/pomodoro"
          className="group relative overflow-hidden rounded-[2rem] border border-white/60 bg-linear-to-br from-[#fdf3ee] to-[#f6ddd4] p-8 text-[#4a403c] md:col-span-2"
        >
          <span className="inline-block rounded-full bg-[#e07a5f] px-3 py-1 text-xs font-black text-white">
            02 · 專注
          </span>
          <h3 className="mt-4 text-3xl font-black">番茄鐘</h3>
          <p className="mt-3 text-[#6b5f5a]">25 分鐘專注、5 分鐘休息，時間到響鈴提醒。</p>
          <div className="mx-auto mt-6 w-40 transition-transform duration-500 group-hover:scale-105">
            <MiniClock />
          </div>
          <GoArrow />
        </Link>

        {/* 抽籤 */}
        <Link
          href="/fortune"
          className="group relative overflow-hidden rounded-[2rem] border-[3px] border-[#3b1d1d] bg-[#f15a24] p-8 text-[#3b1d1d] md:col-span-2"
        >
          <div className="pointer-events-none absolute inset-0 bg-[repeating-conic-gradient(from_0deg_at_80%_100%,#f7931e_0deg_9deg,#ef4123_9deg_18deg)] opacity-60" />
          <div className="relative">
            <span className="inline-block rounded-full border-2 border-[#3b1d1d] bg-[#38b2a3] px-3 py-1 text-xs font-black text-white">
              03 · 運勢
            </span>
            <h3 className="mt-4 text-3xl font-black text-[#ffd23f] [-webkit-text-stroke:1.5px_#3b1d1d] [paint-order:stroke]">
              好運抽籤
            </h3>
            <p className="mt-3 font-bold text-white">從大吉到大凶，看看今天的運勢如何。</p>
            <div className="mt-5 flex justify-center gap-2">
              {["大", "吉"].map((c) => (
                <span
                  key={c}
                  className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[#3b1d1d] bg-[#ffd23f] shadow-[0_4px_0_#3b1d1d] transition-transform group-hover:-translate-y-2"
                >
                  <span className="flex h-[78%] w-[78%] items-center justify-center rounded-full border-[3px] border-[#3b1d1d] bg-[#e0261b] text-xl font-black text-white">
                    {c}
                  </span>
                </span>
              ))}
            </div>
          </div>
          <GoArrow />
        </Link>

        {/* 特色小格 */}
        {[
          ["⚡", "打開就能用", "不用安裝、不用註冊"],
          ["📱", "手機也好用", "各種螢幕都順手"],
          ["🔒", "資料留在你這", "全部在瀏覽器裡完成"],
        ].map(([icon, title, text]) => (
          <div
            key={title}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur md:col-span-2"
          >
            <span className="text-3xl">{icon}</span>
            <h3 className="mt-3 text-lg font-black">{title}</h3>
            <p className="mt-1 text-sm text-white/55">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 使用情境 ---------- */

function Scenes() {
  return (
    <section className="border-y border-white/10 bg-white/[0.02] py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle eyebrow="USE CASES" title="什麼時候用得到？" text="從辦活動到日常小儀式，總有一個派得上用場。" />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {SCENES.map((s, i) => (
            <Link
              key={s.title}
              href={s.href}
              className="group relative rounded-[2rem] border border-white/10 bg-[#120d1f] p-8 transition hover:-translate-y-1 hover:border-white/25"
            >
              <span className="absolute right-6 top-5 text-6xl font-black text-white/5">0{i + 1}</span>
              <span className="text-4xl">{s.emoji}</span>
              <h3 className="mt-5 text-xl font-black">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-white/60">{s.text}</p>
              <p className="mt-6 text-sm font-bold text-amber-300">
                用「{s.tool}」<span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 結尾 CTA ---------- */

function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-28">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-violet-600 via-rose-500 to-amber-400 px-6 py-16 text-center sm:px-16">
        <div className="pointer-events-none absolute -left-10 -top-10 text-[10rem] opacity-20 motion-safe:animate-spin-slow">
          🎡
        </div>
        <div className="pointer-events-none absolute -bottom-12 -right-6 text-[9rem] opacity-20 motion-safe:animate-float">
          🍅
        </div>
        <h2 className="relative text-4xl font-black sm:text-5xl">今天，想用哪一個？</h2>
        <p className="relative mt-4 text-lg text-white/85">選一個，馬上開始。</p>
        <div className="relative mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-full bg-[#0b0814] px-7 py-3.5 font-black transition hover:scale-105 hover:bg-black"
            >
              {tool.emoji} {tool.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function SiteFooter() {
  return (
    <footer className="relative border-t border-white/10">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-[2fr_1fr]">
        <div>
          <p className="flex items-center gap-2 text-xl font-black">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-violet-500 via-rose-500 to-amber-400">
              🧰
            </span>
            <span>
              <OwnerPrefix />
              小工具箱
            </span>
          </p>
          <p className="mt-4 max-w-sm leading-relaxed text-white/50">
            一些讓生活更順手、更有趣的小工具，持續增加中。
          </p>
        </div>
        <div>
          <p className="font-bold text-white/90">工具</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {TOOLS.map((tool) => (
              <li key={tool.href}>
                <Link href={tool.href} className="text-white/55 transition hover:text-white">
                  {tool.emoji} {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-4 py-6 text-sm text-white/40 sm:flex-row">
          <p>© 2026 小工具箱 · Made by Nelson</p>
          <p>Made with Next.js & Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}

/* ---------- 共用小元件 ---------- */

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="text-center">
      <p className="text-sm font-black tracking-[0.35em] text-rose-400">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-black sm:text-5xl">{title}</h2>
      <p className="mt-4 text-white/55">{text}</p>
    </div>
  );
}

function ToolBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-black backdrop-blur">
      {children}
    </span>
  );
}

function GoArrow() {
  return (
    <span className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black text-[#0b0814] transition group-hover:rotate-[-45deg] group-hover:scale-110">
      →
    </span>
  );
}

/* ---------- 工具迷你插圖 ---------- */

function MiniWheel({ spinOnHover = false }: { spinOnHover?: boolean }) {
  return (
    <div className="relative">
      <div className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 -translate-y-1 border-x-[10px] border-t-[20px] border-x-transparent border-t-white drop-shadow" />
      <div className="rounded-full bg-linear-to-br from-pink-300 to-orange-400 p-[7%] shadow-[0_0_40px_rgba(236,72,153,0.55)]">
        <div
          className={`aspect-square rounded-full bg-[conic-gradient(#fff3df_0_45deg,#ffc98b_45deg_90deg,#fff3df_90deg_135deg,#ffc98b_135deg_180deg,#fff3df_180deg_225deg,#ffc98b_225deg_270deg,#fff3df_270deg_315deg,#ffc98b_315deg_360deg)] ${
            spinOnHover
              ? "transition-transform duration-[2s] ease-out group-hover:rotate-[720deg]"
              : "motion-safe:animate-spin-slow"
          }`}
        />
      </div>
      <div className="absolute left-1/2 top-1/2 h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-amber-300 bg-red-500" />
    </div>
  );
}

// 角度以「12 點鐘方向、順時針」為 0 度
function clockPoint(angle: number, r: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: Math.round(r * Math.sin(rad) * 100) / 100, y: Math.round(-r * Math.cos(rad) * 100) / 100 };
}

// 與番茄鐘頁面相同的指針倒數時鐘：整圈 25 分鐘，示意還剩 18 分鐘
function MiniClock() {
  const TOTAL = 25;
  const REMAINING = 18;
  const angle = (REMAINING / TOTAL) * 360;
  const edge = clockPoint(angle, 80);
  const hand = clockPoint(angle, 66);

  return (
    <svg viewBox="-115 -115 230 230" className="w-full drop-shadow-[0_10px_20px_rgba(120,90,80,0.2)]">
      <circle r={112} fill="#f7d9cf" />
      <circle r={104} fill="#fffdfa" />
      <path d={`M 0 0 L 0 -80 A 80 80 0 ${angle > 180 ? 1 : 0} 1 ${edge.x} ${edge.y} Z`} fill="#e07a5f" opacity={0.85} />
      {Array.from({ length: TOTAL }, (_, i) => {
        const major = i % 5 === 0;
        const a = clockPoint((i / TOTAL) * 360, major ? 80 : 85);
        const b = clockPoint((i / TOTAL) * 360, 90);
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#8b7d77"
            strokeWidth={major ? 3 : 1.5}
            strokeLinecap="round"
          />
        );
      })}
      {[0, 5, 10, 15, 20].map((m) => {
        const p = clockPoint((m / TOTAL) * 360, 98);
        return (
          <text key={m} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill="#8b7d77">
            {m}
          </text>
        );
      })}
      <line x1={0} y1={0} x2={hand.x} y2={hand.y} stroke="#4a403c" strokeWidth={7} strokeLinecap="round" />
      <circle r={9} fill="#4a403c" />
      <circle r={4} fill="#e07a5f" />
    </svg>
  );
}

function MiniFortune() {
  return (
    <div className="relative flex flex-col items-center px-4 pb-4 pt-5">
      <div className="pointer-events-none absolute inset-0 bg-[repeating-conic-gradient(from_0deg_at_50%_40%,#f7931e_0deg_9deg,#ef4123_9deg_18deg)] opacity-70" />
      <div className="relative flex items-end gap-1.5">
        {[-14, 0, 14].map((rot, i) => (
          <div
            key={rot}
            className="flex w-9 justify-center rounded-t-md border-[3px] border-[#3b1d1d] bg-[#e0261b] pt-2"
            style={{ height: i === 1 ? 92 : 72, transform: `rotate(${rot}deg)`, transformOrigin: "bottom" }}
          >
            {i === 1 && (
              <span className="text-sm font-black leading-tight text-[#ffd23f] [writing-mode:vertical-rl]">
                大吉
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="relative -mt-2 flex h-16 w-28 items-center justify-center rounded-b-lg border-[3px] border-[#3b1d1d] bg-[#ffd23f]">
        <span className="flex h-9 w-9 rotate-45 items-center justify-center rounded-md border-[3px] border-[#3b1d1d] bg-[#e0261b]">
          <span className="-rotate-45 text-sm font-black text-white">籤</span>
        </span>
      </div>
      <p className="relative mt-3 rounded-full border-2 border-[#3b1d1d] bg-[#ffd23f] px-4 py-0.5 text-sm font-black text-[#3b1d1d]">
        🎋 好運抽籤
      </p>
    </div>
  );
}
