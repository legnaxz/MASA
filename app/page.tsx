"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BirthForm, { shareLink, type FormResult } from "@/components/BirthForm";
import PillarTable from "@/components/PillarTable";
import CategoryGrid from "@/components/story/CategoryGrid";
import Guide from "@/components/story/Guide";
import Scene from "@/components/story/Scene";
import StoryBook from "@/components/story/StoryBook";
import CalendarPanel from "@/components/tools/CalendarPanel";
import CalibratePanel from "@/components/tools/CalibratePanel";
import FamilyPanel, { type FamilyEntry } from "@/components/tools/FamilyPanel";
import LifeGraph from "@/components/tools/LifeGraph";
import Sheet from "@/components/tools/Sheet";
import { compare } from "@/lib/saju/compat";
import { ELEMENT_INFO, type Element } from "@/lib/saju/constants";
import { analyze, type Analysis } from "@/lib/saju/engine";
import { encodeShare, toBirth, type PersonState } from "@/lib/share";
import { QUESTIONS, buildAnswer } from "@/lib/story/ask";
import { buildStories, coverScene, coverTitle } from "@/lib/story/build";
import { buildCoupleStory, coupleHeadline } from "@/lib/story/couple";
import { buildCoupleCards } from "@/lib/story/coupleCards";
import { deepenGunghap } from "@/lib/story/deepen";
import { buildFamilyStory, type Member } from "@/lib/story/family";
import { buildFightStory } from "@/lib/story/fight";
import type { Story } from "@/lib/story/types";

interface Person {
  label: string;
  a: Analysis;
  sig: string;
  calibrated: boolean;
}

type Who = "us" | "me" | "partner";
type Tool = "calibrate" | "ask" | "calendar" | "family";

const CAL_KEY = "masa:cal:v1";
const FAMILY_KEY = "masa:family:v1";
/** 같은 사람인지 알아보는 표시 (보정값을 사람별로 저장) */
const sigOf = (p: PersonState) => `${p.date}-${p.timeUnknown ? "x" : p.time}-${p.calendar}-${p.gender}`;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 무시
  }
}

