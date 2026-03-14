// 各ページで定義される用語をまとめて表示
(function () {
  const header = document.querySelector('header');
  const details = document.createElement('details');
  header.appendChild(details);
  const summary = document.createElement('summary');
  summary.innerText = '定義される用語';
  details.appendChild(summary);

  let id = 0;

  const createLink = (el) => {
    const a = document.createElement('a');
    el.id = el.id || `${'define'}${id++}`;
    a.href = `#${el.id}`;
    a.innerText = el.innerText;
    a.className = 'tocLink';
    return a;
  };

  const terms = document.querySelectorAll('dfn');
  const fragment = document.createDocumentFragment();
  terms.forEach((el, index) => {
    if (index > 0) {
      fragment.appendChild(document.createTextNode('，'));
    }
    fragment.appendChild(createLink(el));
  });
  details.appendChild(fragment);
})();