/**
 * 초대 링크 · 결과 링크 — 입력값을 주소의 # 뒤(해시)에 담는다.
 * 해시는 서버로 전송되지 않지만, 링크를 가진 사람은 내용을 볼 수 있다.
 */
import type { BirthInput } from "./saju/engine";

export type Mode = "couple" | "solo";

export interface PersonState {
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

export const blankPerson = (gender: "male" | "female"): PersonState => ({
  name: "",
  date: "",
  time: "",
  timeUnknown: false,
  calendar: "solar",
  leapMonth: false,
  gender,
});

export const toBirth = (p: PersonState, correction: boolean): BirthInput => ({
  year: +p.date.slice(0, 4),
  month: +p.date.slice(4, 6),
  day: +p.date.slice(6, 8),
  hour: p.timeUnknown ? null : +p.time.slice(0, 2),
  minute: p.timeUnknown ? 0 : +p.time.slice(2, 4),
  calendar: p.calendar,
  leapMonth: p.calendar === "lunar" && p.leapMonth,
  gender: p.gender,
  solarTimeCorrection: correction,
});

export function dateError(p: PersonState): string | null {
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

export function timeError(p: PersonState): string | null {
  if (p.timeUnknown) return null;
  if (p.time.length !== 4) return "태어난 시간 4자리를 입력하거나 「시간 모름」을 선택해 주세요 (예: 0930)";
  if (+p.time.slice(0, 2) > 23 || +p.time.slice(2, 4) > 59) return "시간은 0000~2359 사이로 입력해 주세요";
  return null;
}

export const personValid = (p: PersonState) => !dateError(p) && !timeError(p);

/* ---------- 링크 ---------- */
type Packed = [string, string, string, 0 | 1, 0 | 1, 0 | 1, 0 | 1];
const pack = (p: PersonState): Packed => [p.name, p.date, p.time, p.timeUnknown ? 1 : 0, p.calendar === "lunar" ? 1 : 0, p.leapMonth ? 1 : 0, p.gender === "male" ? 1 : 0];
const unpack = (x: Packed): PersonState => ({
  name: String(x[0] ?? "").slice(0, 10),
  date: String(x[1] ?? "").replace(/\D/g, "").slice(0, 8),
  time: String(x[2] ?? "").replace(/\D/g, "").slice(0, 4),
  timeUnknown: x[3] === 1,
  calendar: x[4] === 1 ? "lunar" : "solar",
  leapMonth: x[5] === 1,
  gender: x[6] === 1 ? "male" : "female",
});

function b64encode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64decode(s: string): string {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export interface SharePayload {
  /** invite: 한 사람(초대한 사람)만 담김 / result: 두 사람 모두 담김 */
  kind: "invite" | "result";
  me: PersonState;
  partner?: PersonState;
  correction: boolean;
}

export function encodeShare(p: SharePayload): string {
  const data = [p.kind === "invite" ? 0 : 1, p.correction ? 1 : 0, pack(p.me), p.partner ? pack(p.partner) : null];
  return `#${p.kind === "invite" ? "i" : "r"}=${b64encode(JSON.stringify(data))}`;
}

export function decodeShare(hash: string): SharePayload | null {
  const m = /^#([ir])=(.+)$/.exec(hash);
  if (!m) return null;
  try {
    const data = JSON.parse(b64decode(m[2])) as [number, number, Packed, Packed | null];
    const me = unpack(data[2]);
    const partner = data[3] ? unpack(data[3]) : undefined;
    if (!personValid(me) || (partner && !personValid(partner))) return null;
    return { kind: m[1] === "i" ? "invite" : "result", me, partner, correction: data[1] === 1 };
  } catch {
    return null;
  }
}
