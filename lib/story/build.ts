/**
 * 분석 결과 → 대분류별 동화책 (페이지마다 그림 장면 + 말풍선)
 */
import {
  BRANCH_ANIMAL,
  BRANCH_EL,
  BRANCH_KO,
  CONTROLS,
  ELEMENT_INFO,
  STEM_EL,
  STEM_KO,
  TEN_GOD_GROUP,
  TEN_GOD_HANJA,
  dohwaOf,
  isHap,
  type TenGodGroup,
} from "../saju/constants";
import type { Analysis, YearFlow } from "../saju/engine";
import { DAY_STEM_DECK, KAEUN_DECK, TEN_GOD_DECK, WORK_DECK, YEAR_GOD_KEYWORD } from "../deck";
import {
  CHILD_STYLE,
  EL_COLOR_WORD,
  EL_MEANING,
  GOD_CAUTION,
  GOD_DO,
  GOD_PLAIN,
  GROUP_PLAIN,
  KIND_TEXT,
  LOVE_PATTERN,
  MARRIAGE_TIP,
  MONEY_STORY,
  MoneyType,
  PARENT_TIP,
  PERSON_BY_EL,
  SPOUSE_STYLE,
  YEAR_MONEY,
  YEAR_WORK,
  elName,
  eul,
  eun,
  iga,
  ieyo,
  reasonSentence,
  wa,
} from "./text";
import type { Scene, Story } from "./types";

const gzKo = (stem: string, branch: string) => STEM_KO[stem] + BRANCH_KO[branch];

function stones(flows: YearFlow[], marked: number[] = []): Scene {
  return {
    kind: "stones",
    items: flows.map((f) => ({ label: String(f.year), sub: gzKo(f.stem, f.branch), kind: f.kind, mark: marked.includes(f.year) })),
  };
}

function moneyType(a: Analysis): MoneyType {
  const g = a.groupCounts;
  if (g["재성"] >= 1 && g["비겁"] >= 3) return "leak";
  if (g["식상"] >= 1 && g["재성"] >= 1) return "talent";
  if (g["재성"] >= 1 && g["관성"] >= 1) return "stable";
  if (g["재성"] === 0) return "value";
  return "steady";
}

const joinYears = (ys: number[]) => ys.map((y) => `${y}년`).join(", ");

