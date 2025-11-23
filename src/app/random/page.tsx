import { collectMarkdownTree } from "@/lib/collectMarkdown";
import RandomFolderView from "./RandomFolderView";

export default function RandomStudyPage() {
  const tree = collectMarkdownTree();

  return (
    <main className="min-h-[60vh]">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-xs font-medium text-sky-700/80">
          <span className="inline-flex h-2 w-2 rounded-full bg-sky-400" />
          <span>Random Study</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          랜덤 학습
        </h1>
        <p className="mt-1 max-w-prose text-slate-600 md:text-[15px]">
          학습할 파일을 선택하면, 선택된 파일들에서 무작위로 문제를 출제합니다.
        </p>
      </header>

      {tree.folders.length === 0 && tree.files.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-slate-500">
          아직 마크다운이 없어요.{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5">src/posts</code>{" "}
          에 파일을 추가해 주세요.
        </div>
      ) : (
        <div className="space-y-6">
          {/* 폴더/파일 선택 UI (클라이언트 컴포넌트) */}
          <RandomFolderView root={tree} />
        </div>
      )}
    </main>
  );
}
