/**
 * 완성된 이야기에 구체적인 풀이(일간·지지·십성별 생활 장면과 실천 목록)를 덧붙인다.
 */
import { BRANCH_ANIMAL, ELEMENT_INFO, STEM_KO, type TenGod } from "../saju/constants";
import type { Compat } from "../saju/compat";
import type { Analysis } from "../saju/engine";
import { EL_INDUSTRY } from "./detail";
import { BRANCH_CHILD, BRANCH_SPOUSE, GOD_DO3, GOD_DONT3, GOD_JOBS, MONEY_PLAN, STEM_DETAIL, matchLetters } from "./rich";
import { MONEY_STORY, elName, eul, iga, ieyo, wa, type MoneyType } from "./text";
import type { Scene, Story, StoryPage } from "./types";

const ilgan = (x: Analysis) => `${STEM_KO[x.dayStem]}${ELEMENT_INFO[x.dayEl].ko}`;

function todoPages(god: TenGod, when: string): StoryPage[] {
  return [
    {
      title: `${when} 꼭 해 볼 일 세 가지`,
      scene: { kind: "dodont", mode: "do", icons: ["✍️", "🏃", "🤝"] },
      bubbles: [`${when}의 손님은 **${ieyo(`${god}**`)}. 이 기운을 잘 쓰는 구체적인 방법이에요.`, ...GOD_DO3[god].map((x, i) => `**${i + 1}.** ${x}`)],
    },
    {
      title: `${when} 피해야 할 일 세 가지`,
      scene: { kind: "dodont", mode: "dont", icons: ["💸", "🗯️", "⏳"] },
      bubbles: [`**${god}**의 기운이 지나치면 생기는 실수예요. 미리 알고 피하세요.`, ...GOD_DONT3[god].map((x, i) => `**${i + 1}.** ${x}`)],
    },
  ];
}

export interface PersonalExtra {
  yearGod: TenGod;
  nextYearGod: TenGod;
  monthGod: TenGod;
  moneyType: MoneyType;
  childCount: number;
}

