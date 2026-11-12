/**
 * 커플 관점 카드 8장 — 두 사람의 사주를 겹쳐 보고,
 * 카드마다 「함께 해야 할 행동 / 피해야 할 행동」을 부부 관점에서 정리한다.
 */
import { BRANCH_ANIMAL, BRANCH_KO, STEM_KO, TEN_GOD_GROUP, type Element, type TenGod, type TenGodGroup } from "../saju/constants";
import type { BranchRelation, Compat } from "../saju/compat";
import type { Analysis, FlowKind, PeriodFlow } from "../saju/engine";
import { yearDetail, type Area, type YearDetail } from "../saju/period";
import { KAEUN_DECK, WORK_DECK } from "../deck";
import { moneyType } from "./build";
import { GROUP_PERSON } from "./detail";
import { CHILD_STYLE, LOVE_PATTERN, MONEY_STORY, PARENT_TIP, YEAR_MONEY, elName, eul, eun, iga, ieyo, wa } from "./text";
import { GOD_AREA, INTERACTION_EX, INTERACTION_NAME, scoreWord } from "./yearly";
import type { Scene, Story, StoryPage } from "./types";

interface N {
  n: string;
  i: string;
  eun: string;
  eul: string;
  wa: string;
}
function names(raw: string): N {
  const n = raw.trim();
  return { n, i: n === "나" ? "내가" : iga(n), eun: eun(n), eul: eul(n), wa: wa(n) };
}

const gz = (s: string, b: string) => STEM_KO[s] + BRANCH_KO[b];
const kindOfScore = (s: number): FlowKind => (s >= 68 ? "chance" : s >= 52 ? "prepare" : "careful");
const avg = (x: number, y: number) => Math.round((x + y) / 2);
const mlist = (ms: { month: number }[]) => ms.map((m) => `${m.month}월`).join(", ");

/* ---------- 십성별 부부 행동 ---------- */
const PARTNER_DO: Record<TenGod, (x: N, y: N) => string> = {
  비견: (x, y) => `${x.n}의 독립심이 커지는 때예요. ${y.i} 「혼자 해 봐, 내가 뒤에 있을게」 하고 믿고 맡겨 주세요.`,
  겁재: (x) => `${x.n}의 지출이 커지기 쉬운 때예요. 큰돈은 둘이 함께 확인하는 규칙을 만들어 두세요. 예를 들어 30만 원이 넘는 지출은 미리 말하기예요.`,
  식신: (x, y) => `${x.n}의 재능이 무르익는 때예요. ${y.i} 첫 번째 손님이 되어 결과물을 칭찬해 주세요.`,
  상관: (x, y) => `${x.n}의 말과 아이디어가 넘치는 때예요. ${y.i} 끝까지 들어 주는 청중이 되어 주세요. 밖에서 할 말을 집에서 먼저 연습하면 실수가 줄어요.`,
  편재: (x) => `${x.n}에게 큰 기회와 돈이 오가는 때예요. 들어온 돈의 일부는 바로 공동 저축으로 옮기기로 약속해 두세요.`,
  정재: (x) => `${x.n}의 수입이 안정되는 때예요. 둘의 저축 목표를 숫자로 정해 보세요. 예를 들어 전세 자금이나 여행 적금이에요.`,
  편관: (x, y) => `${x.n}의 어깨가 무거워지는 때예요. ${y.i} 집안일을 조금 더 맡고, 일주일에 하루는 아무것도 안 하는 날을 만들어 주세요.`,
  정관: (x, y) => `${x.n}에게 승진·시험·공식 자리가 찾아오는 때예요. ${y.i} 일정을 함께 챙기고 중요한 날의 컨디션을 도와주세요.`,
  편인: (x, y) => `${x.n}에게 혼자만의 시간이 필요한 때예요. ${y.i} 「요즘 무슨 생각해?」 하고 가볍게 물어 주되 재촉하지 마세요.`,
  정인: (x, y) => `${x.n}에게 배움과 문서의 복이 오는 때예요. 계약서와 시험 준비를 ${y.i} 함께 검토해 주면 실수가 줄어요.`,
};

const PARTNER_DONT: Record<TenGod, (x: N, y: N) => string> = {
  비견: (x) => `${x.n}의 결정을 「내 말대로 해」 하고 꺾으려 들지 마세요. 고집 싸움이 길어져요.`,
  겁재: (x) => `보증, 지인에게 돈 빌려주기, 동업은 피하세요. 특히 ${x.n} 혼자 결정하는 큰 지출은 금물이에요.`,
  식신: (x) => `${x.n}의 느긋함을 「게으르다」고 몰아붙이지 마세요. 결과가 익어 가는 중이에요.`,
  상관: (x) => `${x.n}의 말꼬리를 잡지 마세요. 다툴 때 「너는 항상」으로 시작하는 말은 둘 다 금지예요.`,
  편재: () => `잘 벌린다고 씀씀이를 함께 키우지 마세요. 무리한 투자와 충동적인 큰 구매를 조심하세요.`,
  정재: () => `지나친 절약으로 서로의 작은 즐거움까지 막지 마세요. 숨 쉴 용돈은 남겨 두세요.`,
  편관: (x) => `지친 ${x.n}에게 「그 정도는 다들 해」라는 말은 피하세요. 큰 결정을 몰아붙이는 것도 금물이에요.`,
  정관: (x) => `체면 때문에 무리한 지출을 하지 마세요. 예를 들어 과한 선물이나 차 바꾸기예요. ${x.n}에게 완벽을 요구하는 것도 피하세요.`,
  편인: (x) => `${x.n}의 혼자 있는 시간을 「나를 피한다」고 오해하지 마세요. 갑작스러운 진로 변경은 한 달은 함께 숙고하세요.`,
  정인: (x) => `${x.n}에게 모든 결정을 미루지 마세요. 양가 어른 말씀에만 기대어 둘의 결정을 뒤집는 것도 피하세요.`,
};

const ROLE: Record<TenGodGroup, string> = {
  비겁: "밀어붙이는 추진 담당",
  식상: "아이디어와 분위기 담당",
  재성: "돈과 현실 계산 담당",
  관성: "규칙과 일정 담당",
  인성: "정보 수집과 계획 담당",
};

const PALACE_SHORT: Record<BranchRelation, string> = {
  hap: "두 사람의 배우자 자리(일지)는 **육합**이에요. 함께 사는 리듬이 잘 맞는 부부합이에요. 예를 들어 잠드는 시간, 쉬는 방식이 크게 어긋나지 않아요.",
  samhap: "두 사람의 배우자 자리(일지)는 **삼합**의 짝이에요. 같은 목표를 세우면 힘이 몇 배가 돼요. 예를 들어 내 집 마련이나 사업처럼 함께 달리는 과제가 있을 때 가장 사이가 좋아요.",
  same: "두 사람의 배우자 자리(일지)는 같은 글자예요. 생활 방식이 닮아 편하지만, 같은 일에 동시에 예민해져요. 예를 들어 둘 다 피곤한 날 사소한 말로 부딪혀요.",
  clash: "두 사람의 배우자 자리(일지)는 **충**이에요. 생활 속도와 습관이 달라요. 예를 들어 한 사람은 아침형, 한 사람은 저녁형이거나, 정리 방식이 정반대예요.",
  wonjin: "두 사람의 배우자 자리(일지)는 **원진**이에요. 큰 다툼보다 이유 모를 서운함이 쌓여요. 예를 들어 답장이 늦은 것, 말투 하나가 오래 마음에 남아요.",
  none: "두 사람의 배우자 자리(일지)는 크게 끌거나 부딪히지 않아요. 잔잔하고 무난하지만, 그만큼 표현을 일부러 챙겨야 식지 않아요.",
};

