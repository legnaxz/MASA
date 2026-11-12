import type { Element, TenGodGroup } from "../saju/constants";
import type { FlowKind } from "../saju/engine";

/** 페이지마다 그려지는 그림 장면 */
export type Scene =
  | { kind: "cover"; el: Element; stem: string; branch: string; emoji: string }
  | { kind: "year"; el: Element; emoji: string; ganzhi: string }
  | { kind: "month"; el: Element; ganzhi: string }
  | { kind: "guest"; el: Element; glyph: string }
  | { kind: "path"; mood: FlowKind }
  | { kind: "money"; variant: "tree" | "leak" | "jar" | "mountain"; fill: number }
  | { kind: "love"; variant: "blossom" | "bud" | "pair" }
  | { kind: "couple"; variant: "warm" | "river" }
  | { kind: "children"; count: number; unknown?: boolean }
  | { kind: "work"; group: TenGodGroup }
  | { kind: "lantern"; el: Element }
  | { kind: "stones"; items: { label: string; sub: string; kind: FlowKind; mark?: boolean }[] }
  | { kind: "duo"; elA: Element; elB: Element; emojiA: string; emojiB: string; heat: number }
  | { kind: "stems"; a: string; b: string; elA: Element; elB: Element; mode: "hap" | "same" | "gen-ab" | "gen-ba" | "ctrl-ab" | "ctrl-ba" }
  | { kind: "exchange"; elA: Element; elB: Element }
  | { kind: "bridge" }
  | {
      kind: "pillars";
      guest: { stem: string; branch: string; el: Element };
      mine: { key: string; label: string; stem: string; branch: string; el: Element; mark?: "clash" | "hap" | "wonjin" | "samhap" | "same"; tie?: boolean }[];
    }
  | { kind: "balance"; before: Record<Element, number>; after: Record<Element, number>; yong: Element }
  | { kind: "months"; items: { month: number; score: number; kind: FlowKind }[]; best: number }
  | { kind: "boat"; mood: FlowKind }
  | { kind: "dodont"; mode: "do" | "dont"; icons: string[] }
  | { kind: "market" }
  | { kind: "chest"; fill: number }
  | { kind: "desk"; el: Element }
  | { kind: "stairs"; step: number }
  | { kind: "bench" }
  | { kind: "family"; kids: number }
  | { kind: "nest"; eggs: number }
  | { kind: "table" }
  | { kind: "compass"; el: Element; direction: string }
  | { kind: "duoScore"; a: number; b: number; labelA: string; labelB: string; heart?: boolean }
  | { kind: "duoMonths"; items: { month: number; a: number; b: number }[] }
  | { kind: "seasons"; items: { label: string; sub: string; kind: FlowKind; now?: boolean }[] };

export interface StoryPage {
  title: string;
  scene: Scene;
  /** 말풍선 문단. **굵게** 표시 지원 */
  bubbles: string[];
  /** 그림 아래 작은 근거 배지 */
  badges?: string[];
}

export interface Story {
  id: "couple" | "year" | "nextYear" | "month" | "money" | "love" | "marriage" | "children" | "work";
  title: string;
  icon: string;
  tagline: string;
  pages: StoryPage[];
}
