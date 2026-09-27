/* ============================================================
   dashboard.js - Overview & Live Monitoring logic
   ============================================================ */

const Dashboard = {
  historyData: null,

  init() {
    this.historyData = DEMO.generateHistory(24);
    this.renderSummaryCards();
    this.renderSensorCards();
    this.renderCharts();
    this.startRefresh();
  },

  /* Overview summary cards */
  renderSummaryCards() {
    const wrap = document.getElementById("summaryCards");
    if (!wrap) return;
    const cards = [
      { title: "Overall Structural Health Score", value: "92.4", unit: "/100", icon: "fa-heart-pulse", color: "var(--green)", status: "normal", statusText: "Normal", trend: "up", trendText: "+1.2% this week" },
      { title: "Active Sensors", value: "28", unit: "/ 30", icon: "fa-tower-broadcast", color: "var(--blue-light)", status: "info", statusText: "2 Offline", trend: "up", trendText: "96.7% uptime" },
      { title: "System Status", value: "Online", unit: "", icon: "fa-circle-check", color: "var(--green)", status: "normal", statusText: "Operational", trend: "up", trendText: "Running 14d" },
      { title: "Detected Anomalies", value: "4", unit: "", icon: "fa-triangle-exclamation", color: "var(--yellow)", status: "warning", statusText: "2 Warning", trend: "down", trendText: "+1 since yesterday" },
      { title: "Maintenance Risk Level", value: "Low", unit: "", icon: "fa-shield-halved", color: "var(--blue-light)", status: "info", statusText: "Low Risk", trend: "up", trendText: "Next due in 45d" },
    ];
    wrap.innerHTML = cards
      .map(
        (c) => `
      <div class="card summary-card">
        <div class="icon-wrap" style="background:${c.color}22;color:${c.color}">
          <i class="fa-solid ${c.icon}"></i>
        </div>
        <div>
          <div class="card-title">${c.title}</div>
          <div class="card-value">${c.value}<span class="sensor-unit">${c.unit}</span></div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span class="status-indicator ${c.status}"><i class="fa-solid fa-circle"></i> ${c.statusText}</span>
          <span class="trend ${c.trend}"><i class="fa-solid fa-arrow-${c.trend}"></i> ${c.trendText}</span>
        </div>
      </div>`
      )
      .join("");
  },

  /* Live sensor cards */
  renderSensorCards() {
    const wrap = document.getElementById("sensorCards");
    if (!wrap) return;
    const d = DEMO.generateLatest();
    const sensors = [
      { name: "Temperature", icon: "fa-temperature-half", value: d.temperature, unit: "°C", status: "normal", statusText: "Normal", trend: "up", color: "var(--yellow)" },
      { name: "Humidity", icon: "fa-droplet", value: d.humidity, unit: "%", status: "normal", statusText: "Normal", trend: "down", color: "var(--blue-light)" },
      { name: "Vibration", icon: "fa-wave-square", value: d.vibration, unit: "mm/s", status: "warning", statusText: "Warning", trend: "up", color: "var(--cyan)" },
      { name: "Load / Pressure", icon: "fa-weight-hanging", value: d.load, unit: "kN", status: "normal", statusText: "Normal", trend: "down", color: "var(--blue-light)" },
      { name: "Acceleration", icon: "fa-arrows-left-right", value: d.accelerometer, unit: "g", status: "normal", statusText: "Normal", trend: "up", color: "var(--cyan)" },
      { name: "Gyroscope", icon: "fa-arrows-up-down", value: d.gyroscope, unit: "deg/s", status: "normal", statusText: "Normal", trend: "down", color: "var(--cyan)" },
      { name: "Pressure", icon: "fa-up-down", value: d.pressure, unit: "hPa", status: "normal", statusText: "Normal", trend: "up", color: "var(--cyan)" },
    ];
    wrap.innerHTML = sensors
      .map(
        (s) => `
      <div class="card sensor-card">
        <div class="sensor-head">
          <div class="sensor-icon" style="background:${s.color}22;color:${s.color}">
            <i class="fa-solid ${s.icon}"></i>
          </div>
          <span class="status-indicator ${s.status}"><i class="fa-solid fa-circle"></i> ${s.statusText}</span>
        </div>
        <div>
          <div class="sensor-name">${s.name}</div>
          <div class="sensor-value">${s.value}<span class="sensor-unit">${s.unit}</span></div>
        </div>
        <div class="sensor-foot">
          <span class="trend-bar ${s.trend}"><i class="fa-solid fa-arrow-${s.trend}"></i> ${s.trend === "up" ? "Rising" : "Falling"}</span>
          <span><i class="fa-regular fa-clock"></i> <span class="sensor-time">just now</span></span>
        </div>
      </div>`
      )
      .join("");
  },

  /* Render all overview charts */
  renderCharts() {
    if (typeof Chart === "undefined") return;
    Charts.vibration("chartVibration", this.historyData);
    Charts.tempHumidity("chartTempHum", this.historyData);
    Charts.load("chartLoad", this.historyData);
    Charts.health("chartHealth", this.historyData);
    // Comparison bar
    const d = DEMO.generateLatest();
    Charts.comparison("chartCompare", [
      { label: "Temp (°C)", value: d.temperature, color: "#f59e0b" },
      { label: "Humidity (%)", value: d.humidity, color: "#3b82f6" },
      { label: "Vibration (mm/s)", value: d.vibration, color: "#22d3ee" },
      { label: "Load (kN)", value: d.load, color: "#60a5fa" },
      { label: "Accel (g)", value: +d.accelerometer, color: "#10b981" },
      { label: "Gyro (deg/s)", value: +d.gyroscope, color: "#a78bfa" },
      { label: "Pressure (hPa)", value: +d.pressure, color: "#f472b6" },
    ]);
  },

  /* Start auto refresh from API with demo fallback */
  startRefresh() {
    API.startAutoRefresh((data, isLive) => {
      this.updateSensorValues(data);
      if (!isLive) {
        // keep demo banner visible
        const banner = document.getElementById("demoBanner");
        if (banner) banner.style.display = "flex";
      } else {
        const banner = document.getElementById("demoBanner");
        if (banner) banner.style.display = "none";
      }
    });
  },

  /* Update sensor card values live */
  updateSensorValues(data) {
    const map = {
      temperature: 0, humidity: 1, vibration: 2, load: 3,
      accelerometer: 4, gyroscope: 5, pressure: 6,
    };
    const cards = document.querySelectorAll("#sensorCards .sensor-card");
    const units = ["°C", "%", "mm/s", "kN", "g", "deg/s", "hPa"];
    Object.keys(map).forEach((key) => {
      const card = cards[map[key]];
      if (card && data[key] !== undefined) {
        const valEl = card.querySelector(".sensor-value");
        if (valEl) valEl.innerHTML = `${data[key]}<span class="sensor-unit">${units[map[key]]}</span>`;
        const timeEl = card.querySelector(".sensor-time");
        if (timeEl) timeEl.textContent = "just now";
      }
    });
  },
};
