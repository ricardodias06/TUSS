// line-loader.js
(function () {
  "use strict";

  document.addEventListener("csv:loaded", () => {
    const params = new URLSearchParams(window.location.search);
    const lineId = params.get("line");

    if (!lineId || !window.LINE_MAPPINGS || !window.LINE_MAPPINGS[lineId]) {
      console.error("[line-loader] Linha inválida ou não mapeada:", lineId);
      document.getElementById("line-content").innerHTML =
        `<p>Não foi possível carregar os dados da linha.</p>`;
      return;
    }

    const lineData = window.LINE_MAPPINGS[lineId];

    // Atualizar título e cor
    const titleEl = document.getElementById("line-title");
    if (titleEl) {
      titleEl.textContent = lineData.name;
      titleEl.style.color = lineData.color || "black";
    }

    // Inicialmente mostrar IDA
    let currentDirection = "outbound";

    const stopsEl = document.getElementById("line-stops");
    const switchBtn = document.getElementById("direction-switch");

    function renderStops() {
      stopsEl.innerHTML = "";
      const stops =
        currentDirection === "outbound"
          ? lineData.outbound
          : lineData.inbound;

      stops.forEach(([r, c]) => {
        const stopName = window.getCsvCell(r, c, "—");
        const li = document.createElement("li");
        li.textContent = stopName;
        stopsEl.appendChild(li);
      });

      switchBtn.textContent =
        currentDirection === "outbound" ? "Ver Volta" : "Ver Ida";
    }

    switchBtn.addEventListener("click", () => {
      currentDirection =
        currentDirection === "outbound" ? "inbound" : "outbound";
      renderStops();
    });

    renderStops(); // render inicial
  });
})();