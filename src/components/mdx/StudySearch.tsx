"use client";
import { useMemo, useState } from "react";

export type SearchableItem = {
  title: string;
  href: string;
  fullPathLabel: string;
};

// 한글/영문 공백 및 대소문자 무시 단순 부분일치용 정규화
function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // 결합 악센트 제거
    .replace(/\s+/g, ""); // 공백 제거
}

function highlight(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="rounded bg-yellow-100 px-0.5 dark:bg-yellow-900/40">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function StudySearch({ items }: { items: SearchableItem[] }) {
  // overlay 모드: 결과 패널이 기존 파일구조를 덮는 방식
  // 입력이 비면 패널이 사라져 원래 파일구조가 보임
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q) return items.slice(0, 200); // 기본 상위 200개 안전
    const nq = normalize(q);
    return items
      .map((it) => {
        const hay = normalize(`${it.title} ${it.fullPathLabel}`);
        const score = hay.indexOf(nq); // 단순 위치 점수 (앞쪽 매치 우선)
        return { it, score };
      })
      .filter((x) => x.score !== -1)
      .sort((a, b) => a.score - b.score)
      .map((x) => x.it)
      .slice(0, 200);
  }, [q, items]);

  return (
    <div className="relative w-full max-w-3xl">
      <div className="sticky top-0 z-20 bg-white dark:bg-neutral-950">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="학습목록 검색"
          className="w-full rounded-2xl border border-slate-200 bg-white dark:bg-neutral-950 px-4 py-3 text-base shadow-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-primary/20 focus:border-primary/40"
        />
        <div className="mt-2 text-xs text-muted-foreground">
          공백·대소문자 무시 부분일치 검색. 최대 200건 표시.
        </div>
      </div>

      {/* 결과 패널(오버레이) - 입력 시에만 렌더 */}
      {q && (
        <div
          className="absolute inset-x-0 mt-2 z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:bg-neutral-200 shadow-lg"
          role="listbox"
          aria-label="검색 결과"
        >
          <div className="max-h-[65vh] overflow-y-auto p-2">
            {filtered.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground">
                검색 결과가 없습니다.
              </div>
            )}
            <ul className="divide-y divide-border">
              {filtered.map((x) => (
                <li key={x.href}>
                  <a
                    href={x.href}
                    className="block p-3 transition-colors hover:bg-accent/40 focus:bg-accent/40"
                    role="option"
                  >
                    <div className="text-xs text-muted-foreground">
                      {highlight(x.fullPathLabel, q)}
                    </div>
                    <div className="text-sm font-medium group-hover:text-primary">
                      {highlight(x.title, q)}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 bg-white dark:bg-neutral-900 px-3 py-2 text-xs text-muted-foreground">
            <span>총 {filtered.length}건</span>
            <button
              onClick={() => setQ("")}
              className="rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-accent"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