/** 두 사람의 손님이 같으면 같은 문장이 두 번 나오지 않게 한다 */
function pairDo(ga: TenGod, gb: TenGod, A: N, B: N): string[] {
  return ga === gb
    ? [`✔ ${PARTNER_DO[ga](A, B)}`, `✔ ${B.n}에게도 같은 손님(${gb})이 찾아와요. 같은 일이 두 사람에게 함께 일어나니, 서로의 거울이 되어 지나친 부분을 먼저 알아봐 주세요.`]
    : [`✔ ${PARTNER_DO[ga](A, B)}`, `✔ ${PARTNER_DO[gb](B, A)}`];
}
function pairDont(ga: TenGod, gb: TenGod, A: N, B: N): string[] {
  return ga === gb
    ? [`✖ ${PARTNER_DONT[ga](A, B)}`, `✖ 같은 손님(${gb})이 겹쳐 둘이 동시에 같은 실수를 하기 쉬워요. 한 사람이 들뜨면 다른 한 사람은 반드시 브레이크 역할을 맡으세요.`]
    : [`✖ ${PARTNER_DONT[ga](A, B)}`, `✖ ${PARTNER_DONT[gb](B, A)}`];
}

const doScene = (icons: string[]): Scene => ({ kind: "dodont", mode: "do", icons });
const dontScene = (icons: string[]): Scene => ({ kind: "dodont", mode: "dont", icons });

