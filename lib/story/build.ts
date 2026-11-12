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
  tenGod,
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
import { HIDDEN_STEMS, interactionsOf, yearDetail, type Area, type YearDetail } from "../saju/period";
import { GOD_AREA, INTERACTION_EX, INTERACTION_NAME, POSITION, STEM_TIE_EX, buildYearStory, fmtPoints, scoreWord } from "./yearly";
import {
  CHILD_KIND,
  CHILD_POS,
  EL_INDUSTRY,
  GROUP_PERSON,
  LOVE_KIND,
  MARRIAGE_POS,
  MONEY_KIND,
  MONEY_POS,
  MONTH_GOD_ROLE,
  POS_TIME,
  SHINSAL_LOVE,
  daeyunLines,
  daeyunScene,
  daeyunView,
  hiddenText,
  pillarsScene,
  spotText,
  starInfo,
} from "./detail";

const gzKo = (stem: string, branch: string) => STEM_KO[stem] + BRANCH_KO[branch];

function stones(flows: YearFlow[], marked: number[] = []): Scene {
  return {
    kind: "stones",
    items: flows.map((f) => ({ label: String(f.year), sub: gzKo(f.stem, f.branch), kind: f.kind, mark: marked.includes(f.year) })),
  };
}

export function moneyType(a: Analysis): MoneyType {
  const g = a.groupCounts;
  if (g["재성"] >= 1 && g["비겁"] >= 3) return "leak";
  if (g["식상"] >= 1 && g["재성"] >= 1) return "talent";
  if (g["재성"] >= 1 && g["관성"] >= 1) return "stable";
  if (g["재성"] === 0) return "value";
  return "steady";
}

const joinYears = (ys: number[]) => ys.map((y) => `${y}년`).join(", ");

