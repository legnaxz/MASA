/**
 * 올해·내년 운세 — 최대한 자세하게, "예를 들어"로 구체적인 장면까지 풀어준다.
 */
import {
  BRANCH_ANIMAL,
  BRANCH_EL,
  BRANCH_KO,
  ELEMENTS,
  ELEMENT_INFO,
  STEM_EL,
  STEM_KO,
  TEN_GOD_GROUP,
  TEN_GOD_HANJA,
  dohwaOf,
  type Element,
  type TenGod,
  type TenGodGroup,
} from "../saju/constants";
import type { Analysis, PillarKey, ScorePoint } from "../saju/engine";
import type { InteractionType, MonthDetail, YearDetail } from "../saju/period";
import { DAY_STEM_DECK, KAEUN_DECK } from "../deck";
import { EL_COLOR_WORD, EL_MEANING, GOD_PLAIN, elName, eul, eun, iga, ieyo, wa } from "./text";
import type { Story } from "./types";

/* ---------------- 십성별 분야 풀이 (예시 포함) ---------------- */
export const GOD_AREA: Record<
  TenGod,
  { theme: string; work: string; money: string; love: string; people: string; examples: [string, string, string]; monthAction: string }
> = {
  비견: {
    theme: "나와 같은 기운이 하나 더 들어와 내 힘이 세지고 독립심이 커지는 해",
    work: "혼자 판단하고 밀어붙이는 힘이 강해져요. 예를 들어 팀에서 「이건 제 방식대로 해 볼게요」 하고 손을 들거나, 회사 밖에서 내 일을 따로 준비하게 되는 식이에요.",
    money: "수입은 내가 움직인 만큼 들어오지만, 친구·동료와 함께 쓰는 돈이 늘어요. 예를 들어 모임 회비, 경조사, 함께 가는 여행 비용이 생각보다 커져요.",
    love: "연애에서도 내 주관이 뚜렷해져요. 상대에게 맞추기보다 「나는 이렇게 하고 싶어」가 먼저 나와서, 작은 의견 차이가 고집 싸움이 되기 쉬워요.",
    people: "비슷한 처지의 친구·동료가 늘어나요. 같이 운동을 시작하거나 스터디를 꾸리기 좋아요.",
    examples: ["회사에서 내 이름을 걸고 맡는 프로젝트가 생기거나", "부업·창업을 진지하게 알아보게 되거나", "오래 연락이 끊겼던 친구와 다시 가까워지는 일"],
    monthAction: "혼자 끌어안던 일을 동료와 나누면 훨씬 수월해요.",
  },
  겁재: {
    theme: "나와 닮았지만 내 몫을 나눠 가지려는 기운이 들어와 경쟁과 지출이 커지는 해",
    work: "경쟁자가 눈에 띄게 늘어요. 예를 들어 승진 자리를 두고 동기와 겨루거나, 같은 아이템을 가진 경쟁 업체가 나타나는 식이에요. 지지 않으려는 승부욕이 성과로 이어지기도 해요.",
    money: "들어오는 만큼 새어 나가기 쉬워요. 예를 들어 지인의 투자 권유, 보증 부탁, 충동적인 큰 쇼핑 같은 일이에요. 계약서 없는 돈거래는 특히 피하세요.",
    love: "연애에 경쟁자가 생기거나, 연인과 「누가 더 맞춰 주나」로 부딪히기 쉬워요.",
    people: "사람이 많이 모이지만 그만큼 이해관계도 얽혀요. 선을 분명히 긋는 게 나를 지키는 방법이에요.",
    examples: ["동업·공동 투자 제안을 받거나", "승진·입찰에서 경쟁을 치르거나", "예상하지 못한 목돈 지출이 생기는 일"],
    monthAction: "큰 지출·보증·동업 결정은 다음 달로 미루는 게 좋아요.",
  },
  식신: {
    theme: "내 재능이 자연스럽게 흘러나오고 마음의 여유가 생기는 해",
    work: "하던 일이 무르익어 결과물이 꾸준히 나와요. 예를 들어 작업 속도가 붙어 포트폴리오가 쌓이거나, 「노하우 좀 알려 달라」는 부탁을 받게 돼요.",
    money: "재능이 작은 수입으로 이어지기 좋아요. 예를 들어 취미로 만든 것을 팔거나, 강의·클래스로 부수입을 얻는 식이에요.",
    love: "표현이 부드러워지고 함께 먹고 즐기는 데이트가 늘어요. 편안한 관계가 깊어지는 해예요.",
    people: "사람들이 당신 곁에서 편안함을 느껴요. 음식·취미 모임이 그대로 인맥이 돼요.",
    examples: ["새로 시작한 취미가 수익이 되거나", "맛집·요리·여행 같은 즐거움이 늘거나", "후배를 가르치는 역할을 맡는 일"],
    monthAction: "배우던 것을 결과물로 만들어 사람들에게 보여 주세요.",
  },
  상관: {
    theme: "생각과 말이 밖으로 터져 나와 변화와 혁신을 만드는 해",
    work: "기존 방식이 답답하게 느껴지고 새 방법을 제안하게 돼요. 예를 들어 회의에서 과감한 아이디어를 내거나, 지금 직장을 떠나 새 판을 짜고 싶어져요. 다만 윗사람과 말로 부딪히기 쉬워요.",
    money: "아이디어·말·글이 돈이 되는 해예요. 예를 들어 콘텐츠·영업·마케팅에서 성과가 나요. 반대로 홧김에 그만두거나 지르는 결정은 손해로 이어져요.",
    love: "솔직한 표현이 매력이 되지만, 날 선 한마디가 오래 남는 상처가 될 수 있어요.",
    people: "말 한마디로 인기를 얻기도, 적을 만들기도 해요. 칭찬은 크게, 비판은 작게 하세요.",
    examples: ["이직·전직을 진지하게 고민하거나", "SNS·발표로 주목받거나", "상사·규칙과 부딪히는 일"],
    monthAction: "아이디어를 정리해 발표하기 좋지만, 윗사람 앞에서는 말을 한 번 고르세요.",
  },
  편재: {
    theme: "크게 움직이는 돈과 기회가 들어오는 해",
    work: "활동 반경이 넓어지고 새로운 사람·거래처를 만나요. 예를 들어 출장이 잦아지거나, 영업·사업 기회를 잡게 되는 식이에요.",
    money: "큰돈이 오가요. 예를 들어 투자 수익, 사업 매출, 상여금이 생겨요. 하지만 들어온 만큼 크게 쓰기도 쉬워서 「버는 해」이면서 「쓰는 해」가 돼요.",
    love: "새로운 만남이 많아져요. 특히 남성에게는 이성 인연이 활발해지는 해예요.",
    people: "사교 모임이 늘고 인맥이 넓어져요. 아버지·윗사람과 관련된 일도 생기기 쉬워요.",
    examples: ["부업이나 투자에서 성과를 보거나", "해외·지방 출장이 늘거나", "새로운 모임에서 인연을 만나는 일"],
    monthAction: "새 거래처·영업·만남에 적극적으로 나서 보세요.",
  },
  정재: {
    theme: "성실하게 일한 만큼 안정적인 결실이 쌓이는 해",
    work: "꼼꼼함과 책임감을 인정받아요. 예를 들어 맡은 업무의 정확도가 평가에 반영되거나, 정규직 전환·연봉 협상이 순조롭게 풀리는 식이에요.",
    money: "월급처럼 고정적인 수입이 늘고 저축하기 좋은 해예요. 예를 들어 적금 만기, 대출 상환, 내 집 마련 준비 같은 일이에요.",
    love: "현실적이고 든든한 연애예요. 특히 남성에게는 결혼을 생각할 만한 인연이 들어오기 쉬워요.",
    people: "신뢰가 쌓이는 해예요. 약속을 지키는 작은 습관이 큰 평판이 돼요.",
    examples: ["연봉이 오르거나 안정적인 일자리를 얻거나", "가계부·저축 목표를 이루거나", "결혼 이야기가 구체적으로 오가는 일"],
    monthAction: "저축·계약·가계 정리를 하기 좋은 달이에요.",
  },
  편관: {
    theme: "나를 단련시키는 압박과 도전이 들어오는 해",
    work: "무거운 책임과 어려운 과제가 주어져요. 예를 들어 갑자기 큰 프로젝트의 책임자가 되거나, 까다로운 상사·고객을 맡게 되는 식이에요. 버텨 내면 실력과 위상이 한 단계 올라가요.",
    money: "수입보다 책임이 먼저 오는 해예요. 예를 들어 세금·과태료·병원비처럼 피할 수 없는 지출이 생기기 쉬우니 비상금을 마련해 두세요.",
    love: "강렬한 끌림이 있지만 다툼도 강해요. 특히 여성에게는 카리스마 있는 이성 인연이 들어오기 쉬워요.",
    people: "경쟁과 견제를 받기 쉬워요. 원칙을 지키면 오히려 신뢰를 얻어요.",
    examples: ["승진과 함께 업무 압박이 커지거나", "시험·자격·규정과 씨름하거나", "몸을 혹사해 피로가 쌓이는 일"],
    monthAction: "어려운 과제를 정면으로 마주하되, 잠과 휴식은 꼭 챙기세요.",
  },
  정관: {
    theme: "바른 자리와 명예, 인정이 찾아오는 해",
    work: "조직에서 인정받고 공식적인 자리에 오르기 좋아요. 예를 들어 승진, 정규직·공무원·대기업 합격, 중요한 직책 제안 같은 일이 생겨요.",
    money: "급여·직급이 오르며 수입이 안정돼요. 다만 경조사·품위 유지처럼 체면을 위한 지출도 함께 늘어요.",
    love: "진지하고 책임감 있는 만남이에요. 특히 여성에게는 결혼까지 이어질 만한 인연이 들어오기 쉬워요.",
    people: "윗사람의 신뢰를 얻는 해예요. 예의와 원칙이 가장 큰 무기가 돼요.",
    examples: ["승진·합격 소식을 듣거나", "공식적인 직함·자격을 얻거나", "상견례·결혼 같은 공식 행사를 치르는 일"],
    monthAction: "면접·승진 심사·공식 자리에 나서기 좋아요.",
  },
  편인: {
    theme: "특별한 공부와 직관, 방향 전환이 찾아오는 해",
    work: "지금 하는 일에 회의가 들고 새로운 분야에 눈이 가요. 예를 들어 전혀 다른 자격증을 준비하거나, 심리·IT·예술처럼 독특한 공부를 시작하게 되는 식이에요.",
    money: "당장의 수입보다 공부·자기계발에 돈이 들어가요. 예를 들어 강의 수강료, 장비 구입 같은 지출이에요. 미래를 위한 투자로 생각하세요.",
    love: "혼자만의 시간이 필요해져 연애에 소극적일 수 있어요. 깊은 대화가 통하는 사람에게 끌려요.",
    people: "넓은 인맥보다 소수의 깊은 관계가 편해져요.",
    examples: ["새로운 분야로 진로를 틀거나", "자격증·대학원을 준비하거나", "명상·여행으로 생각을 정리하는 일"],
    monthAction: "공부·연구·장기 계획을 세우기 좋은 달이에요.",
  },
  정인: {
    theme: "도움과 배움, 문서의 복이 찾아오는 해",
    work: "윗사람·선배의 도움으로 일이 풀려요. 예를 들어 좋은 멘토를 만나거나, 교육·연수 기회를 얻거나, 중요한 서류가 통과되는 식이에요.",
    money: "문서와 관련된 재물운이에요. 예를 들어 계약, 부동산, 청약, 지원금 같은 일이에요. 꼼꼼히 읽고 서명하면 득이 돼요.",
    love: "따뜻하게 챙겨 주는 사람을 만나기 쉬워요. 가족의 지지 속에서 관계가 안정돼요.",
    people: "어머니·스승·윗사람과의 관계가 좋아져요. 도움을 청하면 손을 잡아 줄 사람이 있어요.",
    examples: ["시험·자격증에 합격하거나", "계약·부동산 문서를 다루거나", "좋은 스승·후원자를 만나는 일"],
    monthAction: "계약서 서명·시험·도움 요청에 좋은 달이에요.",
  },
};

