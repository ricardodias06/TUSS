// scripts/csv-loader.js
// Carrega um CSV e substitui todos os elementos com [data-csv="row,col"]
(function () {
  'use strict';

  // encontra a tag <script> que carregou este ficheiro (para ler data-csv-path)
  const THIS_SCRIPT = document.currentScript ||
    Array.from(document.getElementsByTagName('script'))
      .filter(s => s.src && /csv-loader\.js$/.test(s.src))
      .pop();

  const DEFAULT_CSV_PATH = (THIS_SCRIPT && THIS_SCRIPT.dataset.csvPath) ? THIS_SCRIPT.dataset.csvPath : '../../data/data.csv';

  let csvData = [];

  function removeBOM(s) { return s.replace(/^\uFEFF/, ''); }

  // Detecta delimitador (',' ou ';') ignorando texto dentro de aspas
  function detectDelimiter(line) {
    let inQuotes = false, comma = 0, semi = 0;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') inQuotes = !inQuotes;
      else if (!inQuotes) {
        if (ch === ',') comma++;
        if (ch === ';') semi++;
      }
    }
    return semi > comma ? ';' : ',';
  }

  // Parser CSV simples mas robusto: suporta aspas, "" para aspas internas e \r\n
  function parseCSV(text) {
    text = removeBOM(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = text.split('\n');
    let firstNonEmpty = lines.find(l => l.trim().length > 0) || lines[0] || '';
    const delim = detectDelimiter(firstNonEmpty);

    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (inQuotes) {
        if (ch === '"') {
          if (next === '"') { currentField += '"'; i++; } // escaped quote
          else { inQuotes = false; }
        } else {
          currentField += ch;
        }
      } else {
        if (ch === '"') { inQuotes = true; }
        else if (ch === delim) { currentRow.push(currentField); currentField = ''; }
        else if (ch === '\n') { currentRow.push(currentField); rows.push(currentRow); currentRow = []; currentField = ''; }
        else if (ch === '\r') { /* ignore */ }
        else { currentField += ch; }
      }
    }

    // push last field/row (se houver)
    if (inQuotes) { /* se houver aspas não fechadas, fecha mesmo assim */ }
    // if last line didn't end with newline, push it
    if (currentField !== '' || currentRow.length > 0) {
      currentRow.push(currentField);
      rows.push(currentRow);
    }

    // remove possível linha final vazia causada por \n no fim do ficheiro
    if (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') rows.pop();

    // trim campos
    return rows.map(r => r.map(f => (typeof f === 'string') ? f.trim() : f));
  }

  // obter célula (0-based). Retorna string vazia se fora dos limites.
  function getCell(row, col) {
    if (!Array.isArray(csvData) || csvData.length === 0) return '';
    row = Number(row); col = Number(col);
    if (!Number.isFinite(row) || !Number.isFinite(col)) return '';
    if (row < 0 || col < 0) return '';
    if (row >= csvData.length) return '';
    const r = csvData[row] || [];
    if (col >= r.length) return '';
    return r[col];
  }

  // Preenche todos os elementos [data-csv="r,c"]
  function populateElements() {
    document.querySelectorAll('[data-csv]').forEach(el => {
      const raw = (el.getAttribute('data-csv') || '').trim();
      if (!raw) return;
      const parts = raw.split(',').map(s => s.trim());
      const r = Number(parts[0]);
      const c = Number(parts[1]);
      if (!Number.isFinite(r) || !Number.isFinite(c)) {
        console.warn('data-csv inválido (espera "row,col"):', raw, el);
        el.textContent = '';
      } else {
        el.textContent = getCell(r, c) || '';
      }
    });
  }

  // Inicializador: faz fetch do CSV, parse e popula
  async function init() {
    const script = THIS_SCRIPT;
    const csvPath = (script && script.dataset.csvPath) ? script.dataset.csvPath : DEFAULT_CSV_PATH;

    try {
      const resp = await fetch(csvPath, { cache: 'no-store' });
      if (!resp.ok) throw new Error('HTTP ' + resp.status + ' ao carregar ' + csvPath);
      const text = await resp.text();
      csvData = parseCSV(text);

      // expõe utilitários para uso programático e debug
      window.CSVLoader = {
        getCell: (r, c) => getCell(r, c),
        data: csvData,
        rawPath: csvPath
      };

      populateElements();
    } catch (err) {
      console.error('CSV Loader — erro a carregar/parsear CSV:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
