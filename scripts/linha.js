// scripts/linha.js

// Lê parâmetro da linha da URL
const urlParams = new URLSearchParams(window.location.search);
const linhaId = urlParams.get("line") || "5"; // default: linha 5

let dadosLinha = [];
let sentidoAtual = "ida"; // por defeito

// Função principal
function carregarLinha() {
  Papa.parse("../../data/data.csv", {
    download: true,
    header: true,
    complete: function(results) {
      dadosLinha = results.data.filter(row => row.linha === linhaId);
      renderLinha();
    }
  });
}

function renderLinha() {
  document.getElementById("linha-titulo").textContent = `Linha ${linhaId.toUpperCase()} (${sentidoAtual})`;

  // Paragens
  const paragens = dadosLinha
    .filter(r => r.sentido === sentidoAtual)
    .sort((a, b) => Number(a.ordem) - Number(b.ordem));

  const paragensHTML = `
    <h2>Paragens</h2>
    <ol>
      ${paragens.map(p => `<li>${p.paragem}</li>`).join("")}
    </ol>
  `;
  document.getElementById("paragens-container").innerHTML = paragensHTML;

  // Horários
  const horariosHTML = `
    <h2>Horários</h2>
    <table>
      <thead>
        <tr><th>Paragem</th><th>Horas</th></tr>
      </thead>
      <tbody>
        ${paragens.map(p => `
          <tr>
            <td>${p.paragem}</td>
            <td>${p.horario.replace(/;/g, " | ")}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
  document.getElementById("horarios-container").innerHTML = horariosHTML;
}

// Botão para inverter sentido
document.getElementById("toggle-sentido").addEventListener("click", () => {
  sentidoAtual = (sentidoAtual === "ida") ? "volta" : "ida";
  renderLinha();
});

// Inicializar
carregarLinha();
