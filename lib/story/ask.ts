/**
 * 질문으로 묻기 — "이직해도 될까요?" 같은 질문에 사주 근거와 시기를 붙여 답한다.
 */
import { STEM_KO, BRANCH_KO, TEN_GOD_GROUP, type TenGod, type TenGodGroup } from "../saju/constants";
import type { Analysis, FlowKind } from "../saju/engine";
import { yearDetail, type Area, type MonthDetail, type YearDetail } from "../saju/period";
import { KAEUN_DECK } from "../deck";
import { GOD_DEEP, GOD_ESSAY, STRENGTH_ESSAY } from "./essays";
import { GOD_DO3, GOD_DONT3 } from "./rich";
import { elName, ieyo } from "./text";
import { fmtPoints, scoreWord } from "./yearly";
import type { Scene, Story, StoryPage } from "./types";

export interface Question {
  id: string;
  icon: string;
  text: string;
  area: Area;
  /** 이 질문에 힘을 실어 주는 십성 그룹 */
  good: (a: Analysis) => TenGodGroup[];
  /** 이 질문에 불리한 십성 */
  bad: TenGod[];
  /** 점수가 낮을수록 "예"인 질문 (쉬어 가도 될까요?) */
  invert?: boolean;
  /** 아무리 좋아도 이 점수를 넘기지 않는다 (보증처럼 원래 위험한 일) */
  cap?: number;
  /** 두 사람이 함께 정하는 일 */
  joint?: boolean;
  why: string;
  yes: string;
  maybe: string;
  no: string;
  tips: string[];
  scene: Scene;
}

const spouse = (a: Analysis): TenGodGroup => (a.input.gender === "male" ? "재성" : "관성");
const child = (a: Analysis): TenGodGroup => (a.input.gender === "male" ? "관성" : "식상");

