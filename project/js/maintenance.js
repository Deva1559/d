/* ============================================================
   maintenance.js - Predictive Maintenance page
   ============================================================ */

const Maintenance = {
  init() {
    this.renderRiskCards();
    this.renderRecommendations();
    this.renderSensorConditions();
    this.renderHistoryChart();
  },

  /* Risk assessment cards */
  renderRiskCards() {
    const wrap = document.getElementById("riskCards");
    if (!wrap) return;
    const risks = [
      { title: "Overall Risk", value: "Low", icon: "fa-shield-halved", color: "var(--green)", status: "normal" },
      { title: "Bearing Wear Risk", value: "Medium", icon: "fa-gears", color: "var(--yellow)", status: "warning" },
      { title: "Corrosion Risk", value: "Low", icon: "fa-water", color: "var(--green)", status: "normal" },
      { title: "Fatigue Risk", value: "Low", icon: "fa-bolt", color: "var(--green)", status: "normal" },
      { title: "Structural Cracking", value: "Low", icon: "fa-mountain", color: "var(--green)", status: "normal" },
      { title: "Foundation Settlement", value: "Medium", icon: "fa-arrows-down-to-line", color: "var(--yellow)", status: "warning" },
    ];
    wrap.innerHTML = risks
      .map(
        (r) => `
      <div class="card risk-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div class="icon-wrap" style="width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:${r.color}22;color:${r.color};font-size:17px">
            <i class="fa-solid ${r.icon}"></i>
          </div>
          <span class="status-indicator ${r.status}"><i class="fa-solid fa-circle"></i> ${r.value}</span>
        </div>
        <h4>${r.title}</h4>
        <div class="risk-value" style="color:${r.color}">${r.value}</div>
      </div>`
      )
      .join("");
  },

  /* Maintenance recommendations list */
  renderRecommendations() {
    const wrap = document.getElementById("recommendations");
    if (!wrap) return;
    const recs = [
      { priority: "High", text: "Inspect vibration sensor VS-02 on span 2 within 7 days.", icon: "fa-triangle-exclamation", color: "var(--red)" },
      { priority: "Medium", text: "Schedule routine lubrication of bearing assembly BRG-A.", icon: "fa-oil-can", color: "var(--yellow)" },
      { priority: "Medium", text: "Calibrate temperature sensor TS-01 to correct drift.", icon: "fa-screwdriver-wrench", color: "var(--yellow)" },
      { priority: "Low", text: "Clean and recoat protective surface near joint J-04.", icon: "fa-paint-roller", color: "var(--blue-light)" },
      { priority: "Low", text: "Plan quarterly visual inspection for next month.", icon: "fa-clipboard-check", color: "var(--blue-light)" },
    ];
    wrap.innerHTML = recs
      .map(
        (r) => `
      <div class="anomaly-item ${r.priority === "High" ? "" : "warning"}">
        <div class="anomaly-icon" style="background:${r.color}22;color:${r.color}"><i class="fa-solid ${r.icon}"></i></div>
        <div class="anomaly-body">
          <div class="anomaly-title">${r.priority} Priority</div>
          <div class="anomaly-action" style="margin-top:4px">${r.text}</div>
        </div>
      </div>`
      )
      .join("");
  },

  /* Sensor condition table */
  renderSensorConditions() {
    const wrap = document.getElementById("sensorConditions");
    if (!wrap) return;
    const sensors = [
      { name: "VS-01", type: "Vibration", condition: "Good", last: "2026-09-18", status: "normal" },
      { name: "VS-02", type: "Vibration", condition: "Degraded", last: "2026-09-17", status: "warning" },
      { name: "TS-01", type: "Temperature", condition: "Fair", last: "2026-09-15", status: "warning" },
      { name: "HS-01", type: "Humidity", condition: "Good", last: "2026-09-18", status: "normal" },
      { name: "LC-01", type: "Load Cell", condition: "Good", last: "2026-09-16", status: "normal" },
      { name: "LC-03", type: "Load Cell", condition: "Needs Calibration", last: "2026-09-10", status: "warning" },
      { name: "AS-01", type: "Accelerometer", condition: "Good", last: "2026-09-18", status: "normal" },
    ];
    wrap.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Sensor ID</th><th>Type</th><th>Condition</th><th>Last Inspection</th><th>Status</th></tr></thead>
          <tbody>
            ${sensors
              .map(
                (s) => `
              <tr>
                <td>${s.name}</td>
                <td>${s.type}</td>
                <td>${s.condition}</td>
                <td>${s.last}</td>
                <td><span class="status-indicator ${s.status}"><i class="fa-solid fa-circle"></i> ${s.condition}</span></td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`;
  },

  /* Historical anomaly count chart */
  renderHistoryChart() {
    const canvas = document.getElementById("chartMaintenance");
    if (!canvas || typeof Chart === "undefined") return;
    const labels = [];
    const counts = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.now() - i * 30 * 24 * 3600 * 1000);
      labels.push(d.toLocaleDateString("en-US", { month: "short" }));
      counts.push(Math.floor(Math.random() * 8) + 1);
    }
    new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Anomalies per Month",
            data: counts,
            backgroundColor: "rgba(59,130,246,0.5)",
            borderColor: "#3b82f6",
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: "#cbd5e1" } },
          tooltip: { backgroundColor: "rgba(10,18,36,0.95)" },
        },
        scales: {
          x: { ticks: { color: "#64748b" }, grid: { color: "rgba(255,255,255,0.04)" } },
          y: { beginAtZero: true, ticks: { color: "#64748b" }, grid: { color: "rgba(255,255,255,0.04)" } },
        },
      },
    });
  },
};
