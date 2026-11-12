/**
 * 재물·연애·직업·부부·자녀 이야기를 깊게 만드는 사주 풀이 재료
 * (별의 위치, 정·편 구분, 지장간, 대운, 신살)
 */
import {
  BRANCH_KO,
  BRANCH_MAIN_STEM,
  STEM_EL,
  STEM_KO,
  TEN_GOD_GROUP,
  tenGod,
  type Element,
  type TenGod,
  type TenGodGroup,
} from "../saju/constants";
import type { Analysis, Daeyun, FlowKind, PillarKey, Shinsal } from "../saju/engine";
import { HIDDEN_STEMS, type Interaction, type StemTie } from "../saju/period";
import { POSITION } from "./yearly";
import type { Scene } from "./types";

/* ---------- 별의 위치 ---------- */
export const POS_TIME: Record<PillarKey, { name: string; when: string; meet: string }> = {
  year: { name: "연주", when: "초년과 집안 배경", meet: "어린 시절 인연이나 집안·어른의 소개" },
  month: { name: "월주", when: "청년기와 사회·직장", meet: "학교·직장처럼 사회생활을 하는 곳" },
  day: { name: "일주", when: "나와 가장 가까운 자리", meet: "일상에서 자연스럽게 가까워진 사이" },
  hour: { name: "시주", when: "말년과 자녀·미래", meet: "늦게 찾아오는 인연이나 취미·모임" },
};

export interface StarInfo {
  total: number;
  jeong: number;
  pyeon: number;
  /** 겉으로 드러난 자리 */
  spots: { pos: PillarKey; where: "천간" | "지지"; god: TenGod }[];
  /** 지장간에만 숨어 있는 자리 */
  hidden: { pos: PillarKey; branch: string; stem: string; god: TenGod }[];
}

const JEONG: TenGod[] = ["겁재", "상관", "정재", "정관", "정인"];

export function starInfo(a: Analysis, group: TenGodGroup): StarInfo {
  const spots: StarInfo["spots"] = [];
  const hidden: StarInfo["hidden"] = [];
  for (const p of a.pillars) {
    if (p.stemGod && TEN_GOD_GROUP[p.stemGod] === group) spots.push({ pos: p.key, where: "천간", god: p.stemGod });
    if (TEN_GOD_GROUP[p.branchGod] === group) spots.push({ pos: p.key, where: "지지", god: p.branchGod });
    for (const s of HIDDEN_STEMS[p.branch]) {
      if (s === BRANCH_MAIN_STEM[p.branch]) continue;
      const g = tenGod(a.dayStem, s);
      if (TEN_GOD_GROUP[g] === group) hidden.push({ pos: p.key, branch: p.branch, stem: s, god: g });
    }
  }
  return {
    total: spots.length,
    jeong: spots.filter((s) => JEONG.includes(s.god)).length,
    pyeon: spots.filter((s) => !JEONG.includes(s.god)).length,
    spots,
    hidden,
  };
}

export const spotText = (s: StarInfo) =>
  s.spots.map((x) => `${POS_TIME[x.pos].name} ${x.where}의 ${x.god}`).join(", ");

export const hiddenText = (s: StarInfo) =>
  s.hidden.map((x) => `${POS_TIME[x.pos].name} ${BRANCH_KO[x.branch]}(${x.branch}) 속의 ${STEM_KO[x.stem]}(${x.god})`).join(", ");

/* ---------- 정·편 풀이 ---------- */
export const MONEY_KIND = {
  jeong: "**정재(正財)**는 땀 흘려 번 정직한 돈이에요. 예를 들어 월급, 꾸준한 매출, 적금처럼 예측할 수 있는 수입이에요. 정재가 있는 사람은 가계부를 쓰고 계획대로 모으는 데 강해요.",
  pyeon: "**편재(偏財)**는 크게 움직이는 돈이에요. 예를 들어 사업 매출, 투자 수익, 성과급처럼 들쭉날쭉하지만 한 번에 크게 들어오는 수입이에요. 편재가 있는 사람은 돈의 흐름을 읽는 감각과 배짱이 좋아요.",
  both: "정재와 편재가 함께 있어요. 고정 수입으로 바닥을 다지고, 그 위에서 투자나 부업으로 크게 굴리는 **두 개의 주머니**를 쓸 수 있는 구조예요.",
};

