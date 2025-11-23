import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";

import { RevealProvider } from "@/components/mdx/RevealContext";
import InlineCodeSwitch, {
  type CodeProps,
} from "@/components/mdx/InlineCodeSwitch";
import RevealControls from "@/components/mdx/RevealControls";
import { toStudyHref } from "@/lib/studyIndex";
import {
  getAllStudySlugs,
  getMarkdownBySlug,
  fromUrlSegments,
  toUrlSegments,
  type Frontmatter,
} from "@/lib/studyFs";

export const runtime = "nodejs";

/* ───────────── 유틸 ───────────── */

function slugify(t: string) {
  return t
    .toLowerCase()
    .normalize("NFC")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function tocOf(md: string) {
  const seen = new Map<string, number>();
  return md.split(/\r?\n/).flatMap((line) => {
    const m = /^(#{1,3})\s+(.+)$/.exec(line.trim());
    if (!m) return [];
    const level = m[1].length;
    const text = m[2].replace(/[#*`_~]/g, "").trim();
    let base = slugify(text);
    if (!base) base = "section";
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    const id = n === 1 ? base : `${base}-${n}`;
    return [{ level, text, id }];
  });
}


function extractBlocksBetweenDashes(content: string): string[] {
  const lines = content.split(/\r?\n/);

  // --- 있는 줄 인덱스들 찾기 (줄 전체가 --- 인 경우만)
  const sepIdxs: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^---\s*$/.test(lines[i].trim())) {
      sepIdxs.push(i);
    }
  }

  if (sepIdxs.length < 2) {
    // 위·아래로 둘 다 ---가 있어야 "문제"로 인정
    return [];
  }

  const blocks: string[] = [];

  for (let i = 0; i < sepIdxs.length - 1; i++) {
    const start = sepIdxs[i] + 1; // 첫 --- 다음 줄부터
    const end = sepIdxs[i + 1]; // 다음 --- 직전 줄까지

    if (start >= end) continue; // 사이에 아무 줄도 없으면 스킵

    const slice = lines.slice(start, end).join("\n").trim();

    // 완전 빈 블록은 버림
    if (slice.replace(/\s+/g, "").length === 0) continue;

    blocks.push(slice);
  }

  return blocks;
}

/**
 * "문제 블록"들 중 하나 랜덤 선택.
 * - 문제 블록이 하나도 없으면 전체 content를 통으로 반환(폴백)
 */
function pickRandomProblemBlock(content: string): string {
  const blocks = extractBlocksBetweenDashes(content);

  if (blocks.length === 0) {
    return content;
  }

  const idx = Math.floor(Math.random() * blocks.length);
  return blocks[idx];
}

type PageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams?: { [key: string]: string | string[] | undefined };
};

/* ───────────── 페이지 ───────────── */

export default async function RandomStudyPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const decoded = fromUrlSegments(slug);

  let data: Frontmatter, content: string;
  try {
    ({ data, content } = getMarkdownBySlug(decoded));
  } catch {
    return notFound();
  }

  const safeSlug = decoded.map((s) => s.normalize("NFC"));

  // 🔥 --- 위·아래로 둘 다 감싸진 "문제 블록" 중 하나만 선택
  const randomBlock = pickRandomProblemBlock(content);

  const title =
    (typeof data.title === "string" && data.title.trim()) ||
    randomBlock.match(/^#\s+(.+)$/m)?.[1] ||
    safeSlug.at(-1) ||
    "문제";

  const toc = tocOf(randomBlock);

  // 파일모음(선택한 파일들) 풀
  const rawFiles = searchParams?.files;
  const filesJson = Array.isArray(rawFiles) ? rawFiles[0] : rawFiles;
  let pool: string[] = [];

  if (filesJson && typeof filesJson === "string") {
    try {
      const parsed = JSON.parse(filesJson);
      if (Array.isArray(parsed)) {
        pool = parsed.filter((x) => typeof x === "string");
      }
    } catch {
      // 못 읽으면 풀 없이 동작
    }
  }

  // 다음 문제용 링크 만들기
  let nextHref = "/random";
  if (pool.length > 0 && filesJson) {
    const nextSlugPath = pool[Math.floor(Math.random() * pool.length)]; // "폴더/파일"
    nextHref =
      "/random/" +
      encodeURI(nextSlugPath) +
      "?files=" +
      encodeURIComponent(filesJson) +
      "&r=" +
      Math.random().toString(36).slice(2);
  }

  const relPathLabel = safeSlug.join("/");

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-[1fr_260px]">
      <RevealProvider>
        <article className="min-w-0">
          {/* 상단 헤더 */}
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <Link href="/random" className="hover:text-sky-600">
                Random
              </Link>
              {safeSlug.slice(0, -1).map((_, i, arr) => {
                const href = toStudyHref(arr.slice(0, i + 1));
                const label = arr[i];
                return (
                  <span key={href} className="inline-flex items-center gap-2">
                    <span>›</span>
                    <Link href={href} className="hover:text-sky-600">
                      {label}
                    </Link>
                  </span>
                );
              })}
            </div>
            <h1 className="mt-2 text-3xl font-bold">{title}</h1>
            <p className="mt-1 text-xs text-slate-500">
              파일: <code className="text-[11px]">{relPathLabel}.md</code>
            </p>
          </div>

          {/* 랜덤 블록만 MDX로 렌더 */}
          <article className="prose prose-slate max-w-none prose-pre:rounded-xl prose-pre:border prose-pre:border-slate-200 prose-pre:bg-slate-950/95 prose-pre:text-slate-200">
            <MDXRemote
              source={randomBlock}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    rehypeSlug,
                    [
                      rehypeAutolinkHeadings,
                      {
                        behavior: "append",
                        properties: { className: ["heading-anchor"] },
                      },
                    ],
                    [
                      rehypePrettyCode,
                      {
                        theme: "github-dark-default",
                        keepBackground: false,
                      },
                    ],
                  ],
                },
              }}
              components={{
                code: InlineCodeSwitch as React.ComponentType<CodeProps>,
              }}
            />
          </article>

          {/* 하단 버튼 */}
          <div className="mt-8 flex justify-between">
            <Link
              href="/random"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition"
            >
              ← 파일 다시 선택
            </Link>
            <div className="flex gap-2">
              <Link
                href={nextHref}
                className="rounded-xl border border-sky-500 bg-sky-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-sky-700 transition"
              >
                다음 문제
              </Link>
              <a
                href="#top"
                className="self-center text-xs text-slate-400 hover:text-slate-600"
              >
                맨 위로 ↑
              </a>
            </div>
          </div>
        </article>

        {/* 오른쪽 목차 (랜덤 블록 기준) */}
        <aside className="order-first md:order-last">
          <div className="xl:sticky xl:top-12 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold">목차</h3>
            {toc.length === 0 ? (
              <p className="text-xs text-slate-400">
                헤딩(#, ##, ###)이 없어요.
              </p>
            ) : (
              <ul className="space-y-1 text-sm">
                {toc.map((item, i) => (
                  <li
                    key={`${item.id}-${i}`}
                    className={
                      item.level === 1
                        ? "font-medium"
                        : item.level === 2
                        ? "pl-3"
                        : "pl-6 text-slate-600"
                    }
                  >
                    <a
                      href={`#${item.id}`}
                      className="block rounded px-1 py-0.5 hover:bg-slate-50 hover:text-sky-700"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <RevealControls />
      </RevealProvider>
    </main>
  );
}

/* 학습하기와 동일하게 정적 생성 */
export async function generateStaticParams() {
  const all = getAllStudySlugs();
  const params = all.map((slugArr) => ({ slug: toUrlSegments(slugArr) }));
  return params;
}
