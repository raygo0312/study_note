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
      def: ["\\;:\\Longleftrightarrow\\;"],
      ie: ["\\;\\Longleftrightarrow\\;"],
      iff: ["\\:\\longleftrightarrow\\:"],
      infer: ["\\;\\Longrightarrow\\;"],
      implies: ["\\:\\longrightarrow\\:"],
      paren: ["\\left(#1\\right)", 1],
      phi: ["\\varphi"]
    },
    packages: {
      '[+]': ['physics']
    },
  },
  chtml: {
    matchFontHeight: false,
  },
  loader: { load: ['[tex]/physics'] },
};