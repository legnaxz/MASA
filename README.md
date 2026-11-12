# MASA 🔮

> 생년월일시로 보는 나의 사주팔자 — 웹에서 바로 확인하는 사주 풀이 앱

MASA는 태어난 날짜와 시간을 입력하면 **사주팔자(四柱八字)** 를 계산하고, 오행 분포와 일간(日干)을 바탕으로 성향·운세 풀이를 보여주는 웹 앱입니다. 별도 설치 없이 브라우저에서 바로 사용할 수 있으며, [Vercel](https://vercel.com)에 배포됩니다.

🌐 **Live Demo:** https://masa.vercel.app <!-- 배포 후 실제 주소로 변경 -->

---

## ✨ 주요 기능

결과는 긴 글이 아니라 **정해진 틀의 그림카드 7장**으로 나옵니다.

| 카드 | 고르는 기준 | 덱 |
| --- | --- | --- |
| ① 나 | 일주 (일간 × 일지) | 60갑자 |
| ② 기질 | 주도 십성 (동률이면 월령 우선) | 십성 10장 |
| ③ 연애 | 배우자성 개수 · 도화 · 배우자궁 충 | 4장 |
| ④ 일 | 주도 십성 그룹 | 5장 |
| ⑤ 재물 | 식상생재 · 재생관 · 비겁 과다 등 구조 | 5장 |
| ⑥ 개운 | 용신 오행 (색 · 방향 · 숫자 · 습관) | 5장 |
| ⑦ 10년 흐름 | 세운 오행이 용신/희신/기신인지 + 일지 충 | 기회 · 준비 · 보수 |

- **사주 원국 표** — 연·월·일·시주, 십성, 오행 분포, 신살 배지(도화·역마·화개·천을귀인·문창귀인·백호·괴강)
- **음력 · 윤달 · 시간 모름** 입력 지원, 한국 표준시 30분 보정 옵션
- **모바일 최적화** — 반응형 UI, 다크 모드, 카드 뒤집기 애니메이션

모든 카드 문구는 [`lib/deck.ts`](lib/deck.ts)에 고정되어 있고, 결과 화면은 덱에서 카드를 **고르기만** 합니다. 카드 한 장의 형식은 [`lib/cards.ts`](lib/cards.ts)의 `CardData`(제목 · 키워드 3개 · 한 줄 · 게이지 · 팁 최대 3개 · 근거 태그)로, 나중에 AI로 문구를 다듬을 때도 이 JSON만 채우게 하면 됩니다.

## 🛠 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| 만세력 / 음양력 변환 | [lunar-javascript](https://github.com/6tail/lunar-javascript) (절기 · 입춘 · 윤달 · 대운) |
| 해석 로직 | 자체 구현 (`lib/saju/engine.ts`) |
| Deploy | Vercel |

## 📁 프로젝트 구조

```
MASA/
├── app/
│   ├── page.tsx           # 입력 폼 + 카드 결과 화면
│   ├── layout.tsx
│   └── globals.css        # 색상 토큰, 카드 스타일
├── components/
│   ├── BirthForm.tsx      # 생년월일시 입력
│   ├── PillarTable.tsx    # 사주 원국 표 · 오행 분포 · 신살 배지
│   ├── SajuCard.tsx       # 카드 고정 틀
│   ├── CardArt.tsx        # 임시 일러스트 (오행 색 + 한자 + 띠 동물)
│   └── FlowCard.tsx       # ⑦ 10년 흐름 미니카드
├── lib/
│   ├── saju/
│   │   ├── constants.ts   # 천간 · 지지 · 오행 · 십성
│   │   └── engine.ts      # 원국 계산 · 신강약 · 용신 · 신살 · 대운 · 세운
│   ├── deck.ts            # 카드 덱 문구 (전부 고정)
│   └── cards.ts           # 분석 결과 → 카드 7장
└── types/                 # lunar-javascript 타입 선언
```

> 카드 그림은 현재 SVG로 만든 임시 일러스트입니다. 실제 그림이 준비되면 `CardArt.tsx`만 이미지로 교체하면 됩니다.

## 🚀 시작하기

### 요구 사항

- Node.js 18 이상
- npm (또는 pnpm / yarn)

### 로컬 실행

```bash
git clone https://github.com/legnaxz/MASA.git
```

```bash
cd MASA
```

```bash
npm install
```

```bash
npm run dev
```

브라우저에서 http://localhost:3000 을 열면 됩니다.

### 빌드

```bash
npm run build
```

```bash
npm run start
```

## ▲ Vercel 배포

1. 이 저장소를 GitHub에 푸시합니다.
2. [Vercel 대시보드](https://vercel.com/new)에서 **Import Git Repository** → `legnaxz/MASA` 선택
3. Framework Preset이 **Next.js**로 자동 인식되는지 확인
4. 환경 변수가 있다면 **Settings → Environment Variables** 에 추가
5. **Deploy** 클릭

이후 `main` 브랜치에 푸시하면 자동으로 프로덕션 배포되고, PR마다 Preview 배포가 생성됩니다.

CLI로 배포하려면:

```bash
npx vercel --prod
```

## 📖 사주 계산 방식

- **연주** — 입춘(立春)을 기준으로 해가 바뀝니다.
- **월주** — 24절기 중 12절(節)을 기준으로 월이 바뀝니다.
- **일주** — 기준일로부터 60갑자 순환으로 계산합니다.
- **시주** — 태어난 시각을 12지지 시간대(2시간 단위)로 나누고, 일간에 따라 시간(時干)을 정합니다.
- 한국 표준시(KST)와 실제 태양시의 차이(약 30분)는 옵션으로 보정할 수 있습니다.
- **신강/신약 · 용신**은 억부법을 단순화한 간이 판단입니다 (월지 가중치 2, 일간을 돕는 오행 비율 50% 이상이면 신강). 조후 · 격국은 아직 반영하지 않았습니다.

## ⚠️ 면책 조항

MASA의 사주 풀이는 전통 명리학을 바탕으로 한 **재미와 참고용 콘텐츠**입니다. 중요한 결정(건강·재정·법률 등)은 반드시 전문가와 상의하세요.

## 🗺 로드맵

- [ ] 궁합 보기
- [ ] 오늘의 운세 / 월운
- [ ] 결과 이미지 저장 및 SNS 공유
- [ ] 다국어 지원 (English)

## 🤝 기여

이슈와 PR은 언제든 환영합니다.

1. Fork
2. 브랜치 생성 (`git checkout -b feature/새기능`)
3. 커밋 (`git commit -m "feat: 새 기능 추가"`)
4. 푸시 후 Pull Request

## 📄 라이선스

MIT License © [legnaxz](https://github.com/legnaxz)
