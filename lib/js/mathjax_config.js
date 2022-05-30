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
      bb: ["\\mathbb"],
      bm: ["\\boldsymbol"],
      brace: ["\\left\\{#1\\right\\}", 1],
      consequent: ["\\models"],
      d: ["\\displaystyle"],
      def: ["\\,:=\\,"],
      Def: ["\\::\\Longleftrightarrow\\:"],
      iff: ["\\leftrightarrow"],
      Iff: ["\\:\\Longleftrightarrow\\:"],
      implies: ["\\rightarrow"],
      Implies: ["\\:\\Longrightarrow\\:"],
      infer: ["\\cfrac{#3\\strut}{#2\\strut}\\:#1", 3, ""],
      paren: ["\\left(#1\\right)", 1],
      phi: ["\\varphi"],
      rimplies: ["\\leftarrow"],
      sequent: ["\\vdash"],
      set: ["\\brace{#1}", 1],
      setsep: ["\\set{#1\\mid#2}", 2],
      sqbracket: ["\\left[#1\\right]", 1],
      substitution: ["\\sqbracket{#1\\middle/#2}", 2]
    },
    packages: {
      "[+]": ["physics"],

    },
  },
  loader: { load: ["[tex]/physics"] },
};