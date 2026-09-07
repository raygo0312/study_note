// src/pages を走査した結果から、検索対象のページとセクションを組み立てる。
// セクションはディレクトリで決まり、表示名はその index ページのタイトルを使う。
// ディレクトリ名は利用者に見せる名前ではないので、UI には必ず label を出す。
// トップ直下のページ（index、search、reference）はセクションを持たないので除く。

export type SitePage = {
  section: string;
  href: string;
};

export type SiteSection = {
  id: string;
  label: string;
};

// パスとタイトルの一覧。MDR の Astro 統合が Vite の define で埋め込む。
declare const __MDR_PAGES__: { path: string; title: string }[];

const toPage = (path: string): SitePage | null => {
  const segments = path.replace(/\.mdr$/, "").split("/");
  if (segments.length < 2) return null;

  const section = segments[0];
  const isIndex = segments[segments.length - 1] === "index";
  const href = `${(isIndex ? segments.slice(0, -1) : segments).join("/")}.html`;
  return { section, href };
};

export const sitePages: SitePage[] = __MDR_PAGES__
  .map(({ path }) => toPage(path))
  .filter((page): page is SitePage => page !== null)
  .sort((a, b) => a.href.localeCompare(b.href));

const sectionLabels = new Map<string, string>();
for (const { path, title } of __MDR_PAGES__) {
  const segments = path.replace(/\.mdr$/, "").split("/");
  if (segments.length === 2 && segments[1] === "index" && title !== "") {
    sectionLabels.set(segments[0], title);
  }
}

export const siteSections: SiteSection[] = [...new Set(sitePages.map((page) => page.section))]
  .map((id) => ({ id, label: sectionLabels.get(id) ?? id }))
  .sort((a, b) => a.label.localeCompare(b.label, "ja"));
