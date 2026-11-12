import { Lunar, Solar } from "lunar-javascript";
import {
  BRANCH_EL,
  BRANCH_KO,
  BRANCH_MAIN_STEM,
  CONTROLS,
  ELEMENTS,
  Element,
  GENERATES,
  JIE_KO,
  STEM_EL,
  STEM_KO,
  TEN_GOD_GROUP,
  TenGod,
  TenGodGroup,
  controllerOf,
  generatorOf,
  isClash,
  isHap,
  tenGod,
} from "./constants";

export interface BirthInput {
  year: number;
  month: number;
  day: number;
  /** null 이면 태어난 시간 모름 */
  hour: number | null;
  minute: number;
  calendar: "solar" | "lunar";
  leapMonth: boolean;
  gender: "male" | "female";
  /** 한국 표준시(동경 135°)와 실제 태양시(약 127.5°) 차이 30분 보정 */
  solarTimeCorrection: boolean;
}

export type PillarKey = "year" | "month" | "day" | "hour";

export interface Pillar {
  key: PillarKey;
  label: string;
  stem: string;
  branch: string;
  stemKo: string;
  branchKo: string;
  stemEl: Element;
  branchEl: Element;
  /** 일간 자신은 null */
  stemGod: TenGod | null;
  branchGod: TenGod;
}

export interface Shinsal {
  id: "dohwa" | "yeokma" | "hwagae" | "cheoneul" | "munchang" | "baekho" | "goegang";
  basis: string;
}

export interface Daeyun {
  startAge: number;
  startYear: number;
  stem: string;
  branch: string;
  god: TenGod;
}

export type FlowKind = "chance" | "prepare" | "careful";

export interface PeriodFlow {
  stem: string;
  branch: string;
  god: TenGod;
  branchGod: TenGod;
  kind: FlowKind;
  reasons: string[];
  basis: string;
  clashDay: boolean;
  hapDay: boolean;
}

export interface YearFlow extends PeriodFlow {
  year: number;
}

export interface MonthFlow extends PeriodFlow {
  startTerm: string;
  startDate: string;
  endTerm: string;
  endDate: string;
}

export interface Analysis {
  input: BirthInput;
  solarText: string;
  lunarText: string;
  pillars: Pillar[];
  dayStem: string;
  dayBranch: string;
  dayEl: Element;
  hourKnown: boolean;
  elementCounts: Record<Element, number>;
  godCounts: Record<TenGod, number>;
  groupCounts: Record<TenGodGroup, number>;
  dominantGod: TenGod;
  dominantGroup: TenGodGroup;
  strength: { strong: boolean; ratio: number; gauge: number };
  yongshin: Element;
  heeshin: Element;
  gishin: Element;
  shinsal: Shinsal[];
  spouseStarCount: number;
  dayBranchClash: boolean;
  daeyun: Daeyun[];
  currentDaeyun: Daeyun | null;
  flows: YearFlow[];
  thisMonth: MonthFlow;
}

const LABELS: Record<PillarKey, string> = {
  year: "연주",
  month: "월주",
  day: "일주",
  hour: "시주",
};

function toSolarFields(input: BirthInput) {
  const hour = input.hour ?? 12;
  const minute = input.hour === null ? 0 : input.minute;

  let y = input.year;
  let m = input.month;
  let d = input.day;
  if (input.calendar === "lunar") {
    const lunar = Lunar.fromYmdHms(
      input.year,
      input.leapMonth ? -input.month : input.month,
      input.day,
      hour,
      minute,
      0,
    );
    const solar = lunar.getSolar();
    y = solar.getYear();
    m = solar.getMonth();
    d = solar.getDay();
  }

  let t = Date.UTC(y, m - 1, d, hour, minute);
  if (input.solarTimeCorrection && input.hour !== null) t -= 30 * 60 * 1000;
  const dt = new Date(t);
  return {
    y: dt.getUTCFullYear(),
    m: dt.getUTCMonth() + 1,
    d: dt.getUTCDate(),
    h: dt.getUTCHours(),
    mi: dt.getUTCMinutes(),
  };
}

