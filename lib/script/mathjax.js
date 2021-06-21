MathJax = {
  tex: {
    inlineMath: [
      ["$", "$"]
    ],
    displayMath: [
      ["$$", "$$"]
    ],
    macros: {
      paren: ["\\left(#1\\right)", 1]
    },
    processEscapes: true,
    processEnvironments: true,
    processRefs: true,
    digits: /^(?:[0-9]+(?:\{,\}[0-9]{3})*(?:\.[0-9]*)?|\.[0-9]+)/,
    tags: "ams",
    tagSide: "right",
    tagIndent: "0.8em",
    useLabelIds: true,
    multlineWidth: "85%",
    maxMacros: 1000,
    maxBuffer: 5 * 1024,
    baseURL:
      (document.getElementsByTagName("base").length === 0) ?
        "" : String(document.location).replace(/#.*$/, "")
  }
};