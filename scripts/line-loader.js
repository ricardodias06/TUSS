document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const lineId = params.get("line");

  if (!lineId) return; // Se não houver ?line=ID, mostra só os cartões

  // Esconde a grelha de cartões
  document.getElementById("lines-grid").style.display = "none";

  // Mostra a área de detalhes
  const detailsSection = document.getElementById("line-details");
  detailsSection.style.display = "block";

  // Carregar JSON
  fetch("../../data/lines.json")
    .then(res => res.json())
    .then(data => {
      const linha = data[lineId];
      if (!linha) {
        document.getElementById("linha-nome").textContent = "Linha não encontrada";
        return;
      }

      // Preencher dados
      document.getElementById("linha-nome").textContent = linha.nome;
      document.getElementById("linha-origem").textContent = linha.origem;
      document.getElementById("linha-destino").textContent = linha.destino;

      const ul = document.getElementById("linha-paragens");
      ul.innerHTML = ""; // limpar
      linha.paragens.forEach(p => {
        const li = document.createElement("li");
        li.textContent = p;
        ul.appendChild(li);
      });
    })
    .catch(err => {
      console.error("Erro ao carregar dados da linha:", err);
      document.getElementById("linha-nome").textContent = "Erro ao carregar dados";
    });
});
