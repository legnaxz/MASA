/**
 * 사는 지역 추천 (대한민국) — 용신 오행의 방위와 지형을 지도에 대어 본다.
 * 그리고 직업운을 보강하는 풀이(일하는 형태, 움직이기 좋은 해, 피할 환경).
 */
import { BRANCH_KO, STEM_KO, TEN_GOD_GROUP, type Element, type TenGod, type TenGodGroup } from "../saju/constants";
import type { Analysis } from "../saju/engine";
import { yearDetail } from "../saju/period";
import { KAEUN_DECK } from "../deck";
import { YONG_ESSAY } from "./essays";
import { elName, eun, ieyo } from "./text";
import type { Story, StoryPage } from "./types";

interface Region {
  dir: string;
  terrain: string;
  regions: string;
  cities: string;
  why: string;
  home: string;
}

export const REGION: Record<Element, Region> = {
  wood: {
    dir: "동쪽",
    terrain: "숲과 산이 가깝고 나무가 많은 곳",
    regions: "강원 영동(강릉·속초·동해·삼척), 경북 동해안(포항·경주·울진), 울산",
    cities: "서울에서는 동쪽인 강동·송파·광진·중랑, 경기에서는 남양주·하남·구리·양평",
    why: "나무는 해가 뜨는 동쪽의 기운이에요. 태백산맥 동쪽과 동해안, 그리고 숲이 우거진 곳에 이 기운이 짙어요.",
    home: "집 근처에 공원이나 산책로가 있는 곳을 고르세요. 동향이나 동남향 집, 원목 가구와 화분이 잘 맞아요. 높은 층보다 나무가 보이는 층이 좋아요.",
  },
  fire: {
    dir: "남쪽",
    terrain: "볕이 잘 들고 따뜻하며 사람이 붐비는 곳",
    regions: "부산, 경남(창원·김해·진주·통영), 전남 남해안(여수·순천·광양), 제주",
    cities: "서울에서는 남쪽인 강남·서초·관악·동작, 경기에서는 성남·용인·수원·화성",
    why: "불은 한낮의 해가 머무는 남쪽의 기운이에요. 기온이 높고 볕이 긴 남해안과 제주, 그리고 불빛이 꺼지지 않는 번화한 곳에 이 기운이 짙어요.",
    home: "남향 집, 볕이 오래 드는 거실이 가장 좋아요. 조명을 밝게 하고, 상권이 가깝고 사람의 온기가 있는 동네를 고르세요. 반지하나 북향 집은 피하세요.",
  },
  earth: {
    dir: "중앙",
    terrain: "너른 들과 내륙 분지, 땅이 평평하고 안정된 곳",
    regions: "대전·세종, 충북(청주·충주), 충남 내륙(천안·아산·공주), 대구, 경북 내륙(구미·안동)",
    cities: "서울에서는 가운데인 종로·중구·용산·성동, 수도권에서는 평지가 넓은 신도시",
    why: "흙은 사방의 가운데에서 중심을 잡는 기운이에요. 바다에서 떨어진 내륙의 평야와 분지, 나라의 한가운데에 이 기운이 짙어요.",
    home: "지대가 평평하고 오래 살 수 있는 내 집이 가장 좋아요. 이사를 자주 다니는 것이 가장 해로워요. 저층이나 마당·텃밭이 있는 집, 베이지와 갈색 인테리어가 맞아요.",
  },
  metal: {
    dir: "서쪽",
    terrain: "정돈된 계획도시, 바위와 산이 단단한 곳",
    regions: "인천, 경기 서부(부천·김포·시흥·안산), 충남 서해안(서산·당진·태안·보령), 전북 서부(군산·익산)",
    cities: "서울에서는 서쪽인 강서·양천·마포·영등포·구로, 수도권에서는 송도·청라 같은 계획 신도시",
    why: "쇠는 해가 지는 서쪽의 기운이에요. 서해안과, 공업·금융·행정처럼 질서가 뚜렷한 도시에 이 기운이 짙어요.",
    home: "길과 건물이 반듯하게 정리된 동네가 좋아요. 서향이나 서북향, 깔끔한 신축, 흰색과 금속 소재의 인테리어가 맞아요. 물건이 쌓인 집은 운을 탁하게 해요.",
  },
  water: {
    dir: "북쪽",
    terrain: "강과 호수, 바다가 가까운 곳",
    regions: "서울 강북과 경기 북부(고양·파주·의정부·양주), 강원 영서(춘천·원주·철원), 그리고 강과 호수를 낀 도시",
    cities: "서울에서는 북쪽인 은평·서대문·성북·노원·도봉, 또는 한강이 보이는 곳 어디든",
    why: "물은 차고 고요한 북쪽의 기운이에요. 북쪽 지방과 함께, 방위와 상관없이 큰 물을 낀 곳에 이 기운이 짙어요. 춘천처럼 호수를 품은 도시가 대표적이에요.",
    home: "창밖으로 물이 보이거나 걸어서 물가에 닿는 곳이 가장 좋아요. 조용하고 밤에 어두워지는 동네, 북향 서재, 검정과 남색 소품이 맞아요. 시끄러운 번화가 한복판은 피하세요.",
  },
};

