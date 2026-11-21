/**
 * 가족 사주 — 아이·부모·형제를 더해 가족 전체의 오행과 서로의 관계를 본다.
 */
import { BRANCH_ANIMAL, ELEMENTS, ELEMENT_INFO, STEM_KO, type Element } from "../saju/constants";
import { compare, type BranchRelation, type StemRelation } from "../saju/compat";
import type { Analysis } from "../saju/engine";
import { DAY_STEM_DECK, KAEUN_DECK } from "../deck";
import { STRENGTH_ESSAY, YONG_ESSAY } from "./essays";
import { BRANCH_CHILD } from "./rich";
import { EL_MEANING, PARENT_TIP, elName, eun, iga, ieyo, wa } from "./text";
import type { Story, StoryPage } from "./types";

export type Relation = "child" | "parent" | "sibling";
export const RELATION_LABEL: Record<Relation, string> = { child: "자녀", parent: "부모님", sibling: "형제자매" };

export interface Member {
  name: string;
  relation: Relation;
  a: Analysis;
}

const STEM_REL: Record<StemRelation, (x: string, y: string) => string> = {
  hap: (x, y) => `${wa(x)} ${y}의 일간은 **천간합**이에요. 말하지 않아도 마음이 통하는 사이예요. 둘이 있으면 편안하고, 서로를 유난히 아껴요.`,
  same: (x, y) => `${wa(x)} ${y}의 일간은 **같은 오행**이에요. 닮은 점이 많아 서로를 잘 이해하지만, 같은 고집으로 부딪히기도 해요. 닮았다는 것을 인정하면 다툼이 줄어요.`,
  "gen-ab": (x, y) => `${x}의 일간이 ${y}의 일간을 **살려 주는(생하는)** 관계예요. ${iga(x)} 주고 ${iga(y)} 받는 흐름이라, ${iga(x)} 자연스럽게 챙기고 뒷바라지하는 사이가 돼요. 주는 쪽이 지치지 않게 가끔은 받는 쪽이 고마움을 표현해야 해요.`,
  "gen-ba": (x, y) => `${y}의 일간이 ${x}의 일간을 **살려 주는(생하는)** 관계예요. ${iga(y)} ${x}에게 힘을 주는 사이예요. ${eun(x)} ${y}와 함께 있을 때 기운이 나요.`,
  "ctrl-ab": (x, y) => `${x}의 일간이 ${y}의 일간을 **다스리는(극하는)** 관계예요. ${iga(x)} ${y}에게 기준을 세워 주고 이끄는 사이예요. 다만 ${x}의 말이 ${y}에게는 잔소리나 압박으로 들리기 쉬워요. 지시보다 질문으로 말해 보세요.`,
  "ctrl-ba": (x, y) => `${y}의 일간이 ${x}의 일간을 **다스리는(극하는)** 관계예요. ${iga(y)} ${x}의 마음을 긴장시키고 단련하는 사이예요. ${eun(x)} ${y} 앞에서 유난히 조심하게 되거나, ${y} 때문에 더 노력하게 돼요.`,
};

const BRANCH_REL: Record<BranchRelation, string> = {
  hap: "일지끼리는 **육합**이에요. 함께 지내는 생활 리듬이 잘 맞아 한집에 있어도 편안해요.",
  samhap: "일지끼리는 **삼합**의 짝이에요. 같은 목표가 있을 때 손발이 잘 맞아요.",
  same: "일지가 같은 글자예요. 생활 습관이 닮았지만 같은 때에 함께 예민해져요.",
  clash: "일지끼리는 **충**이에요. 생활 속도와 방식이 달라 부딪히기 쉬워요. 각자의 공간과 시간을 인정해 주는 것이 가장 좋은 처방이에요.",
  wonjin: "일지끼리는 **원진**이에요. 큰 다툼은 없어도 서운함이 쌓이기 쉬워요. 고마운 것을 자주 말로 꺼내세요.",
  none: "일지끼리는 크게 끌거나 부딪히지 않아요. 무난하게 지내는 사이예요.",
};