export const LOVE_KIND: Record<"male" | "female", { jeong: string; pyeon: string; both: string }> = {
  male: {
    jeong: "**정재(正財)**는 한 사람과 차분히 가정을 꾸리는 인연을 뜻해요. 예를 들어 오래 만난 연인과 자연스럽게 결혼으로 이어지는 식이에요.",
    pyeon: "**편재(偏財)**는 활발하고 자유로운 인연을 뜻해요. 예를 들어 모임·여행·일터에서 여러 사람과 쉽게 가까워지는 식이에요. 인기가 많은 만큼 한 사람에게 마음을 모으는 노력이 필요해요.",
    both: "정재와 편재가 함께 있어 인연의 폭이 넓어요. 설레는 인연과 편안한 인연 사이에서 고민하기 쉬운데, **오래 함께할 사람은 편안함 쪽**에서 찾는 게 좋아요.",
  },
  female: {
    jeong: "**정관(正官)**은 반듯하고 책임감 있는 인연을 뜻해요. 예를 들어 주변의 소개나 직장에서 만나 안정적으로 이어지는 식이에요.",
    pyeon: "**편관(偏官)**은 강렬하고 카리스마 있는 인연을 뜻해요. 예를 들어 첫눈에 강하게 끌리지만 다툼도 뜨거운 연애예요. 서로의 경계를 지켜 주는 사람인지 꼭 살펴보세요.",
    both: "정관과 편관이 함께 있어요(관살혼잡). 인연의 기회가 많지만 마음이 갈리기 쉬워요. **나를 존중해 주는 사람인지**를 기준으로 고르면 흔들리지 않아요.",
  },
};

/* ---------- 월지(사회적 무대) ---------- */
export const MONTH_GOD_ROLE: Record<TenGod, string> = {
  비견: "월지에 **비견**이 있어요. 사회에서 당신의 무기는 독립심이에요. 예를 들어 지시를 기다리기보다 스스로 일을 만들고, 내 구역을 맡았을 때 가장 큰 성과를 내요.",
  겁재: "월지에 **겁재**가 있어요. 사회에서 당신의 무기는 승부욕이에요. 예를 들어 실적 경쟁, 입찰, 영업처럼 순위가 갈리는 판에서 힘이 솟아요.",
  식신: "월지에 **식신**이 있어요. 사회에서 당신의 무기는 꾸준한 기술이에요. 예를 들어 한 가지를 오래 갈고닦아 장인 소리를 듣는 길이에요.",
  상관: "월지에 **상관**이 있어요. 사회에서 당신의 무기는 말과 아이디어예요. 예를 들어 기획안, 발표, 콘텐츠로 사람의 마음을 움직이는 일이에요.",
  편재: "월지에 **편재**가 있어요. 사회에서 당신의 무기는 사업 수완이에요. 예를 들어 사람과 돈이 오가는 곳에서 기회를 잡아내는 일이에요.",
  정재: "월지에 **정재**가 있어요. 사회에서 당신의 무기는 성실함과 신용이에요. 예를 들어 회계·관리·운영처럼 정확함이 곧 실력인 일이에요.",
  편관: "월지에 **편관**이 있어요. 사회에서 당신의 무기는 위기 돌파력이에요. 예를 들어 압박이 큰 현장, 책임이 무거운 자리에서 진가가 드러나요.",
  정관: "월지에 **정관**이 있어요. 사회에서 당신의 무기는 원칙과 신뢰예요. 예를 들어 조직·공공 영역에서 차근차근 올라가는 길이에요.",
  편인: "월지에 **편인**이 있어요. 사회에서 당신의 무기는 남다른 통찰이에요. 예를 들어 연구·기술·상담처럼 깊이 파고드는 전문 분야예요.",
  정인: "월지에 **정인**이 있어요. 사회에서 당신의 무기는 배움과 자격이에요. 예를 들어 학위·자격증을 바탕으로 가르치고 돕는 일이에요.",
};

export const EL_INDUSTRY: Record<Element, string> = {
  wood: "교육·출판·디자인·가구·원예·의류",
  fire: "방송·콘텐츠·IT·전기·미용·요식",
  earth: "부동산·건설·중개·농업·컨설팅",
  metal: "금융·기계·법률·의료기기·자동차",
  water: "유통·무역·여행·수산·연구·심리",
};

