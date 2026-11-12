/**
 * MASA 카드 덱 — 모든 카드 문구는 여기서 고정된다.
 * 결과 화면은 이 덱에서 카드를 "고르기만" 하고, 긴 글을 생성하지 않는다.
 */
import type { Element, TenGod, TenGodGroup } from "./saju/constants";
import type { FlowKind, Shinsal } from "./saju/engine";

/* ① 일주 카드: 일간 10종 × 지지 12종 */
export const DAY_STEM_DECK: Record<
  string,
  { color: string; image: string; keywords: [string, string]; line: string }
> = {
  甲: { color: "푸른", image: "큰 나무", keywords: ["곧음", "리더십"], line: "정한 길은 위로 곧게 뻗어간다" },
  乙: { color: "푸른", image: "꽃과 덩굴", keywords: ["유연함", "친화력"], line: "휘어도 꺾이지 않는 생명력" },
  丙: { color: "붉은", image: "태양", keywords: ["열정", "표현력"], line: "있는 곳을 환하게 밝힌다" },
  丁: { color: "붉은", image: "촛불", keywords: ["섬세함", "따뜻함"], line: "작지만 오래 타는 불꽃" },
  戊: { color: "노란", image: "큰 산", keywords: ["듬직함", "포용력"], line: "흔들리지 않는 중심이 된다" },
  己: { color: "노란", image: "기름진 땅", keywords: ["실속", "배려"], line: "사람과 일을 키워내는 땅" },
  庚: { color: "하얀", image: "바위와 쇠", keywords: ["결단력", "의리"], line: "아니다 싶으면 바로 끊어낸다" },
  辛: { color: "하얀", image: "보석", keywords: ["감각", "자존심"], line: "다듬을수록 빛나는 보석" },
  壬: { color: "검은", image: "큰 바다", keywords: ["스케일", "자유"], line: "막히면 돌아서라도 간다" },
  癸: { color: "검은", image: "비와 이슬", keywords: ["직관", "감수성"], line: "조용히 스며들어 바꾼다" },
};

export const BRANCH_KEYWORD: Record<string, string> = {
  子: "영리함", 丑: "끈기", 寅: "용기", 卯: "다정함", 辰: "포부", 巳: "통찰",
  午: "에너지", 未: "온화함", 申: "재치", 酉: "깔끔함", 戌: "충직함", 亥: "순수함",
};

/* ② 기질 카드: 주도 십성 10종 */
export const TEN_GOD_DECK: Record<
  TenGod,
  { title: string; keywords: [string, string, string]; line: string; strength: string; weakness: string; stress: string }
> = {
  비견: { title: "독립군", keywords: ["주체성", "자존감", "고집"], line: "내 방식대로 해야 직성이 풀린다", strength: "흔들림 없는 자기 확신", weakness: "도움 요청이 서툴다", stress: "혼자 끌어안고 버틴다" },
  겁재: { title: "승부사", keywords: ["경쟁심", "배짱", "추진력"], line: "지는 건 절대 못 참는다", strength: "판을 뒤집는 배짱", weakness: "충동적인 결정", stress: "더 세게 밀어붙인다" },
  식신: { title: "장인", keywords: ["여유", "재능", "몰입"], line: "좋아하는 일을 깊게 판다", strength: "꾸준히 결과물을 낸다", weakness: "느긋해서 기회를 놓침", stress: "먹고 자며 회피한다" },
  상관: { title: "혁신가", keywords: ["말솜씨", "창의력", "비판력"], line: "틀을 깨고 새 길을 낸다", strength: "누구보다 빠른 아이디어", weakness: "말이 앞서 적을 만듦", stress: "날카롭게 쏘아붙인다" },
  편재: { title: "모험가", keywords: ["수완", "사교성", "스케일"], line: "기회를 보면 바로 움직인다", strength: "사람과 돈을 모으는 힘", weakness: "벌인 일 마무리가 약함", stress: "일을 더 벌린다" },
  정재: { title: "살림꾼", keywords: ["성실", "계획", "신용"], line: "차곡차곡 쌓아 올린다", strength: "믿고 맡길 수 있는 꼼꼼함", weakness: "변화 앞에서 망설임", stress: "통제하려고 집착한다" },
  편관: { title: "전사", keywords: ["카리스마", "책임감", "돌파력"], line: "압박 속에서 더 강해진다", strength: "위기에 강한 리더십", weakness: "스스로를 혹사함", stress: "예민하고 공격적이 된다" },
  정관: { title: "모범 리더", keywords: ["원칙", "신뢰", "품위"], line: "규칙 안에서 인정받는다", strength: "흔들리지 않는 책임감", weakness: "체면에 갇히기 쉬움", stress: "속으로 삭이며 참는다" },
  편인: { title: "탐구자", keywords: ["직관", "독창성", "몰입"], line: "남들이 못 보는 걸 본다", strength: "남다른 통찰과 아이디어", weakness: "시작은 많고 끝은 적음", stress: "혼자 동굴로 들어간다" },
  정인: { title: "학자", keywords: ["학습", "수용력", "인덕"], line: "배우고 품으며 성장한다", strength: "주변의 도움을 끌어온다", weakness: "생각만 하다 늦어짐", stress: "걱정이 꼬리를 문다" },
};

