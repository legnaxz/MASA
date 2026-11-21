"use client";

import { useState } from "react";
import { blankPerson, dateError, timeError, type PersonState } from "@/lib/share";
import { RELATION_LABEL, type Relation } from "@/lib/story/family";

export interface FamilyEntry {
  relation: Relation;
  person: PersonState;
}

const field = "w-full min-w-0 rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-[16px] outline-none focus:border-[var(--ink)]";
const digits = (s: string, max: number) => s.replace(/\D/g, "").slice(0, max);
const showDate = (d: string) => [d.slice(0, 4), d.slice(4, 6), d.slice(6, 8)].filter(Boolean).join(".");
const showTime = (t: string) => [t.slice(0, 2), t.slice(2, 4)].filter(Boolean).join(":");

/** 가족 추가 — 아이·부모님·형제자매 */
export default function FamilyPanel({ entries, onChange, onOpen }: { entries: FamilyEntry[]; onChange: (e: FamilyEntry[]) => void; onOpen: () => void }) {
  const [relation, setRelation] = useState<Relation>("child");
  const [p, setP] = useState<PersonState>({ ...blankPerson("female"), timeUnknown: false });
  const [tried, setTried] = useState(false);
  const err = dateError(p) ?? timeError(p) ?? (p.name.trim() ? null : "이름이나 호칭을 입력해 주세요 (예: 첫째, 어머니)");
  const set = <K extends keyof PersonState>(k: K, v: PersonState[K]) => setP((x) => ({ ...x, [k]: v }));

  const add = () => {
    setTried(true);
    if (err) return;
    onChange([...entries, { relation, person: { ...p, name: p.name.trim() } }]);
    setP(blankPerson("female"));
    setTried(false);
  };

  return (
    <div className="grid gap-4 text-[15px] leading-relaxed">
      <p>아이, 부모님, 형제자매를 더하면 가족 전체의 오행과 한 사람씩의 성향, 우리와의 관계를 풀어 드려요. 입력한 내용은 이 기기에만 저장돼요.</p>

      {entries.length > 0 && (
        <ul className="grid gap-2">
          {entries.map((e, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2">
              <span>
                <b>{e.person.name}</b> <span className="text-sm text-[var(--muted)]">· {RELATION_LABEL[e.relation]} · {showDate(e.person.date)}</span>
              </span>
              <button onClick={() => onChange(entries.filter((_, j) => j !== i))} className="text-sm text-[var(--muted)] underline underline-offset-2">
                지우기
              </button>
            </li>
          ))}
        </ul>
      )}

      <fieldset className="grid gap-3 rounded-xl border border-[var(--line)] p-3">
        <legend className="font-serif-kr px-1.5 text-sm font-bold">가족 추가</legend>
        <div className="inline-flex w-fit rounded-lg border border-[var(--line)] p-0.5 text-sm">
          {(Object.keys(RELATION_LABEL) as Relation[]).map((r) => (
            <button key={r} type="button" onClick={() => setRelation(r)} aria-pressed={relation === r} className={`rounded-md px-3 py-1.5 ${relation === r ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--muted)]"}`}>
              {RELATION_LABEL[r]}
            </button>
          ))}
        </div>
        <input value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="이름이나 호칭 (예: 첫째, 어머니)" maxLength={10} className={field} />
        <div className="grid grid-cols-2 gap-2">
          <input type="text" inputMode="numeric" placeholder="생년월일 8자리" value={showDate(p.date)} onChange={(e) => set("date", digits(e.target.value, 8))} className={field} />
          <input type="text" inputMode="numeric" placeholder="시간 4자리" disabled={p.timeUnknown} value={showTime(p.time)} onChange={(e) => set("time", digits(e.target.value, 4))} className={`${field} disabled:opacity-40`} />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {(
            [
              ["female", "여성"],
              ["male", "남성"],
            ] as const
          ).map(([g, label]) => (
            <button key={g} type="button" onClick={() => set("gender", g)} aria-pressed={p.gender === g} className={`rounded-md border border-[var(--line)] px-3 py-1.5 ${p.gender === g ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--muted)]"}`}>
              {label}
            </button>
          ))}
          <label className="flex cursor-pointer items-center gap-1.5">
            <input type="checkbox" checked={p.calendar === "lunar"} onChange={(e) => set("calendar", e.target.checked ? "lunar" : "solar")} className="h-4 w-4 accent-[var(--ink)]" />
            음력
          </label>
          <label className="flex cursor-pointer items-center gap-1.5">
            <input type="checkbox" checked={p.timeUnknown} onChange={(e) => set("timeUnknown", e.target.checked)} className="h-4 w-4 accent-[var(--ink)]" />
            시간 모름
          </label>
        </div>
        {tried && err && <p className="text-xs text-[#d4513f]">{err}</p>}
        <button type="button" onClick={add} className="nav-btn rounded-xl py-2 font-medium">
          + 추가하기
        </button>
      </fieldset>

      <button onClick={onOpen} disabled={entries.length === 0} className="draw-btn font-serif-kr rounded-xl py-3 text-lg font-bold disabled:opacity-40">
        👨‍👩‍👧 우리 가족 이야기 펼치기
      </button>
    </div>
  );
}
