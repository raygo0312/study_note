import Panzoom from "https://unpkg.com/@panzoom/panzoom@4.5.1/dist/panzoom.es.js";

const panzoomList = document.querySelectorAll<HTMLElement>(".panzoom");

panzoomList.forEach((element) => {
  const parent = element.parentElement;
  if (!parent) return;

  const outer = document.createElement("div");
  outer.style.position = "relative";
  outer.style.overflow = "hidden";
  parent.insertBefore(outer, element);
  outer.appendChild(element);

  const panzoom = Panzoom(element, {
    contain: "outside",
  });

  outer.addEventListener("wheel", panzoom.zoomWithWheel);
});