/** 두 사람의 용신이 다를 때 함께 맞는 곳 */
const pairKey = (a: Element, b: Element) => [a, b].sort().join("+");
const PAIR: Record<string, string> = {
  "fire+wood": "남동쪽의 따뜻한 숲 — 경남 동부와 울산, 부산 기장, 경주처럼 볕이 좋고 산이 가까운 곳",
  "earth+wood": "내륙의 숲 — 충북(충주·제천·괴산), 경북 내륙(안동·영주)처럼 너른 땅에 산림이 많은 곳",
  "metal+wood": "동서를 잇는 수도권의 숲세권 — 과천, 의왕, 남양주처럼 계획도시이면서 산을 낀 곳",
  "water+wood": "물과 숲이 함께 있는 곳 — 춘천, 양평, 가평, 강릉처럼 강·호수·바다와 산이 만나는 곳",
  "earth+fire": "남쪽 내륙 — 대구, 진주, 광주, 전주처럼 볕이 좋고 너른 분지와 들을 가진 곳",
  "fire+metal": "남서쪽의 정돈된 도시 — 창원, 광양, 목포, 그리고 수도권 남서부(광명·안양·평촌)",
  "fire+water": "남쪽 바닷가 — 부산, 여수, 통영, 거제, 제주처럼 볕과 물이 함께 있는 곳",
  "earth+metal": "중서부 내륙 — 천안·아산, 세종, 청주, 익산처럼 평지에 반듯하게 계획된 도시",
  "earth+water": "강을 낀 내륙 — 세종(금강), 충주(남한강), 안동(낙동강), 대전처럼 들 가운데 큰 강이 흐르는 곳",
  "metal+water": "북서쪽 물가 — 인천, 김포, 고양, 파주, 그리고 서해와 한강 하구를 낀 곳",
};

const WORK_FORM: Record<TenGodGroup, { best: string; text: string }> = {
  비겁: { best: "자영업·프리랜서", text: "비겁이 강한 사주는 누구 밑에서 일하기보다 내 이름을 걸 때 힘이 나요. 직장에 있더라도 독립된 권한과 구역이 주어지는 자리(지점장, 1인 팀, 전문직)가 맞아요. 조직의 눈치를 오래 보면 병이 나는 타입이에요." },
  식상: { best: "프리랜서·전문 기술직", text: "식상이 강한 사주는 손과 입, 머리로 만든 결과물로 평가받을 때 가장 빛나요. 출퇴근 시간보다 결과로 말하는 환경, 자율이 큰 조직이나 프리랜서가 맞아요. 규칙이 빡빡한 조직에서는 재능이 답답해해요." },
  재성: { best: "사업·영업·성과급 직장", text: "재성이 강한 사주는 숫자로 결과가 보이는 일에 맞아요. 고정급만 받는 자리보다 성과가 수입으로 이어지는 영업, 사업, 인센티브가 큰 직장이 맞아요. 돈의 흐름을 직접 만지는 자리에서 실력이 커져요." },
  관성: { best: "직장인(조직)", text: "관성이 강한 사주는 체계와 직급이 분명한 조직에서 가장 멀리 가요. 공공기관, 대기업, 전문 자격을 가진 조직인이 맞아요. 혼자 하는 사업은 울타리가 없어 불안이 커지기 쉬워요." },
  인성: { best: "전문직·교육·연구 조직", text: "인성이 강한 사주는 지식과 자격이 울타리가 되어 주는 일에 맞아요. 학교, 연구소, 병원, 자격 기반 전문직이 맞아요. 장사나 영업처럼 매일 숫자에 쫓기는 일은 마음이 쉽게 닳아요." },
};

