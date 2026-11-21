/**
 * 시간 축 계산 — 지난 해 되짚기와 용신 보정, 평생 운 곡선, 날짜별 운
 */
import { Lunar, Solar } from "lunar-javascript";
import { ELEMENTS, controllerOf, generatorOf, type Element } from "./constants";
import { kindOf, scorePeriod, type Analysis, type Daeyun, type PeriodFlow, type ScoreContext } from "./engine";

export const birthYearOf = (a: Analysis) => Number(a.solarText.split(".")[0]);
export const yearGanzhi = (year: number): string => Lunar.fromYmd(year, 6, 1).getYearInGanZhi();

const ctxWith = (a: Analysis, yong: Element): ScoreContext => ({
  dayStem: a.dayStem,
  dayBranch: a.dayBranch,
  yongshin: yong,
  heeshin: generatorOf(yong),
  gishin: controllerOf(yong),
  elementCounts: a.elementCounts,
});

export interface PastYear extends PeriodFlow {
  year: number;
  age: number;
}

/** 되짚어 볼 지난 해들 (만 15세 이후, 최근 n년) */
export function pastYears(a: Analysis, thisYear: number, n = 14): PastYear[] {
  const birth = birthYearOf(a);
  const out: PastYear[] = [];
  for (let y = thisYear - 1; y >= thisYear - n && y - birth >= 15; y--) {
    const gz = yearGanzhi(y);
    out.push({ ...scorePeriod(a, gz[0], gz[1]), year: y, age: y - birth });
  }
  return out;
}

export interface Calibration {
  current: Element;
  best: Element;
  changed: boolean;
  /** 후보 용신별 적합도 (높을수록 답과 잘 맞음) */
  fit: Record<Element, number>;
  /** 지금 용신으로 맞힌 개수 / 고른 해의 수 */
  hits: number;
  total: number;
}

/**
 * 사용자가 고른 「잘 풀린 해 / 힘들었던 해」에 가장 잘 맞는 용신을 찾는다.
 * 후보 오행마다 점수를 다시 매겨, 좋은 해는 높고 힘든 해는 낮게 나오는 오행을 고른다.
 */
export function calibrate(a: Analysis, good: number[], bad: number[]): Calibration {
  const fit = {} as Record<Element, number>;
  const scoreOf = (e: Element, y: number) => {
    const gz = yearGanzhi(y);
    return scorePeriod(ctxWith(a, e), gz[0], gz[1]).score;
  };
  for (const e of ELEMENTS) {
    const g = good.reduce((s, y) => s + scoreOf(e, y), 0) / Math.max(1, good.length);
    const b = bad.reduce((s, y) => s + scoreOf(e, y), 0) / Math.max(1, bad.length);
    fit[e] = Math.round((good.length ? g : 60) - (bad.length ? b : 60));
  }
  const current = a.yongshin;
  const best = ELEMENTS.reduce((x, y) => (fit[y] > fit[x] ? y : x));
  // 차이가 뚜렷할 때만 바꾼다 (우연한 일치로 흔들리지 않게)
  const changed = best !== current && fit[best] - fit[current] >= 8;
  const hits = good.filter((y) => scoreOf(current, y) >= 60).length + bad.filter((y) => scoreOf(current, y) < 60).length;
  return { current, best: changed ? best : current, changed, fit, hits, total: good.length + bad.length };
}

export interface LifePoint {
  age: number;
  year: number;
  score: number;
}
export interface LifeDecade {
  d: Daeyun;
  score: number;
  flow: PeriodFlow;
}

/** 0~84세 운 곡선: 대운 60% + 그해 세운 40% */
export function lifeCurve(a: Analysis): { points: LifePoint[]; decades: LifeDecade[]; birth: number } {
  const birth = birthYearOf(a);
  const decades: LifeDecade[] = a.daeyun.map((d) => {
    const flow = scorePeriod(a, d.stem, d.branch);
    return { d, score: flow.score, flow };
  });
  const points: LifePoint[] = [];
  for (let age = 0; age <= 84; age++) {
    const year = birth + age;
    const dec = [...decades].reverse().find((x) => x.d.startYear <= year);
    const gz = yearGanzhi(year);
    const ys = scorePeriod(a, gz[0], gz[1]).score;
    points.push({ age, year, score: Math.round((dec ? dec.score : 60) * 0.6 + ys * 0.4) });
  }
  return { points, decades, birth };
}

export interface DayFlow extends PeriodFlow {
  date: Date;
  /** 그날 자체 점수 (월운 반영 전) */
  own: number;
}

/** 하루의 운: 일진 60% + 그달 월운 40% */
export function dayFlow(a: Analysis, date: Date): DayFlow {
  const lunar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate()).getLunar();
  const dgz: string = lunar.getDayInGanZhi();
  const mgz: string = lunar.getMonthInGanZhiExact();
  const own = scorePeriod(a, dgz[0], dgz[1]);
  const month = scorePeriod(a, mgz[0], mgz[1]);
  const score = Math.round(own.score * 0.6 + month.score * 0.4);
  return { ...own, date, own: own.score, score, kind: kindOf(score) };
}

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
