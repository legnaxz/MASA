/**
 * 태어난 시간 찾기 — 12개 시주 후보를 만들고, 몇 가지 질문으로 가능성이 높은 순서를 매긴다.
 * 어디까지나 추정이다.
 */
import { BRANCHES, BRANCH_KO, TEN_GOD_GROUP, type TenGodGroup } from "./constants";
import { analyze, type BirthInput, type Pillar } from "./engine";

export interface HourCandidate {
  /** HHMM */
  time: string;
  branch: string;
  label: string;
  range: string;
  pillar: Pillar;
  stemGroup: TenGodGroup;
  branchGroup: TenGodGroup;
  period: "dawn" | "morning" | "noon" | "evening" | "night" | "midnight";
  score: number;
}

const PERIOD: Record<string, HourCandidate["period"]> = {
  子: "midnight", 丑: "midnight", 寅: "dawn", 卯: "dawn", 辰: "morning", 巳: "morning",
  午: "noon", 未: "noon", 申: "evening", 酉: "evening", 戌: "night", 亥: "night",
};

export function hourCandidates(input: BirthInput): HourCandidate[] {
  const shift = input.solarTimeCorrection ? 30 : 0;
  return BRANCHES.map((branch, i) => {
    // 시지의 한가운데 시각 (자시 00시, 축시 02시 …) + 보정
    const total = (i * 120 + shift + 10) % 1440;
    const hh = Math.floor(total / 60);
    const mm = total % 60;
    const a = analyze({ ...input, hour: hh, minute: mm });
    const pillar = a.pillars.find((p) => p.key === "hour")!;
    const start = (i * 120 - 60 + shift + 1440) % 1440;
    const end = (start + 120) % 1440;
    const f = (t: number) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
    return {
      time: `${String(hh).padStart(2, "0")}${String(mm).padStart(2, "0")}`,
      branch,
      label: `${BRANCH_KO[branch]}시(${branch}時)`,
      range: `${f(start)}~${f(end)}`,
      pillar,
      stemGroup: TEN_GOD_GROUP[pillar.stemGod!],
      branchGroup: TEN_GOD_GROUP[pillar.branchGod],
      period: PERIOD[branch],
      score: 0,
    };
  });
}

export interface HourQuestion {
  id: "inner" | "junior" | "clock";
  text: string;
  why: string;
  options: { value: string; label: string }[];
}

export const HOUR_QUESTIONS: HourQuestion[] = [
  {
    id: "inner",
    text: "혼자 있을 때, 또는 나이가 들수록 내가 가장 마음 쓰는 것은?",
    why: "시지(태어난 시간의 지지)는 속마음과 인생 후반의 지향을 보여 줘요.",
    options: [
      { value: "비겁", label: "내 방식대로, 간섭받지 않고 사는 것" },
      { value: "식상", label: "만들고 말하고 즐기는 것" },
      { value: "재성", label: "안정된 살림과 눈에 보이는 결과" },
      { value: "관성", label: "맡은 역할과 평판, 책임" },
      { value: "인성", label: "공부와 사색, 마음의 평화" },
    ],
  },
  {
    id: "junior",
    text: "후배나 아이, 아랫사람을 대할 때 나는?",
    why: "시간(태어난 시간의 천간)은 자녀·아랫사람을 대하는 겉모습을 보여 줘요.",
    options: [
      { value: "비겁", label: "친구처럼 대등하게 대한다" },
      { value: "식상", label: "챙기고 가르치고, 잔소리도 한다" },
      { value: "재성", label: "용돈이나 기회처럼 현실적인 도움을 준다" },
      { value: "관성", label: "규칙과 예의를 분명히 가르친다" },
      { value: "인성", label: "품어 주고 스스로 할 때까지 기다린다" },
    ],
  },
  {
    id: "clock",
    text: "하루 중 머리가 가장 맑고 기운이 나는 때는?",
    why: "태어난 시간대와 몸의 리듬이 닮는다는 속설을 참고해요. 가장 약한 단서라 점수를 적게 줘요.",
    options: [
      { value: "dawn", label: "새벽~이른 아침 (3~7시)" },
      { value: "morning", label: "오전 (7~11시)" },
      { value: "noon", label: "한낮 (11~15시)" },
      { value: "evening", label: "늦은 오후~저녁 (15~19시)" },
      { value: "night", label: "밤 (19~23시)" },
      { value: "midnight", label: "한밤~새벽 (23~3시)" },
    ],
  },
];

/** 답에 따라 후보에 점수를 매겨 높은 순으로 정렬한다 (속마음 3점, 아랫사람 2점, 시간대 1점) */
export function rankHours(cands: HourCandidate[], answers: Partial<Record<HourQuestion["id"], string>>): HourCandidate[] {
  return cands
    .map((c) => ({
      ...c,
      score: (answers.inner === c.branchGroup ? 3 : 0) + (answers.junior === c.stemGroup ? 2 : 0) + (answers.clock === c.period ? 1 : 0),
    }))
    .sort((x, y) => y.score - x.score);
}
