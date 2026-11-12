/**
 * 각 주제 칸에 전문가 해설(원리 → 해석 → 조언)을 붙여 글을 풍성하게 만든다.
 */
import type { TenGod } from "../saju/constants";
import type { Compat } from "../saju/compat";
import type { Analysis } from "../saju/engine";
import { GOD_DEEP, GOD_ESSAY, PRINCIPLE, STRENGTH_ESSAY, YONG_ESSAY } from "./essays";
import type { Story, StoryPage } from "./types";

type Stories = Record<Story["id"], Story | undefined>;
type Gods = { god: TenGod; branchGod: TenGod };

const find = (s: Story | undefined, test: RegExp | number): StoryPage | undefined =>
  !s ? undefined : typeof test === "number" ? s.pages[test] : s.pages.find((p) => test.test(p.title));
const pre = (p: StoryPage | undefined, ...paras: string[]) => p && p.bubbles.unshift(...paras);
const post = (p: StoryPage | undefined, ...paras: string[]) => p && p.bubbles.push(...paras);
const strength = (a: Analysis) => (a.strength.strong ? STRENGTH_ESSAY.strong : STRENGTH_ESSAY.weak);
const deepAll = (g: TenGod) => [`💼 **일** — ${GOD_DEEP[g].work}`, `💰 **돈** — ${GOD_DEEP[g].money}`, `🌸 **관계** — ${GOD_DEEP[g].love}`, `🩺 **건강** — ${GOD_DEEP[g].health}`];

function closing(a: Analysis, s: Story | undefined, topic: string) {
  if (!s) return;
  s.pages.push({
    title: "용신으로 마무리하는 조언",
    scene: { kind: "lantern", el: a.yongshin },
    bubbles: [
      `${topic} 이야기의 끝은 언제나 용신으로 돌아와요. 용신은 내 사주의 균형을 잡아 주는 기운이라, 어떤 분야의 고민이든 용신을 채우는 쪽으로 움직이면 실마리가 풀려요.`,
      ...YONG_ESSAY[a.yongshin],
    ],
  });
}

function deepenYear(a: Analysis, s: Story | undefined, g: Gods, label: string) {
  if (!s) return;
  post(find(s, 0), ...PRINCIPLE.seun);
  post(
    find(s, /의 손님/),
    `이제 ${label}의 주인공인 이 별을 깊이 풀어 볼게요.`,
    ...GOD_ESSAY[g.god],
    ...(g.branchGod !== g.god ? [`땅의 기운으로 함께 오는 **${g.branchGod}**도 알아 두면 좋아요. 한 해의 뒤 절반으로 갈수록 이 기운이 진해져요.`, ...GOD_ESSAY[g.branchGod].slice(0, 2)] : []),
  );
  pre(find(s, /내 사주와 만나는 자리/), ...PRINCIPLE.interaction);
  pre(find(s, /오행 저울/), ...PRINCIPLE.balance);
  post(find(s, /오행 저울/), ...strength(a), ...YONG_ESSAY[a.yongshin]);
  post(find(s, /^일·직장/), GOD_DEEP[g.god].work, ...(g.branchGod !== g.god ? [`땅의 **${g.branchGod}** 기운으로 보면 — ${GOD_DEEP[g.branchGod].work}`] : []));
  post(find(s, /^재물/), GOD_DEEP[g.god].money, ...(g.branchGod !== g.god ? [`땅의 **${g.branchGod}** 기운으로 보면 — ${GOD_DEEP[g.branchGod].money}`] : []));
  post(find(s, /^연애·관계/), GOD_DEEP[g.god].love, ...(g.branchGod !== g.god ? [`땅의 **${g.branchGod}** 기운으로 보면 — ${GOD_DEEP[g.branchGod].love}`] : []));
  post(find(s, /^건강/), GOD_DEEP[g.god].health);
  pre(find(s, /월별 점수 · 1~6월/), ...PRINCIPLE.monthly);
}

