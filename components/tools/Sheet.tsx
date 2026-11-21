"use client";

import { useEffect } from "react";

/** 도구용 창 — 모바일에서는 전체 화면, 큰 화면에서는 가운데 창 */
export default function Sheet({ title, icon, onClose, children }: { title: string; icon: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal aria-label={title} onClick={onClose}>
      <div className="book flex h-[100dvh] w-full max-w-2xl flex-col overflow-hidden sm:h-auto sm:max-h-[92dvh] sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-2.5">
          <span className="text-xl" aria-hidden>
            {icon}
          </span>
          <h2 className="font-serif-kr truncate text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="ml-auto rounded-full px-2.5 py-1 text-lg text-[var(--muted)] hover:bg-[var(--line)]" aria-label="닫기">
            ✕
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
