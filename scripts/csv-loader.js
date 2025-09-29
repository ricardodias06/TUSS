// csv-loader.js
// Carrega um CSV, converte para matriz e substitui <span data-csv="row,col">.
// Expõe: window.CSV_DATA, window.getCsvCell(row,col)
// Dispara evento: document.dispatchEvent(new CustomEvent('csv:loaded', {detail: {data: CSV_DATA}}))

(function () {
  "use strict";

  // Caminho padrão para o CSV (podes sobrepor na página definindo window.CSV_URL antes de carregar este script)
  const DEFAULT_CSV_URLS = [
    "/data/data.csv",
    "/assets/data/data.csv",
    "/data.csv",
    "/assets/data.csv"
  ];

  document.addEventListener("DOMContentLoaded", () => {
    const csvUrl = window.CSV_URL || findExistingUrl(DEFAULT_CSV_URLS);
    if (!csvUrl) {
      console.warn("[csv-loader] Nenhum CSV encontrado por defeito. Define window.CSV_URL antes de carregar o script.");
      // Ainda assim, inicializa variáveis para evitar erros noutros scripts
      window.CSV_DATA = [];
      window.getCsvCell = (r, c) => null;
      document.dispatchEvent(new CustomEvent("csv:loaded", { detail: { data: window.CSV_DATA } }));
      return;
    }

    fetchText(csvUrl)
      .then(text => {
        const matrix = parseCsvToMatrix(text);
        // Guarda globalmente
        window.CSV_DATA = matrix;

        // Helper para obter segurança
        window.getCsvCell = function (rowIndex, colIndex, fallback = "") {
          const r = parseInt(rowIndex);
          const c = parseInt(colIndex);
          if (Number.isNaN(r) || Number.isNaN(c)) return fallback;
          if (!window.CSV_DATA || !window.CSV_DATA[r] || typeof window.CSV_DATA[r][c] === "undefined") return fallback;
          return window.CSV_DATA[r][c];
        };

        // Substitui spans com data-csv="r,c"
        replaceDataCsvSpans();

        // Dispara evento para outros scripts
        document.dispatchEvent(new CustomEvent("csv:loaded", { detail: { data: window.CSV_DATA } }));

        console.debug("[csv-loader] CSV carregado:", csvUrl, "linhas:", matrix.length);
      })
      .catch(err => {
        console.error("[csv-loader] erro ao carregar/parsar CSV:", err);
        window.CSV_DATA = [];
        document.dispatchEvent(new CustomEvent("csv:loaded", { detail: { data: window.CSV_DATA } }));
      });
  });

  // ---------- Helpers ----------

  // Tenta encontrar um URL que exista (faz HEAD fetchs silenciosos)
  function findExistingUrl(candidates) {
    // Se o utilizador definiu um global explicitamente, usa-o
    if (window.CSV_URL) return window.CSV_URL;

    // preferir candidatos com maior probabilidade
    // Note: fetch HEAD pode ser bloqueado por CORS, por isso apenas devolve o primeiro candidato
    // e deixa o fetch principal lidar com erros.
    return candidates[0];
  }

  async function fetchText(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed ${url}: ${res.status}`);
    return await res.text();
  }

  // Parser robusto que lida com campos entre aspas e detecta delimitador
  function parseCsvToMatrix(text) {
    // Normalizar newlines
    const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = normalized.split("\n").filter(l => l !== undefined);

    // Detectar delimiter: se houver mais ';' que ',', usar ';', senão ','
    const sample = lines.slice(0, 10).join("\n");
    const semicolonCount = (sample.match(/;/g) || []).length;
    const commaCount = (sample.match(/,/g) || []).length;
    const delimiter = semicolonCount > commaCount ? ";" : ",";

    // Parse por linha com suporte a quotes
    const rows = [];
    for (let i = 0; i < lines.length; i++) {
      const row = parseCsvLine(lines[i], delimiter);
      // Se a linha for completamente vazia, ignora
      if (row.length === 1 && row[0].trim() === "") {
        // manter linha vazia? normalmente ignoramos
        continue;
      }
      rows.push(row);
    }
    return rows;
  }

  // Parse de uma única linha considerando o delimiter e campos com aspas
  function parseCsvLine(line, delimiter) {
    const result = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const nxt = line[i + 1];

      if (ch === '"' ) {
        if (inQuotes && nxt === '"') {
          // escaped quote
          cur += '"';
          i++; // pular próximo
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (!inQuotes && ch === delimiter) {
        result.push(cur);
        cur = "";
        continue;
      }

      cur += ch;
    }
    result.push(cur);
    return result.map(s => s.trim());
  }

  // Substitui os spans data-csv
  function replaceDataCsvSpans() {
    const spans = document.querySelectorAll("span[data-csv]");
    spans.forEach(span => {
      const attr = span.getAttribute("data-csv");
      if (!attr) return;
      // esperar formatos: "row,col" ou "row,col, fallback text"
      const parts = attr.split(",").map(p => p.trim());
      const row = parseInt(parts[0]);
      const col = parseInt(parts[1]);
      const fallback = parts.slice(2).join(",") || "";
      if (Number.isNaN(row) || Number.isNaN(col)) return;
      const val = window.getCsvCell ? window.getCsvCell(row, col, fallback) : fallback;
      // se for string vazia e tiver innerHTML já preenchido, não sobrescreve (opcional)
      span.textContent = (val === "" && fallback === "") ? "" : val;
    });
  }

})();