export function deepenPersonal(a: Analysis, st: Stories, x: { year: Gods; nextYear: Gods; month: Gods }) {
  deepenYear(a, st.year, x.year, "올해");
  deepenYear(a, st.nextYear, x.nextYear, "내년");

  post(find(st.month, 0), ...PRINCIPLE.monthly);
  post(find(st.month, /손님/), "이 별을 조금 더 깊이 풀어 볼게요.", ...GOD_ESSAY[x.month.god]);
  pre(find(st.month, /내 사주와 만나는 자리/), ...PRINCIPLE.interaction);
  post(find(st.month, /일·돈·사람/), "분야별로 더 자세히 보면 이래요.", ...deepAll(x.month.god));

  post(find(st.money, 0), ...PRINCIPLE.wealth, ...strength(a));
  post(find(st.money, /재물의 별이 놓인 자리/), ...PRINCIPLE.hidden);
  pre(find(st.money, /대운으로 보는/), ...PRINCIPLE.daeyun);
  post(find(st.money, /올해와 내년의 재물/), `**올해(${x.year.god}) 더 자세히** — ${GOD_DEEP[x.year.god].money}`, `**내년(${x.nextYear.god}) 더 자세히** — ${GOD_DEEP[x.nextYear.god].money}`);
  closing(a, st.money, "재물");

  post(find(st.love, 0), ...PRINCIPLE.love);
  post(find(st.love, /신살로 보는/), ...PRINCIPLE.hidden);
  post(find(st.love, /인연이 다가오는/), `**올해(${x.year.god})의 연애** — ${GOD_DEEP[x.year.god].love}`, `**내년(${x.nextYear.god})의 연애** — ${GOD_DEEP[x.nextYear.god].love}`);
  closing(a, st.love, "연애");

  post(find(st.work, 0), ...PRINCIPLE.work, ...strength(a));
  pre(find(st.work, /대운으로 보는/), ...PRINCIPLE.daeyun);
  post(find(st.work, /올해와 내년의 일/), `**올해(${x.year.god}) 더 자세히** — ${GOD_DEEP[x.year.god].work}`, `**내년(${x.nextYear.god}) 더 자세히** — ${GOD_DEEP[x.nextYear.god].work}`);
  closing(a, st.work, "직업");

  post(find(st.marriage, 0), ...PRINCIPLE.marriage);
  pre(find(st.marriage, /숨은 기운/), ...PRINCIPLE.hidden);
  pre(find(st.marriage, /만나는 시기/), ...PRINCIPLE.daeyun);
  closing(a, st.marriage, "부부");

  post(find(st.children, 0), ...PRINCIPLE.children);
  post(find(st.children, /좋은 부모/), ...strength(a));
  closing(a, st.children, "자녀");
}

export function deepenCouple(c: Compat, st: Stories, x: { nameA: string; nameB: string; year: [TenGod, TenGod]; nextYear: [TenGod, TenGod]; month: [TenGod, TenGod] }) {
  const { a, b } = c;
  const A = x.nameA;
  const B = x.nameB;
  const both = ([ga, gb]: [TenGod, TenGod]) =>
    ga === gb
      ? [`**두 사람 모두의 손님, ${ga}**`, ...GOD_ESSAY[ga]]
      : [`**${A}의 손님, ${ga}**`, ...GOD_ESSAY[ga], `**${B}의 손님, ${gb}**`, ...GOD_ESSAY[gb]];
  const bothDeep = ([ga, gb]: [TenGod, TenGod]) =>
    ga === gb ? [`**두 사람 모두 ${ga}의 흐름**`, ...deepAll(ga)] : [`**${A} · ${ga}의 흐름**`, ...deepAll(ga), `**${B} · ${gb}의 흐름**`, ...deepAll(gb)];

  for (const [s, gods] of [
    [st.year, x.year],
    [st.nextYear, x.nextYear],
  ] as const) {
    post(find(s, 0), ...PRINCIPLE.seun, "두 사람에게 온 손님을 한 사람씩 깊이 풀어 볼게요.", ...both([...gods]));
    pre(find(s, /한 배를 탄/), ...PRINCIPLE.coupleTiming);
    post(find(s, /분야별로 본/), "각자의 한 해를 분야별로 더 자세히 풀면 이래요. 상대의 흐름을 알아 두면 서운할 일이 줄어요.", ...bothDeep([...gods]));
    pre(find(s, /함께 보는 월별/), ...PRINCIPLE.monthly);
  }

  post(find(st.month, 0), ...PRINCIPLE.monthly, ...both(x.month));
  post(find(st.month, /일과 돈/), ...bothDeep(x.month));

  post(find(st.money, 0), ...PRINCIPLE.wealth);
  post(find(st.money, /누가 벌고/), `**${A}의 강약**`, ...(a.strength.strong ? STRENGTH_ESSAY.strong : STRENGTH_ESSAY.weak), `**${B}의 강약**`, ...(b.strength.strong ? STRENGTH_ESSAY.strong : STRENGTH_ESSAY.weak));

  post(find(st.love, 0), ...PRINCIPLE.love);
  pre(find(st.love, /서로에게 끌린/), ...PRINCIPLE.gunghap);

  post(find(st.work, 0), ...PRINCIPLE.work);

  post(find(st.marriage, 0), ...PRINCIPLE.marriage);
  pre(find(st.marriage, /부부궁의 합과 충/), ...PRINCIPLE.interaction);
  pre(find(st.marriage, /서로를 채우는 오행/), ...PRINCIPLE.balance);
  post(
    find(st.marriage, /서로를 채우는 오행/),
    `**${A}에게 필요한 기운**`,
    ...YONG_ESSAY[a.yongshin],
    ...(a.yongshin === b.yongshin ? [`${B}에게 필요한 기운도 같아요. 두 사람이 같은 습관을 함께 들이면 효과가 두 배가 돼요.`] : [`**${B}에게 필요한 기운**`, ...YONG_ESSAY[b.yongshin]]),
  );

  post(find(st.children, 0), ...PRINCIPLE.children);
}

/** 「우리 둘의 궁합」 그림책 */
export function deepenGunghap(s: Story): Story {
  post(find(s, 0), ...PRINCIPLE.gunghap);
  pre(find(s, /한 지붕 아래/), ...PRINCIPLE.marriage);
  pre(find(s, /함께 걷는 10년/), ...PRINCIPLE.coupleTiming);
  return s;
}
