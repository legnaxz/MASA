/**
 * 다툰 날 처방 — 오늘 두 사람의 기운을 보고, 누가 먼저 어떻게 말을 꺼낼지 알려 준다.
 */
import { BRANCH_KO, STEM_KO, TEN_GOD_GROUP, type TenGodGroup } from "../saju/constants";
import type { Compat } from "../saju/compat";
import { addDays, dayFlow } from "../saju/life";
import { GOD_MONTH_FLOW, PRINCIPLE } from "./essays";
import { LOVE_PATTERN, eun, iga, ieyo } from "./text";
import { scoreWord } from "./yearly";
import type { Story } from "./types";

/** 상대의 배우자 자리(일지 십성 그룹)에 맞춘 화해의 말 */
const SAY: Record<TenGodGroup, { open: string; why: string; avoid: string }> = {
  비겁: {
    open: "「네 말에도 맞는 부분이 있어. 내가 고집을 부렸어.」",
    why: "배우자 자리에 비겁이 있는 사람은 대등하게 존중받는 것이 가장 중요해요. 잘잘못을 가리기보다 상대의 입장을 인정하는 말이 통해요.",
    avoid: "「그러니까 내 말대로 하라고 했잖아」처럼 이기려는 말",
  },
  식상: {
    open: "「아까 내 말이 심했어. 많이 상했지?」",
    why: "배우자 자리에 식상이 있는 사람은 표현에 민감해요. 무엇을 잘못했는지보다 「어떤 말이 상처였는지」를 알아주는 것이 먼저예요.",
    avoid: "「그게 뭐가 그렇게 서운해?」처럼 감정을 깎아내리는 말",
  },
  재성: {
    open: "「앞으로 이렇게 바꿔 볼게. 이 부분은 내가 맡을게.」",
    why: "배우자 자리에 재성이 있는 사람은 말보다 구체적인 변화를 믿어요. 무엇을 언제 어떻게 바꿀지 분명히 말해 주세요.",
    avoid: "「미안하다고 했잖아」처럼 말로만 넘어가려는 태도",
  },
  관성: {
    open: "「내가 약속을 못 지켰어. 다음에는 꼭 이렇게 할게.」",
    why: "배우자 자리에 관성이 있는 사람은 책임과 약속을 중요하게 여겨요. 잘못을 분명히 인정하고 지킬 수 있는 약속 하나를 하세요.",
    avoid: "「다들 그렇게 살아」처럼 책임을 흐리는 말",
  },
  인성: {
    open: "「많이 서운했지. 네 마음부터 듣고 싶어.」",
    why: "배우자 자리에 인성이 있는 사람은 이해받고 품어지는 느낌이 필요해요. 해결책보다 먼저 들어 주는 것이 약이에요.",
    avoid: "「그래서 결론이 뭐야?」처럼 재촉하는 말",
  },
};

