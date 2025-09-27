document.addEventListener("DOMContentLoaded", () => {
  // Carregar navbar
  fetch("../components/navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;

      // Menu hambúrguer
      const toggle = document.getElementById("navbar-toggle");
      const links = document.getElementById("navbar-links");

      toggle?.addEventListener("click", () => {
        links.classList.toggle("active");
      });
    });

  // Carregar footer
  fetch("../components/footer.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("footer-container").innerHTML = data;
    });
});

// ===== Pesquisa de linhas =====
const searchInput = document.getElementById('line-search');
const linesGrid = document.getElementById('lines-grid');

if (searchInput && linesGrid) {
  const lineCards = Array.from(linesGrid.getElementsByClassName('line-card'));

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    lineCards.forEach(card => {
      const number = card.dataset.number.toLowerCase();
      const name = card.dataset.name.toLowerCase();
      if (number.includes(query) || name.includes(query)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
}
