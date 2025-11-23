import { collectMarkdownTree, flattenFiles } from "./collectMarkdown";

export function toStudyHref(input: string | string[]) {
  const parts = Array.isArray(input) ? input : input.split("/").filter(Boolean);
  const safeSegs = parts.map((seg) => {
    let raw: string;
    try {
      raw = decodeURIComponent(seg);
    } catch {
      raw = seg;
    }
    raw = raw.normalize("NFC");
    return encodeURIComponent(raw);
  });
  return "/study/" + safeSegs.join("/");
}

export type StudyIndexItem = {
  title: string;
  slug: string[];
  href: string[];
  fullPathLabel: string;
};

export function buildStudyIndex(): StudyIndexItem[] {
  const tree = collectMarkdownTree();
  const files = flattenFiles(tree);
  return files.map((f) => {
    const slugArr = f.slug.split("/").map((s) => s.normalize("NFC"));
    const fullPathLabel = slugArr.join("/");
    return {
      title: f.title,
      slug: slugArr,
      href: slugArr,
      fullPathLabel,
    };
  });
}
