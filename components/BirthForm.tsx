"use client";

import { useState } from "react";
import type { BirthInput } from "@/lib/saju/engine";

const field =
  "w-full min-w-0 rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-[16px] outline-none focus:border-[var(--ink)]";

export type Mode = "couple" | "solo";

export interface PersonInput {
  name: string;
  birth: BirthInput;
}

export interface FormResult {
  mode: Mode;
  me: PersonInput;
  partner: PersonInput | null;
}

interface PersonState {
  name: string;
  date: string;
  time: string;
  timeUnknown: boolean;
  calendar: "solar" | "lunar";
  leapMonth: boolean;
  gender: "male" | "female";
}

const toInput = (p: PersonState, correction: boolean): PersonInput => {
  const [y, m, d] = p.date.split("-").map(Number);
  const [h, mi] = p.time.split(":").map(Number);
  return {
    name: p.name.trim(),
    birth: {
      year: y,
      month: m,
      day: d,
      hour: p.timeUnknown ? null : h,
      minute: p.timeUnknown ? 0 : mi,
      calendar: p.calendar,
      leapMonth: p.calendar === "lunar" && p.leapMonth,
      gender: p.gender,
      solarTimeCorrection: correction,
    },
  };
};

export default function BirthForm({ onSubmit }: { onSubmit: (r: FormResult) => void }) {
  const [mode, setMode] = useState<Mode>("couple");
  const [me, setMe] = useState<PersonState>({ name: "", date: "1990-05-15", time: "10:30", timeUnknown: false, calendar: "solar", leapMonth: false, gender: "female" });
  const [partner, setPartner] = useState<PersonState>({ name: "", date: "1988-11-02", time: "14:00", timeUnknown: false, calendar: "solar", leapMonth: false, gender: "male" });
  const [correction, setCorrection] = useState(true);

  return (
    <form
      className="panel grid gap-4 rounded-2xl p-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          mode,
          me: toInput(me, correction),
          partner: mode === "couple" ? toInput(partner, correction) : null,
        });
      }}
    >
      <div className="grid grid-cols-2 rounded-xl border border-[var(--line)] p-1 text-sm">
        {(
          [
            ["couple", "💞 커플 사주"],
            ["solo", "🙋 혼자 보기"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => setMode(v)}
            aria-pressed={mode === v}
            className={`rounded-lg py-2 font-medium ${mode === v ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--muted)]"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <PersonFields title={mode === "couple" ? "나" : undefined} value={me} onChange={setMe} namePlaceholder="이름 (선택)" />
      {mode === "couple" && <PersonFields title="상대" value={partner} onChange={setPartner} namePlaceholder="상대 이름 (선택)" />}

      <label className="flex cursor-pointer items-center gap-1.5 text-sm">
        <input type="checkbox" checked={correction} onChange={(e) => setCorrection(e.target.checked)} className="h-4 w-4 accent-[var(--ink)]" />
        한국 시간 30분 보정
      </label>

      <button type="submit" className="draw-btn font-serif-kr rounded-xl py-3 text-lg font-bold">
        {mode === "couple" ? "우리 이야기 펼치기" : "이야기 펼치기"}
      </button>
    </form>
  );
}

function PersonFields({
  title,
  value,
  onChange,
  namePlaceholder,
}: {
  title?: string;
  value: PersonState;
  onChange: (v: PersonState) => void;
  namePlaceholder: string;
}) {
  const set = <K extends keyof PersonState>(k: K, v: PersonState[K]) => onChange({ ...value, [k]: v });
  return (
    <fieldset className="grid gap-3 rounded-xl border border-[var(--line)] p-3">
      {title && <legend className="font-serif-kr px-1.5 text-sm font-bold">{title}</legend>}
      <input value={value.name} onChange={(e) => set("name", e.target.value)} placeholder={namePlaceholder} maxLength={10} className={field} />
      <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-1 text-xs">
          <span className="text-[var(--muted)]">생년월일</span>
          <input type="date" required min="1900-01-01" max="2099-12-31" value={value.date} onChange={(e) => set("date", e.target.value)} className={field} />
        </label>
        <label className="grid gap-1 text-xs">
          <span className="text-[var(--muted)]">태어난 시간</span>
          <input type="time" value={value.time} disabled={value.timeUnknown} onChange={(e) => set("time", e.target.value)} className={`${field} disabled:opacity-40`} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <Segment value={value.calendar} options={[["solar", "양력"], ["lunar", "음력"]]} onChange={(v) => set("calendar", v as "solar" | "lunar")} />
        <Segment value={value.gender} options={[["female", "여성"], ["male", "남성"]]} onChange={(v) => set("gender", v as "male" | "female")} />
        <Check checked={value.timeUnknown} onChange={(v) => set("timeUnknown", v)} label="시간 모름" />
        {value.calendar === "lunar" && <Check checked={value.leapMonth} onChange={(v) => set("leapMonth", v)} label="윤달" />}
      </div>
    </fieldset>
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
          className={`rounded-md px-3 py-1.5 ${value === v ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--muted)]"}`}
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