/** 혼자 보는 이야기 8권에 덧붙이기 */
export function enrichPersonal(a: Analysis, stories: Record<Story["id"], Story | undefined>, x: PersonalExtra) {
  const { year, nextYear, month, money, love, work, marriage, children } = stories;
  const day = a.pillars.find((p) => p.key === "day")!;
  const monthP = a.pillars.find((p) => p.key === "month")!;
  const hour = a.pillars.find((p) => p.key === "hour");
  const stemScene: Scene = { kind: "guest", el: a.dayEl, glyph: a.dayStem };
  const sd = STEM_DETAIL[a.dayStem];
  const name = `${ilgan(a)} 일간`;

  if (year) year.pages.splice(year.pages.length - 1, 0, ...todoPages(x.yearGod, "올해"));
  if (nextYear) nextYear.pages.splice(nextYear.pages.length - 1, 0, ...todoPages(x.nextYearGod, "내년"));
  if (month) month.pages.push(...todoPages(x.monthGod, "이번 달"));

  if (money) {
    money.pages.splice(1, 0, { title: `${name}의 돈 습관`, scene: stemScene, bubbles: sd.money });
    money.pages.push({
      title: "오늘부터 하는 재물 실천 계획",
      scene: { kind: "dodont", mode: "do", icons: ["🏦", "📒", "🎯", "📈"] },
      bubbles: ["당신의 재물 그릇에 맞춘 실천 계획이에요. 위에서부터 차례로 해 보세요.", ...MONEY_PLAN[x.moneyType]],
    });
  }

  if (love) {
    const ml = matchLetters(a.dayStem, a.dayBranch);
    love.pages.splice(1, 0, { title: `${name}의 연애`, scene: stemScene, bubbles: sd.love });
    love.pages.splice(love.pages.length - 1, 0, {
      title: "나와 합이 되는 글자, 부딪히는 글자",
      scene: { kind: "bench" },
      bubbles: [
        "사주에서 인연은 글자끼리의 **합(合)**과 **충(沖)**으로 봐요. 상대의 사주에 아래 글자가 있으면 그 성질이 관계에 나타나요. 띠는 태어난 해의 글자라서 가장 쉽게 확인할 수 있어요.",
        `💞 **천간합** — 내 일간 ${wa(`${STEM_KO[a.dayStem]}(${a.dayStem})`)} 합이 되는 일간은 **${ieyo(`${ml.stemHap.join(", ")}**`)}. 이 일간을 가진 사람과는 처음부터 묘하게 편하고 마음이 통해요.`,
        `🤝 **육합** — 내 배우자 자리 ${wa(`${day.branchKo}(${day.branch})`)} 합이 되는 글자는 **${ieyo(`${ml.hap.join(", ")}**`)}. 함께 사는 리듬이 잘 맞아요. 예를 들어 쉬는 방식, 생활 습관이 비슷해 편안해요.`,
        `🎯 **삼합** — 같은 무리를 이루는 글자는 **${ieyo(`${ml.samhap.join(", ")}**`)}. 같은 목표를 향해 달리는 동지 같은 인연이에요.`,
        `⚡ **충** — 부딪히는 글자는 **${ieyo(`${ml.clash.join(", ")}**`)}. 끌림은 강하지만 생활 속도가 달라요. 예를 들어 한 사람은 서두르고 한 사람은 느긋해서 자주 부딪혀요.`,
        `🌫️ **원진** — 서운함이 쌓이기 쉬운 글자는 **${ieyo(`${ml.wonjin.join(", ")}**`)}. 큰 싸움은 없어도 말 한마디가 오래 남는 인연이에요.`,
        "띠 하나로 인연을 정하지는 않아요. 충이나 원진이 있어도 다른 글자의 합이 받쳐 주면 좋은 부부가 돼요. 어디서 부딪힐지 미리 아는 용도로만 쓰세요.",
      ],
    });
  }

  if (work) {
    work.pages.splice(1, 0, { title: `${name}이 일하는 방식`, scene: stemScene, bubbles: sd.work });
    work.pages.splice(4, 0, {
      title: "구체적으로 어울리는 직업",
      scene: { kind: "desk", el: a.dayEl },
      bubbles: [
        `사주에서 가장 힘이 센 십성인 **${eul(`${a.dominantGod}**`)} 기준으로 보면 이런 직업이 잘 맞아요.`,
        `**${GOD_JOBS[a.dominantGod]}**`,
        monthP.branchGod !== a.dominantGod
          ? `사회적 무대인 월지의 **${monthP.branchGod}** 기준으로는 이런 직업도 좋아요.\n**${GOD_JOBS[monthP.branchGod]}**`
          : "가장 센 십성과 월지의 십성이 같아서, 위 직업들과의 궁합이 특히 또렷해요.",
        `여기에 용신 **${elName(a.yongshin)}**의 업종(${EL_INDUSTRY[a.yongshin]})이 겹치는 일을 고르면 가장 좋아요. 예를 들어 같은 영업이라도 용신 업종의 영업을 고르는 식이에요.`,
      ],
    });
  }

  if (marriage) marriage.pages.splice(1, 0, { title: `배우자 자리의 ${BRANCH_ANIMAL[a.dayBranch].ko}, 내가 만나는 배우자`, scene: { kind: "table" }, bubbles: BRANCH_SPOUSE[a.dayBranch] });

  if (children && hour)
    children.pages.splice(2, 0, {
      title: `자녀 자리의 ${BRANCH_ANIMAL[hour.branch].ko}, 내가 만나는 아이`,
      scene: { kind: "family", kids: Math.max(1, x.childCount) },
      bubbles: [BRANCH_CHILD[hour.branch], "시지는 자녀의 성향만이 아니라 내 노년의 모습도 보여 줘요. 이 글자의 성질대로 나이 들수록 삶이 흘러가기 쉬워요."],
    });
}

export interface CoupleExtra {
  nameA: string;
  nameB: string;
  gods: { year: [TenGod, TenGod]; nextYear: [TenGod, TenGod]; month: [TenGod, TenGod] };
  moneyTypes: [MoneyType, MoneyType];
}

