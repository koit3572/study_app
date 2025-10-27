import path from "path";
import fs from "fs";
import matter from "gray-matter";

export type MDFile = {
  title: string;
  slug: string; // e.g. "fluid/units" or "density"
  relDir: string; // e.g. "fluid"
};

export type MDFolder = {
  name: string; // folder name
  path: string; // relative path from posts root
  folders: MDFolder[];
  files: MDFile[];
};

const POSTS_DIR = path.join(process.cwd(), "src", "posts");

function toTitleFromFilename(fname: string) {
  // remove extension, replace -, _, . with space, capitalize words
  const base = fname.replace(/\.[^/.]+$/, "");
  return base
    .replace(/[\-_\.]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractTitleFromContent(raw: string, fallback: string) {
  try {
    const { data, content } = matter(raw);
    if (typeof data.title === "string" && data.title.trim())
      return data.title.trim();
    // const m = content.match(/^#\s+(.+)$/m);
    // if (m) return m[1].trim();
  } catch {}
  return fallback;
}

function walk(dir: string, relFromPosts: string = ""): MDFolder {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const folders: MDFolder[] = [];
  const files: MDFile[] = [];

  for (const ent of entries) {
    if (ent.name.startsWith(".")) continue; // skip hidden
    const abs = path.join(dir, ent.name);
    const rel = path.join(relFromPosts, ent.name);

    if (ent.isDirectory()) {
      folders.push(walk(abs, rel));
    } else if (ent.isFile() && /\.(md|mdx)$/i.test(ent.name)) {
      const raw = fs.readFileSync(abs, "utf8");
      const fallback = toTitleFromFilename(ent.name);
      const title = extractTitleFromContent(raw, fallback);
      const slug = rel.replace(/\\/g, "/").replace(/\.(md|mdx)$/i, "");
      const relDir = path.dirname(slug) === "." ? "" : path.dirname(slug);
      files.push({ title, slug, relDir });
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
  function rec(n: MDFolder) {
    out.push(...n.files);
    n.folders.forEach(rec);
  }
  rec(root);
  return out;
}