import { mathSections } from "../data/mathIndex";

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

const fileList = mathSections.flatMap((section) => section.pages.map((page) => page.href));

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

  for (const file of fileList) {
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
