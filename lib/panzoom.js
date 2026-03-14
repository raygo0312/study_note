import Panzoom from "https://unpkg.com/@panzoom/panzoom@4.5.1/dist/panzoom.es.js";

const panzoomList = document.querySelectorAll('.panzoom');

panzoomList.forEach((element) => {
  const outer = document.createElement('div');
  outer.style.position = 'relative';
  outer.style.overflow = 'hidden';
  element.parentElement.insertBefore(outer, element);
  outer.appendChild(element);
  const pz = Panzoom(element, {
    contain: 'outside',
  });

  // ホイールズーム有効化
  element.parentElement.addEventListener('wheel', pz.zoomWithWheel);
});