import { mathEdges, mathSections } from "../../../data/mathIndex";

// 図とページ一覧はどちらも src/data/mathIndex.ts だけを情報源にする。
// ページ側には空の器だけを置き、ここで中身を組み立てる。
// BaseLayout はページ script を mermaid の描画より前に置くので、
// ここで textContent を入れた時点ではまだ描画されていない。

const graph = document.getElementById("graph");

if (graph) {
  const lines = ["graph TB"];
  for (const section of mathSections) {
    for (const page of section.pages) {
      lines.push(`${page.id}[${page.title}]`);
      lines.push(`click ${page.id} href "${page.href}"`);
    }
  }
  for (const [from, to] of mathEdges) {
    lines.push(`${from} --> ${to}`);
  }
  graph.textContent = lines.join("\n");
}

for (const section of mathSections) {
  const list = document.getElementById(section.headingId);
  if (!list) continue;

  for (const page of section.pages) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = page.href;
    link.textContent = page.title;
    item.appendChild(link);
    list.appendChild(item);
  }
}
