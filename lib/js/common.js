// メニューの生成
const TOC_INSERT_SELECTOR = '#toc';
const HEADING_SELECTOR = 'h2,h3';
const LINK_CLASS_NAME = 'tocLink';
const ID_NAME = 'heading';
const tocInsertElement = document.querySelector(TOC_INSERT_SELECTOR);
const headingElements = document.querySelectorAll(HEADING_SELECTOR);
const layer = [];
let id = 0;
const uid = () => `${ID_NAME}${id++}`;
let oldRank = -1;
const createLink = (el) => {
  let li = document.createElement('li');
  let a = document.createElement('a');
  el.id = el.id || uid();
  a.href = `#${el.id}`;
  a.innerText = el.innerText;
  a.className = LINK_CLASS_NAME;
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
headingElements.forEach((el) => {
  let rank = Number(el.tagName.substring(1));
  let parent = findParentElement(layer, rank, -1);
  if (oldRank > rank) layer.length = rank + 1;
  if (!layer[rank]) {
    layer[rank] = document.createElement('ul');
    if (parent.lastChild) parent.lastChild.appendChild(layer[rank]);
  }
  layer[rank].appendChild(createLink(el));
  oldRank = rank;
});
if (layer.length) appendToc(tocInsertElement, findParentElement(layer, 0, 1));