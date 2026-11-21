"use client";

import { useMemo, useState } from "react";
import { BRANCH_KO, STEM_KO } from "@/lib/saju/constants";
import type { Analysis } from "@/lib/saju/engine";
import { addDays, dayFlow, type DayFlow } from "@/lib/saju/life";
import { GOD_MONTH_FLOW } from "@/lib/story/essays";
import { GOD_DO3, GOD_DONT3 } from "@/lib/story/rich";
import { fmtPoints, scoreWord } from "@/lib/story/yearly";

interface Person {
  name: string;
  a: Analysis;
}
interface Cell {
  date: Date;
  me: DayFlow;
  partner: DayFlow | null;
  /** 둘 중 낮은 점수 (혼자면 내 점수) */
  min: number;
  clash: boolean;
}

const color = (s: number) => (s >= 68 ? "#3f9a63" : s >= 52 ? "#c99a2e" : "#8792a3");
const same = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

function cellOf(date: Date, me: Person, partner: Person | null): Cell {
  const m = dayFlow(me.a, date);
  const p = partner ? dayFlow(partner.a, date) : null;
  return { date, me: m, partner: p, min: p ? Math.min(m.score, p.score) : m.score, clash: m.clashDay || Boolean(p?.clashDay) };
}

/** 앞으로 60일 중 좋은 날을 캘린더 파일(.ics)로 만든다 */
function buildIcs(me: Person, partner: Person | null, from: Date): string {
  const cells = Array.from({ length: 60 }, (_, i) => cellOf(addDays(from, i), me, partner));
  const good = cells.filter((c) => c.min >= 68 && !c.clash);
  const care = cells.filter((c) => c.clash || c.min < 45);
  const ev = (c: Cell, title: string, desc: string) =>
    ["BEGIN:VEVENT", `UID:masa-${ymd(c.date)}-${title.length}@masa`, `DTSTAMP:${ymd(from)}T000000Z`, `DTSTART;VALUE=DATE:${ymd(c.date)}`, `DTEND;VALUE=DATE:${ymd(addDays(c.date, 1))}`, `SUMMARY:${title}`, `DESCRIPTION:${desc}`, "END:VEVENT"].join("\r\n");
  const who = (c: Cell) => (c.partner && partner ? `${me.name} ${c.me.score}점 / ${partner.name} ${c.partner.score}점` : `${c.me.score}점`);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MASA//Saju Calendar//KO",
    "CALSCALE:GREGORIAN",
    ...good.map((c) => ev(c, partner ? "🌟 함께 움직이기 좋은 날 (MASA)" : "🌟 기운이 좋은 날 (MASA)", `${who(c)} · ${STEM_KO[c.me.stem]}${BRANCH_KO[c.me.branch]}일`)),
    ...care.map((c) => ev(c, "⚠ 조심할 날 (MASA)", `${who(c)}${c.clash ? " · 일지 충" : ""} · 큰 결정과 다툼을 피하세요`)),
    "END:VCALENDAR",
  ].join("\r\n");
}

