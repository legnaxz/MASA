import { ELEMENT_INFO } from "@/lib/saju/constants";
import type { CardData } from "@/lib/cards";
import CardArt from "./CardArt";

/** 모든 카드가 공유하는 고정 틀 */
export default function SajuCard({ card, index }: { card: CardData; index: number }) {
  const info = ELEMENT_INFO[card.element];
  return (
    <article
      className="saju-card flex flex-col overflow-hidden rounded-2xl"
      style={{ ["--el" as string]: info.color, ["--el-deep" as string]: info.deep, animationDelay: `${index * 120}ms` }}
    >
      <header className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white" style={{ background: info.color }}>
          {card.slotLabel}
        </span>
        <span className="font-serif-kr text-sm text-[var(--muted)]">
          {info.ko} {info.hanja}
        </span>
      </header>

      <div className="mx-3 overflow-hidden rounded-xl">
        <CardArt art={card.art} element={card.element} id={card.slot} />
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pt-3 pb-4">
        <div>
          <h3 className="font-serif-kr text-xl font-bold leading-tight">{card.title}</h3>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{card.subtitle}</p>
        </div>

        <ul className="flex flex-wrap gap-1.5">
          {card.keywords.map((k, i) => (
            <li key={`${i}-${k}`}className="keyword-chip rounded-full px-2.5 py-0.5 text-xs font-medium">
              #{k}
            </li>
          ))}
        </ul>

        <p className="font-serif-kr text-[15px] leading-snug">“{card.line}”</p>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--muted)]">{card.gauge.label}</span>
          <span className="flex gap-1" aria-label={`${card.gauge.value}/5`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className="h-2.5 w-5 rounded-full"
                style={{ background: i <= card.gauge.value ? info.color : "var(--line)" }}
              />
            ))}
          </span>
        </div>

        {card.tips.length > 0 && (
          <ul className="space-y-1 border-t border-[var(--line)] pt-2.5 text-[13px]">
            {card.tips.map((t, i) => (
              <li key={`${i}-${t}`}className="flex gap-1.5">
                <span style={{ color: info.color }}>◆</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        )}

        <ul className="mt-auto flex flex-wrap gap-1 pt-1">
          {card.basis.map((b, i) => (
            <li key={`${i}-${b}`}className="basis-tag rounded px-1.5 py-0.5 text-[11px]">
              {b}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
