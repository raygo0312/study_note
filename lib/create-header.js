// headerを作成
(function () {
  const header = document.querySelector('header');

  const logo = document.createElement('img');
  logo.src = THIS_PATH + 'title.svg';
  logo.alt = '学問の鎖のロゴ';
  logo.id = 'logo';

  const titconstext = document.title;
  const h1 = document.createElement('h1');
  h1.textContent = titconstext;

  header.insertBefore(h1, header.firstChild);
  header.insertBefore(logo, h1);

  document.title = '学問の鎖｜' + titconstext;
})();