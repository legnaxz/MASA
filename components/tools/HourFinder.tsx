"use client";

import { useMemo, useState } from "react";
import { STEM_KO, BRANCH_KO } from "@/lib/saju/constants";
import type { BirthInput } from "@/lib/saju/engine";
import { HOUR_QUESTIONS, hourCandidates, rankHours, type HourQuestion } from "@/lib/saju/hourFinder";

/** 태어난 시간 찾기 — 질문 세 개로 12개 시주 후보의 순서를 매긴다 */
export default function HourFinder({ birth, onPick, onClose }: { birth: BirthInput; onPick: (hhmm: string) => void; onClose: () => void }) {
  const cands = useMemo(() => hourCandidates(birth), [birth]);
  const [answers, setAnswers] = useState<Partial<Record<HourQuestion["id"], string>>>({});
  const done = HOUR_QUESTIONS.every((q) => answers[q.id]);
  const ranked = rankHours(cands, answers);

  return (
    <div className="grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-[15px] leading-relaxed">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm">
          <b className="font-serif-kr">🔎 태어난 시간 찾기</b>
          <br />
          하루는 열두 개의 시(時)로 나뉘어요. 질문 세 개의 답과 가장 잘 맞는 시를 찾아 드려요. <b>추정</b>이니, 가족에게 물어볼 수 있다면 그 답이 가장 정확해요.
        </p>
        <button type="button" onClick={onClose} className="shrink-0 text-sm text-[var(--muted)] underline underline-offset-2">
          닫기
        </button>
      </div>

      {HOUR_QUESTIONS.map((q, qi) => (
        <fieldset key={q.id} className="grid gap-1.5">
          <legend className="text-sm font-bold">
            {qi + 1}. {q.text}
          </legend>
          <p className="text-xs text-[var(--muted)]">{q.why}</p>
          <div className="flex flex-wrap gap-1.5">
            {q.options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.value }))}
                aria-pressed={answers[q.id] === o.value}
                className={`rounded-lg border px-2.5 py-1.5 text-left text-sm ${answers[q.id] === o.value ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]" : "border-[var(--line)]"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      {done && (
        <div className="grid gap-2">
          <p className="text-sm font-bold">가능성이 높은 시간 (누르면 입력돼요)</p>
          {ranked.slice(0, 3).map((c, i) => (
            <button key={c.branch} type="button" onClick={() => onPick(c.time)} className="rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-left">
              <b className="font-serif-kr">
                {i + 1}순위 · {c.label} {c.range}
              </b>
              <span className="block text-sm text-[var(--muted)]">
                시주 {STEM_KO[c.pillar.stem]}
                {BRANCH_KO[c.pillar.branch]} ({c.pillar.stemGod}·{c.pillar.branchGod}) · 맞은 점수 {c.score}/6
              </span>
            </button>
          ))}
          {ranked[0].score === ranked[2].score && <p className="text-xs text-[var(--muted)]">세 후보의 점수가 같아요. 단서가 부족하니 「시간 모름」으로 두는 편이 안전해요.</p>}
        </div>
      )}
    </div>
  );
}
