/**
 * 동화책 장면 — 모두 SVG + CSS 애니메이션으로 그린다.
 * 실제 일러스트가 준비되면 kind 별로 이미지를 바꿔 끼우면 된다.
 */
import { memo } from "react";
import { ELEMENT_INFO, type Element, type TenGodGroup } from "@/lib/saju/constants";
import type { FlowKind } from "@/lib/saju/engine";
import type { Scene as SceneSpec } from "@/lib/story/types";

const W = 400;
const H = 250;

function mix(hex: string, target: string, t: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = p(hex);
  const b = p(target);
  return `#${a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
}
const light = (hex: string, t = 0.75) => mix(hex, "#ffffff", t);
const dark = (hex: string, t = 0.4) => mix(hex, "#000000", t);

/* ---------------- 공통 소품 ---------------- */

function Sky({ el, night, id: base }: { el: Element; night?: boolean; id: string }) {
  const c = ELEMENT_INFO[el].color;
  const id = `${base}-${el}${night ? "-n" : ""}`;
  return (
    <>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          {night ? (
            <>
              <stop offset="0" stopColor="#0d1530" />
              <stop offset="1" stopColor={dark(c, 0.55)} />
            </>
          ) : (
            <>
              <stop offset="0" stopColor={light(c, 0.55)} />
              <stop offset="1" stopColor={light(c, 0.88)} />
            </>
          )}
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#sky-${id})`} />
    </>
  );
}

function Hills({ el, night }: { el: Element; night?: boolean }) {
  const c = ELEMENT_INFO[el].color;
  const k = night ? 0.55 : 0;
  return (
    <>
      <path d="M0 175 Q70 120 140 165 T280 150 T400 160 V250 H0Z" fill={dark(light(c, 0.45), k + 0.05)} />
      <path d="M0 200 Q90 160 190 195 T400 185 V250 H0Z" fill={dark(light(c, 0.25), k + 0.15)} />
      <path d="M0 225 Q120 205 240 222 T400 215 V250 H0Z" fill={dark(c, k + 0.25)} />
    </>
  );
}

function Cloud({ y, delay, scale = 1 }: { y: number; delay: number; scale?: number }) {
  return (
    <g className="anim-drift" style={{ animationDelay: `${delay}s` }}>
      <g transform={`translate(0 ${y}) scale(${scale})`} fill="#fff" opacity="0.85">
        <ellipse cx="30" cy="12" rx="26" ry="11" />
        <ellipse cx="52" cy="8" rx="18" ry="12" />
        <ellipse cx="14" cy="14" rx="14" ry="8" />
      </g>
    </g>
  );
}

function Stars({ n = 18 }: { n?: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const x = (i * 97 + 31) % W;
        const y = (i * 53 + 17) % 120;
        return (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.8 : 1.1} fill="#fff8d9" className="anim-twinkle" style={{ animationDelay: `${(i % 7) * 0.35}s` }} />
        );
      })}
    </>
  );
}

function Person({ x, y, color, s = 1, hair = "#2d2018", flip }: { x: number; y: number; color: string; s?: number; hair?: string; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M-11 0 Q-12 -26 0 -28 Q12 -26 11 0Z" fill={color} />
      <circle cx="0" cy="-37" r="10" fill="#f3d4b5" />
      <path d="M-10 -38 Q-9 -50 0 -49 Q10 -50 10 -38 Q6 -44 0 -43 Q-6 -44 -10 -38Z" fill={hair} />
      <circle cx="3.5" cy="-37" r="1.2" fill="#3a2a20" />
      <circle cx="-3" cy="-37" r="1.2" fill="#3a2a20" />
      <path d="M-2 -32.5 Q0.5 -30.5 3 -32.5" stroke="#b5654a" strokeWidth="1" fill="none" />
    </g>
  );
}

function Coin({ x, y, r = 7, className, delay }: { x: number; y: number; r?: number; className?: string; delay?: number }) {
  return (
    <g className={className} style={delay !== undefined ? { animationDelay: `${delay}s` } : undefined}>
      <circle cx={x} cy={y} r={r} fill="#f2c14e" stroke="#b8861b" strokeWidth="1.2" />
      <rect x={x - r * 0.3} y={y - r * 0.3} width={r * 0.6} height={r * 0.6} fill="#b8861b" />
    </g>
  );
}

function Heart({ x, y, s = 1, color = "#e8607a", className, delay }: { x: number; y: number; s?: number; color?: string; className?: string; delay?: number }) {
  return (
    <g className={className} style={delay !== undefined ? { animationDelay: `${delay}s` } : undefined}>
      <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 6 C-10 -2 -8 -10 -3 -10 C0 -10 0 -7 0 -6 C0 -7 0 -10 3 -10 C8 -10 10 -2 0 6Z" fill={color} />
    </g>
  );
}

function Glyph({ x, y, text, size, fill = "#fff", opacity = 1 }: { x: number; y: number; text: string; size: number; fill?: string; opacity?: number }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontSize={size} fontWeight={700} fill={fill} opacity={opacity} className="font-serif-kr">
      {text}
    </text>
  );
}

/* ---------------- 장면들 ---------------- */

function Cover({ el, stem, branch, emoji }: { el: Element; stem: string; branch: string; emoji: string }) {
  const c = ELEMENT_INFO[el].color;
  return (
    <>
      <Sky el={el} id="cover" />
      <circle cx="200" cy="105" r="70" fill="#fff" opacity="0.35" className="anim-glow" />
      <Cloud y={30} delay={-4} />
      <Cloud y={60} delay={-12} scale={0.7} />
      <Hills el={el} />
      {[["left", 70, stem], ["right", 330, branch]].map(([k, x, ch]) => (
        <g key={k as string} className="anim-sway" style={{ transformOrigin: `${x}px 20px` }}>
          <line x1={x as number} y1="0" x2={x as number} y2="22" stroke="#6b4b2a" strokeWidth="2" />
          <rect x={(x as number) - 24} y="22" width="48" height="96" rx="4" fill="#fbf3e3" stroke={c} strokeWidth="3" />
          <Glyph x={x as number} y={88} text={ch as string} size={40} fill={dark(c, 0.2)} />
        </g>
      ))}
      <text x="200" y="150" textAnchor="middle" fontSize="78" className="anim-float">
        {emoji}
      </text>
    </>
  );
}

function YearScene({ el, emoji, ganzhi }: { el: Element; emoji: string; ganzhi: string }) {
  return (
    <>
      <Sky el={el} id="year" />
      <Glyph x={200} y={120} text={ganzhi} size={110} opacity={0.18} />
      <g className="anim-glow">
        <circle cx="300" cy="70" r="30" fill="#ffe08a" />
        <circle cx="300" cy="70" r="44" fill="#ffe08a" opacity="0.3" />
      </g>
      <Cloud y={40} delay={-3} />
      <Cloud y={80} delay={-11} scale={0.8} />
      <Hills el={el} />
      <g className="anim-run">
        <text x="0" y="200" fontSize="54" className="anim-bob" style={{ display: "inline-block" }}>
          {emoji}
        </text>
      </g>
    </>
  );
}

function MonthScene({ el, ganzhi }: { el: Element; ganzhi: string }) {
  return (
    <>
      <Sky el={el} night id="month" />
      <Stars />
      <Glyph x={200} y={125} text={ganzhi} size={100} opacity={0.12} />
      <g className="anim-glow">
        <circle cx="300" cy="62" r="28" fill="#fff3c4" />
        <circle cx="312" cy="54" r="24" fill="#16203d" />
      </g>
      <Hills el={el} night />
      <g transform="translate(110 168)">
        <path d="M-30 0 L0 -24 L30 0Z" fill="#3b2a22" />
        <rect x="-24" y="0" width="48" height="30" fill="#e9d8b8" />
        <rect x="-8" y="8" width="16" height="14" fill="#ffd36b" className="anim-glow" />
      </g>
    </>
  );
}

