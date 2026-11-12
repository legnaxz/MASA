/**
 * 커플 사주 이야기 — 부부합, 잘 맞는 점, 다른 점, 함께 헤쳐나갈 길
 */
import { BRANCH_ANIMAL, BRANCH_KO, ELEMENT_INFO, STEM_KO, TEN_GOD_GROUP, type Element } from "../saju/constants";
import type { BranchRelation, Compat } from "../saju/compat";
import { DAY_STEM_DECK, KAEUN_DECK } from "../deck";
import { LOVE_PATTERN, elName, eul, eun, iga, ieyo, wa } from "./text";
import type { Story } from "./types";

/** 이름 조사 — "나"는 주격이 "내가" */
function names(raw: string) {
  const n = raw.trim();
  return {
    n,
    i: n === "나" ? "내가" : iga(n),
    eun: eun(n),
    eul: eul(n),
    wa: wa(n),
  };
}

const EXCESS_TEXT: Record<Element, string> = {
  wood: "고집과 추진력이 겹쳐서, 서로 물러서지 않는 순간이 생기기 쉬워요.",
  fire: "감정이 빨리 달아오르고 말이 빨라져서, 작은 다툼이 커지기 쉬워요.",
  earth: "둘 다 신중해서 결정이 늦어지고, 필요한 변화를 미루기 쉬워요.",
  metal: "둘 다 원칙이 분명해서, 옳고 그름을 따지다 마음을 다치기 쉬워요.",
  water: "둘 다 생각이 깊어서, 속마음을 말하지 않고 넘어가기 쉬워요.",
};

const LACK_TEXT: Record<Element, string> = {
  wood: "새로운 시작을 함께 미루기 쉬운 조합이에요.",
  fire: "서로에게 표현하고 칭찬하는 일이 줄어들기 쉬운 조합이에요.",
  earth: "돈 관리나 집안일 같은 생활의 중심이 흔들리기 쉬운 조합이에요.",
  metal: "결단을 미루고 정리를 못 하기 쉬운 조합이에요.",
  water: "쉬어 가는 시간이 부족해 함께 지치기 쉬운 조합이에요.",
};

const YEAR_REL: Record<BranchRelation, string> = {
  hap: "서로 끌어당기는 **육합**이에요.",
  samhap: "같은 뜻을 품은 **삼합**의 짝이에요.",
  same: "같은 띠라 서로의 마음을 잘 알아요.",
  clash: "서로 반대편에 선 **충**이라 성향 차이가 있어요.",
  wonjin: "미묘한 서운함이 쌓이기 쉬운 **원진**이에요.",
  none: "무난하게 잘 어울려요.",
};

function band(score: number) {
  if (score >= 85) return "서로를 끌어당기는 따뜻한 인연이에요.";
  if (score >= 72) return "함께할수록 깊어지는 인연이에요.";
  if (score >= 58) return "서로 맞춰 가며 단단해지는 인연이에요.";
  return "다름을 배우며 함께 자라는 인연이에요.";
}

export function coupleHeadline(score: number) {
  return band(score);
}

