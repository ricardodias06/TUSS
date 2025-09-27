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
