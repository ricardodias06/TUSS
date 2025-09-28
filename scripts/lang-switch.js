const pageMap = {
  '/pages/pt/index.html': '/pages/en/index.html',
  '/pages/pt/linhas.html': '/pages/en/lines.html',
  '/pages/pt/sobre.html': '/pages/en/about.html',
  '/pages/pt/contactos.html': '/pages/en/contacts.html',
};

const reversePageMap = Object.fromEntries(
  Object.entries(pageMap).map(([pt, en]) => [en, pt])
);

const langToggle = document.getElementById('lang-toggle');

langToggle.addEventListener('click', () => {
  const currentUrl = window.location.pathname;

  let newUrl;

  if(currentUrl in pageMap) {
    newUrl = pageMap[currentUrl];
  } else if(currentUrl in reversePageMap) {
    newUrl = reversePageMap[currentUrl];
  } else {
    newUrl = '/pages/pt/index.html';
  }

  window.location.href = newUrl;
});
