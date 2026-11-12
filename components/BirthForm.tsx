"use client";

import { useEffect, useState } from "react";
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
  /** 숫자만: YYYYMMDD */
  date: string;
  /** 숫자만: HHMM */
  time: string;
  timeUnknown: boolean;
  calendar: "solar" | "lunar";
  leapMonth: boolean;
  gender: "male" | "female";
}

interface Saved {
  mode: Mode;
  me: PersonState;
  partner: PersonState;
  correction: boolean;
}

/** 입력값은 이 브라우저(localStorage)에만 저장된다 */
const STORAGE_KEY = "masa:birth:v1";

const blank = (gender: "male" | "female"): PersonState => ({
  name: "",
  date: "",
  time: "",
  timeUnknown: false,
  calendar: "solar",
  leapMonth: false,
  gender,
});

const digits = (s: string, max: number) => s.replace(/\D/g, "").slice(0, max);
const showDate = (d: string) => [d.slice(0, 4), d.slice(4, 6), d.slice(6, 8)].filter(Boolean).join(".");
const showTime = (t: string) => [t.slice(0, 2), t.slice(2, 4)].filter(Boolean).join(":");

function dateError(p: PersonState): string | null {
  if (p.date.length !== 8) return "생년월일 8자리를 입력해 주세요 (예: 19900515)";
  const y = +p.date.slice(0, 4);
  const m = +p.date.slice(4, 6);
  const d = +p.date.slice(6, 8);
  if (y < 1900 || y > 2099) return "태어난 해는 1900~2099년 사이로 입력해 주세요";
  if (m < 1 || m > 12) return "월은 01~12 사이로 입력해 주세요";
  const maxDay = p.calendar === "lunar" ? 30 : new Date(y, m, 0).getDate();
  if (d < 1 || d > maxDay) return `일은 01~${maxDay} 사이로 입력해 주세요`;
  return null;
}

function timeError(p: PersonState): string | null {
  if (p.timeUnknown) return null;
  if (p.time.length !== 4) return "태어난 시간 4자리를 입력하거나 「시간 모름」을 선택해 주세요 (예: 0930)";
  if (+p.time.slice(0, 2) > 23 || +p.time.slice(2, 4) > 59) return "시간은 0000~2359 사이로 입력해 주세요";
  return null;
}

const toInput = (p: PersonState, correction: boolean): PersonInput => ({
  name: p.name.trim(),
  birth: {
    year: +p.date.slice(0, 4),
    month: +p.date.slice(4, 6),
    day: +p.date.slice(6, 8),
    hour: p.timeUnknown ? null : +p.time.slice(0, 2),
    minute: p.timeUnknown ? 0 : +p.time.slice(2, 4),
    calendar: p.calendar,
    leapMonth: p.calendar === "lunar" && p.leapMonth,
    gender: p.gender,
    solarTimeCorrection: correction,
  },
});

export default function BirthForm({ onSubmit }: { onSubmit: (r: FormResult) => void }) {
  const [mode, setMode] = useState<Mode>("couple");
  const [me, setMe] = useState<PersonState>(blank("female"));
  const [partner, setPartner] = useState<PersonState>(blank("male"));
  const [correction, setCorrection] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [tried, setTried] = useState(false);

  // 저장된 입력 불러오기 (첫 렌더 뒤에 읽어 서버 렌더와 어긋나지 않게 한다)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Partial<Saved>;
        if (s.mode === "couple" || s.mode === "solo") setMode(s.mode);
        if (s.me) setMe({ ...blank("female"), ...s.me });
        if (s.partner) setPartner({ ...blank("male"), ...s.partner });
        if (typeof s.correction === "boolean") setCorrection(s.correction);
        setHasSaved(true);
      }
    } catch {
      // 저장소를 못 쓰는 환경이면 빈 폼으로 시작
    }
    setLoaded(true);
  }, []);

  // 입력이 바뀔 때마다 저장
  useEffect(() => {
    if (!loaded) return;
    try {
      const data: Saved = { mode, me, partner, correction };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setHasSaved(Boolean(me.date || partner.date || me.name || partner.name));
    } catch {
      // 무시
    }
  }, [loaded, mode, me, partner, correction]);

  const people = mode === "couple" ? [me, partner] : [me];
  const invalid = people.some((p) => dateError(p) || timeError(p));

  const clear = () => {
    setMe(blank("female"));
    setPartner(blank("male"));
    setTried(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // 무시
    }
    setHasSaved(false);
  };

  return (
    <form
      noValidate
      className="panel grid gap-4 rounded-2xl p-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (invalid) return;
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

      <PersonFields title={mode === "couple" ? "나" : undefined} value={me} onChange={setMe} namePlaceholder="이름 (선택)" showErrors={tried} />
      {mode === "couple" && <PersonFields title="상대" value={partner} onChange={setPartner} namePlaceholder="상대 이름 (선택)" showErrors={tried} />}

      <label className="flex cursor-pointer items-center gap-1.5 text-sm">
        <input type="checkbox" checked={correction} onChange={(e) => setCorrection(e.target.checked)} className="h-4 w-4 accent-[var(--ink)]" />
        한국 시간 30분 보정
      </label>

      <button type="submit" className="draw-btn font-serif-kr rounded-xl py-3 text-lg font-bold">
        {mode === "couple" ? "우리 이야기 펼치기" : "이야기 펼치기"}
      </button>

      <p className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
        <span>입력한 내용은 이 기기의 브라우저에만 저장돼요.</span>
        {hasSaved && (
          <button type="button" onClick={clear} className="underline underline-offset-2">
            저장된 입력 지우기
          </button>
        )}
      </p>
    </form>
  );
}

function PersonFields({
  title,
  value,
  onChange,
  namePlaceholder,
  showErrors,
}: {
  title?: string;
  value: PersonState;
  onChange: (v: PersonState) => void;
  namePlaceholder: string;
  showErrors: boolean;
}) {
  const set = <K extends keyof PersonState>(k: K, v: PersonState[K]) => onChange({ ...value, [k]: v });
  const dErr = showErrors ? dateError(value) : null;
  const tErr = showErrors ? timeError(value) : null;
  return (
    <fieldset className="grid gap-3 rounded-xl border border-[var(--line)] p-3">
      {title && <legend className="font-serif-kr px-1.5 text-sm font-bold">{title}</legend>}
      <input value={value.name} onChange={(e) => set("name", e.target.value)} placeholder={namePlaceholder} maxLength={10} autoComplete="off" className={field} />
      <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-1 text-xs">
          <span className="text-[var(--muted)]">생년월일 (숫자 8자리)</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="19900515"
            value={showDate(value.date)}
            onChange={(e) => set("date", digits(e.target.value, 8))}
            aria-invalid={Boolean(dErr)}
            className={`${field} ${dErr ? "border-[#d4513f]" : ""}`}
          />
        </label>
        <label className="grid gap-1 text-xs">
          <span className="text-[var(--muted)]">태어난 시간 (24시간, 4자리)</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0930"
            disabled={value.timeUnknown}
            value={showTime(value.time)}
            onChange={(e) => set("time", digits(e.target.value, 4))}
            aria-invalid={Boolean(tErr)}
            className={`${field} disabled:opacity-40 ${tErr ? "border-[#d4513f]" : ""}`}
          />
        </label>
      </div>
      {(dErr || tErr) && <p className="text-xs text-[#d4513f]">{dErr ?? tErr}</p>}
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
