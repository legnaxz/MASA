# MASA 🔮

> 생년월일시로 보는 나의 사주팔자 — 웹에서 바로 확인하는 사주 풀이 앱

MASA는 태어난 날짜와 시간을 입력하면 **사주팔자(四柱八字)** 를 계산하고, 오행 분포와 일간(日干)을 바탕으로 성향·운세 풀이를 보여주는 웹 앱입니다. 별도 설치 없이 브라우저에서 바로 사용할 수 있으며, [Vercel](https://vercel.com)에 배포됩니다.

🌐 **Live Demo:** https://masa.vercel.app <!-- 배포 후 실제 주소로 변경 -->

---

## ✨ 주요 기능

- **사주 원국 계산** — 생년월일·태어난 시간·양력/음력·성별을 입력하면 연주·월주·일주·시주(천간/지지) 산출
- **음력 ↔ 양력 변환** — 음력 생일(윤달 포함)도 그대로 입력 가능
- **오행 분석** — 목(木)·화(火)·토(土)·금(金)·수(水) 분포를 차트로 시각화
- **십성 / 일간 풀이** — 일간 기준 성격, 강점, 주의할 점 해석
- **대운 · 세운** — 10년 단위 대운과 올해의 운세 흐름
- **결과 공유** — 결과 페이지 링크 공유
- **모바일 최적화** — 반응형 UI, 다크 모드 지원

## 🛠 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| 만세력 / 음양력 변환 | 자체 계산 로직 (`lib/saju`) |
| Deploy | Vercel |

<!-- 실제 사용하는 스택에 맞게 수정하세요 -->

## 📁 프로젝트 구조

```
MASA/
├── app/                 # 페이지 및 라우트
│   ├── page.tsx         # 입력 화면
│   └── result/          # 사주 결과 화면
├── components/          # UI 컴포넌트 (입력 폼, 사주표, 오행 차트 등)
├── lib/
│   └── saju/            # 천간·지지·절기·대운 계산 로직
├── public/              # 정적 파일
└── README.md
```

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

### 환경 변수

필요한 경우 프로젝트 루트에 `.env.local` 파일을 만들어 설정합니다.

```env
# 예시 — 실제 사용하는 값으로 교체
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> `.env.local`은 Git에 커밋하지 마세요.

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
