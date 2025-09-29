// line-renderer.js
(function(){
  "use strict";

  // helper escape
  function esc(s){ return String(s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  function getMapping() {
    const stored = sessionStorage.getItem("csvFieldMapping");
    if (stored) return JSON.parse(stored);
    // defaults (will be overridden by UI guesses)
    return {
      linha: "linha",
      sentido: "sentido",
      ordem: "ordem",
      paragem: "paragem",
      horario: "horario"
    };
  }

  function aggregateMapping(rows, mapping) {
    // build structure: mappingObj[lineId][sentido] = [rows...]
    const out = {};
    rows.forEach(r => {
      const lineKey = String(r[mapping.linha] || "").trim();
      if (!lineKey) return;
      const sentidoKey = String(r[mapping.sentido] || "ida").trim() || "ida";
      out[lineKey] = out[lineKey] || {};
      out[lineKey][sentidoKey] = out[lineKey][sentidoKey] || [];
      out[lineKey][sentidoKey].push(r);
    });
    // sort by ordem if present
    Object.keys(out).forEach(l => {
      Object.keys(out[l]).forEach(s => {
        out[l][s].sort((a,b) => {
          const na = Number(a[mapping.ordem]||a.order||0);
          const nb = Number(b[mapping.ordem]||b.order||0);
          return na - nb;
        });
      });
    });
    return out;
  }

  function renderLine(lineId, mappingObj, mappingFields) {
    const titleEl = document.getElementById("line-title");
    const subtitleEl = document.getElementById("line-subtitle");
    const stopsEl = document.getElementById("line-stops");
    const horariosInner = document.getElementById("horarios-inner");
    const pill = document.getElementById("line-pill");
    const dirBtn = document.getElementById("direction-switch");

    const dataForLine = mappingObj[lineId];
    if (!dataForLine) {
      titleEl.textContent = "Linha " + lineId;
      stopsEl.innerHTML = "<li>Não existem dados para esta linha no CSV.</li>";
      return;
    }

    // pick initial direction (pref 'ida' or first key)
    const directions = Object.keys(dataForLine);
    let current = directions.includes("ida") ? "ida" : directions[0];

    function doRender() {
      titleEl.textContent = "Linha " + lineId;
      subtitleEl.textContent = (dataForLine.name || "");
      // pill color guess: from first row color field if exists
      const sample = (dataForLine[current] && dataForLine[current][0]) || {};
      if (sample.color) pill.style.background = sample.color;
      else if (sample.cor) pill.style.background = sample.cor;
      else pill.style.background = "#f58220";

      // render stops (timeline)
      stopsEl.innerHTML = "";
      const rows = dataForLine[current] || [];
      rows.forEach((r, idx) => {
        const stopName = r[mappingFields.paragem] || r.paragem || r.stop || r.name || "";
        const stopCode = r.codigo || r.code || "";
        const horario = r[mappingFields.horario] || r.horario || r.horarios || "";
        const li = document.createElement("li");
        li.className = "timeline-item";
        li.tabIndex = 0;
        li.innerHTML = '<div class="timeline-marker" aria-hidden="true"></div>' +
                       '<div class="timeline-content"><div class="stop-name">' + esc(stopName) + '</div>' +
                       '<div class="stop-meta small">' + esc(stopCode) + '</div></div>';
        // attach horario
        li.dataset.horario = horario;
        li.addEventListener("click", () => {
          showHorario(stopName, horario);
        });
        stopsEl.appendChild(li);
      });

      // update button text
      dirBtn.textContent = directions.length > 1 ? `Sentido: ${current} (clicar para inverter)` : "Unico sentido";
    }

    function showHorario(stopName, horario) {
      const container = horariosInner;
      let html = `<h3>${esc(stopName)}</h3>`;
      if (horario && String(horario).trim()) {
        const parts = String(horario).split(';').map(s => s.trim()).filter(Boolean);
        html += '<div class="horarios-list">' + parts.map(p => `<span class="hora">${esc(p)}</span>`).join('') + '</div>';
      } else {
        html += "<p>Sem horários disponível nesta paragem.</p>";
      }
      container.innerHTML = html;
      // switch to horarios tab
      document.getElementById("tab-paragens").classList.remove("active");
      document.getElementById("tab-horarios").classList.add("active");
      document.getElementById("paragens-container").classList.add("hidden");
      document.getElementById("horarios-container").classList.remove("hidden");
      document.getElementById("horarios-container").setAttribute("aria-hidden","false");
    }

    // tab handlers
    document.getElementById("tab-paragens").addEventListener("click", () => {
      document.getElementById("tab-paragens").classList.add("active");
      document.getElementById("tab-horarios").classList.remove("active");
      document.getElementById("paragens-container").classList.remove("hidden");
      document.getElementById("horarios-container").classList.add("hidden");
      document.getElementById("horarios-container").setAttribute("aria-hidden","true");
    });
    document.getElementById("tab-horarios").addEventListener("click", () => {
      document.getElementById("tab-paragens").classList.remove("active");
      document.getElementById("tab-horarios").classList.add("active");
      document.getElementById("paragens-container").classList.add("hidden");
      document.getElementById("horarios-container").classList.remove("hidden");
      document.getElementById("horarios-container").setAttribute("aria-hidden","false");
    });

    // switch sentido button
    dirBtn.addEventListener("click", () => {
      const idx = directions.indexOf(current);
      current = directions[(idx + 1) % directions.length];
      doRender();
    });

    doRender();
  }

  // Main wiring: listen for CSV load & mapping apply
  function tryRenderOnLoad() {
    const raw = window.RAW_CSV || [];
    if (!raw.length) return;
    let mapping = getMapping();
    // allow mapping to be updated via event
    const mappingObj = aggregateMapping(raw, mapping);
    // line from URL
    const params = new URLSearchParams(window.location.search);
    const lineId = params.get("line");
    if (!lineId) {
      console.error("[line-renderer] missing ?line= parameter");
      return;
    }
    renderLine(lineId, mappingObj, mapping);
  }

  document.addEventListener("lines:csvLoaded", () => {
    tryRenderOnLoad();
  });

  document.addEventListener("lines:mappingApplied", () => {
    tryRenderOnLoad();
  });

})();
