const detailsList = document.querySelectorAll<HTMLDetailsElement>("details");
let lastToggleTime = 0;

detailsList.forEach((details) => {
  details.addEventListener("toggle", () => {
    const now = Date.now();
    if (now - lastToggleTime < 1000) return;

    lastToggleTime = now;
    const iframes = details.querySelectorAll<HTMLIFrameElement>("iframe");

    if (details.open) {
      iframes.forEach((iframe) => {
        const src = iframe.dataset.src;
        if (src) iframe.src = src;
      });
      return;
    }

    iframes.forEach((iframe) => {
      iframe.removeAttribute("src");
    });
  });
});
