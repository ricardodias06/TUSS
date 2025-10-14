// ===============================
// Configuração dos intervalos por linha
// ===============================
const lineIntervals = {
  5: { inbound: [366, 385], outbound: [387, 404] },
  6: { inbound: [272, 286], outbound: [288, 301] },
  7: { inbound: [225, 239], outbound: [241, 258] },
  13: { inbound: [135, 153], outbound: [155, 174] },
  14: { inbound: [188, 199], outbound: [201, 211] },
  18: { inbound: [315, 332], outbound: [334, 352] },
};

let csvData = [];
let stopId = null;
let stopRow = null;
let availableLines = [];

// ===============================
// 1. Carregar CSV
// ===============================
async function loadCSV() {
  const response = await fetch('/data/data.csv');
  const text = await response.text();
  const rows = text.split('\n').map(r => r.split(';'));
  csvData = rows;
  return rows;
}

// ===============================
// 2. Obter stopId da URL
// ===============================
function getStopIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('stop');
}

// ===============================
// 3. Encontrar row da paragem no CSV
// ===============================
function findStopRow(stopId) {
  for (let i = 0; i < csvData.length; i++) {
    if (csvData[i][0] && csvData[i][0].includes(`(${stopId})`)) {
      return i;
    }
  }
  return null;
}

// ===============================
// 4. Verificar se existe horário válido na linha
// ===============================
function hasValidTimesForLine(line, direction, stopRow) {
  const [start, end] = lineIntervals[line][direction];
  for (let r = start; r <= end; r++) {
    const cell = csvData[r]?.[stopRow];
    if (cell && /\b\d{2}:\d{2}\b/.test(cell.trim())) {
      return true;
    }
  }
  return false;
}

// ===============================
// 5. Obter linhas disponíveis nesta paragem
// ===============================
function getAvailableLines(stopRow) {
  const result = [];
  for (const line of Object.keys(lineIntervals).sort((a, b) => a - b)) {
    for (const direction of ['outbound', 'inbound']) {
      if (hasValidTimesForLine(line, direction, stopRow)) {
        result.push({ line, direction });
      }
    }
  }
  return result;
}

// ===============================
// 6. Gerar botões das linhas disponíveis
// ===============================
function renderLineButtons() {
  const container = document.getElementById('line-buttons');
  container.innerHTML = '';

  if (availableLines.length === 0) {
    container.innerHTML = `<p>Nenhuma linha com horários para esta paragem.</p>`;
    return;
  }

  availableLines.forEach(({ line, direction }) => {
    const label = `Linha ${line} — ${direction.toUpperCase()}`;
    const id = `line-${line}-${direction}`;

    const wrapper = document.createElement('label');
    wrapper.style.marginRight = '8px';

    const checkbox = document.createElement('input');
    checkbox.type = 'radio';
    checkbox.name = 'line-selection';
    checkbox.id = id;
    checkbox.addEventListener('change', () => renderTimetable(line, direction));

    const textNode = document.createTextNode(' ' + label);

    wrapper.appendChild(checkbox);
    wrapper.appendChild(textNode);
    container.appendChild(wrapper);
  });
}

// ===============================
// 7. Gerar tabela de horários
// ===============================
function renderTimetable(line, direction) {
  const tableContainer = document.getElementById('timetable');
  tableContainer.innerHTML = '';

  const [start, end] = lineIntervals[line][direction];
  const times = {};

  for (let r = start; r <= end; r++) {
    const cell = csvData[r]?.[stopRow];
    if (cell && /\b\d{2}:\d{2}\b/.test(cell.trim())) {
      const [hour, minute] = cell.split(':');
      if (!times[hour]) times[hour] = [];
      times[hour].push(minute);
    }
  }

  // Ordenar horas com 00 no fim
  const sortedHours = Object.keys(times).sort((a, b) => {
    const na = a === '00' ? 24 : parseInt(a);
    const nb = b === '00' ? 24 : parseInt(b);
    return na - nb;
  });

  const table = document.createElement('table');
  table.classList.add('timetable-table');

  const headerRow = document.createElement('tr');
  headerRow.innerHTML = '<th>Hora</th><th>Minutos</th>';
  table.appendChild(headerRow);

  sortedHours.forEach(hour => {
    const row = document.createElement('tr');
    const minutes = times[hour].sort((a, b) => parseInt(a) - parseInt(b)).join(' ');
    row.innerHTML = `<td>${hour}</td><td>${minutes}</td>`;
    table.appendChild(row);
  });

  const title = document.createElement('h3');
  title.textContent = `Linha ${line} — ${direction.toUpperCase()} (paragem row ${stopRow})`;

  tableContainer.appendChild(title);
  tableContainer.appendChild(table);
}

// ===============================
// 8. Inicializar página
// ===============================
async function init() {
  await loadCSV();
  stopId = getStopIdFromUrl();
  stopRow = findStopRow(stopId);

  document.getElementById('stop-name').textContent = getStopDisplayName();
  document.getElementById('stop-row').textContent = stopRow !== null ? stopRow : 'N/A';

  if (stopRow !== null) {
    availableLines = getAvailableLines(stopRow);
    renderLineButtons();
  } else {
    document.getElementById('line-buttons').innerHTML = '<p>Paragem não encontrada.</p>';
  }
}

// ===============================
// 9. Obter nome completo da paragem
// ===============================
function getStopDisplayName() {
  const row = csvData[stopRow];
  if (!row) return stopId;
  const name = row[0] || stopId;
  return name.replace(/\(.*?\)/, '').trim() + ` (${stopId})`;
}

document.addEventListener('DOMContentLoaded', init);