/** 부부 관점 카드 8장에 덧붙이기 */
export function enrichCouple(c: Compat, stories: Record<Story["id"], Story | undefined>, x: CoupleExtra) {
  const { a, b } = c;
  const A = x.nameA;
  const B = x.nameB;
  const subj = (n: string) => (n === "나" ? "내가" : iga(n));
  const duoStem: Scene = { kind: "stems", a: a.dayStem, b: b.dayStem, elA: a.dayEl, elB: b.dayEl, mode: c.stem };
  const each = (k: "money" | "love" | "work") => [`**${A} · ${ilgan(a)} 일간**`, ...STEM_DETAIL[a.dayStem][k], `**${B} · ${ilgan(b)} 일간**`, ...STEM_DETAIL[b.dayStem][k]];
  const list = (items: string[]) => items.map((t, i) => `${i + 1}. ${t}`).join("\n");
  const personal = ([ga, gb]: [TenGod, TenGod], when: string): StoryPage => ({
    title: `${when} 각자 챙길 일`,
    scene: { kind: "desk", el: a.dayEl },
    bubbles: [
      `부부가 함께 할 일에 앞서, 각자의 사주가 ${when} 요구하는 숙제예요. 서로의 목록을 알아 두면 도와주기 쉬워요.`,
      `**${subj(A)} 해 볼 일 (${ga}의 기운)**\n${list(GOD_DO3[ga])}`,
      `**${subj(A)} 피할 일**\n${list(GOD_DONT3[ga])}`,
      `**${subj(B)} 해 볼 일 (${gb}의 기운)**\n${list(GOD_DO3[gb])}`,
      `**${subj(B)} 피할 일**\n${list(GOD_DONT3[gb])}`,
    ],
  });
  const beforeDo = (s: Story | undefined, page: StoryPage) => s && s.pages.splice(s.pages.length - 2, 0, page);

  beforeDo(stories.nextYear, personal(x.gods.nextYear, "내년에"));
  beforeDo(stories.year, personal(x.gods.year, "올해"));
  beforeDo(stories.month, personal(x.gods.month, "이번 달에"));

  const [tA, tB] = x.moneyTypes;
  if (stories.money) {
    stories.money.pages.splice(1, 0, { title: "일간으로 보는 두 사람의 돈 습관", scene: duoStem, bubbles: each("money") });
    beforeDo(stories.money, {
      title: "각자의 그릇에 맞춘 실천 계획",
      scene: { kind: "chest", fill: 0.8 },
      bubbles: [
        `**${A} — 「${MONEY_STORY[tA].title}」**`,
        ...MONEY_PLAN[tA],
        ...(tA === tB ? ["두 사람의 그릇이 같아서 위 계획을 함께 실천하면 돼요."] : [`**${B} — 「${MONEY_STORY[tB].title}」**`, ...MONEY_PLAN[tB]]),
      ],
    });
  }
  stories.love?.pages.splice(1, 0, { title: "일간으로 보는 두 사람의 연애", scene: duoStem, bubbles: each("love") });
  stories.work?.pages.splice(1, 0, { title: "일간으로 보는 두 사람의 일하는 방식", scene: duoStem, bubbles: each("work") });
  stories.marriage?.pages.splice(1, 0, {
    title: "배우자 자리로 보는 서로의 모습",
    scene: { kind: "bench" },
    bubbles: [
      `배우자 자리(일지)의 글자는 내가 만나는 배우자의 모습이에요. ${A}의 일지에 적힌 모습이 ${B}에게서, ${B}의 일지에 적힌 모습이 ${A}에게서 얼마나 보이는지 견주어 보세요.`,
      `**${A}의 사주가 말하는 배우자**`,
      ...BRANCH_SPOUSE[a.dayBranch],
      `**${B}의 사주가 말하는 배우자**`,
      ...BRANCH_SPOUSE[b.dayBranch],
    ],
  });
  const hourA = a.pillars.find((p) => p.key === "hour");
  const hourB = b.pillars.find((p) => p.key === "hour");
  if (stories.children && (hourA || hourB))
    stories.children.pages.splice(2, 0, {
      title: "자녀 자리로 보는 우리 아이",
      scene: { kind: "family", kids: 2 },
      bubbles: [
        ...(hourA ? [`**${A}의 사주로 본 아이**`, BRANCH_CHILD[hourA.branch]] : []),
        ...(hourB ? [`**${B}의 사주로 본 아이**`, BRANCH_CHILD[hourB.branch]] : []),
        hourA && hourB && hourA.branch !== hourB.branch ? "두 사람의 자녀 자리가 달라요. 아이에게서 두 가지 모습이 모두 보이거나, 아이마다 다른 모습이 나타나기 쉬워요." : "",
      ].filter(Boolean),
    });
}

/** 이야기 배열을 id로 찾기 쉽게 */
export const byId = (list: Story[]) => Object.fromEntries(list.map((s) => [s.id, s])) as Record<Story["id"], Story | undefined>;
