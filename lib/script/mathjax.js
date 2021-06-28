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
      infer: ["$\\cfrac{\\lower0.1em\\hbox{$#3$}}{\\raise0.1em\\hbox{$#2$}}$\\;\\rlap{\\small\\rm #1}", 3, ""],
      paren: ["\\left(#1\\right)", 1],
      phi: ["\\varphi"]
    },
    packages: {
      "[+]": ["physics"]
    },
  },
  loader: { load: ["[tex]/physics"] },
};