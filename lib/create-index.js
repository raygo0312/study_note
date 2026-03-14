// 目次を追加
(function () {
  const header = document.querySelector('header');
  const details = document.createElement('details');
  header.appendChild(details);
  const summary = document.createElement('summary');
  summary.innerText = '目次';
  details.appendChild(summary);

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

  if (layer.length) appendToc(details, findParentElement(layer, 0, 1));
})();