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
      def: ["\\quad:\\Longleftrightarrow\\quad"],
      ie: ["\\quad\\Longleftrightarrow\\quad"],
      iff: ["\\;\\longleftrightarrow\\;"],
      infer: ["\\quad\\Longrightarrow\\quad"],
      implies: ["\\;\\longrightarrow\\;"],
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