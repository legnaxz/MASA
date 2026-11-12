"use client";

import { useState } from "react";
import type { BirthInput } from "@/lib/saju/engine";

const field = "w-full rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-[15px] outline-none focus:border-[var(--ink)]";

export default function BirthForm({ onSubmit }: { onSubmit: (input: BirthInput) => void }) {
  const [date, setDate] = useState("1990-05-15");
  const [time, setTime] = useState("10:30");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [calendar, setCalendar] = useState<"solar" | "lunar">("solar");
  const [leapMonth, setLeapMonth] = useState(false);
  const [gender, setGender] = useState<"male" | "female">("female");
  const [correction, setCorrection] = useState(true);

  return (
    <form
      className="panel grid gap-4 rounded-2xl p-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const [y, m, d] = date.split("-").map(Number);
        const [h, mi] = time.split(":").map(Number);
        onSubmit({
          year: y,
          month: m,
          day: d,
          hour: timeUnknown ? null : h,
          minute: timeUnknown ? 0 : mi,
          calendar,
          leapMonth: calendar === "lunar" && leapMonth,
          gender,
          solarTimeCorrection: correction,
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="text-[var(--muted)]">생년월일</span>
          <input type="date" required min="1900-01-01" max="2099-12-31" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-[var(--muted)]">태어난 시간</span>
          <input type="time" value={time} disabled={timeUnknown} onChange={(e) => setTime(e.target.value)} className={`${field} disabled:opacity-40`} />
        </label>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <Segment
          value={calendar}
          options={[["solar", "양력"], ["lunar", "음력"]]}
          onChange={(v) => setCalendar(v as "solar" | "lunar")}
        />
        <Segment
          value={gender}
          options={[["female", "여성"], ["male", "남성"]]}
          onChange={(v) => setGender(v as "male" | "female")}
        />
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <Check checked={timeUnknown} onChange={setTimeUnknown} label="시간 모름" />
        {calendar === "lunar" && <Check checked={leapMonth} onChange={setLeapMonth} label="윤달" />}
        <Check checked={correction} onChange={setCorrection} label="한국 시간 30분 보정" />
      </div>

      <button type="submit" className="draw-btn font-serif-kr rounded-xl py-3 text-lg font-bold">
        카드 뽑기
      </button>
    </form>
  );
}

function Segment({ value, options, onChange }: { value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-[var(--line)] p-0.5">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`rounded-md px-3.5 py-1.5 ${value === v ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--muted)]"}`}
          aria-pressed={value === v}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--ink)]" />
      {label}
    </label>
  );
}