export function buildStories(a: Analysis, now = new Date()): Story[] {
  const day = a.pillars.find((p) => p.key === "day")!;
  const hour = a.pillars.find((p) => p.key === "hour");
  const stemDeck = DAY_STEM_DECK[a.dayStem];
  // 예: "바위와 쇠 같은 경금 일간"
  const me = `${stemDeck.image} 같은 ${STEM_KO[a.dayStem]}${ELEMENT_INFO[a.dayEl].ko} 일간`;
  const kaeun = KAEUN_DECK[a.yongshin];
  const f0 = a.flows[0];
  const isMale = a.input.gender === "male";

  /* ================= 올해 운 ================= */
  const yAnimal = BRANCH_ANIMAL[f0.branch];
  const yStemEl = STEM_EL[f0.stem];
  const yBranchEl = BRANCH_EL[f0.branch];
  const nextChance = a.flows.slice(1).find((f) => f.kind === "chance");
  const year: Story = {
    id: "year",
    title: "올해 운",
    icon: "🌅",
    tagline: `${f0.year}년 ${gzKo(f0.stem, f0.branch)}년`,
    pages: [
      {
        title: `${f0.year}년, ${EL_COLOR_WORD[yStemEl]} ${yAnimal.ko}의 해`,
        scene: { kind: "year", el: yStemEl, emoji: yAnimal.emoji, ganzhi: f0.stem + f0.branch },
        bubbles: [
          `올해 ${f0.year}년은 **${gzKo(f0.stem, f0.branch)}년(${f0.stem}${f0.branch})**이에요. 그래서 ${EL_COLOR_WORD[yStemEl]} ${yAnimal.ko}의 해라고 불러요.`,
          yStemEl === yBranchEl
            ? `하늘(천간)과 땅(지지)에 모두 **${elName(yStemEl)}** 기운이 흐르는 해예요. ${EL_MEANING[yStemEl]}이 아주 뚜렷하게 드러나지요.`
            : `하늘(천간)에는 **${elName(yStemEl)}**, 땅(지지)에는 **${elName(yBranchEl)}** 기운이 흐르는 해예요.`,
          `이 기운이 ${me}인 당신을 만나면 어떤 이야기가 펼쳐질까요? 함께 한 장씩 넘겨봐요.`,
        ],
      },
      {
        title: "올해 당신을 찾아온 손님",
        scene: { kind: "guest", el: yStemEl, glyph: TEN_GOD_HANJA[f0.god] },
        bubbles: [
          `명리학에서는 그해의 기운을 **나(일간 ${STEM_KO[a.dayStem]})와의 관계**로 읽어요. 같은 해라도 사람마다 다른 손님이 찾아오는 셈이죠.`,
          `올해 당신을 찾아온 손님은 **${ieyo(`${f0.god}**(${TEN_GOD_HANJA[f0.god]})`)}. ${GOD_PLAIN[f0.god]}.`,
          f0.branchGod !== f0.god
            ? `땅에서는 **${f0.branchGod}** 기운도 함께 올라와요. 한마디로 올해의 열쇳말은 「${wa(`${YEAR_GOD_KEYWORD[f0.god]}」`)} 「${ieyo(`${YEAR_GOD_KEYWORD[f0.branchGod]}」`)}.`
            : `하늘과 땅이 같은 손님이라 그 성격이 아주 진해요. 올해의 열쇳말은 「${ieyo(`${YEAR_GOD_KEYWORD[f0.god]}」`)}.`,
        ],
        badges: [`세운 천간 ${f0.god}`, `세운 지지 ${f0.branchGod}`],
      },
      {
        title: KIND_TEXT[f0.kind].name,
        scene: { kind: "path", mood: f0.kind },
        bubbles: [
          KIND_TEXT[f0.kind].desc,
          reasonSentence(f0),
          ...(f0.hapDay ? ["게다가 올해의 지지가 내 자리(일지)와 **합(合)**을 이뤄요. 사람과의 인연이 부드럽게 맺어지기 쉬운 해예요."] : []),
          ...(a.currentDaeyun
            ? [`지금 당신은 ${a.currentDaeyun.startAge}세부터 이어지는 **${gzKo(a.currentDaeyun.stem, a.currentDaeyun.branch)} 대운** 속에 있어요. 대운은 10년마다 바뀌는 인생의 큰 계절이고, 올해 운은 그 계절 위에 부는 바람이라고 생각하면 돼요.`]
            : []),
        ],
        badges: [`용신 ${elName(a.yongshin)}`, `희신 ${elName(a.heeshin)}`, `기신 ${elName(a.gishin)}`],
      },
      {
        title: "올해를 이렇게 보내세요",
        scene: { kind: "lantern", el: a.yongshin },
        bubbles: [
          `✔ **해 보면 좋은 것** — ${GOD_DO[f0.god]}.`,
          `✔ **조심할 것** — ${GOD_CAUTION[f0.god]}.`,
          `행운을 부르는 열쇠는 당신에게 필요한 **${elName(a.yongshin)}** 기운이에요. ${kaeun.color} 소품, ${kaeun.direction} 방향, 그리고 「${eul(`${kaeun.habit}」`)} 곁에 두세요.`,
        ],
      },
      {
        title: "다음 몇 해의 풍경",
        scene: stones(a.flows.slice(0, 5), nextChance ? [nextChance.year] : []),
        bubbles: [
          "앞으로 다섯 해의 흐름을 징검다리로 놓아 봤어요. 초록 돌은 순풍, 노란 돌은 다지기, 회색 돌은 쉬어가는 해예요.",
          a.flows
            .slice(1, 5)
            .map((f) => `${f.year}년 ${gzKo(f.stem, f.branch)} — ${KIND_TEXT[f.kind].short}`)
            .join("\n"),
          nextChance
            ? `특히 **${nextChance.year}년**은 순풍이 부는 해예요. 큰 계획이 있다면 그해를 향해 차근차근 준비해 보세요.`
            : "앞으로 몇 해는 다지는 흐름이 이어져요. 서두르지 않고 기반을 쌓는 사람이 결국 멀리 가요.",
        ],
      },
    ],
  };

  /* ================= 이번 달 운 ================= */
  const m = a.thisMonth;
  const mStemEl = STEM_EL[m.stem];
  const month: Story = {
    id: "month",
    title: "이번 달 운",
    icon: "🌙",
    tagline: `${m.startTerm}~${m.endTerm} · ${gzKo(m.stem, m.branch)}월`,
    pages: [
      {
        title: `이번 달은 ${gzKo(m.stem, m.branch)}월`,
        scene: { kind: "month", el: mStemEl, ganzhi: m.stem + m.branch },
        bubbles: [
          `사주에서 한 달은 달력의 1일이 아니라 **절기**로 바뀌어요. 이번 달은 **${m.startTerm}(${m.startDate})**부터 **${m.endTerm}(${m.endDate})** 전까지예요.`,
          `이 한 달을 다스리는 기운은 **${gzKo(m.stem, m.branch)}(${m.stem}${m.branch})**, ${elName(mStemEl)}${mStemEl === BRANCH_EL[m.branch] ? "" : `과 ${elName(BRANCH_EL[m.branch])}`}의 달이에요.`,
        ],
      },
      {
        title: "이번 달의 손님",
        scene: { kind: "guest", el: mStemEl, glyph: TEN_GOD_HANJA[m.god] },
        bubbles: [
          `당신에게 이번 달은 **${m.god}(${TEN_GOD_HANJA[m.god]})**의 달이에요. ${GOD_PLAIN[m.god]}.`,
          `흐름으로 보면 **${KIND_TEXT[m.kind].name}**예요. ${reasonSentence(m)}`,
          m.clashDay
            ? "이번 달은 내 자리와 부딪히는 **충**이 있어서 이사·이직·여행 같은 변화가 생기기 쉬워요. 중요한 약속은 여유 있게 잡으세요."
            : m.hapDay
              ? "이번 달은 내 자리와 **합**을 이뤄서 사람과의 만남이 부드럽게 풀려요. 미뤄둔 연락을 해 보기 좋은 달이에요."
              : "내 자리와 크게 부딪히는 기운은 없어요. 계획한 일을 차분히 이어가기 좋은 달이에요.",
        ],
      },
      {
        title: "이번 달은 이렇게",
        scene: { kind: "path", mood: m.kind },
        bubbles: [
          `✔ **해 보면 좋은 것** — ${GOD_DO[m.god]}.`,
          `✔ **조심할 것** — ${GOD_CAUTION[m.god]}.`,
          `이번 달 행운 포인트 — 색은 **${kaeun.color}**, 숫자는 **${kaeun.number}**. 작은 것부터 곁에 두어 보세요.`,
        ],
      },
    ],
  };

  /* ================= 재물운 ================= */
  const mt = moneyType(a);
  const ms = MONEY_STORY[mt];
  const g = a.groupCounts;
  const yearMoneyGroup = TEN_GOD_GROUP[f0.god];
  const moneyFill = Math.min(1, (g["재성"] + g["식상"] * 0.5 + 0.5) / 4);
  const money: Story = {
    id: "money",
    title: "재물운",
    icon: "💰",
    tagline: ms.title,
    pages: [
      {
        title: "당신의 재물 그릇",
        scene: {
          kind: "money",
          variant: mt === "talent" ? "tree" : mt === "leak" ? "leak" : mt === "value" ? "mountain" : "jar",
          fill: moneyFill,
        },
        bubbles: [
          `명리학에서 재물은 내가 다스리는 기운, **재성(財星)**으로 봐요. ${elName(a.dayEl)} 일간인 당신에게는 **${iga(`${elName(CONTROLS[a.dayEl])}**`)} 바로 재물이에요.`,
          `당신의 사주에는 재물의 별(재성)이 **${g["재성"]}개**, 재물을 만들어내는 재능의 별(식상)이 **${g["식상"]}개**, 재물을 나눠 가지는 나와 같은 별(비겁)이 **${g["비겁"]}개** 있어요.`,
          `그래서 당신은 **「${ms.title}」**이에요. ${ms.line}.`,
        ],
        badges: [`재성 ${g["재성"]}`, `식상 ${g["식상"]}`, `비겁 ${g["비겁"]}`],
      },
      {
        title: "돈이 들어오는 길",
        scene: { kind: "money", variant: mt === "leak" ? "jar" : mt === "value" ? "mountain" : "tree", fill: moneyFill },
        bubbles: [...ms.inflow, `가장 잘 맞는 소득은 **${ieyo(`${ms.income}**`)}.`],
      },
      {
        title: "재물을 지키는 법",
        scene: { kind: "money", variant: mt === "leak" ? "leak" : "jar", fill: moneyFill },
        bubbles: ms.keep,
      },
      {
        title: `${f0.year}년의 재물 흐름`,
        scene: { kind: "path", mood: f0.kind },
        bubbles: [
          `올해는 **${f0.god}**의 해예요. ${YEAR_MONEY[yearMoneyGroup]}`,
          `전체 흐름은 **${KIND_TEXT[f0.kind].name}**예요. 재물을 부르는 색은 **${kaeun.color}**, 방향은 **${kaeun.direction}**이에요.`,
        ],
      },
    ],
  };

  /* ================= 연애운 ================= */
  const hasDohwa = a.shinsal.some((s) => s.id === "dohwa");
  const spouseGroup: TenGodGroup = isMale ? "재성" : "관성";
  const n = a.spouseStarCount;
  const palaceGroup = TEN_GOD_GROUP[day.branchGod];
  const lp = LOVE_PATTERN[palaceGroup];
  const dohwaBranch = dohwaOf(a.dayBranch);
  const loveYears = a.flows
    .filter((f) => f.branch === dohwaBranch || TEN_GOD_GROUP[f.god] === spouseGroup || f.hapDay)
    .slice(0, 3);
  const love: Story = {
    id: "love",
    title: "연애운",
    icon: "🌸",
    tagline: hasDohwa ? "도화가 핀 사주" : n >= 3 ? "인연이 많은 사주" : n >= 1 ? "한 사람에게 깊은 사주" : "늦게 피는 꽃",
    pages: [
      {
        title: "당신의 연애 매력",
        scene: { kind: "love", variant: hasDohwa ? "blossom" : n === 0 ? "bud" : "pair" },
        bubbles: [
          `연애 이야기는 당신이라는 사람에서 시작해요. ${me}인 당신은 사랑할 때도 「${wa(`${stemDeck.keywords[0]}」`)} 「${iga(`${stemDeck.keywords[1]}」`)} 먼저 보이는 사람이에요.`,
          hasDohwa
            ? "게다가 사주에 **도화(桃花)**가 피어 있어요. 복숭아꽃처럼 사람을 끄는 매력의 별이라, 가만히 있어도 눈길이 모이는 편이에요."
            : n === 0
              ? "당신의 사랑은 **늦게 피는 꽃**과 같아요. 서두르지 않고 내 삶을 단단히 가꿀 때, 그 향기를 알아보는 사람이 찾아와요."
              : "당신의 매력은 첫눈에 확 드러나기보다 **알수록 깊어지는** 쪽이에요. 오래 볼수록 진가가 보이는 사람이에요.",
        ],
        badges: hasDohwa ? ["도화살"] : undefined,
      },
      {
        title: "끌리는 사람, 잘 맞는 사람",
        scene: { kind: "love", variant: "pair" },
        bubbles: [
          `${isMale ? "남성" : "여성"}에게 연인을 뜻하는 별은 **${isMale ? "재성(財星)" : "관성(官星)"}**이에요. 당신의 사주에는 이 별이 **${n}개** 있어요.`,
          n === 0
            ? "원국에 연인의 별이 드러나 있지 않아서, 연애보다 내 일과 삶에 집중하다가 자연스럽게 인연을 만나는 경우가 많아요."
            : n <= 2
              ? "한 사람에게 마음을 깊이 주는 타입이에요. 여러 사람보다 한 사람과 오래 쌓아가는 사랑이 잘 맞아요."
              : "인연의 기회가 많은 사주예요. 그만큼 **고르는 눈**이 중요해요. 설렘보다 편안함을 주는 사람을 눈여겨보세요.",
          `잘 맞는 상대는 당신에게 부족한 **${elName(a.yongshin)}** 기운을 가진, ${PERSON_BY_EL[a.yongshin]}이에요. 그런 사람 곁에서 당신은 훨씬 편안해져요.`,
        ],
      },
      {
        title: "사랑할 때의 나",
        scene: { kind: "love", variant: "blossom" },
        bubbles: [
          `연애 초반의 당신은 ${lp.early}. 시간이 흐르면 ${lp.long}.`,
          `자주 부딪히는 지점은 **${ieyo(`${lp.conflict}**`)}. ${eun(lp.tip)} 관계를 오래 지켜주는 비결이에요.`,
        ],
        badges: [`배우자궁 ${day.branchKo} · ${day.branchGod}`],
      },
      {
        title: "인연이 다가오는 시기",
        scene: stones(a.flows.slice(0, 6), loveYears.map((f) => f.year)),
        bubbles: loveYears.length
          ? [
              `앞으로 10년 중 인연의 기운이 특히 강한 해는 **${joinYears(loveYears.map((f) => f.year))}**이에요.`,
              loveYears
                .map((f) => {
                  const why = [
                    f.branch === dohwaBranch ? "도화가 피는 해" : "",
                    TEN_GOD_GROUP[f.god] === spouseGroup ? "연인의 별이 들어오는 해" : "",
                    f.hapDay ? "내 자리와 합을 이루는 해" : "",
                  ].filter(Boolean);
                  return `${f.year}년 — ${why.join(", ")}`;
                })
                .join("\n"),
              "이 시기에는 새로운 모임이나 소개에 조금 더 마음을 열어 보세요.",
            ]
          : ["앞으로 10년은 인연의 별이 크게 들어오기보다 잔잔하게 이어지는 흐름이에요. 지금 곁에 있는 인연을 소중히 가꾸는 것이 가장 좋은 연애운이에요."],
      },
    ],
  };

  /* ================= 부부운 ================= */
  const dayHap = a.pillars.some((p) => p.key !== "day" && isHap(p.branch, a.dayBranch));
  const dayClash = a.dayBranchClash;
  const clashYears = a.flows.filter((f) => f.clashDay).map((f) => f.year);
  const hapYears = a.flows.filter((f) => f.hapDay).map((f) => f.year);
  const marriage: Story = {
    id: "marriage",
    title: "부부운",
    icon: "🏡",
    tagline: `배우자 자리 ${day.branchKo}(${BRANCH_ANIMAL[a.dayBranch].ko})`,
    pages: [
      {
        title: "배우자의 자리, 일지",
        scene: { kind: "couple", variant: dayClash ? "river" : "warm" },
        bubbles: [
          "사주 여덟 글자 중 태어난 날의 아래 글자, **일지(日支)**를 배우자의 자리(배우자궁)라고 해요.",
          `당신의 배우자 자리에는 **${day.branchKo}(${day.branch}) — ${iga(`${BRANCH_ANIMAL[a.dayBranch].ko}**`)} 앉아 있고, 십성으로는 **${ieyo(`${day.branchGod}**`)}.`,
          SPOUSE_STYLE[palaceGroup],
        ],
        badges: [`일지 ${day.branchKo}`, `${day.branchGod}`],
      },
      {
        title: "함께 사는 모습",
        scene: { kind: "couple", variant: dayClash ? "river" : "warm" },
        bubbles: [
          dayClash
            ? "배우자 자리가 다른 글자와 **충(沖)**을 이루고 있어요. 서로 다른 점이 크게 느껴질 수 있지만, 그만큼 서로의 세상을 넓혀주는 관계예요. **각자의 시간과 공간을 존중할 때** 오히려 더 가까워져요."
            : dayHap
              ? "배우자 자리가 다른 글자와 **합(合)**을 이루고 있어요. 가족과 주변 사람들 사이에서 부부가 **자연스럽게 어우러지는** 모습이에요."
              : "배우자 자리가 다른 글자와 크게 부딪히지 않아, 비교적 **잔잔하고 안정적인** 부부의 모습이에요.",
          `${eul(isMale ? "아내" : "남편")} 뜻하는 별(${isMale ? "재성" : "관성"})은 사주에 **${n}개** 있어요. ${n === 0 ? "원국에 드러나지 않은 만큼, 대운에서 이 별이 들어올 때 인연이 깊어져요." : n >= 3 ? "인연이 많은 만큼, 한 사람에게 마음을 모으는 노력이 부부운을 지켜줘요." : "알맞게 자리하고 있어 한 사람과 깊게 맺어지는 모습이에요."}`,
        ],
      },
      {
        title: "더 행복한 부부가 되려면",
        scene: { kind: "lantern", el: a.yongshin },
        bubbles: [
          MARRIAGE_TIP[palaceGroup],
          `두 분이 함께 「${eul(`${kaeun.habit}」`)} 해 보세요. 당신에게 필요한 **${elName(a.yongshin)}** 기운을 함께 채우는 방법이에요.`,
        ],
      },
      {
        title: "함께 마음 쓸 해",
        scene: stones(a.flows.slice(0, 6), [...clashYears, ...hapYears]),
        bubbles: [
          clashYears.length
            ? `**${joinYears(clashYears)}**에는 배우자 자리가 흔들려요. 이사·이직 같은 변화가 생기기 쉬우니 **대화를 평소보다 더 늘려** 주세요.`
            : "앞으로 10년 동안 배우자 자리를 크게 흔드는 해는 없어요. 편안한 흐름이에요.",
          hapYears.length
            ? `**${joinYears(hapYears)}**에는 배우자 자리와 합을 이뤄 관계가 한층 단단해져요. 함께하는 계획을 세우기 좋은 해예요.`
            : "합이 드는 해는 없지만, 꾸준한 표현이 그 몫을 충분히 해 줄 거예요.",
        ],
      },
    ],
  };

  /* ================= 자녀운 ================= */
  const childGroup: TenGodGroup = isMale ? "관성" : "식상";
  const cn = g[childGroup];
  const childYears = a.flows
    .filter((f) => TEN_GOD_GROUP[f.god] === childGroup || TEN_GOD_GROUP[f.branchGod] === childGroup)
    .map((f) => f.year)
    .slice(0, 4);
  const children: Story = {
    id: "children",
    title: "자녀운",
    icon: "🌱",
    tagline: `자녀의 별 ${cn}개`,
    pages: [
      {
        title: "자녀의 별",
        scene: { kind: "children", count: Math.max(1, Math.min(4, cn)) },
        bubbles: [
          `${isMale ? "남성" : "여성"}에게 자녀를 뜻하는 별은 **${isMale ? "관성(官星)" : "식상(食傷)"}**이에요. ${isMale ? "나를 책임감 있게 만드는 기운" : "내가 낳고 기르는 기운"}이지요.`,
          cn === 0
            ? "사주 원국에 자녀의 별이 드러나 있지 않아요. 걱정하지 마세요. 원국에 없는 별은 **대운과 세운에서 들어올 때** 인연이 맺어져요."
            : cn <= 2
              ? `자녀의 별이 **${cn}개**, 알맞게 자리하고 있어요. 자녀와 깊고 따뜻한 정을 나누는 모습이에요.`
              : `자녀의 별이 **${cn}개**로 넉넉해요. 자녀에 대한 관심과 애정이 큰 만큼, 아이의 독립성도 함께 지켜주면 좋아요.`,
        ],
      },
      {
        title: "자녀의 자리, 시주",
        scene: { kind: "children", count: Math.max(1, Math.min(4, cn)), unknown: !hour },
        bubbles: hour
          ? [
              `태어난 시간의 기둥, **시주(時柱)**는 자녀와 노년의 자리예요. 당신의 시주는 **${hour.stemKo}${hour.branchKo}(${hour.stem}${hour.branch})**이고, 십성으로 **${ieyo(`${hour.stemGod ?? ""}·${hour.branchGod}**`)}.`,
              CHILD_STYLE[TEN_GOD_GROUP[hour.branchGod]],
            ]
          : [
              "태어난 시간의 기둥, **시주(時柱)**는 자녀와 노년의 자리예요.",
              "태어난 시간을 몰라서 이 자리는 비워 두었어요. 시간을 알게 되면 다시 펼쳐 보세요. 훨씬 자세한 이야기를 들려드릴게요.",
            ],
      },
      {
        title: "좋은 부모가 되는 법",
        scene: { kind: "lantern", el: a.dayEl },
        bubbles: [PARENT_TIP[a.dayStem]],
      },
      {
        title: "자녀 인연이 활발한 해",
        scene: stones(a.flows.slice(0, 6), childYears),
        bubbles: childYears.length
          ? [
              `자녀의 별이 들어와 자녀와 관련된 일이 활발해지는 해는 **${joinYears(childYears)}**이에요.`,
              "임신·출산뿐 아니라 자녀의 입학, 진로처럼 아이와 함께 새 장을 여는 일이 생기기 쉬운 해예요.",
            ]
          : ["앞으로 몇 해는 자녀의 별이 크게 들어오지 않아요. 지금의 일상을 단단히 가꾸는 것이 가장 좋은 준비예요."],
      },
    ],
  };

  /* ================= 직업운 ================= */
  const work = WORK_DECK[a.dominantGroup];
  const god = TEN_GOD_DECK[a.dominantGod];
  const workStory: Story = {
    id: "work",
    title: "직업운",
    icon: "🧭",
    tagline: work.title,
    pages: [
      {
        title: "타고난 일의 모습",
        scene: { kind: "work", group: a.dominantGroup },
        bubbles: [
          `당신의 사주에서 가장 힘이 센 기운은 **${a.dominantGroup}**이에요. ${GROUP_PLAIN[a.dominantGroup]}`,
          `그래서 당신은 **「${work.title}」**이에요. ${work.line}.`,
        ],
        badges: [`${a.dominantGroup} ${g[a.dominantGroup]}개`, `주도 십성 ${a.dominantGod}`],
      },
      {
        title: "빛이 나는 분야",
        scene: { kind: "work", group: a.dominantGroup },
        bubbles: [
          `이런 분야에서 특히 빛이 나요: **${work.jobs.join(", ")}**.`,
          `일할 때 당신의 무기 — **${god.strength}**\n조심할 점 — **${god.weakness}**`,
        ],
      },
      {
        title: `${f0.year}년의 일 운`,
        scene: { kind: "path", mood: f0.kind },
        bubbles: [
          `올해는 **${f0.god}**의 해예요. ${YEAR_WORK[TEN_GOD_GROUP[f0.god]]}`,
          `흐름은 **${KIND_TEXT[f0.kind].name}**예요. ${KIND_TEXT[f0.kind].desc}`,
        ],
      },
    ],
  };

  return [year, month, money, love, marriage, children, workStory];
}

/** 표지 장면 */
export function coverScene(a: Analysis): Scene {
  return { kind: "cover", el: a.dayEl, stem: a.dayStem, branch: a.dayBranch, emoji: BRANCH_ANIMAL[a.dayBranch].emoji };
}

export function coverTitle(a: Analysis) {
  const d = DAY_STEM_DECK[a.dayStem];
  return {
    title: `${STEM_KO[a.dayStem]}${BRANCH_KO[a.dayBranch]} 일주`,
    subtitle: `${d.color} ${BRANCH_ANIMAL[a.dayBranch].ko} · ${d.image}`,
  };
}
