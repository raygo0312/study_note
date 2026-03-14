// 設定を追加
(function () {
  const header = document.querySelector('header');
  const details = document.createElement('details');
  header.appendChild(details);
  const summary = document.createElement('summary');
  summary.innerText = '設定';
  details.appendChild(summary);

  const toggle_chat = document.createElement('label');
  const toggle_chat_checkbox = document.createElement('input');
  const toggle_chat_text = document.createTextNode('会話を表示');
  toggle_chat_checkbox.type = 'checkbox';
  toggle_chat_checkbox.checked = true;
  // 初期状態の反映
  const updateChatDisplay = (checked) => {
    const contents = document.querySelectorAll('.you, .me');
    contents.forEach(content => {
      content.style.display = checked ? 'block' : 'none';
    });
  };
  updateChatDisplay(toggle_chat_checkbox.checked);
  toggle_chat_checkbox.addEventListener('change', function () {
    updateChatDisplay(this.checked);
  });
  toggle_chat.appendChild(toggle_chat_checkbox);
  toggle_chat.appendChild(toggle_chat_text);
  details.appendChild(toggle_chat);
})();