/* ---------------- 원국 자리별 의미 ---------------- */
export const POSITION: Record<PillarKey, { name: string; area: string }> = {
  year: { name: "연지", area: "부모·윗사람·사회적 평판" },
  month: { name: "월지", area: "직장·일터·형제와 동료" },
  day: { name: "일지", area: "배우자와 나 자신" },
  hour: { name: "시지", area: "자녀·아랫사람·미래 계획" },
};

export const INTERACTION_NAME: Record<InteractionType, string> = {
  clash: "충(沖)",
  hap: "합(合)",
  wonjin: "원진(怨嗔)",
  samhap: "삼합(三合)",
  same: "같은 글자",
};

export const INTERACTION_EX: Record<InteractionType, Record<PillarKey, string>> = {
  clash: {
    year: "윗사람이나 부모님과 관련된 변화가 생기기 쉬워요. 예를 들어 부모님의 이사·건강 문제로 신경 쓸 일이 생기거나, 사회적 평판이 흔들리는 일이 있을 수 있어요.",
    month: "일터와 환경이 크게 흔들려요. 예를 들어 부서 이동, 이직 제안, 회사 구조 조정, 출퇴근 길이 바뀌는 이사 같은 일이에요.",
    day: "나와 배우자 자리가 흔들려요. 예를 들어 연인·배우자와 생활 패턴이 어긋나거나, 이사·주거 변화가 생기고, 몸 컨디션이 들쭉날쭉할 수 있어요.",
    hour: "자녀나 미래 계획에 변화가 생겨요. 예를 들어 자녀의 진학·이사 문제, 장기 계획을 고쳐 짜는 일이에요.",
  },
  hap: {
    year: "윗사람·부모님과 사이가 가까워져요. 예를 들어 집안 어른의 도움을 받거나 좋은 평판이 생겨요.",
    month: "일터에서 손발이 잘 맞아요. 예를 들어 마음 맞는 동료·협력사를 만나거나, 조건 좋은 계약이 성사돼요.",
    day: "나와 배우자 자리에 합이 들어와요. 예를 들어 새로운 연인, 결혼 이야기, 멀어졌던 관계의 회복처럼 인연이 맺어지는 일이에요.",
    hour: "자녀·미래와 관련된 좋은 소식이에요. 예를 들어 임신·출산, 자녀의 합격, 노후 계획이 잡히는 일이에요.",
  },
  wonjin: {
    year: "윗사람과 미묘한 서운함이 쌓이기 쉬워요. 말하지 않은 불만을 키우지 마세요.",
    month: "동료·직장과 은근한 갈등이 생겨요. 예를 들어 공은 내가 세웠는데 인정은 남이 받는 듯한 서운함이에요.",
    day: "가까운 사람과 이유 모를 서운함이 쌓여요. 예를 들어 연인의 사소한 말투가 계속 거슬리는 식이에요.",
    hour: "자녀·아랫사람과 마음이 엇갈리기 쉬워요. 조급하게 다그치지 마세요.",
  },
  samhap: {
    year: "사회적으로 뜻 맞는 사람들과 손잡기 좋아요. 예를 들어 모임이나 단체 활동에서 역할을 맡게 돼요.",
    month: "일에서 같은 목표를 가진 팀이 꾸려져요. 예를 들어 프로젝트 팀이나 동업 제안이 들어와요.",
    day: "나와 같은 방향을 보는 사람이 나타나요. 예를 들어 함께 목표를 세우는 연인·친구를 만나요.",
    hour: "미래 계획에 힘을 보태 줄 사람이 생겨요.",
  },
  same: {
    year: "같은 글자가 겹쳐 윗사람·평판과 관련된 일이 두드러져요.",
    month: "같은 글자가 겹쳐 직장·동료와 관련된 일이 두드러져요.",
    day: "같은 글자가 겹쳐 나 자신과 배우자에 관한 일이 두드러져요. 예를 들어 비슷한 고민이 반복되는 식이에요.",
    hour: "같은 글자가 겹쳐 자녀·미래 계획에 관한 일이 두드러져요.",
  },
};