function GuestScene({ el, glyph }: { el: Element; glyph: string }) {
  const c = ELEMENT_INFO[el].color;
  return (
    <>
      <Sky el={el} id="guest" />
      <Hills el={el} />
      {/* 대문 */}
      <g transform="translate(200 230)">
        <path d="M-120 -150 Q0 -190 120 -150 L112 -140 Q0 -176 -112 -140Z" fill="#4a3426" />
        <rect x="-100" y="-142" width="12" height="142" fill="#7a4b2e" />
        <rect x="88" y="-142" width="12" height="142" fill="#7a4b2e" />
        <path d="M-88 -130 L-40 -120 L-40 0 L-88 0Z" fill="#a8693f" />
        <path d="M88 -130 L40 -120 L40 0 L88 0Z" fill="#a8693f" />
      </g>
      <g className="anim-glow">
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x="198" y="60" width="4" height="120" fill="#fff8d9" opacity="0.35" transform={`rotate(${i * 36} 200 120)`} />
        ))}
      </g>
      <g className="anim-float">
        <circle cx="200" cy="120" r="46" fill={c} stroke="#fff" strokeWidth="4" />
        <Glyph x={200} y={135} text={glyph} size={glyph.length > 1 ? 32 : 44} />
      </g>
    </>
  );
}

const MOOD_SKY: Record<FlowKind, Element> = { chance: "wood", prepare: "earth", careful: "water" };

function PathScene({ mood }: { mood: FlowKind }) {
  const el = MOOD_SKY[mood];
  return (
    <>
      <Sky el={el} id={`path-${mood}`} />
      {mood === "chance" && (
        <>
          <g className="anim-glow">
            <circle cx="320" cy="60" r="26" fill="#ffe08a" />
          </g>
          <g fill="none" strokeWidth="6" opacity="0.55">
            {["#e8607a", "#f2a64e", "#f2d94e", "#6cc08b", "#5b8fd9"].map((col, i) => (
              <path key={col} d={`M40 ${170 + i * 0} A${130 - i * 7} ${110 - i * 7} 0 0 1 ${300 - i * 14} 170`} stroke={col} />
            ))}
          </g>
          {[0, 1, 2].map((i) => (
            <path key={i} className="anim-drift" style={{ animationDelay: `${-i * 5}s` }} d={`M0 ${60 + i * 18} q6 -6 12 0 q6 -6 12 0`} stroke="#4a3426" strokeWidth="2" fill="none" />
          ))}
        </>
      )}
      {mood === "prepare" && (
        <>
          <Cloud y={40} delay={-2} />
          <Cloud y={70} delay={-9} scale={0.8} />
          <circle cx="320" cy="64" r="22" fill="#ffe08a" opacity="0.7" />
        </>
      )}
      {mood === "careful" && (
        <>
          <g fill="#c7cfdb">
            <ellipse cx="100" cy="45" rx="70" ry="22" />
            <ellipse cx="290" cy="38" rx="90" ry="26" />
          </g>
          {Array.from({ length: 22 }, (_, i) => (
            <line key={i} x1={(i * 37) % W} y1="40" x2={((i * 37) % W) - 4} y2="52" stroke="#8fa3c2" strokeWidth="2" className="anim-rain" style={{ animationDelay: `${(i % 6) * 0.2}s` }} />
          ))}
        </>
      )}
      <Hills el={el} />
      <path d="M170 250 Q190 210 210 200 T230 170 Q236 160 222 150" stroke="#f1e2c2" strokeWidth="26" fill="none" strokeLinecap="round" />
      <g className="anim-bob">
        <Person x={196} y={232} color={mood === "careful" ? "#5b6f8f" : "#d4513f"} s={0.9} />
        {mood === "careful" && <path d="M174 192 Q196 168 218 192Z" fill="#d4513f" />}
      </g>
      {mood === "prepare" &&
        [120, 150, 260, 290].map((x, i) => (
          <g key={x} className="anim-grow" style={{ animationDelay: `${i * 0.25}s`, transformOrigin: `${x}px 230px` }}>
            <path d={`M${x} 230 v-16`} stroke="#3f9a63" strokeWidth="2" />
            <ellipse cx={x - 5} cy={214} rx="6" ry="3" fill="#3f9a63" />
            <ellipse cx={x + 5} cy={216} rx="6" ry="3" fill="#3f9a63" />
          </g>
        ))}
    </>
  );
}

function MoneyScene({ variant, fill }: { variant: "tree" | "leak" | "jar" | "mountain"; fill: number }) {
  const coins = Math.max(2, Math.round(fill * 9));
  return (
    <>
      <Sky el="earth" id={`money-${variant}`} />
      <Cloud y={36} delay={-6} />
      <Hills el="earth" />
      {variant === "tree" && (
        <>
          <rect x="190" y="130" width="20" height="90" fill="#7a4b2e" />
          <g className="anim-sway" style={{ transformOrigin: "200px 220px" }}>
            <circle cx="200" cy="100" r="62" fill="#3f9a63" />
            <circle cx="160" cy="118" r="38" fill="#4fae72" />
            <circle cx="242" cy="118" r="38" fill="#4fae72" />
            {Array.from({ length: coins }, (_, i) => (
              <Coin key={i} x={150 + ((i * 41) % 100)} y={70 + ((i * 29) % 70)} r={7} className="anim-twinkle" delay={i * 0.3} />
            ))}
          </g>
          {[0, 1, 2].map((i) => (
            <Coin key={i} x={170 + i * 30} y={150} className="anim-coin-fall" delay={i * 1.1} />
          ))}
          <path d="M150 222 h100 l-10 22 h-80z" fill="#a8693f" />
        </>
      )}
      {(variant === "jar" || variant === "leak") && (
        <>
          {[0, 1, 2].map((i) => (
            <Coin key={i} x={185 + i * 15} y={20} className="anim-coin-drop" delay={i * 0.9} />
          ))}
          <g transform="translate(200 160)">
            <path d="M-52 -40 Q-70 30 -40 70 H40 Q70 30 52 -40Z" fill="#b5743f" />
            <ellipse cx="0" cy="-40" rx="52" ry="12" fill="#8a5530" />
            <clipPath id="jar-clip">
              <path d="M-52 -40 Q-70 30 -40 70 H40 Q70 30 52 -40Z" />
            </clipPath>
            <g clipPath="url(#jar-clip)">
              <rect x="-70" y={70 - fill * 105} width="140" height={fill * 105} fill="#f2c14e" opacity="0.9" />
            </g>
            {variant === "leak" && (
              <>
                <path d="M30 40 l8 6 l-5 6 l9 8" stroke="#3b2a22" strokeWidth="2.5" fill="none" />
                {[0, 1, 2].map((i) => (
                  <Coin key={i} x={44} y={66} r={6} className="anim-coin-leak" delay={i * 1.2} />
                ))}
              </>
            )}
          </g>
        </>
      )}
      {variant === "mountain" && (
        <>
          <path d="M80 230 L200 60 L320 230Z" fill="#8b7a5c" />
          <path d="M170 103 L200 60 L230 103 Q215 95 200 104 Q185 95 170 103Z" fill="#f2c14e" />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={180 + i * 14} cy={58 - (i % 2) * 8} r="2.5" fill="#fff6c8" className="anim-twinkle" style={{ animationDelay: `${i * 0.4}s` }} />
          ))}
          <g className="anim-bob">
            <Person x={170} y={180} color="#3767b0" s={0.8} />
          </g>
        </>
      )}
    </>
  );
}