export const QUESTIONS: Question[] = [
  {
    id: "job",
    icon: "💼",
    text: "지금 이직해도 될까요?",
    area: "work",
    good: () => ["식상", "관성"],
    bad: ["겁재"],
    why: "이직은 일의 운(관성·식상)과 일터의 자리(월지)가 움직이는지로 봐요. 식상은 변화의 기운, 관성은 새 자리의 기운이에요.",
    yes: "지금 움직여도 좋은 흐름이에요. 새 자리가 열리는 기운이 들어와 있어요.",
    maybe: "나쁘지 않지만 조건을 갖추고 움직이세요. 다음 자리가 정해진 뒤에 옮기는 것이 원칙이에요.",
    no: "지금은 옮기기보다 버티며 준비할 때예요. 감정이 상해서 나가면 조건이 더 나빠지기 쉬워요.",
    tips: ["이력서와 포트폴리오를 지금 정리해 두세요. 좋은 달이 왔을 때 바로 움직일 수 있어요.", "연봉보다 「배울 것이 있는 자리인가」를 먼저 보세요.", "현 직장에서의 성과를 숫자로 정리해 두면 협상에서 힘이 돼요."],
    scene: { kind: "stairs", step: 3 },
  },
  {
    id: "startup",
    icon: "🚀",
    text: "창업이나 사업을 시작해도 될까요?",
    area: "money",
    good: () => ["재성", "식상"],
    bad: ["겁재", "편관"],
    why: "사업은 재성(재물)을 내 힘으로 다스릴 수 있는지로 봐요. 그래서 일간의 강약이 가장 중요하고, 식상(만들어 내는 힘)이 재성으로 이어지는지를 함께 봐요.",
    yes: "판을 벌려도 좋은 흐름이에요. 재물과 재능의 기운이 함께 들어와요.",
    maybe: "작게 시작하면 괜찮아요. 본업을 유지한 채 시험 삼아 해 보는 방식이 맞아요.",
    no: "지금은 큰돈을 걸 때가 아니에요. 아이템을 다듬고 자금을 모으는 준비 기간으로 삼으세요.",
    tips: ["6개월 치 생활비를 먼저 떼어 두고 시작하세요.", "동업은 역할과 지분을 글로 정한 뒤에만 하세요.", "처음 석 달은 적자를 견딜 계획을 세워 두세요."],
    scene: { kind: "market" },
  },
  {
    id: "house",
    icon: "🏠",
    text: "집을 사거나 이사해도 될까요?",
    area: "money",
    good: () => ["인성", "재성"],
    bad: ["겁재"],
    joint: true,
    why: "집과 계약은 인성(문서)의 기운으로, 큰돈이 움직이는 일은 재성으로 봐요. 이사 자체는 지지의 충(움직임)이 드는 때에 일어나기 쉬워요.",
    yes: "문서와 재물의 기운이 좋아요. 계약을 진행해도 괜찮은 흐름이에요.",
    maybe: "가능하지만 무리한 대출은 피하세요. 계약서를 전문가와 함께 확인하세요.",
    no: "지금은 큰 계약을 미루는 게 좋아요. 급하게 정하면 조건에서 손해를 보기 쉬워요.",
    tips: ["계약은 아래의 좋은 달에, 잔금과 이사는 그다음 좋은 달에 맞춰 보세요.", "대출 상환액이 월수입의 30%를 넘지 않게 하세요.", "등기부와 특약 사항은 반드시 직접 확인하세요."],
    scene: { kind: "chest", fill: 0.7 },
  },
  {
    id: "invest",
    icon: "📈",
    text: "투자를 시작해도 될까요?",
    area: "money",
    good: () => ["재성", "식상"],
    bad: ["겁재", "비견"],
    why: "투자는 편재(크게 움직이는 돈)의 영역이에요. 재성의 기운이 들어오는 때에 흐름을 타고, 겁재(재물을 빼앗는 별)의 때에는 잃기 쉬워요.",
    yes: "재물의 기운이 들어오는 때예요. 공부한 범위 안에서 시작해도 좋아요.",
    maybe: "적은 금액으로, 여러 번 나눠서 시작하세요. 한 번에 크게 거는 것은 피하세요.",
    no: "지금은 돈이 새기 쉬운 흐름이에요. 새로 시작하기보다 원금을 지키세요.",
    tips: ["잃어도 생활에 지장이 없는 돈으로만 하세요.", "남의 말만 듣고 들어가지 말고, 스스로 설명할 수 있는 것에만 넣으세요.", "빚을 내서 하는 투자는 피하세요."],
    scene: { kind: "money", variant: "tree", fill: 0.6 },
  },
  {
    id: "lend",
    icon: "🤝",
    text: "돈을 빌려주거나 보증을 서도 될까요?",
    area: "money",
    good: () => ["재성"],
    bad: ["겁재", "비견"],
    cap: 60,
    why: "남에게 돈이 건너가는 일은 비겁(재물을 나눠 가지는 별)의 작용이에요. 사주가 어떻든 가장 조심해야 하는 일이라, 좋은 때에도 「조건부」 이상으로 권하지 않아요.",
    yes: "",
    maybe: "꼭 해야 한다면 돌려받지 못해도 괜찮은 금액만, 차용증을 쓰고 하세요.",
    no: "하지 않는 게 좋아요. 지금은 건너간 돈이 돌아오기 어려운 흐름이에요.",
    tips: ["보증은 금액과 상관없이 서지 마세요.", "거절이 어렵다면 「가족과 상의해야 한다」고 시간을 버세요.", "빌려준다면 날짜와 금액을 문서로 남기세요."],
    scene: { kind: "money", variant: "leak", fill: 0.5 },
  },
  {
    id: "marry",
    icon: "💍",
    text: "결혼을 진행해도 될까요?",
    area: "love",
    good: (a) => [spouse(a), "인성"],
    bad: ["겁재", "상관"],
    joint: true,
    why: "결혼은 배우자의 별이 들어오는지, 배우자 자리(일지)에 합이 드는지로 봐요. 문서로 맺는 일이라 인성의 기운도 함께 봐요.",
    yes: "인연이 맺어지는 기운이 좋아요. 날을 잡고 진행해도 좋은 흐름이에요.",
    maybe: "진행해도 괜찮지만 서두르지는 마세요. 돈과 살 곳처럼 현실적인 이야기를 먼저 정리하세요.",
    no: "지금은 관계가 흔들리기 쉬운 때예요. 큰 결정은 조금 미루고 대화를 늘리세요.",
    tips: ["상견례와 예식 날짜는 아래의 좋은 달로 잡아 보세요.", "결혼 뒤 돈 관리 방식을 미리 합의하세요.", "서로의 부모님께 바라는 것과 안 되는 것을 미리 이야기하세요."],
    scene: { kind: "love", variant: "pair" },
  },
  {
    id: "confess",
    icon: "💌",
    text: "고백하거나 새 연애를 시작해도 될까요?",
    area: "love",
    good: (a) => [spouse(a), "식상"],
    bad: ["겁재"],
    why: "새 인연은 배우자의 별과 도화(매력의 별), 그리고 식상(표현의 기운)이 살아나는 때에 잘 이어져요.",
    yes: "마음을 표현하기 좋은 때예요. 인연의 기운이 당신 쪽으로 열려 있어요.",
    maybe: "천천히 가까워지세요. 고백보다 함께 보내는 시간을 먼저 늘리는 게 좋아요.",
    no: "지금은 마음이 급해지기 쉬운 때예요. 조금 지켜보고 좋은 달에 표현하세요.",
    tips: ["고백은 아래의 좋은 달, 그중에서도 편안한 자리에서 하세요.", "상대의 속도를 존중하세요.", "나를 꾸미는 데 조금 투자해 보세요. 도화의 기운이 살아나요."],
    scene: { kind: "love", variant: "blossom" },
  },
  {
    id: "reconnect",
    icon: "📞",
    text: "멀어진 사람에게 다시 연락해도 될까요?",
    area: "love",
    good: () => ["인성", "식상"],
    bad: ["상관", "겁재"],
    why: "끊어진 인연이 다시 이어지는 것은 합(合)의 작용이에요. 배우자 자리에 합이 들거나 인성(품어 주는 기운)이 드는 때에 화해가 쉬워요.",
    yes: "다시 이어지기 좋은 때예요. 짧고 가벼운 안부부터 건네 보세요.",
    maybe: "연락은 해도 좋지만 기대는 낮추세요. 답이 없어도 괜찮다는 마음으로 하세요.",
    no: "지금은 말이 엇나가기 쉬운 때예요. 조금 더 시간을 두세요.",
    tips: ["지난 일을 따지는 말로 시작하지 마세요.", "긴 글보다 짧은 안부가 좋아요.", "답을 재촉하지 마세요."],
    scene: { kind: "bench" },
  },
  {
    id: "baby",
    icon: "👶",
    text: "아이를 계획해도 될까요?",
    area: "health",
    good: (a) => [child(a)],
    bad: ["편관"],
    joint: true,
    why: "자녀 인연은 자녀의 별(여성은 식상, 남성은 관성)이 들어오는 때에 닿아요. 몸의 일이기도 해서 건강의 흐름을 함께 봐요.",
    yes: "자녀의 기운이 들어오는 때예요. 계획을 세우기 좋아요.",
    maybe: "가능한 흐름이에요. 먼저 두 사람의 건강을 챙기고 계획하세요.",
    no: "지금은 몸을 먼저 돌볼 때예요. 건강을 회복한 뒤에 계획하세요.",
    tips: ["두 사람이 함께 건강 검진을 받으세요.", "잠과 식사를 석 달 이상 규칙적으로 유지하세요.", "사주는 참고일 뿐이에요. 몸의 일은 반드시 의사와 상의하세요."],
    scene: { kind: "nest", eggs: 2 },
  },
  {
    id: "exam",
    icon: "📝",
    text: "시험이나 자격증에 도전해도 될까요?",
    area: "work",
    good: () => ["인성", "관성"],
    bad: ["편재"],
    why: "시험과 자격은 인성(학문·문서)과 관성(합격·자리)의 일이에요. 반대로 재성이 강한 때에는 마음이 현실 쪽으로 쏠려 공부가 흩어지기 쉬워요.",
    yes: "배움과 합격의 기운이 좋아요. 지금 시작해도 좋은 흐름이에요.",
    maybe: "도전은 좋지만 기간을 넉넉히 잡으세요. 한 번에 끝내려 하지 마세요.",
    no: "지금은 집중이 흩어지기 쉬운 때예요. 기초를 다지며 다음 기회를 준비하세요.",
    tips: ["시험일을 아래의 좋은 달에 맞출 수 있는지 보세요.", "매일 같은 시간, 같은 자리에서 공부하세요.", "혼자보다 스터디나 강의를 이용하세요."],
    scene: { kind: "desk", el: "water" },
  },
  {
    id: "study",
    icon: "🎓",
    text: "새 공부나 대학원을 시작해도 될까요?",
    area: "work",
    good: () => ["인성"],
    bad: ["편재", "겁재"],
    why: "새로운 배움은 인성의 영역이에요. 정인은 정식 학위와 자격을, 편인은 독특한 전문 기술을 뜻해요.",
    yes: "배움의 문이 열리는 때예요. 등록해도 좋아요.",
    maybe: "본업을 유지하면서 병행하는 방식이면 괜찮아요.",
    no: "지금은 돈과 시간이 빠듯해지기 쉬워요. 짧은 과정으로 먼저 맛을 보세요.",
    tips: ["배운 것을 어디에 쓸지 먼저 정하세요.", "등록금과 생활비 계획을 함께 세우세요.", "한 학기는 해 보고 계속할지 정하세요."],
    scene: { kind: "desk", el: "wood" },
  },
  {
    id: "rest",
    icon: "🛌",
    text: "잠시 쉬어 가도(휴직·퇴사) 될까요?",
    area: "health",
    good: () => [],
    bad: [],
    invert: true,
    why: "쉬어야 할 때는 몸의 흐름으로 봐요. 이미 넘치는 기운이 더 들어오거나 일지(몸의 자리)에 충이 드는 해에는 몸이 먼저 신호를 보내요.",
    yes: "쉬어 가는 게 맞는 때예요. 지금 무리하면 회복에 더 오래 걸려요.",
    maybe: "완전히 멈추기보다 속도를 줄이는 방법을 먼저 찾아보세요. 휴가나 근무 조정이 좋아요.",
    no: "기운이 받쳐 주는 때라 지금 멈추면 아쉬워요. 짧은 휴가로 숨을 고르고 이어 가세요.",
    tips: ["쉬는 기간과 그 뒤의 계획을 미리 정하세요.", "석 달 치 생활비를 확인하세요.", "몸의 신호가 뚜렷하다면 사주보다 병원이 먼저예요."],
    scene: { kind: "path", mood: "careful" },
  },
];

