import { ELEMENT_INFO, Element } from "@/lib/saju/constants";
import type { CardArt as Art } from "@/lib/cards";

/** 임시 일러스트: 오행 색 + 한자 + 띠 동물. 실제 그림이 준비되면 이미지로 교체. */
export default function CardArt({ art, element, id }: { art: Art; element: Element; id: string }) {
  const { color, deep } = ELEMENT_INFO[element];
  const gid = `g-${id}`;
  return (
    <svg viewBox="0 0 300 170" className="block w-full h-auto" role="img" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={color} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
      </defs>
      <rect width="300" height="170" fill={`url(#${gid})`} />
      {/* 해와 산, 구름 문양 */}
      <circle cx="232" cy="48" r="26" fill="#fff" opacity="0.16" />
      <circle cx="232" cy="48" r="40" fill="none" stroke="#fff" strokeOpacity="0.12" />
      <path d="M0 140 L60 92 L105 128 L160 74 L225 132 L262 104 L300 130 L300 170 L0 170Z" fill="#000" opacity="0.18" />
      <path d="M0 152 C40 140 70 160 110 150 S190 138 230 152 S280 160 300 150 L300 170 L0 170Z" fill="#fff" opacity="0.1" />
      <g fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="1.5">
        <path d="M24 34 q10 -12 20 0 q10 -12 20 0" />
        <path d="M58 54 q8 -9 16 0 q8 -9 16 0" />
      </g>

      {art.kind === "pillar" ? (
        <>
          <text x="96" y="104" textAnchor="middle" fontSize="70" fontWeight="700" fill="#fff" className="font-serif-kr">
            {art.stem}
          </text>
          <text x="186" y="104" textAnchor="middle" fontSize="70" fontWeight="700" fill="#fff" opacity="0.92" className="font-serif-kr">
            {art.branch}
          </text>
          <text x="262" y="156" textAnchor="middle" fontSize="34">
            {art.emoji}
          </text>
        </>
      ) : (
        <text
          x="150"
          y="108"
          textAnchor="middle"
          fontSize={art.glyph.length > 1 ? 64 : 84}
          fontWeight="700"
          fill="#fff"
          letterSpacing={art.glyph.length > 1 ? 6 : 0}
          className="font-serif-kr"
        >
          {art.glyph}
        </text>
      )}
    </svg>
  );
}
