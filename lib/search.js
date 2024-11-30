// urlのHTMLファイルを取得
const fetchHTML = async (url) => {
  const response = await fetch(url);
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  return doc;
};
const fetchText = async (url) => {
  const doc = await fetchHTML(url);
  return doc.body ? doc.body.textContent : "";
};

// テキスト内のキーワードを検索し，前後50文字を抽出
const searchWordInText = (text, keyword) => {
  const results = [];
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  let index = lowerText.indexOf(lowerKeyword);

  while (index !== -1) {
    // 前後50文字をプレビューとして抽出
    const start1 = Math.max(index - 50, 0);
    const end1 = index;
    const start2 = index + keyword.length;
    const end2 = Math.min(index + 50 + keyword.length, text.length);
    const preview = [text.substring(start1, end1), text.substring(end1, start2), text.substring(start2, end2)];
    results.push(preview);

    // 次の検索位置を設定
    index = lowerText.indexOf(lowerKeyword, index + keyword.length);
  }

  return results;
};

// 検索結果を出力
const renderResults = (results) => {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (results.length === 0) {
    container.innerHTML = "<p>検索した用語はヒットしませんでした．</p>";
    return;
  }
  results.forEach(({ url, title, previews }) => {
    previews.forEach((preview) => {
      const listItem = document.createElement("div");
      const previewText = preview[0] + "<strong>" + preview[1] + "</strong>" + preview[2];
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
  renderMathJax();
};

const searchFiles = async () => {
  const files = [];
  const search_range = [
    "math",
  ];
  for (let directory of search_range) {
    const index = await fetchHTML(`${directory}/index.html`);
    const links = index.querySelectorAll("a");
    links.forEach((element) => {
      const parts = element.href.split('/');
      const lastPart = parts[parts.length - 1];
      files.push(`${directory}/${lastPart}`);
    });
  }
  return files;
}

// ファイル全体からキーワードを検索
const search = async (keyword) => {
  if (keyword === "") {
    return;
  }
  const results = [];
  for (const file of await searchFiles()) {
    const text = await fetchText(file);
    const previews = searchWordInText(text, keyword);

    if (previews.length > 0) {
      // ページのタイトルを取得
      const title = await fetchTitle(file);
      results.push({ url: file, title, previews });
    }
  }

  renderResults(results);
};

// MathJaxの再レンダリング
const renderMathJax = () => {
  if (window.MathJax) {
    MathJax.typesetPromise()
      .then(() => {
        console.log("MathJax rendering complete!");
      })
      .catch((err) => console.error("MathJax rendering error:", err));
  }
};

// URLからページのタイトルを取得
const fetchTitle = async (url) => {
  try {
    const response = await fetch(url);
    const html = await response.text();

    // HTMLを解析
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // <title>タグの内容を取得
    return doc.querySelector("title")?.textContent || "No Title";
  } catch (error) {
    console.error(`Error fetching title from ${url}:`, error);
    return "Error";
  }
};

// イベントリスナーで検索をトリガー
document.getElementById("searchButton").addEventListener("click", () => {
  const keyword = document.getElementById("searchInput").value;
  search(keyword);
});
