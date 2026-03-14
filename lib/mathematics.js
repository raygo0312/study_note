import "https://cdn.jsdelivr.net/npm/tex2typst@0.5.6/dist/tex2typst.min.js";

// MathJaxの設定
window.MathJax = {
  loader: {
    load: [
      "[tex]/physics",
      "[XyJax]/xypic.js",
      "[tex]/bussproofs"
    ],
    paths: { XyJax: 'https://cdn.jsdelivr.net/gh/sonoisa/XyJax-v3@3.0.1/build/' }
  },
  tex: {
    tags: "ams",
    packages: {
      "[+]": ["physics", "xypic", "bussproofs"],
    },
    macros: {
      abs: ["\\left|#1\\right|", 1],
      coloneq: [":="],
      entail: ["\\vDash"],
      prove: ["\\vdash"],
      xor: ["\\veebar"],
    }
  },
  chtml: {
    scale: 1,
    mtextInheritFont: true
  },
};

// テキストノードを再帰的に探索し、$...$を変換
function walkAndTransform(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    // $...$（改行含む）をすべて変換
    const replaced = node.nodeValue.replace(/\$(.+?)\$/gs, (_, inner) => {
      const bothEdgesSpace = /^\s.*\s/.test(inner);
      if (bothEdgesSpace) {
        return "\\[" + typst2tex(inner.trim(), { blockMathMode: true }) + "\\]";
      } else {
        return "\\(" + typst2tex(inner.trim(), { blockMathMode: false }) + "\\)";
      }
    });
    if (replaced !== node.nodeValue) {
      // 新しいHTMLノードに置換
      const span = document.createElement('span');
      span.innerHTML = replaced;
      node.parentNode.replaceChild(span, node);
    }
  } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "SCRIPT" && node.tagName !== "STYLE") {
    // SCRIPTやSTYLEは除外
    Array.from(node.childNodes).forEach(walkAndTransform);
  }
}

walkAndTransform(document.body);

const script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
script.async = true;
document.head.appendChild(script);