/* ③ 연애 카드 4종 */
export type LoveCardId = "dohwa" | "many" | "deep" | "late";
export const LOVE_DECK: Record<LoveCardId, { title: string; glyph: string; keywords: [string, string, string]; line: string }> = {
  dohwa: { title: "끌림의 꽃", glyph: "桃花", keywords: ["매력", "첫인상", "인기"], line: "가만히 있어도 시선이 모인다" },
  many: { title: "인연 부자", glyph: "多緣", keywords: ["사교", "설렘", "선택 고민"], line: "만나는 것보다 고르는 눈이 중요" },
  deep: { title: "한 사람에게 깊이", glyph: "一心", keywords: ["진심", "헌신", "안정"], line: "오래 볼수록 진가가 나온다" },
  late: { title: "늦게 피는 꽃", glyph: "晩花", keywords: ["신중함", "자기 성장", "늦은 인연"], line: "서두르지 않을 때 인연이 온다" },
};
export const SPOUSE_PALACE_CONFLICT: Record<TenGodGroup, string> = {
  비겁: "주도권 다툼",
  식상: "말로 주는 상처",
  재성: "돈·시간 문제",
  관성: "기대와 통제",
  인성: "표현 부족",
};

/* ④ 직업 카드 5종 (주도 십성 그룹) */
export const WORK_DECK: Record<TenGodGroup, { title: string; glyph: string; keywords: [string, string, string]; line: string; jobs: [string, string, string] }> = {
  비겁: { title: "독립 개척자형", glyph: "開拓", keywords: ["자율", "주도", "사업"], line: "내 이름 걸고 하는 일에 강하다", jobs: ["창업·자영업", "프리랜서", "현장 리더"] },
  식상: { title: "크리에이터형", glyph: "創作", keywords: ["기획", "표현", "기술"], line: "아이디어를 결과물로 만든다", jobs: ["콘텐츠·디자인", "기획·마케팅", "교육·강연"] },
  재성: { title: "비즈니스형", glyph: "經營", keywords: ["수완", "협상", "성과"], line: "숫자와 결과로 증명한다", jobs: ["영업·유통", "금융·투자", "사업 운영"] },
  관성: { title: "조직 리더형", glyph: "統率", keywords: ["책임", "관리", "승진"], line: "시스템 안에서 위로 올라간다", jobs: ["공공기관·대기업", "법·행정", "관리직"] },
  인성: { title: "전문가형", glyph: "專門", keywords: ["분석", "지식", "자격"], line: "깊이 파서 대체 불가가 된다", jobs: ["연구·개발", "의료·상담", "전문 자격직"] },
};

