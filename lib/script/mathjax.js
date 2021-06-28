MathJax = {
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
      d: ["\\displaystyle"],
      def: ["\\::=\\:"],
      Def: ["\\quad:\\Longleftrightarrow\\quad"],
      e: ["\\mathrm{e}"],
      iff: ["\\:\\longleftrightarrow\\:"],
      Iff: ["\\quad\\Longleftrightarrow\\quad"],
      implies: ["\\:\\longrightarrow\\:"],
      Implies: ["\\quad\\Longrightarrow\\quad"],
      infer: ["\\cfrac{#3}{#2}\\;\\rm{#1}", 3, ""],
      paren: ["\\left(#1\\right)", 1],
      phi: ["\\varphi"]
    },
    packages: {
      "[+]": ["physics"]
    },
  },
  loader: { load: ["[tex]/physics"] },
};