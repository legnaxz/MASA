export type Element = "wood" | "fire" | "earth" | "metal" | "water";

export const ELEMENTS: Element[] = ["wood", "fire", "earth", "metal", "water"];

export const ELEMENT_INFO: Record<
  Element,
  { ko: string; hanja: string; color: string; deep: string }
> = {
  wood: { ko: "목", hanja: "木", color: "#3f9a63", deep: "#1f5c3a" },
  fire: { ko: "화", hanja: "火", color: "#d4513f", deep: "#7f2219" },
  earth: { ko: "토", hanja: "土", color: "#c99a2e", deep: "#6e5214" },
  metal: { ko: "금", hanja: "金", color: "#9aa3b0", deep: "#4a515c" },
  water: { ko: "수", hanja: "水", color: "#3767b0", deep: "#16305e" },
};

/** 상생: key 가 value 를 생한다 */
export const GENERATES: Record<Element, Element> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

/** 상극: key 가 value 를 극한다 */
export const CONTROLS: Record<Element, Element> = {
  wood: "earth",
  earth: "water",
  water: "fire",
  fire: "metal",
  metal: "wood",
};

export const generatorOf = (e: Element): Element =>
  ELEMENTS.find((x) => GENERATES[x] === e)!;
export const controllerOf = (e: Element): Element =>
  ELEMENTS.find((x) => CONTROLS[x] === e)!;

export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

export const STEM_KO: Record<string, string> = {
  甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무",
  己: "기", 庚: "경", 辛: "신", 壬: "임", 癸: "계",
};

export const BRANCH_KO: Record<string, string> = {
  子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사",
  午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해",
};

export const STEM_EL: Record<string, Element> = {
  甲: "wood", 乙: "wood", 丙: "fire", 丁: "fire", 戊: "earth",
  己: "earth", 庚: "metal", 辛: "metal", 壬: "water", 癸: "water",
};

export const BRANCH_EL: Record<string, Element> = {
  子: "water", 丑: "earth", 寅: "wood", 卯: "wood", 辰: "earth", 巳: "fire",
  午: "fire", 未: "earth", 申: "metal", 酉: "metal", 戌: "earth", 亥: "water",
};

/** 지지의 본기(정기) — 지지 십성 판단에 사용 */
export const BRANCH_MAIN_STEM: Record<string, string> = {
  子: "癸", 丑: "己", 寅: "甲", 卯: "乙", 辰: "戊", 巳: "丙",
  午: "丁", 未: "己", 申: "庚", 酉: "辛", 戌: "戊", 亥: "壬",
};

export const BRANCH_ANIMAL: Record<string, { ko: string; emoji: string }> = {
  子: { ko: "쥐", emoji: "🐀" },
  丑: { ko: "소", emoji: "🐂" },
  寅: { ko: "호랑이", emoji: "🐅" },
  卯: { ko: "토끼", emoji: "🐇" },
  辰: { ko: "용", emoji: "🐉" },
  巳: { ko: "뱀", emoji: "🐍" },
  午: { ko: "말", emoji: "🐎" },
  未: { ko: "양", emoji: "🐐" },
  申: { ko: "원숭이", emoji: "🐒" },
  酉: { ko: "닭", emoji: "🐓" },
  戌: { ko: "개", emoji: "🐕" },
  亥: { ko: "돼지", emoji: "🐖" },
};

export const isYangStem = (s: string) => STEMS.indexOf(s) % 2 === 0;

/** 지지 충 */
export const CLASH_PAIRS: [string, string][] = [
  ["子", "午"], ["丑", "未"], ["寅", "申"], ["卯", "酉"], ["辰", "戌"], ["巳", "亥"],
];
export const isClash = (a: string, b: string) =>
  CLASH_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

/** 지지 육합 */
export const HAP_PAIRS: [string, string][] = [
  ["子", "丑"], ["寅", "亥"], ["卯", "戌"], ["辰", "酉"], ["巳", "申"], ["午", "未"],
];
export const isHap = (a: string, b: string) =>
  HAP_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

