// line-csv-loader.js
(function(){
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const defaultCsv = window.CSV_URL || "../../data/data.csv";
    if (!window.Papa) {
      console.error("[line-csv-loader] PapaParse not loaded. Ensure papaparse is included.");
      document.dispatchEvent(new CustomEvent("lines:csvLoaded", { detail: { raw: [], header: [] } }));
      return;
    }

    function buildMappingUI(header) {
      const keys = header.slice(); // array of column names
      // helper to populate a select
      function setOptions(selId) {
        const sel = document.getElementById(selId);
        if (!sel) return;
        sel.innerHTML = keys.map(k => `<option value="${k}">${k}</option>`).join("");
      }
      setOptions("map-linha");
      setOptions("map-sentido");
      setOptions("map-ordem");
      setOptions("map-paragem");
      setOptions("map-horario");

      // try to preselect sensible defaults if present
      const lower = keys.map(k => k.toLowerCase());
      const guess = (cands) => {
        for (const c of cands) {
          const i = lower.indexOf(c);
          if (i !== -1) return keys[i];
        }
        return keys[0];
      };
      const pre = {
        "map-linha": guess(["linha","line","route","route_id"]),
        "map-sentido": guess(["sentido","direction","dir"]),
        "map-ordem": guess(["ordem","order","seq","index"]),
        "map-paragem": guess(["paragem","stop","stop_name","name"]),
        "map-horario": guess(["horario","horarios","times","time","schedule"])
      };
      Object.keys(pre).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = pre[id];
      });

      // apply mapping button
      const applyBtn = document.getElementById("apply-mapping");
      if (applyBtn) {
        applyBtn.addEventListener("click", () => {
          const mapping = {
            linha: document.getElementById("map-linha").value,
            sentido: document.getElementById("map-sentido").value,
            ordem: document.getElementById("map-ordem").value,
            paragem: document.getElementById("map-paragem").value,
            horario: document.getElementById("map-horario").value
          };
          sessionStorage.setItem("csvFieldMapping", JSON.stringify(mapping));
          // dispatch event so renderer re-runs if already loaded
          document.dispatchEvent(new CustomEvent("lines:mappingApplied", { detail: { mapping } }));
        });
      }
    }

    Papa.parse(defaultCsv, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        const raw = results.data || [];
        const header = results.meta && results.meta.fields ? results.meta.fields : (raw.length ? Object.keys(raw[0]) : []);
        window.RAW_CSV = raw;
        window.RAW_CSV_HEADER = header;
        buildMappingUI(header);
        document.dispatchEvent(new CustomEvent("lines:csvLoaded", { detail: { raw, header } }));
        console.debug("[line-csv-loader] CSV loaded:", defaultCsv, "rows:", raw.length);
      },
      error: function(err) {
        console.error("[line-csv-loader] CSV parse error", err);
        document.dispatchEvent(new CustomEvent("lines:csvLoaded", { detail: { raw: [], header: [] } }));
      }
    });
  });
})();