const AVOID_ENV: Record<TenGod, string> = {
  비견: "하나부터 열까지 보고하고 승인받아야 하는 곳, 성과를 팀 전체로만 뭉뚱그려 평가하는 곳",
  겁재: "경쟁이 전혀 없어 긴장이 풀리는 곳, 반대로 돈을 내 손으로 만지며 유혹이 큰 자리",
  식신: "분 단위로 쫓기는 곳, 결과물보다 근무 태도만 따지는 곳",
  상관: "말대꾸를 용납하지 않는 수직적인 조직, 정해진 대로만 해야 하는 반복 업무",
  편재: "책상에 종일 앉아 한 가지 서류만 보는 일, 움직임과 사람 만남이 없는 곳",
  정재: "수입이 들쑥날쑥한 일, 규칙 없이 그때그때 바뀌는 조직",
  편관: "긴장이 전혀 없어 느슨한 곳, 반대로 쉬는 날 없이 몸을 갈아 넣어야 하는 곳",
  정관: "규정과 체계가 없는 신생 조직, 편법을 요구하는 곳",
  편인: "사람을 끊임없이 상대해야 하는 접객 업무, 깊이 생각할 틈이 없는 곳",
  정인: "배울 것이 없는 곳, 매일 실적으로 압박받는 영업 현장",
};

const gz = (s: string, b: string) => STEM_KO[s] + BRANCH_KO[b];

