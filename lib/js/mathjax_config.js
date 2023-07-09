MathJax = {
  loader: {
    load: [
      "[tex]/physics",
      "[XyJax]/xypic.js"
    ],
    paths: { XyJax: 'https://cdn.jsdelivr.net/gh/sonoisa/XyJax-v3@3.0.1/build/' }
  },
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
      cin: ["\\overset{\\rm{class}}{\\in}"],
      Coker: ["\\rm{Coker}"],
      d: ["\\displaystyle"],
      def: ["\\,:=\\,"],
      Def: ["\\::\\Longleftrightarrow\\:"],
      frak: ["\\mathfrak"],
      ge: ["\\gt"],
      Hom: ["\\rm{Hom}"],
      id: ["\\rm{id}"],
      iff: ["\\leftrightarrow"],
      Iff: ["\\:\\Longleftrightarrow\\:"],
      Im: ["\\rm{Im}"],
      infer: ["\\cfrac{#3\\strut}{#2\\strut}\\:#1", 3, ""],
      Ker: ["\\rm{Ker}"],
      models: ["\\,\\vDash\\,"],
      On: ["\\rm{On}"],
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
      suc: ["\\rm{suc}"],
      term: ["\\agl{\\mathrm{#1}}", 1],
      U: ["\\scr{U}"],
      To: ["\\:\\Longrightarrow\\:"],
      where: ["\\quad\\text{where}\\ "]
    },
    packages: {
      "[+]": ["physics", "xypic"],
    },
    chtml: {
      scale: 0.9,
      mtextInheritFont: true
    }
  },
};