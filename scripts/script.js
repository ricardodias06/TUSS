document.addEventListener("DOMContentLoaded", () => {
  // Carregar navbar
  fetch("../../components/navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;

      // Menu hambúrguer
      const toggle = document.getElementById("navbar-toggle");
      const links = document.getElementById("navbar-links");

      toggle?.addEventListener("click", () => {
        links.classList.toggle("active");
      });

      // Inicializar botão de idioma
      initLangSwitch();
    });

  // Carregar footer
  fetch("../../components/footer.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("footer-container").innerHTML = data;
    });
});

// Função de inicialização do botão de idioma
function initLangSwitch() {
  const langBtn = document.getElementById("lang-btn");
  if (!langBtn) return;

  // Mapa de páginas PT → EN
  const ptToEn = {
    "index.html": "index.html",
    "linhas.html": "lines.html",
    "planear-viagem.html": "plan-a-trip.html",
    "alteracoes-de-servico.html": "service-changes.html",
    "paragem.html": "stop.html",
    "tarifario.html": "tariff.html",
    "acessibilidade.html": "accessibility.html"
  };
  const enToPt = Object.fromEntries(
    Object.entries(ptToEn).map(([pt, en]) => [en, pt])
  );

  // Definir texto do botão
  const pathParts = window.location.pathname.split("/");
  const currentLang = pathParts[2]; // "pt" ou "en"
  const fileName = pathParts[3];

  langBtn.textContent = currentLang === "pt" ? "EN" : "PT";

  // Clique no botão
  langBtn.addEventListener("click", () => {
    let targetFile;
    if (currentLang === "pt") {
      targetFile = ptToEn[fileName];
      if (!targetFile) return alert("Não há versão em inglês desta página.");
      pathParts[2] = "en";
      pathParts[3] = targetFile;
    } else if (currentLang === "en") {
      targetFile = enToPt[fileName];
      if (!targetFile) return alert("Não há versão em português desta página.");
      pathParts[2] = "pt";
      pathParts[3] = targetFile;
    }
    window.location.href = pathParts.join("/");
  });
}
