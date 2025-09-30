document.addEventListener("DOMContentLoaded", () => {
  const langBtn = document.getElementById("lang-btn");
  if (!langBtn) return;

  // Mapas PT ↔ EN
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

  // Detectar idioma atual
  const path = window.location.pathname; // ex: /pages/pt/linhas.html
  const parts = path.split("/");          // ["", "pages", "pt", "linhas.html"]
  const currentLang = parts[2];           // "pt" ou "en"
  const file = parts[3];                  

  // Atualizar texto do botão
  langBtn.textContent = currentLang === "pt" ? "EN" : "PT";

  langBtn.addEventListener("click", () => {
    let targetFile;

    if (currentLang === "pt") {
      targetFile = ptToEn[file];
      if (!targetFile) { alert("There is no english version of this page."); return; }
      parts[2] = "en";
      parts[3] = targetFile;
    } else if (currentLang === "en") {
      targetFile = enToPt[file];
      if (!targetFile) { alert("There is no portuguese version of this page."); return; }
      parts[2] = "pt";
      parts[3] = targetFile;
    } else {
      alert("Idioma desconhecido.");
      return;
    }

    const newPath = parts.join("/");
    window.location.href = newPath;
  });
});