function LoveScene({ variant }: { variant: "blossom" | "bud" | "pair" }) {
  return (
    <>
      <Sky el="fire" id={`love-${variant}`} />
      <Cloud y={36} delay={-5} />
      <Hills el="wood" />
      {variant === "blossom" && (
        <>
          <path d="M200 225 Q195 170 205 130 M202 160 Q170 140 150 120 M204 150 Q240 130 255 110" stroke="#6b4129" strokeWidth="9" fill="none" strokeLinecap="round" />
          <g className="anim-sway" style={{ transformOrigin: "200px 225px" }}>
            {[[150, 112], [175, 95], [205, 85], [235, 95], [258, 108], [190, 118], [222, 118]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={24} fill={i % 2 ? "#f6b8c8" : "#f39ab2"} />
            ))}
          </g>
          {Array.from({ length: 10 }, (_, i) => (
            <ellipse key={i} cx={130 + ((i * 37) % 160)} cy={100} rx="4" ry="2.5" fill="#f39ab2" className="anim-petal" style={{ animationDelay: `${i * 0.6}s` }} />
          ))}
          <Person x={170} y={232} color="#3767b0" s={0.85} />
          <Person x={232} y={232} color="#d4513f" s={0.85} hair="#5a3624" flip />
          <Heart x={201} y={175} s={1.3} className="anim-rise" />
        </>
      )}
      {variant === "bud" && (
        <>
          <path d="M200 228 V150" stroke="#3f9a63" strokeWidth="5" />
          <ellipse cx="185" cy="185" rx="14" ry="6" fill="#3f9a63" transform="rotate(-25 185 185)" />
          <ellipse cx="215" cy="175" rx="14" ry="6" fill="#3f9a63" transform="rotate(25 215 175)" />
          <g className="anim-bloom" style={{ transformOrigin: "200px 145px" }}>
            {[0, 72, 144, 216, 288].map((r) => (
              <ellipse key={r} cx="200" cy="130" rx="9" ry="16" fill="#f39ab2" transform={`rotate(${r} 200 145)`} />
            ))}
            <circle cx="200" cy="145" r="7" fill="#f2c14e" />
          </g>
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={160 + i * 27} cy={100 + (i % 2) * 20} r="2.5" fill="#fff" className="anim-twinkle" style={{ animationDelay: `${i * 0.5}s` }} />
          ))}
        </>
      )}
      {variant === "pair" && (
        <>
          <path d="M120 190 Q200 120 280 190" stroke="#d4513f" strokeWidth="2.5" fill="none" strokeDasharray="6 5" className="anim-thread" />
          <Person x={110} y={215} color="#3767b0" s={0.9} />
          <Person x={290} y={215} color="#d4513f" s={0.9} hair="#5a3624" flip />
          {[0, 1, 2].map((i) => (
            <Heart key={i} x={185 + i * 15} y={140} s={0.9} className="anim-rise" delay={i * 1.2} />
          ))}
        </>
      )}
    </>
  );
}

