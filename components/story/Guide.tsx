/** 안내자 "마사 선생" — 갓을 쓴 부엉이 */
export default function Guide({ size = 84, talking = false }: { size?: number; talking?: boolean }) {
  return (
    <svg viewBox="0 0 100 110" width={size} height={size * 1.1} className="anim-bob shrink-0" aria-hidden>
      {/* 몸통 */}
      <ellipse cx="50" cy="72" rx="34" ry="34" fill="#8a6a4a" />
      <ellipse cx="50" cy="80" rx="22" ry="24" fill="#ecdcc0" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${40 + i * 10} ${72 + (i % 2) * 6} q3 4 6 0`} stroke="#c9b28c" strokeWidth="1.5" fill="none" />
      ))}
      {/* 날개 */}
      <path d="M17 66 Q8 86 22 100 Q24 82 26 70Z" fill="#6f5238" className={talking ? "anim-wave-wing" : undefined} style={{ transformOrigin: "24px 68px" }} />
      <path d="M83 66 Q92 86 78 100 Q76 82 74 70Z" fill="#6f5238" />
      {/* 눈 */}
      <circle cx="37" cy="54" r="12" fill="#fff" />
      <circle cx="63" cy="54" r="12" fill="#fff" />
      <circle cx="38" cy="55" r="6" fill="#2b241b" />
      <circle cx="62" cy="55" r="6" fill="#2b241b" />
      <circle cx="40" cy="53" r="2" fill="#fff" />
      <circle cx="64" cy="53" r="2" fill="#fff" />
      <g className="anim-blink" style={{ transformOrigin: "50px 54px" }}>
        <rect x="24" y="41" width="26" height="26" rx="13" fill="#8a6a4a" />
        <rect x="50" y="41" width="26" height="26" rx="13" fill="#8a6a4a" />
      </g>
      {/* 부리 */}
      <path d="M46 62 L54 62 L50 70Z" fill="#e8973a" />
      {/* 볼 */}
      <ellipse cx="28" cy="66" rx="5" ry="3" fill="#f39ab2" opacity="0.6" />
      <ellipse cx="72" cy="66" rx="5" ry="3" fill="#f39ab2" opacity="0.6" />
      {/* 갓 */}
      <ellipse cx="50" cy="38" rx="40" ry="7" fill="#1f1a16" opacity="0.92" />
      <path d="M36 37 Q36 16 50 16 Q64 16 64 37Z" fill="#1f1a16" />
      <path d="M36 32 H64" stroke="#5a4a3a" strokeWidth="1.5" />
      <path d="M26 40 Q22 60 30 76" stroke="#1f1a16" strokeWidth="1.2" fill="none" />
      <path d="M74 40 Q78 60 70 76" stroke="#1f1a16" strokeWidth="1.2" fill="none" />
    </svg>
  );
}
