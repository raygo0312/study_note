const pages = [
  {
    section: "introduction-to-mathematics", pages: [
      { title: "数学とは", id: "mathmatics-introduction" },
      { title: "論理式", id: "logical-formula" },
      { title: "証明", id: "proof" },
      { title: "論理式の拡張", id: "logical-formula-extension" },
      { title: "自然演繹", id: "natural-deduction" },
      { title: "ZFC公理系", id: "ZFC-axioms" },
      { title: "順序", id: "order" },
      { title: "順序数", id: "ordinal" },
      { title: "選択公理", id: "axiom-of-choice" },
    ]
  }
];

const edges = [
  ["mathmatics-introduction", "logical-formula"],
  ["logical-formula", "proof"],
  ["proof", "logical-formula-extension"],
  ["logical-formula-extension", "natural-deduction"],
  ["natural-deduction", "ZFC-axioms"],
  ["ZFC-axioms", "order"],
  ["order", "ordinal"],
  ["ordinal", "axiom-of-choice"]
];

// Mermaid生成
let mermaidText = "graph TB\n";
pages.forEach(s => {
  s.pages.forEach(p => {
    mermaidText += `${p.id}(<a href="${p.id}.html">${p.title}</a>)\n`;
  });
});
edges.forEach(e => {
  mermaidText += `${e[0]} --> ${e[1]}\n`;
});
document.getElementById("graph").textContent = mermaidText;

// リスト生成
pages.forEach(s => {
  const ul = document.getElementById(s.section);
  if (!ul) {
    console.error(`Section not found: ${s.section}`);
    return;
  }
  s.pages.forEach(p => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `${p.id}.html`;
    a.textContent = p.title;
    li.appendChild(a);
    ul.appendChild(li);
  });
});