/* ---------- 본문 ---------- */
export function buildCoupleCards(c: Compat, nameA: string, nameB: string): Story[] {
  const A = names(nameA || "나");
  const B = names(nameB || "상대");
  const { a, b } = c;
  const y0 = a.flows[0].year;
  const dA = [yearDetail(a, y0), yearDetail(a, y0 + 1)];
  const dB = [yearDetail(b, y0), yearDetail(b, y0 + 1)];
  const kA = KAEUN_DECK[a.yongshin];
  const kB = KAEUN_DECK[b.yongshin];
  const dayA = a.pillars.find((p) => p.key === "day")!;
  const dayB = b.pillars.find((p) => p.key === "day")!;

  const lead = (sa: number, sb: number): "both" | "a" | "b" | "low" | "even" =>
    sa >= 68 && sb >= 68 ? "both" : sa < 52 && sb < 52 ? "low" : sa - sb >= 10 ? "a" : sb - sa >= 10 ? "b" : "even";

  const palaceLine = (who: N, f: PeriodFlow, when: string): string =>
    f.clashDay
      ? `${when} 기운은 ${who.n}의 배우자 자리와 **충**을 해요. ${INTERACTION_EX.clash.day}`
      : f.hapDay
        ? `${when} 기운은 ${who.n}의 배우자 자리와 **합**을 이뤄요. ${INTERACTION_EX.hap.day}`
        : f.wonjinDay
          ? `${when} 기운은 ${who.n}의 배우자 자리와 **원진**이에요. ${INTERACTION_EX.wonjin.day}`
          : `${when} 기운은 ${who.n}의 배우자 자리를 건드리지 않아요. ${who.n} 쪽에서 관계가 흔들릴 일은 적어요.`;

  /* ============ 내년 · 올해 ============ */
  const yearCard = (idx: 0 | 1): Story => {
    const da = dA[idx];
    const db = dB[idx];
    const label = idx === 0 ? "올해" : "내년";
    const rel = lead(da.score, db.score);
    const [L, F] = rel === "b" ? [B, A] : [A, B];
    const months = da.months.map((m, i) => ({ month: m.month, a: m.score, b: db.months[i].score, both: avg(m.score, db.months[i].score), ma: m, mb: db.months[i] }));
    const best = [...months].sort((x, y) => Math.min(y.a, y.b) - Math.min(x.a, x.b)).slice(0, 3);
    const worst = [...months].sort((x, y) => x.both - y.both).slice(0, 2);
    const gap = months.filter((m) => Math.abs(m.a - m.b) >= 12);
    const clashM = months.filter((m) => m.ma.clashDay || m.mb.clashDay);
    const areaRow = (k: Area, icon: string, name: string, tip: (hi: N, lo: N, diff: number) => string) => {
      const sa = da.areas[k].score;
      const sb = db.areas[k].score;
      const [hi, lo] = sa >= sb ? [A, B] : [B, A];
      return `${icon} **${name}** — ${A.n} ${sa}점 / ${B.n} ${sb}점. ${tip(hi, lo, Math.abs(sa - sb))}`;
    };

    const pages: StoryPage[] = [
      {
        title: `${da.year}년, 두 사람에게 온 손님`,
        scene: { kind: "duoScore", a: da.score, b: db.score, labelA: A.n, labelB: B.n },
        bubbles: [
          `${label} ${da.year}년은 **${gz(da.stem, da.branch)}년**이에요. 같은 해를 살아도 사주가 다르면 찾아오는 손님(십성)이 달라요. 부부는 서로 다른 손님을 한집에서 함께 맞는 셈이에요.`,
          `${A.n}에게는 **${da.god}** — ${GOD_AREA[da.god].theme}예요. 예를 들어 ${GOD_AREA[da.god].examples[0]}, ${GOD_AREA[da.god].examples[1]} 같은 일이 생기기 쉬워요.`,
          `${B.n}에게는 **${db.god}** — ${GOD_AREA[db.god].theme}예요. 예를 들어 ${GOD_AREA[db.god].examples[0]}, ${GOD_AREA[db.god].examples[1]} 같은 일이 생기기 쉬워요.`,
          `종합 점수는 ${A.n} **${da.score}점(${scoreWord(da.score)})**, ${B.n} **${db.score}점(${scoreWord(db.score)})**이에요. 점수는 기본 60점에서 그해의 기운이 각자의 용신·기신인지, 배우자 자리와 합·충인지로 더하고 뺀 값이에요.`,
        ],
        badges: [`${A.n} ${da.god}`, `${B.n} ${db.god}`],
      },
      {
        title: "한 배를 탄 두 사람",
        scene: { kind: "boat", mood: kindOfScore(avg(da.score, db.score)) },
        bubbles: [
          rel === "both"
            ? `두 사람 모두에게 순풍이 부는 해예요. 부부에게 이런 해는 흔하지 않아요. 예를 들어 결혼, 이사, 내 집 마련, 창업처럼 **둘이 함께 크게 움직이는 일**을 이 해에 맞추면 좋아요.`
            : rel === "low"
              ? `두 사람 모두 속도를 줄여야 하는 해예요. 새 일을 벌이기보다 **가진 것을 함께 지키는 해**로 삼으세요. 예를 들어 큰 대출, 무리한 이사, 동시에 직장을 옮기는 일은 한 해 미루는 게 좋아요.`
              : rel === "even"
                ? `두 사람의 흐름이 비슷해요. 한쪽이 크게 앞서거나 처지지 않아 **보조를 맞추기 쉬운 해**예요. 예를 들어 함께 운동·저축 같은 꾸준한 습관을 시작하기 좋아요.`
                : `${L.n} 쪽에 순풍이 불고, ${F.eun} 쉬어 가는 해예요. ${L.i} 노를 젓고 ${F.i} 방향을 잡아 주는 배라고 생각하세요. 예를 들어 ${L.n}의 이직·시험·사업 도전을 이 해에 밀어 주고, ${F.eun} 무리한 변화 대신 건강과 집안을 돌보는 식이에요.`,
          palaceLine(A, da, label),
          palaceLine(B, db, label),
        ],
      },
      {
        title: "분야별로 본 우리 집",
        scene: { kind: "table" },
        bubbles: [
          areaRow("work", "💼", "일", (hi, lo, d) =>
            d >= 8 ? `${label} 일은 ${hi.n} 쪽이 치고 나가요. ${lo.i} 집안 일정을 조금 더 맡아 주면 ${hi.n}의 성과가 집안 전체의 복이 돼요.` : "둘의 일 운이 비슷해요. 바쁜 주간을 서로 엇갈리게 잡으면 집이 덜 지쳐요.",
          ),
          areaRow("money", "💰", "재물", (hi, lo, d) =>
            `우리 집 평균은 **${avg(da.areas.money.score, db.areas.money.score)}점**이에요. ${d >= 8 ? `돈과 관련된 큰 결정은 운이 더 좋은 ${hi.n}의 판단을 따르고, ${lo.eun} 지출을 한 번 더 확인하는 역할을 맡으세요.` : "누가 결정해도 큰 차이가 없으니, 큰 지출은 꼭 둘이 함께 정하세요."}`,
          ),
          areaRow("love", "🌸", "관계", (hi, lo, d) =>
            d >= 8 ? `${hi.n}의 마음이 더 열려 있는 해예요. ${hi.i} 먼저 표현하고 다가가면 ${lo.n}의 마음도 따라 풀려요.` : "서로를 향한 기운이 고르게 흘러요. 기념일과 여행을 미루지 마세요.",
          ),
          areaRow("health", "🩺", "건강", (hi, lo, d) =>
            d >= 6 ? `${lo.n}의 몸이 더 지치기 쉬워요. ${hi.i} ${lo.n}의 잠과 끼니를 챙겨 주세요. 예를 들어 야식 줄이기, 검진 예약을 대신 잡아 주기예요.` : "둘의 건강 흐름이 비슷해요. 운동을 함께 시작하기 좋은 해예요.",
          ),
        ],
      },
      {
        title: "함께 보는 월별 점수",
        scene: { kind: "duoMonths", items: months.map((m) => ({ month: m.month, a: m.a, b: m.b })) },
        bubbles: [
          `파란 막대가 ${A.n}, 빨간 막대가 ${B.n}의 점수예요. 별(⭐)은 둘 다 68점을 넘는 달이에요.`,
          months.map((m) => `${m.month}월 · ${A.n} ${m.a} / ${B.n} ${m.b} → 함께 ${m.both}점`).join("\n"),
          `🌟 **둘이 함께 움직이기 좋은 달** — ${best.map((m) => `${m.month}월(${m.a}·${m.b}점)`).join(", ")}. 여행, 이사, 큰 구매, 양가 행사처럼 둘의 일은 이때로 잡으세요.`,
          gap.length
            ? `🤝 **한 사람이 받쳐 줄 달** — ${gap
                .slice(0, 4)
                .map((m) => `${m.month}월(${m.a >= m.b ? B.n : A.n} 쪽이 지침)`)
                .join(", ")}. 운이 좋은 쪽이 집안일과 결정을 조금 더 맡아 주세요.`
            : "두 사람의 달별 흐름이 비슷해서 한쪽만 크게 지치는 달은 없어요.",
          `🛌 **함께 쉬어 갈 달** — ${worst.map((m) => `${m.month}월(함께 ${m.both}점)`).join(", ")}. 이때는 약속과 지출을 줄이세요.`,
        ],
      },
      {
        title: "함께 해야 할 행동",
        scene: doScene(["🗓️", "🤝", "💬", "🍀"]),
        bubbles: [
          ...pairDo(da.god, db.god, A, B),
          `✔ 둘의 큰 계획은 **${mlist(best)}**에 맞추세요. 두 사람의 점수가 함께 높은 달이에요.`,
          rel === "a" || rel === "b" ? `✔ ${label}의 주인공은 ${ieyo(L.n)}. ${F.i} 한 발 물러나 받쳐 주면, 다음에 ${F.n}의 순풍이 올 때 같은 도움을 돌려받아요.` : `✔ 한 달에 한 번, 두 사람의 일정과 지출을 함께 펼쳐 놓고 이야기하는 날을 정하세요.`,
          kA.habit === kB.habit
            ? `✔ 두 사람 모두에게 **${elName(a.yongshin)}** 기운이 필요해요. 「${eul(`${kA.habit}」`)} 함께 하는 습관으로 만들어 보세요.`
            : `✔ 각자에게 필요한 기운을 서로 챙겨 주세요. ${A.n}에게는 「${kA.habit}」, ${B.n}에게는 「${eul(`${kB.habit}」`)} 권해요.`,
        ],
      },
      {
        title: "함께 피해야 할 행동",
        scene: dontScene(["💸", "🗯️", "🏃", "📵"]),
        bubbles: [
          ...pairDont(da.god, db.god, A, B),
          `✖ **${mlist(worst)}**에는 큰 지출·이사·중요한 담판을 피하세요. 둘 다 기운이 낮은 달이에요.`,
          clashM.length
            ? `✖ **${mlist(clashM.slice(0, 4))}**에는 배우자 자리에 충이 들어요. 이때 「왜 이렇게 예민해?」라는 말은 금물이에요. 사주가 흔들리는 달이라 그런 거예요.`
            : `✖ 배우자 자리를 흔드는 달은 없지만, 익숙하다고 고맙다는 말을 건너뛰지는 마세요.`,
          c.dayBranch === "clash" || c.dayBranch === "wonjin"
            ? `✖ 두 사람은 생활 리듬이 다른 사주예요. 상대의 방식을 내 방식으로 고치려 들지 마세요.`
            : `✖ 편하다고 상대의 일정을 묻지 않고 약속을 잡지 마세요.`,
        ],
      },
    ];
    return {
      id: idx === 0 ? "year" : "nextYear",
      title: idx === 0 ? "우리의 올해" : "우리의 내년",
      icon: idx === 0 ? "🌅" : "🎍",
      tagline: `${da.year}년 · ${A.n} ${da.score} / ${B.n} ${db.score}점`,
      pages,
    };
  };

  /* ============ 이번 달 ============ */
  const ma = a.thisMonth;
  const mb = b.thisMonth;
  const monthCard: Story = {
    id: "month",
    title: "우리의 이번 달",
    icon: "🌙",
    tagline: `${gz(ma.stem, ma.branch)}월 · ${A.n} ${ma.score} / ${B.n} ${mb.score}점`,
    pages: [
      {
        title: "이번 달, 두 사람의 손님",
        scene: { kind: "duoScore", a: ma.score, b: mb.score, labelA: A.n, labelB: B.n },
        bubbles: [
          `이번 달은 **${gz(ma.stem, ma.branch)}월**이에요. ${ma.startTerm}(${ma.startDate})부터 ${ma.endTerm}(${ma.endDate}) 전까지예요.`,
          `${A.n}에게는 **${ma.god}**의 달이에요. 예를 들어 ${GOD_AREA[ma.god].examples[0]}, ${GOD_AREA[ma.god].examples[1]} 같은 일이 생기기 쉬워요. 점수는 **${ma.score}점**이에요.`,
          `${B.n}에게는 **${mb.god}**의 달이에요. 예를 들어 ${GOD_AREA[mb.god].examples[0]}, ${GOD_AREA[mb.god].examples[1]} 같은 일이 생기기 쉬워요. 점수는 **${mb.score}점**이에요.`,
        ],
      },
      {
        title: "이번 달의 부부 사이",
        scene: { kind: "bench" },
        bubbles: [
          palaceLine(A, ma, "이번 달"),
          palaceLine(B, mb, "이번 달"),
          Math.abs(ma.score - mb.score) >= 10
            ? `이번 달은 ${ma.score > mb.score ? A.n : B.n} 쪽 기운이 더 좋아요. 기운이 좋은 사람이 먼저 연락하고, 먼저 사과하고, 먼저 계획을 세워 주세요.`
            : "두 사람의 기운이 비슷한 달이에요. 누가 먼저랄 것 없이 함께 움직이기 좋아요.",
        ],
      },
      {
        title: "이번 달의 일과 돈",
        scene: { kind: "market" },
        bubbles: [
          `💼 ${A.n} — ${GOD_AREA[ma.god].monthAction}`,
          `💼 ${B.n} — ${GOD_AREA[mb.god].monthAction}`,
          `💰 ${A.n}의 돈 흐름 — ${GOD_AREA[ma.god].money}`,
          `💰 ${B.n}의 돈 흐름 — ${GOD_AREA[mb.god].money}`,
        ],
      },
      {
        title: "이번 달 함께 해야 할 행동",
        scene: doScene(["📅", "🍽️", "💌", "🧘"]),
        bubbles: [
          ...pairDo(ma.god, mb.god, A, B),
          ma.hapDay || mb.hapDay ? "✔ 배우자 자리에 합이 드는 달이에요. 미뤄 둔 데이트나 여행을 이번 달에 꼭 다녀오세요." : "✔ 이번 달 안에 둘만의 저녁 약속을 하루 정해 달력에 적어 두세요.",
        ],
      },
      {
        title: "이번 달 함께 피해야 할 행동",
        scene: dontScene(["💸", "🗯️", "⏰", "📱"]),
        bubbles: [
          ...pairDont(ma.god, mb.god, A, B),
          ma.clashDay || mb.clashDay ? "✖ 배우자 자리에 충이 드는 달이에요. 이사·큰 구매·양가 문제 같은 무거운 주제는 다음 달로 미루세요." : "✖ 피곤한 날 밤늦게 중요한 이야기를 꺼내지 마세요.",
        ],
      },
    ],
  };

  /* ============ 재물 ============ */
  const tA = moneyType(a);
  const tB = moneyType(b);
  const keepScore = (x: Analysis) => x.godCounts["정재"] * 2 + x.groupCounts["관성"] - x.groupCounts["비겁"] - (moneyType(x) === "leak" ? 3 : 0);
  const earnScore = (x: Analysis) => x.groupCounts["재성"] + x.groupCounts["식상"];
  const [keeper, spender] = keepScore(a) >= keepScore(b) ? [A, B] : [B, A];
  const [earner] = earnScore(a) >= earnScore(b) ? [A, B] : [B, A];
  const mMonths = dA[1].months.map((m, i) => ({ month: m.month, a: m.score, b: dB[1].months[i].score, ma: m, mb: dB[1].months[i] }));
  const isMoneyGod = (f: PeriodFlow) => ["재성", "식상"].includes(TEN_GOD_GROUP[f.god]);
  const moneyGood = [...mMonths].filter((m) => isMoneyGod(m.ma) || isMoneyGod(m.mb)).sort((x, y) => y.a + y.b - (x.a + x.b)).slice(0, 3);
  const moneyBad = [...mMonths].filter((m) => m.ma.god === "겁재" || m.mb.god === "겁재" || m.ma.clashDay || m.mb.clashDay).sort((x, y) => x.a + x.b - (y.a + y.b)).slice(0, 3);
  const anyLeak = tA === "leak" || tB === "leak";
  const moneyCard: Story = {
    id: "money",
    title: "우리 집 재물",
    icon: "💰",
    tagline: `${keeper.n} 관리 · 평균 ${avg(dA[1].areas.money.score, dB[1].areas.money.score)}점`,
    pages: [
      {
        title: "두 사람의 재물 그릇",
        scene: { kind: "chest", fill: Math.min(1, (earnScore(a) + earnScore(b)) / 8) },
        bubbles: [
          `${A.n}의 그릇은 **「${MONEY_STORY[tA].title}」**이에요. ${MONEY_STORY[tA].line}. (재성 ${a.groupCounts["재성"]} · 식상 ${a.groupCounts["식상"]} · 비겁 ${a.groupCounts["비겁"]})`,
          `${B.n}의 그릇은 **「${MONEY_STORY[tB].title}」**이에요. ${MONEY_STORY[tB].line}. (재성 ${b.groupCounts["재성"]} · 식상 ${b.groupCounts["식상"]} · 비겁 ${b.groupCounts["비겁"]})`,
          tA === tB
            ? "두 사람의 그릇이 같은 모양이에요. 돈에 대한 생각이 잘 통하지만, **같은 약점도 두 배**가 돼요. 약한 부분은 자동이체 같은 장치로 메우세요."
            : "두 사람의 그릇 모양이 달라요. 서로의 약점을 메워 줄 수 있는 좋은 조합이에요. 대신 돈 쓰는 방식이 달라 서운할 수 있으니 규칙을 미리 정해 두세요.",
        ],
      },
      {
        title: "누가 벌고, 누가 지킬까",
        scene: { kind: "market" },
        bubbles: [
          `사주로 보면 돈을 **불리는 힘**은 ${earner.n} 쪽이 더 커요. 재성과 식상(재물과 재능의 별)이 더 많기 때문이에요.`,
          earner === keeper
            ? `돈을 **지키는 힘**도 ${keeper.n} 쪽이 더 커요. 그렇다고 ${spender.n}의 역할이 없는 게 아니에요. ${spender.eun} 한 달에 한 번 지출 내역을 함께 보며 빠진 것을 짚어 주는 **감사 역할**을 맡으세요.`
            : `돈을 **지키는 힘**은 ${keeper.n} 쪽이 더 커요. 정재와 관성(성실함과 규칙의 별)이 받쳐 주고, 재물을 나눠 가지는 비겁의 영향이 덜해요.`,
          `그래서 통장 관리는 ${keeper.i} 맡는 게 잘 맞아요. 예를 들어 월급날 생활비·저축·용돈 통장으로 자동이체를 걸고, ${spender.eun} 정해진 용돈 안에서 자유롭게 쓰는 방식이에요.`,
          c.bFillsA || c.aFillsB
            ? `또 ${c.bFillsA ? `${B.n}의 사주에는 ${A.n}에게 필요한 ${elName(a.yongshin)} 기운이` : `${A.n}의 사주에는 ${B.n}에게 필요한 ${elName(b.yongshin)} 기운이`} 넉넉해요. 함께 있을 때 돈 문제도 더 차분하게 판단하게 돼요.`
            : "서로의 용신을 직접 채워 주는 조합은 아니라서, 큰돈 결정은 감보다 숫자와 기록으로 하세요.",
        ],
      },
      {
        title: "올해와 내년의 우리 집 재물",
        scene: { kind: "duoScore", a: avg(dA[0].areas.money.score, dB[0].areas.money.score), b: avg(dA[1].areas.money.score, dB[1].areas.money.score), labelA: `${y0}년`, labelB: `${y0 + 1}년`, heart: false },
        bubbles: [
          `**${y0}년** — ${A.n} ${dA[0].areas.money.score}점 / ${B.n} ${dB[0].areas.money.score}점.\n${A.n}: ${YEAR_MONEY[TEN_GOD_GROUP[dA[0].god]]}\n${B.n}: ${YEAR_MONEY[TEN_GOD_GROUP[dB[0].god]]}`,
          `**${y0 + 1}년** — ${A.n} ${dA[1].areas.money.score}점 / ${B.n} ${dB[1].areas.money.score}점.\n${A.n}: ${YEAR_MONEY[TEN_GOD_GROUP[dA[1].god]]}\n${B.n}: ${YEAR_MONEY[TEN_GOD_GROUP[dB[1].god]]}`,
        ],
      },
      {
        title: `${y0 + 1}년, 돈을 움직일 달과 묶어 둘 달`,
        scene: { kind: "duoMonths", items: mMonths.map((m) => ({ month: m.month, a: m.a, b: m.b })) },
        bubbles: [
          moneyGood.length
            ? `💰 **돈을 움직이기 좋은 달** — ${moneyGood.map((m) => `${m.month}월(${m.a}·${m.b}점)`).join(", ")}. 둘 중 한 사람에게 재물·재능의 별이 들어오는 달이에요. 예를 들어 적금 가입, 부업 시작, 큰 가전 구매를 이때 하세요.`
            : "내년에는 재물의 별이 뚜렷이 드는 달이 적어요. 새로 벌이기보다 지키는 한 해로 삼으세요.",
          moneyBad.length
            ? `🧾 **돈을 묶어 둘 달** — ${moneyBad.map((m) => `${m.month}월(${m.a}·${m.b}점)`).join(", ")}. 겁재(재물을 나눠 가지는 별)나 배우자 자리의 충이 드는 달이에요. 예를 들어 지인의 투자 권유, 충동구매, 보증 부탁이 들어오기 쉬워요.`
            : "내년에는 재물이 크게 새는 달이 보이지 않아요.",
        ],
      },
      {
        title: "돈 문제, 함께 해야 할 행동",
        scene: doScene(["🏦", "📒", "🎯", "🤝"]),
        bubbles: [
          `✔ 통장은 ${keeper.i} 관리하되, 한 달에 한 번 둘이 함께 잔액을 보는 **돈 이야기 날**을 정하세요.`,
          `✔ 큰 지출의 기준 금액을 정하세요. 예를 들어 50만 원이 넘으면 반드시 미리 상의하기예요.`,
          tA === "talent" || tB === "talent" ? `✔ ${tA === "talent" ? A.n : B.n}의 재능은 돈이 되는 사주예요. 부업·강의·작품 판매를 서로 응원해 주세요.` : `✔ 둘의 이름으로 된 저축 목표를 하나 만드세요. 목표가 있어야 돈이 모이는 사주예요.`,
          moneyGood.length ? `✔ 큰 구매와 투자 공부는 **${mlist(moneyGood)}**에 맞추세요.` : "✔ 고정 지출을 줄이는 점검을 분기마다 한 번씩 하세요.",
        ],
      },
      {
        title: "돈 문제, 함께 피해야 할 행동",
        scene: dontScene(["💳", "🤫", "📉", "🗯️"]),
        bubbles: [
          anyLeak ? `✖ ${tA === "leak" ? A.n : B.n}의 사주는 돈이 사람을 따라 새기 쉬워요. 보증, 지인과의 돈거래, 동업은 부부가 함께 「안 한다」고 정해 두세요.` : "✖ 보증과 지인 투자는 한 사람이 혼자 결정하지 마세요.",
          "✖ 상대 몰래 쓰는 돈, 몰래 하는 투자는 금물이에요. 금액보다 숨겼다는 사실이 신뢰를 깎아요.",
          "✖ 「당신은 왜 그렇게 돈을 써?」처럼 사람을 탓하는 말은 피하세요. 규칙을 고치는 쪽으로 이야기하세요.",
          moneyBad.length ? `✖ **${mlist(moneyBad)}**에는 큰돈을 움직이지 마세요.` : "✖ 수입이 늘었다고 바로 생활 수준을 올리지 마세요.",
        ],
      },
    ],
  };

  /* ============ 연애 ============ */
  const lpA = LOVE_PATTERN[TEN_GOD_GROUP[dayA.branchGod]];
  const lpB = LOVE_PATTERN[TEN_GOD_GROUP[dayB.branchGod]];
  const spouseG = (x: Analysis): TenGodGroup => (x.input.gender === "male" ? "재성" : "관성");
  const loveYears = a.flows
    .map((fa, i) => ({ year: fa.year, fa, fb: b.flows[i] }))
    .filter(({ fa, fb }) => fa.hapDay || fb.hapDay || TEN_GOD_GROUP[fa.god] === spouseG(a) || TEN_GOD_GROUP[fb.god] === spouseG(b));
  const loveMonths = mMonths.filter((m) => m.ma.hapDay || m.mb.hapDay);
  const stemWhy =
    c.stem === "hap"
      ? `두 사람의 일간은 **천간합**이에요. 이유를 설명하기 어려운 끌림이 있었을 거예요. 예를 들어 처음 만난 날부터 오래 안 사이처럼 편했던 인연이에요.`
      : c.stem === "same"
        ? `두 사람은 같은 오행의 일간이에요. 닮은 점에 끌렸을 거예요. 예를 들어 웃는 지점, 화나는 지점이 비슷해 「이 사람은 나를 안다」고 느꼈을 인연이에요.`
        : c.stem === "gen-ab" || c.stem === "gen-ba"
          ? `두 사람의 일간은 **상생** 관계예요. ${c.stem === "gen-ab" ? A.i : B.i} 주고 ${c.stem === "gen-ab" ? B.i : A.i} 받는 흐름이에요. 예를 들어 한 사람은 챙겨 주는 기쁨에, 한 사람은 기댈 수 있는 편안함에 끌렸을 거예요.`
          : `두 사람의 일간은 **상극** 관계예요. 나와 전혀 다른 사람이라는 점에 끌렸을 거예요. 예를 들어 내가 못 하는 것을 척척 해내는 모습이 멋있어 보였던 인연이에요.`;
  const loveCard: Story = {
    id: "love",
    title: "우리의 사랑",
    icon: "🌸",
    tagline: `${lpA.conflict} · ${lpB.conflict} 조심`,
    pages: [
      {
        title: "두 사람의 사랑 방식",
        scene: { kind: "love", variant: "pair" },
        bubbles: [
          `사랑하는 방식은 배우자 자리(일지)의 십성으로 봐요. ${A.n}의 일지는 **${dayA.branchKo}(${dayA.branchGod})**, ${B.n}의 일지는 **${ieyo(`${dayB.branchKo}(${dayB.branchGod})**`)}.`,
          `${A.eun} 연애 초반에 ${lpA.early}. 시간이 흐르면 ${lpA.long}.`,
          `${B.eun} 연애 초반에 ${lpB.early}. 시간이 흐르면 ${lpB.long}.`,
        ],
      },
      {
        title: "서로에게 끌린 이유",
        scene: { kind: "stems", a: a.dayStem, b: b.dayStem, elA: a.dayEl, elB: b.dayEl, mode: c.stem },
        bubbles: [
          stemWhy,
          c.bIsSpouseStarOfA || c.aIsSpouseStarOfB
            ? `게다가 ${c.bIsSpouseStarOfA ? `${B.n}의 일간은 ${A.n}에게` : `${A.n}의 일간은 ${B.n}에게`} **배우자의 별**이에요. 명리학에서 「만날 사람을 만났다」고 보는 조합이에요.`
            : "서로가 상대의 배우자 별은 아니에요. 운명적인 끌림보다 **함께 보낸 시간이 인연을 만든** 사이예요. 그래서 오히려 쉽게 흔들리지 않아요.",
          `띠로는 ${BRANCH_ANIMAL[a.pillars[0].branch].ko}띠와 ${BRANCH_ANIMAL[b.pillars[0].branch].ko}띠예요. ${c.yearBranch === "hap" || c.yearBranch === "samhap" ? "서로 잘 어울리는 띠라 주변에서도 잘 어울린다는 말을 들어요." : c.yearBranch === "clash" || c.yearBranch === "wonjin" ? "성향이 다른 띠라, 주변 사람들을 대하는 방식에서 차이가 나요." : "띠로는 무난하게 어울려요."}`,
        ],
      },
      {
        title: "두 사람이 다투는 지점",
        scene: { kind: "couple", variant: "river" },
        bubbles: [
          `${A.i} 예민해지는 지점은 **「${lpA.conflict}」**, ${B.i} 예민해지는 지점은 **「${ieyo(`${lpB.conflict}」**`)}.`,
          PALACE_SHORT[c.dayBranch],
          `${A.n}에게 필요한 것은 「${lpA.tip}」, ${B.n}에게 필요한 것은 「${ieyo(`${lpB.tip}」`)}.`,
        ],
      },
      {
        title: "사랑이 깊어지는 때",
        scene: {
          kind: "stones",
          items: a.flows.slice(0, 6).map((f) => ({ label: String(f.year), sub: gz(f.stem, f.branch), kind: f.kind, mark: loveYears.some((y) => y.year === f.year) })),
        },
        bubbles: [
          loveYears.length
            ? `앞으로 인연의 기운이 강해지는 해는 **${loveYears
                .slice(0, 4)
                .map((y) => `${y.year}년`)
                .join(", ")}**이에요. 한 사람의 배우자 자리에 합이 들거나, 배우자의 별이 들어오는 해예요. 예를 들어 결혼, 재결합, 둘째 계획처럼 관계가 한 단계 나아가는 일이 생기기 쉬워요.`
            : "앞으로 10년은 관계를 크게 흔드는 기운 없이 잔잔해요. 이벤트는 스스로 만들어야 해요.",
          loveMonths.length
            ? `${y0 + 1}년에는 **${mlist(loveMonths.slice(0, 4))}**에 배우자 자리와 합이 들어요. 여행과 기념일을 이때로 잡아 보세요.`
            : `${y0 + 1}년에는 배우자 자리에 합이 드는 달이 없어요. 대신 두 사람 점수가 함께 높은 달에 여행을 잡아 보세요.`,
        ],
      },
      {
        title: "사랑을 위해 함께 해야 할 행동",
        scene: doScene(["💌", "🚶", "🎁", "👂"]),
        bubbles: [
          `✔ ${A.eun} ${B.n}에게 「${eul(`${lpB.tip}」`)} 선물하세요. ${B.n}의 사주가 가장 바라는 것이에요.`,
          `✔ ${B.eun} ${A.n}에게 「${eul(`${lpA.tip}」`)} 선물하세요. ${A.n}의 사주가 가장 바라는 것이에요.`,
          c.dayBranch === "clash" ? "✔ 다툼은 집 밖에서 푸세요. 충이 있는 부부는 걸으면서 하는 대화가 훨씬 부드러워요." : c.dayBranch === "wonjin" ? "✔ 자기 전 「오늘 고마웠던 것 하나」를 서로 말하세요. 원진의 서운함을 녹이는 가장 쉬운 방법이에요." : "✔ 한 달에 하루는 휴대폰을 내려놓고 둘만 보내는 저녁을 만드세요.",
          loveMonths.length ? `✔ **${mlist(loveMonths.slice(0, 3))}**에는 꼭 둘만의 여행이나 기념일을 챙기세요.` : "✔ 기념일을 달력에 미리 적고, 번갈아 가며 계획을 맡으세요.",
        ],
      },
      {
        title: "사랑을 위해 함께 피해야 할 행동",
        scene: dontScene(["🗯️", "🙉", "📱", "⚖️"]),
        bubbles: [
          `✖ ${A.n}에게는 「${lpA.conflict}」, ${B.n}에게는 「${eul(`${lpB.conflict}」`)} 건드리는 말과 행동을 피하세요.`,
          c.stem === "ctrl-ab" || c.stem === "ctrl-ba"
            ? `✖ ${c.stem === "ctrl-ab" ? A.n : B.n}의 조언은 상대에게 잔소리로 들리기 쉬운 사주예요. 고쳐 주려는 말은 하루에 한 번만 하세요.`
            : c.stem === "same"
              ? "✖ 둘 다 물러서지 않는 사주예요. 다툼이 30분을 넘기면 일단 멈추고 다음 날 이어 가세요."
              : "✖ 주는 사람만 계속 주고 받는 사람만 계속 받는 관계로 굳어지지 않게 하세요.",
          "✖ 다른 부부와 비교하는 말, 과거의 잘못을 다시 꺼내는 말은 피하세요.",
          c.strength === "both-strong" ? "✖ 둘 다 주관이 강한 사주예요. 이기려고 하는 다툼은 피하세요. 이겨도 남는 게 없어요." : "✖ 서운함을 말하지 않고 쌓아 두지 마세요. 사흘을 넘기지 않는 게 좋아요.",
        ],
      },
    ],
  };

  /* ============ 직업 ============ */
  const wA = WORK_DECK[a.dominantGroup];
  const wB = WORK_DECK[b.dominantGroup];
  const allGroups: TenGodGroup[] = ["비겁", "식상", "재성", "관성", "인성"];
  const missing = allGroups.filter((g) => a.groupCounts[g] + b.groupCounts[g] <= 1);
  const wRel = lead(dA[1].areas.work.score, dB[1].areas.work.score);
  const workCard: Story = {
    id: "work",
    title: "일과 가정",
    icon: "🧭",
    tagline: `${wA.title} · ${wB.title}`,
    pages: [
      {
        title: "두 사람의 일하는 모습",
        scene: { kind: "stairs", step: 3 },
        bubbles: [
          `${A.eun} **「${wA.title}」**이에요. ${wA.line}. 사주에서 가장 센 기운은 ${a.dominantGroup}, 그리고 ${a.strength.strong ? "신강해서 스스로 판을 짜는 자리에서 잘 풀려요" : "신약해서 좋은 조직과 동료의 힘을 빌릴 때 잘 풀려요"}.`,
          `${B.eun} **「${wB.title}」**이에요. ${wB.line}. 사주에서 가장 센 기운은 ${b.dominantGroup}, 그리고 ${b.strength.strong ? "신강해서 스스로 판을 짜는 자리에서 잘 풀려요" : "신약해서 좋은 조직과 동료의 힘을 빌릴 때 잘 풀려요"}.`,
          a.dominantGroup === b.dominantGroup
            ? "두 사람의 일하는 방식이 닮았어요. 서로의 고충을 누구보다 잘 이해하지만, 둘 다 같은 시기에 바빠지기 쉬워요."
            : "두 사람의 일하는 방식이 달라요. 상대의 방식이 답답해 보일 수 있지만, 내가 못 보는 것을 봐 주는 사람이에요.",
        ],
      },
      {
        title: "집안에서의 역할 나누기",
        scene: { kind: "desk", el: a.dayEl },
        bubbles: [
          `사주의 가장 센 기운대로 역할을 나누면 덜 싸워요. ${A.eun} **${ROLE[a.dominantGroup]}**, ${B.eun} **${iga(`${ROLE[b.dominantGroup]}**`)} 잘 맞아요.`,
          a.dominantGroup === b.dominantGroup
            ? `두 사람의 역할이 겹쳐요. 예를 들어 둘 다 계획만 세우고 실행이 늦거나, 둘 다 밀어붙여 부딪히는 식이에요. 한 가지 일에는 한 사람만 책임자로 정하세요.`
            : `예를 들어 여행을 간다면 ${a.dominantGroup === "인성" || a.dominantGroup === "관성" ? A.i : B.i} 일정과 예약을, ${a.dominantGroup === "인성" || a.dominantGroup === "관성" ? B.i : A.i} 현장에서의 결정과 분위기를 맡는 식이에요.`,
          missing.length
            ? `두 사람 모두에게 약한 기운은 **${ieyo(`${missing.join(", ")}**`)}. 이 역할(${missing.map((g) => ROLE[g]).join(", ")})은 비어 있기 쉬우니, 번갈아 맡거나 앱·전문가의 도움을 받으세요.`
            : "두 사람의 기운을 합치면 다섯 가지 역할이 고르게 채워져요. 팀으로서 균형이 좋은 부부예요.",
        ],
      },
      {
        title: "올해와 내년, 누가 뛰고 누가 받칠까",
        scene: { kind: "duoScore", a: dA[1].areas.work.score, b: dB[1].areas.work.score, labelA: A.n, labelB: B.n },
        bubbles: [
          `**${y0}년 일 점수** — ${A.n} ${dA[0].areas.work.score}점 / ${B.n} ${dB[0].areas.work.score}점`,
          `**${y0 + 1}년 일 점수** — ${A.n} ${dA[1].areas.work.score}점 / ${B.n} ${dB[1].areas.work.score}점 (그림의 점수예요)`,
          `${A.n}의 내년 — ${GOD_AREA[dA[1].god].work}`,
          `${B.n}의 내년 — ${GOD_AREA[dB[1].god].work}`,
          wRel === "a" || wRel === "b"
            ? `그래서 내년에는 ${wRel === "a" ? A.i : B.i} 뛰고 ${wRel === "a" ? B.i : A.i} 받치는 그림이 좋아요. 이직·승진 도전·창업은 ${wRel === "a" ? A.n : B.n} 쪽 일정에 맞추세요.`
            : wRel === "both"
              ? "내년은 둘 다 일 운이 좋아요. 둘 다 바빠질 테니 집안일을 외부 도움(가전, 반찬, 청소 서비스)으로 덜어 내세요."
              : wRel === "low"
                ? "내년은 둘 다 일에서 버티는 해예요. 동시에 직장을 옮기는 일은 피하고, 한 사람은 반드시 안정적인 자리를 지키세요."
                : "내년은 둘의 일 운이 비슷해요. 바쁜 시기가 겹치지 않게 분기별로 일정을 맞춰 보세요.",
        ],
      },
      {
        title: "일과 가정, 함께 해야 할 행동",
        scene: doScene(["🗓️", "🧹", "👏", "🚪"]),
        bubbles: [
          "✔ 주말마다 10분, 다음 주 두 사람의 일정을 맞춰 보세요. 야근·회식·마감을 미리 알면 서운함이 줄어요.",
          `✔ 집안일은 사주의 역할대로 나누세요. ${A.eun} ${ROLE[a.dominantGroup]}, ${B.eun} ${ieyo(ROLE[b.dominantGroup])}.`,
          ...pairDo(dA[1].god, dB[1].god, A, B),
        ],
      },
      {
        title: "일과 가정, 함께 피해야 할 행동",
        scene: dontScene(["🏃", "📵", "🗯️", "🧳"]),
        bubbles: [
          "✖ 두 사람이 같은 시기에 직장을 그만두거나 옮기지 마세요. 한 사람은 닻이 되어야 해요.",
          "✖ 회사에서 받은 스트레스를 집에서 상대에게 쏟지 마세요. 「10분만 혼자 있을게」가 훨씬 나아요.",
          ...pairDont(dA[1].god, dB[1].god, A, B),
        ],
      },
    ],
  };

  /* ============ 부부 ============ */
  const wantA = TEN_GOD_GROUP[dayA.branchGod];
  const wantB = TEN_GOD_GROUP[dayB.branchGod];
  const careYears = c.years.filter((y) => y.care);
  const upYears = c.years.filter((y) => y.bothUp);
  const elRow = (e: Element) => `${elName(e)} — ${A.n} ${a.elementCounts[e]}개 / ${B.n} ${b.elementCounts[e]}개`;
  const marriageCard: Story = {
    id: "marriage",
    title: "우리 부부",
    icon: "🏡",
    tagline: `일지 ${dayA.branchKo}·${dayB.branchKo} · 궁합 ${c.score}°`,
    pages: [
      {
        title: "바라는 배우자, 실제 배우자",
        scene: { kind: "table" },
        bubbles: [
          `배우자 자리(일지)의 십성은 **내가 바라는 배우자의 모습**이에요. 이것을 상대의 사주에서 가장 센 기운과 견주어 볼게요.`,
          `${A.n}의 일지는 ${dayA.branchGod}, 그래서 ${eul(GROUP_PERSON[wantA])} 바라요. 실제 ${B.n}의 가장 센 기운은 ${b.dominantGroup}, ${ieyo(GROUP_PERSON[b.dominantGroup])}. ${wantA === b.dominantGroup ? "바라던 모습 그대로의 사람을 만났어요." : "바라는 모습과 조금 달라요. 그 차이가 서운함이 되기 쉬우니, 바라는 것을 말로 알려 주세요."}`,
          `${B.n}의 일지는 ${dayB.branchGod}, 그래서 ${eul(GROUP_PERSON[wantB])} 바라요. 실제 ${A.n}의 가장 센 기운은 ${a.dominantGroup}, ${ieyo(GROUP_PERSON[a.dominantGroup])}. ${wantB === a.dominantGroup ? "바라던 모습 그대로의 사람을 만났어요." : "바라는 모습과 조금 달라요. 상대가 어떤 표현을 사랑으로 느끼는지 물어보세요."}`,
        ],
      },
      {
        title: "부부궁의 합과 충",
        scene: { kind: "couple", variant: c.dayBranch === "clash" || c.dayBranch === "wonjin" ? "river" : "warm" },
        bubbles: [
          PALACE_SHORT[c.dayBranch],
          c.stem === "hap" ? "하늘(일간)에서는 **천간합**이 맺어져 있어요. 마음이 먼저 통하는 부부예요." : c.stem === "same" ? "하늘(일간)은 같은 오행이에요. 친구 같은 부부예요." : c.stem === "gen-ab" || c.stem === "gen-ba" ? "하늘(일간)은 **상생**이에요. 한 사람이 다른 사람을 키워 주는 부부예요." : "하늘(일간)은 **상극**이에요. 서로를 다듬어 주는 부부예요.",
          c.strength === "balanced" ? "한 사람은 신강, 한 사람은 신약이라 이끄는 쪽과 살피는 쪽이 자연스럽게 나뉘어요." : c.strength === "both-strong" ? "둘 다 신강해서 각자 주관이 뚜렷해요. 영역을 나눠 각자 결정권을 갖는 게 좋아요." : "둘 다 신약해서 섬세해요. 바깥의 힘든 일에 함께 흔들리기 쉬우니, 서로가 서로의 쉼터가 되어 주세요.",
        ],
        badges: [`일지 ${dayA.branchKo}·${dayB.branchKo}`, `궁합 ${c.score}°`],
      },
      {
        title: "서로를 채우는 오행",
        scene: { kind: "exchange", elA: a.yongshin, elB: b.yongshin },
        bubbles: [
          `${A.n}에게 필요한 기운은 **${elName(a.yongshin)}**, ${B.n}에게 필요한 기운은 **${ieyo(`${elName(b.yongshin)}**`)}.`,
          `${elRow(a.yongshin)}\n${a.yongshin === b.yongshin ? "" : elRow(b.yongshin)}`.trim(),
          c.bFillsA ? `${B.n}의 사주에 ${A.n}의 용신이 넉넉해요. ${A.eun} ${B.n} 곁에서 마음이 놓이고 일이 풀려요.` : `${B.n}의 사주에는 ${A.n}의 용신이 많지 않아요. ${A.n}의 기운은 생활 습관(「${kA.habit}」)으로 채워 주세요.`,
          c.aFillsB ? `${A.n}의 사주에 ${B.n}의 용신이 넉넉해요. ${B.eun} ${A.n} 곁에서 힘을 얻어요.` : `${A.n}의 사주에는 ${B.n}의 용신이 많지 않아요. ${B.n}의 기운은 생활 습관(「${kB.habit}」)으로 채워 주세요.`,
          c.sharedLack.length ? `두 사람 모두 **${c.sharedLack.map(elName).join(", ")}** 기운이 없어요. 집 안에 이 기운의 색(${c.sharedLack.map((e) => KAEUN_DECK[e].color).join(", ")})을 들이고, 「${eul(`${KAEUN_DECK[c.sharedLack[0]].habit}」`)} 함께 해 보세요.` : "",
          c.sharedExcess.length ? `두 사람 모두 **${c.sharedExcess.map(elName).join(", ")}** 기운이 넘쳐요. 이 기운이 겹치면 같은 문제로 동시에 예민해져요.` : "",
        ].filter(Boolean),
      },
      {
        title: "흔들리는 해, 단단해지는 해",
        scene: { kind: "stones", items: c.years.slice(0, 6).map((y, i) => ({ label: String(y.year), sub: gz(a.flows[i].stem, a.flows[i].branch), kind: y.together, mark: y.bothUp })) },
        bubbles: [
          careYears.length
            ? `**${careYears
                .slice(0, 4)
                .map((y) => `${y.year}년`)
                .join(", ")}**에는 부부 사이를 더 챙겨야 해요. 한 사람의 배우자 자리에 충이 들거나, 둘 다 기운이 낮은 해예요. 예를 들어 이사·이직이 겹치거나, 바쁨 때문에 대화가 줄어드는 일이 생기기 쉬워요.`
            : "앞으로 10년 동안 부부 사이를 크게 흔드는 해는 보이지 않아요.",
          upYears.length
            ? `**${upYears
                .slice(0, 4)
                .map((y) => `${y.year}년`)
                .join(", ")}**에는 둘 다 순풍이 불어요. 함께 큰일을 이루며 사이가 단단해지는 해예요.`
            : "둘이 동시에 크게 도약하는 해는 드물어요. 한 사람이 올라갈 때 다른 사람이 받쳐 주며 번갈아 가는 부부예요.",
        ],
      },
      {
        title: "부부로서 함께 해야 할 행동",
        scene: doScene(["🍵", "🗓️", "🙏", "🏠"]),
        bubbles: [
          `✔ ${A.eun} ${B.n}에게 ${eul(GROUP_PERSON[wantB])} 보여 주세요. ${B.n}의 배우자 자리가 가장 바라는 모습이에요.`,
          `✔ ${B.eun} ${A.n}에게 ${eul(GROUP_PERSON[wantA])} 보여 주세요. ${A.n}의 배우자 자리가 가장 바라는 모습이에요.`,
          `✔ 부부에게 좋은 방향은 ${A.n} 기준 **${kA.direction}**, ${B.n} 기준 **${kB.direction}**이에요. 여행지나 산책 코스를 이쪽으로 골라 보세요.`,
          careYears.length ? `✔ **${careYears[0].year}년**이 오기 전에, 힘들 때 서로에게 바라는 것을 미리 이야기해 두세요.` : "✔ 해마다 한 번, 둘만의 한 해 계획을 세우는 날을 만드세요.",
        ],
      },
      {
        title: "부부로서 함께 피해야 할 행동",
        scene: dontScene(["🗯️", "👪", "🚪", "🧊"]),
        bubbles: [
          c.dayBranch === "clash" ? "✖ 상대의 생활 습관을 고치려 들지 마세요. 충이 있는 부부는 「각자의 방식」을 인정할 때 평화로워요." : c.dayBranch === "wonjin" ? "✖ 서운함을 농담처럼 비꼬아 말하지 마세요. 원진이 있는 부부에게는 작은 말이 오래 남아요." : "✖ 편하다고 무심해지지 마세요. 합이 좋은 부부일수록 표현이 줄어들기 쉬워요.",
          "✖ 다툼에 양가 부모님이나 친구를 끌어들이지 마세요. 둘의 문제는 둘 안에서 푸세요.",
          c.strength === "both-strong" ? "✖ 둘 다 강한 사주라 「누가 옳은가」로 싸우면 끝이 없어요. 옳고 그름 대신 「어떻게 할까」를 이야기하세요." : c.strength === "both-weak" ? "✖ 둘 다 섬세한 사주라 함께 걱정에 빠지기 쉬워요. 밤늦게 미래 걱정을 길게 나누지 마세요." : "✖ 한 사람만 계속 참는 관계가 되지 않게 하세요. 살피는 쪽의 마음도 물어 주세요.",
          careYears.length ? `✖ **${careYears.slice(0, 3).map((y) => `${y.year}년`).join(", ")}**에는 홧김에 내리는 큰 결정(이사, 퇴사, 별거 이야기)을 피하세요.` : "✖ 화가 난 상태로 잠들지 마세요.",
        ],
      },
    ],
  };

  /* ============ 자녀 ============ */
  const childG = (x: Analysis): TenGodGroup => (x.input.gender === "male" ? "관성" : "식상");
  const cnA = a.groupCounts[childG(a)];
  const cnB = b.groupCounts[childG(b)];
  const hourA = a.pillars.find((p) => p.key === "hour");
  const hourB = b.pillars.find((p) => p.key === "hour");
  const childYears = a.flows
    .map((fa, i) => {
      const fb = b.flows[i];
      const hitA = TEN_GOD_GROUP[fa.god] === childG(a) || TEN_GOD_GROUP[fa.branchGod] === childG(a);
      const hitB = TEN_GOD_GROUP[fb.god] === childG(b) || TEN_GOD_GROUP[fb.branchGod] === childG(b);
      return { year: fa.year, hitA, hitB };
    })
    .filter((y) => y.hitA || y.hitB);
  const bothChild = childYears.filter((y) => y.hitA && y.hitB);
  const strict = (x: Analysis) => x.groupCounts["관성"] + x.groupCounts["비겁"];
  const warm = (x: Analysis) => x.groupCounts["인성"] + x.groupCounts["식상"];
  const [firm, soft] = strict(a) - warm(a) >= strict(b) - warm(b) ? [A, B] : [B, A];
  const hourLine = (who: N, x: Analysis, h: typeof hourA) =>
    h
      ? `${who.n}의 시주는 **${ieyo(`${h.stemKo}${h.branchKo}(${h.branchGod})**`)}. ${CHILD_STYLE[TEN_GOD_GROUP[h.branchGod]]}`
      : `${who.n}의 태어난 시간을 몰라서 자녀 자리(시주)는 비워 두었어요. 시간을 알게 되면 더 자세히 볼 수 있어요.`;
  const childrenCard: Story = {
    id: "children",
    title: "우리 아이",
    icon: "🌱",
    tagline: `자녀의 별 ${A.n} ${cnA} · ${B.n} ${cnB}`,
    pages: [
      {
        title: "두 사람의 자녀 별",
        scene: { kind: "nest", eggs: Math.max(cnA, cnB) },
        bubbles: [
          "자녀의 별은 성별에 따라 달라요. 여성에게는 내가 낳고 기르는 기운인 **식상**, 남성에게는 나를 책임감 있게 만드는 **관성**이 자녀예요.",
          `${A.n}의 자녀 별(${childG(a)})은 **${cnA}개**, ${B.n}의 자녀 별(${childG(b)})은 **${cnB}개**예요.`,
          cnA + cnB === 0
            ? "두 사람 모두 원국에 자녀의 별이 드러나 있지 않아요. 걱정할 일은 아니에요. 이런 부부는 **자녀의 별이 들어오는 해**(뒤에서 알려드려요)에 인연이 닿아요."
            : cnA > 0 && cnB > 0
              ? "두 사람 모두 자녀의 별을 가지고 있어요. 자녀 인연이 또렷한 부부예요."
              : `${cnA > 0 ? A.n : B.n}의 사주에 자녀의 별이 있고, ${cnA > 0 ? B.n : A.n}의 사주에는 드러나 있지 않아요. 아이와의 정서적 끈은 ${cnA > 0 ? A.n : B.n} 쪽이 먼저 깊어지기 쉬워요.`,
        ],
      },
      {
        title: "자녀의 자리, 두 사람의 시주",
        scene: { kind: "children", count: Math.max(1, Math.min(4, Math.max(cnA, cnB))), unknown: !hourA && !hourB },
        bubbles: ["태어난 시간의 기둥인 **시주**는 자녀와 노년의 자리예요.", hourLine(A, a, hourA), hourLine(B, b, hourB)],
      },
      {
        title: "부모로서의 두 사람",
        scene: { kind: "family", kids: Math.max(1, Math.min(3, Math.max(cnA, cnB))) },
        bubbles: [
          `${A.n} — ${PARENT_TIP[a.dayStem]}`,
          `${B.n} — ${PARENT_TIP[b.dayStem]}`,
          `사주의 기운으로 보면 ${firm.i} 규칙과 원칙을 세우는 부모, ${soft.i} 품어 주고 들어 주는 부모 역할이 잘 맞아요. 예를 들어 아이가 잘못했을 때 ${firm.i} 기준을 말해 주고, ${soft.i} 아이의 마음을 들어 주는 식이에요.`,
        ],
      },
      {
        title: "자녀 인연이 닿는 해",
        scene: {
          kind: "stones",
          items: a.flows.slice(0, 6).map((f) => ({ label: String(f.year), sub: gz(f.stem, f.branch), kind: f.kind, mark: childYears.some((y) => y.year === f.year) })),
        },
        bubbles: [
          childYears.length
            ? childYears
                .slice(0, 5)
                .map((y) => `${y.year}년 — ${y.hitA && y.hitB ? "두 사람 모두에게 자녀의 별" : `${y.hitA ? A.n : B.n}에게 자녀의 별`}`)
                .join("\n")
            : "앞으로 10년 동안 자녀의 별이 뚜렷이 드는 해는 적어요.",
          bothChild.length
            ? `특히 **${bothChild.map((y) => `${y.year}년`).join(", ")}**은 두 사람 모두에게 자녀의 별이 들어와요. 임신·출산 계획, 또는 아이의 입학·진로처럼 큰일을 준비하기에 가장 좋은 해예요.`
            : "두 사람에게 동시에 자녀의 별이 드는 해는 없어요. 한 사람에게 별이 드는 해를 기준으로 계획해 보세요.",
          "자녀의 별이 드는 해는 임신·출산만이 아니라, 아이와 관련된 새로운 장이 열리는 해를 뜻해요.",
        ],
      },
      {
        title: "부모로서 함께 해야 할 행동",
        scene: doScene(["📚", "🤗", "⚖️", "🌳"]),
        bubbles: [
          `✔ 훈육의 기준은 ${firm.i}, 위로는 ${soft.i} 맡으세요. 단, 아이 앞에서는 항상 한 팀이어야 해요.`,
          "✔ 아이에 대한 큰 결정(학교, 학원, 이사)은 두 사람의 점수가 함께 높은 달에 정하세요.",
          bothChild.length ? `✔ **${bothChild[0].year}년**을 자녀 계획의 기준 해로 삼아 건강과 저축을 미리 준비하세요.` : "✔ 자녀 계획이 있다면 두 사람의 건강 검진부터 함께 받으세요.",
          "✔ 일주일에 한 번, 아이 없이 둘이 이야기하는 시간을 지키세요. 부부 사이가 좋아야 아이도 편안해요.",
        ],
      },
      {
        title: "부모로서 함께 피해야 할 행동",
        scene: dontScene(["🗯️", "📏", "🙅", "📱"]),
        bubbles: [
          "✖ 아이 앞에서 서로의 훈육을 뒤집지 마세요. 의견이 달라도 그 자리에서는 따르고, 나중에 둘이 이야기하세요.",
          "✖ 아이를 사이에 두고 「엄마한테 말해」 「아빠한테 물어봐」 하며 책임을 미루지 마세요.",
          `✖ ${firm.eun} 기준이 지나쳐 다그치지 않게, ${soft.eun} 마음이 약해 원칙을 무너뜨리지 않게 서로 신호를 정해 두세요.`,
          "✖ 다른 집 아이와 비교하는 말은 두 사람 모두 금지예요.",
        ],
      },
    ],
  };

  return [yearCard(1), yearCard(0), monthCard, moneyCard, loveCard, workCard, marriageCard, childrenCard];
}
