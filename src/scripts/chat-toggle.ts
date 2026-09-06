const checkbox = document.querySelector("[data-chat-toggle]");

if (checkbox instanceof HTMLInputElement) {
  const updateChatDisplay = (checked) => {
    document.querySelectorAll(".you, .me").forEach((content) => {
      if (!(content instanceof HTMLElement)) return;
      content.style.display = checked ? "block" : "none";
    });
  };

  updateChatDisplay(checkbox.checked);
  checkbox.addEventListener("change", () => {
    updateChatDisplay(checkbox.checked);
  });
}