function emptyRecord<K extends string>(keys: readonly K[]): Record<K, number> {
  return Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;
}

const TEN_GODS: TenGod[] = ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"];
const GROUPS: TenGodGroup[] = ["비겁", "식상", "재성", "관성", "인성"];

/** 삼합 그룹 기준 신살 (도화/역마/화개) */
const SAMHAP: { members: string[]; dohwa: string; yeokma: string; hwagae: string }[] = [
  { members: ["寅", "午", "戌"], dohwa: "卯", yeokma: "申", hwagae: "戌" },
  { members: ["申", "子", "辰"], dohwa: "酉", yeokma: "寅", hwagae: "辰" },
  { members: ["巳", "酉", "丑"], dohwa: "午", yeokma: "亥", hwagae: "丑" },
  { members: ["亥", "卯", "未"], dohwa: "子", yeokma: "巳", hwagae: "未" },
];

const CHEONEUL: Record<string, string[]> = {
  甲: ["丑", "未"], 戊: ["丑", "未"], 庚: ["丑", "未"],
  乙: ["子", "申"], 己: ["子", "申"],
  丙: ["亥", "酉"], 丁: ["亥", "酉"],
  辛: ["寅", "午"],
  壬: ["巳", "卯"], 癸: ["巳", "卯"],
};

const MUNCHANG: Record<string, string> = {
  甲: "巳", 乙: "午", 丙: "申", 丁: "酉", 戊: "申",
  己: "酉", 庚: "亥", 辛: "子", 壬: "寅", 癸: "卯",
};

const BAEKHO = ["甲辰", "乙未", "丙戌", "丁丑", "戊辰", "壬戌", "癸丑"];
const GOEGANG = ["庚辰", "庚戌", "壬辰", "壬戌", "戊戌"];

function findShinsal(pillars: Pillar[], dayStem: string): Shinsal[] {
  const result: Shinsal[] = [];
  const day = pillars.find((p) => p.key === "day")!;
  const year = pillars.find((p) => p.key === "year")!;
  const others = (exclude: PillarKey) => pillars.filter((p) => p.key !== exclude);

  for (const [baseKey, base] of [["day", day], ["year", year]] as const) {
    const group = SAMHAP.find((g) => g.members.includes(base.branch));
    if (!group) continue;
    for (const id of ["dohwa", "yeokma", "hwagae"] as const) {
      const target = group[id];
      const hit = others(baseKey).find((p) => p.branch === target);
      if (hit && !result.some((r) => r.id === id)) {
        result.push({
          id,
          basis: `${LABELS[baseKey]} ${base.branchKo} 기준 · ${hit.label} ${hit.branchKo}`,
        });
      }
    }
  }

  const cheoneul = pillars.find((p) => CHEONEUL[dayStem].includes(p.branch));
  if (cheoneul) {
    result.push({ id: "cheoneul", basis: `일간 ${STEM_KO[dayStem]} · ${cheoneul.label} ${cheoneul.branchKo}` });
  }
  const munchang = pillars.find((p) => p.branch === MUNCHANG[dayStem]);
  if (munchang) {
    result.push({ id: "munchang", basis: `일간 ${STEM_KO[dayStem]} · ${munchang.label} ${munchang.branchKo}` });
  }
  const dayGz = day.stem + day.branch;
  if (BAEKHO.includes(dayGz)) result.push({ id: "baekho", basis: `일주 ${day.stemKo}${day.branchKo}` });
  if (GOEGANG.includes(dayGz)) result.push({ id: "goegang", basis: `일주 ${day.stemKo}${day.branchKo}` });
  return result;
}

