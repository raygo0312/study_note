export type MathPage = {
  title: string;
  id: string;
  href: string;
};

export type MathSection = {
  headingId: string;
  pages: MathPage[];
};

export const mathSections: MathSection[] = [
  {
    headingId: "introduction-to-mathematics",
    pages: [
      { title: "数学とは", id: "mathmatics-introduction", href: "math/mathmatics-introduction.html" },
      { title: "論理式", id: "logical-formula", href: "math/logical-formula.html" },
      { title: "証明", id: "proof", href: "math/proof.html" },
      { title: "論理式の拡張", id: "logical-formula-extension", href: "math/logical-formula-extension.html" },
      { title: "自然演繹", id: "natural-deduction", href: "math/natural-deduction.html" },
      { title: "ZFC公理系", id: "ZFC-axioms", href: "math/ZFC-axioms.html" },
      { title: "順序", id: "order", href: "math/order.html" },
    ],
  },
];

export const mathEdges: Array<[string, string]> = [
  ["mathmatics-introduction", "logical-formula"],
  ["logical-formula", "proof"],
  ["proof", "logical-formula-extension"],
  ["logical-formula-extension", "natural-deduction"],
  ["natural-deduction", "ZFC-axioms"],
  ["ZFC-axioms", "order"],
];