export function buildCoupleStory(c: Compat, nameA: string, nameB: string): Story {
  const A = names(nameA || "나");
  const B = names(nameB || "상대");
  const { a, b } = c;
  const dA = DAY_STEM_DECK[a.dayStem];
  const dB = DAY_STEM_DECK[b.dayStem];
  const dayA = a.pillars.find((p) => p.key === "day")!;
  const dayB = b.pillars.find((p) => p.key === "day")!;
  const yA = a.pillars.find((p) => p.key === "year")!;
  const yB = b.pillars.find((p) => p.key === "year")!;
  const ilgan = (x: typeof a) => `${STEM_KO[x.dayStem]}${ELEMENT_INFO[x.dayEl].ko}`;
  const starName = (x: typeof a) => (x.input.gender === "male" ? "재성" : "관성");

  /* ---------- 일간 관계 ---------- */
  const stemText: string[] = [];
  switch (c.stem) {
    case "hap":
      stemText.push(
        `두 사람의 일간은 **${STEM_KO[a.dayStem]}${STEM_KO[b.dayStem]}합(合)**을 이뤄요. 천간합은 하늘이 맺어준 끌림이라고 불러요. 처음부터 묘하게 편하고, 서로에게 자연스럽게 마음이 가는 사이예요.`,
        `둘이 합하면 **${elName(c.stemHapEl!)}** 기운으로 바뀌어요. 함께 있을 때 혼자서는 없던 새로운 힘이 생긴다는 뜻이에요.`,
      );
      break;
    case "same":
      stemText.push(
        `두 사람 모두 **${elName(a.dayEl)}** 일간이에요. 친구처럼 말이 잘 통하고, 가치관과 속도가 비슷한 사이예요.`,
        "대신 둘 다 같은 방향으로 고집을 부리면 물러서는 사람이 없어요. 번갈아 양보하는 규칙을 정해 두면 좋아요.",
      );
      break;
    case "gen-ab":
    case "gen-ba": {
      const [G, R, ge, re] = c.stem === "gen-ab" ? [A, B, a.dayEl, b.dayEl] : [B, A, b.dayEl, a.dayEl];
      stemText.push(
        `${G.n}의 **${iga(`${elName(ge)}**`)} ${R.n}의 **${eul(`${elName(re)}**`)} 살려주는 **상생(相生)** 관계예요. 나무가 불을 피우듯, 한 사람이 다른 사람을 자라게 하는 흐름이에요.`,
        `${G.i} 챙겨 주고 ${R.i} 기대는 모습이 되기 쉬워요. ${R.eun} 받은 만큼 고마움을 자주 표현해 주면 균형이 맞춰져요.`,
      );
      break;
    }
    default: {
      const [G, R, ge, re] = c.stem === "ctrl-ab" ? [A, B, a.dayEl, b.dayEl] : [B, A, b.dayEl, a.dayEl];
      stemText.push(
        `${G.n}의 **${iga(`${elName(ge)}**`)} ${R.n}의 **${eul(`${elName(re)}**`)} 다스리는 **상극(相剋)** 관계예요.`,
        `극이라고 나쁜 것만은 아니에요. 나무를 다듬어야 좋은 재목이 되듯, ${G.i} ${R.eul} 단단하게 만들어 주는 관계예요. 다만 ${G.n}의 조언이 ${R.n}에게는 간섭으로 들릴 수 있어요.`,
      );
    }
  }
  if (c.bIsSpouseStarOfA && c.aIsSpouseStarOfB) {
    stemText.push("게다가 **서로가 서로에게 배우자의 별**이에요. 명리학에서 손꼽히는 반가운 짝이에요.");
  } else if (c.bIsSpouseStarOfA) {
    stemText.push(`게다가 ${B.n}의 일간은 ${A.n}에게 **배우자의 별(${starName(a)})**이에요. 명리학에서 아주 반가운 짝으로 봐요.`);
  } else if (c.aIsSpouseStarOfB) {
    stemText.push(`게다가 ${A.n}의 일간은 ${B.n}에게 **배우자의 별(${starName(b)})**이에요. 명리학에서 아주 반가운 짝으로 봐요.`);
  }

  /* ---------- 일지(부부궁) 관계 ---------- */
  const palace: Record<BranchRelation, string> = {
    hap: "두 사람의 배우자 자리(일지)가 **육합(六合)**을 이뤄요. 한 지붕 아래서 생활 리듬이 잘 맞고, 함께 있을수록 편안해지는 **부부합**이에요.",
    samhap: "두 사람의 배우자 자리(일지)가 **삼합(三合)**의 한 무리예요. 같은 곳을 바라보는 동지 같은 부부예요. 함께 목표를 세우면 힘이 몇 배가 돼요.",
    same: "두 사람의 배우자 자리(일지)가 같은 글자예요. 생활 방식이 닮아 편하지만, 같은 일에 동시에 예민해질 수 있어요.",
    clash: "두 사람의 배우자 자리(일지)가 서로 **충(沖)**을 해요. 생활 습관이나 속도가 달라 부딪히기 쉬워요. 하지만 충은 움직임이기도 해서, 함께 여행하거나 새로운 도전을 할 때 오히려 활력이 생겨요.",
    wonjin: "두 사람의 배우자 자리(일지)가 **원진(怨嗔)** 관계예요. 큰 다툼보다는 이유 모를 서운함이 쌓이기 쉬운 조합이라, 작은 서운함을 그날그날 풀어 주는 게 중요해요.",
    none: "두 사람의 배우자 자리(일지)끼리 크게 끌거나 부딪히지 않아요. 잔잔하고 무난한 부부의 모습이에요.",
  };

  /* ---------- 잘 맞는 점 ---------- */
  const goods: string[] = [];
  if (c.stem === "hap") goods.push("**천간합** — 처음부터 서로에게 자연스럽게 끌리는 인연이에요.");
  if (c.stem === "gen-ab" || c.stem === "gen-ba") goods.push("**일간 상생** — 한 사람이 다른 사람을 키워 주는, 돌봄이 자연스러운 관계예요.");
  if (c.stem === "same") goods.push("**같은 오행 일간** — 말하지 않아도 통하는 친구 같은 편안함이 있어요.");
  if (c.dayBranch === "hap") goods.push("**부부궁 육합** — 함께 사는 리듬이 잘 맞아요.");
  if (c.dayBranch === "samhap") goods.push("**부부궁 삼합** — 같은 목표를 향해 함께 달릴 수 있어요.");
  if (c.bFillsA)
    goods.push(`**${B.n}의 사주가 ${A.eul} 채워 줘요** — ${A.n}에게 꼭 필요한 **${elName(a.yongshin)}** 기운이 ${B.n}에게 넉넉해서, 곁에 있으면 마음이 놓이고 일이 잘 풀리는 느낌을 받아요.`);
  if (c.aFillsB)
    goods.push(`**${A.n}의 사주가 ${B.eul} 채워 줘요** — ${B.n}에게 꼭 필요한 **${elName(b.yongshin)}** 기운이 ${A.n}에게 넉넉해요.`);
  if (c.bIsSpouseStarOfA || c.aIsSpouseStarOfB) goods.push("**배우자의 별** — 명리학에서 반가운 짝으로 보는 조합이에요.");
  if (c.strength === "balanced") goods.push("**강약의 균형** — 한 사람은 이끌고 한 사람은 살피며, 역할이 자연스럽게 나뉘어요.");
  if (c.yearBranch === "hap" || c.yearBranch === "samhap") goods.push(`**띠 궁합** — ${BRANCH_ANIMAL[yA.branch].ko}띠와 ${BRANCH_ANIMAL[yB.branch].ko}띠는 서로 잘 어울리는 짝이에요.`);
  if (goods.length < 2) goods.push("**서로 다른 시선** — 내게 없는 기운을 가진 사람이라, 상대에게서 새로운 관점을 배울 수 있어요.");

  /* ---------- 다른 점 ---------- */
  const bads: string[] = [];
  if (c.dayBranch === "clash") bads.push("**부부궁 충** — 생활 습관과 속도가 달라 일상에서 부딪히기 쉬워요.");
  if (c.dayBranch === "wonjin") bads.push("**부부궁 원진** — 말하지 않은 서운함이 조용히 쌓이기 쉬워요.");
  if (c.stem === "ctrl-ab") bads.push(`**일간 상극** — ${A.n}의 조언이 ${B.n}에게는 간섭이나 잔소리로 들리기 쉬워요.`);
  if (c.stem === "ctrl-ba") bads.push(`**일간 상극** — ${B.n}의 조언이 ${A.n}에게는 간섭이나 잔소리로 들리기 쉬워요.`);
  if (c.stem === "same") bads.push("**같은 오행 일간** — 둘 다 같은 쪽으로 고집을 부리면 평행선을 달리기 쉬워요.");
  for (const e of c.sharedExcess) bads.push(`**둘 다 ${elName(e)} 과다** — ${EXCESS_TEXT[e]}`);
  if (c.strength === "both-strong") bads.push("**둘 다 신강** — 각자 주관이 뚜렷해서 주도권 다툼이 생기기 쉬워요.");
  if (c.strength === "both-weak") bads.push("**둘 다 신약** — 섬세한 두 사람이라 바깥 스트레스에 함께 흔들릴 수 있어요.");
  if (c.yearBranch === "clash" || c.yearBranch === "wonjin")
    bads.push(`**띠 ${c.yearBranch === "clash" ? "충" : "원진"}** — ${BRANCH_ANIMAL[yA.branch].ko}띠와 ${BRANCH_ANIMAL[yB.branch].ko}띠는 성향 차이가 있는 편이에요.`);

  /* ---------- 함께 헤쳐나갈 길 ---------- */
  const kA = KAEUN_DECK[a.yongshin];
  const kB = KAEUN_DECK[b.yongshin];
  const cA = LOVE_PATTERN[TEN_GOD_GROUP[dayA.branchGod]].conflict;
  const cB = LOVE_PATTERN[TEN_GOD_GROUP[dayB.branchGod]].conflict;
  const road: string[] = [];
  if (c.sharedLack.length) {
    const e = c.sharedLack[0];
    road.push(
      `두 사람 모두 **${elName(e)}** 기운이 부족해요. ${LACK_TEXT[e]} 함께 「${eul(`${KAEUN_DECK[e].habit}」`)} 해 보세요. 둘에게 동시에 필요한 기운을 채우는 방법이에요.`,
    );
  } else {
    road.push(`서로의 부족한 기운을 챙겨 주세요. ${A.n}에게는 「${kA.habit}」, ${B.n}에게는 「${eul(`${kB.habit}」`)} 권해요. 상대의 습관을 함께해 주는 게 가장 좋은 선물이에요.`);
  }
  road.push(
    cA === cB
      ? `두 사람이 예민해지는 버튼은 똑같이 「${ieyo(`${cA}」`)}. 같은 곳이 아픈 만큼, 그 이야기는 더 천천히 꺼내 주세요.`
      : `${A.i} 예민해지는 버튼은 「${cA}」, ${B.i} 예민해지는 버튼은 「${ieyo(`${cB}」`)}. 서로의 버튼을 알고 있으면 다툼의 절반은 줄어요.`,
  );
  road.push(
    c.dayBranch === "clash"
      ? "부딪힐 때는 자리를 옮겨 이야기해 보세요. 집보다 함께 걷는 산책길에서 하는 대화가 훨씬 부드러워요."
      : c.dayBranch === "wonjin"
        ? "하루 끝에 「오늘 고마웠던 것 하나」를 서로 말해 보세요. 원진의 서운함을 녹이는 가장 쉬운 방법이에요."
        : "한 달에 한 번, 둘만의 계획을 세우는 날을 만들어 보세요. 같은 방향을 바라볼수록 인연은 더 깊어져요.",
  );

  /* ---------- 함께 걷는 10년 ---------- */
  const upYears = c.years.filter((y) => y.bothUp).map((y) => y.year);
  const careYears = c.years.filter((y) => y.care).map((y) => y.year);
  const list = (ys: number[]) => ys.slice(0, 4).map((y) => `${y}년`).join(", ");

  return {
    id: "couple",
    title: "우리 둘의 궁합",
    icon: "💞",
    tagline: `궁합 온도 ${c.score}°`,
    pages: [
      {
        title: "두 사람의 만남",
        scene: {
          kind: "duo",
          elA: a.dayEl,
          elB: b.dayEl,
          emojiA: BRANCH_ANIMAL[a.dayBranch].emoji,
          emojiB: BRANCH_ANIMAL[b.dayBranch].emoji,
          heat: c.score,
        },
        bubbles: [
          `${A.eun} ${dA.image} 같은 **${ilgan(a)} 일간**, ${B.eun} ${dB.image} 같은 **${ilgan(b)} 일간**이에요.`,
          `두 사람의 궁합 온도는 **${c.score}°**예요. ${band(c.score)}`,
          "지금부터 하늘(일간)의 인연, 한 지붕(일지)의 인연, 잘 맞는 점과 다른 점, 그리고 함께 걸어갈 길을 차례로 펼쳐 볼게요.",
        ],
        badges: ["궁합 온도는 재미로 보는 숫자예요"],
      },
      {
        title: "하늘이 맺은 인연 · 일간",
        scene: { kind: "stems", a: a.dayStem, b: b.dayStem, elA: a.dayEl, elB: b.dayEl, mode: c.stem },
        bubbles: stemText,
        badges: [`${A.n} ${STEM_KO[a.dayStem]}(${a.dayStem})`, `${B.n} ${STEM_KO[b.dayStem]}(${b.dayStem})`],
      },
      {
        title: "한 지붕 아래 · 부부궁",
        scene: { kind: "couple", variant: c.dayBranch === "clash" || c.dayBranch === "wonjin" ? "river" : "warm" },
        bubbles: [
          palace[c.dayBranch],
          `띠로 보면 **${BRANCH_ANIMAL[yA.branch].ko}띠**와 **${BRANCH_ANIMAL[yB.branch].ko}띠**, ${YEAR_REL[c.yearBranch]}`,
        ],
        badges: [`일지 ${dayA.branchKo} · ${dayB.branchKo}`, `띠 ${yA.branchKo} · ${yB.branchKo}`],
      },
      {
        title: "사주로 잘 맞는 점",
        scene: { kind: "exchange", elA: a.yongshin, elB: b.yongshin },
        bubbles: goods.slice(0, 5).map((g) => `✔ ${g}`),
      },
      {
        title: "사주로 맞지 않는 점",
        scene: { kind: "couple", variant: "river" },
        bubbles: bads.length
          ? [...bads.slice(0, 4).map((x) => `• ${x}`), "다른 점은 틀린 점이 아니에요. 어디서 부딪히는지 미리 알면, 그 자리에서 한 걸음 비켜설 수 있어요."]
          : ["사주에서 크게 부딪히는 글자가 없어요. 다만 너무 편한 사이일수록 서로에게 무심해지기 쉬우니, 작은 표현을 잊지 마세요."],
      },
      {
        title: "함께 헤쳐나갈 길",
        scene: { kind: "bridge" },
        bubbles: road,
      },
      {
        title: "함께 걷는 10년",
        scene: {
          kind: "stones",
          items: c.years.slice(0, 6).map((y, i) => ({
            label: String(y.year),
            sub: STEM_KO[a.flows[i].stem] + BRANCH_KO[a.flows[i].branch],
            kind: y.together,
            mark: y.bothUp,
          })),
        },
        bubbles: [
          "두 사람의 운을 한 해씩 겹쳐 봤어요. 초록 돌은 둘 다 순풍, 회색 돌은 함께 조심할 해예요.",
          upYears.length
            ? `**${list(upYears)}**에는 두 사람 모두에게 순풍이 불어요. 결혼, 이사, 큰 계획처럼 함께 도약할 일을 이때로 잡아 보세요.`
            : "앞으로 10년은 두 사람이 동시에 크게 도약하기보다, 한 사람이 다른 사람을 받쳐 주며 번갈아 올라가는 흐름이에요.",
          careYears.length
            ? `**${list(careYears)}**에는 한 사람의 자리가 흔들리거나 둘 다 쉬어 가는 해예요. 큰 결정은 서로 한 번 더 상의해 주세요.`
            : "함께 크게 흔들리는 해는 보이지 않아요. 든든한 흐름이에요.",
        ],
      },
    ],
  };
}