export function analyze(input: BirthInput, now = new Date()): Analysis {
  const f = toSolarFields(input);
  const solar = Solar.fromYmdHms(f.y, f.m, f.d, f.h, f.mi, 0);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();
  const hourKnown = input.hour !== null;

  const dayStem: string = ec.getDayGan();
  const raw: [PillarKey, string, string][] = [
    ["year", ec.getYearGan(), ec.getYearZhi()],
    ["month", ec.getMonthGan(), ec.getMonthZhi()],
    ["day", ec.getDayGan(), ec.getDayZhi()],
    ["hour", ec.getTimeGan(), ec.getTimeZhi()],
  ];

  const pillars: Pillar[] = raw
    .filter(([key]) => hourKnown || key !== "hour")
    .map(([key, stem, branch]) => ({
      key,
      label: LABELS[key],
      stem,
      branch,
      stemKo: STEM_KO[stem],
      branchKo: BRANCH_KO[branch],
      stemEl: STEM_EL[stem],
      branchEl: BRANCH_EL[branch],
      stemGod: key === "day" ? null : tenGod(dayStem, stem),
      branchGod: tenGod(dayStem, BRANCH_MAIN_STEM[branch]),
    }));

  const dayEl = STEM_EL[dayStem];
  const day = pillars.find((p) => p.key === "day")!;

  // 오행 개수 (천간 + 지지)
  const elementCounts = emptyRecord(ELEMENTS);
  for (const p of pillars) {
    elementCounts[p.stemEl]++;
    elementCounts[p.branchEl]++;
  }

  // 십성 개수 (일간 제외 천간 + 지지 본기)
  const godCounts = emptyRecord(TEN_GODS);
  for (const p of pillars) {
    if (p.stemGod) godCounts[p.stemGod]++;
    godCounts[p.branchGod]++;
  }
  const groupCounts = emptyRecord(GROUPS);
  for (const g of TEN_GODS) groupCounts[TEN_GOD_GROUP[g]] += godCounts[g];

  // 주도 십성: 가장 많은 십성, 동률이면 월지(월령) 십성 우선
  const month = pillars.find((p) => p.key === "month")!;
  const max = Math.max(...TEN_GODS.map((g) => godCounts[g]));
  const tied = TEN_GODS.filter((g) => godCounts[g] === max);
  const dominantGod = tied.includes(month.branchGod) ? month.branchGod : tied[0];
  const groupMax = Math.max(...GROUPS.map((g) => groupCounts[g]));
  const groupTied = GROUPS.filter((g) => groupCounts[g] === groupMax);
  const monthGroup = TEN_GOD_GROUP[month.branchGod];
  const dominantGroup = groupTied.includes(monthGroup) ? monthGroup : groupTied[0];

  // 신강/신약 (간이 억부): 월지 가중치 2
  const support = (e: Element) => e === dayEl || e === generatorOf(dayEl);
  let total = 0;
  let sup = 0;
  for (const p of pillars) {
    if (p.key !== "day") {
      total += 1;
      if (support(p.stemEl)) sup += 1;
    }
    const w = p.key === "month" ? 2 : 1;
    total += w;
    if (support(p.branchEl)) sup += w;
  }
  const ratio = sup / total;
  const strong = ratio >= 0.5;
  const gauge = Math.min(5, Math.max(1, Math.round(ratio * 5)));

  // 용신 (간이 억부): 신강 → 식상/재성/관성 중 가장 약한 것, 신약 → 인성/비겁 중 약한 것
  const candidates: Element[] = strong
    ? [GENERATES[dayEl], CONTROLS[dayEl], controllerOf(dayEl)]
    : [generatorOf(dayEl), dayEl];
  const yongshin = candidates.reduce((a, b) => (elementCounts[b] < elementCounts[a] ? b : a));
  const heeshin = generatorOf(yongshin);
  const gishin = controllerOf(yongshin);

  const shinsal = findShinsal(pillars, dayStem);

  const spouseStarCount =
    input.gender === "male" ? groupCounts["재성"] : groupCounts["관성"];
  const dayBranchClash = pillars.some((p) => p.key !== "day" && isClash(p.branch, day.branch));

  // 대운
  const yun = ec.getYun(input.gender === "male" ? 1 : 0);
  const daeyun: Daeyun[] = yun
    .getDaYun()
    .slice(1, 10)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((d: any) => {
      const gz: string = d.getGanZhi();
      return {
        startAge: d.getStartAge(),
        startYear: d.getStartYear(),
        stem: gz[0],
        branch: gz[1],
        god: tenGod(dayStem, gz[0]),
      };
    });
  const thisYear = now.getFullYear();
  const currentDaeyun = [...daeyun].reverse().find((d) => d.startYear <= thisYear) ?? null;

  // 세운·월운 판단: 들어오는 간지의 오행이 용신/희신이면 +, 기신/과다 오행이면 −, 일지 충이면 −
  const excess = ELEMENTS.filter((e) => elementCounts[e] >= 3);
  const judge = (stem: string, branch: string): PeriodFlow => {
    let score = 0;
    const reasons: string[] = [];
    for (const e of [STEM_EL[stem], BRANCH_EL[branch]]) {
      if (e === yongshin) {
        score += 1;
        reasons.push("용신");
      } else if (e === heeshin) {
        score += 1;
        reasons.push("희신");
      } else if (e === gishin) {
        score -= 1;
        reasons.push("기신");
      } else if (excess.includes(e)) {
        score -= 1;
        reasons.push("과다 오행");
      }
    }
    const clashDay = isClash(branch, day.branch);
    if (clashDay) {
      score -= 1;
      reasons.push("일지 충");
    }
    const uniq = [...new Set(reasons)];
    return {
      stem,
      branch,
      god: tenGod(dayStem, stem),
      branchGod: tenGod(dayStem, BRANCH_MAIN_STEM[branch]),
      kind: score >= 1 ? "chance" : score === 0 ? "prepare" : "careful",
      reasons: uniq,
      basis: uniq.length ? uniq.join("·") : "중립",
      clashDay,
      hapDay: isHap(branch, day.branch),
    };
  };

  // 향후 10년 세운
  const flows: YearFlow[] = [];
  for (let y = thisYear; y < thisYear + 10; y++) {
    const gz: string = Lunar.fromYmd(y, 6, 1).getYearInGanZhi();
    flows.push({ year: y, ...judge(gz[0], gz[1]) });
  }

  // 이번 달 월운 (절기 기준)
  const nowLunar = Solar.fromYmd(now.getFullYear(), now.getMonth() + 1, now.getDate()).getLunar();
  const mgz: string = nowLunar.getMonthInGanZhiExact();
  const prevJie = nowLunar.getPrevJie(true);
  const nextJie = nowLunar.getNextJie(true);
  const md = (s: string) => {
    const [, mm, dd] = s.split("-").map(Number);
    return `${mm}월 ${dd}일`;
  };
  const thisMonth: MonthFlow = {
    ...judge(mgz[0], mgz[1]),
    startTerm: JIE_KO[prevJie.getName()] ?? prevJie.getName(),
    startDate: md(prevJie.getSolar().toYmd()),
    endTerm: JIE_KO[nextJie.getName()] ?? nextJie.getName(),
    endDate: md(nextJie.getSolar().toYmd()),
  };

  return {
    input,
    solarText: `${f.y}.${f.m}.${f.d}${hourKnown ? ` ${String(f.h).padStart(2, "0")}:${String(f.mi).padStart(2, "0")}` : ""}`,
    lunarText: `음력 ${lunar.getYear()}.${Math.abs(lunar.getMonth())}${lunar.getMonth() < 0 ? "(윤)" : ""}.${lunar.getDay()}`,
    pillars,
    dayStem,
    dayBranch: day.branch,
    dayEl,
    hourKnown,
    elementCounts,
    godCounts,
    groupCounts,
    dominantGod,
    dominantGroup,
    strength: { strong, ratio, gauge },
    yongshin,
    heeshin,
    gishin,
    shinsal,
    spouseStarCount,
    dayBranchClash,
    daeyun,
    currentDaeyun,
    flows,
    thisMonth,
  };
}
