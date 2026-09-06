// The mobile header sticks with a negative top offset so that the title block
// scrolls out of view and only the breadcrumb bar stays pinned. The offset is
// the title's height, which varies with the title text, so it is measured here.
// The "is-stuck" class marks the state where the bar has reached the top edge,
// which is what turns the header background translucent.
// --header-height feeds --scroll-offset, so anchor targets land below the
// pinned header instead of underneath it.
const header = document.querySelector("header");
const bar = document.querySelector(".header-sticky-bar");

if (header && bar) {
  let titleHeight = 0;

  const updateStuck = () => {
    header.classList.toggle("is-stuck", window.scrollY > titleHeight);
  };

  const updateOffset = () => {
    // Both rects shift together while stuck, so this distance stays correct.
    const offset = bar.getBoundingClientRect().top - header.getBoundingClientRect().top;
    titleHeight = Math.max(0, Math.round(offset));
    document.documentElement.style.setProperty("--header-title-height", `${titleHeight}px`);
    document.documentElement.style.setProperty("--header-height", `${Math.round(header.offsetHeight)}px`);
    updateStuck();
  };

  updateOffset();
  window.addEventListener("scroll", updateStuck, { passive: true });
  window.addEventListener("resize", updateOffset);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateOffset);
  }
}
