"use client";

import { useMemo } from "react";
import { BRANCH_KO, ELEMENT_INFO, STEM_EL, STEM_KO } from "@/lib/saju/constants";
import type { Analysis } from "@/lib/saju/engine";
import { lifeCurve } from "@/lib/saju/life";
import { ieyo } from "@/lib/story/text";

const W = 720;
const H = 300;
const PAD = { l: 34, r: 12, t: 28, b: 54 };

/** 인생 그래프 — 0~84세 운의 흐름을 한 장으로 */
export default function LifeGraph({ a, name }: { a: Analysis; name: string }) {
  const { points, decades, birth } = useMemo(() => lifeCurve(a), [a]);
  const nowAge = new Date().getFullYear() - birth;
  const x = (age: number) => PAD.l + (age / 84) * (W - PAD.l - PAD.r);
  const y = (s: number) => PAD.t + (1 - (s - 20) / 80) * (H - PAD.t - PAD.b);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(p.age).toFixed(1)} ${y(p.score).toFixed(1)}`).join(" ");
  const area = `${path} L${x(84)} ${y(20)} L${x(0)} ${y(20)}Z`;
  const peak = points.reduce((m, p) => (p.score > m.score ? p : m));
  const low = points.filter((p) => p.age >= 10).reduce((m, p) => (p.score < m.score ? p : m));
  const now = points.find((p) => p.age === nowAge);
  const bestDec = decades.reduce((m, d) => (d.score > m.score ? d : m), decades[0]);
  const hardDec = decades.reduce((m, d) => (d.score < m.score ? d : m), decades[0]);
  const cur = [...decades].reverse().find((d) => d.d.startAge <= nowAge);
  const next = decades.find((d) => d.d.startAge > nowAge);
  const gz = (s: string, b: string) => STEM_KO[s] + BRANCH_KO[b];

  return (
    <section className="panel rounded-2xl p-4 sm:p-5">
      <h2 className="font-serif-kr text-lg font-bold">📈 {name}의 인생 그래프</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">10년 단위의 대운(60%)과 해마다의 세운(40%)을 더한 점수예요. 색 띠는 대운, 굵은 선은 운의 높낮이예요.</p>

      <div className="mt-3 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full min-w-[560px]" role="img" aria-label="인생 그래프">
          {decades.map((d, i) => {
            const start = Math.max(0, d.d.startAge);
            const end = Math.min(84, (decades[i + 1]?.d.startAge ?? start + 10));
            if (start >= 84) return null;
            const c = ELEMENT_INFO[STEM_EL[d.d.stem]].color;
            // 그래프 끝에 걸려 폭이 좁은 대운은 색 띠만 그리고 글자는 생략한다
            const wide = end - start >= 6;
            return (
              <g key={d.d.startAge}>
                <rect x={x(start)} y={PAD.t} width={x(end) - x(start)} height={H - PAD.t - PAD.b} fill={c} opacity={0.1 + (d.score - 40) / 400} />
                <line x1={x(start)} x2={x(start)} y1={PAD.t} y2={H - PAD.b} stroke="var(--line)" />
                {wide && (
                  <>
                <text x={(x(start) + x(end)) / 2} y={H - PAD.b + 16} textAnchor="middle" fontSize="12" fontWeight={700} fill="var(--ink)" className="font-serif-kr">
                  {gz(d.d.stem, d.d.branch)}
                </text>
                <text x={(x(start) + x(end)) / 2} y={H - PAD.b + 31} textAnchor="middle" fontSize="10" fill="var(--muted)">
                  {start}세~ · {d.score}점
                </text>
                <text x={(x(start) + x(end)) / 2} y={H - PAD.b + 45} textAnchor="middle" fontSize="10" fill="var(--muted)">
                  {d.d.god}
                </text>
                  </>
                )}
              </g>
            );
          })}
          {[40, 60, 80].map((v) => (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeDasharray="3 4" />
              <text x={PAD.l - 6} y={y(v) + 4} textAnchor="end" fontSize="10" fill="var(--muted)">
                {v}
              </text>
            </g>
          ))}
          <path d={area} fill="var(--accent)" opacity="0.12" />
          <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" className="life-line" />
          <circle cx={x(peak.age)} cy={y(peak.score)} r="5" fill="#3f9a63" stroke="#fff" strokeWidth="2" />
          <text x={x(peak.age)} y={y(peak.score) - 9} textAnchor="middle" fontSize="11" fontWeight={700} fill="#3f9a63">
            {peak.age}세 최고 {peak.score}
          </text>
          <circle cx={x(low.age)} cy={y(low.score)} r="5" fill="#8792a3" stroke="#fff" strokeWidth="2" />
          <text x={x(low.age)} y={y(low.score) + 18} textAnchor="middle" fontSize="11" fontWeight={700} fill="#8792a3">
            {low.age}세 {low.score}
          </text>
          {now && (
            <g>
              <line x1={x(now.age)} x2={x(now.age)} y1={PAD.t - 6} y2={H - PAD.b} stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="4 3" />
              <circle cx={x(now.age)} cy={y(now.score)} r="6" fill="var(--ink)" stroke="var(--card)" strokeWidth="2" />
              <text x={x(now.age)} y={PAD.t - 10} textAnchor="middle" fontSize="11" fontWeight={700} fill="var(--ink)">
                지금 {now.age}세 · {now.score}점
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="mt-3 space-y-2 text-[15px] leading-relaxed">
        {cur && (
          <p>
            지금은 <b className="text-[var(--accent)]">{gz(cur.d.stem, cur.d.branch)} 대운</b>({cur.d.startAge}~{cur.d.startAge + 9}세, {cur.d.god}) 안에 있고, 대운 점수는 {cur.score}점이에요. {cur.flow.basis !== "중립" ? `근거는 ${ieyo(cur.flow.basis)}.` : "특별히 돕거나 막는 기운이 없는 무난한 대운이에요."}
          </p>
        )}
        {next && (
          <p>
            다음 대운은 {next.d.startAge}세부터 시작하는 <b className="text-[var(--accent)]">{gz(next.d.stem, next.d.branch)} 대운</b>({next.d.god}, {next.score}점)이에요. {cur && next.score - cur.score >= 8 ? "지금보다 흐름이 좋아져요. 그때 펼칠 일을 지금부터 준비해 두세요." : cur && cur.score - next.score >= 8 ? "지금보다 흐름이 낮아져요. 지금 대운 안에 기반을 단단히 다져 두세요." : "지금과 비슷한 흐름이 이어져요."}
          </p>
        )}
        <p>
          평생 가장 좋은 10년은 <b className="text-[#3f9a63]">{bestDec.d.startAge}~{bestDec.d.startAge + 9}세({gz(bestDec.d.stem, bestDec.d.branch)} 대운, {bestDec.score}점)</b>, 가장 버거운 10년은 <b>{hardDec.d.startAge}~{hardDec.d.startAge + 9}세({gz(hardDec.d.stem, hardDec.d.branch)} 대운, {hardDec.score}점)</b>이에요. 버거운 대운은 나쁜 시기가 아니라 힘을 기르는 시기예요. 그때 배운 것이 다음 좋은 대운의 밑천이 돼요.
        </p>
      </div>
    </section>
  );
}
