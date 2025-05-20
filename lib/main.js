// 定数
const THIS_PATH = (function () {
  if (document.currentScript) {
    return document.currentScript.src.replace(/[^\/]+$/, '');
  } else {
    const scripts = document.getElementsByTagName('script'),
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

// headを編集
(function () {
  // iconを挿入
  const icon = document.createElement('link');
  icon.rel = 'icon';
  icon.type = 'image/png';
  icon.href = THIS_PATH + 'icon.png';
  document.head.appendChild(icon);
  // metaを挿入
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1.0';
  document.head.appendChild(meta);
  // cssを挿入
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.type = 'text/css';
  css.href = THIS_PATH + 'main.css';
  document.head.appendChild(css);
})();

// headerを作成
(function () {
  const header = document.querySelector('header');

  const logo = document.createElement('img');
  logo.src = THIS_PATH + 'title.svg';
  logo.id = 'logo';

  const titconstext = document.title;
  const h1 = document.createElement('h1');
  h1.textContent = titconstext;

  header.insertBefore(h1, header.firstChild);
  header.insertBefore(logo, h1);

  document.title = '学問の鎖｜' + titconstext;

  const setting = document.createElement('details');
  header.appendChild(setting);

  // summary
  (function () {
    const summary = document.createElement('summary');
    summary.innerText = '目次・設定';
    setting.appendChild(summary);

    // 設定
    (function () {
      const toggle_chat = document.createElement('label');
      const toggle_chat_checkbox = document.createElement('input');
      const toggle_chat_text = document.createTextNode('会話を表示');
      toggle_chat_checkbox.type = 'checkbox';
      toggle_chat_checkbox.checked = true;
      toggle_chat_checkbox.addEventListener('change', function () {
        const contents = document.querySelectorAll('.you, .me');
        contents.forEach(content => {
          content.style.display = this.checked ? 'block' : 'none';
        });
      });
      toggle_chat.appendChild(toggle_chat_checkbox);
      toggle_chat.appendChild(toggle_chat_text);
      setting.appendChild(toggle_chat);
    })();

    // 目次
    (function () {
      const layer = [];
      let id = 0;
      let oldRank = -1;

      const createLink = (el) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
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
        const rank = Number(el.tagName.substring(1));
        const parent = findParentElement(layer, rank, -1);
        if (oldRank > rank) layer.length = rank + 1;
        if (!layer[rank]) {
          layer[rank] = document.createElement('ul');
          if (parent && parent.lastChild) parent.lastChild.appendChild(layer[rank]);
        }
        if (layer[rank]) layer[rank].appendChild(createLink(el));
        oldRank = rank;
      });

      if (layer.length) appendToc(setting, findParentElement(layer, 0, 1));
    })();
  })();
})();

// footerに挿入
(function () {
  const footer = document.createElement('footer');
  footer.innerText = "Copyright © raygo All Rights Reserved since 2016."
  document.body.appendChild(footer);
})();

// CSSファイルを読み込む
(function () {
  const CSSList = [
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/atom-one-dark.min.css',
  ]
  CSSList.forEach((url) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = url;
    document.querySelector("head").appendChild(link);
  });
})();

// 他のJavaScriptファイルを読み込む
(function () {
  const ScriptList = [
    'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js',
  ]
  ScriptList.forEach((url) => {
    const script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script);
  });
  const ScriptTextList = [
    // 'hljs.initHighlightingOnLoad();'
  ];
  ScriptTextList.forEach((text) => {
    const script = document.createElement('script');
    script.innerText = text;
    document.body.appendChild(script);
  });
})();