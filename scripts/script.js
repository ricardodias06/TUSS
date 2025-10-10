// website-test/scripts/script.js
document.addEventListener("DOMContentLoaded", () => {
  // Detectar idioma atual na URL (procura 'pt' ou 'en')
  const pathParts = window.location.pathname.split("/"); // ex: ["", "pages", "pt", "linhas.html"]
  const langIndex = pathParts.findIndex(seg => seg === "pt" || seg === "en");
  const currentLang = langIndex !== -1 ? pathParts[langIndex] : (window.location.pathname.includes("/en/") ? "en" : "pt");

  // Paths dos components (relativos à página)
  const navbarFile = `../../components/navbar-${currentLang}.html`;
  const footerFile = `../../components/footer-${currentLang}.html`;

  console.debug("[script.js] currentLang:", currentLang, "navbarFile:", navbarFile, "footerFile:", footerFile);

  // Carregar navbar adequado ao idioma
  fetch(navbarFile)
    .then(response => {
      if (!response.ok) throw new Error("Navbar not found: " + navbarFile);
      return response.text();
    })
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;
      console.debug("[script.js] navbar carregada");

      // Inicializar botão de idioma (só depois de inserir o navbar)
      initLangSwitch();

      // Menu hambúrguer (caso usees depois)
      const toggle = document.getElementById("navbar-toggle");
      const links = document.getElementById("navbar-links");
      toggle?.addEventListener("click", () => {
        links.classList.toggle("active");
      });
    })
    .catch(err => console.error("[script.js] erro ao carregar navbar:", err));

  // Carregar footer correto
  fetch(footerFile)
    .then(response => {
      if (!response.ok) throw new Error("Footer not found: " + footerFile);
      return response.text();
    })
    .then(data => {
      document.getElementById("footer-container").innerHTML = data;
      console.debug("[script.js] footer carregado");
    })
    .catch(err => console.error("[script.js] erro ao carregar footer:", err));

  // Pesquisa de linhas (se existir na página)
  const searchInput = document.getElementById('line-search');
  const linesGrid = document.getElementById('lines-grid');

  if (searchInput && linesGrid) {
    const lineCards = Array.from(linesGrid.getElementsByClassName('line-card'));

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      lineCards.forEach(card => {
        const number = (card.dataset.number || "").toLowerCase();
        const name = (card.dataset.name || "").toLowerCase();
        if (number.includes(query) || name.includes(query)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }
});


// ---------- Função de inicialização do botão de idioma ----------
function initLangSwitch() {
  const langBtn = document.getElementById("lang-btn");
  if (!langBtn) {
    console.warn("[initLangSwitch] #lang-btn não encontrado no DOM (verifica navbar).");
    return;
  }

  // Evitar multiple bindings caso a função seja chamada mais que uma vez
  if (langBtn.dataset.langAttached === "1") {
    console.debug("[initLangSwitch] listener já anexado, abortando re-attach.");
    // Atualiza texto do botão só por segurança
    updateLangButtonText(langBtn);
    return;
  }

  // Mapas PT ↔ EN
  const ptToEn = {
    "index.html": "index.html",
    "linhas.html": "lines.html",
    "planear-viagem.html": "plan-a-trip.html",
    "paragem.html": "stop.html",
    "alteracoes-de-servico.html": "service-changes.html",
    "tarifario.html": "tariff.html",
    "acessibilidade.html": "accessibility.html"
  };
  const enToPt = Object.fromEntries(Object.entries(ptToEn).map(([pt, en]) => [en, pt]));

  // Atualiza o texto do botão ao carregar
  updateLangButtonText(langBtn);

  // Marca como iniciado
  langBtn.dataset.langAttached = "1";

  // Listener de clique: calcula idioma na hora do clique (robusto)
  langBtn.addEventListener("click", () => {
    const parts = window.location.pathname.split("/"); // exemplo: ["", "pages", "pt", "linhas.html"]
    const langIdx = parts.findIndex(seg => seg === "pt" || seg === "en");
    const currentLang = langIdx !== -1 ? parts[langIdx] : (window.location.pathname.includes("/en/") ? "en" : "pt");
    const fileName = parts[parts.length - 1] || "index.html";

    console.debug("[lang-switch] clique detectado", { currentLang, fileName, parts });

    let targetFile;
    if (currentLang === "pt") {
      targetFile = ptToEn[fileName];
      if (!targetFile) {
        alert("There is no english version of this page.");
        return;
      }
      // Substitui /pt/ por /en/ (se existir), senão insere após 'pages'
      if (langIdx !== -1) {
        parts[langIdx] = "en";
      } else {
        const pagesIdx = parts.findIndex(seg => seg === "pages");
        if (pagesIdx !== -1) parts.splice(pagesIdx + 1, 0, "en");
        else parts.splice(1, 0, "en"); // fallback: insere logo após raiz
      }
      parts[parts.length - 1] = targetFile;
    } else if (currentLang === "en") {
      targetFile = enToPt[fileName];
      if (!targetFile) {
        alert("There is no portuguese version of this page.");
        return;
      }
      if (langIdx !== -1) {
        parts[langIdx] = "pt";
      } else {
        const pagesIdx = parts.findIndex(seg => seg === "pages");
        if (pagesIdx !== -1) parts.splice(pagesIdx + 1, 0, "pt");
        else parts.splice(1, 0, "pt");
      }
      parts[parts.length - 1] = targetFile;
    } else {
      alert("Page language unknown, operation canceled.");
      return;
    }

    const newPath = parts.join("/");
    console.debug("[lang-switch] redirecionando para:", newPath);
    // Redireciona para o novo caminho (relativo absoluto)
    window.location.href = newPath;
  });


  // Helper para atualizar o texto do botão (mostra o idioma que será carregado ao clicar)
  function updateLangButtonText(btn) {
    const parts = window.location.pathname.split("/");
    const langIdx = parts.findIndex(seg => seg === "pt" || seg === "en");
    const currentLang = langIdx !== -1 ? parts[langIdx] : (window.location.pathname.includes("/en/") ? "en" : "pt");
    btn.textContent = currentLang === "pt" ? "PT" : "EN";
  }
}
