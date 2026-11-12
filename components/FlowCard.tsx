import { BRANCH_KO, ELEMENT_INFO, STEM_EL, STEM_KO } from "@/lib/saju/constants";
import type { Analysis, FlowKind } from "@/lib/saju/engine";
import { FLOW_DECK, YEAR_GOD_KEYWORD } from "@/lib/deck";

const KIND_COLOR: Record<FlowKind, string> = {
  chance: "#3f9a63",
  prepare: "#c99a2e",
  careful: "#6b7a90",
};

/** ⑦ 10년 흐름: 연도별 미니카드 10장 */
export default function FlowCard({ a }: { a: Analysis }) {
  const cur = a.currentDaeyun;
  return (
    <section className="saju-card min-w-0 rounded-2xl p-4"style={{ animationDelay: "720ms" }}>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-[var(--ink)] px-2.5 py-0.5 text-xs font-semibold text-[var(--bg)]">⑦ 10년 흐름</span>
        {cur && (
          <span className="text-xs text-[var(--muted)]">
            현재 대운 <b className="font-serif-kr text-[var(--ink)]">{STEM_KO[cur.stem]}{BRANCH_KO[cur.branch]}</b> ({cur.startAge}세~ · {cur.god})
          </span>
        )}
      </header>

      <div className="mt-3 flex gap-2.5 overflow-x-auto pb-2 snap-x">
        {a.flows.map((f) => {
          const deck = FLOW_DECK[f.kind];
          const el = ELEMENT_INFO[STEM_EL[f.stem]];
          return (
            <div key={f.year} className="mini-card flex w-[104px] shrink-0 snap-start flex-col overflow-hidden rounded-xl">
              <div className="flex flex-col items-center py-2 text-white" style={{ background: `linear-gradient(160deg, ${el.color}, ${el.deep})` }}>
                <span className="text-[11px] opacity-90">{f.year}</span>
                <span className="font-serif-kr text-2xl font-bold leading-tight">
                  {f.stem}
                  {f.branch}
                </span>
                <span className="text-[11px]">
                  {STEM_KO[f.stem]}
                  {BRANCH_KO[f.branch]}년
                </span>
              </div>
              <div className="flex flex-1 flex-col items-center gap-1 px-1.5 py-2 text-center">
                <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: KIND_COLOR[f.kind] }}>
                  {deck.arrow} {deck.label}
                </span>
                <span className="text-xs font-medium">{YEAR_GOD_KEYWORD[f.god]}</span>
                <span className="text-[10px] text-[var(--muted)]">{f.basis}</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-1 flex flex-wrap gap-3 text-[11px] text-[var(--muted)]">
        {(Object.keys(FLOW_DECK) as FlowKind[]).map((k) => (
          <span key={k} className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: KIND_COLOR[k] }} />
            {FLOW_DECK[k].label}
            {k === "chance" ? " · 기회가 커지는 해" : k === "prepare" ? " · 변화를 준비할 해" : " · 보수적으로 움직일 해"}
          </span>
        ))}
      </p>
    </section>
  );
}
