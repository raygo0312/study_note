// headを作成
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