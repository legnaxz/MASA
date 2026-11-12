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
  | { kind: "bridge" };

export interface StoryPage {
  title: string;
  scene: Scene;
  /** 말풍선 문단. **굵게** 표시 지원 */
  bubbles: string[];
  /** 그림 아래 작은 근거 배지 */
  badges?: string[];
}

export interface Story {
  id: "couple" | "year" | "month" | "money" | "love" | "marriage" | "children" | "work";
  title: string;
  icon: string;
  tagline: string;
  pages: StoryPage[];
}