/* ---------- 지장간으로 보는 사람 ---------- */
export const GROUP_PERSON: Record<TenGodGroup, string> = {
  비겁: "친구처럼 편하고 자기 세계가 분명한 모습",
  식상: "표현이 많고 다정하게 챙기는 모습",
  재성: "현실적이고 살림과 계산에 밝은 모습",
  관성: "책임감 있고 반듯한 모습",
  인성: "포근하게 품어 주고 배움이 깊은 모습",
};

/* ---------- 신살과 연애 ---------- */
export const SHINSAL_LOVE: Record<Shinsal["id"], string> = {
  dohwa: "**도화(桃花)** — 사람을 끄는 매력의 별이에요. 예를 들어 처음 간 모임에서도 금방 호감을 얻어요. 인기가 관계의 오해로 번지지 않게 선을 분명히 하면 복이 돼요.",
  yeokma: "**역마(驛馬)** — 움직임의 별이에요. 예를 들어 여행지·출장·다른 지역에서 인연을 만나거나, 장거리 연애를 하게 되기 쉬워요.",
  hwagae: "**화개(華蓋)** — 혼자만의 세계가 깊은 별이에요. 예를 들어 연애 중에도 혼자 있는 시간이 꼭 필요해요. 취미와 감성을 나눌 수 있는 사람과 잘 맞아요.",
  cheoneul: "**천을귀인(天乙貴人)** — 어려울 때 도와주는 귀인의 별이에요. 예를 들어 소개해 주는 사람 덕에 좋은 인연을 만나기 쉬워요.",
  munchang: "**문창귀인(文昌貴人)** — 글과 말의 별이에요. 예를 들어 대화가 잘 통하는 사람, 편지와 메시지로 마음을 나누는 사랑에 강해요.",
  baekho: "**백호(白虎)** — 기운이 센 별이에요. 예를 들어 좋고 싫음이 분명해 연애도 화끈해요. 화가 날 때 한 박자 쉬면 관계가 오래 가요.",
  goegang: "**괴강(魁罡)** — 카리스마의 별이에요. 예를 들어 관계를 이끄는 쪽이 되기 쉬워요. 상대의 의견을 먼저 물어 주면 훨씬 부드러워져요.",
};

/* ---------- 대운 ---------- */
export interface DaeyunView {
  d: Daeyun;
  branchGod: TenGod;
  kind: FlowKind;
  now: boolean;
}

export function daeyunView(a: Analysis, good: TenGodGroup[], bad: TenGodGroup[], year: number): DaeyunView[] {
  return a.daeyun.slice(0, 7).map((d, i, arr) => {
    const branchGod = tenGod(a.dayStem, BRANCH_MAIN_STEM[d.branch]);
    const groups = [TEN_GOD_GROUP[d.god], TEN_GOD_GROUP[branchGod]];
    const kind: FlowKind = groups.some((g) => good.includes(g)) ? "chance" : groups.some((g) => bad.includes(g)) ? "careful" : "prepare";
    const next = arr[i + 1];
    return { d, branchGod, kind, now: d.startYear <= year && (!next || next.startYear > year) };
  });
}

export const daeyunScene = (views: DaeyunView[]): Scene => ({
  kind: "seasons",
  items: views.map((v) => ({ label: `${v.d.startAge}세`, sub: STEM_KO[v.d.stem] + BRANCH_KO[v.d.branch], kind: v.kind, now: v.now })),
});

export const daeyunLines = (views: DaeyunView[], word: Record<FlowKind, string>) =>
  views
    .map((v) => `${v.now ? "📍 " : ""}${v.d.startAge}~${v.d.startAge + 9}세 ${STEM_KO[v.d.stem]}${BRANCH_KO[v.d.branch]} 대운 (${v.d.god}·${v.branchGod}) — ${word[v.kind]}`)
    .join("\n");

/* ---------- 네 기둥 그림 ---------- */
export function pillarsScene(a: Analysis, stem: string, branch: string, interactions: Interaction[], stemTies: StemTie[]): Scene {
  return {
    kind: "pillars",
    guest: { stem, branch, el: STEM_EL[stem] },
    mine: a.pillars.map((p) => ({
      key: p.key,
      label: POSITION[p.key].name.replace("지", "주"),
      stem: p.stem,
      branch: p.branch,
      el: p.branchEl,
      mark: interactions.find((i) => i.pos === p.key)?.type,
      tie: stemTies.some((t) => t.pos === p.key),
    })),
  };
}

