"use client";

import { useMemo, useState } from "react";
import { BRANCH_KO, ELEMENTS, ELEMENT_INFO, STEM_KO, type Element } from "@/lib/saju/constants";
import type { Analysis } from "@/lib/saju/engine";
import { calibrate, pastYears } from "@/lib/saju/life";
import { YEAR_GOD_KEYWORD } from "@/lib/deck";
import { iga, ieyo } from "@/lib/story/text";

/** 받침에 따라 로/으로 */
const euro = (e: Element) => (e === "wood" || e === "metal" ? "으로" : "로");

const KIND_BG = { chance: "#3f9a63", prepare: "#c99a2e", careful: "#8792a3" } as const;
type Mark = "good" | "bad" | undefined;

/** 지난 일 맞혀 보기 — 좋았던 해·힘들었던 해를 고르면 용신을 다시 맞춘다 */
export default function CalibratePanel({ a, name, calibrated, onApply }: { a: Analysis; name: string; calibrated: boolean; onApply: (el: Element | null) => void }) {
  const years = useMemo(() => pastYears(a, new Date().getFullYear()), [a]);
  const [marks, setMarks] = useState<Record<number, Mark>>({});
  const good = years.filter((y) => marks[y.year] === "good").map((y) => y.year);
  const bad = years.filter((y) => marks[y.year] === "bad").map((y) => y.year);
  const result = good.length + bad.length >= 2 ? calibrate(a, good, bad) : null;
  const el = (e: Element) => `${ELEMENT_INFO[e].ko}(${ELEMENT_INFO[e].hanja})`;

  const cycle = (y: number) => setMarks((m) => ({ ...m, [y]: m[y] === undefined ? "good" : m[y] === "good" ? "bad" : undefined }));

  if (years.length === 0) return <p className="text-[15px] leading-relaxed">되짚어 볼 지난 해가 아직 충분하지 않아요. 만 15세 이후의 해부터 볼 수 있어요.</p>;

  return (
    <div className="grid gap-4 text-[15px] leading-relaxed">
      <p>
        역술가는 상담을 시작할 때 지난 일을 먼저 맞혀 봐요. 사주 풀이가 맞는지 확인하고, 틀리면 해석을 고치기 위해서예요. 아래는 지금의 풀이로 본 <b>{name}</b>의 지난 해 점수예요.
      </p>
      <p className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm">
        해를 누를 때마다 <b className="text-[#3f9a63]">😊 잘 풀린 해</b> → <b className="text-[#d4513f]">😣 힘들었던 해</b> → 선택 없음 순서로 바뀌어요. 기억에 뚜렷한 해만 2~6개 골라 주세요.
      </p>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {years.map((y) => {
          const m = marks[y.year];
          return (
            <li key={y.year}>
              <button
                onClick={() => cycle(y.year)}
                className="w-full rounded-xl border-2 px-3 py-2 text-left"
                style={{ borderColor: m === "good" ? "#3f9a63" : m === "bad" ? "#d4513f" : "var(--line)", background: "var(--bg)" }}
                aria-pressed={m !== undefined}
              >
                <span className="flex items-center justify-between">
                  <b className="font-serif-kr">
                    {y.year}년 <span className="text-xs font-normal text-[var(--muted)]">{y.age}세</span>
                  </b>
                  <span className="text-lg">{m === "good" ? "😊" : m === "bad" ? "😣" : ""}</span>
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-xs">
                  <span className="rounded-full px-1.5 py-0.5 font-bold text-white" style={{ background: KIND_BG[y.kind] }}>
                    {y.score}점
                  </span>
                  <span className="text-[var(--muted)]">
                    {STEM_KO[y.stem]}
                    {BRANCH_KO[y.branch]} · {YEAR_GOD_KEYWORD[y.god]}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {result ? (
        <div className="grid gap-2 rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4">
          <p className="font-serif-kr text-lg font-bold">
            지금 풀이로 {result.total}개 중 {result.hits}개가 맞았어요
          </p>
          <p className="text-sm text-[var(--muted)]">
            맞았다는 것은 잘 풀린 해가 60점 이상, 힘들었던 해가 60점 미만으로 나왔다는 뜻이에요. 아래는 용신을 다섯 오행으로 바꿔 가며, 고르신 해와 얼마나 잘 맞는지 다시 계산한 값이에요. 숫자가 클수록 잘 맞아요.
          </p>
          <ul className="grid grid-cols-5 gap-1.5 text-center text-xs">
            {ELEMENTS.map((e) => (
              <li key={e} className="rounded-lg px-1 py-1.5" style={{ background: e === result.best ? ELEMENT_INFO[e].color : "var(--card)", color: e === result.best ? "#fff" : "inherit", border: "1px solid var(--line)" }}>
                <b className="font-serif-kr block text-base">{ELEMENT_INFO[e].hanja}</b>
                {result.fit[e] > 0 ? `+${result.fit[e]}` : result.fit[e]}
                {e === result.current && <span className="block">지금</span>}
              </li>
            ))}
          </ul>
          {result.changed ? (
            <>
              <p>
                고르신 해와 가장 잘 맞는 용신은 <b className="text-[var(--accent)]">{ieyo(el(result.best))}</b>. 지금의 {el(result.current)}보다 뚜렷하게 잘 맞아요. 용신을 바꾸면 모든 카드의 점수와 조언이 이 기준으로 다시 계산돼요.
              </p>
              <button onClick={() => onApply(result.best)} className="draw-btn font-serif-kr rounded-xl py-2.5 font-bold">
                용신을 {el(result.best)}{euro(result.best)} 보정하기
              </button>
            </>
          ) : (
            <p>
              지금의 용신 <b className="text-[var(--accent)]">{iga(el(result.current))}</b> 고르신 해와 가장 잘 맞거나, 다른 오행과의 차이가 뚜렷하지 않아요. 그래서 그대로 두는 것이 좋아요. 풀이를 믿고 읽으셔도 돼요.
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">두 해 이상 고르면 결과가 나와요.</p>
      )}

      {calibrated && (
        <button onClick={() => onApply(null)} className="nav-btn rounded-xl py-2 text-sm">
          보정을 지우고 처음 계산한 용신({el(a.calcYongshin)})을 쓰기
        </button>
      )}
    </div>
  );
}
