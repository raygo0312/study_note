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
      def: ["\\::=\\:"],
      Def: ["\\quad:\\Longleftrightarrow\\quad"],
      e: ["\\mathrm{e}"],
      iff: ["\\:\\longleftrightarrow\\:"],
      Iff: ["\\quad\\Longleftrightarrow\\quad"],
      implies: ["\\:\\longrightarrow\\:"],
      Implies: ["\\quad\\Longrightarrow\\quad"],
      lim: ["\\displaystyle\\mathrm{lim}"],
      paren: ["\\left(#1\\right)", 1],
      phi: ["\\varphi"]
    },
    packages: {
      '[+]': ['physics']
    },
  },
  loader: { load: ['[tex]/physics'] },
};