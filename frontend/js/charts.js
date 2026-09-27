/* ============================================================
   charts.js - Chart.js chart creation utilities
   ============================================================ */

const Charts = {
  instances: {},

  defaults: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#cbd5e1", font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: "rgba(10,18,36,0.95)",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        padding: 12,
      },
    },
    scales: {
      x: {
        ticks: { color: "#64748b", font: { size: 11 } },
        grid: { color: "rgba(255,255,255,0.04)" },
      },
      y: {
        ticks: { color: "#64748b", font: { size: 11 } },
        grid: { color: "rgba(255,255,255,0.04)" },
      },
    },
  },

  applyDefaults(config) {
    config.plugins = { ...this.defaults.plugins, ...config.plugins };
    config.scales = config.scales || {};
    const base = JSON.parse(JSON.stringify(this.defaults.scales));
    config.scales = this.deepMerge(base, config.scales);
    config.options = config.options || {};
    config.options = { ...this.defaults, ...config.options, plugins: config.plugins, scales: config.scales };
    return config;
  },

  deepMerge(a, b) {
    for (const k in b) {
      if (b[k] && typeof b[k] === "object") a[k] = this.deepMerge(a[k] || {}, b[k]);
      else a[k] = b[k];
    }
    return a;
  },

  /* Graph 1: Vibration Monitoring with threshold lines */
  vibration(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    if (this.instances[canvasId]) this.instances[canvasId].destroy();

    const cfg = {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Vibration (mm/s)",
            data: data.vib,
            borderColor: "#22d3ee",
            backgroundColor: "rgba(34,211,238,0.1)",
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 2,
          },
          { label: "Normal Threshold", data: data.labels.map(() => 4), borderColor: "#10b981", borderDash: [6, 4], borderWidth: 1.5, pointRadius: 0 },
          { label: "Warning Threshold", data: data.labels.map(() => 6), borderColor: "#f59e0b", borderDash: [6, 4], borderWidth: 1.5, pointRadius: 0 },
          { label: "Critical Threshold", data: data.labels.map(() => 8), borderColor: "#ef4444", borderDash: [6, 4], borderWidth: 1.5, pointRadius: 0 },
        ],
      },
    };
    this.instances[canvasId] = new Chart(ctx, this.applyDefaults(cfg));
    return this.instances[canvasId];
  },

  /* Graph 2: Temperature & Humidity dual-axis */
  tempHumidity(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    if (this.instances[canvasId]) this.instances[canvasId].destroy();

    const cfg = {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Temperature (°C)",
            data: data.temp,
            borderColor: "#f59e0b",
            backgroundColor: "rgba(245,158,11,0.1)",
            yAxisID: "y",
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 2,
          },
          {
            label: "Humidity (%)",
            data: data.hum,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.1)",
            yAxisID: "y1",
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 2,
          },
        ],
      },
      scales: {
        y: { position: "left", title: { display: true, text: "Temperature (°C)", color: "#f59e0b" } },
        y1: { position: "right", title: { display: true, text: "Humidity (%)", color: "#3b82f6" }, grid: { drawOnChartArea: false } },
      },
    };
    this.instances[canvasId] = new Chart(ctx, this.applyDefaults(cfg));
    return this.instances[canvasId];
  },

  /* Graph 3: Load / Pressure */
  load(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    if (this.instances[canvasId]) this.instances[canvasId].destroy();

    const cfg = {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Load (kN)",
            data: data.load,
            borderColor: "#60a5fa",
            backgroundColor: "rgba(96,165,250,0.2)",
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 2,
          },
          { label: "Warning (380 kN)", data: data.labels.map(() => 380), borderColor: "#f59e0b", borderDash: [6, 4], borderWidth: 1.5, pointRadius: 0 },
          { label: "Critical (420 kN)", data: data.labels.map(() => 420), borderColor: "#ef4444", borderDash: [6, 4], borderWidth: 1.5, pointRadius: 0 },
        ],
      },
    };
    this.instances[canvasId] = new Chart(ctx, this.applyDefaults(cfg));
    return this.instances[canvasId];
  },

  /* Graph 4: Structural Health Trend */
  health(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    if (this.instances[canvasId]) this.instances[canvasId].destroy();

    const cfg = {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Health Score",
            data: data.health,
            borderColor: "#10b981",
            backgroundColor: "rgba(16,185,129,0.15)",
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 2,
          },
          { label: "Warning (70)", data: data.labels.map(() => 70), borderColor: "#f59e0b", borderDash: [6, 4], borderWidth: 1.5, pointRadius: 0 },
          { label: "Critical (50)", data: data.labels.map(() => 50), borderColor: "#ef4444", borderDash: [6, 4], borderWidth: 1.5, pointRadius: 0 },
        ],
      },
      scales: {
        y: { min: 0, max: 100, title: { display: true, text: "Health Score", color: "#10b981" } },
      },
    };
    this.instances[canvasId] = new Chart(ctx, this.applyDefaults(cfg));
    return this.instances[canvasId];
  },

  /* Graph 5: Sensor Comparison bar chart */
  comparison(canvasId, sensors) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    if (this.instances[canvasId]) this.instances[canvasId].destroy();

    const cfg = {
      type: "bar",
      data: {
        labels: sensors.map((s) => s.label),
        datasets: [
          {
            label: "Current Value",
            data: sensors.map((s) => s.value),
            backgroundColor: sensors.map((s) => s.color),
            borderRadius: 6,
          },
        ],
      },
      plugins: {
        legend: { display: false },
      },
    };
    this.instances[canvasId] = new Chart(ctx, this.applyDefaults(cfg));
    return this.instances[canvasId];
  },
};
