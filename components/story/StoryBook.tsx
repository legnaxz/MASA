"use client";

import { useEffect, useRef, useState } from "react";
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

/** 이야기 한 권을 한 장으로 길게 보여 준다. 끝까지 읽고 버튼을 누르면 대분류 선택 화면으로 돌아간다. */
export default function StoryBook({ story, onFinish, onClose }: { story: Story; onFinish: () => void; onClose: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const chars = story.pages.reduce((n, p) => n + p.bubbles.join("").length, 0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 1);
  };

  const jump = (i: number) => scrollRef.current?.querySelector(`#sec-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal aria-label={story.title} onClick={onClose}>
      <div className="book flex h-[100dvh] w-full max-w-3xl flex-col overflow-hidden sm:h-auto sm:max-h-[92dvh] sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <header className="relative flex items-center gap-2 border-b border-[var(--line)] px-4 py-2.5">
          <span className="text-xl" aria-hidden>
            {story.icon}
          </span>
          <h2 className="font-serif-kr truncate text-lg font-bold">{story.title}</h2>
          <span className="shrink-0 text-xs text-[var(--muted)]">{story.tagline}</span>
          <button onClick={onClose} className="ml-auto rounded-full px-2.5 py-1 text-lg text-[var(--muted)] hover:bg-[var(--line)]" aria-label="닫기">
            ✕
          </button>
          <span className="absolute bottom-0 left-0 h-[3px] bg-[var(--accent)] transition-[width]" style={{ width: `${progress * 100}%` }} aria-hidden />
        </header>

        <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto scroll-smooth">
          {/* 마사 선생의 안내와 목차 */}
          <div className="flex items-start gap-3 px-4 pb-2 pt-4 sm:px-6">
            <Guide size={56} />
            <div className="bubble flex-1 rounded-2xl px-4 py-3 text-[15px] leading-relaxed">
              <p>
                마사 선생이 <b className="text-[var(--accent)]">{story.title}</b> 이야기를 {story.pages.length}개 주제, 약 {Math.round(chars / 100) * 100}자로 풀어 드릴게요. 천천히 내려가며 읽어 보세요.
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-1.5 px-4 pb-4 sm:px-6" aria-label="목차">
            {story.pages.map((p, i) => (
              <button key={i} onClick={() => jump(i)} className="toc-chip rounded-full px-2.5 py-1 text-xs">
                {i + 1}. {p.title}
              </button>
            ))}
          </nav>

          {story.pages.map((p, i) => (
            <section key={i} id={`sec-${i}`} className="story-section scroll-mt-2 border-t border-[var(--line)]">
              <div className="relative">
                <Scene scene={p.scene} />
                {p.badges && p.badges.length > 0 && (
                  <div className="absolute bottom-2 right-2 flex flex-wrap justify-end gap-1">
                    {p.badges.map((b) => (
                      <span key={b} className="rounded-md bg-black/45 px-1.5 py-0.5 text-[11px] text-white">
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-4 pb-7 pt-4 sm:px-7">
                <h3 className="font-serif-kr text-xl font-bold leading-snug">
                  <span className="mr-1.5 text-[var(--accent)]">{i + 1}.</span>
                  {p.title}
                </h3>
                <div className="mt-3 space-y-3 text-[16px] leading-[1.85]">
                  {p.bubbles.map((b, bi) => (
                    <p key={bi} className="whitespace-pre-line">
                      {parse(b).map((s, si) =>
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
            </section>
          ))}

          <div className="border-t border-[var(--line)] px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-7">
            <button
              onClick={() => {
                onFinish();
                onClose();
              }}
              className="draw-btn font-serif-kr w-full rounded-xl py-3 text-lg font-bold"
            >
              ✓ 다 읽었어요 · 다른 이야기 고르기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
