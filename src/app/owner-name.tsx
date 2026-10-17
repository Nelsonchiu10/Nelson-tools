"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/*
 * 使用者的稱呼存在瀏覽器 localStorage：同一台裝置下次進站會記得；
 * localStorage 不會跨裝置／跨瀏覽器共用，所以換了新裝置會跳出空白的輸入視窗重新填寫。
 * - null：這台裝置還沒設定過 → 跳出歡迎視窗
 * - ""：選擇略過 → 顯示預設的「我的小工具箱」
 * - 其他：使用者的稱呼，顯示成「小明的小工具箱」
 * - undefined：伺服器端渲染時還不知道 → 先隱藏，避免名字閃一下
 */
const STORAGE_KEY = "toolbox-owner-name";
const CHANGE_EVENT = "toolbox:owner-name-change";
const EDIT_EVENT = "toolbox:edit-owner-name";
export const MAX_NAME_LENGTH = 12;

// localStorage 無法使用時（例如無痕模式被封鎖）改存在記憶體
let memoryName: string | null = null;

function readName(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return memoryName;
  }
}

function subscribe(onChange: () => void) {
  // storage 事件：同一台裝置另一個分頁改了稱呼時同步更新
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function saveName(name: string) {
  memoryName = name;
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch {
    // 存不進去就只留在記憶體
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// 中文名字直接接「的」（小明的），英文名字中間留空格（Nelson 的）
function possessive(name: string) {
  return /[㐀-鿿]$/.test(name) ? `${name}的` : `${name} 的`;
}

function useOwnerName() {
  return useSyncExternalStore<string | null | undefined>(subscribe, readName, () => undefined);
}

/** 顯示「小明 的」，沒有稱呼時顯示「我的」 */
export function OwnerPrefix() {
  const name = useOwnerName();
  return (
    <span className={`break-all transition-opacity ${name === undefined ? "opacity-0" : ""}`}>
      {name ? possessive(name) : "我的"}
    </span>
  );
}

/** Header 上的「嗨，小明 ✎」按鈕，點了可以修改稱呼 */
export function EditNameButton() {
  const name = useOwnerName();
  return (
    <button
      onClick={() => window.dispatchEvent(new Event(EDIT_EVENT))}
      className={`rounded-full px-3 py-2 text-white/70 transition hover:bg-white/10 hover:text-white ${name === undefined ? "opacity-0" : ""}`}
      aria-label="修改稱呼"
      title="修改稱呼"
    >
      <span className="hidden max-w-32 truncate align-bottom lg:inline-block">{name ? `嗨，${name}` : "設定稱呼"}</span>
      <span className="lg:ml-1">✎</span>
    </button>
  );
}

/** 首次進站時詢問稱呼的歡迎視窗；也會把瀏覽器分頁標題換成使用者的名字 */
export function NameDialog() {
  const name = useOwnerName();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const open = name === null || editing;

  useEffect(() => {
    function startEditing() {
      setDraft(readName() ?? "");
      setEditing(true);
    }
    window.addEventListener(EDIT_EVENT, startEditing);
    return () => window.removeEventListener(EDIT_EVENT, startEditing);
  }, []);

  useEffect(() => {
    if (name) document.title = `${possessive(name)}小工具箱`;
  }, [name]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim().slice(0, MAX_NAME_LENGTH);
    if (!trimmed) return;
    saveName(trimmed);
    setEditing(false);
  }

  function skip() {
    if (name === null) saveName("");
    setEditing(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onKeyDown={(e) => e.key === "Escape" && skip()}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-md animate-pop rounded-[2rem] border border-white/15 bg-[#140f22] p-8 text-center text-white shadow-[0_20px_80px_rgba(139,92,246,0.35)]"
      >
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-violet-500 via-rose-500 to-amber-400 text-3xl">
          🧰
        </span>
        <h2 className="mt-5 text-2xl font-black">{name ? "修改你的稱呼" : "歡迎來到小工具箱！"}</h2>
        <p className="mt-2 text-white/60">該怎麼稱呼你呢？我們會幫你打造專屬的工具箱。</p>

        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={MAX_NAME_LENGTH}
          placeholder="輸入你的稱呼，例如：小明"
          className="mt-6 w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-center text-lg outline-none transition placeholder:text-white/35 focus:border-rose-400 focus:bg-white/10"
        />
        {draft.trim() && (
          <p className="mt-3 text-sm text-white/50">
            預覽：<span className="font-bold text-amber-300">{possessive(draft.trim())}小工具箱</span>
          </p>
        )}

        <button
          type="submit"
          disabled={!draft.trim()}
          className="mt-6 w-full rounded-full bg-linear-to-r from-violet-500 via-rose-500 to-amber-400 py-3.5 text-lg font-black transition hover:brightness-110 disabled:opacity-40"
        >
          打開我的工具箱 →
        </button>
        <button type="button" onClick={skip} className="mt-3 text-sm text-white/45 transition hover:text-white/80">
          {name === null ? "先不用，直接逛逛" : "取消"}
        </button>
      </form>
    </div>
  );
}
