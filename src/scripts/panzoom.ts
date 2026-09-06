import Panzoom from "https://unpkg.com/@panzoom/panzoom@4.5.1/dist/panzoom.es.js";

const panzoomList = document.querySelectorAll(".panzoom");

const initializePanzoom = (element) => {
  if (!(element instanceof HTMLElement)) return;
  if (element.dataset.panzoomInitialized === "true") return;

  const parent = element.parentElement;
  if (!parent) return;

  const outer = document.createElement("div");
  outer.className = "panzoom-viewport";
  parent.insertBefore(outer, element);
  outer.appendChild(element);

  const panzoom = Panzoom(element, {
    contain: "inside",
  });

  outer.addEventListener("wheel", panzoom.zoomWithWheel);
  element.dataset.panzoomInitialized = "true";
};

panzoomList.forEach((element) => {
  if (!(element instanceof HTMLElement)) return;

  const details = element.closest("details");
  if (details && !details.open) {
    details.addEventListener("toggle", () => {
      if (!details.open) return;
      requestAnimationFrame(() => initializePanzoom(element));
    }, { once: true });
    return;
  }

  requestAnimationFrame(() => initializePanzoom(element));
});