const clamp = (n: number) => Math.max(20, Math.min(98, Math.round(n)));
const gz = (s: string, b: string) => STEM_KO[s] + BRANCH_KO[b];

interface Upcoming {
  year: number;
  m: MonthDetail;
  fit: number;
}

function yearFit(a: Analysis, q: Question, d: YearDetail) {
  const bonus = (q.good(a).includes(TEN_GOD_GROUP[d.god]) ? 6 : 0) + (q.good(a).includes(TEN_GOD_GROUP[d.branchGod]) ? 3 : 0) - (q.bad.includes(d.god) ? 8 : 0);
  let s = clamp(d.areas[q.area].score + bonus);
  if (q.cap) s = Math.min(q.cap, s);
  return s;
}
function monthFit(a: Analysis, q: Question, m: MonthDetail) {
  const bonus = (q.good(a).includes(TEN_GOD_GROUP[m.god]) ? 8 : 0) + (m.hapDay ? 4 : 0) - (q.bad.includes(m.god) ? 8 : 0);
  return clamp(m.score + bonus);
}

function upcoming(a: Analysis, q: Question, details: YearDetail[], now: Date): Upcoming[] {
  const out: Upcoming[] = [];
  for (const d of details)
    for (const m of d.months) {
      if (d.year === now.getFullYear() && m.month < now.getMonth() + 1) continue;
      if (out.length >= 14) break;
      out.push({ year: d.year, m, fit: monthFit(a, q, m) });
    }
  return out;
}

