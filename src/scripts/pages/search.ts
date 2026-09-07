import { siteSections, sitePages } from "../../data/pages";

type SearchResult = {
  url: string;
  title: string;
  previews: [string, string, string][];
};

const fetchHtml = async (url: string): Promise<Document> => {
  const response = await fetch(url);
  const text = await response.text();
  const parser = new DOMParser();
  return parser.parseFromString(text, "text/html");
};

const fetchText = async (url: string): Promise<string> => {
  const doc = await fetchHtml(url);
  return doc.body?.textContent ?? "";
};

const searchWordInText = (text: string, keyword: string): [string, string, string][] => {
  const results: [string, string, string][] = [];
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  let index = lowerText.indexOf(lowerKeyword);

  while (index !== -1) {
    const start1 = Math.max(index - 50, 0);
    const end1 = index;
    const start2 = index + keyword.length;
    const end2 = Math.min(index + 50 + keyword.length, text.length);
    results.push([
      text.substring(start1, end1),
      text.substring(end1, start2),
      text.substring(start2, end2),
    ]);
    index = lowerText.indexOf(lowerKeyword, index + keyword.length);
  }

  return results;
};

const renderMathJax = async () => {
  await window.MathJax?.typesetPromise?.();
};

const renderResults = async (results: SearchResult[]) => {
  const container = document.getElementById("results");
  if (!container) return;

  container.innerHTML = "";

  if (results.length === 0) {
    container.innerHTML = "<p>検索した用語はヒットしませんでした．</p>";
    return;
  }

  results.forEach(({ url, title, previews }) => {
    previews.forEach((preview) => {
      const listItem = document.createElement("div");
      const previewText = `${preview[0]}<strong>${preview[1]}</strong>${preview[2]}`;
      listItem.innerHTML = `
        <div>
          <p><strong><a href="${url}" target="_blank">${title}</a></strong></p>
          <p>${previewText}</p>
          <hr>
        </div>
      `;
      container.appendChild(listItem);
    });
  });

  await renderMathJax();
};

// セクションの絞り込み。チェックが付いているものだけを検索対象にする。
const sectionFilter = document.getElementById("sectionFilter");

const buildSectionFilter = () => {
  if (!sectionFilter) return;

  for (const { id, label: text } of siteSections) {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = id;
    checkbox.checked = true;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(text));
    sectionFilter.appendChild(label);

    // 分野の索引ページへ行けるようにする。チェックの操作とは別の要素にして、
    // ラベルを押したときにトグルが切り替わる挙動を保つ。
    const link = document.createElement("a");
    link.href = `${id}.html`;
    link.textContent = "索引";
    link.className = "filter-link";
    sectionFilter.appendChild(link);
  }

  // 分野が増えるほど個別に切り替えるのが面倒になるので、一括操作を添える。
  for (const [text, checked] of [["すべて選択", true], ["すべて解除", false]] as const) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-action";
    button.textContent = text;
    button.addEventListener("click", () => {
      for (const input of sectionFilter.querySelectorAll("input")) input.checked = checked;
    });
    sectionFilter.appendChild(button);
  }
};

const selectedSections = (): string[] => {
  if (!sectionFilter) return siteSections.map((section) => section.id);

  const checked = sectionFilter.querySelectorAll<HTMLInputElement>("input:checked");
  return [...checked].map((input) => input.value);
};

buildSectionFilter();

const fetchTitle = async (url: string): Promise<string> => {
  try {
    const doc = await fetchHtml(url);
    return doc.querySelector("title")?.textContent ?? "No Title";
  } catch (error) {
    console.error(`Error fetching title from ${url}:`, error);
    return "Error";
  }
};

const search = async (keyword: string) => {
  if (keyword === "") return;

  const results: SearchResult[] = [];

  const sections = new Set(selectedSections());
  const targets = sitePages.filter((page) => sections.has(page.section));

  for (const { href: file } of targets) {
    const text = await fetchText(file);
    const previews = searchWordInText(text, keyword);
    if (previews.length === 0) continue;

    const title = await fetchTitle(file);
    results.push({ url: file, title, previews });
  }

  await renderResults(results);
};

const searchButton = document.getElementById("searchButton");
const searchInput = document.getElementById("searchInput");

if (searchButton instanceof HTMLButtonElement && searchInput instanceof HTMLInputElement) {
  searchButton.addEventListener("click", () => {
    void search(searchInput.value);
  });
}

export { };