const CHILD_NEED: Record<Element, string> = {
  wood: "이 아이에게는 **자라는 경험**이 필요해요. 새로운 것을 배우고 조금씩 느는 것을 스스로 확인할 때 기운이 살아요. 아침 활동, 책, 식물 기르기, 숲 체험이 좋아요.",
  fire: "이 아이에게는 **표현하고 인정받는 경험**이 필요해요. 사람들 앞에서 발표하고 칭찬받을 때 기운이 살아요. 햇빛 아래 뛰어놀기, 무대에 서는 활동, 밝은 방이 좋아요.",
  earth: "이 아이에게는 **안정된 규칙**이 필요해요. 같은 시간에 먹고 자고, 약속이 지켜질 때 마음이 편안해져요. 이사나 전학이 잦으면 힘들어해요. 흙 놀이, 요리, 꾸준한 습관이 좋아요.",
  metal: "이 아이에게는 **분명한 기준**이 필요해요. 되는 것과 안 되는 것이 일관될 때 안심해요. 정리정돈, 규칙이 뚜렷한 운동(태권도·수영), 스스로 끝맺는 경험이 좋아요.",
  water: "이 아이에게는 **조용히 생각할 시간**이 필요해요. 일정을 빽빽하게 채우면 금방 지쳐요. 충분한 잠, 혼자 책 읽는 시간, 물놀이, 재촉하지 않는 대화가 좋아요.",
};

function pairText(x: Member | { name: string; a: Analysis }, y: { name: string; a: Analysis }): string[] {
  const c = compare(x.a, y.a);
  return [STEM_REL[c.stem](x.name, y.name), BRANCH_REL[c.dayBranch], c.bFillsA ? `${y.name}의 사주에는 ${x.name}에게 필요한 **${elName(x.a.yongshin)}** 기운이 넉넉해요. ${eun(x.name)} ${y.name} 곁에서 편안함을 느껴요.` : ""].filter(Boolean);
}