/* ---------------- 살 곳 ---------------- */
export function buildPlaceStory(a: Analysis, now: Date): Story {
  const r = REGION[a.yongshin];
  const h = REGION[a.heeshin];
  const g = REGION[a.gishin];
  const yeokma = a.shinsal.find((s) => s.id === "yeokma");
  const moveYears = a.flows.filter((f) => f.clashDay).map((f) => f.year);
  const d1 = yearDetail(a, now.getFullYear() + 1);
  const moveMonths = [...d1.months]
    .filter((m) => !m.clashDay && ["인성", "재성"].includes(TEN_GOD_GROUP[m.god]))
    .sort((x, y) => y.score - x.score)
    .slice(0, 3);
  const pages: StoryPage[] = [
    {
      title: "용신으로 보는 나의 방위",
      scene: { kind: "compass", el: a.yongshin, direction: r.dir },
      bubbles: [
        "명리학에서는 오행마다 방위가 있다고 봐요. 나무는 동쪽, 불은 남쪽, 흙은 중앙, 쇠는 서쪽, 물은 북쪽이에요. 해가 동쪽에서 떠서 남쪽 하늘을 지나 서쪽으로 지고, 북쪽은 볕이 들지 않아 차고 고요하다는 자연의 이치에서 나온 것이에요.",
        `그래서 내 사주에 필요한 기운인 **용신**의 방위에서 살거나 일하면 모자란 기운이 채워진다고 봐요. 당신의 용신은 **${elName(a.yongshin)}**, 방위는 **${ieyo(`${r.dir}**`)}. 지형으로는 **${r.terrain}**이 잘 맞아요.`,
        r.why,
        ...YONG_ESSAY[a.yongshin].slice(0, 1),
      ],
      badges: [`용신 ${elName(a.yongshin)}`, r.dir],
    },
    {
      title: "대한민국에서 나와 맞는 곳",
      scene: { kind: "path", mood: "chance" },
      bubbles: [
        `🌟 **가장 잘 맞는 곳 (용신 ${elName(a.yongshin)})** — ${r.regions}`,
        `수도권에 산다면 — ${r.cities}`,
        `👍 **다음으로 좋은 곳 (희신 ${elName(a.heeshin)})** — ${h.regions}. 희신은 용신을 낳아 주는 기운이라, 이곳에서도 편안함을 느껴요.`,
        `⚠ **덜 맞는 곳 (기신 ${elName(a.gishin)})** — ${g.regions}. 기신은 용신을 누르는 기운이에요. 못 살 곳이라는 뜻은 아니고, 같은 노력에도 조금 더 지치기 쉬운 곳이에요. 이미 살고 있다면 집 안에서 용신의 기운을 채우면 돼요.`,
        "지역의 이름보다 중요한 것은 **지형**이에요. 같은 도시 안에서도 용신의 지형을 갖춘 동네를 고르면 효과가 있어요.",
      ],
    },
    {
      title: "지금 사는 곳에서 고르는 법",
      scene: { kind: "table" },
      bubbles: [
        `멀리 이사하지 않아도 돼요. 지금 사는 곳을 기준으로 **${r.dir}**${r.dir === "중앙" ? "에 가까운, 도시의 한가운데 쪽으로" : " 방향으로"} 옮기는 것만으로도 방위를 쓰는 셈이에요. 직장이나 자주 가는 곳을 그 방향으로 두는 것도 같은 효과예요.`,
        `**집 고르기** — ${r.home}`,
        `**집 안에서** — 침대 머리와 책상을 ${r.dir === "중앙" ? "집의 중심 쪽" : r.dir}으로 두고, ${KAEUN_DECK[a.yongshin].color} 계열의 침구와 소품을 쓰세요.`,
        a.strength.strong
          ? "당신은 **신강**한 사주예요. 기운이 넘쳐서 사람과 일이 많은 도심에서도 지치지 않아요. 오히려 너무 한적한 곳에서는 기운을 쓸 데가 없어 답답해져요. 활동할 거리가 많은 곳을 고르세요."
          : "당신은 **신약**한 사주예요. 자극이 많은 번화가 한복판에서는 기운이 빨리 닳아요. 직장은 도심이어도 집만큼은 조용하고 쉴 수 있는 동네에 두세요. 가족이나 가까운 사람 곁에 사는 것도 큰 힘이 돼요.",
      ],
    },
    {
      title: "이사와 이동의 운",
      scene: { kind: "stones", items: a.flows.slice(0, 6).map((f) => ({ label: String(f.year), sub: gz(f.stem, f.branch), kind: f.kind, mark: f.clashDay })) },
      bubbles: [
        yeokma
          ? `당신의 사주에는 **역마(驛馬)**가 있어요(${yeokma.basis}). 한곳에 오래 머물기보다 옮겨 다니며 운이 트이는 사주예요. 이사, 출장, 해외와 인연이 많고, 고향을 떠나 자리를 잡는 경우가 많아요.`
          : "당신의 사주에는 역마가 없어요. 자주 옮기기보다 한곳에 뿌리를 내릴 때 운이 쌓이는 사주예요. 이사는 꼭 필요할 때만 하세요.",
        moveYears.length
          ? `앞으로 10년 중 **${moveYears.map((y) => `${y}년`).join(", ")}**에는 일지(내 자리)에 충이 들어요. 충은 자리가 움직인다는 뜻이라, 이사나 주거 변화가 생기기 쉬운 해예요. 계획하지 않았더라도 옮길 일이 생길 수 있어요.`
          : "앞으로 10년 동안 일지에 충이 드는 해가 없어요. 주거가 크게 흔들리지 않는 안정된 흐름이에요.",
        moveMonths.length
          ? `${d1.year}년에 이사나 계약을 한다면 **${moveMonths.map((m) => `${m.month}월(${m.score}점)`).join(", ")}**이 좋아요. 문서의 기운(인성)이나 재물의 기운(재성)이 들고 충이 없는 달이에요.`
          : `${d1.year}년에는 계약에 뚜렷이 좋은 달이 적어요. 급하지 않다면 한 해 미루는 것도 방법이에요.`,
      ],
    },
    {
      title: "방위를 볼 때 알아둘 것",
      scene: { kind: "lantern", el: a.yongshin },
      bubbles: [
        "방위와 지역의 궁합은 명리학에서도 보조적으로 쓰는 방법이에요. 사주 원국과 대운·세운이 운의 큰 줄기이고, 방위는 그 위에 얹는 작은 도움이에요. 방위가 맞는다고 나쁜 운이 좋아지지는 않아요.",
        "그래서 살 곳을 정할 때는 직장, 가족, 형편 같은 현실의 조건이 먼저예요. 조건이 비슷한 두 곳 사이에서 고민될 때, 그때 용신의 방위와 지형을 기준으로 삼으세요.",
        "이미 맞지 않는 방위에 살고 있다면 옮기려 애쓰기보다 집 안을 바꾸세요. 볕, 색, 정리 상태, 잠자는 방향 같은 것이 지역 이름보다 훨씬 가까이에서 매일 작용해요.",
      ],
    },
  ];
  return { id: "place", title: "살기 좋은 곳", icon: "🗺️", tagline: `${r.dir} · ${r.terrain.split(",")[0]}`, pages };
}

