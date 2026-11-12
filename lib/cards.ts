/**
 * 분석 결과 → 정해진 틀의 카드 7장.
 * CardData 는 나중에 AI 가 문구를 다듬을 때도 이 JSON 형식 그대로만 채우게 한다.
 */
import {
  BRANCH_ANIMAL,
  ELEMENT_INFO,
  Element,
  STEM_KO,
  TEN_GOD_GROUP,
  TEN_GOD_HANJA,
} from "./saju/constants";
import type { Analysis } from "./saju/engine";
import {
  BRANCH_KEYWORD,
  DAY_STEM_DECK,
  KAEUN_DECK,
  LOVE_DECK,
  LoveCardId,
  MONEY_DECK,
  MoneyCardId,
  SPOUSE_PALACE_CONFLICT,
  TEN_GOD_DECK,
  WORK_DECK,
} from "./deck";

export type CardArt =
  | { kind: "pillar"; stem: string; branch: string; emoji: string }
  | { kind: "glyph"; glyph: string };

export interface CardData {
  slot: "self" | "nature" | "love" | "work" | "money" | "kaeun" | "flow";
  /** 카드 번호 라벨, 예: "① 나" */
  slotLabel: string;
  title: string;
  subtitle: string;
  element: Element;
  art: CardArt;
  /** 항상 3개 */
  keywords: [string, string, string];
  /** 한 줄 해석 (20자 안팎) */
  line: string;
  gauge: { label: string; value: number };
  /** 최대 3개 */
  tips: string[];
  /** 명식상 근거 태그 */
  basis: string[];
}

const clamp = (v: number) => Math.min(5, Math.max(1, Math.round(v)));
const el = (e: Element) => `${ELEMENT_INFO[e].ko}(${ELEMENT_INFO[e].hanja})`;