function CoupleScene({ variant }: { variant: "warm" | "river" }) {
  if (variant === "river") {
    return (
      <>
        <Sky el="water" id="couple-river" />
        <Cloud y={36} delay={-5} />
        <path d="M0 150 Q100 120 150 150 L150 250 H0Z" fill="#6cae7d" />
        <path d="M250 150 Q300 120 400 150 V250 H250Z" fill="#6cae7d" />
        <rect x="150" y="150" width="100" height="100" fill="#5b8fd9" />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M150 ${175 + i * 22} q12 -6 25 0 t25 0 t25 0 t25 0`} stroke="#cfe0fb" strokeWidth="2" fill="none" className="anim-wave" style={{ animationDelay: `${i * 0.5}s` }} />
        ))}
        {[170, 200, 230].map((x) => (
          <ellipse key={x} cx={x} cy={205} rx="12" ry="5" fill="#9aa3b0" />
        ))}
        <Person x={110} y={175} color="#3767b0" s={0.9} />
        <Person x={290} y={175} color="#d4513f" s={0.9} hair="#5a3624" flip />
        <Heart x={200} y={110} s={1.4} className="anim-float" />
      </>
    );
  }
  return (
    <>
      <Sky el="earth" night id="couple-warm" />
      <Stars n={12} />
      <Hills el="earth" night />
      <g transform="translate(200 210)">
        <path d="M-95 -60 Q0 -95 95 -60 L85 -52 Q0 -80 -85 -52Z" fill="#3b2a22" />
        <rect x="-75" y="-52" width="150" height="52" fill="#e9d8b8" />
        <rect x="-55" y="-40" width="28" height="24" fill="#ffd36b" className="anim-glow" />
        <rect x="27" y="-40" width="28" height="24" fill="#ffd36b" className="anim-glow" style={{ animationDelay: "0.8s" }} />
        <rect x="-11" y="-38" width="22" height="38" fill="#7a4b2e" />
      </g>
      <path d="M260 120 q6 -10 0 -20 q-6 -10 0 -20" stroke="#ddd" strokeWidth="5" fill="none" opacity="0.5" className="anim-float" />
      <Person x={150} y={240} color="#3767b0" s={0.75} />
      <Person x={250} y={240} color="#d4513f" s={0.75} hair="#5a3624" flip />
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={60 + i * 55} cy={120 + (i % 3) * 18} r="2.2" fill="#fff07a" className="anim-firefly" style={{ animationDelay: `${i * 0.7}s` }} />
      ))}
    </>
  );
}

function ChildrenScene({ count, unknown }: { count: number; unknown?: boolean }) {
  const xs = Array.from({ length: count }, (_, i) => 200 + (i - (count - 1) / 2) * 60);
  return (
    <>
      <Sky el="wood" id="children" />
      <g className="anim-glow">
        <circle cx="320" cy="60" r="26" fill="#ffe08a" />
      </g>
      <Cloud y={40} delay={-7} />
      <Hills el="wood" />
      <rect x="80" y="210" width="240" height="18" rx="9" fill="#8a5a36" />
      {unknown ? (
        <g className="anim-float">
          <ellipse cx="200" cy="208" rx="10" ry="7" fill="#6b4129" />
          <Glyph x={200} y={180} text="?" size={40} fill="#6b4129" />
        </g>
      ) : (
        xs.map((x, i) => (
          <g key={x} className="anim-grow" style={{ animationDelay: `${0.3 + i * 0.35}s`, transformOrigin: `${x}px 212px` }}>
            <path d={`M${x} 212 V${170 - i * 4}`} stroke="#3f9a63" strokeWidth="4" />
            <ellipse cx={x - 12} cy={176 - i * 4} rx="13" ry="6" fill="#4fae72" transform={`rotate(-20 ${x - 12} ${176 - i * 4})`} />
            <ellipse cx={x + 12} cy={168 - i * 4} rx="13" ry="6" fill="#3f9a63" transform={`rotate(20 ${x + 12} ${168 - i * 4})`} />
          </g>
        ))
      )}
      {[0, 1].map((i) => (
        <g key={i} className="anim-butterfly" style={{ animationDelay: `${i * 2}s` }}>
          <ellipse cx={120 + i * 150} cy={110} rx="7" ry="5" fill={i ? "#f39ab2" : "#f2c14e"} />
          <ellipse cx={130 + i * 150} cy={110} rx="7" ry="5" fill={i ? "#f6b8c8" : "#f6d77a"} />
        </g>
      ))}
    </>
  );
}

const WORK_PROP: Record<TenGodGroup, string> = { 비겁: "🚩", 식상: "💡", 재성: "🪙", 관성: "🏛️", 인성: "📜" };

function WorkScene({ group }: { group: TenGodGroup }) {
  return (
    <>
      <Sky el="metal" id="work" />
      <Cloud y={36} delay={-3} />
      <Cloud y={70} delay={-10} scale={0.8} />
      <Hills el="wood" />
      <path d="M70 240 L200 70 L330 240Z" fill="#7d8b9e" />
      <path d="M170 102 L200 70 L230 102 Q215 94 200 103 Q185 94 170 102Z" fill="#fff" />
      <path d="M120 240 Q170 210 150 185 T205 150 T190 110" stroke="#e9dcc0" strokeWidth="9" fill="none" strokeLinecap="round" />
      <text x="200" y="66" textAnchor="middle" fontSize="38" className="anim-float">
        {WORK_PROP[group]}
      </text>
      <g className="anim-bob">
        <Person x={160} y={190} color="#3767b0" s={0.75} />
      </g>
    </>
  );
}

function LanternScene({ el }: { el: Element }) {
  const c = ELEMENT_INFO[el].color;
  return (
    <>
      <Sky el={el} night id="lantern" />
      <Stars n={14} />
      <Hills el={el} night />
      <g className="anim-sway" style={{ transformOrigin: "200px 0px" }}>
        <line x1="200" y1="0" x2="200" y2="50" stroke="#6b4b2a" strokeWidth="2" />
        <circle cx="200" cy="115" r="80" fill={c} opacity="0.25" className="anim-glow" />
        <rect x="186" y="48" width="28" height="8" rx="2" fill="#3b2a22" />
        <ellipse cx="200" cy="112" rx="46" ry="56" fill={light(c, 0.35)} stroke={dark(c, 0.2)} strokeWidth="3" />
        <path d="M200 56 V168 M175 62 Q160 112 175 162 M225 62 Q240 112 225 162" stroke={dark(c, 0.2)} strokeWidth="1.5" fill="none" opacity="0.5" />
        <Glyph x={200} y={128} text={ELEMENT_INFO[el].hanja} size={44} fill={dark(c, 0.45)} />
        <rect x="186" y="166" width="28" height="8" rx="2" fill="#3b2a22" />
        <path d="M195 174 v20 M200 174 v24 M205 174 v20" stroke="#c0392b" strokeWidth="2" />
      </g>
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={50 + i * 45} cy={150 + (i % 3) * 20} r="2.2" fill="#fff07a" className="anim-firefly" style={{ animationDelay: `${i * 0.6}s` }} />
      ))}
    </>
  );
}

const KIND_FILL: Record<FlowKind, string> = { chance: "#3f9a63", prepare: "#c99a2e", careful: "#8792a3" };

function StonesScene({ items }: { items: { label: string; sub: string; kind: FlowKind; mark?: boolean }[] }) {
  const step = W / (items.length + 1);
  return (
    <>
      <Sky el="water" id="stones" />
      <Cloud y={30} delay={-4} />
      <path d="M0 132 Q100 112 200 130 T400 124 V250 H0Z" fill="#6cae7d" />
      <path d="M0 150 Q200 135 400 150 V215 Q200 230 0 215Z" fill="#5b8fd9" />
      {[0, 1].map((i) => (
        <path key={i} d={`M0 ${170 + i * 22} q25 -6 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0`} stroke="#cfe0fb" strokeWidth="2" fill="none" className="anim-wave" style={{ animationDelay: `${i * 0.6}s` }} />
      ))}
      {items.map((it, i) => {
        const x = step * (i + 1);
        return (
          <g key={it.label} className="anim-pop" style={{ animationDelay: `${i * 0.15}s`, transformOrigin: `${x}px 182px` }}>
            <ellipse cx={x} cy={184} rx={step * 0.36} ry="13" fill={KIND_FILL[it.kind]} stroke="#fff" strokeWidth="2" />
            <text x={x} y={124} textAnchor="middle" fontSize="13" fontWeight={700} fill="#2b241b">
              {it.label}
            </text>
            <text x={x} y={189} textAnchor="middle" fontSize="11" fill="#fff" fontWeight={700}>
              {it.sub}
            </text>
            {it.mark && (
              <text x={x} y={106} textAnchor="middle" fontSize="16" className="anim-twinkle">
                ⭐
              </text>
            )}
          </g>
        );
      })}
      <g className="anim-hop" style={{ transformOrigin: `${step}px 170px` }}>
        <Person x={step} y={172} color="#d4513f" s={0.55} />
      </g>
    </>
  );
}

/* ---------------- 커플 장면 ---------------- */

function DuoScene({ elA, elB, emojiA, emojiB, heat }: { elA: Element; elB: Element; emojiA: string; emojiB: string; heat: number }) {
  const a = ELEMENT_INFO[elA].color;
  const b = ELEMENT_INFO[elB].color;
  return (
    <>
      <defs>
        <linearGradient id={`duo-${elA}-${elB}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={light(a, 0.6)} />
          <stop offset="1" stopColor={light(b, 0.6)} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#duo-${elA}-${elB})`} />
      <Cloud y={30} delay={-6} />
      <path d="M0 170 Q70 110 160 175 L160 250 H0Z" fill={dark(light(a, 0.2), 0.1)} />
      <path d="M240 175 Q330 110 400 170 V250 H240Z" fill={dark(light(b, 0.2), 0.1)} />
      <path d="M0 215 Q200 185 400 215 V250 H0Z" fill={dark(a, 0.35)} opacity="0.5" />
      <path d="M0 225 Q200 200 400 225 V250 H0Z" fill={dark(b, 0.35)} opacity="0.5" />
      <text x="80" y="150" textAnchor="middle" fontSize="50" className="anim-float">
        {emojiA}
      </text>
      <text x="320" y="150" textAnchor="middle" fontSize="50" className="anim-float" style={{ animationDelay: "1s" }}>
        {emojiB}
      </text>
      <path d="M110 120 Q200 60 290 120" stroke="#d4513f" strokeWidth="2.5" fill="none" strokeDasharray="6 5" className="anim-thread" />
      <g className="anim-glow">
        <path transform="translate(200 108) scale(4.2)" d="M0 6 C-10 -2 -8 -10 -3 -10 C0 -10 0 -7 0 -6 C0 -7 0 -10 3 -10 C8 -10 10 -2 0 6Z" fill="#e8607a" />
      </g>
      <text x="200" y="104" textAnchor="middle" fontSize="20" fontWeight={700} fill="#fff">
        {heat}°
      </text>
    </>
  );
}

function StemsScene({ a, b, elA, elB, mode }: { a: string; b: string; elA: Element; elB: Element; mode: string }) {
  const ca = ELEMENT_INFO[elA].color;
  const cb = ELEMENT_INFO[elB].color;
  const xA = 110;
  const xB = 290;
  return (
    <>
      <Sky el={mode === "hap" ? "earth" : elA} id="stems" />
      <Stars n={8} />
      <Hills el="wood" />
      {mode === "hap" && (
        <>
          <g className="anim-glow">
            <circle cx="200" cy="110" r="60" fill="#ffe08a" opacity="0.45" />
          </g>
          <path d={`M${xA + 40} 110 C170 70 230 150 ${xB - 40} 110`} stroke="#c0392b" strokeWidth="4" fill="none" className="anim-thread" strokeDasharray="10 6" />
          <path d={`M${xA + 40} 110 C170 150 230 70 ${xB - 40} 110`} stroke="#c0392b" strokeWidth="4" fill="none" className="anim-thread" strokeDasharray="10 6" />
          <Glyph x={200} y={60} text="合" size={34} fill="#a8432f" />
        </>
      )}
      {(mode === "gen-ab" || mode === "gen-ba") && (
        <g>
          <path d={`M${xA + 44} 100 Q200 60 ${xB - 44} 100`} stroke="#3f9a63" strokeWidth="4" fill="none" strokeDasharray="8 6" className="anim-thread" />
          <text x="200" y="66" textAnchor="middle" fontSize="15" fontWeight={700} fill="#1f5c3a">
            {mode === "gen-ab" ? "生 →" : "← 生"}
          </text>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={mode === "gen-ab" ? xA + 50 : xB - 50} cy={98} r="4" fill="#ffe08a" className={mode === "gen-ab" ? "anim-pass-right" : "anim-pass-left"} style={{ animationDelay: `${i * 0.7}s` }} />
          ))}
        </g>
      )}
      {(mode === "ctrl-ab" || mode === "ctrl-ba") && (
        <g>
          <path d={`M${xA + 44} 110 H${xB - 44}`} stroke="#8792a3" strokeWidth="4" strokeDasharray="4 6" className="anim-thread" />
          <text x="200" y="92" textAnchor="middle" fontSize="15" fontWeight={700} fill="#4a515c">
            {mode === "ctrl-ab" ? "剋 →" : "← 剋"}
          </text>
          <text x="200" y="140" textAnchor="middle" fontSize="18" className="anim-twinkle">
            ✨
          </text>
        </g>
      )}
      {mode === "same" && (
        <g stroke="#3767b0" strokeWidth="3" fill="none" className="anim-wave">
          <path d="M160 100 q10 -8 20 0 t20 0 t20 0 t20 0" />
          <path d="M160 120 q10 -8 20 0 t20 0 t20 0 t20 0" />
        </g>
      )}
      {[
        [xA, a, ca],
        [xB, b, cb],
      ].map(([x, ch, col], i) => (
        <g key={i} className="anim-float" style={{ animationDelay: `${i * 0.8}s` }}>
          <circle cx={x as number} cy={110} r="42" fill={col as string} stroke="#fff" strokeWidth="4" />
          <Glyph x={x as number} y={126} text={ch as string} size={44} />
        </g>
      ))}
    </>
  );
}

