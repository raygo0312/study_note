MathJax = {
  loader: { load: ['[tex]/color'] },
  tex: {
    inlineMath: [
      ["$", "$"]
    ],
    displayMath: [
      ["$$", "$$"]
    ],
    processEscapes: true,
    tags: "ams",
    macros: {
      bb: ["\\mathbb"],
      bm: ["\\boldsymbol"],
      d: ["\\displaystyle"],
      def: ["\\::=\\:"],
      Def: ["\\quad:\\Longleftrightarrow\\quad"],
      e: ["\\mathrm{e}"],
      forall: ["&#x2200;"],
      iff: ["\\:\\longleftrightarrow\\:"],
      Iff: ["\\quad\\Longleftrightarrow\\quad"],
      implies: ["\\:\\longrightarrow\\:"],
      Implies: ["\\quad\\Longrightarrow\\quad"],
      infer: ["\\cfrac{#3\\strut}{#2\\strut}\\;\\rm#1", 3, ""],
      paren: ["\\left(#1\\right)", 1],
      phi: ["\\varphi"]
    },
    packages: {
      "[+]": ["physics"],

    },
  },
  loader: { load: ["[tex]/physics"] },
};