export const STEM_TIE_EX: Record<PillarKey, string> = {
  year: "사회·윗사람과 인연이 묶여요. 예를 들어 새 조직에 소속되거나 후원을 받는 일이에요.",
  month: "일과 관련된 약속에 묶여요. 예를 들어 계약, 입사, 동업처럼 오래 가는 약속이에요.",
  day: "내 마음이 무언가에 단단히 묶여요. 예를 들어 새로운 연인, 결혼, 쉽게 놓을 수 없는 장기 프로젝트예요.",
  hour: "미래를 위한 약속이 생겨요. 예를 들어 자녀 계획, 장기 저축·보험 같은 약속이에요.",
};

/* ---------------- 오행과 건강 ---------------- */
const EL_BODY: Record<Element, string> = {
  wood: "간·담, 눈, 근육과 힘줄",
  fire: "심장과 혈액순환, 혈압",
  earth: "위장과 소화기",
  metal: "폐·기관지, 대장, 피부",
  water: "신장·방광, 허리와 뼈",
};
const EL_HEALTH_TIP: Record<Element, string> = {
  wood: "스트레칭을 자주 하고 화면을 오래 보지 않도록 눈을 쉬게 해 주세요",
  fire: "잠을 충분히 자고, 무리한 운동보다 가벼운 유산소로 심박을 안정시켜 주세요",
  earth: "끼니를 거르지 말고, 야식과 과식을 줄여 주세요",
  metal: "환절기 호흡기 관리와 피부 보습을 챙겨 주세요",
  water: "몸을 따뜻하게 하고 물을 자주 마셔 주세요. 허리를 오래 굽히는 자세도 피하세요",
};
const EL_EXCESS_LIFE: Record<Element, string> = {
  wood: "고집과 추진력이 지나쳐 주변과 부딪히기 쉬워요",
  fire: "마음이 급해지고 감정 기복이 커지기 쉬워요",
  earth: "생각이 많아지고 결정이 늦어지기 쉬워요",
  metal: "날카로워지고 사람을 쉽게 끊어 내기 쉬워요",
  water: "걱정이 많아지고 혼자 가라앉기 쉬워요",
};

