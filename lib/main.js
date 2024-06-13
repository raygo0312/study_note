// 定数
const THIS_PATH = (function () {
  if (document.currentScript) {
    return document.currentScript.src.replace(/[^\/]+$/, '');
  } else {
    var scripts = document.getElementsByTagName('script'),
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
      "[+]": ["physics", "xypic"],
    },
    chtml: {
      scale: 0.9,
      mtextInheritFont: true
    }
  },
};

// settingに挿入
insertSummary();
insertChangeTheme();
insertToc();

// summary
function insertSummary() {
  let summary = document.createElement('summary');
  summary.innerText = '設定・目次';
  document.getElementById('setting').appendChild(summary);
}
// テーマ切り替え
function insertChangeTheme() {
  let h4 = document.createElement('h4');
  h4.innerText = 'テーマカラー';
  document.getElementById('setting').appendChild(h4);

  const THEME_LIST = {
    'default': '標準',
    'pastel': 'パステル'
  };
  let div = document.createElement('div');
  div.id = 'change-theme';
  for (const [id, name] of Object.entries(THEME_LIST)) {
    const button = document.createElement('button');
    button.innerText = name;
    button.addEventListener('click', () => {
      document.body.className = id;
    });
    div.appendChild(button);
  }
  document.getElementById('setting').appendChild(div);
}
// 目次
function insertToc() {
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
}

// 他のJavaScriptファイルを読み込む
const ScriptList = [
  'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml-full.js',
  'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js',
]
ScriptList.forEach((url) => {
  loadScript(url, () => {
    MathJax.typeset();
  });
});
loadScript()
function loadScript(url) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  document.head.appendChild(script);
}