// 定数
const THIS_PATH = (function () {
  if (document.currentScript) {
    return document.currentScript.src.replace(/[^\/]+$/, '');
  } else {
    let scripts = document.getElementsByTagName('script'),
      script = scripts[scripts.length - 1];
    if (script.src) {
      return script.src.replace(/[^\/]+$/, '');
    }
  }
})();

// MathJaxの設定
MathJax = {
  loader: {
    load: [
      "[tex]/physics",
      "[XyJax]/xypic.js",
      "[tex]/bussproofs"
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
      abs: ["{\\left|#1\\right|}", 1],
      agl: ["{\\left\\langle #1\\right\\rangle}", 1],
      bar: ["\\overline{#1}", 1],
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
      nrm: ["{\\left\\|#1\\right\\|}", 1],
      On: ["\\rm{On}"],
      p: ["{\\left(#1\\right)}", 1],
      phi: ["\\varphi"],
      rm: ["\\mathrm"],
      rto: ["\\leftarrow"],
      rTo: ["\\:\\Longleftarrow\\:"],
      scr: ["\\mathscr"],
      proof: ["\\,\\vdash\\,"],
      set: ["{\\left\\{#1\\right\\}}", 1],
      setsep: ["\\set{#1\\,\\middle|\\,#2}", 2],
      sq: ["{\\left[#1\\right]}", 1],
      suc: ["\\rm{suc}"],
      term: ["\\agl{\\mathrm{#1}}", 1],
      U: ["\\scr{U}"],
      To: ["\\:\\Longrightarrow\\:"],
      where: ["\\quad\\text{where}\\ "],
    },
    packages: {
      "[+]": ["physics", "xypic", "bussproofs"],
    },
    chtml: {
      scale: 0.9,
      mtextInheritFont: true
    },
  },
};

// h1に挿入
(function () {
  document.getElementById('h1').innerText = document.title;
})();

// settingに挿入
(function () {
  if (!document.getElementById('setting')) return;

  // summary
  let summary = document.createElement('summary');
  summary.innerText = '目次';
  document.getElementById('setting').appendChild(summary);

  // 目次
  let layer = [];
  let id = 0;
  let oldRank = -1;

  const createLink = (el) => {
    let li = document.createElement('li');
    let a = document.createElement('a');
    el.id = el.id || `${'heading'}${id++}`;
    a.href = `#${el.id}`;
    a.innerText = el.innerText;
    a.className = 'tocLink';
    li.appendChild(a);
    return li;
  };

  const findParentElement = (layer, rank, diff) => {
    do {
      rank += diff;
      if (layer[rank]) return layer[rank];
    } while (0 < rank && rank < 7);
    return false;
  };

  const appendToc = (el, toc) => {
    el.appendChild(toc.cloneNode(true));
  };

  document.querySelectorAll('h2,h3').forEach((el) => {
    let rank = Number(el.tagName.substring(1));
    let parent = findParentElement(layer, rank, -1);
    if (oldRank > rank) layer.length = rank + 1;
    if (!layer[rank]) {
      layer[rank] = document.createElement('ul');
      if (parent && parent.lastChild) parent.lastChild.appendChild(layer[rank]);
    }
    if (layer[rank]) layer[rank].appendChild(createLink(el));
    oldRank = rank;
  });

  if (layer.length) appendToc(document.querySelector('#setting'), findParentElement(layer, 0, 1));
})();

// footerに挿入
(function () {
  let footer = document.getElementById('footer');
  footer.innerText = "Copyright © raygo All Rights Reserved since 2016."
})();

// CSSファイルを読み込む
(function () {
  const CSSList = [
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atom-one-dark.min.css',
  ]
  CSSList.forEach((url) => {
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = url;
    document.getElementsByTagName("head")[0].appendChild(link);
  });
})();

// 他のJavaScriptファイルを読み込む
(function () {
  const ScriptList = [
    'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js',
  ]
  ScriptList.forEach((url) => {
    let script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script);
  });
  const ScriptTextList = [
    // 'hljs.initHighlightingOnLoad();'
  ];
  ScriptTextList.forEach((text) => {
    let script = document.createElement('script');
    script.innerText = text;
    document.body.appendChild(script);
  });
})();