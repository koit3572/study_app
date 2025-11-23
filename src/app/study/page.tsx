import Link from "next/link";
import { collectMarkdownTree, MDFolder } from "@/lib/collectMarkdown";
import { buildStudyIndex } from "@/lib/studyIndex";
import StudySearch from "@/components/mdx/StudySearch";
import { toStudyHref } from "@/lib/studyIndex";

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

function FolderSection({
  folder,
  depth = 0,
}: {
  folder: MDFolder;
  depth?: number;
}) {
  if (folder.files.length === 0 && folder.folders.length === 0) return null;

  const isRoot = folder.path === "";
  const title = isRoot ? "학습파일" : folder.name;
  const shownPath = isRoot ? "src/posts" : folder.path;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
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

      {folder.files.length > 0 && (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {folder.files.map((f) => (
            <li key={f.slug}>
              <Link
                href={toStudyHref(f.slug)}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <FileIcon className="h-5 w-5 text-sky-500" />
                <span className="truncate text-sm font-medium text-slate-800 group-hover:text-sky-700">
                  {f.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {folder.folders.length > 0 && (
        <div className="mt-4 space-y-4">
          {folder.folders.map((child) => (
            <FolderSection key={child.path} folder={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function StudyListPage() {
  const tree = collectMarkdownTree();
  const index = buildStudyIndex();
  const items = index.map((x) => ({
    title: x.title,
    href: toStudyHref(x.slug),
    fullPathLabel: x.fullPathLabel,
  }));

  return (
    <main className="min-h-[60vh]">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-xs font-medium text-sky-700/80">
          <span className="inline-flex h-2 w-2 rounded-full bg-sky-400" />
          <span>Study</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          학습 목록
        </h1>
        <p className="mt-1 max-w-prose text-slate-600 md:text-[15px]">
          원하는 학습목표를 설정하여 더 효율적인 학습을 진행하세요.
        </p>
        <StudySearch items={items} />
      </header>

      {tree.folders.length === 0 && tree.files.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-slate-500">
          아직 마크다운이 없어요.{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5">src/posts</code>{" "}
          에 파일을 추가해 주세요.
        </div>
      ) : (
        <div className="space-y-6">
          <FolderSection folder={tree} />
        </div>
      )}
    </main>
  );
}