export function buildCouplePlaceStory(a: Analysis, b: Analysis, nameA: string, nameB: string): Story {
  const A = nameA || "나";
  const B = nameB || "상대";
  const ra = REGION[a.yongshin];
  const rb = REGION[b.yongshin];
  const same = a.yongshin === b.yongshin;
  const pages: StoryPage[] = [
    {
      title: "두 사람에게 필요한 방위",
      scene: { kind: "exchange", elA: a.yongshin, elB: b.yongshin },
      bubbles: [
        "오행에는 저마다 방위가 있어요. 나무는 동쪽, 불은 남쪽, 흙은 중앙, 쇠는 서쪽, 물은 북쪽이에요. 부부가 함께 살 곳을 고를 때는 두 사람의 용신을 모두 살릴 수 있는 곳이 가장 좋아요.",
        `${A}의 용신은 **${elName(a.yongshin)}**, 방위는 **${ra.dir}**이에요. ${ra.terrain}이 잘 맞아요. ${ra.why}`,
        `${B}의 용신은 **${elName(b.yongshin)}**, 방위는 **${rb.dir}**이에요. ${rb.terrain}이 잘 맞아요. ${same ? "" : rb.why}`.trim(),
      ],
    },
    {
      title: "둘이 함께 살기 좋은 곳",
      scene: { kind: "couple", variant: "warm" },
      bubbles: same
        ? [
            `두 사람의 용신이 같아요. 고민할 것 없이 **${ra.dir}, ${ra.terrain}**을 고르면 둘 다 편안해요.`,
            `🌟 **추천 지역** — ${ra.regions}`,
            `수도권이라면 — ${ra.cities}`,
            `**집 고르기** — ${ra.home}`,
          ]
        : [
            `두 사람의 용신이 달라요. 이럴 때는 한 사람의 방위에 있으면서 다른 사람의 지형을 갖춘 곳을 찾아요.`,
            `🌟 **두 사람 모두에게 맞는 곳** — ${PAIR[pairKey(a.yongshin, b.yongshin)]}`,
            `${A}에게 맞는 곳 — ${ra.regions}`,
            `${B}에게 맞는 곳 — ${rb.regions}`,
            `지역을 고르기 어렵다면 **집 안에서 나누는 방법**도 있어요. 침실과 거실처럼 함께 쓰는 공간은 기운이 약한 사람(신약한 쪽)의 용신에 맞추고, 서재나 작업 공간은 각자의 용신에 맞추세요.`,
          ],
    },
    {
      title: "집 안에서 각자의 자리",
      scene: { kind: "table" },
      bubbles: [
        `**${A}의 자리** — ${ra.home}`,
        `**${B}의 자리** — ${rb.home}`,
        !a.strength.strong && b.strength.strong
          ? `${eun(A)} 신약, ${eun(B)} 신강이에요. 함께 쓰는 공간은 ${A}에게 맞추세요. 기운이 약한 사람이 편안해야 집안 전체가 안정돼요.`
          : a.strength.strong && !b.strength.strong
            ? `${eun(A)} 신강, ${eun(B)} 신약이에요. 함께 쓰는 공간은 ${B}에게 맞추세요. 기운이 약한 사람이 편안해야 집안 전체가 안정돼요.`
            : "두 사람의 강약이 비슷해요. 함께 쓰는 공간은 두 사람의 용신 색을 반반 섞어 꾸미세요.",
        "방위는 보조 수단이에요. 직장과 가족, 형편이 먼저이고, 조건이 비슷한 곳 사이에서 고민될 때 기준으로 쓰세요.",
      ],
    },
    {
      title: "살 곳, 함께 해야 할 행동",
      scene: { kind: "dodont", mode: "do", icons: ["🧭", "🏡", "🪴", "☀️"] },
      bubbles: [
        "✔ 집을 보러 갈 때 두 사람이 함께 가서, 각자 「여기서 편안한지」를 따로 말해 보세요. 용신이 맞는 곳에서는 몸이 먼저 편안함을 느껴요.",
        `✔ 침실은 두 사람 중 잠이 예민한 사람의 용신에 맞추세요.`,
        "✔ 이사 날짜는 두 사람의 월별 점수가 함께 높은 달로 잡으세요. 「우리의 내년」 카드에 나와 있어요.",
      ],
    },
    {
      title: "살 곳, 함께 피해야 할 행동",
      scene: { kind: "dodont", mode: "dont", icons: ["📦", "💸", "🗯️", "⏰"] },
      bubbles: [
        "✖ 한 사람이 혼자 보고 계약하지 마세요. 집은 두 사람의 기운이 모두 머무는 곳이에요.",
        "✖ 배우자 자리에 충이 드는 달에 급하게 이사를 정하지 마세요. 「우리의 내년」 카드의 월별 점수에서 확인할 수 있어요.",
        "✖ 방위 때문에 형편에 넘치는 집을 고르지 마세요. 무리한 대출이 주는 압박이 어떤 방위의 이로움보다 커요.",
      ],
    },
  ];
  return { id: "place", title: "우리가 살 곳", icon: "🗺️", tagline: same ? `${ra.dir} · 용신이 같아요` : `${ra.dir} + ${rb.dir}`, pages };
}