export function buildStories(a: Analysis): Story[] {
  const day = a.pillars.find((p) => p.key === "day")!;
  const hour = a.pillars.find((p) => p.key === "hour");
  const stemDeck = DAY_STEM_DECK[a.dayStem];
  // 예: "바위와 쇠 같은 경금 일간"
  const me = `${stemDeck.image} 같은 ${STEM_KO[a.dayStem]}${ELEMENT_INFO[a.dayEl].ko} 일간`;
  const kaeun = KAEUN_DECK[a.yongshin];
  const f0 = a.flows[0];
  const isMale = a.input.gender === "male";

  /* ================= 올해 운 · 내년 운 (자세한 버전) ================= */
  const d0 = yearDetail(a, f0.year);
  const d1 = yearDetail(a, f0.year + 1);
  const year = buildYearStory(a, d0, "this");
  const nextYear = buildYearStory(a, d1, "next");
  const areaLine = (d: YearDetail, k: Area) =>
    `**${d.year}년 ${d.areas[k].score}점(${scoreWord(d.areas[k].score)})** — 종합 ${d.score}점에서 ${fmtPoints(d.areas[k].points)}`;
  const topMonths = (d: YearDetail, groups: TenGodGroup[]) => {
    const pool = d.months.filter((x) => groups.includes(TEN_GOD_GROUP[x.god]));
    return [...(pool.length ? pool : d.months)]
      .sort((x, y) => y.score - x.score)
      .slice(0, 2)
      .map((x) => `${x.month}월(${x.score}점)`)
      .join(", ");
  };
  const hiddenOf = (branch: string) => HIDDEN_STEMS[branch].map((s) => ({ stem: s, god: tenGod(a.dayStem, s) }));

  /* ================= 이번 달 운 ================= */
  const m = a.thisMonth;
  const mStemEl = STEM_EL[m.stem];
  const mInt = interactionsOf(a, m.stem, m.branch);
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
          `예를 들어 이번 달에는 ${GOD_AREA[m.god].examples[0]}, ${GOD_AREA[m.god].examples[1]} 같은 일이 생기기 쉬워요.`,
          `이번 달 점수는 **${m.score}점(${scoreWord(m.score)})**, 흐름으로 보면 **${KIND_TEXT[m.kind].name}**예요. ${reasonSentence(m)}\n근거: 기본 60 → ${fmtPoints(m.points)}`,
          m.clashDay
            ? "이번 달은 내 자리와 부딪히는 **충**이 있어서 이사·이직·여행 같은 변화가 생기기 쉬워요. 중요한 약속은 여유 있게 잡으세요."
            : m.hapDay
              ? "이번 달은 내 자리와 **합**을 이뤄서 사람과의 만남이 부드럽게 풀려요. 미뤄둔 연락을 해 보기 좋은 달이에요."
              : "내 자리와 크게 부딪히는 기운은 없어요. 계획한 일을 차분히 이어가기 좋은 달이에요.",
        ],
      },
      {
        title: "이번 달, 내 사주와 만나는 자리",
        scene: pillarsScene(a, m.stem, m.branch, mInt.interactions, mInt.stemTies),
        bubbles: [
          `이번 달의 **${iga(`${BRANCH_KO[m.branch]}(${m.branch})**`)} 내 사주 네 기둥 중 어디와 만나는지 볼게요. 달의 기운은 한 해의 기운보다 짧고 빠르게, 2~4주 안에 사건으로 나타나요.`,
          ...mInt.interactions.map(
            (it) => `**${POSITION[it.pos].name} ${wa(`${BRANCH_KO[it.myBranch]}(${it.myBranch})`)} ${INTERACTION_NAME[it.type]}** — ${POSITION[it.pos].area}의 자리예요. ${INTERACTION_EX[it.type][it.pos]}`,
          ),
          ...mInt.stemTies.map(
            (t) => `**하늘에서는 ${iga(`${STEM_KO[m.stem]}(${m.stem})`)} 내 ${wa(`${STEM_KO[t.myStem]}(${t.myStem})`)} 천간합**을 이뤄요. ${STEM_TIE_EX[t.pos]}`,
          ),
          ...(mInt.interactions.length + mInt.stemTies.length === 0
            ? ["이번 달의 글자는 내 사주와 직접 부딪히거나 묶이지 않아요. 바깥에서 오는 사건보다 **내가 정한 계획대로 흘러가는 달**이에요."]
            : []),
          `땅속(지장간)에는 ${hiddenOf(m.branch)
            .map((h) => `${STEM_KO[h.stem]}(${h.god})`)
            .join("·")}의 기운이 숨어 있어, 달의 후반으로 갈수록 이 기운이 조금씩 드러나요.`,
        ],
        badges: mInt.interactions.map((i) => `${POSITION[i.pos].name} ${INTERACTION_NAME[i.type].replace(/\(.*/, "")}`),
      },
      {
        title: "이번 달의 일·돈·사람",
        scene: { kind: "desk", el: mStemEl },
        bubbles: [
          `💼 **일** — ${GOD_AREA[m.god].work}`,
          `💰 **돈** — ${GOD_AREA[m.god].money}`,
          `🌸 **사람** — ${GOD_AREA[m.god].love} ${GOD_AREA[m.god].people}`,
        ],
      },
      {
        title: "이번 달은 이렇게",
        scene: { kind: "dodont", mode: "do", icons: ["📅", "🤝", "🧘", "🍀"] },
        bubbles: [
          `✔ **해 보면 좋은 것** — ${GOD_DO[m.god]}. ${GOD_AREA[m.god].monthAction}`,
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
  const mStar = starInfo(a, "재성");
  const moneyDY = daeyunView(a, ["재성", "식상"], ["비겁"], f0.year);
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
        title: "재물의 별이 놓인 자리",
        scene: { kind: "chest", fill: moneyFill },
        bubbles: [
          mStar.total
            ? `당신의 재성은 **${spotText(mStar)}**에 있어요. 별이 놓인 자리는 그 복을 쓰는 시기와 영역을 알려 줘요.`
            : "겉으로 드러난 재성은 없어요. 그래서 재물이 **들어오는 때(대운·세운)**를 아는 것이 다른 사람보다 훨씬 중요해요.",
          ...[...new Set(mStar.spots.map((s) => s.pos))].map(
            (pos) => `**${POS_TIME[pos].name}의 재성** — ${POS_TIME[pos].when}의 자리예요. ${MONEY_POS[pos]}`,
          ),
          mStar.jeong && mStar.pyeon ? MONEY_KIND.both : mStar.jeong ? MONEY_KIND.jeong : mStar.pyeon ? MONEY_KIND.pyeon : "",
          mStar.hidden.length
            ? `지장간에도 재성이 숨어 있어요: **${hiddenText(mStar)}**. 이것을 숨은 재물 창고로 봐요. 예를 들어 평소에는 드러나지 않다가, 그 글자를 건드리는 해에 뜻밖의 수입이나 묵혀 둔 자산이 빛을 봐요.`
            : "",
        ].filter(Boolean),
        badges: [`정재 ${mStar.jeong}`, `편재 ${mStar.pyeon}`, `숨은 재성 ${mStar.hidden.length}`],
      },
      {
        title: "돈이 들어오는 길",
        scene: { kind: "market" },
        bubbles: [...ms.inflow, `가장 잘 맞는 소득은 **${ieyo(`${ms.income}**`)}.`],
      },
      {
        title: "재물을 지키는 법",
        scene: { kind: "money", variant: mt === "leak" ? "leak" : "jar", fill: moneyFill },
        bubbles: [
          ...ms.keep,
          a.strength.strong
            ? "당신은 **신강(身强)**한 사주예요. 내 힘이 세서 큰돈도 감당할 수 있지만, 자신감이 지나쳐 무리한 확장을 하기 쉬워요. 큰 결정 전에 숫자로 한 번 더 따져 보세요."
            : "당신은 **신약(身弱)**한 사주예요. 큰돈을 한꺼번에 쥐면 오히려 부담이 되기 쉬워요. 예를 들어 목돈보다 매달 들어오는 현금 흐름을 여러 개 만드는 방식이 잘 맞아요.",
        ],
      },
      {
        title: "대운으로 보는 재물의 계절",
        scene: daeyunScene(moneyDY),
        bubbles: [
          "**대운(大運)**은 10년마다 바뀌는 인생의 계절이에요. 재성·식상의 기운이 들어오는 대운에 재물이 크게 움직이고, 비겁의 대운에는 지출과 경쟁이 늘어요.",
          daeyunLines(moneyDY, { chance: "재물이 크게 움직이는 계절", prepare: "기반을 다지는 계절", careful: "지출·경쟁을 조심할 계절" }),
          "📍 표시가 지금 지나고 있는 대운이에요. 큰 나무가 서 있는 대운에 사업·투자·내 집 마련 같은 큰 계획을 맞춰 보세요.",
        ],
      },
      {
        title: "올해와 내년의 재물 점수",
        scene: { kind: "duoScore", a: d0.areas.money.score, b: d1.areas.money.score, labelA: `${d0.year}년`, labelB: `${d1.year}년`, heart: false },
        bubbles: [
          `${areaLine(d0, "money")}\n올해는 **${f0.god}**의 해예요. ${YEAR_MONEY[yearMoneyGroup]}`,
          `${areaLine(d1, "money")}\n내년은 **${d1.god}**의 해예요. ${YEAR_MONEY[TEN_GOD_GROUP[d1.god]]}`,
          `돈과 관련된 일을 하기 좋은 달은 올해 **${topMonths(d0, ["재성", "식상"])}**, 내년 **${topMonths(d1, ["재성", "식상"])}**이에요.`,
          `재물을 부르는 색은 **${kaeun.color}**, 방향은 **${kaeun.direction}**, 숫자는 **${kaeun.number}**예요.`,
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
  const lStar = starInfo(a, spouseGroup);
  const dayHidden = hiddenOf(a.dayBranch);
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
        title: "연인의 별이 놓인 자리",
        scene: { kind: "bench" },
        bubbles: [
          lStar.total
            ? `당신의 연인의 별(${spouseGroup})은 **${spotText(lStar)}**에 있어요. 별이 놓인 자리로 인연을 만나는 때와 장소를 짐작해요.`
            : `겉으로 드러난 연인의 별(${spouseGroup})은 없어요. 인연이 없다는 뜻이 아니라, **대운·세운에서 이 별이 들어오는 시기**에 인연이 또렷해진다는 뜻이에요.`,
          ...[...new Set(lStar.spots.map((s) => s.pos))].map(
            (pos) => `**${POS_TIME[pos].name}의 ${spouseGroup}** — ${POS_TIME[pos].when}의 자리예요. 예를 들어 ${POS_TIME[pos].meet}에서 인연이 닿기 쉬워요.`,
          ),
          lStar.jeong && lStar.pyeon ? LOVE_KIND[a.input.gender].both : lStar.jeong ? LOVE_KIND[a.input.gender].jeong : lStar.pyeon ? LOVE_KIND[a.input.gender].pyeon : "",
          lStar.hidden.length
            ? `지장간에도 연인의 별이 숨어 있어요: **${hiddenText(lStar)}**. 예를 들어 오래 알고 지낸 사람이 어느 날 이성으로 보이거나, 드러내지 않은 호감이 뒤늦게 이어지는 인연이에요.`
            : "",
        ].filter(Boolean),
        badges: [`${spouseGroup} ${lStar.total}`, `숨은 별 ${lStar.hidden.length}`],
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
        title: "신살로 보는 나의 연애",
        scene: { kind: "lantern", el: "fire" },
        bubbles: [
          "**신살(神殺)**은 사주에 붙은 특별한 별이에요. 성격의 양념 같은 것이라, 연애 스타일에 뚜렷한 색을 입혀요.",
          ...(a.shinsal.length
            ? a.shinsal.slice(0, 4).map((s) => `${SHINSAL_LOVE[s.id]}\n(근거: ${s.basis})`)
            : ["당신의 사주에는 연애에 강하게 작용하는 신살이 없어요. 그만큼 **담백하고 꾸밈없는 연애**를 해요. 화려한 시작보다 편안하게 이어지는 관계가 잘 맞아요."]),
          `배우자 자리(일지) ${day.branchKo}(${day.branch}) 속에는 **${iga(`${dayHidden.map((h) => `${STEM_KO[h.stem]}(${h.god})`).join("·")}**`)} 들어 있어요. 그래서 당신이 끌리는 사람은 겉으로는 ${GROUP_PERSON[TEN_GOD_GROUP[dayHidden[0].god]]}, 가까워질수록 ${eul(GROUP_PERSON[TEN_GOD_GROUP[dayHidden[dayHidden.length - 1].god]])} 보여 주는 사람이에요.`,
        ],
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
  const marriageDY = daeyunView(a, [spouseGroup], ["비겁"], f0.year);
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
        title: "배우자 자리 속 숨은 기운",
        scene: { kind: "table" },
        bubbles: [
          `일지 ${day.branchKo}(${day.branch}) 속에는 **지장간** ${iga(dayHidden.map((h) => `${STEM_KO[h.stem]}(${h.stem})`).join("·"))} 들어 있어요. 배우자 자리의 지장간은 **함께 살아 봐야 보이는 배우자의 속모습**이에요.`,
          ...dayHidden.map(
            (h, i) =>
              `${i === 0 ? "가장 먼저 드러나는 기운" : i === dayHidden.length - 1 ? "가장 깊이 자리한 기운" : "그 사이에 섞인 기운"}은 **${STEM_KO[h.stem]}(${h.god})** — ${ieyo(GROUP_PERSON[TEN_GOD_GROUP[h.god]])}.`,
          ),
          dayHidden.length > 1
            ? "그래서 배우자는 한 가지 모습으로 설명되지 않아요. 예를 들어 밖에서는 든든한데 집에서는 아이 같거나, 평소엔 조용하다가 중요한 순간에 단호해지는 식이에요."
            : "지장간이 하나뿐이라 배우자의 겉과 속이 같아요. 예를 들어 처음 본 모습 그대로 오래 가는, 한결같은 사람을 만나기 쉬워요.",
        ],
        badges: dayHidden.map((h) => `${STEM_KO[h.stem]} ${h.god}`),
      },
      {
        title: "함께 사는 모습",
        scene: { kind: "bench" },
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
        title: "배우자의 별과 만나는 시기",
        scene: { kind: "love", variant: "pair" },
        bubbles: [
          lStar.total
            ? `${eul(isMale ? "아내" : "남편")} 뜻하는 별(${spouseGroup})은 **${spotText(lStar)}**에 있어요.`
            : `${eul(isMale ? "아내" : "남편")} 뜻하는 별(${spouseGroup})은 원국에 드러나 있지 않아요. 이런 사주는 배우자 자리(일지)의 힘으로 인연을 봐요.`,
          ...[...new Set(lStar.spots.map((s) => s.pos))].map((pos) => `**${POS_TIME[pos].name}** — ${MARRIAGE_POS[pos]}`),
          lStar.jeong && lStar.pyeon ? LOVE_KIND[a.input.gender].both : lStar.jeong ? LOVE_KIND[a.input.gender].jeong : lStar.pyeon ? LOVE_KIND[a.input.gender].pyeon : "",
          `대운으로 보면 배우자의 별이 들어오는 시기는 이래요.\n${daeyunLines(marriageDY, { chance: "배우자 인연이 강해지는 계절", prepare: "잔잔한 계절", careful: "서로 부딪히기 쉬운 계절" })}`,
        ].filter(Boolean),
      },
      {
        title: "더 행복한 부부가 되려면",
        scene: { kind: "compass", el: a.yongshin, direction: kaeun.direction },
        bubbles: [
          MARRIAGE_TIP[palaceGroup],
          `부부에게 좋은 방향은 **${kaeun.direction}**이에요. 예를 들어 침대 머리나 함께 쓰는 식탁을 그쪽으로 두거나, 여행지를 그 방향으로 골라 보세요.`,
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
  const cStar = starInfo(a, childGroup);
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
        scene: { kind: "nest", eggs: cn },
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
        title: "자녀의 별이 놓인 자리",
        scene: { kind: "children", count: Math.max(1, Math.min(4, cn)) },
        bubbles: [
          cStar.total
            ? `자녀의 별(${childGroup})은 **${spotText(cStar)}**에 있어요.`
            : `자녀의 별(${childGroup})은 겉으로 드러나 있지 않아요.`,
          ...[...new Set(cStar.spots.map((s) => s.pos))].map((pos) => `**${POS_TIME[pos].name}** — ${CHILD_POS[pos]}`),
          cStar.jeong && cStar.pyeon ? CHILD_KIND[a.input.gender].both : cStar.jeong ? CHILD_KIND[a.input.gender].jeong : cStar.pyeon ? CHILD_KIND[a.input.gender].pyeon : "",
          cStar.hidden.length
            ? `지장간에도 자녀의 별이 숨어 있어요: **${hiddenText(cStar)}**. 예를 들어 계획보다 늦게, 또는 생각지 못한 때에 자녀 소식이 찾아오는 인연이에요.`
            : "",
          hour
            ? `자녀 자리(시지) ${hour.branchKo}(${hour.branch}) 속에는 지장간 ${iga(
                hiddenOf(hour.branch)
                  .map((h) => `${STEM_KO[h.stem]}(${h.god})`)
                  .join("·"),
              )} 들어 있어요. 아이가 자라면서 ${eul(GROUP_PERSON[TEN_GOD_GROUP[hiddenOf(hour.branch)[0].god]])} 보여 주기 쉬워요.`
            : "",
        ].filter(Boolean),
        badges: [`${childGroup} ${cStar.total}`, `숨은 별 ${cStar.hidden.length}`],
      },
      {
        title: "좋은 부모가 되는 법",
        scene: { kind: "family", kids: Math.max(1, cn) },
        bubbles: [
          PARENT_TIP[a.dayStem],
          a.strength.strong
            ? "당신은 **신강**한 사주라 아이를 이끄는 힘이 세요. 예를 들어 학원·진로를 부모가 먼저 정해 주기 쉬운데, 아이에게 「너는 어떻게 하고 싶어?」를 먼저 물어 주세요."
            : "당신은 **신약**한 사주라 아이에게 에너지를 많이 쓰면 금방 지쳐요. 예를 들어 주말 하루는 배우자나 가족에게 맡기고 혼자 쉬는 시간을 꼭 만들어 주세요.",
          g["인성"] >= 3
            ? "인성이 많아 아이를 품는 마음이 깊어요. 다만 걱정이 지나치면 과보호가 되기 쉬워요."
            : g["관성"] >= 3
              ? "관성이 많아 규칙과 예의를 중요하게 가르쳐요. 칭찬을 규칙보다 한 번 더 해 주세요."
              : g["식상"] >= 3
                ? "식상이 많아 아이와 잘 놀아 주고 표현이 풍부해요. 잔소리가 길어지지 않게만 조심하세요."
                : "기운이 고르게 섞여 있어, 엄할 때와 다정할 때를 균형 있게 쓸 수 있는 부모예요.",
        ],
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
  const monthP = a.pillars.find((p) => p.key === "month")!;
  const workDY = daeyunView(a, ["관성", "인성"], ["비겁"], f0.year);
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
        title: "월지로 보는 사회적 무대",
        scene: { kind: "desk", el: monthP.branchEl },
        bubbles: [
          "태어난 달의 지지, **월지(月支)**는 사주에서 힘이 가장 센 자리예요. 내가 사회에 나가 쓰는 무기, 곧 직업의 뿌리를 여기서 봐요.",
          MONTH_GOD_ROLE[monthP.branchGod],
          `월지 ${monthP.branchKo}(${monthP.branch}) 속에는 지장간 ${iga(
            hiddenOf(monthP.branch)
              .map((h) => `${STEM_KO[h.stem]}(${h.god})`)
              .join("·"),
          )} 들어 있어요. 그래서 본업 말고도 **${hiddenOf(monthP.branch)
            .slice(1)
            .map((h) => YEAR_GOD_KEYWORD[h.god])
            .join(", ") || YEAR_GOD_KEYWORD[monthP.branchGod]}** 쪽 재능을 부업이나 두 번째 직업으로 살릴 수 있어요.`,
          monthP.stemGod ? `월간에는 **${iga(`${monthP.stemGod}**`)} 떠 있어, 사회에서 남들이 먼저 보는 당신의 모습은 「${ieyo(`${TEN_GOD_DECK[monthP.stemGod].title}」`)}.` : "",
        ].filter(Boolean),
        badges: [`월지 ${monthP.branchKo} · ${monthP.branchGod}`],
      },
      {
        title: "빛이 나는 분야",
        scene: { kind: "stairs", step: Math.min(4, g[a.dominantGroup]) },
        bubbles: [
          `이런 분야에서 특히 빛이 나요: **${work.jobs.join(", ")}**.`,
          `일할 때 당신의 무기 — **${god.strength}**\n조심할 점 — **${god.weakness}**\n스트레스를 받으면 — ${god.stress}`,
          a.strength.strong
            ? "당신은 **신강(身强)**한 사주예요. 내 힘이 세서 스스로 판을 짜고 책임지는 자리에서 잘 풀려요. 예를 들어 팀장, 대표, 프리랜서처럼 결정권이 있는 역할이에요."
            : "당신은 **신약(身弱)**한 사주예요. 혼자 버티기보다 좋은 조직·스승·동료의 힘을 빌릴 때 잘 풀려요. 예를 들어 시스템이 잘 갖춰진 회사나 믿을 만한 파트너와 함께하는 일이에요.",
        ],
      },
      {
        title: "나를 살리는 업종과 방향",
        scene: { kind: "compass", el: a.yongshin, direction: kaeun.direction },
        bubbles: [
          `당신에게 가장 필요한 기운(용신)은 **${ieyo(`${elName(a.yongshin)}**`)}. 이 오행에 속한 업종에서 일하면 일이 덜 지치고 운이 붙어요.`,
          `**${elName(a.yongshin)}의 업종** — ${EL_INDUSTRY[a.yongshin]}`,
          `용신을 도와주는 **${elName(a.heeshin)}의 업종**(${EL_INDUSTRY[a.heeshin]})도 잘 맞아요. 반대로 **${elName(a.gishin)}의 업종**(${EL_INDUSTRY[a.gishin]})은 같은 노력에도 더 지치기 쉬워요.`,
          `일터의 방향도 참고해 보세요. 집에서 **${kaeun.direction}**에 있는 직장, 책상을 그쪽으로 두는 배치가 당신에게 좋은 기운을 줘요.`,
        ],
      },
      {
        title: "대운으로 보는 커리어의 계절",
        scene: daeyunScene(workDY),
        bubbles: [
          "커리어는 10년 단위의 **대운**을 따라 계절이 바뀌어요. 관성의 대운에는 자리와 책임이, 인성의 대운에는 공부와 자격이, 식상의 대운에는 변화와 독립이 찾아와요.",
          daeyunLines(workDY, { chance: "자리·명예가 올라가는 계절", prepare: "실력을 쌓고 방향을 트는 계절", careful: "경쟁이 심해 버티는 계절" }),
          "📍 표시가 지금의 대운이에요. 큰 나무가 선 대운에 승진·이직·창업 같은 승부를 걸어 보세요.",
        ],
      },
      {
        title: "올해와 내년의 일 점수",
        scene: { kind: "duoScore", a: d0.areas.work.score, b: d1.areas.work.score, labelA: `${d0.year}년`, labelB: `${d1.year}년`, heart: false },
        bubbles: [
          `${areaLine(d0, "work")}\n${GOD_AREA[d0.god].work}`,
          `${areaLine(d1, "work")}\n${GOD_AREA[d1.god].work}`,
          `면접·승진·계약처럼 중요한 일은 올해 **${topMonths(d0, ["관성", "인성"])}**, 내년 **${topMonths(d1, ["관성", "인성"])}**에 잡아 보세요.`,
        ],
      },
    ],
  };

  return [nextYear, year, month, money, love, workStory, marriage, children];
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