export default function CalendarPanel({ me, partner }: { me: Person; partner: Person | null }) {
  const today = useMemo(() => new Date(), []);
  const [offset, setOffset] = useState(0);
  const [picked, setPicked] = useState<Date>(today);
  const first = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const cells = useMemo(() => {
    const n = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    return Array.from({ length: n }, (_, i) => cellOf(new Date(first.getFullYear(), first.getMonth(), i + 1), me, partner));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [first.getFullYear(), first.getMonth(), me, partner]);
  const sel = cells.find((c) => same(c.date, picked)) ?? cellOf(picked, me, partner);
  const best = [...cells].filter((c) => !c.clash).sort((x, y) => y.min - x.min).slice(0, 3);

  const download = () => {
    const blob = new Blob([buildIcs(me, partner, today)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "masa-calendar.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  const detail = (name: string, f: DayFlow) => (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
      <p className="font-serif-kr font-bold">
        {name} · <span style={{ color: color(f.score) }}>{f.score}점 ({scoreWord(f.score)})</span> · {f.god}의 날
      </p>
      <p className="mt-1 text-sm">{GOD_MONTH_FLOW[f.god]}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        근거: 기본 60 → {fmtPoints(f.points)} → 그날 {f.own}점, 이달의 흐름 40% 반영
      </p>
      <p className="mt-2 text-sm">
        <b className="text-[#3f9a63]">해 볼 일</b> — {GOD_DO3[f.god][0]}
      </p>
      <p className="mt-1 text-sm">
        <b className="text-[#d4513f]">피할 일</b> — {GOD_DONT3[f.god][0]}
      </p>
      {f.clashDay && <p className="mt-1 text-sm">⚠ 일지와 충이 드는 날이에요. 이동과 변화가 많고 예민해지기 쉬워요.</p>}
      {f.hapDay && <p className="mt-1 text-sm">🤝 일지와 합이 드는 날이에요. 만남과 약속이 부드럽게 풀려요.</p>}
    </div>
  );

  return (
    <div className="grid gap-4 text-[15px] leading-relaxed">
      <p>
        날마다 바뀌는 기운(일진)을 사주에 대어 점수를 매겼어요. {partner ? "칸 왼쪽 점이 " + me.name + ", 오른쪽 점이 " + partner.name + "의 기운이에요. ⭐은 두 사람 모두 좋은 날, ⚠은 일지에 충이 드는 날이에요." : "⭐은 기운이 좋은 날, ⚠은 일지에 충이 드는 날이에요."}
      </p>

      <div className="flex items-center justify-between">
        <button onClick={() => setOffset((o) => o - 1)} disabled={offset <= -1} className="nav-btn rounded-lg px-3 py-1.5 disabled:opacity-30">
          ◀
        </button>
        <b className="font-serif-kr text-lg">
          {first.getFullYear()}년 {first.getMonth() + 1}월
        </b>
        <button onClick={() => setOffset((o) => o + 1)} disabled={offset >= 12} className="nav-btn rounded-lg px-3 py-1.5 disabled:opacity-30">
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {"일월화수목금토".split("").map((d) => (
          <span key={d} className="py-1 text-[var(--muted)]">
            {d}
          </span>
        ))}
        {Array.from({ length: first.getDay() }, (_, i) => (
          <span key={`b${i}`} />
        ))}
        {cells.map((c) => {
          const star = c.min >= 68 && !c.clash;
          return (
            <button
              key={c.date.getDate()}
              onClick={() => setPicked(c.date)}
              className="flex aspect-square flex-col items-center justify-center rounded-lg border"
              style={{ borderColor: same(c.date, picked) ? "var(--ink)" : same(c.date, today) ? "var(--accent)" : "var(--line)", borderWidth: same(c.date, picked) ? 2 : 1, background: "var(--bg)" }}
            >
              <span className="text-[13px] font-medium">{c.date.getDate()}</span>
              <span className="flex gap-0.5">
                <span className="h-2 w-2 rounded-full" style={{ background: color(c.me.score) }} />
                {c.partner && <span className="h-2 w-2 rounded-full" style={{ background: color(c.partner.score) }} />}
              </span>
              <span className="h-3 text-[9px] leading-3">{c.clash ? "⚠" : star ? "⭐" : ""}</span>
            </button>
          );
        })}
      </div>

      <p className="text-sm">
        🌟 이달의 가장 좋은 날 — <b>{best.map((c) => `${c.date.getDate()}일(${c.partner ? `${c.me.score}·${c.partner.score}` : c.me.score}점)`).join(", ")}</b>
      </p>

      <div className="grid gap-2">
        <p className="font-serif-kr text-lg font-bold">
          {sel.date.getMonth() + 1}월 {sel.date.getDate()}일 ({"일월화수목금토"[sel.date.getDay()]}) · {STEM_KO[sel.me.stem]}
          {BRANCH_KO[sel.me.branch]}일{same(sel.date, today) ? " · 오늘" : ""}
        </p>
        {detail(me.name, sel.me)}
        {sel.partner && partner && detail(partner.name, sel.partner)}
        {sel.partner && partner && (
          <p className="text-sm">
            {sel.clash
              ? "두 사람 중 한 사람의 자리에 충이 드는 날이에요. 무거운 이야기와 큰 결정은 다른 날로 미루세요."
              : sel.min >= 68
                ? "두 사람 모두 기운이 좋은 날이에요. 함께하는 약속, 여행, 중요한 결정을 이날로 잡아 보세요."
                : Math.abs(sel.me.score - sel.partner.score) >= 12
                  ? `${sel.me.score > sel.partner.score ? me.name : partner.name} 쪽 기운이 더 좋은 날이에요. 기운이 좋은 사람이 집안일과 결정을 조금 더 맡아 주세요.`
                  : "두 사람의 기운이 비슷한 평범한 날이에요."}
          </p>
        )}
      </div>

      <button onClick={download} className="nav-btn rounded-xl py-2.5 text-sm font-medium">
        📅 앞으로 60일의 좋은 날·조심할 날을 캘린더 파일로 받기 (.ics)
      </button>
      <p className="text-xs text-[var(--muted)]">받은 파일을 열면 휴대폰이나 컴퓨터의 캘린더 앱에 일정으로 들어가요.</p>
    </div>
  );
}
