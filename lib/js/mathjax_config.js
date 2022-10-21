MathJax = {
  loader: { load: ["[tex]/color"] },
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
      angle: ["\\left<#1\\right>", 1],
      bb: ["\\mathbb"],
      bm: ["\\boldsymbol"],
      brace: ["\\left\\{#1\\right\\}", 1],
      d: ["\\displaystyle"],
      def: ["\\,:=\\,"],
      Def: ["\\::\\Longleftrightarrow\\:"],
      iff: ["\\leftrightarrow"],
      Iff: ["\\:\\Longleftrightarrow\\:"],
      infer: ["\\cfrac{#3\\strut}{#2\\strut}\\:#1", 3, ""],
      models: ["\\vDash"],
      p: ["\\left(#1\\right)", 1],
      phi: ["\\varphi"],
      rto: ["\\leftarrow"],
      rTo: ["\\:\\Longleftarrow\\:"],
      sequent: ["\\vdash"],
      set: ["\\brace{#1}", 1],
      setsep: ["\\set{#1\\mid#2}", 2],
      sqbracket: ["\\left[#1\\right]", 1],
      suc: ["\\mathrm{suc}"],
      term: ["\\angle{\\mathrm{#1}}", 1],
      To: ["\\:\\Longrightarrow\\:"],
    },
    packages: {
      "[+]": ["physics"],

    },
  },
  loader: { load: ["[tex]/physics"] },
};