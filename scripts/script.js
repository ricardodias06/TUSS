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

      // 1. Inicializar botão de idioma
      initLangSwitch();

      // 2. Inicializar botão de Login/Área Cliente (A TUA CORREÇÃO)
      initLoginButton();

      // Menu hambúrguer (caso uses depois)
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

// ---------- Lógica do Botão "Área Cliente" ----------
function initLoginButton() {
  const btn = document.getElementById("navLoginBtn");
  if (!btn) return;

  // Verifica se existe token guardado (login feito)
  // Usamos localStorage direto porque o auth.js pode não estar nesta página
  const token = localStorage.getItem("authToken");
  
  // Caminhos absolutos para garantir que funciona em qualquer pasta
  const loginPath = "/pages/pt/login.html";
  const hubPath = "/pages/pt/hub.html";

  if (token) {
    // --- ESTADO: LOGADO ---
    btn.classList.add("logged-in"); // Fica verde (definido no CSS)
    
    // Ajusta o texto conforme o idioma atual do botão
    if (btn.textContent.toLowerCase().includes("client")) {
        btn.textContent = "My Hub";
    } else {
        btn.textContent = "Meu Hub";
    }
    
    // Clique leva ao Hub
    btn.addEventListener("click", () => {
      window.location.href = hubPath;
    });

  } else {
    // --- ESTADO: NÃO LOGADO ---
    // Clique leva ao Login
    btn.addEventListener("click", () => {
      window.location.href = loginPath;
    });
  }
}

// ---------- Função de inicialização do botão de idioma ----------
function initLangSwitch() {
  const langBtn = document.getElementById("lang-btn");
  if (!langBtn) {
    console.warn("[initLangSwitch] #lang-btn não encontrado no DOM (verifica navbar).");
    return;
  }

  if (langBtn.dataset.langAttached === "1") return;

  const ptToEn = {
    "index.html": "index.html",
    "linhas.html": "lines.html",
    "planear-viagem.html": "plan-a-trip.html",
    "paragem.html": "stop.html",
    "alteracoes-de-servico.html": "service-changes.html",
    "tarifario.html": "tariff.html",
    "acessibilidade.html": "accessibility.html",
    "login.html": "login.html", // Adicionado caso queiras login em EN
    "hub.html": "hub.html"
  };
  const enToPt = Object.fromEntries(Object.entries(ptToEn).map(([pt, en]) => [en, pt]));

  updateLangButtonText(langBtn);
  langBtn.dataset.langAttached = "1";

  langBtn.addEventListener("click", () => {
    const parts = window.location.pathname.split("/");
    const langIdx = parts.findIndex(seg => seg === "pt" || seg === "en");
    const currentLang = langIdx !== -1 ? parts[langIdx] : (window.location.pathname.includes("/en/") ? "en" : "pt");
    const fileName = parts[parts.length - 1] || "index.html";

    let targetFile;
    if (currentLang === "pt") {
      targetFile = ptToEn[fileName];
      if (!targetFile) { alert("There is no english version of this page."); return; }
      if (langIdx !== -1) parts[langIdx] = "en";
      else parts.splice(1, 0, "en");
      parts[parts.length - 1] = targetFile;
    } else {
      targetFile = enToPt[fileName];
      if (!targetFile) { alert("There is no portuguese version of this page."); return; }
      if (langIdx !== -1) parts[langIdx] = "pt";
      else parts.splice(1, 0, "pt");
      parts[parts.length - 1] = targetFile;
    }

    window.location.href = parts.join("/");
  });

  function updateLangButtonText(btn) {
    const parts = window.location.pathname.split("/");
    const langIdx = parts.findIndex(seg => seg === "pt" || seg === "en");
    const currentLang = langIdx !== -1 ? parts[langIdx] : (window.location.pathname.includes("/en/") ? "en" : "pt");
    btn.textContent = currentLang === "pt" ? "PT" : "EN";
  }
}