/** 천간합과 합화 오행 */
const STEM_HAP: [string, string, Element][] = [
  ["甲", "己", "earth"], ["乙", "庚", "metal"], ["丙", "辛", "water"], ["丁", "壬", "wood"], ["戊", "癸", "fire"],
];
export function stemHap(a: string, b: string): Element | null {
  const hit = STEM_HAP.find(([x, y]) => (x === a && y === b) || (x === b && y === a));
  return hit ? hit[2] : null;
}

/** 원진 */
const WONJIN_PAIRS: [string, string][] = [
  ["子", "未"], ["丑", "午"], ["寅", "酉"], ["卯", "申"], ["辰", "亥"], ["巳", "戌"],
];
export const isWonjin = (a: string, b: string) =>
  WONJIN_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

/** 같은 삼합 무리(서로 다른 글자)인지 */
const SAMHAP_GROUPS = [["申", "子", "辰"], ["亥", "卯", "未"], ["寅", "午", "戌"], ["巳", "酉", "丑"]];
export const isSamhap = (a: string, b: string) =>
  a !== b && SAMHAP_GROUPS.some((g) => g.includes(a) && g.includes(b));

/** 삼합 기준 도화 지지 */
export function dohwaOf(branch: string): string {
  if (["寅", "午", "戌"].includes(branch)) return "卯";
  if (["申", "子", "辰"].includes(branch)) return "酉";
  if (["巳", "酉", "丑"].includes(branch)) return "午";
  return "子";
}

/** 절기(節) 한글 이름 — lunar-javascript 는 간체/병음으로 돌려준다 */
export const JIE_KO: Record<string, string> = {
  立春: "입춘", LI_CHUN: "입춘", 惊蛰: "경칩", JING_ZHE: "경칩", 清明: "청명", QING_MING: "청명",
  立夏: "입하", LI_XIA: "입하", 芒种: "망종", MANG_ZHONG: "망종", 小暑: "소서", XIAO_SHU: "소서",
  立秋: "입추", LI_QIU: "입추", 白露: "백로", BAI_LU: "백로", 寒露: "한로", HAN_LU: "한로",
  立冬: "입동", LI_DONG: "입동", 大雪: "대설", DA_XUE: "대설", 小寒: "소한", XIAO_HAN: "소한",
};

export type TenGod =
  | "비견" | "겁재" | "식신" | "상관" | "편재"
  | "정재" | "편관" | "정관" | "편인" | "정인";

export type TenGodGroup = "비겁" | "식상" | "재성" | "관성" | "인성";

export const TEN_GOD_GROUP: Record<TenGod, TenGodGroup> = {
  비견: "비겁", 겁재: "비겁",
  식신: "식상", 상관: "식상",
  편재: "재성", 정재: "재성",
  편관: "관성", 정관: "관성",
  편인: "인성", 정인: "인성",
};

export const TEN_GOD_HANJA: Record<TenGod, string> = {
  비견: "比肩", 겁재: "劫財", 식신: "食神", 상관: "傷官", 편재: "偏財",
  정재: "正財", 편관: "偏官", 정관: "正官", 편인: "偏印", 정인: "正印",
};

/** 일간 기준으로 다른 천간의 십성을 구한다 */
export function tenGod(dayStem: string, other: string): TenGod {
  const de = STEM_EL[dayStem];
  const oe = STEM_EL[other];
  const same = isYangStem(dayStem) === isYangStem(other);
  if (oe === de) return same ? "비견" : "겁재";
  if (GENERATES[de] === oe) return same ? "식신" : "상관";
  if (CONTROLS[de] === oe) return same ? "편재" : "정재";
  if (CONTROLS[oe] === de) return same ? "편관" : "정관";
  return same ? "편인" : "정인";
}
