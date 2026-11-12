import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const sans = Noto_Sans_KR({ weight: ["400", "500", "700"], preload: false, variable: "--font-sans-kr" });
const serif = Noto_Serif_KR({ weight: ["500", "700"], preload: false, variable: "--font-serif-kr" });

export const metadata: Metadata = {
  title: "MASA · 사주 그림책",
  description: "생년월일시로 보는 나의 사주팔자, 마사 선생이 그림책으로 풀어드려요",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${sans.variable} ${serif.variable}`}>{children}</body>
    </html>
  );
}
