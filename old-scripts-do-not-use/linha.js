// /scripts/linha.js

document.addEventListener("DOMContentLoaded", () => {
  const csvFilePath = "/data/linha6.csv"; // caminho fixo pela raiz
  const container = document.getElementById("mapa-linha");

  // Função para carregar CSV
  async function loadStops() {
    try {
      const response = await fetch(csvFilePath);
      if (!response.ok) throw new Error("Erro ao carregar CSV");

      const csvText = await response.text();
      const stops = parseCSV(csvText);

      renderLine(stops);
    } catch (err) {
      console.error("Erro:", err);
      container.innerHTML = `<p>Não foi possível carregar as paragens.</p>`;
    }
  }

  // Parser simples de CSV (1 coluna apenas)
  function parseCSV(text) {
    return text
      .split("\n")
      .map(row => row.trim())
      .filter(row => row.length > 0);
  }

  // Renderizar a linha com as paragens
  function renderLine(stops) {
    container.innerHTML = ""; // limpar antes

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "120");
    svg.style.overflow = "visible";

    const totalStops = stops.length;
    const padding = 50;
    const circleRadius = 10;
    const spacing = (window.innerWidth - 2 * padding) / (totalStops - 1);
    const centerY = 40;

    // linha principal
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", padding);
    line.setAttribute("y1", centerY);
    line.setAttribute("x2", window.innerWidth - padding);
    line.setAttribute("y2", centerY);
    line.setAttribute("stroke", "#444");
    line.setAttribute("stroke-width", "3");
    svg.appendChild(line);

    // paragens
    stops.forEach((stop, i) => {
      const x = padding + i * spacing;

      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", centerY);
      circle.setAttribute("r", circleRadius);
      circle.setAttribute("fill", "#fff");
      circle.setAttribute("stroke", "#000");
      circle.setAttribute("stroke-width", "2");
      svg.appendChild(circle);

      const label = document.createElementNS(svgNS, "text");
      label.setAttribute("x", x);
      label.setAttribute("y", centerY + 30);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "12");
      label.textContent = stop;
      svg.appendChild(label);
    });

    container.appendChild(svg);
  }

  loadStops();
});