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
      bcs: ["&&\\because"],
      bm: ["\\boldsymbol"],
      cal: ["\\mathcal"],
      d: ["\\displaystyle"],
      def: ["\\,:=\\,"],
      Def: ["\\::\\Longleftrightarrow\\:"],
      frak: ["\\mathfrak"],
      id: ["\\rm{id}"],
      iff: ["\\leftrightarrow"],
      Iff: ["\\:\\Longleftrightarrow\\:"],
      infer: ["\\cfrac{#3\\strut}{#2\\strut}\\:#1", 3, ""],
      models: ["\\vDash"],
      p: ["\\left(#1\\right)", 1],
      phi: ["\\varphi"],
      rm: ["\\mathrm"],
      rto: ["\\leftarrow"],
      rTo: ["\\:\\Longleftarrow\\:"],
      scr: ["\\mathscr"],
      sequent: ["\\vdash"],
      set: ["\\left\\{#1\\right\\}", 1],
      setsep: ["\\set{#1\\mathrel{}\\middle|\\mathrel{}#2}", 2],
      sq: ["\\left[#1\\right]", 1],
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