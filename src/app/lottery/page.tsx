import type { Metadata } from "next";
import LuckyWheel from "./lucky-wheel";

export const metadata: Metadata = {
  title: "幸運大轉盤",
  description: "輸入名單，轉動轉盤抽出得獎者",
};

export default function LotteryPage() {
  return (
    <main className="relative flex flex-1 flex-col items-center overflow-hidden bg-linear-to-b from-[#2a0a5e] via-[#4c1d95] to-[#1e0b46] pb-12">
      {/* 背景光暈 */}
      <div className="pointer-events-none absolute -left-24 top-32 h-72 w-72 rounded-full bg-fuchsia-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-80 h-80 w-80 rounded-full bg-indigo-400/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
      <LuckyWheel />
    </main>
  );
}