function ExchangeScene({ elA, elB }: { elA: Element; elB: Element }) {
  const ca = ELEMENT_INFO[elA].color;
  const cb = ELEMENT_INFO[elB].color;
  return (
    <>
      <Sky el="earth" night id="exchange" />
      <Stars />
      <Hills el="earth" night />
      <g className="anim-glow">
        <circle cx="100" cy="115" r="46" fill={ca} opacity="0.35" />
        <circle cx="300" cy="115" r="46" fill={cb} opacity="0.35" />
      </g>
      <Person x={100} y={200} color="#3767b0" s={0.85} />
      <Person x={300} y={200} color="#d4513f" s={0.85} hair="#5a3624" flip />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <circle cx={300} cy={120} r="6" fill={ca} stroke="#fff" strokeWidth="1.5" className="anim-pass-left" style={{ animationDelay: `${i * 0.9}s` }} />
          <circle cx={100} cy={100} r="6" fill={cb} stroke="#fff" strokeWidth="1.5" className="anim-pass-right" style={{ animationDelay: `${i * 0.9 + 0.45}s` }} />
        </g>
      ))}
      <Glyph x={100} y={60} text={ELEMENT_INFO[elA].hanja} size={22} fill="#fff" opacity={0.9} />
      <Glyph x={300} y={60} text={ELEMENT_INFO[elB].hanja} size={22} fill="#fff" opacity={0.9} />
    </>
  );
}

function BridgeScene() {
  return (
    <>
      <Sky el="fire" id="bridge" />
      <g className="anim-glow">
        <circle cx="200" cy="150" r="40" fill="#ffd36b" />
      </g>
      <Cloud y={40} delay={-3} />
      <path d="M0 130 L130 130 L150 250 H0Z" fill="#7a6a52" />
      <path d="M270 130 L400 130 V250 H250Z" fill="#7a6a52" />
      <path d="M0 130 L130 130" stroke="#5f8f5f" strokeWidth="8" />
      <path d="M270 130 L400 130" stroke="#5f8f5f" strokeWidth="8" />
      <path d="M130 128 Q200 150 270 128" stroke="#6b4b2a" strokeWidth="2" fill="none" />
      <path d="M130 112 Q200 134 270 112" stroke="#6b4b2a" strokeWidth="2" fill="none" />
      {Array.from({ length: 9 }, (_, i) => {
        const x = 136 + i * 16;
        const y = 130 + Math.sin((i / 8) * Math.PI) * 18;
        return <rect key={i} x={x - 6} y={y - 3} width="12" height="7" rx="1.5" fill="#a8693f" className="anim-pop" style={{ animationDelay: `${0.2 + (i < 5 ? i : 8 - i) * 0.25}s`, transformOrigin: `${x}px ${y}px` }} />;
      })}
      <g className="anim-walk-right">
        <Person x={70} y={128} color="#3767b0" s={0.8} />
      </g>
      <g className="anim-walk-left">
        <Person x={330} y={128} color="#d4513f" s={0.8} hair="#5a3624" flip />
      </g>
    </>
  );
}

/* ---------------- 연운 상세 장면 ---------------- */

const MARK_STYLE: Record<string, { color: string; dash?: string; label: string }> = {
  clash: { color: "#d4513f", dash: "7 5", label: "충" },
  hap: { color: "#3f9a63", label: "합" },
  wonjin: { color: "#8e5bb5", dash: "2 5", label: "원진" },
  samhap: { color: "#3767b0", dash: "10 4", label: "삼합" },
  same: { color: "#c99a2e", dash: "3 3", label: "같음" },
};

function PillarsScene({ guest, mine }: Extract<SceneSpec, { kind: "pillars" }>) {
  const order = ["hour", "day", "month", "year"].map((k) => mine.find((m) => m.key === k)).filter(Boolean) as typeof mine;
  const step = W / (order.length + 1);
  const gc = ELEMENT_INFO[guest.el].color;
  return (
    <>
      <Sky el={guest.el} night id="pillars" />
      <Stars n={10} />
      {order.map((p, i) => {
        const x = step * (i + 1);
        const st = p.mark ? MARK_STYLE[p.mark] : null;
        return (
          <g key={p.key}>
            {st && (
              <>
                <path d={`M200 74 Q${(200 + x) / 2} 110 ${x} 182`} stroke={st.color} strokeWidth="3.5" fill="none" strokeDasharray={st.dash} className="anim-thread" />
                <rect x={(200 + x) / 2 - 16} y={112} width="32" height="18" rx="9" fill={st.color} />
                <text x={(200 + x) / 2} y={125} textAnchor="middle" fontSize="11" fontWeight={700} fill="#fff">
                  {st.label}
                </text>
              </>
            )}
            {p.tie && <path d={`M200 74 Q${(200 + x) / 2} 90 ${x} 148`} stroke="#f2c14e" strokeWidth="3" fill="none" strokeDasharray="4 4" className="anim-thread" />}
          </g>
        );
      })}
      <g className="anim-float">
        <circle cx="200" cy="48" r="30" fill={gc} stroke="#fff" strokeWidth="3" />
        <Glyph x={200} y={58} text={guest.stem + guest.branch} size={24} />
      </g>
      {order.map((p, i) => {
        const x = step * (i + 1);
        const c = ELEMENT_INFO[p.el].color;
        const st = p.mark ? MARK_STYLE[p.mark] : null;
        return (
          <g key={`col-${p.key}`}>
            <text x={x} y={142} textAnchor="middle" fontSize="11" fill="#fff" opacity="0.85">
              {p.label}
            </text>
            <rect x={x - 22} y={148} width="44" height="32" rx="6" fill="#fbf3e3" stroke={p.tie ? "#f2c14e" : "transparent"} strokeWidth="3" />
            <Glyph x={x} y={172} text={p.stem} size={22} fill="#2b241b" />
            <rect x={x - 22} y={184} width="44" height="36" rx="6" fill={c} stroke={st ? st.color : "transparent"} strokeWidth="4" />
            <Glyph x={x} y={210} text={p.branch} size={24} />
          </g>
        );
      })}
    </>
  );
}

