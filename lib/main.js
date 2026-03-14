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

// CSSファイルを読み込む
(function () {
  const CSSList = [
    // 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/default.min.css',
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
  // JavaScriptファイルを読み込む
  const ScriptList = [
    { url: THIS_PATH + 'create-head.js', isModule: false },
    { url: THIS_PATH + 'create-header.js', isModule: false },
    { url: THIS_PATH + 'create-footer.js', isModule: false },
    { url: THIS_PATH + 'create-setting.js', isModule: false },
    { url: THIS_PATH + 'create-index.js', isModule: false },
    { url: THIS_PATH + 'create-term-index.js', isModule: false },
    { url: THIS_PATH + 'lazy-iframe.js', isModule: false },
    { url: THIS_PATH + 'mermaid.js', isModule: true },
    { url: THIS_PATH + 'panzoom.js', isModule: true },
    { url: THIS_PATH + 'mathematics.js', isModule: true },
  ];
  ScriptList.forEach(({ url, isModule }) => {
    const script = document.createElement('script');
    script.src = url;
    if (isModule) {
      script.type = 'module';
    }
    document.head.appendChild(script);
  });
  // 最後に実行する
  const script = document.createElement('script');
  script.src = THIS_PATH + 'final_runner.js';
  document.body.appendChild(script);
})();