export function buildCards(a: Analysis): CardData[] {
  const day = a.pillars.find((p) => p.key === "day")!;
  const month = a.pillars.find((p) => p.key === "month")!;
  const stemDeck = DAY_STEM_DECK[a.dayStem];
  const animal = BRANCH_ANIMAL[a.dayBranch];

  /* ① 나 — 일주 카드 */
  const self: CardData = {
    slot: "self",
    slotLabel: "① 나",
    title: `${day.stemKo}${day.branchKo} 일주`,
    subtitle: `${stemDeck.color} ${animal.ko} · ${stemDeck.image}`,
    element: a.dayEl,
    art: { kind: "pillar", stem: day.stem, branch: day.branch, emoji: animal.emoji },
    keywords: [stemDeck.keywords[0], stemDeck.keywords[1], BRANCH_KEYWORD[a.dayBranch]],
    line: stemDeck.line,
    gauge: { label: a.strength.strong ? "기세 · 신강" : "기세 · 신약", value: a.strength.gauge },
    tips: [
      `강한 오행 ${el(maxElement(a))}`,
      `약한 오행 ${el(minElement(a))}`,
    ],
    basis: [
      `일간 ${STEM_KO[a.dayStem]}${ELEMENT_INFO[a.dayEl].hanja}`,
      `월령 ${month.branchKo}${ELEMENT_INFO[month.branchEl].hanja}`,
      `지지 세력 ${Math.round(a.strength.ratio * 100)}%`,
    ],
  };

  /* ② 기질 — 주도 십성 */
  const god = TEN_GOD_DECK[a.dominantGod];
  const nature: CardData = {
    slot: "nature",
    slotLabel: "② 기질",
    title: god.title,
    subtitle: `${a.dominantGod} ${TEN_GOD_HANJA[a.dominantGod]} 주도`,
    element: elementOfGroup(a, TEN_GOD_GROUP[a.dominantGod]),
    art: { kind: "glyph", glyph: TEN_GOD_HANJA[a.dominantGod] },
    keywords: god.keywords,
    line: god.line,
    gauge: { label: "기질 강도", value: clamp(a.godCounts[a.dominantGod] * 1.5) },
    tips: [`강점 · ${god.strength}`, `약점 · ${god.weakness}`, `스트레스 · ${god.stress}`],
    basis: [
      `${a.dominantGod} ${a.godCounts[a.dominantGod]}개`,
      month.branchGod === a.dominantGod ? `월지 ${month.branchKo} = ${a.dominantGod}` : `월지 ${month.branchGod}`,
    ],
  };

  /* ③ 연애 */
  const hasDohwa = a.shinsal.some((s) => s.id === "dohwa");
  const loveId: LoveCardId = hasDohwa
    ? "dohwa"
    : a.spouseStarCount >= 3
      ? "many"
      : a.spouseStarCount >= 1
        ? "deep"
        : "late";
  const love = LOVE_DECK[loveId];
  const starName = a.input.gender === "male" ? "재성" : "관성";
  const palaceGroup = TEN_GOD_GROUP[day.branchGod];
  const loveCard: CardData = {
    slot: "love",
    slotLabel: "③ 연애",
    title: love.title,
    subtitle: `배우자궁 ${day.branchKo}(${day.branchGod})`,
    element: day.branchEl,
    art: { kind: "glyph", glyph: love.glyph },
    keywords: love.keywords,
    line: love.line,
    gauge: {
      label: "인연 기운",
      value: clamp(2 + Math.min(a.spouseStarCount, 2) + (hasDohwa ? 1 : 0) - (a.dayBranchClash ? 1 : 0)),
    },
    tips: [
      `잘 맞는 상대 · ${ELEMENT_INFO[a.yongshin].ko} 기운이 강한 사람`,
      `갈등 포인트 · ${SPOUSE_PALACE_CONFLICT[palaceGroup]}`,
      a.dayBranchClash ? "배우자궁 충 · 적당한 거리두기" : "배우자궁 안정 · 편안한 관계 선호",
    ],
    basis: [`배우자성(${starName}) ${a.spouseStarCount}개`, ...(hasDohwa ? ["도화살"] : [])],
  };

  /* ④ 직업 */
  const work = WORK_DECK[a.dominantGroup];
  const workCard: CardData = {
    slot: "work",
    slotLabel: "④ 일",
    title: work.title,
    subtitle: `${a.dominantGroup} 중심 명식`,
    element: elementOfGroup(a, a.dominantGroup),
    art: { kind: "glyph", glyph: work.glyph },
    keywords: work.keywords,
    line: work.line,
    gauge: { label: "적성 집중도", value: clamp(a.groupCounts[a.dominantGroup] * 1.3) },
    tips: work.jobs.map((j, i) => `추천 ${i + 1} · ${j}`),
    basis: [`${a.dominantGroup} ${a.groupCounts[a.dominantGroup]}개`, `월지 ${TEN_GOD_GROUP[month.branchGod]}`],
  };

  /* ⑤ 재물 */
  const g = a.groupCounts;
  const moneyId: MoneyCardId =
    g["재성"] >= 1 && g["비겁"] >= 3
      ? "leak"
      : g["식상"] >= 1 && g["재성"] >= 1
        ? "talent"
        : g["재성"] >= 1 && g["관성"] >= 1
          ? "stable"
          : g["재성"] === 0
            ? "value"
            : "steady";
  const money = MONEY_DECK[moneyId];
  const moneyCard: CardData = {
    slot: "money",
    slotLabel: "⑤ 재물",
    title: money.title,
    subtitle: `재성 ${g["재성"]} · 식상 ${g["식상"]} · 비겁 ${g["비겁"]}`,
    element: "earth",
    art: { kind: "glyph", glyph: money.glyph },
    keywords: money.keywords,
    line: money.line,
    gauge: { label: "재물 기운", value: clamp(1 + g["재성"] + g["식상"] * 0.5 - Math.max(0, g["비겁"] - 2) * 0.5) },
    tips: [`맞는 소득 · ${money.income}`, `채울 오행 · ${el(a.yongshin)}`],
    basis: [
      moneyId === "talent" ? "식상생재 구조" : moneyId === "leak" ? "비겁 과다" : moneyId === "stable" ? "재생관 구조" : moneyId === "value" ? "재성 없음" : "재성 단독",
    ],
  };

  /* ⑥ 개운 */
  const k = KAEUN_DECK[a.yongshin];
  const kaeun: CardData = {
    slot: "kaeun",
    slotLabel: "⑥ 개운",
    title: k.title,
    subtitle: `용신 ${el(a.yongshin)} · 희신 ${el(a.heeshin)}`,
    element: a.yongshin,
    art: { kind: "glyph", glyph: ELEMENT_INFO[a.yongshin].hanja },
    keywords: k.keywords,
    line: k.line,
    gauge: { label: "현재 보유량", value: clamp(a.elementCounts[a.yongshin] + 1) },
    tips: [`색 · ${k.color}`, `방향 · ${k.direction}  숫자 · ${k.number}`, `습관 · ${k.habit}`],
    basis: [a.strength.strong ? "신강 → 설기·극제" : "신약 → 생조·부조", `${ELEMENT_INFO[a.yongshin].ko} ${a.elementCounts[a.yongshin]}개`],
  };

  return [self, nature, loveCard, workCard, moneyCard, kaeun];
}

function maxElement(a: Analysis): Element {
  return (Object.keys(a.elementCounts) as Element[]).reduce((x, y) =>
    a.elementCounts[y] > a.elementCounts[x] ? y : x,
  );
}
function minElement(a: Analysis): Element {
  return (Object.keys(a.elementCounts) as Element[]).reduce((x, y) =>
    a.elementCounts[y] < a.elementCounts[x] ? y : x,
  );
}

/** 십성 그룹이 가리키는 오행 */
function elementOfGroup(a: Analysis, group: string): Element {
  const order: Record<string, number> = { 비겁: 0, 식상: 1, 재성: 2, 관성: 3, 인성: 4 };
  // 비겁=일간, 식상=일간이 생, 재성=일간이 극, 관성=일간을 극, 인성=일간을 생
  const cycle: Element[] = ["wood", "fire", "earth", "metal", "water"];
  return cycle[(cycle.indexOf(a.dayEl) + order[group]) % 5];
}
