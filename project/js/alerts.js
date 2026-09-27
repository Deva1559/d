/* ============================================================
   alerts.js - Alerts page: table, filtering, anomaly panel
   ============================================================ */

const Alerts = {
  allAlerts: [],

  init() {
    this.allAlerts = DEMO.generateAlerts();
    this.renderTable(this.allAlerts);
    this.initFilters();
    this.renderAnomalies();
  },

  /* Render alert table rows */
  renderTable(alerts) {
    const tbody = document.getElementById("alertsBody");
    if (!tbody) return;
    if (alerts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--gray-400)">No alerts match your filters.</td></tr>`;
      return;
    }
    tbody.innerHTML = alerts
      .map((a) => {
        const sevClass = a.severity;
        const statusClass = a.status === "active" ? "critical" : a.status === "acknowledged" ? "warning" : "normal";
        return `
        <tr>
          <td>${a.id}</td>
          <td>${a.sensor}</td>
          <td>${a.type}</td>
          <td><span class="severity-tag ${sevClass}">${a.severity.charAt(0).toUpperCase() + a.severity.slice(1)}</span></td>
          <td>${a.value}</td>
          <td>${a.timestamp}</td>
          <td><span class="status-indicator ${statusClass}"><i class="fa-solid fa-circle"></i> ${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span></td>
          <td><button class="btn btn-ghost" onclick="Alerts.acknowledge('${a.id}')"><i class="fa-solid fa-check"></i> View</button></td>
        </tr>`;
      })
      .join("");
  },

  /* Filter controls */
  initFilters() {
    const sevFilter = document.getElementById("filterSeverity");
    const sensorFilter = document.getElementById("filterSensor");
    const searchInput = document.getElementById("filterSearch");

    const apply = () => {
      let filtered = this.allAlerts;
      if (sevFilter && sevFilter.value !== "all") filtered = filtered.filter((a) => a.severity === sevFilter.value);
      if (sensorFilter && sensorFilter.value !== "all") filtered = filtered.filter((a) => a.sensor === sensorFilter.value);
      if (searchInput && searchInput.value.trim()) {
        const q = searchInput.value.trim().toLowerCase();
        filtered = filtered.filter((a) => a.id.toLowerCase().includes(q) || a.type.toLowerCase().includes(q));
      }
      this.renderTable(filtered);
    };

    sevFilter?.addEventListener("change", apply);
    sensorFilter?.addEventListener("change", apply);
    searchInput?.addEventListener("input", apply);
  },

  acknowledge(id) {
    App.toast(`Alert ${id} acknowledged`, "success");
    const alert = this.allAlerts.find((a) => a.id === id);
    if (alert) {
      alert.status = "acknowledged";
      this.renderTable(this.allAlerts);
    }
  },

  /* AI Anomaly Detection panel */
  renderAnomalies() {
    const wrap = document.getElementById("anomalyList");
    if (!wrap) return;
    const anomalies = DEMO.generateAnomalies();
    wrap.innerHTML = anomalies
      .map((a) => {
        const cls = a.severity === "high" ? "" : "warning";
        return `
        <div class="anomaly-item ${cls}">
          <div class="anomaly-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <div class="anomaly-body">
            <div class="anomaly-title">${a.type} <span class="severity-tag ${a.severity}" style="margin-left:8px">${a.severity}</span></div>
            <div class="anomaly-meta">
              <span><i class="fa-solid fa-microchip"></i> ${a.sensor}</span>
              <span><i class="fa-regular fa-clock"></i> ${a.timestamp}</span>
              <span><i class="fa-solid fa-hashtag"></i> ${a.id}</span>
            </div>
            <div class="anomaly-action"><i class="fa-solid fa-lightbulb"></i> Recommended action: ${a.action}</div>
          </div>
        </div>`;
      })
      .join("");
  },
};
