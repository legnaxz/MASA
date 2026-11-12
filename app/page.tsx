"use client";

import { useRef, useState } from "react";
import BirthForm from "@/components/BirthForm";
import FlowCard from "@/components/FlowCard";
import PillarTable from "@/components/PillarTable";
import SajuCard from "@/components/SajuCard";
import { buildCards } from "@/lib/cards";
import { analyze, type Analysis } from "@/lib/saju/engine";

export default function Home() {
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drawId, setDrawId] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">
      <header className="mb-6 text-center">
        <p className="font-serif-kr text-sm tracking-[0.3em] text-[var(--muted)]">四柱八字</p>
        <h1 className="font-serif-kr mt-1 text-4xl font-bold">MASA</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">생년월일시를 넣으면 나의 사주를 카드 7장으로 펼쳐드려요</p>
      </header>

      <div className="mx-auto max-w-xl">
        <BirthForm
          onSubmit={(input) => {
            try {
              setResult(analyze(input));
              setError(null);
              setDrawId((n) => n + 1);
              requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
            } catch {
              setResult(null);
              setError("날짜를 확인해 주세요. 음력 윤달이 없는 달일 수 있어요.");
            }
          }}
        />
        {error && <p className="mt-3 text-center text-sm text-[#d4513f]">{error}</p>}
      </div>

      {result && (
        <div ref={resultRef} key={drawId} className="mt-10 grid scroll-mt-6 grid-cols-[minmax(0,1fr)] gap-5">
          <PillarTable a={result} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {buildCards(result).map((card, i) => (
              <SajuCard key={card.slot} card={card} index={i} />
            ))}
          </div>
          <FlowCard a={result} />
          <p className="text-center text-xs leading-relaxed text-[var(--muted)]">
            용신·신강약은 억부법을 단순화한 간이 판단이며, 카드 해석은 재미와 참고용이에요.
            <br />
            건강·재정·법률 등 중요한 결정은 전문가와 상의하세요.
          </p>
        </div>
      )}
    </main>
  );
}
