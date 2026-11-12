import type { Story } from "@/lib/story/types";
import Scene from "./Scene";

export default function CategoryGrid({
  stories,
  read,
  onOpen,
}: {
  stories: Story[];
  read?: Set<string>;
  onOpen: (story: Story) => void;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {stories.map((s, i) => {
        const done = read?.has(s.id);
        return (
          <li key={s.id}>
            <button onClick={() => onOpen(s)} className="tile group relative flex w-full flex-col overflow-hidden rounded-2xl text-left" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="overflow-hidden">
                <Scene scene={s.pages[0].scene} className="transition-transform duration-500 group-hover:scale-105" />
              </div>
              {done && <span className="absolute right-2 top-2 rounded-full bg-[var(--ink)] px-2 py-0.5 text-[11px] font-bold text-[var(--bg)]">✓ 읽음</span>}
              <div className="px-3 py-2.5">
                <p className="font-serif-kr flex items-center gap-1.5 text-[17px] font-bold">
                  <span aria-hidden>{s.icon}</span>
                  {s.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                  {s.tagline} · {s.pages.length}장
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