/* ---------------- 직업운 보강 ---------------- */
export function jobExtraPages(a: Analysis): StoryPage[] {
  const form = WORK_FORM[a.dominantGroup];
  const tag = (g: TenGodGroup) => (g === "식상" ? "이직·독립" : g === "관성" ? "승진·취업" : g === "재성" ? "사업·성과" : g === "인성" ? "공부·자격" : "경쟁·독립");
  return [
    {
      title: "직장인, 자영업, 프리랜서 중 무엇이 맞을까",
      scene: { kind: "stairs", step: 2 },
      bubbles: [
        `사주에서 가장 센 기운은 **${a.dominantGroup}**, 그래서 당신에게 가장 잘 맞는 형태는 **${ieyo(`${form.best}**`)}.`,
        form.text,
        a.strength.strong
          ? "여기에 **신강**하다는 점을 더하면, 책임과 결정권이 클수록 잘 풀려요. 직장에 있다면 관리자나 프로젝트 책임자를, 독립한다면 사람을 두고 판을 키우는 쪽을 생각해 보세요."
          : "여기에 **신약**하다는 점을 더하면, 혼자 모든 위험을 지는 형태는 피하는 게 좋아요. 독립하더라도 든든한 거래처나 동업자, 소속을 두는 방식이 안전해요.",
      ],
      badges: [form.best],
    },
    {
      title: "이직·승진·창업에 좋은 해",
      scene: { kind: "stones", items: a.flows.slice(0, 6).map((f) => ({ label: String(f.year), sub: gz(f.stem, f.branch), kind: f.kind, mark: f.kind === "chance" })) },
      bubbles: [
        "앞으로 10년을 일의 관점에서 다시 읽으면 이래요. 그해에 들어오는 십성이 어떤 종류의 움직임에 맞는지 적었어요.",
        a.flows.map((f) => `${f.year}년 ${gz(f.stem, f.branch)} · ${f.score}점 — ${f.god}의 해, ${tag(TEN_GOD_GROUP[f.god])}에 맞는 해${f.clashDay ? " (일지 충: 자리 변동)" : ""}`).join("\n"),
        (() => {
          const best = [...a.flows].sort((x, y) => y.score - x.score).slice(0, 2);
          return `점수가 가장 높은 해는 **${best.map((f) => `${f.year}년(${f.score}점)`).join(", ")}**이에요. 큰 승부는 이 해들에 맞추고, 그 전 해들은 준비 기간으로 쓰세요.`;
        })(),
      ],
    },
    {
      title: "피하는 게 좋은 업무 환경",
      scene: { kind: "dodont", mode: "dont", icons: ["🏢", "⏰", "📋"] },
      bubbles: [
        `타고난 기운과 맞지 않는 환경에서는 같은 능력으로도 평가가 낮게 나와요. **${a.dominantGod}**의 기운이 가장 센 당신이 피해야 할 환경은 이래요.`,
        `**${AVOID_ENV[a.dominantGod]}**`,
        "지금 그런 곳에 있다면 당장 그만둘 필요는 없어요. 다만 다음 자리를 고를 때는 연봉보다 이 조건을 먼저 확인하세요. 맞는 환경에서 일하는 것이 가장 큰 연봉 인상이에요.",
      ],
    },
  ];
}
