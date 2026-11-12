/**
 * 한 해(세운)의 자세한 분석 — 지장간, 원국과의 충·합, 오행 변화, 분야별 점수, 월별 점수
 */
import { Lunar, Solar } from "lunar-javascript";
import {
  BRANCH_EL,
  ELEMENTS,
  STEM_EL,
  TEN_GOD_GROUP,
  dohwaOf,
  isClash,
  isHap,
  isSamhap,
  isWonjin,
  stemHap,
  tenGod,
  type Element,
  type TenGod,
} from "./constants";
import { kindOf, scorePeriod, type Analysis, type Daeyun, type PeriodFlow, type PillarKey } from "./engine";

export const HIDDEN_STEMS: Record<string, string[]> = {
  子: ["癸"], 丑: ["己", "癸", "辛"], 寅: ["甲", "丙", "戊"], 卯: ["乙"],
  辰: ["戊", "乙", "癸"], 巳: ["丙", "庚", "戊"], 午: ["丁", "己"], 未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"], 酉: ["辛"], 戌: ["戊", "辛", "丁"], 亥: ["壬", "甲"],
};

export type InteractionType = "clash" | "hap" | "wonjin" | "samhap" | "same";

export interface Interaction {
  pos: PillarKey;
  myBranch: string;
  type: InteractionType;
}

export interface StemTie {
  pos: PillarKey;
  myStem: string;
  el: Element;
}

export interface MonthDetail extends PeriodFlow {
  month: number;
  /** 월 자체 점수 (연운 반영 전) */
  own: number;
}

export type Area = "work" | "money" | "love" | "health";

export interface AreaScore {
  score: number;
  points: { label: string; delta: number }[];
}

export interface YearDetail extends PeriodFlow {
  year: number;
  hidden: { stem: string; god: TenGod }[];
  interactions: Interaction[];
  stemTies: StemTie[];
  elementAfter: Record<Element, number>;
  added: Element[];
  daeyun: Daeyun | null;
  dohwaYear: boolean;
  areas: Record<Area, AreaScore>;
  months: MonthDetail[];
}

const clamp = (n: number) => Math.max(20, Math.min(98, Math.round(n)));

/** 들어오는 간지가 원국 네 기둥과 맺는 관계 (지지: 충·합·원진·삼합·같은 글자 / 천간: 합) */
export function interactionsOf(a: Analysis, stem: string, branch: string) {
  const interactions: Interaction[] = [];
  const stemTies: StemTie[] = [];
  for (const p of a.pillars) {
    const type: InteractionType | null = isClash(branch, p.branch)
      ? "clash"
      : isHap(branch, p.branch)
        ? "hap"
        : isWonjin(branch, p.branch)
          ? "wonjin"
          : isSamhap(branch, p.branch)
            ? "samhap"
            : branch === p.branch
              ? "same"
              : null;
    if (type) interactions.push({ pos: p.key, myBranch: p.branch, type });
    const tie = stemHap(stem, p.stem);
    if (tie) stemTies.push({ pos: p.key, myStem: p.stem, el: tie });
  }
  return { interactions, stemTies };
}

export function yearDetail(a: Analysis, year: number): YearDetail {
  const gz: string = Lunar.fromYmd(year, 6, 1).getYearInGanZhi();
  const stem = gz[0];
  const branch = gz[1];
  const base = scorePeriod(a, stem, branch);

  const hidden = HIDDEN_STEMS[branch].map((s) => ({ stem: s, god: tenGod(a.dayStem, s) }));

  const { interactions, stemTies } = interactionsOf(a, stem, branch);

  const added = [STEM_EL[stem], BRANCH_EL[branch]];
  const elementAfter = { ...a.elementCounts };
  for (const e of added) elementAfter[e]++;

  const daeyun = [...a.daeyun].reverse().find((d) => d.startYear <= year) ?? null;
  const dohwaYear = branch === dohwaOf(a.dayBranch);

  /* 분야별 점수: 그해 종합 점수에 분야별 근거를 더한다 */
  const group = TEN_GOD_GROUP[base.god];
  const has = (pos: PillarKey, t: InteractionType) => interactions.some((i) => i.pos === pos && i.type === t);
  const area = (extra: { label: string; delta: number }[]): AreaScore => {
    const pts = extra.filter((p) => p.delta !== 0);
    return { score: clamp(base.score + pts.reduce((s, p) => s + p.delta, 0)), points: pts };
  };
  const spouseGroup = a.input.gender === "male" ? "재성" : "관성";
  const excessAdded = added.filter((e) => a.elementCounts[e] >= 3);
  const areas: Record<Area, AreaScore> = {
    work: area([
      { label: `${base.god}의 해(${group})`, delta: { 관성: 6, 인성: 4, 식상: 3, 재성: 2, 비겁: -2 }[group] },
      { label: "월지(직장 자리) 충", delta: has("month", "clash") ? -8 : 0 },
      { label: "월지(직장 자리) 합", delta: has("month", "hap") ? 6 : 0 },
      { label: "월지(직장 자리) 원진", delta: has("month", "wonjin") ? -4 : 0 },
    ]),
    money: area([
      { label: `${base.god}의 해(${group})`, delta: { 재성: 8, 식상: 5, 관성: 1, 인성: 0, 비겁: -7 }[group] },
      { label: "지지에 숨은 재성", delta: hidden.some((h) => TEN_GOD_GROUP[h.god] === "재성") && group !== "재성" ? 3 : 0 },
    ]),
    love: area([
      { label: `연인의 별(${spouseGroup})이 들어옴`, delta: group === spouseGroup || TEN_GOD_GROUP[base.branchGod] === spouseGroup ? 8 : 0 },
      { label: "도화가 피는 해", delta: dohwaYear ? 6 : 0 },
      { label: "배우자 자리(일지) 합", delta: has("day", "hap") ? 6 : 0 },
      { label: "배우자 자리(일지) 원진", delta: has("day", "wonjin") ? -4 : 0 },
    ]),
    health: area([
      { label: "이미 많은 오행이 더 들어옴", delta: excessAdded.length ? -6 * excessAdded.length : 0 },
      { label: "필요한 오행(용신)이 들어옴", delta: added.includes(a.yongshin) ? 4 : 0 },
      { label: "일지(몸의 자리) 충", delta: has("day", "clash") ? -4 : 0 },
    ]),
  };

  /* 월별: 매달 15일이 속한 절기 월의 간지. 월 점수 70% + 연 점수 30% */
  const months: MonthDetail[] = [];
  for (let m = 1; m <= 12; m++) {
    const mgz: string = Solar.fromYmd(year, m, 15).getLunar().getMonthInGanZhiExact();
    const own = scorePeriod(a, mgz[0], mgz[1]);
    const score = clamp(own.score * 0.7 + base.score * 0.3);
    months.push({ ...own, month: m, own: own.score, score, kind: kindOf(score) });
  }

  return {
    ...base,
    year,
    hidden,
    interactions,
    stemTies,
    elementAfter,
    added,
    daeyun,
    dohwaYear,
    areas,
    months,
  };
}

export const ELEMENT_ORDER = ELEMENTS;