const subj = (n: string) => (n === "나" ? "내가" : iga(n));
const md = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일(${"일월화수목금토"[d.getDay()]})`;

export function buildFightStory(c: Compat, nameA: string, nameB: string, now: Date): Story {
  const { a, b } = c;
  const A = nameA || "나";
  const B = nameB || "상대";
  const ta = dayFlow(a, now);
  const tb = dayFlow(b, now);
  const dayA = a.pillars.find((p) => p.key === "day")!;
  const dayB = b.pillars.find((p) => p.key === "day")!;
  const gA = TEN_GOD_GROUP[dayA.branchGod];
  const gB = TEN_GOD_GROUP[dayB.branchGod];
  // 오늘 기운이 더 좋은 사람이 먼저 손을 내민다 (같으면 신강한 쪽)
  const aFirst = ta.score !== tb.score ? ta.score > tb.score : a.strength.strong;
  const [first, second, sayTo] = aFirst ? [A, B, SAY[gB]] : [B, A, SAY[gA]];
  const days = Array.from({ length: 8 }, (_, i) => {
    const d = addDays(now, i);
    const fa = dayFlow(a, d);
    const fb = dayFlow(b, d);
    return { d, fa, fb, min: Math.min(fa.score, fb.score), clash: fa.clashDay || fb.clashDay };
  });
  const best = [...days].filter((x) => !x.clash).sort((x, y) => y.min - x.min)[0] ?? days[0];
  const todayBad = ta.clashDay || tb.clashDay || Math.min(ta.score, tb.score) < 50;
  const palace =
    c.dayBranch === "clash"
      ? "두 사람의 배우자 자리는 **충**이에요. 다툼의 뿌리는 대개 「누가 옳은가」가 아니라 「속도와 방식이 다르다」는 데 있어요. 상대가 틀린 게 아니라 다른 것이라는 점을 먼저 떠올리세요."
      : c.dayBranch === "wonjin"
        ? "두 사람의 배우자 자리는 **원진**이에요. 큰 사건보다 쌓인 서운함이 터진 경우가 많아요. 오늘의 일만이 아니라 「그동안 말 못 한 것」이 있는지 물어봐 주세요."
        : c.dayBranch === "same"
          ? "두 사람의 배우자 자리는 같은 글자예요. 둘 다 같은 일에 동시에 예민해져요. 한 사람이 먼저 한 박자 쉬어 주면 금방 가라앉아요."
          : "두 사람의 배우자 자리는 크게 부딪히는 글자가 아니에요. 사주로 보면 이번 다툼은 뿌리 깊은 문제가 아니라 그날의 기운 탓일 가능성이 커요.";

  return {
    id: "fight",
    title: "다퉜을 때 처방",
    icon: "🕊️",
    tagline: `${md(now)} · ${A} ${ta.score} / ${B} ${tb.score}점`,
    pages: [
      {
        title: "오늘 두 사람의 기운",
        scene: { kind: "duoScore", a: ta.score, b: tb.score, labelA: A, labelB: B },
        bubbles: [
          `오늘 ${md(now)}의 일진은 **${ieyo(`${STEM_KO[ta.stem]}${BRANCH_KO[ta.branch]}일**`)}. 같은 날이라도 두 사람에게 다르게 작용해요.`,
          `${eun(A)} 오늘 **${ta.god}**의 날, **${ta.score}점(${scoreWord(ta.score)})**이에요. ${GOD_MONTH_FLOW[ta.god]}${ta.clashDay ? " 게다가 오늘은 배우자 자리에 **충**이 들어 평소보다 훨씬 예민해요." : ""}`,
          `${eun(B)} 오늘 **${tb.god}**의 날, **${tb.score}점(${scoreWord(tb.score)})**이에요. ${GOD_MONTH_FLOW[tb.god]}${tb.clashDay ? " 게다가 오늘은 배우자 자리에 **충**이 들어 평소보다 훨씬 예민해요." : ""}`,
          todayBad
            ? "오늘은 두 사람 중 적어도 한 사람의 기운이 흔들리는 날이에요. 지금 나온 말은 진심이라기보다 **날의 기운이 시킨 말**일 수 있어요. 오늘 결론을 내려 하지 마세요."
            : "오늘은 기운이 크게 나쁜 날이 아니에요. 차분히 이야기하면 오늘 안에 풀 수 있어요.",
        ],
      },
      {
        title: "왜 부딪혔을까",
        scene: { kind: "couple", variant: "river" },
        bubbles: [
          ...PRINCIPLE.interaction.slice(0, 1),
          palace,
          `${subj(A)} 예민해지는 지점은 **「${LOVE_PATTERN[gA].conflict}」**, ${subj(B)} 예민해지는 지점은 **「${ieyo(`${LOVE_PATTERN[gB].conflict}」**`)}. 이번 다툼이 이 지점을 건드리지 않았는지 떠올려 보세요. 대부분의 다툼은 겉의 이유와 달리 이 버튼이 눌려서 커져요.`,
          `이번 달 기운도 영향을 줘요. ${A}에게는 **${a.thisMonth.god}**의 달(${a.thisMonth.score}점), ${B}에게는 **${b.thisMonth.god}**의 달(${b.thisMonth.score}점)이에요.${a.thisMonth.clashDay || b.thisMonth.clashDay ? " 이번 달은 배우자 자리에 충이 들어 있어 평소라면 넘어갈 일도 커지기 쉬워요." : ""}`,
        ],
      },
      {
        title: "누가 먼저, 어떤 말로",
        scene: { kind: "bench" },
        bubbles: [
          `먼저 손을 내밀 사람은 **${ieyo(`${first}**`)}. 오늘 기운이 더 좋은 쪽이 먼저 다가가는 것이 순리예요. 기운이 낮은 사람은 지금 자기 마음을 다루기에도 벅차요.`,
          `${second}에게는 이렇게 시작해 보세요.\n**${sayTo.open}**`,
          sayTo.why,
          `${subj(second)} 조금 가라앉은 뒤에는 ${first}에게 이것을 돌려주세요: 「${LOVE_PATTERN[aFirst ? gA : gB].tip}」. ${first}의 사주가 가장 바라는 것이에요.`,
        ],
      },
      {
        title: "지금 하면 안 되는 말",
        scene: { kind: "dodont", mode: "dont", icons: ["🗯️", "📱", "🚪", "⚖️"] },
        bubbles: [
          `**${second}에게** — ${sayTo.avoid}`,
          `**${first}에게** — ${SAY[aFirst ? gA : gB].avoid}`,
          "「너는 항상」, 「너는 한 번도」로 시작하는 말은 둘 다 금지예요. 오늘의 일만 이야기하세요.",
          "헤어지자, 그만하자 같은 말은 기운이 낮은 날에 절대 꺼내지 마세요. 날이 바뀌면 후회하는 말이에요.",
          "메시지로 길게 싸우지 마세요. 글은 말투가 전해지지 않아 더 차갑게 읽혀요.",
        ],
      },
      {
        title: "화해하기 좋은 날",
        scene: {
          kind: "duoMonths",
          items: days.slice(0, 8).map((x) => ({ month: x.d.getDate(), a: x.fa.score, b: x.fb.score })),
        },
        bubbles: [
          "앞으로 여드레 동안 두 사람의 날짜별 기운이에요. 파란 막대가 " + A + ", 빨간 막대가 " + B + "예요. (가로축은 날짜)",
          days.map((x) => `${md(x.d)} · ${A} ${x.fa.score} / ${B} ${x.fb.score}${x.clash ? " ⚠ 배우자 자리 충" : ""}`).join("\n"),
          `🕊️ **차분히 이야기하기 가장 좋은 날은 ${md(best.d)}**이에요. 두 사람의 기운이 함께 높고 충이 없는 날이에요.${best.d.getTime() === days[0].d.getTime() ? " 바로 오늘이니 미루지 마세요." : " 오늘은 짧게 사과만 건네고, 깊은 이야기는 그날 하세요."}`,
          "이야기는 집 안보다 함께 걷는 길에서 하세요. 마주 보는 것보다 나란히 걷는 자세가 마음을 열어요.",
        ],
      },
    ],
  };
}
