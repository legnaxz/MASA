"use client";

import { useEffect, useRef, useState } from "react";
import type { BirthInput } from "@/lib/saju/engine";
import { blankPerson, dateError, decodeShare, encodeShare, personValid, timeError, toBirth, type Mode, type PersonState } from "@/lib/share";
import HourFinder from "./tools/HourFinder";

const field =
  "w-full min-w-0 rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-[16px] outline-none focus:border-[var(--ink)]";

export type { Mode };

export interface PersonInput {
  name: string;
  birth: BirthInput;
}

export interface FormResult {
  mode: Mode;
  me: PersonInput;
  partner: PersonInput | null;
  /** 링크 만들기와 보정 저장에 쓰는 원래 입력값 */
  raw: { me: PersonState; partner: PersonState | null; correction: boolean };
}

interface Saved {
  mode: Mode;
  me: PersonState;
  partner: PersonState;
  correction: boolean;
}

/** 입력값은 이 브라우저(localStorage)에만 저장된다 */
const STORAGE_KEY = "masa:birth:v1";

const digits = (s: string, max: number) => s.replace(/\D/g, "").slice(0, max);
const showDate = (d: string) => [d.slice(0, 4), d.slice(4, 6), d.slice(6, 8)].filter(Boolean).join(".");
const showTime = (t: string) => [t.slice(0, 2), t.slice(2, 4)].filter(Boolean).join(":");

