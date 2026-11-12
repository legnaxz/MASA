import { ELEMENTS, ELEMENT_INFO } from "@/lib/saju/constants";
import type { Analysis } from "@/lib/saju/engine";
import { SHINSAL_DECK } from "@/lib/deck";

/** 사주 원국 표 (시·일·월·연 순서) + 오행 분포 + 신살 배지 */
export default function PillarTable({ a }: { a: Analysis }) {
  const order = ["hour", "day", "month", "year"] as const;
  const max = Math.max(...ELEMENTS.map((e) => a.elementCounts[e]), 1);

  return (
    <section className="panel rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif-kr text-lg font-bold">사주 원국</h2>
        <p className="text-xs text-[var(--muted)]">
          양력 {a.solarText} · {a.lunarText}
          {a.input.solarTimeCorrection && a.hourKnown ? " · 30분 보정" : ""}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        {order.map((key) => {
          const p = a.pillars.find((x) => x.key === key);
          return (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-xs text-[var(--muted)]">{p?.label ?? "시주"}</span>
              {p ? (
                <>
                  <span className="text-[11px] text-[var(--muted)]">{p.stemGod ?? "일간"}</span>
                  <Cell char={p.stem} ko={p.stemKo} color={ELEMENT_INFO[p.stemEl].color} highlight={key === "day"} />
                  <Cell char={p.branch} ko={p.branchKo} color={ELEMENT_INFO[p.branchEl].color} />
                  <span className="text-[11px] text-[var(--muted)]">{p.branchGod}</span>
                </>
              ) : (
                <div className="flex h-[132px] items-center justify-center rounded-lg border border-dashed border-[var(--line)] text-xs text-[var(--muted)]">
                  시간
                  <br />
                  모름
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2">
        {ELEMENTS.map((e) => {
          const info = ELEMENT_INFO[e];
          const n = a.elementCounts[e];
          return (
            <div key={e} className="flex flex-col items-center gap-1">
              <div className="flex h-16 w-full items-end overflow-hidden rounded-md bg-[var(--line)]/40">
                <div className="w-full rounded-md" style={{ height: `${(n / max) * 100}%`, background: info.color, minHeight: n ? 6 : 0 }} />
              </div>
              <span className="text-xs">
                <b className="font-serif-kr">{info.hanja}</b> {n}
              </span>
            </div>
          );
        })}
      </div>

      {a.shinsal.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-[var(--muted)]">특별 카드</p>
          <ul className="flex flex-wrap gap-2">
            {a.shinsal.map((s) => {
              const d = SHINSAL_DECK[s.id];
              return (
                <li key={s.id} className="badge-card flex items-center gap-2 rounded-xl px-2.5 py-1.5" title={s.basis}>
                  <span className="font-serif-kr flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold text-white">
                    {d.glyph}
                  </span>
                  <span className="leading-tight">
                    <b className="text-sm">{d.name}</b>
                    <span className="block text-[11px] text-[var(--muted)]">{d.meaning}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

function Cell({ char, ko, color, highlight }: { char: string; ko: string; color: string; highlight?: boolean }) {
  return (
    <div
      className="font-serif-kr flex h-14 flex-col items-center justify-center rounded-lg text-white"
      style={{ background: color, boxShadow: highlight ? "0 0 0 3px var(--ink)" : undefined }}
    >
      <span className="text-2xl font-bold leading-none">{char}</span>
      <span className="text-[11px] opacity-90">{ko}</span>
    </div>
  );
}
