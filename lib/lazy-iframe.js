// details要素内のiframeを遅延読み込みする
(function () {
  const detailsList = document.querySelectorAll('details');
  let lastToggleTime = 0;
  detailsList.forEach(details => {
    details.addEventListener('toggle', () => {
      const now = Date.now();
      if (now - lastToggleTime < 1000) return;
      lastToggleTime = now;
      const iframes = details.querySelectorAll('iframe');
      if (details.open) {
        iframes.forEach(iframe => {
          iframe.src = iframe.dataset.src;
        });
      } else {
        iframes.forEach(iframe => {
          iframe.removeAttribute('src');
        });
      }
    });
  });
})();