export default function Home() {
  const [form, setForm] = useState<FormResult | null>(null);
  const [cal, setCal] = useState<Record<string, Element>>({});
  const [family, setFamily] = useState<FamilyEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [who, setWho] = useState<Who>("us");
  const [tool, setTool] = useState<Tool | null>(null);
  const [calWho, setCalWho] = useState<"me" | "partner">("me");
  const [book, setBook] = useState<{ story: Story; key: string } | null>(null);
  const [read, setRead] = useState<Set<string>>(new Set());
  const [drawId, setDrawId] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCal(load<Record<string, Element>>(CAL_KEY, {}));
    setFamily(load<FamilyEntry[]>(FAMILY_KEY, []));
  }, []);

  /** 입력과 보정값으로 두 사람의 사주를 계산 */
  const result = useMemo(() => {
    if (!form) return null;
    try {
      const mk = (raw: PersonState, name: string, fallback: string): Person => {
        const sig = sigOf(raw);
        const y = cal[sig];
        return { label: name || fallback, a: analyze(toBirth(raw, form.raw.correction), new Date(), y ? { yongshin: y } : {}), sig, calibrated: Boolean(y) };
      };
      return { me: mk(form.raw.me, form.me.name, "나"), partner: form.raw.partner && form.partner ? mk(form.raw.partner, form.partner.name, "상대") : null };
    } catch {
      return null;
    }
  }, [form, cal]);

  useEffect(() => {
    setError(form && !result ? "날짜를 확인해 주세요. 음력 윤달이 없는 달일 수 있어요." : null);
  }, [form, result]);

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
      couple: deepenGunghap(buildCoupleStory(compat, result.me.label, result.partner.label)),
    };
  }, [result]);

  const submit = useCallback((r: FormResult) => {
    setForm(r);
    setWho(r.partner ? "us" : "me");
    setRead(new Set());
    setNote(null);
    setDrawId((n) => n + 1);
    requestAnimationFrame(() => setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50));
  }, []);

  const personal = view && (who === "us" && view.usStories ? view.usStories : who === "partner" && view.partnerStories ? view.partnerStories : view.meStories);
  const openPersonal = (s: Story) => setBook({ story: s, key: `${who}:${s.id}` });
  const openCouple = () => view?.couple && setBook({ story: view.couple, key: "couple" });
  const readOfWho = new Set([...read].filter((k) => k.startsWith(`${who}:`)).map((k) => k.slice(who.length + 1)));

  const applyCal = (p: Person, el: Element | null) => {
    setCal((c) => {
      const next = { ...c };
      if (el) next[p.sig] = el;
      else delete next[p.sig];
      save(CAL_KEY, next);
      return next;
    });
    setNote(el ? `${p.label}의 용신을 ${ELEMENT_INFO[el].ko}(${ELEMENT_INFO[el].hanja}) 기준으로 보정했어요. 모든 카드가 다시 계산됐어요.` : `${p.label}의 용신 보정을 지웠어요.`);
    setTool(null);
  };

  const changeFamily = (e: FamilyEntry[]) => {
    setFamily(e);
    save(FAMILY_KEY, e);
  };

  const openFamily = () => {
    if (!result || !form) return;
    const members: Member[] = [];
    for (const e of family) {
      try {
        members.push({ name: e.person.name, relation: e.relation, a: analyze(toBirth(e.person, form.raw.correction)) });
      } catch {
        // 날짜가 잘못된 가족은 건너뛴다
      }
    }
    setTool(null);
    setBook({ story: buildFamilyStory({ name: result.me.label, a: result.me.a }, result.partner ? { name: result.partner.label, a: result.partner.a } : null, members), key: "family" });
  };

  const copyResult = async () => {
    if (!form) return;
    const url = `${window.location.origin}${window.location.pathname}${encodeShare({ kind: "result", me: form.raw.me, partner: form.raw.partner ?? undefined, correction: form.raw.correction })}`;
    const r = await shareLink(url, form.partner ? "우리 둘의 사주 궁합 결과예요." : "내 사주 결과예요.");
    setNote(r === "failed" ? "링크를 복사하지 못했어요. 브라우저에서 복사 권한을 허용해 주세요." : r === "copied" ? "결과 링크를 복사했어요. 링크에는 입력한 생년월일이 담겨 있으니 믿을 수 있는 사람에게만 보내세요." : "결과 링크를 보냈어요.");
  };

  const calPerson = result ? (calWho === "partner" && result.partner ? result.partner : result.me) : null;
  const tools: { id: Tool | "fight" | "share"; icon: string; label: string; sub: string; show: boolean }[] = [
    { id: "ask", icon: "❓", label: "질문하기", sub: "이직·결혼·집… 지금 해도 될까", show: true },
    { id: "calendar", icon: "📅", label: result?.partner ? "부부 달력" : "운세 달력", sub: "날마다의 기운과 좋은 날", show: true },
    { id: "calibrate", icon: "🎯", label: "지난 일 맞혀 보기", sub: "풀이가 맞는지 확인하고 보정", show: true },
    { id: "fight", icon: "🕊️", label: "다퉜을 때", sub: "오늘 누가 먼저, 어떤 말로", show: Boolean(result?.partner) },
    { id: "family", icon: "👨‍👩‍👧", label: "가족 사주", sub: "아이·부모님을 더해 보기", show: true },
    { id: "share", icon: "🔗", label: "결과 링크", sub: "이 결과를 링크로 보내기", show: true },
  ];

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

          {/* 도구 */}
          <section>
            <h2 className="font-serif-kr mb-3 text-lg font-bold">마사 선생에게 물어보기</h2>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {tools
                .filter((t) => t.show)
                .map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => {
                        if (t.id === "share") void copyResult();
                        else if (t.id === "fight") view.compat && result.partner && setBook({ story: buildFightStory(view.compat, result.me.label, result.partner.label, new Date()), key: "fight" });
                        else setTool(t.id);
                      }}
                      className="tool-btn flex h-full w-full items-start gap-2.5 rounded-2xl px-3 py-3 text-left"
                    >
                      <span className="text-2xl" aria-hidden>
                        {t.icon}
                      </span>
                      <span>
                        <b className="font-serif-kr block text-[15px]">{t.label}</b>
                        <span className="text-xs text-[var(--muted)]">{t.sub}</span>
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
            {note && <p className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--accent)]">{note}</p>}
            {(result.me.calibrated || result.partner?.calibrated) && (
              <p className="mt-2 text-xs text-[var(--muted)]">
                🎯 {[result.me, result.partner].filter((p): p is Person => Boolean(p?.calibrated)).map((p) => `${p.label}: 용신을 ${ELEMENT_INFO[p.a.yongshin].ko}(${ELEMENT_INFO[p.a.yongshin].hanja}) 기준으로 보정함`).join(" · ")}
              </p>
            )}
          </section>

          {/* 카드 */}
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
                    <button key={k} onClick={() => setWho(k)} aria-pressed={who === k} className={`rounded-lg px-4 py-1.5 font-medium ${who === k ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--muted)]"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {personal && <CategoryGrid key={who} stories={personal} read={readOfWho} onOpen={openPersonal} />}
          </section>

          {/* 인생 그래프 */}
          <LifeGraph a={who === "partner" && result.partner ? result.partner.a : result.me.a} name={who === "partner" && result.partner ? result.partner.label : result.me.label} />
          {who === "us" && result.partner && <LifeGraph a={result.partner.a} name={result.partner.label} />}

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

      {/* 도구 창 */}
      {result && tool === "ask" && (
        <Sheet title="질문하기" icon="❓" onClose={() => setTool(null)}>
          <p className="mb-3 text-[15px] leading-relaxed">궁금한 것을 고르면 사주의 근거와 함께, 앞으로 14개월 중 언제가 좋은지 답해 드려요.{result.partner ? ` 두 사람이 함께 정하는 일은 ${result.partner.label}의 사주도 같이 봐요.` : ""}</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {QUESTIONS.map((q) => (
              <li key={q.id}>
                <button
                  onClick={() => {
                    setTool(null);
                    setBook({ story: buildAnswer(result.me.a, q, new Date(), result.partner ? { a: result.partner.a, name: result.partner.label } : undefined, result.me.label), key: `ask:${q.id}` });
                  }}
                  className="tool-btn flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[15px]"
                >
                  <span className="text-xl" aria-hidden>
                    {q.icon}
                  </span>
                  {q.text}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[var(--muted)]">답은 {result.me.label}의 사주를 기준으로 해요. 사주는 시기를 고르는 참고 자료이고, 건강·재정·법률과 관련된 결정은 전문가와 함께 확인하세요.</p>
        </Sheet>
      )}

      {result && tool === "calendar" && (
        <Sheet title={result.partner ? "부부 달력" : "운세 달력"} icon="📅" onClose={() => setTool(null)}>
          <CalendarPanel me={{ name: result.me.label, a: result.me.a }} partner={result.partner ? { name: result.partner.label, a: result.partner.a } : null} />
        </Sheet>
      )}

      {result && calPerson && tool === "calibrate" && (
        <Sheet title="지난 일 맞혀 보기" icon="🎯" onClose={() => setTool(null)}>
          {result.partner && (
            <div className="mb-3 inline-flex rounded-xl border border-[var(--line)] p-1 text-sm">
              {(
                [
                  ["me", result.me.label],
                  ["partner", result.partner.label],
                ] as const
              ).map(([k, label]) => (
                <button key={k} onClick={() => setCalWho(k)} aria-pressed={calWho === k} className={`rounded-lg px-4 py-1.5 font-medium ${calWho === k ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--muted)]"}`}>
                  {label}
                </button>
              ))}
            </div>
          )}
          <CalibratePanel key={calPerson.sig} a={calPerson.a} name={calPerson.label} calibrated={calPerson.calibrated} onApply={(el) => applyCal(calPerson, el)} />
        </Sheet>
      )}

      {result && tool === "family" && (
        <Sheet title="가족 사주" icon="👨‍👩‍👧" onClose={() => setTool(null)}>
          <FamilyPanel entries={family} onChange={changeFamily} onOpen={openFamily} />
        </Sheet>
      )}

      {book && <StoryBook key={book.key} story={book.story} onFinish={() => setRead((r) => new Set(r).add(book.key))} onClose={() => setBook(null)} />}
    </main>
  );
}
