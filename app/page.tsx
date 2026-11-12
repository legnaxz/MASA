"use client";

import { useMemo, useRef, useState } from "react";
import BirthForm, { type FormResult } from "@/components/BirthForm";
import PillarTable from "@/components/PillarTable";
import CategoryGrid from "@/components/story/CategoryGrid";
import Guide from "@/components/story/Guide";
import Scene from "@/components/story/Scene";
import StoryBook from "@/components/story/StoryBook";
import { compare } from "@/lib/saju/compat";
import { analyze, type Analysis } from "@/lib/saju/engine";
import { buildStories, coverScene, coverTitle } from "@/lib/story/build";
import { buildCoupleStory, coupleHeadline } from "@/lib/story/couple";
import { buildCoupleCards } from "@/lib/story/coupleCards";
import type { Story } from "@/lib/story/types";

interface Person {
  label: string;
  a: Analysis;
}

interface Result {
  me: Person;
  partner: Person | null;
}

export default function Home() {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [who, setWho] = useState<"us" | "me" | "partner">("us");
  const [book, setBook] = useState<{ story: Story; key: string } | null>(null);
  const [read, setRead] = useState<Set<string>>(new Set());
  const [drawId, setDrawId] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  const view = useMemo(() => {
    if (!result) return null;
    const meStories = buildStories(result.me.a);
    if (!result.partner) return { meStories, partnerStories: null, usStories: null, couple: null, compat: null };
    const compat = compare(result.me.a, result.partner.a);
    return {
      meStories,
      partnerStories: buildStories(result.partner.a),
      usStories: buildCoupleCards(compat, result.me.label, result.partner.label),
      compat,
      couple: buildCoupleStory(compat, result.me.label, result.partner.label),
    };
  }, [result]);

  const submit = (r: FormResult) => {
    try {
      const me: Person = { label: r.me.name || "나", a: analyze(r.me.birth) };
      const partner: Person | null = r.partner ? { label: r.partner.name || "상대", a: analyze(r.partner.birth) } : null;
      setResult({ me, partner });
      setWho(partner ? "us" : "me");
      setRead(new Set());
      setError(null);
      setDrawId((n) => n + 1);
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch {
      setResult(null);
      setError("날짜를 확인해 주세요. 음력 윤달이 없는 달일 수 있어요.");
    }
  };

  const personal = view && (who === "us" && view.usStories ? view.usStories : who === "partner" && view.partnerStories ? view.partnerStories : view.meStories);
  const openPersonal = (s: Story) => setBook({ story: s, key: `${who}:${s.id}` });
  const openCouple = () => view?.couple && setBook({ story: view.couple, key: "couple" });
  const readOfWho = new Set([...read].filter((k) => k.startsWith(`${who}:`)).map((k) => k.slice(who.length + 1)));

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
      <header className="mb-6 text-center">
        <p className="font-serif-kr text-sm tracking-[0.3em] text-[var(--muted)]">四柱八字</p>
        <h1 className="font-serif-kr mt-1 text-4xl font-bold">MASA</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">마사 선생이 두 사람의 사주를 그림책으로 풀어드려요</p>
      </header>

      <div className="mx-auto max-w-xl">
        <BirthForm onSubmit={submit} />
        {error && <p className="mt-3 text-center text-sm text-[#d4513f]">{error}</p>}
      </div>

      {result && view && (
        <div ref={resultRef} key={drawId} className="mt-10 grid scroll-mt-4 grid-cols-[minmax(0,1fr)] gap-6">
          {/* 표지 */}
          {view.couple && view.compat && result.partner ? (
            <section className="cover overflow-hidden rounded-3xl">
              <button className="block w-full text-left" onClick={openCouple}>
                <Scene scene={view.couple.pages[0].scene} />
              </button>
              <div className="flex items-end gap-3 px-4 pb-4 pt-3 sm:px-6">
                <Guide size={64} />
                <div className="bubble flex-1 rounded-2xl px-4 py-3">
                  <p className="font-serif-kr text-lg font-bold sm:text-xl">
                    {result.me.label} 💞 {result.partner.label} <span className="text-[var(--accent)]">궁합 온도 {view.compat.score}°</span>
                  </p>
                  <p className="mt-1 text-[15px] leading-relaxed">
                    {coupleHeadline(view.compat.score)} 두 사람이 어떻게 만나고, 어디서 부딪히고, 어떻게 함께 걸어가면 좋을지 그림책으로 준비했어요.
                  </p>
                  <button onClick={openCouple} className="draw-btn font-serif-kr mt-3 w-full rounded-xl py-2.5 text-base font-bold">
                    {read.has("couple") ? "✓ 우리 둘의 궁합 다시 보기" : "💞 우리 둘의 궁합 펼치기"}
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <section className="cover overflow-hidden rounded-3xl">
              <Scene scene={coverScene(result.me.a)} />
              <div className="flex items-end gap-3 px-4 pb-4 pt-3 sm:px-6">
                <Guide size={64} />
                <div className="bubble flex-1 rounded-2xl px-4 py-3">
                  <p className="font-serif-kr text-xl font-bold">
                    {coverTitle(result.me.a).title} <span className="text-base font-medium text-[var(--muted)]">· {coverTitle(result.me.a).subtitle}</span>
                  </p>
                  <p className="mt-1 text-[15px] leading-relaxed">
                    반가워요, 저는 마사 선생이에요. 당신의 사주 이야기를 그림책으로 준비했어요. 궁금한 이야기를 하나 골라 펼쳐 보세요.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* 각자의 이야기 */}
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif-kr text-lg font-bold">{!result.partner ? "어떤 이야기를 들려드릴까요?" : who === "us" ? "부부 관점으로 보는 이야기" : "각자의 이야기"}</h2>
              {result.partner && (
                <div className="inline-flex rounded-xl border border-[var(--line)] p-1 text-sm">
                  {(
                    [
                      ["us", "💞 우리"],
                      ["me", result.me.label],
                      ["partner", result.partner.label],
                    ] as const
                  ).map(([k, label]) => (
                    <button
                      key={k}
                      onClick={() => setWho(k)}
                      aria-pressed={who === k}
                      className={`rounded-lg px-4 py-1.5 font-medium ${who === k ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--muted)]"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {personal && <CategoryGrid key={who} stories={personal} read={readOfWho} onOpen={openPersonal} />}
          </section>

          <details className="grid gap-3">
            <summary className="panel cursor-pointer rounded-2xl px-4 py-3 font-serif-kr font-bold sm:px-5">사주 원국 자세히 보기</summary>
            <div className="mt-3 grid gap-3">
              <PillarTable a={result.me.a} title={result.partner ? `${result.me.label}의 사주 원국` : "사주 원국"} />
              {result.partner && <PillarTable a={result.partner.a} title={`${result.partner.label}의 사주 원국`} />}
            </div>
          </details>

          <p className="text-center text-xs leading-relaxed text-[var(--muted)]">
            용신·신강약은 억부법을 단순화한 간이 판단이고, 궁합 온도와 이야기는 재미와 참고용이에요.
            <br />
            건강·재정·법률 등 중요한 결정은 전문가와 상의하세요.
          </p>
        </div>
      )}

      {book && (
        <StoryBook
          key={book.key}
          story={book.story}
          onFinish={() => setRead((r) => new Set(r).add(book.key))}
          onClose={() => setBook(null)}
        />
      )}
    </main>
  );
}
