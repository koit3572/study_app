import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type MDFile = { title: string; slug: string; relDir: string };
export type MDFolder = {
  name: string;
  path: string;
  folders: MDFolder[];
  files: MDFile[];
};

const POSTS_DIR = path.join(process.cwd(), "src", "posts");

function normalizeSegment(seg: string) {
  let s = seg.normalize("NFC");
  s = s.replace(/\p{Cc}|\p{Cf}/gu, "");
  s = s.replace(/\s+/gu, " ");
  s = s.trim();
  s = s.replace(/＆/g, "&");
  return s;
}

function toTitleFromFilename(fname: string) {
  return fname.replace(/\.[^/.]+$/, "");
}

function extractTitleFromContent(raw: string, fallback: string) {
  try {
    const { data } = matter(raw);
    if (typeof data.title === "string" && data.title.trim()) {
      return data.title.trim();
    }
  } catch {}
  return fallback;
}

function walk(dir: string, relFromPosts = ""): MDFolder {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const folders: MDFolder[] = [];
  const files: MDFile[] = [];

  for (const ent of entries) {
    if (ent.name.startsWith(".")) continue;
    const abs = path.join(dir, ent.name);
    const rel = path.join(relFromPosts, ent.name);

    if (ent.isDirectory()) {
      folders.push(walk(abs, rel));
    } else if (ent.isFile() && /\.(md|mdx)$/i.test(ent.name)) {
      const raw = fs.readFileSync(abs, "utf8");
      const title = extractTitleFromContent(raw, toTitleFromFilename(ent.name));
      const rawSlug = rel.replace(/\\/g, "/").replace(/\.(md|mdx)$/i, "");
      const parts = rawSlug.split("/").map(normalizeSegment).filter(Boolean);
      const last = parts[parts.length - 1];
      if (last) {
        const low = last.toLowerCase();
        if (low === "index" || low === "readme") parts.pop();
      }
      const slug = parts.join("/");
      const relDir = parts.slice(0, -1).join("/");
      if (slug) files.push({ title, slug, relDir });
    }
  }

  return {
    name: relFromPosts.split(path.sep).pop() || "",
    path: relFromPosts,
    folders: folders.sort((a, b) => a.name.localeCompare(b.name)),
    files: files.sort((a, b) => a.title.localeCompare(b.title)),
  };
}

export function collectMarkdownTree(): MDFolder {
  if (!fs.existsSync(POSTS_DIR)) {
    return { name: "", path: "", folders: [], files: [] };
  }
  return walk(POSTS_DIR);
}

export function flattenFiles(root: MDFolder): MDFile[] {
  const out: MDFile[] = [];
  (function rec(n: MDFolder) {
    out.push(...n.files);
    n.folders.forEach(rec);
  })(root);
  return out;
}