export function buildFamilyStory(me: { name: string; a: Analysis }, partner: { name: string; a: Analysis } | null, members: Member[]): Story {
  const parents = partner ? [me, partner] : [me];
  const everyone = [...parents, ...members];
  const sum = (list: { a: Analysis }[]) => Object.fromEntries(ELEMENTS.map((e) => [e, list.reduce((s, p) => s + p.a.elementCounts[e], 0)])) as Record<Element, number>;
  const before = sum(parents);
  const after = sum(everyone);
  const top = ELEMENTS.reduce((x, y) => (after[y] > after[x] ? y : x));
  const low = ELEMENTS.reduce((x, y) => (after[y] < after[x] ? y : x));
  const filler = members.find((m) => m.a.elementCounts[low] >= 2);

  const pages: StoryPage[] = [
    {
      title: "우리 가족의 오행 지도",
      scene: { kind: "balance", before, after, yong: low },
      bubbles: [
        "가족은 한집에서 기운을 섞으며 살아요. 그래서 한 사람 한 사람의 사주만큼 **가족 전체의 오행**이 집안 분위기를 만들어요. 그림에서 짙은 막대는 부부(또는 나)의 오행, 점선으로 얹힌 부분은 가족이 더해 준 오행이에요.",
        `가족 ${everyone.length}명의 오행을 모두 더하면 ${ELEMENTS.map((e) => `${ELEMENT_INFO[e].ko} ${after[e]}`).join(" · ")}이에요.`,
        `가장 많은 기운은 **${ieyo(`${elName(top)}**`)}. 이 집에는 ${EL_MEANING[top]}이 넘쳐요. 그 기운이 집안의 장점이 되지만, 지나치면 모두가 같은 방향으로 치우치기 쉬워요.`,
        `가장 적은 기운은 **${ieyo(`${elName(low)}**`)}. 가족 모두에게 ${EL_MEANING[low]}이 모자라기 쉬워요. 집 안에 ${KAEUN_DECK[low].color} 계열의 색을 들이고, 가족이 함께 「${KAEUN_DECK[low].habit}」 같은 활동을 하면 균형이 맞아요.`,
        filler ? `반가운 점은 ${filler.name}의 사주에 이 모자란 기운이 넉넉하다는 거예요. ${iga(filler.name)} 이 집의 균형을 잡아 주는 사람이에요.` : "",
      ].filter(Boolean),
      badges: [`많은 기운 ${ELEMENT_INFO[top].ko}`, `적은 기운 ${ELEMENT_INFO[low].ko}`],
    },
  ];

  for (const m of members) {
    const deck = DAY_STEM_DECK[m.a.dayStem];
    const day = m.a.pillars.find((p) => p.key === "day")!;
    const hour = m.a.pillars.find((p) => p.key === "hour");
    const ilgan = `${STEM_KO[m.a.dayStem]}${ELEMENT_INFO[m.a.dayEl].ko}`;
    pages.push({
      title: `${m.name} (${RELATION_LABEL[m.relation]}) — ${ilgan} 일간`,
      scene: { kind: "cover", el: m.a.dayEl, stem: m.a.dayStem, branch: m.a.dayBranch, emoji: BRANCH_ANIMAL[m.a.dayBranch].emoji },
      bubbles: [
        `${eun(m.name)} **${deck.image} 같은 ${ilgan} 일간**이에요. 타고난 열쇳말은 「${deck.keywords[0]}」, 「${ieyo(`${deck.keywords[1]}」`)}. 「${deck.line}」, 이 한 문장이 잘 어울리는 사람이에요.`,
        `일주는 **${day.stemKo}${day.branchKo}**, ${ieyo(`${deck.color} ${BRANCH_ANIMAL[m.a.dayBranch].ko}`)}. 사주에서 가장 센 기운은 **${m.a.dominantGroup}**이고, ${m.a.strength.strong ? "기운이 넉넉한 **신강**한 사주예요." : "섬세한 **신약**한 사주예요."}`,
        ...(m.a.strength.strong ? STRENGTH_ESSAY.strong.slice(1) : STRENGTH_ESSAY.weak.slice(1)),
        m.relation === "child" ? CHILD_NEED[m.a.yongshin] : `${m.name}에게 필요한 기운은 **${ieyo(`${elName(m.a.yongshin)}**`)}. ${YONG_ESSAY[m.a.yongshin][0]}`,
        m.relation === "child" && hour ? `태어난 시간으로 보면 — ${BRANCH_CHILD[hour.branch].replace("자녀 자리가", "시지가").replace(/아이와 인연이 있어요/, "아이예요")}` : "",
      ].filter(Boolean),
      badges: [`용신 ${elName(m.a.yongshin)}`, m.a.strength.strong ? "신강" : "신약"],
    });
    pages.push({
      title: `${m.name}와 우리`.replace(`${m.name}와`, wa(m.name)),
      scene: { kind: "family", kids: m.relation === "child" ? 1 : 2 },
      bubbles: [
        `**${me.name} ↔ ${m.name}**`,
        ...pairText(me, m),
        ...(partner ? [`**${partner.name} ↔ ${m.name}**`, ...pairText(partner, m)] : []),
        ...(partner
          ? [
              (() => {
                const sa = compare(me.a, m.a).score;
                const sb = compare(partner.a, m.a).score;
                return Math.abs(sa - sb) < 5
                  ? `사주로 보면 ${m.name}와의 궁합은 두 사람이 비슷해요(${me.name} ${sa}° · ${partner.name} ${sb}°).`.replace(`${m.name}와의`, `${wa(m.name)}의`)
                  : `사주로 보면 ${m.name}와 더 수월하게 통하는 사람은 **${sa > sb ? me.name : partner.name}** 쪽이에요(${me.name} ${sa}° · ${partner.name} ${sb}°). ${m.relation === "child" ? `어려운 이야기는 ${sa > sb ? me.name : partner.name} 쪽에서 먼저 꺼내고, 다른 한 사람은 옆에서 받쳐 주세요.` : ""}`.replace(`${m.name}와 더`, `${wa(m.name)} 더`);
              })(),
            ]
          : []),
        m.relation === "child" ? `부모로서 — ${PARENT_TIP[me.a.dayStem]}` : "",
      ].filter(Boolean),
    });
  }

  if (members.length === 0)
    pages.push({
      title: "가족을 추가해 보세요",
      scene: { kind: "nest", eggs: 0 },
      bubbles: ["아이, 부모님, 형제자매의 생년월일을 더하면 한 사람씩의 성향과 필요한 기운, 그리고 우리와의 관계를 풀어 드려요."],
    });

  return { id: "family", title: "우리 가족", icon: "👨‍👩‍👧", tagline: `${everyone.length}명 · ${ELEMENT_INFO[top].ko} 많고 ${ELEMENT_INFO[low].ko} 적음`, pages };
}