function BalanceScene({ before, after, yong }: Extract<SceneSpec, { kind: "balance" }>) {
  const els: Element[] = ["wood", "fire", "earth", "metal", "water"];
  const max = Math.max(...els.map((e) => after[e]), 4);
  const unit = 120 / max;
  return (
    <>
      <Sky el="earth" id="balance" />
      <rect x="40" y="208" width="320" height="6" rx="3" fill="#6b4b2a" />
      {els.map((e, i) => {
        const x = 68 + i * 66;
        const c = ELEMENT_INFO[e].color;
        const add = after[e] - before[e];
        return (
          <g key={e}>
            <rect x={x - 18} y={208 - before[e] * unit} width="36" height={before[e] * unit} rx="4" fill={c} opacity="0.85" />
            {add > 0 && (
              <rect
                x={x - 18}
                y={208 - after[e] * unit}
                width="36"
                height={add * unit}
                rx="4"
                fill={c}
                stroke="#fff"
                strokeWidth="2.5"
                strokeDasharray="5 3"
                className="anim-pop"
                style={{ transformOrigin: `${x}px ${208 - before[e] * unit}px`, animationDelay: `${0.3 + i * 0.1}s` }}
              />
            )}
            <text x={x} y={200 - after[e] * unit} textAnchor="middle" fontSize="13" fontWeight={700} fill="#2b241b">
              {after[e]}
              {add > 0 ? ` (+${add})` : ""}
            </text>
            <Glyph x={x} y={236} text={ELEMENT_INFO[e].hanja} size={18} fill={dark(c, 0.2)} />
            {e === yong && (
              <text x={x} y={185 - after[e] * unit} textAnchor="middle" fontSize="15" className="anim-twinkle">
                ⭐
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}

function MonthsScene({ items, best }: Extract<SceneSpec, { kind: "months" }>) {
  const step = W / (items.length + 1);
  return (
    <>
      <Sky el="water" id="months" />
      {[40, 60, 80].map((v) => (
        <g key={v}>
          <line x1="24" x2="376" y1={214 - v * 1.6} y2={214 - v * 1.6} stroke="#fff" strokeOpacity="0.5" strokeDasharray="3 4" />
          <text x="22" y={218 - v * 1.6} fontSize="9" fill="#2b241b" opacity="0.6" textAnchor="end">
            {v}
          </text>
        </g>
      ))}
      {items.map((m, i) => {
        const x = step * (i + 1);
        const h = m.score * 1.6;
        return (
          <g key={m.month}>
            <rect
              x={x - 17}
              y={214 - h}
              width="34"
              height={h}
              rx="6"
              fill={KIND_FILL[m.kind]}
              className="anim-grow"
              style={{ transformOrigin: `${x}px 214px`, animationDelay: `${i * 0.08}s` }}
            />
            <text x={x} y={208 - h} textAnchor="middle" fontSize="14" fontWeight={700} fill="#2b241b">
              {m.score}
            </text>
            {m.score === best && (
              <text x={x} y={190 - h} textAnchor="middle" fontSize="14" className="anim-twinkle">
                ⭐
              </text>
            )}
            <text x={x} y={232} textAnchor="middle" fontSize="13" fontWeight={700} fill="#2b241b">
              {m.month}월
            </text>
          </g>
        );
      })}
    </>
  );
}

/* ---------------- 추가 장면 ---------------- */

function BoatScene({ mood }: { mood: FlowKind }) {
  return (
    <>
      <Sky el={mood === "careful" ? "metal" : "water"} id={`boat-${mood}`} />
      {mood === "chance" && (
        <g className="anim-glow">
          <circle cx="320" cy="56" r="26" fill="#ffe08a" />
        </g>
      )}
      {mood !== "chance" && <Cloud y={30} delay={-4} />}
      {mood === "careful" && (
        <g fill="#aab4c4">
          <ellipse cx="110" cy="48" rx="80" ry="22" />
          <ellipse cx="300" cy="40" rx="90" ry="24" />
        </g>
      )}
      <path d="M0 150 Q100 135 200 150 T400 150 V250 H0Z" fill="#5b8fd9" />
      <path d="M0 185 Q100 170 200 185 T400 185 V250 H0Z" fill="#3f6fbd" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M0 ${165 + i * 24} q25 -7 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0`} stroke="#cfe0fb" strokeWidth="2" fill="none" className="anim-wave" style={{ animationDelay: `${i * 0.5}s` }} />
      ))}
      <g className={mood === "careful" ? "anim-rock" : "anim-float"} style={{ transformOrigin: "200px 170px" }}>
        <path d="M130 160 H270 L250 190 H150Z" fill="#8a5a36" />
        <line x1="200" y1="160" x2="200" y2="70" stroke="#5a3a22" strokeWidth="4" />
        <path d={mood === "chance" ? "M204 74 Q268 110 204 150Z" : mood === "prepare" ? "M204 74 Q240 110 204 150Z" : "M204 74 L214 112 L204 150Z"} fill="#fbf3e3" stroke="#d4513f" strokeWidth="2" />
        <Person x={170} y={160} color="#3767b0" s={0.7} />
        <Person x={232} y={160} color="#d4513f" s={0.7} hair="#5a3624" flip />
      </g>
    </>
  );
}

function DoDontScene({ mode, icons }: { mode: "do" | "dont"; icons: string[] }) {
  const ok = mode === "do";
  const c = ok ? "#3f9a63" : "#d4513f";
  const list = icons.slice(0, 4);
  const step = W / (list.length + 1);
  return (
    <>
      <Sky el={ok ? "wood" : "fire"} id={`dd-${mode}`} />
      <Hills el={ok ? "wood" : "earth"} />
      <rect x="194" y="150" width="12" height="90" fill="#7a4b2e" />
      <rect x="40" y="46" width="320" height="112" rx="14" fill="#fbf3e3" stroke={c} strokeWidth="5" />
      {list.map((ic, i) => {
        const x = step * (i + 1) * 0.8 + 40;
        return (
          <g key={i} className="anim-pop" style={{ animationDelay: `${0.15 + i * 0.15}s`, transformOrigin: `${x}px 100px` }}>
            <circle cx={x} cy={100} r="30" fill={light(c, 0.8)} stroke={c} strokeWidth="3" />
            <text x={x} y={111} textAnchor="middle" fontSize="30">
              {ic}
            </text>
            {!ok && <line x1={x - 21} y1={121} x2={x + 21} y2={79} stroke={c} strokeWidth="5" strokeLinecap="round" />}
          </g>
        );
      })}
      <g className="anim-float">
        <circle cx="200" cy="40" r="20" fill={c} stroke="#fff" strokeWidth="3" />
        <text x="200" y="48" textAnchor="middle" fontSize="22" fontWeight={700} fill="#fff">
          {ok ? "✓" : "✕"}
        </text>
      </g>
    </>
  );
}

function MarketScene() {
  return (
    <>
      <Sky el="earth" id="market" />
      <Cloud y={28} delay={-5} />
      <Hills el="earth" />
      <rect x="110" y="120" width="180" height="100" fill="#e9d8b8" />
      <rect x="110" y="170" width="180" height="50" fill="#a8693f" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M${100 + i * 34} 86 h34 l-6 36 h-34z`} fill={i % 2 ? "#fbf3e3" : "#d4513f"} />
      ))}
      <rect x="96" y="80" width="208" height="8" rx="3" fill="#7a4b2e" />
      {[140, 175, 210, 245].map((x, i) => (
        <text key={x} x={x} y={166} fontSize="24" className="anim-float" style={{ animationDelay: `${i * 0.4}s` }}>
          {["🍎", "🏺", "🧵", "📦"][i]}
        </text>
      ))}
      <Person x={200} y={150} color="#3f9a63" s={0.7} />
      {[0, 1, 2].map((i) => (
        <Coin key={i} x={300 + i * 4} y={200} className="anim-rise" delay={i * 1.1} />
      ))}
      <Person x={330} y={236} color="#3767b0" s={0.8} flip />
    </>
  );
}

function ChestScene({ fill }: { fill: number }) {
  const n = Math.max(2, Math.round(fill * 7));
  return (
    <>
      <Sky el="earth" night id="chest" />
      <Stars n={10} />
      <Hills el="earth" night />
      <g className="anim-glow">
        <ellipse cx="200" cy="150" rx="90" ry="50" fill="#ffd36b" opacity="0.35" />
      </g>
      <path d="M130 150 Q200 86 270 150Z" fill="#8a5530" stroke="#f2c14e" strokeWidth="3" className="anim-sway" style={{ transformOrigin: "200px 150px" }} />
      {Array.from({ length: n }, (_, i) => (
        <Coin key={i} x={150 + ((i * 23) % 100)} y={150 - (i % 3) * 6} className="anim-twinkle" delay={i * 0.3} />
      ))}
      <rect x="130" y="150" width="140" height="64" rx="6" fill="#a8693f" stroke="#f2c14e" strokeWidth="3" />
      <rect x="190" y="166" width="20" height="24" rx="4" fill="#f2c14e" />
      <circle cx="200" cy="176" r="4" fill="#6b4b2a" />
    </>
  );
}

function DeskScene({ el }: { el: Element }) {
  const c = ELEMENT_INFO[el].color;
  return (
    <>
      <Sky el={el} night id="desk" />
      <Stars n={8} />
      <rect x="250" y="40" width="90" height="70" rx="4" fill="#1b2a4a" stroke="#e9d8b8" strokeWidth="4" />
      <circle cx="318" cy="62" r="10" fill="#fff3c4" className="anim-glow" />
      <rect x="60" y="170" width="280" height="12" rx="3" fill="#8a5a36" />
      <rect x="80" y="182" width="12" height="68" fill="#6b4129" />
      <rect x="308" y="182" width="12" height="68" fill="#6b4129" />
      <path d="M110 170 V120 Q110 100 135 96" stroke="#3b2a22" strokeWidth="5" fill="none" />
      <path d="M128 88 L160 96 L150 118 L118 108Z" fill={c} />
      <path d="M124 112 L190 170 H100Z" fill="#ffe08a" opacity="0.35" className="anim-glow" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={250 + i * 4} y={150 - i * 10} width="60" height="10" rx="2" fill={[c, "#e9d8b8", dark(c, 0.3)][i]} />
      ))}
      <rect x="150" y="150" width="60" height="20" rx="2" fill="#fbf3e3" transform="rotate(-4 180 160)" />
      <Person x={200} y={172} color={c} s={0.9} />
      <text x="232" y="128" fontSize="18" className="anim-rise">
        💡
      </text>
    </>
  );
}