/* ⑤ 재물 카드 5종 */
export type MoneyCardId = "talent" | "leak" | "stable" | "value" | "steady";
export const MONEY_DECK: Record<MoneyCardId, { title: string; glyph: string; keywords: [string, string, string]; line: string; income: string }> = {
  talent: { title: "재능이 돈이 되는", glyph: "食財", keywords: ["재능 수익화", "부업", "콘텐츠"], line: "잘하는 걸 팔 때 돈이 붙는다", income: "사업·프리랜서 소득" },
  leak: { title: "들어온 만큼 나가는", glyph: "爭財", keywords: ["씀씀이", "인맥 지출", "동업 주의"], line: "버는 힘보다 지키는 힘이 숙제", income: "자동 저축 + 근로소득" },
  stable: { title: "안정 축적형", glyph: "財官", keywords: ["월급", "신용", "장기 저축"], line: "신용이 곧 자산이 된다", income: "근로소득 + 장기 투자" },
  value: { title: "가치 우선형", glyph: "名譽", keywords: ["명예", "전문성", "실력"], line: "돈을 좇기보다 실력이 부른다", income: "전문직·자격 기반 소득" },
  steady: { title: "꾸준 저축형", glyph: "積金", keywords: ["근면", "절약", "적립식"], line: "작은 돈을 오래 굴린다", income: "근로소득 + 적립식 투자" },
};

/* ⑥ 개운 카드 5종 (용신 오행) */
export const KAEUN_DECK: Record<Element, { title: string; keywords: [string, string, string]; line: string; color: string; direction: string; number: string; habit: string }> = {
  wood: { title: "나무의 기운을 채워라", keywords: ["봄", "배움", "성장"], line: "자라나는 기운을 곁에 두세요", color: "초록·청록", direction: "동쪽", number: "3·8", habit: "아침 산책" },
  fire: { title: "불의 기운을 채워라", keywords: ["여름", "햇빛", "사람"], line: "밝고 따뜻한 곳으로 나가세요", color: "빨강·주황", direction: "남쪽", number: "2·7", habit: "햇빛 쬐기" },
  earth: { title: "흙의 기운을 채워라", keywords: ["환절기", "루틴", "안정"], line: "단단한 루틴이 운을 붙잡아요", color: "노랑·베이지", direction: "중앙", number: "5·10", habit: "규칙적인 식사" },
  metal: { title: "쇠의 기운을 채워라", keywords: ["가을", "정리", "결단"], line: "덜어내고 다듬을수록 맑아져요", color: "흰색·은색", direction: "서쪽", number: "4·9", habit: "정리정돈·근력운동" },
  water: { title: "물의 기운을 채워라", keywords: ["겨울", "휴식", "지혜"], line: "고요히 채우는 시간이 필요해요", color: "검정·남색", direction: "북쪽", number: "1·6", habit: "충분한 수면·독서" },
};

/* ⑦ 10년 흐름 미니카드 */
export const FLOW_DECK: Record<FlowKind, { label: string; arrow: string }> = {
  chance: { label: "기회", arrow: "↑" },
  prepare: { label: "준비", arrow: "→" },
  careful: { label: "보수", arrow: "↓" },
};
export const YEAR_GOD_KEYWORD: Record<TenGod, string> = {
  비견: "자기 확장",
  겁재: "경쟁·지출",
  식신: "재능 발휘",
  상관: "변화·표현",
  편재: "큰 기회",
  정재: "안정 수입",
  편관: "도전·압박",
  정관: "승진·자리",
  편인: "공부·전환",
  정인: "도움·문서",
};

/* 특별 카드: 신살 배지 */
export const SHINSAL_DECK: Record<Shinsal["id"], { name: string; glyph: string; meaning: string }> = {
  dohwa: { name: "도화", glyph: "桃", meaning: "매력·인기" },
  yeokma: { name: "역마", glyph: "馬", meaning: "이동·해외" },
  hwagae: { name: "화개", glyph: "華", meaning: "예술·영성" },
  cheoneul: { name: "천을귀인", glyph: "貴", meaning: "귀인의 도움" },
  munchang: { name: "문창귀인", glyph: "文", meaning: "학문·글재주" },
  baekho: { name: "백호", glyph: "虎", meaning: "강한 추진력" },
  goegang: { name: "괴강", glyph: "魁", meaning: "카리스마" },
};