/* ---------- 별의 자리별 풀이 ---------- */
export const MONEY_POS: Record<PillarKey, string> = {
  year: "집안의 도움이나 이른 나이의 경제 경험과 인연이 있어요. 예를 들어 부모님의 지원, 어릴 때부터 익힌 돈 감각이에요.",
  month: "직장과 사회 활동에서 돈이 나와요. 예를 들어 월급·사업 매출처럼 일터가 곧 재물 창고예요. 재성이 가장 힘 있게 쓰이는 자리예요.",
  day: "배우자 자리에 재물이 앉아 있어요. 예를 들어 배우자가 살림을 잘 꾸리거나, 결혼 뒤에 재산이 모이기 쉬워요.",
  hour: "말년과 자녀의 자리에 재물이 있어요. 예를 들어 나이가 들수록 형편이 나아지거나, 노후 준비·자녀 덕을 보기 쉬워요.",
};

export const MARRIAGE_POS: Record<PillarKey, string> = {
  year: "배우자의 별이 연주에 있으면 인연이 일찍 닿기 쉬워요. 예를 들어 어릴 때 알던 사이, 집안끼리 아는 사이, 나이 차이가 있는 인연이에요.",
  month: "배우자의 별이 월주에 있으면 사회생활 속에서 만나요. 예를 들어 학교 선후배, 직장 동료, 일로 알게 된 사람이에요. 배우자가 사회적으로 활동적인 편이에요.",
  day: "배우자의 별이 배우자 자리에 그대로 앉아 있어요. 제자리를 찾은 별이라 **부부 인연이 또렷하고 깊다**고 봐요.",
  hour: "배우자의 별이 시주에 있으면 인연이 늦게 익어요. 예를 들어 늦은 결혼, 나이가 어린 배우자, 살수록 정이 깊어지는 부부예요.",
};

export const CHILD_POS: Record<PillarKey, string> = {
  year: "자녀의 별이 연주에 있으면 자녀 인연이 비교적 이르거나, 집안 어른이 아이를 함께 돌봐 주기 쉬워요.",
  month: "자녀의 별이 월주에 있으면 일하면서 아이를 키우는 모습이에요. 예를 들어 일과 육아를 함께 해내는 맞벌이 부모예요.",
  day: "자녀의 별이 일주에 있으면 아이와 정서적으로 아주 가까워요. 예를 들어 친구처럼 붙어 다니는 부모와 자녀예요.",
  hour: "자녀의 별이 자녀 자리(시주)에 제대로 앉아 있어요. 자녀 복이 또렷하고, 나이 들어 자녀와 가깝게 지내기 쉬워요.",
};

export const CHILD_KIND: Record<"male" | "female", { jeong: string; pyeon: string; both: string }> = {
  female: {
    jeong: "**상관(傷官)**이 자녀의 별로 있어요. 재주 많고 표현이 톡톡 튀는 아이와 인연이 깊어요. 예를 들어 말이 빠르고 끼가 넘치는 아이예요.",
    pyeon: "**식신(食神)**이 자녀의 별로 있어요. 순하고 먹성 좋고 정이 많은 아이와 인연이 깊어요. 예를 들어 무던하게 잘 자라는 아이예요.",
    both: "식신과 상관이 함께 있어요. 성격이 서로 다른 아이들과 인연이 있어요. 예를 들어 한 아이는 무던하고 한 아이는 톡톡 튀는 식이라, 아이마다 다르게 대해 주면 좋아요.",
  },
  male: {
    jeong: "**정관(正官)**이 자녀의 별로 있어요. 반듯하고 책임감 있는 아이와 인연이 깊어요. 예를 들어 스스로 숙제를 챙기는 아이예요.",
    pyeon: "**편관(偏官)**이 자녀의 별로 있어요. 기운이 세고 승부욕 있는 아이와 인연이 깊어요. 예를 들어 운동·경쟁에서 지기 싫어하는 아이예요.",
    both: "정관과 편관이 함께 있어요. 성격이 서로 다른 아이들과 인연이 있어요. 예를 들어 한 아이는 차분하고 한 아이는 활동적인 식이에요.",
  },
};