const ym = (u: Upcoming) => `${u.year}년 ${u.m.month}월`;

export function buildAnswer(a: Analysis, q: Question, now: Date, partner?: { a: Analysis; name: string }, myName = "나"): Story {
  const y0 = now.getFullYear();
  const details = [yearDetail(a, y0), yearDetail(a, y0 + 1), yearDetail(a, y0 + 2)];
  const fits = details.map((d) => yearFit(a, q, d));
  const ups = upcoming(a, q, details, now);
  // "지금"의 점수: 올해 점수와 앞으로 석 달 점수의 평균
  const near = ups.slice(0, 3);
  const nowScore = Math.round((fits[0] + near.reduce((s, u) => s + u.fit, 0) / near.length) / 2);
  const eff = q.invert ? 120 - nowScore : nowScore;
  const verdict: FlowKind = eff >= 66 ? "chance" : eff >= 52 ? "prepare" : "careful";
  const answer = verdict === "chance" && q.yes ? q.yes : verdict === "careful" ? q.no : q.maybe;
  const head = verdict === "chance" && q.yes ? "네, 좋아요" : verdict === "careful" ? "지금은 미루세요" : "조건부로 괜찮아요";

  const rank = (list: Upcoming[]) => [...list].sort((x, y) => (q.invert ? x.fit - y.fit : y.fit - x.fit));
  const order = (list: Upcoming[]) => [...list].sort((x, y) => x.year * 100 + x.m.month - (y.year * 100 + y.m.month));
  const best = order(rank(ups).slice(0, 3));
  const worst = order(rank(ups).reverse().slice(0, 2));
  const d = details[0];
  const bestYearIdx = fits.indexOf(q.invert ? Math.min(...fits) : Math.max(...fits));
  const kaeun = KAEUN_DECK[a.yongshin];

  const pages: StoryPage[] = [
    {
      title: `마사 선생의 답: ${head}`,
      scene: { kind: "dodont", mode: verdict === "careful" ? "dont" : "do", icons: [q.icon, "📅", "🧭"] },
      bubbles: [
        `**「${q.text}」**`,
        `**${answer}**`,
        `지금 흐름의 점수는 **${nowScore}점(${scoreWord(nowScore)})**이에요. 이 질문에 맞춰 다시 매긴 올해 점수(${fits[0]}점)와 앞으로 석 달의 점수를 함께 본 값이에요.${q.invert ? " 이 질문은 점수가 낮을수록 쉬어야 한다는 뜻이에요." : ""}`,
        q.why,
        `가장 좋은 때를 먼저 말씀드리면 **${best.map(ym).join(", ")}**이에요. 아래에서 그 근거를 자세히 풀어 드릴게요.`,
      ],
      badges: [`지금 ${nowScore}점`],
    },
    {
      title: "사주로 본 근거",
      scene: q.scene,
      bubbles: [
        `올해 ${y0}년은 **${gz(d.stem, d.branch)}년**, 당신에게 **${d.god}**의 해예요. 종합 점수는 ${d.score}점이고, 이 질문과 관련된 ${q.area === "work" ? "일" : q.area === "money" ? "재물" : q.area === "love" ? "관계" : "건강"} 분야는 **${d.areas[q.area].score}점**이에요(근거: ${fmtPoints(d.areas[q.area].points)}). 여기에 이 질문에 힘이 되거나 불리한 기운을 더하고 빼면 **${fits[0]}점**이 돼요.`,
        q.good(a).length
          ? q.good(a).includes(TEN_GOD_GROUP[d.god])
            ? `이 질문에 힘이 되는 기운은 **${q.good(a).join("·")}**인데, 올해의 손님 ${d.god}의 기운이 바로 여기에 속해요. 그래서 점수를 더했어요.`
            : `이 질문에 힘이 되는 기운은 **${ieyo(`${q.good(a).join("·")}**`)}. 올해의 손님 ${d.god}의 기운은 여기에 속하지 않아서, 해 전체보다 **달을 골라 움직이는 것**이 중요해요.`
          : "이 질문은 특정 십성보다 몸의 균형으로 판단해요.",
        q.bad.includes(d.god) ? `게다가 ${d.god}의 기운은 이 일에 불리한 별이라 점수를 뺐어요.` : "",
        GOD_ESSAY[d.god][1],
        GOD_DEEP[d.god][q.area],
        ...(q.area === "money" || q.id === "startup" || q.id === "job" ? (a.strength.strong ? STRENGTH_ESSAY.strong : STRENGTH_ESSAY.weak) : []),
      ].filter(Boolean),
      badges: [`${d.god}의 해`, a.strength.strong ? "신강" : "신약"],
    },
    {
      title: "언제가 가장 좋을까",
      scene: { kind: "months", items: ups.slice(0, 6).map((u) => ({ month: u.m.month, score: u.fit, kind: u.fit >= 68 ? "chance" : u.fit >= 52 ? "prepare" : "careful" })), best: Math.max(...ups.slice(0, 6).map((u) => u.fit)) },
      bubbles: [
        `앞으로 ${ups.length}개월을 이 질문에 맞춰 다시 점수 매겼어요. 달의 기본 점수에, 이 일에 힘이 되는 기운이 드는 달은 더하고 불리한 기운이 드는 달은 뺐어요.`,
        ups.map((u) => `${ym(u)} · ${u.fit}점 — ${gz(u.m.stem, u.m.branch)}월, ${u.m.god}의 달${u.m.clashDay ? " (일지 충)" : u.m.hapDay ? " (일지 합)" : ""}`).join("\n"),
        `🌟 **${q.invert ? "쉬어 가기 좋은 때" : "움직이기 좋은 때"}** — ${best.map((u) => `${ym(u)}(${u.fit}점)`).join(", ")}`,
        `⛔ **${q.invert ? "오히려 힘이 나는 때" : "피하는 게 좋은 때"}** — ${worst.map((u) => `${ym(u)}(${u.fit}점)`).join(", ")}`,
        `해 단위로 보면 ${details.map((x, i) => `${x.year}년 ${fits[i]}점`).join(", ")}이에요. 세 해 중에서는 **${details[bestYearIdx].year}년**이 ${q.invert ? "가장 쉬어야 하는 해" : "가장 좋은 해"}예요.`,
      ],
    },
    {
      title: "이렇게 하세요",
      scene: { kind: "dodont", mode: "do", icons: ["✍️", "🗓️", "🍀"] },
      bubbles: [
        ...q.tips.map((t, i) => `**${i + 1}.** ${t}`),
        `올해의 기운(${d.god})을 잘 쓰는 방법도 함께 챙기세요.\n${GOD_DO3[d.god].map((t, i) => `${i + 1}. ${t}`).join("\n")}`,
        `결정하는 날에는 용신인 **${elName(a.yongshin)}** 기운을 곁에 두세요. ${kaeun.color} 계열의 옷이나 소품, ${kaeun.direction} 방향의 자리가 도움이 돼요.`,
      ],
    },
    {
      title: "이것만은 피하세요",
      scene: { kind: "dodont", mode: "dont", icons: ["⏳", "🗯️", "💸"] },
      bubbles: [
        `${d.god}의 해에 이 일을 할 때 생기기 쉬운 실수예요.`,
        ...GOD_DONT3[d.god].map((t, i) => `**${i + 1}.** ${t}`),
        "사주는 「언제가 수월한가」를 알려 주는 참고 자료예요. 건강·재정·법률과 관련된 결정은 반드시 전문가와 함께 확인하세요.",
      ],
    },
  ];

  if (partner && q.joint) {
    const pd = [yearDetail(partner.a, y0), yearDetail(partner.a, y0 + 1), yearDetail(partner.a, y0 + 2)];
    const pups = upcoming(partner.a, q, pd, now);
    const joint = ups.map((u, i) => ({ u, p: pups[i], min: Math.min(u.fit, pups[i].fit) }));
    const jb = [...joint].sort((x, y) => y.min - x.min).slice(0, 3);
    pages.splice(3, 0, {
      title: "두 사람 모두에게 좋은 달",
      scene: { kind: "duoMonths", items: joint.slice(0, 12).map((j) => ({ month: j.u.m.month, a: j.u.fit, b: j.p.fit })) },
      bubbles: [
        `이 일은 두 사람이 함께 정하는 일이라 ${partner.name}의 사주도 같이 봤어요. 파란 막대가 ${myName}, 빨간 막대가 ${partner.name}의 점수예요.`,
        joint.map((j) => `${ym(j.u)} · ${myName} ${j.u.fit} / ${partner.name} ${j.p.fit}`).join("\n"),
        `🌟 **두 사람 모두에게 좋은 달** — ${jb.map((j) => `${ym(j.u)}(${j.u.fit}·${j.p.fit}점)`).join(", ")}. 한 사람에게만 좋은 달보다, 둘 다 낮지 않은 달을 고르는 것이 부부의 일에는 더 좋아요.`,
      ],
    });
  }

  return { id: "ask", title: q.text, icon: q.icon, tagline: `${head} · ${nowScore}점`, pages };
}