/** 링크를 공유하거나(모바일) 복사한다 */
export async function shareLink(url: string, text: string): Promise<"shared" | "copied" | "failed"> {
  try {
    if (navigator.share && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
      await navigator.share({ title: "MASA 사주", text, url });
      return "shared";
    }
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}

export default function BirthForm({ onSubmit }: { onSubmit: (r: FormResult) => void }) {
  const [mode, setMode] = useState<Mode>("couple");
  const [me, setMe] = useState<PersonState>(blankPerson("female"));
  const [partner, setPartner] = useState<PersonState>(blankPerson("male"));
  const [correction, setCorrection] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [tried, setTried] = useState(false);
  /** 초대 링크로 들어온 경우: 초대한 사람의 이름 */
  const [invitedBy, setInvitedBy] = useState<string | null>(null);
  const [showInviter, setShowInviter] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const autoSubmit = useRef<FormResult | null>(null);

  const build = (m: Mode, a: PersonState, b: PersonState, c: boolean): FormResult => ({
    mode: m,
    me: { name: a.name.trim(), birth: toBirth(a, c) },
    partner: m === "couple" ? { name: b.name.trim(), birth: toBirth(b, c) } : null,
    raw: { me: a, partner: m === "couple" ? b : null, correction: c },
  });

  // 저장된 입력과 링크(#i=초대, #r=결과) 읽기 — 한 번만 (개발 모드는 effect를 두 번 실행한다)
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    let sMe = blankPerson("female");
    let sPartner = blankPerson("male");
    let sMode: Mode = "couple";
    let sCorr = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Partial<Saved>;
        if (s.mode === "couple" || s.mode === "solo") sMode = s.mode;
        if (s.me) sMe = { ...sMe, ...s.me };
        if (s.partner) sPartner = { ...sPartner, ...s.partner };
        if (typeof s.correction === "boolean") sCorr = s.correction;
        setHasSaved(true);
      }
    } catch {
      // 저장소를 못 쓰는 환경이면 빈 폼으로 시작
    }

    const shared = decodeShare(window.location.hash);
    if (shared) {
      history.replaceState(null, "", window.location.pathname);
      if (shared.kind === "invite") {
        // 초대한 사람은 내 화면에서 "상대"가 된다
        sMode = "couple";
        sPartner = shared.me;
        sCorr = shared.correction;
        setInvitedBy(shared.me.name || "상대");
      } else if (shared.partner) {
        sMode = "couple";
        sMe = shared.me;
        sPartner = shared.partner;
        sCorr = shared.correction;
        autoSubmit.current = build("couple", sMe, sPartner, sCorr);
      } else {
        sMode = "solo";
        sMe = shared.me;
        sCorr = shared.correction;
        autoSubmit.current = build("solo", sMe, sPartner, sCorr);
      }
    }
    setMode(sMode);
    setMe(sMe);
    setPartner(sPartner);
    setCorrection(sCorr);
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 결과 링크로 들어오면 바로 펼친다
  useEffect(() => {
    if (loaded && autoSubmit.current) {
      onSubmit(autoSubmit.current);
      autoSubmit.current = null;
    }
  }, [loaded, onSubmit]);

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
    setMe(blankPerson("female"));
    setPartner(blankPerson("male"));
    setInvitedBy(null);
    setTried(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // 무시
    }
    setHasSaved(false);
  };

  const invite = async () => {
    if (!personValid(me)) {
      setTried(true);
      setNote("내 생년월일과 시간을 먼저 입력해 주세요.");
      return;
    }
    const url = `${window.location.origin}${window.location.pathname}${encodeShare({ kind: "invite", me, correction })}`;
    const r = await shareLink(url, `${me.name || "제가"} 사주 궁합을 같이 보자고 초대했어요. 생년월일을 입력하면 두 사람의 궁합이 나와요.`);
    setNote(r === "copied" ? "초대 링크를 복사했어요. 상대에게 붙여 넣어 보내세요." : r === "shared" ? "초대 링크를 보냈어요." : "링크를 복사하지 못했어요. 브라우저에서 복사 권한을 허용해 주세요.");
  };

  return (
    <form
      noValidate
      className="panel grid gap-4 rounded-2xl p-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (invalid) return;
        onSubmit(build(mode, me, partner, correction));
      }}
    >
      {invitedBy && (
        <p className="rounded-xl border border-[var(--accent)] bg-[var(--bg)] px-3 py-2.5 text-[15px] leading-relaxed">
          💌 <b>{invitedBy}</b>님이 사주 궁합을 같이 보자고 초대했어요. 아래에 <b>내 생년월일</b>만 입력하면 두 사람의 궁합이 펼쳐져요.
        </p>
      )}

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

      <PersonFields title={mode === "couple" ? "나" : undefined} value={me} onChange={setMe} namePlaceholder="이름 (선택)" showErrors={tried} correction={correction} />

      {mode === "couple" &&
        (invitedBy && !showInviter ? (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--line)] p-3 text-sm">
            <span>
              <b className="font-serif-kr">상대</b> · {invitedBy} <span className="text-[var(--muted)]">(초대한 사람의 생년월일은 가려 두었어요)</span>
            </span>
            <button type="button" onClick={() => setShowInviter(true)} className="shrink-0 text-[var(--muted)] underline underline-offset-2">
              보기·고치기
            </button>
          </div>
        ) : (
          <PersonFields title="상대" value={partner} onChange={setPartner} namePlaceholder="상대 이름 (선택)" showErrors={tried} correction={correction} />
        ))}

      <label className="flex cursor-pointer items-center gap-1.5 text-sm">
        <input type="checkbox" checked={correction} onChange={(e) => setCorrection(e.target.checked)} className="h-4 w-4 accent-[var(--ink)]" />
        한국 시간 30분 보정
      </label>

      <button type="submit" className="draw-btn font-serif-kr rounded-xl py-3 text-lg font-bold">
        {mode === "couple" ? "우리 이야기 펼치기" : "이야기 펼치기"}
      </button>

      {mode === "couple" && !invitedBy && (
        <div className="grid gap-1.5 rounded-xl border border-dashed border-[var(--line)] p-3">
          <button type="button" onClick={invite} className="nav-btn rounded-lg py-2 text-sm font-medium">
            💌 상대의 생년월일을 모른다면 — 초대 링크 보내기
          </button>
          <p className="text-xs text-[var(--muted)]">내 정보만 입력하고 링크를 보내면, 상대가 자기 생년월일을 넣어 궁합을 볼 수 있어요. 링크에는 내 생년월일이 담기니 믿을 수 있는 사람에게만 보내세요.</p>
        </div>
      )}
      {note && <p className="text-sm text-[var(--accent)]">{note}</p>}

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
  correction,
}: {
  title?: string;
  value: PersonState;
  onChange: (v: PersonState) => void;
  namePlaceholder: string;
  showErrors: boolean;
  correction: boolean;
}) {
  const set = <K extends keyof PersonState>(k: K, v: PersonState[K]) => onChange({ ...value, [k]: v });
  const [finder, setFinder] = useState(false);
  const dErr = showErrors ? dateError(value) : null;
  const tErr = showErrors ? timeError(value) : null;
  const canFind = value.timeUnknown && !dateError(value);
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
      {canFind && !finder && (
        <button type="button" onClick={() => setFinder(true)} className="nav-btn w-fit rounded-lg px-3 py-1.5 text-sm">
          🔎 태어난 시간 찾아보기
        </button>
      )}
      {canFind && finder && (
        <HourFinder
          birth={toBirth(value, correction)}
          onClose={() => setFinder(false)}
          onPick={(hhmm) => {
            onChange({ ...value, time: hhmm, timeUnknown: false });
            setFinder(false);
          }}
        />
      )}
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
