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
  Frontmatter,
} from "@/lib/studyFs";

export const runtime = "nodejs";

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

type PageProps = { params: Promise<{ slug: string[] }> };

export default async function StudyPage({ params }: PageProps) {
  const { slug } = await params;
  const decoded = fromUrlSegments(slug);

  let data: Frontmatter, content: string;
  try {
    ({ data, content } = getMarkdownBySlug(decoded));
  } catch {
    return notFound();
  }

  const safeSlug = decoded.map((s) => s.normalize("NFC"));
  const title =
    (typeof data.title === "string" && data.title.trim()) ||
    content.match(/^#\s+(.+)$/m)?.[1] ||
    safeSlug.at(-1) ||
    "문서";

  const toc = tocOf(content);

  return (
    <main className=" mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-[1fr_260px]">
      <RevealProvider>
        <article className="min-w-0">
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <Link href="/study" className="hover:text-sky-600">
                Study
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
          </div>

          <article className="prose prose-slate max-w-none prose-pre:rounded-xl prose-pre:border prose-pre:border-slate-200 prose-pre:bg-slate-950/95 prose-pre:text-slate-200">
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
                code: InlineCodeSwitch as React.ComponentType<CodeProps>,
              }}
            />
          </article>

          <div className="mt-8 flex justify-between">
            <Link
              href="/study"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition"
            >
              ← 목록으로
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
          <div className="xl:sticky xl:top-24 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
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

export async function generateStaticParams() {
  const all = getAllStudySlugs();
  const params = all.map((slugArr) => ({ slug: toUrlSegments(slugArr) }));
  return params;
}
