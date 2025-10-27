import fs from "fs";
import path from "path";
import matter from "gray-matter";
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

function slugify(t: string) {
  return t
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
function extractToc(md: string) {
  const lines = md.split(/\r?\n/);
  const toc: { level: number; text: string; id: string }[] = [];
  for (const line of lines) {
    const m = /^(#{1,3})\s+(.+)$/.exec(line.trim());
    if (m) {
      const level = m[1].length;
      const text = m[2].replace(/[#*`_~]/g, "").trim();
      toc.push({ level, text, id: slugify(text) });
    }
  }
  return toc;
}

export async function generateStaticParams() {
  const root = path.join(process.cwd(), "src", "posts");
  const params: { slug: string[] }[] = [];
  function walk(dir: string, parts: string[] = []) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.name.startsWith(".")) continue;
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(abs, [...parts, ent.name]);
      else if (/\.(md|mdx)$/i.test(ent.name)) {
        params.push({ slug: [...parts, ent.name.replace(/\.(md|mdx)$/i, "")] });
      }
    }
  }
  if (fs.existsSync(root)) walk(root);
  return params;
}

export default async function StudyDetailPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const slugPath = params.slug.join("/");
  const fileMD = path.join(process.cwd(), "src", "posts", `${slugPath}.md`);
  const fileMDX = path.join(process.cwd(), "src", "posts", `${slugPath}.mdx`);
  const filePath = fs.existsSync(fileMD)
    ? fileMD
    : fs.existsSync(fileMDX)
    ? fileMDX
    : null;
  if (!filePath) return notFound();

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const title =
    (data?.title as string) ||
    content.match(/^#\s+(.+)$/m)?.[1] ||
    params.slug.at(-1) ||
    "문서";

  // meta
  const stat = fs.statSync(filePath);
  const updated =
    (data?.date as string) || stat.mtime.toISOString().slice(0, 10);
  const words = content.split(/\s+/).filter(Boolean).length;
  const readMin = Math.max(1, Math.round(words / 220));
  const tags: string[] = Array.isArray(data?.tags) ? data.tags : [];
  const parents = [...params.slug].slice(0, -1);
  const toc = extractToc(content);

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-[1fr_260px]">
      {/* 확률 공개 컨텍스트 시작 */}
      <RevealProvider>
        <article className="min-w-0">
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <Link href="/study" className="hover:text-sky-600">
                Study
              </Link>
              {parents.map((seg, i) => {
                const href = "/study/" + parents.slice(0, i + 1).join("/");
                return (
                  <span key={href} className="inline-flex items-center gap-2">
                    <span>›</span>
                    <Link href={href} className="hover:text-sky-600">
                      {seg}
                    </Link>
                  </span>
                );
              })}
            </div>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
              {title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-0.5">
                {updated}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5">
                {readMin} min read
              </span>
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-700"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          <article
            className="prose prose-slate max-w-none
                       prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                       prose-a:text-sky-600 hover:prose-a:text-sky-700
                       prose-code:before:content-[''] prose-code:after:content-['']
                       prose-pre:rounded-xl prose-pre:border prose-pre:border-slate-200 prose-pre:shadow-sm
                       prose-pre:bg-slate-950/95 prose-pre:text-slate-200"
          >
            <MDXRemote
              source={content}
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
                      { theme: "github-dark-default", keepBackground: false },
                    ],
                  ],
                },
              }}
              components={{
                code: InlineCodeSwitch as React.ComponentType<CodeProps>, // ← 확률 공개 스위처 (클라이언트)
              }}
            />
          </article>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/study"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              목록으로
            </Link>
            <a
              href="#top"
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              맨 위로 ↑
            </a>
          </div>
        </article>

        <aside className="order-first md:order-last">
          <div className="toc-card h-full xl:sticky xl:top-12 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">목차</h3>
            {toc.length === 0 ? (
              <p className="text-xs text-slate-400">
                헤딩(#, ##, ###)이 없어요.
              </p>
            ) : (
              <ul className="space-y-1 text-sm">
                {toc.map((item) => (
                  <li
                    key={item.id}
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

        {/* 우측 하단 공개비율/리셋 컨트롤 */}
        <RevealControls />
      </RevealProvider>
      {/* 확률 공개 컨텍스트 끝 */}
    </main>
  );
}
