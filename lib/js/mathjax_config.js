MathJax = {
  loader: { load: ["[tex]/physics"] },
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
      agl: ["\\left\\langle #1\\right\\rangle", 1],
      bb: ["\\mathbb"],
      bcs: ["&&\\because"],
      bm: ["\\boldsymbol"],
      cal: ["\\mathcal"],
      d: ["\\displaystyle"],
      def: ["\\,:=\\,"],
      Def: ["\\::\\Longleftrightarrow\\:"],
      frak: ["\\mathfrak"],
      ge: ["\\gt"],
      id: ["\\op{id}{#1}", 1],
      iff: ["\\leftrightarrow"],
      Iff: ["\\:\\Longleftrightarrow\\:"],
      infer: ["\\cfrac{#3\\strut}{#2\\strut}\\:#1", 3, ""],
      models: ["\\,\\vDash\\,"],
      op: ["\\rm{#1}\\p{#2}", 2],
      p: ["\\left(#1\\right)", 1],
      phi: ["\\varphi"],
      rm: ["\\mathrm"],
      rto: ["\\leftarrow"],
      rTo: ["\\:\\Longleftarrow\\:"],
      scr: ["\\mathscr"],
      proof: ["\\,\\vdash\\,"],
      set: ["\\left\\{#1\\right\\}", 1],
      setsep: ["\\set{#1\\,\\middle|\\,#2}", 2],
      sq: ["\\left[#1\\right]", 1],
      suc: ["\\op{suc}{#1}", 1],
      term: ["\\agl{\\mathrm{#1}}", 1],
      To: ["\\:\\Longrightarrow\\:"],
    },
    packages: {
      "[+]": ["physics"],
    },
  },
};