import type { Story } from "@/lib/story/types";
import Scene from "./Scene";

export default function CategoryGrid({ stories, onOpen }: { stories: Story[]; onOpen: (i: number) => void }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {stories.map((s, i) => (
        <li key={s.id}>
          <button onClick={() => onOpen(i)} className="tile group flex w-full flex-col overflow-hidden rounded-2xl text-left" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="overflow-hidden">
              <Scene scene={s.pages[0].scene} className="transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="px-3 py-2.5">
              <p className="font-serif-kr flex items-center gap-1.5 text-[17px] font-bold">
                <span aria-hidden>{s.icon}</span>
                {s.title}
              </p>
              <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{s.tagline}</p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
