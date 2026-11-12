/**
 * 커플(궁합) 분석 — 두 사람의 원국을 비교한다.
 */
import {
  CONTROLS,
  ELEMENTS,
  GENERATES,
  controllerOf,
  isClash,
  isHap,
  isSamhap,
  isWonjin,
  stemHap,
  type Element,
} from "./constants";
import type { Analysis, FlowKind } from "./engine";

export type BranchRelation = "hap" | "samhap" | "same" | "clash" | "wonjin" | "none";
export type StemRelation = "hap" | "same" | "gen-ab" | "gen-ba" | "ctrl-ab" | "ctrl-ba";

export interface CoupleYear {
  year: number;
  kindA: FlowKind;
  kindB: FlowKind;
  together: FlowKind;
  bothUp: boolean;
  care: boolean;
}

export interface Compat {
  a: Analysis;
  b: Analysis;
  stem: StemRelation;
  stemHapEl: Element | null;
  dayBranch: BranchRelation;
  yearBranch: BranchRelation;
  /** B 가 A 에게 필요한 오행(용신)을 넉넉히 가졌는지 */
  bFillsA: boolean;
  aFillsB: boolean;
  /** B 의 일간이 A 에게 배우자의 별인지 */
  bIsSpouseStarOfA: boolean;
  aIsSpouseStarOfB: boolean;
  sharedExcess: Element[];
  sharedLack: Element[];
  strength: "both-strong" | "both-weak" | "balanced";
  score: number;
  years: CoupleYear[];
}

function branchRelation(x: string, y: string): BranchRelation {
  if (isHap(x, y)) return "hap";
  if (isClash(x, y)) return "clash";
  if (isWonjin(x, y)) return "wonjin";
  if (isSamhap(x, y)) return "samhap";
  if (x === y) return "same";
  return "none";
}

/** 배우자의 별 오행: 남성은 재성(내가 극), 여성은 관성(나를 극) */
const spouseStarEl = (a: Analysis): Element =>
  a.input.gender === "male" ? CONTROLS[a.dayEl] : controllerOf(a.dayEl);

export function compare(a: Analysis, b: Analysis): Compat {
  const hapEl = stemHap(a.dayStem, b.dayStem);
  let stem: StemRelation;
  if (hapEl) stem = "hap";
  else if (a.dayEl === b.dayEl) stem = "same";
  else if (GENERATES[a.dayEl] === b.dayEl) stem = "gen-ab";
  else if (GENERATES[b.dayEl] === a.dayEl) stem = "gen-ba";
  else if (CONTROLS[a.dayEl] === b.dayEl) stem = "ctrl-ab";
  else stem = "ctrl-ba";

  const yearA = a.pillars.find((p) => p.key === "year")!.branch;
  const yearB = b.pillars.find((p) => p.key === "year")!.branch;
  const dayBranch = branchRelation(a.dayBranch, b.dayBranch);
  const yearBranch = branchRelation(yearA, yearB);

  const bFillsA = b.elementCounts[a.yongshin] >= 2;
  const aFillsB = a.elementCounts[b.yongshin] >= 2;
  const bIsSpouseStarOfA = b.dayEl === spouseStarEl(a);
  const aIsSpouseStarOfB = a.dayEl === spouseStarEl(b);
  const sharedExcess = ELEMENTS.filter((e) => a.elementCounts[e] >= 3 && b.elementCounts[e] >= 3);
  const sharedLack = ELEMENTS.filter((e) => a.elementCounts[e] === 0 && b.elementCounts[e] === 0);
  const strength =
    a.strength.strong && b.strength.strong ? "both-strong" : !a.strength.strong && !b.strength.strong ? "both-weak" : "balanced";

  // 궁합 온도 (재미용 점수)
  let s = 62;
  s += { hap: 12, same: 3, "gen-ab": 8, "gen-ba": 8, "ctrl-ab": -3, "ctrl-ba": -3 }[stem];
  s += { hap: 10, samhap: 6, same: 2, none: 0, clash: -9, wonjin: -6 }[dayBranch];
  s += { hap: 4, samhap: 3, same: 1, none: 0, clash: -4, wonjin: -3 }[yearBranch];
  if (bFillsA) s += 6;
  if (aFillsB) s += 6;
  if (bIsSpouseStarOfA) s += 5;
  if (aIsSpouseStarOfB) s += 5;
  s -= sharedExcess.length * 4 + sharedLack.length * 3;
  if (strength === "balanced") s += 3;
  if (strength === "both-strong") s -= 3;
  const score = Math.max(38, Math.min(98, Math.round(s)));

  const years: CoupleYear[] = a.flows.map((fa, i) => {
    const fb = b.flows[i];
    const bothUp = fa.kind === "chance" && fb.kind === "chance";
    const care = fa.clashDay || fb.clashDay || (fa.kind === "careful" && fb.kind === "careful");
    const together: FlowKind = bothUp ? "chance" : care ? "careful" : "prepare";
    return { year: fa.year, kindA: fa.kind, kindB: fb.kind, together, bothUp, care };
  });

  return {
    a,
    b,
    stem,
    stemHapEl: hapEl,
    dayBranch,
    yearBranch,
    bFillsA,
    aFillsB,
    bIsSpouseStarOfA,
    aIsSpouseStarOfB,
    sharedExcess,
    sharedLack,
    strength,
    score,
    years,
  };
}