function StairsScene({ step }: { step: number }) {
  const s = Math.max(0, Math.min(4, step));
  return (
    <>
      <Sky el="metal" id="stairs" />
      <Cloud y={30} delay={-6} />
      <g className="anim-glow">
        <circle cx="330" cy="50" r="22" fill="#ffe08a" />
      </g>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={60 + i * 60} y={210 - i * 32} width="60" height={40 + i * 32} fill={i <= s ? "#c99a2e" : "#a9b1bd"} stroke="#fff" strokeWidth="2" />
      ))}
      <g className="anim-float">
        <line x1="330" y1="82" x2="330" y2="44" stroke="#6b4129" strokeWidth="3" />
        <path d="M330 44 l26 9 l-26 9z" fill="#d4513f" />
      </g>
      <g className="anim-bob">
        <Person x={90 + s * 60} y={210 - s * 32} color="#3767b0" s={0.8} />
      </g>
    </>
  );
}

function BenchScene() {
  return (
    <>
      <Sky el="water" night id="bench" />
      <Stars n={20} />
      <g className="anim-glow">
        <circle cx="300" cy="60" r="30" fill="#fff3c4" />
      </g>
      <Hills el="wood" night />
      <path d="M70 230 V120 M70 150 Q40 130 50 100 M70 140 Q100 120 96 90" stroke="#3b2a22" strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="56" cy="92" r="26" fill="#2f5f47" />
      <circle cx="96" cy="84" r="24" fill="#3a7354" />
      <rect x="140" y="196" width="130" height="8" rx="3" fill="#8a5a36" />
      <rect x="140" y="170" width="130" height="6" rx="3" fill="#8a5a36" />
      <rect x="150" y="204" width="8" height="26" fill="#6b4129" />
      <rect x="252" y="204" width="8" height="26" fill="#6b4129" />
      <Person x={185} y={198} color="#3767b0" s={0.8} />
      <Person x={225} y={198} color="#d4513f" s={0.8} hair="#5a3624" flip />
      {[0, 1].map((i) => (
        <Heart key={i} x={200 + i * 10} y={140} s={0.9} className="anim-rise" delay={i * 1.6} />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <circle key={i} cx={120 + i * 55} cy={150 + (i % 2) * 24} r="2.2" fill="#fff07a" className="anim-firefly" style={{ animationDelay: `${i * 0.7}s` }} />
      ))}
    </>
  );
}

function FamilyScene({ kids }: { kids: number }) {
  const n = Math.max(1, Math.min(3, kids));
  return (
    <>
      <Sky el="wood" id="family" />
      <g className="anim-glow">
        <circle cx="70" cy="56" r="24" fill="#ffe08a" />
      </g>
      <Cloud y={36} delay={-8} />
      <Hills el="wood" />
      <g className="anim-float">
        <path d="M300 50 l18 22 l-18 22 l-18 -22z" fill="#d4513f" stroke="#fff" strokeWidth="2" />
        <path d="M300 94 q-8 14 4 26 q-10 10 0 22" stroke="#f2c14e" strokeWidth="2" fill="none" />
      </g>
      <path d="M300 94 Q260 160 232 196" stroke="#fff" strokeWidth="1.2" fill="none" />
      <Person x={130} y={236} color="#3767b0" s={0.95} />
      <Person x={290} y={236} color="#d4513f" s={0.95} hair="#5a3624" flip />
      {Array.from({ length: n }, (_, i) => (
        <g key={i} className="anim-bob" style={{ animationDelay: `${i * 0.3}s` }}>
          <Person x={210 + (i - (n - 1) / 2) * 38} y={238} color={["#f2c14e", "#3f9a63", "#8e5bb5"][i]} s={0.6} />
        </g>
      ))}
    </>
  );
}

function NestScene({ eggs }: { eggs: number }) {
  const n = Math.max(0, Math.min(4, eggs));
  return (
    <>
      <Sky el="wood" id="nest" />
      <Cloud y={30} delay={-3} />
      <path d="M0 150 Q120 130 260 160 T400 150" stroke="#6b4129" strokeWidth="14" fill="none" strokeLinecap="round" />
      {[40, 110, 330, 370].map((x, i) => (
        <ellipse key={x} cx={x} cy={136 + (i % 2) * 20} rx="20" ry="9" fill="#4fae72" transform={`rotate(${i % 2 ? 20 : -20} ${x} 140)`} className="anim-sway" style={{ transformOrigin: `${x}px 150px` }} />
      ))}
      <path d="M150 150 Q200 200 250 150Z" fill="#a8793f" />
      <path d="M150 150 Q200 168 250 150" stroke="#7a552a" strokeWidth="4" fill="none" />
      {n === 0 ? (
        <text x="200" y="146" textAnchor="middle" fontSize="20" className="anim-twinkle">
          ✨
        </text>
      ) : (
        Array.from({ length: n }, (_, i) => (
          <ellipse key={i} cx={200 + (i - (n - 1) / 2) * 22} cy={144} rx="10" ry="13" fill="#fbf3e3" stroke="#e3d7c1" className="anim-bob" style={{ animationDelay: `${i * 0.4}s` }} />
        ))
      )}
      <g className="anim-butterfly">
        <text x="90" y="90" fontSize="26">
          🐦
        </text>
      </g>
    </>
  );
}

function TableScene() {
  return (
    <>
      <Sky el="earth" id="table" />
      <rect x="0" y="0" width={W} height={H} fill="#f3e3c8" opacity="0.6" />
      <rect x="150" y="30" width="100" height="70" rx="4" fill="#cfe0fb" stroke="#8a5a36" strokeWidth="5" />
      <line x1="200" y1="30" x2="200" y2="100" stroke="#8a5a36" strokeWidth="3" />
      <circle cx="226" cy="54" r="10" fill="#ffe08a" className="anim-glow" />
      <rect x="0" y="210" width={W} height="40" fill="#b98b5a" />
      <Person x={110} y={196} color="#3767b0" s={0.95} />
      <Person x={290} y={196} color="#d4513f" s={0.95} hair="#5a3624" flip />
      <rect x="110" y="170" width="180" height="10" rx="4" fill="#8a5a36" />
      <rect x="130" y="180" width="10" height="46" fill="#6b4129" />
      <rect x="260" y="180" width="10" height="46" fill="#6b4129" />
      {[165, 200, 235].map((x, i) => (
        <g key={x}>
          <ellipse cx={x} cy={166} rx="14" ry="5" fill="#fbf3e3" stroke="#c9b28c" />
          <path d={`M${x} 156 q5 -8 0 -16 q-5 -8 0 -16`} stroke="#fff" strokeWidth="3" fill="none" opacity="0.8" className="anim-rise" style={{ animationDelay: `${i * 0.8}s` }} />
        </g>
      ))}
      <Heart x={200} y={130} s={1.1} className="anim-float" />
    </>
  );
}

function CompassScene({ el, direction }: { el: Element; direction: string }) {
  const c = ELEMENT_INFO[el].color;
  const angle = { 동쪽: 90, 서쪽: 270, 남쪽: 180, 북쪽: 0, 중앙: 0 }[direction] ?? 0;
  return (
    <>
      <Sky el={el} id="compass" />
      <Hills el={el} />
      <circle cx="200" cy="120" r="84" fill="#fbf3e3" stroke="#6b4b2a" strokeWidth="6" />
      <circle cx="200" cy="120" r="70" fill="none" stroke={c} strokeWidth="2" strokeDasharray="3 6" />
      {[["北", 200, 62], ["東", 262, 127], ["南", 200, 190], ["西", 138, 127]].map(([t, x, y]) => (
        <Glyph key={t as string} x={x as number} y={y as number} text={t as string} size={18} fill="#6b4b2a" />
      ))}
      {direction === "중앙" ? (
        <circle cx="200" cy="120" r="22" fill={c} className="anim-glow" />
      ) : (
        <g className="anim-needle" style={{ transformOrigin: "200px 120px", ["--needle" as string]: `${angle}deg` }}>
          <path d="M200 66 L210 120 L190 120Z" fill={c} />
          <path d="M200 174 L210 120 L190 120Z" fill="#b9b0a0" />
        </g>
      )}
      <circle cx="200" cy="120" r="7" fill="#6b4b2a" />
    </>
  );
}

