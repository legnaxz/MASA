"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Story } from "@/lib/story/types";
import Guide from "./Guide";
import Scene from "./Scene";

type Seg = { text: string; bold: boolean };

function parse(s: string): Seg[] {
  return s
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((t) => (t.startsWith("**") ? { text: t.slice(2, -2), bold: true } : { text: t, bold: false }));
}

/** 이야기 한 권. 마지막 장을 넘기면 닫히고 대분류 선택 화면으로 돌아간다. */
export default function StoryBook({
  story,
  onFinish,
  onClose,
}: {
  story: Story;
  onFinish: () => void;
  onClose: () => void;
}) {
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const p = story.pages[page];
  const isLast = page === story.pages.length - 1;
  const scrollRef = useRef<HTMLDivElement>(null);

  const bubbles = useMemo(() => p.bubbles.map(parse), [p]);

  const go = (d: 1 | -1) => {
    const np = page + d;
    if (np < 0) return;
    if (np >= story.pages.length) {
      onFinish();
      onClose();
      return;
    }
    setDir(d === 1 ? "next" : "prev");
    setPage(np);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  // 키보드
  const goRef = useRef(go);
  goRef.current = go;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goRef.current(1);
      if (e.key === "ArrowLeft") goRef.current(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // 스와이프
  const startX = useRef<number | null>(null);
  const pageKey = `${story.id}-${page}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal aria-label={story.title} onClick={onClose}>
      <div className="book flex max-h-[100dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        {/* 상단 바 */}
        <header className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-2.5">
          <span className="text-xl" aria-hidden>
            {story.icon}
          </span>
          <h2 className="font-serif-kr truncate text-lg font-bold">{story.title}</h2>
          <span className="shrink-0 text-xs text-[var(--muted)]">
            {page + 1} / {story.pages.length}
          </span>
          <button onClick={onClose} className="ml-auto rounded-full px-2.5 py-1 text-lg text-[var(--muted)] hover:bg-[var(--line)]" aria-label="닫기">
            ✕
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {/* 그림 */}
          <div
            key={pageKey}
            className={`relative touch-pan-y ${dir === "next" ? "page-turn-next" : "page-turn-prev"}`}
            onPointerDown={(e) => (startX.current = e.clientX)}
            onPointerUp={(e) => {
              if (startX.current === null) return;
              const dx = e.clientX - startX.current;
              startX.current = null;
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            }}
          >
            <Scene scene={p.scene} />
            <div className="absolute left-3 top-3 max-w-[85%] rounded-full bg-[var(--card)]/90 px-3 py-1 shadow-sm">
              <h3 className="font-serif-kr truncate text-[15px] font-bold">{p.title}</h3>
            </div>
            {p.badges && (
              <div className="absolute bottom-2 right-2 flex flex-wrap justify-end gap-1">
                {p.badges.map((b) => (
                  <span key={b} className="rounded-md bg-black/45 px-1.5 py-0.5 text-[11px] text-white">
                    {b}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 마사 선생의 말풍선 — 한 번에 전부 보여준다 */}
          <div className="flex items-start gap-2 px-3 pb-3 pt-4 sm:px-5">
            <div className="flex flex-col items-center">
              <Guide size={60} />
              <span className="font-serif-kr mt-0.5 text-[11px] text-[var(--muted)]">마사 선생</span>
            </div>
            <div key={pageKey} className="bubble bubble-in relative flex-1 space-y-2.5 rounded-2xl px-4 py-3 text-[15px] leading-relaxed">
              {bubbles.map((segs, bi) => (
                <p key={bi} className="whitespace-pre-line">
                  {segs.map((s, si) =>
                    s.bold ? (
                      <b key={si} className="text-[var(--accent)]">
                        {s.text}
                      </b>
                    ) : (
                      <span key={si}>{s.text}</span>
                    ),
                  )}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* 아래 넘기기 */}
        <footer className="flex items-center gap-3 border-t border-[var(--line)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button onClick={() => go(-1)} disabled={page === 0} className="nav-btn shrink-0 rounded-xl px-4 py-2 disabled:opacity-30">
            ◀ 이전
          </button>
          <div className="flex flex-1 justify-center gap-1.5">
            {story.pages.map((_, i) => (
              <span key={i} className={`h-2 rounded-full transition-all ${i === page ? "w-5 bg-[var(--ink)]" : "w-2 bg-[var(--line)]"}`} />
            ))}
          </div>
          <button onClick={() => go(1)} className="nav-btn nav-primary shrink-0 rounded-xl px-4 py-2 font-medium">
            {!isLast ? "다음 ▶" : "✓ 다른 이야기 고르기"}
          </button>
        </footer>
      </div>
    </div>
  );
}
