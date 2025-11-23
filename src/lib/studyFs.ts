import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type Frontmatter = { title?: string } & Record<string, unknown>;

const BASE_DIR = path.join(process.cwd(), "src", "posts");

function walkDir(dirPath: string): string[][] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let paths: string[][] = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      paths = paths.concat(walkDir(fullPath));
    } else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
      const relativePath = path.relative(BASE_DIR, fullPath);
      const withoutExt = relativePath.replace(/\.(md|mdx)$/i, "");
      const slugArray = withoutExt.split(path.sep);
      paths.push(slugArray);
    }
  }
  return paths;
}

export function getAllStudySlugs(): string[][] {
  if (!fs.existsSync(BASE_DIR)) return [];
  return walkDir(BASE_DIR);
}

export function toUrlSegments(slugArr: string[]): string[] {
  return slugArr.map((s) => encodeURIComponent(s));
}

export function fromUrlSegments(encoded: string[]): string[] {
  return encoded.map((s) => decodeURIComponent(s));
}

export function getMarkdownBySlug(slugArrDecoded: string[]): {
  data: Frontmatter;
  content: string;
} {
  const md = path.join(BASE_DIR, ...slugArrDecoded) + ".md";
  const mdx = path.join(BASE_DIR, ...slugArrDecoded) + ".mdx";
  const target = fs.existsSync(mdx) ? mdx : md;
  if (!fs.existsSync(target)) {
    throw new Error(`File not found: ${md} | ${mdx}`);
  }
  const fileContents = fs.readFileSync(target, "utf-8");
  const { data, content } = matter(fileContents);
  return { data: data as Frontmatter, content };
}
