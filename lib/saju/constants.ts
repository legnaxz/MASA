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
