const checkbox = document.querySelector<HTMLInputElement>("[data-chat-toggle]");

if (checkbox) {
  const updateChatDisplay = (checked: boolean) => {
    document.querySelectorAll<HTMLElement>(".you, .me").forEach((content) => {
      content.style.display = checked ? "block" : "none";
    });
  };

  updateChatDisplay(checkbox.checked);
  checkbox.addEventListener("change", () => {
    updateChatDisplay(checkbox.checked);
  });
}
