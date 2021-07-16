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
      any: ["^\\forall"],
      bb: ["\\mathbb"],
      bm: ["\\boldsymbol"],
      d: ["\\displaystyle"],
      def: ["\\::=\\:"],
      Def: ["\\quad:\\Longleftrightarrow\\quad"],
      e: ["\\mathrm{e}"],
      iff: ["\\:\\longleftrightarrow\\:"],
      Iff: ["\\quad\\Longleftrightarrow\\quad"],
      implies: ["\\:\\longrightarrow\\:"],
      Implies: ["\\quad\\Longrightarrow\\quad"],
      infer: ["\\cfrac{#3\\strut}{#2\\strut}\\;\\rm#1", 3, ""],
      paren: ["\\left(#1\\right)", 1],
      phi: ["\\varphi"],
      some: ["^\\exists"]
    },
    packages: {
      "[+]": ["physics"],

    },
  },
  loader: { load: ["[tex]/physics"] },
};