function Dial({ x, score, label }: { x: number; score: number; label: string }) {
  const kind: FlowKind = score >= 68 ? "chance" : score >= 52 ? "prepare" : "careful";
  const r = 52;
  const circ = Math.PI * r;
  return (
    <g>
      <path d={`M${x - r} 160 A${r} ${r} 0 0 1 ${x + r} 160`} stroke="#ffffff" strokeOpacity="0.55" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path
        d={`M${x - r} 160 A${r} ${r} 0 0 1 ${x + r} 160`}
        stroke={KIND_FILL[kind]}
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${(circ * score) / 100} ${circ}`}
        className="anim-dial"
        style={{ ["--dial" as string]: `${circ}` }}
      />
      <text x={x} y={154} textAnchor="middle" fontSize="30" fontWeight={700} fill="#2b241b">
        {score}
      </text>
      <text x={x} y={188} textAnchor="middle" fontSize="14" fontWeight={700} fill="#2b241b">
        {label}
      </text>
    </g>
  );
}

function DuoScoreScene({ a, b, labelA, labelB, heart = true }: { a: number; b: number; labelA: string; labelB: string; heart?: boolean }) {
  return (
    <>
      <Sky el="earth" id="duoscore" />
      <Cloud y={24} delay={-5} />
      <Hills el="wood" />
      <rect x="30" y="80" width="340" height="124" rx="16" fill="#fbf3e3" opacity="0.92" />
      <Dial x={115} score={a} label={labelA} />
      <Dial x={285} score={b} label={labelB} />
      {heart ? <Heart x={200} y={150} s={1.6} className="anim-float" /> : <text x="200" y="152" textAnchor="middle" fontSize="22">→</text>}
    </>
  );
}

function DuoMonthsScene({ items }: { items: { month: number; a: number; b: number }[] }) {
  const step = (W - 40) / items.length;
  return (
    <>
      <Sky el="water" id="duomonths" />
      {[40, 60, 80].map((v) => (
        <g key={v}>
          <line x1="24" x2="384" y1={214 - v * 1.7} y2={214 - v * 1.7} stroke="#fff" strokeOpacity="0.5" strokeDasharray="3 4" />
          <text x="22" y={218 - v * 1.7} fontSize="9" fill="#2b241b" opacity="0.6" textAnchor="end">
            {v}
          </text>
        </g>
      ))}
      {items.map((m, i) => {
        const x = 30 + step * i + step / 2;
        const bw = Math.min(11, step * 0.36);
        const both = m.a >= 68 && m.b >= 68;
        return (
          <g key={m.month}>
            <rect x={x - bw - 1} y={214 - m.a * 1.7} width={bw} height={m.a * 1.7} rx="3" fill="#3767b0" className="anim-grow" style={{ transformOrigin: `${x}px 214px`, animationDelay: `${i * 0.05}s` }} />
            <rect x={x + 1} y={214 - m.b * 1.7} width={bw} height={m.b * 1.7} rx="3" fill="#d4513f" className="anim-grow" style={{ transformOrigin: `${x}px 214px`, animationDelay: `${i * 0.05 + 0.05}s` }} />
            {both && (
              <text x={x} y={204 - Math.max(m.a, m.b) * 1.7} textAnchor="middle" fontSize="12" className="anim-twinkle">
                ⭐
              </text>
            )}
            <text x={x} y={230} textAnchor="middle" fontSize="11" fontWeight={700} fill="#2b241b">
              {m.month}
            </text>
          </g>
        );
      })}
      <rect x="150" y="10" width="10" height="10" rx="2" fill="#3767b0" />
      <rect x="210" y="10" width="10" height="10" rx="2" fill="#d4513f" />
    </>
  );
}

function SeasonsScene({ items }: { items: { label: string; sub: string; kind: FlowKind; now?: boolean }[] }) {
  const step = W / (items.length + 1);
  return (
    <>
      <Sky el="wood" id="seasons" />
      <Cloud y={20} delay={-6} />
      <path d="M0 200 Q200 180 400 200 V250 H0Z" fill="#6cae7d" />
      <path d="M0 214 Q200 198 400 214" stroke="#f1e2c2" strokeWidth="12" fill="none" />
      {items.map((it, i) => {
        const x = step * (i + 1);
        const h = it.kind === "chance" ? 70 : it.kind === "prepare" ? 50 : 32;
        const leaf = it.kind === "chance" ? "#3f9a63" : it.kind === "prepare" ? "#c99a2e" : "#9aa3b0";
        return (
          <g key={it.label}>
            <g className="anim-grow" style={{ transformOrigin: `${x}px 204px`, animationDelay: `${i * 0.12}s` }}>
              <rect x={x - 3} y={204 - h} width="6" height={h} fill="#7a4b2e" />
              <circle cx={x} cy={204 - h} r={h * 0.36} fill={leaf} />
              <circle cx={x - h * 0.24} cy={204 - h * 0.78} r={h * 0.24} fill={light(leaf, 0.15)} />
            </g>
            {it.now && (
              <text x={x} y={204 - h - h * 0.4 - 6} textAnchor="middle" fontSize="15" className="anim-bob">
                📍
              </text>
            )}
            <text x={x} y={232} textAnchor="middle" fontSize="11" fontWeight={700} fill="#2b241b">
              {it.label}
            </text>
            <text x={x} y={245} textAnchor="middle" fontSize="10" fill="#2b241b">
              {it.sub}
            </text>
          </g>
        );
      })}
    </>
  );
}

export default memo(SceneView);

function SceneView({ scene, className }: { scene: SceneSpec; className?: string }) {
  let body: React.ReactNode;
  switch (scene.kind) {
    case "cover":
      body = <Cover {...scene} />;
      break;
    case "year":
      body = <YearScene {...scene} />;
      break;
    case "month":
      body = <MonthScene {...scene} />;
      break;
    case "guest":
      body = <GuestScene {...scene} />;
      break;
    case "path":
      body = <PathScene mood={scene.mood} />;
      break;
    case "money":
      body = <MoneyScene variant={scene.variant} fill={scene.fill} />;
      break;
    case "love":
      body = <LoveScene variant={scene.variant} />;
      break;
    case "couple":
      body = <CoupleScene variant={scene.variant} />;
      break;
    case "children":
      body = <ChildrenScene count={scene.count} unknown={scene.unknown} />;
      break;
    case "work":
      body = <WorkScene group={scene.group} />;
      break;
    case "lantern":
      body = <LanternScene el={scene.el} />;
      break;
    case "stones":
      body = <StonesScene items={scene.items} />;
      break;
    case "duo":
      body = <DuoScene {...scene} />;
      break;
    case "stems":
      body = <StemsScene {...scene} />;
      break;
    case "exchange":
      body = <ExchangeScene {...scene} />;
      break;
    case "bridge":
      body = <BridgeScene />;
      break;
    case "pillars":
      body = <PillarsScene {...scene} />;
      break;
    case "balance":
      body = <BalanceScene {...scene} />;
      break;
    case "months":
      body = <MonthsScene {...scene} />;
      break;
    case "boat":
      body = <BoatScene mood={scene.mood} />;
      break;
    case "dodont":
      body = <DoDontScene mode={scene.mode} icons={scene.icons} />;
      break;
    case "market":
      body = <MarketScene />;
      break;
    case "chest":
      body = <ChestScene fill={scene.fill} />;
      break;
    case "desk":
      body = <DeskScene el={scene.el} />;
      break;
    case "stairs":
      body = <StairsScene step={scene.step} />;
      break;
    case "bench":
      body = <BenchScene />;
      break;
    case "family":
      body = <FamilyScene kids={scene.kids} />;
      break;
    case "nest":
      body = <NestScene eggs={scene.eggs} />;
      break;
    case "table":
      body = <TableScene />;
      break;
    case "compass":
      body = <CompassScene el={scene.el} direction={scene.direction} />;
      break;
    case "duoScore":
      body = <DuoScoreScene {...scene} />;
      break;
    case "duoMonths":
      body = <DuoMonthsScene items={scene.items} />;
      break;
    case "seasons":
      body = <SeasonsScene items={scene.items} />;
      break;
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`scene block h-auto w-full ${className ?? ""}`} role="img" aria-hidden>
      {body}
    </svg>
  );
}