/* ---------------- 공통 헬퍼 ---------------- */
const gzKo = (s: string, b: string) => STEM_KO[s] + BRANCH_KO[b];
const sign = (n: number) => (n > 0 ? `+${n}` : `−${Math.abs(n)}`);
export const fmtPoints = (pts: ScorePoint[]) => (pts.length ? pts.map((p) => `${p.label} ${sign(p.delta)}`).join(" · ") : "가감 없음");
export const scoreWord = (s: number) => (s >= 80 ? "아주 좋음" : s >= 68 ? "좋음" : s >= 52 ? "보통" : s >= 40 ? "주의" : "조심");

function monthLine(m: MonthDetail, a: Analysis): string {
  const extra = m.clashDay
    ? " 이달은 일지와 충이 있어 이동·변화가 잦으니 큰 약속은 여유 있게 잡으세요."
    : m.hapDay
      ? " 이달은 일지와 합이 있어 만남·계약이 부드럽게 풀려요."
      : m.wonjinDay
        ? " 이달은 일지와 원진이 있어 가까운 사람의 말에 서운해지기 쉬워요."
        : "";
  void a;
  return [
    `**${m.month}월 · ${m.score}점 (${scoreWord(m.score)})** — ${gzKo(m.stem, m.branch)}월, ${m.god}의 달`,
    `근거: 기본 60 → ${fmtPoints(m.points)} → 이달 ${m.own}점, 한 해 흐름 30% 반영`,
    `👉 ${GOD_AREA[m.god].monthAction}${extra}`,
  ].join("\n");
}

