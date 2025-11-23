"use client";

import { useState } from "react";
import Link from "next/link";
import type { MDFolder, MDFile } from "@/lib/collectMarkdown";

/* ────────────────────────────────
   공통 아이콘 & 뱃지
──────────────────────────────── */

function FolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M10 4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4z"
      />
    </svg>
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
      />
      <path fill="currentColor" d="M14 2v6h6" />
    </svg>
  );
}

function CountPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
      {label}
    </span>
  );
}

/* ────────────────────────────────
   파일 slug 경로 / 재귀 수집
   👉 slug 배열만 사용 (relDir 쓰지 않음)
   slugPath 형식: "폴더1/폴더2/파일이름"
──────────────────────────────── */

function fileSlugPath(file: MDFile): string {
  if (Array.isArray(file.slug)) {
    return file.slug.join("/"); // ["실무정리","우선경보와 전층경보"] → "실무정리/우선경보와 전층경보"
  }
  return file.slug; // 혹시 string인 경우 대비
}

function collectAllSlugPaths(folder: MDFolder): string[] {
  let arr: string[] = [];

  folder.files.forEach((f) => {
    arr.push(fileSlugPath(f));
  });

  folder.folders.forEach((child) => {
    arr = arr.concat(collectAllSlugPaths(child));
  });

  return arr;
}

/* ────────────────────────────────
   최상위 컴포넌트
──────────────────────────────── */

export default function RandomFolderView({ root }: { root: MDFolder }) {
  // 선택된 것 = slug 경로 문자열들
  const [selected, setSelected] = useState<string[]>([]);

  const totalSelected = selected.length;
  const filesJson = JSON.stringify(selected);

  const onToggleFile = (file: MDFile) => {
    const id = fileSlugPath(file);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onToggleFolder = (folder: MDFolder) => {
    const all = collectAllSlugPaths(folder);
    const allSelected =
      all.length > 0 && all.every((id) => selected.includes(id));

    setSelected(
      (prev) =>
        allSelected
          ? prev.filter((x) => !all.includes(x)) // 다 선택돼 있으면 해제
          : Array.from(new Set([...prev, ...all])) // 아니면 전부 선택
    );
  };

  // 랜덤풀이 시작 시, 선택된 slugPath 중 하나를 랜덤으로 뽑아서 /random/[...slug]로 이동
  let startHref: string | null = null;
  if (totalSelected > 0) {
    const any = selected[Math.floor(Math.random() * selected.length)];
    // any = "실무정리/우선경보와 전층경보"
    startHref =
      "/random/" + encodeURI(any) + "?files=" + encodeURIComponent(filesJson);
  }

  return (
    <div className="space-y-4">
      <FolderSection
        folder={root}
        selected={selected}
        onToggleFile={onToggleFile}
        onToggleFolder={onToggleFolder}
      />

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-700">
        <span>
          선택된 파일:{" "}
          <span className="font-semibold text-sky-700">{totalSelected}개</span>
        </span>

        {totalSelected === 0 || !startHref ? (
          <button
            type="button"
            disabled
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white bg-slate-300 cursor-not-allowed"
          >
            랜덤풀이 시작
          </button>
        ) : (
          <Link
            href={startHref}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 transition"
          >
            랜덤풀이 시작
          </Link>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────
   폴더 섹션
──────────────────────────────── */

function FolderSection({
  folder,
  selected,
  onToggleFile,
  onToggleFolder,
}: {
  folder: MDFolder;
  selected: string[];
  onToggleFile: (f: MDFile) => void;
  onToggleFolder: (f: MDFolder) => void;
}) {
  if (folder.files.length === 0 && folder.folders.length === 0) return null;

  const isRoot = folder.path === "";
  const title = isRoot ? "학습파일" : folder.name;
  const shownPath = isRoot ? "src/posts" : folder.path;

  const headerClass =
    "mb-3 flex items-center gap-2 rounded-lg px-2 py-1 transition cursor-pointer hover:bg-slate-50";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
      {/* 폴더 헤더 전체 클릭 → 폴더 전체 선택/해제 */}
      <div className={headerClass} onClick={() => onToggleFolder(folder)}>
        <FolderIcon className="h-5 w-5 text-amber-600" />
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {folder.files.length > 0 && (
          <CountPill label={`${folder.files.length} 파일`} />
        )}
        {folder.folders.length > 0 && (
          <CountPill label={`${folder.folders.length} 폴더`} />
        )}
        <span className="text-xs text-slate-400">/{shownPath}</span>
      </div>

      {/* 파일 목록 */}
      {folder.files.length > 0 && (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {folder.files.map((f) => {
            const id = fileSlugPath(f);
            const active = selected.includes(id);

            const baseClass =
              "group flex items-center gap-3 rounded-xl border px-3 py-2 shadow-sm transition text-left w-full";
            const stateClass = active
              ? "bg-sky-50 border-sky-400 text-sky-800"
              : "bg-white/80 border-slate-200 hover:-translate-y-0.5 hover:shadow-md";

            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onToggleFile(f)}
                  className={baseClass + " " + stateClass}
                >
                  <FileIcon className="h-5 w-5 text-sky-500" />
                  <span className="truncate text-sm font-medium text-slate-800 group-hover:text-sky-700">
                    {f.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* 하위 폴더 */}
      {folder.folders.length > 0 && (
        <div className="mt-4 space-y-4">
          {folder.folders.map((child) => (
            <FolderSection
              key={child.path}
              folder={child}
              selected={selected}
              onToggleFile={onToggleFile}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </div>
      )}
    </section>
  );
}