function pickMonths(ms: MonthDetail[], filter: (m: MonthDetail) => boolean, n = 2, low = false) {
  const pool = ms.filter(filter);
  const src = pool.length ? pool : ms;
  return [...src].sort((x, y) => (low ? x.score - y.score : y.score - x.score)).slice(0, n);
}
const monthList = (ms: MonthDetail[]) => ms.map((m) => `${m.month}월(${m.score}점)`).join(", ");

/* ---------------- 이야기 만들기 ---------------- */
export function buildYearStory(a: Analysis, d: YearDetail, which: "this" | "next"): Story {
  const label = which === "this" ? "올해" : "내년";
  const stemEl = STEM_EL[d.stem];
  const branchEl = BRANCH_EL[d.branch];
  const animal = BRANCH_ANIMAL[d.branch];
  const area = GOD_AREA[d.god];
  const bArea = GOD_AREA[d.branchGod];
  const me = DAY_STEM_DECK[a.dayStem];
  const kaeun = KAEUN_DECK[a.yongshin];
  const group: TenGodGroup = TEN_GOD_GROUP[d.god];

  /* 1. 그해의 기운 */
  const p1 = {
    title: `${d.year}년, ${EL_COLOR_WORD[stemEl]} ${animal.ko}의 해`,
    scene: { kind: "year" as const, el: stemEl, emoji: animal.emoji, ganzhi: d.stem + d.branch },
    bubbles: [
      `${label} ${d.year}년은 **${gzKo(d.stem, d.branch)}년(${d.stem}${d.branch})**, ${EL_COLOR_WORD[stemEl]} ${animal.ko}의 해예요.`,
      stemEl === branchEl
        ? `하늘(천간)과 땅(지지)에 모두 **${elName(stemEl)}** 기운이 흘러요. ${EL_MEANING[stemEl]}이 한 해 내내 아주 뚜렷하게 드러나요.`
        : `하늘(천간)에는 **${elName(stemEl)}**, 땅(지지)에는 **${elName(branchEl)}** 기운이 흘러요. 겉으로 드러나는 분위기는 ${EL_MEANING[stemEl]}, 속에서 받쳐 주는 힘은 ${EL_MEANING[branchEl]}이에요.`,
      `땅속에는 **${iga(`${d.hidden.map((h) => `${STEM_KO[h.stem]}(${h.stem})`).join("·")}**`)} 숨어 있어요. 이것을 **지장간(地藏干)**이라고 하는데, 겉으로 보이지 않지만 한 해 동안 조용히 작용하는 기운이에요.`,
      d.daeyun
        ? `그리고 이 해는 ${d.daeyun.startAge}세부터 이어지는 **${gzKo(d.daeyun.stem, d.daeyun.branch)} 대운** 안에 있어요. 대운이 10년짜리 계절이라면, ${label} 운은 그 계절 속 한 해의 날씨예요.`
        : "아직 첫 대운이 시작되기 전이라, 한 해의 기운이 더 직접적으로 느껴져요.",
    ],
    badges: [`종합 ${d.score}점 · ${scoreWord(d.score)}`],
  };

  /* 2. 찾아온 손님 */
  const p2 = {
    title: `${label}의 손님 · ${d.god}`,
    scene: { kind: "guest" as const, el: stemEl, glyph: TEN_GOD_HANJA[d.god] },
    bubbles: [
      `${me.image} 같은 ${STEM_KO[a.dayStem]}${ELEMENT_INFO[a.dayEl].ko} 일간인 당신에게 ${label} 하늘에서 오는 기운은 **${ieyo(`${d.god}**(${TEN_GOD_HANJA[d.god]})`)}. ${GOD_PLAIN[d.god]}.`,
      `한마디로 ${eun(label)} **${area.theme}**예요.`,
      `예를 들어 이런 일이 생기기 쉬워요.\n① ${area.examples[0]}\n② ${area.examples[1]}\n③ ${area.examples[2]}`,
      d.branchGod !== d.god
        ? `땅에서는 **${d.branchGod}** 기운이 함께 올라와요. 그래서 ${bArea.examples[0]}, ${bArea.examples[1]} 같은 일도 한 해의 배경으로 깔려요.`
        : "하늘과 땅이 같은 손님이라 그 성격이 한 해 내내 아주 진하게 나타나요.",
      `지장간까지 보면 ${d.hidden.map((h) => `${h.god}`).join("·")}의 기운도 조금씩 섞여 있어요.`,
    ],
    badges: [`천간 ${d.god}`, `지지 ${d.branchGod}`],
  };

  /* 3. 내 사주와 만나는 곳 */
  const p3Bubbles: string[] = [];
  p3Bubbles.push(
    `${label} 들어오는 **${iga(`${BRANCH_KO[d.branch]}(${d.branch})**`)} 내 사주 네 기둥과 어떻게 만나는지 볼게요. 사주의 각 자리는 삶의 영역을 뜻해요 — 연지는 ${POSITION.year.area}, 월지는 ${POSITION.month.area}, 일지는 ${POSITION.day.area}, 시지는 ${ieyo(POSITION.hour.area)}.`,
  );
  for (const it of d.interactions) {
    const pos = POSITION[it.pos];
    p3Bubbles.push(`**${pos.name} ${wa(`${BRANCH_KO[it.myBranch]}(${it.myBranch})`)} ${INTERACTION_NAME[it.type]}** — ${pos.area}의 자리예요. ${INTERACTION_EX[it.type][it.pos]}`);
  }
  for (const t of d.stemTies) {
    const pos = POSITION[t.pos];
    p3Bubbles.push(
      `**하늘에서도 ${iga(`${STEM_KO[d.stem]}(${d.stem})`)} 내 ${pos.name.replace("지", "간")} ${wa(`${STEM_KO[t.myStem]}(${t.myStem})`)} 천간합**을 이뤄 ${elName(t.el)} 기운으로 묶여요. ${STEM_TIE_EX[t.pos]}`,
    );
  }
  if (d.interactions.length === 0 && d.stemTies.length === 0) {
    p3Bubbles.push(
      `${label}의 기운은 내 사주 글자와 직접 부딪히거나 묶이지 않아요. 그만큼 바깥에서 오는 큰 변화보다, **내가 노력한 만큼의 결과가 그대로 드러나는 해**예요.`,
    );
  }
  const p3 = {
    title: "내 사주와 만나는 자리",
    scene: {
      kind: "pillars" as const,
      guest: { stem: d.stem, branch: d.branch, el: stemEl },
      mine: a.pillars.map((p) => ({
        key: p.key,
        label: POSITION[p.key].name.replace("지", "주"),
        stem: p.stem,
        branch: p.branch,
        el: p.branchEl,
        mark: d.interactions.find((i) => i.pos === p.key)?.type,
        tie: d.stemTies.some((t) => t.pos === p.key),
      })),
    },
    bubbles: p3Bubbles,
    badges: d.interactions.map((i) => `${POSITION[i.pos].name} ${INTERACTION_NAME[i.type].replace(/\(.*/, "")}`),
  };

  /* 4. 오행 저울 */
  const yongAdded = d.added.includes(a.yongshin);
  const excessAdded = d.added.filter((e) => a.elementCounts[e] >= 3);
  const lackAfter = ELEMENTS.filter((e) => d.elementAfter[e] === 0);
  const p4Bubbles = [
    `내 사주 여덟 글자에 ${label}의 두 글자(${d.stem}${d.branch})를 더하면 오행 저울이 이렇게 바뀌어요: **${d.added.map((e) => elName(e)).join(", ")} +1씩**.`,
    yongAdded
      ? `반가운 소식이에요. 내 사주에 가장 필요한 **${iga(`용신 ${elName(a.yongshin)}**`)} 들어와요. 예를 들어 막혀 있던 일이 풀리거나, 몸과 마음이 한결 가벼워지는 느낌을 받기 쉬워요.`
      : `내 사주에 가장 필요한 **${eun(`용신 ${elName(a.yongshin)}**`)} ${label} 직접 들어오지 않아요. 그래서 ${kaeun.color} 계열의 색, ${kaeun.direction} 방향, 「${eul(`${kaeun.habit}」`)} 일부러 챙기면 균형을 맞추는 데 도움이 돼요.`,
    ...excessAdded.map(
      (e) => `주의할 점도 있어요. 이미 많은 **${iga(`${elName(e)}**`)} 더 들어와 ${d.elementAfter[e]}개가 돼요. 이렇게 되면 ${EL_EXCESS_LIFE[e]}. 몸에서는 **${EL_BODY[e]}** 쪽을 챙겨 주세요.`,
    ),
    ...(lackAfter.length
      ? [`${iga(label)} 지나도 **${lackAfter.map(elName).join(", ")}** 기운은 여전히 비어 있어요. 이 기운이 맡는 일(예: ${lackAfter.map((e) => EL_MEANING[e]).join(", ")})은 의식적으로 채워 주세요.`]
      : []),
  ];
  const p4 = {
    title: "오행 저울의 변화",
    scene: { kind: "balance" as const, before: a.elementCounts, after: d.elementAfter, yong: a.yongshin },
    bubbles: p4Bubbles,
  };

  /* 5~8. 분야별 */
  const areaBadge = (k: keyof YearDetail["areas"]) => `${d.areas[k].score}점 · ${scoreWord(d.areas[k].score)}`;
  const areaWhy = (k: keyof YearDetail["areas"]) => `점수 근거: 종합 ${d.score}점에서 ${fmtPoints(d.areas[k].points)}`;
  const monthInt = d.interactions.find((i) => i.pos === "month");
  const dayInt = d.interactions.find((i) => i.pos === "day");

  const p5 = {
    title: `일·직장 ${d.areas.work.score}점`,
    scene: { kind: "work" as const, group },
    bubbles: [
      area.work,
      d.branchGod !== d.god ? `여기에 땅의 **${d.branchGod}** 기운이 더해져요. ${bArea.work.split(". ")[0]}.` : "",
      monthInt ? `특히 일터를 뜻하는 월지와 **${iga(`${INTERACTION_NAME[monthInt.type]}**`)} 있어요. ${INTERACTION_EX[monthInt.type].month}` : "",
      areaWhy("work"),
    ].filter(Boolean),
    badges: [areaBadge("work")],
  };

  const p6 = {
    title: `재물 ${d.areas.money.score}점`,
    scene: { kind: "money" as const, variant: group === "비겁" ? ("leak" as const) : group === "재성" || group === "식상" ? ("tree" as const) : ("jar" as const), fill: d.areas.money.score / 100 },
    bubbles: [
      area.money,
      d.hidden.some((h) => TEN_GOD_GROUP[h.god] === "재성") && group !== "재성"
        ? `겉으로는 재물의 별이 아니지만, 땅속(지장간)에 **재성**이 숨어 있어요. 예를 들어 생각지 못한 곳에서 작은 수입이 생기거나, 묵혀 둔 물건·투자가 빛을 보는 식이에요.`
        : "",
      areaWhy("money"),
    ].filter(Boolean),
    badges: [areaBadge("money")],
  };

  const spouseGroup = a.input.gender === "male" ? "재성" : "관성";
  const p7 = {
    title: `연애·관계 ${d.areas.love.score}점`,
    scene: { kind: "love" as const, variant: d.dohwaYear ? ("blossom" as const) : dayInt?.type === "hap" ? ("pair" as const) : ("bud" as const) },
    bubbles: [
      area.love,
      group === spouseGroup || TEN_GOD_GROUP[d.branchGod] === spouseGroup
        ? `${eun(label)} 당신에게 **연인의 별(${spouseGroup})**이 들어오는 해예요. 예를 들어 소개팅·모임에서 마음이 가는 사람을 만나거나, 연인이 있다면 관계를 공식화하는 이야기가 나오기 쉬워요.`
        : "",
      d.dohwaYear ? `게다가 ${eun(label)} 당신에게 **도화(桃花)**가 피는 해예요. 외모·분위기에 관심이 늘고, 가만히 있어도 시선이 모여요.` : "",
      dayInt ? `배우자 자리(일지)와 **${iga(`${INTERACTION_NAME[dayInt.type]}**`)} 있어요. ${INTERACTION_EX[dayInt.type].day}` : "",
      `사람 관계 전체로 보면 — ${area.people}`,
      areaWhy("love"),
    ].filter(Boolean),
    badges: [areaBadge("love")],
  };

  const weakEl = excessAdded[0] ?? ELEMENTS.reduce((x, y) => (d.elementAfter[y] < d.elementAfter[x] ? y : x));
  const p8 = {
    title: `건강 ${d.areas.health.score}점`,
    scene: { kind: "path" as const, mood: d.areas.health.score >= 68 ? ("chance" as const) : d.areas.health.score >= 52 ? ("prepare" as const) : ("careful" as const) },
    bubbles: [
      excessAdded.length
        ? `${eun(label)} **${elName(weakEl)}** 기운이 넘치는 해라, 몸에서는 **${EL_BODY[weakEl]}** 쪽이 먼저 신호를 보내기 쉬워요.`
        : `${label} 가장 약해지는 기운은 **${ieyo(`${elName(weakEl)}**`)}. 몸에서는 **${EL_BODY[weakEl]}** 쪽을 챙겨 주세요.`,
      `예를 들어 ${EL_HEALTH_TIP[weakEl]}.`,
      d.god === "편관" || d.god === "겁재" ? "이 해의 손님이 몸을 몰아붙이는 기운이라, 과로와 무리한 운동을 특히 조심하세요." : "",
      dayInt?.type === "clash" ? "일지(몸의 자리)에 충이 있어 컨디션이 들쭉날쭉할 수 있어요. 정기 검진을 미루지 마세요." : "",
      areaWhy("health"),
      "※ 사주로 보는 건강은 생활 습관을 돌아보는 참고용이에요. 몸에 이상이 느껴지면 꼭 병원에 가세요.",
    ].filter(Boolean),
    badges: [areaBadge("health")],
  };

  /* 9~10. 월별 점수 */
  const monthScene = (from: number) => ({
    kind: "months" as const,
    items: d.months.slice(from, from + 6).map((m) => ({ month: m.month, score: m.score, kind: m.kind })),
    best: Math.max(...d.months.map((m) => m.score)),
  });
  const half = (from: number) => d.months.slice(from, from + 6);
  const p9 = {
    title: `월별 점수 · 1~6월`,
    scene: monthScene(0),
    bubbles: [
      `매달의 기운(월운)을 내 사주에 대어 점수를 매겼어요. 계산 방법은 이래요: **기본 60점**에서 그달의 천간·지지가 용신(+12/+10)·희신(+7/+6)이면 더하고, 기신(−9/−8)·이미 많은 오행(−6)이면 빼고, 내 일지와 합(+8)·삼합(+5)·충(−12)·원진(−6), 일간과 천간합(+5)을 반영해요. 마지막으로 한 해 흐름을 30% 섞어요.`,
      ...half(0).map((m) => monthLine(m, a)),
    ],
  };
  const p10 = {
    title: `월별 점수 · 7~12월`,
    scene: monthScene(6),
    bubbles: [...half(6).map((m) => monthLine(m, a)), "※ 사주의 달은 양력 1일이 아니라 절기로 바뀌어요. 여기서 「○월」은 그달 초 절기(4~8일 무렵)부터 다음 달 초까지예요."],
  };

  /* 11. 사용 설명서 */
  const best = pickMonths(d.months, () => true, 3);
  const career = pickMonths(d.months, (m) => ["관성", "인성"].includes(TEN_GOD_GROUP[m.god]) || m.god === "정재");
  const wealth = pickMonths(d.months, (m) => ["재성", "식상"].includes(TEN_GOD_GROUP[m.god]));
  const dohwa = dohwaOf(a.dayBranch);
  const loveM = pickMonths(d.months, (m) => m.score >= 50 && (m.hapDay || m.branch === dohwa || TEN_GOD_GROUP[m.god] === spouseGroup));
  const rest = pickMonths(d.months, () => true, 2, true);
  const spend = pickMonths(d.months, (m) => m.god === "겁재" || m.clashDay, 2, true);
  const p11 = {
    title: `${d.year}년 사용 설명서`,
    scene: { kind: "lantern" as const, el: a.yongshin },
    bubbles: [
      `🌟 **가장 기운이 좋은 달** — ${monthList(best)}. 미뤄 둔 큰 계획은 이때 시작해 보세요.`,
      `💼 **면접·승진·계약** — ${monthList(career)}. 직장·명예·문서의 기운이 들어오는 달이에요.`,
      `💰 **돈 벌기·부업·투자 공부** — ${monthList(wealth)}. 재능과 재물의 기운이 움직이는 달이에요.`,
      `🌸 **만남·고백·관계 회복** — ${monthList(loveM)}. 일지와 합, 도화, 연인의 별이 드는 달을 골랐어요.`,
      `🧾 **큰 지출·보증은 피할 달** — ${monthList(spend)}.`,
      `🛌 **쉬어 가며 몸을 챙길 달** — ${monthList(rest)}. 이때는 새 일을 벌이기보다 정리하고 회복하세요.`,
      `그리고 한 해 내내 **${elName(a.yongshin)}** 기운을 곁에 두세요 — ${kaeun.color} 계열의 색, ${kaeun.direction} 방향, 숫자 ${kaeun.number}, 그리고 「${kaeun.habit}」.`,
    ],
  };

  return {
    id: which === "this" ? "year" : "nextYear",
    title: which === "this" ? "올해 운" : "내년 운",
    icon: which === "this" ? "🌅" : "🎍",
    tagline: `${d.year}년 ${gzKo(d.stem, d.branch)}년 · ${d.score}점`,
    pages: [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11],
  };
}
