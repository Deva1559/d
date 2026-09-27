/* ============================================================
   api.js - Spring Boot Backend Integration
   Base URL: http://localhost:8081
   ============================================================ */

const API = {
  BASE_URL: "http://localhost:8080",
  ENDPOINTS: {
    LATEST: "/api/sensor-data",
    HISTORY: "/api/sensors/history",
    READINGS: "/api/sensors/readings",
  },
  REFRESH_INTERVAL: 5000, // 5 seconds
  isLive: false,
  refreshTimer: null,

  /**
   * Fetch helper with error handling, timeout, and loading state.
   * @param {string} url
   * @param {object} options
   */
  async request(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (res.status === 204) return null;
      return await res.json();
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  },

  /** Get latest sensor readings */
  async getLatestSensors() {
    return this.request(this.BASE_URL + this.ENDPOINTS.LATEST);
  },

  /** Get historical sensor data */
  async getSensorHistory(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = this.BASE_URL + this.ENDPOINTS.HISTORY + (query ? "?" + query : "");
    return this.request(url);
  },

  /** Post a new sensor reading */
  async postReading(data) {
    return this.request(this.BASE_URL + this.ENDPOINTS.READINGS, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Start automatic refresh. Tries the backend; if unreachable,
   * falls back to demo data and marks system offline.
   * @param {function} onUpdate - callback(data, isLive)
   */
  startAutoRefresh(onUpdate) {
    const tick = async () => {
      try {
        const data = await this.getLatestSensors();
        if (data && Object.keys(data).length > 0) {
          this.isLive = true;
          App.setOnlineStatus(true);
          document.querySelectorAll('.demo-banner').forEach(b => b.style.display = 'none');
          onUpdate(data, true);
        } else {
          // Empty response - use demo data
          this.isLive = false;
          App.setOnlineStatus(false);
          document.querySelectorAll('.demo-banner').forEach(b => b.style.display = 'flex');
          onUpdate(DEMO.generateLatest(), false);
        }
      } catch (err) {
        // Backend unreachable - use demo data
        this.isLive = false;
        App.setOnlineStatus(false);
        document.querySelectorAll('.demo-banner').forEach(b => b.style.display = 'flex');
        onUpdate(DEMO.generateLatest(), false);
      }
    };
    tick();
    this.refreshTimer = setInterval(tick, this.REFRESH_INTERVAL);
  },

  stopAutoRefresh() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  },
};

/* ============================================================
   DEMO - Sample data generator (labeled DEMO DATA in UI)
   ============================================================ */
const DEMO = {
  baseTime: Date.now() - 3600 * 1000,

  /** Generate realistic latest sensor readings */
  generateLatest() {
    const t = Date.now();
    return {
      timestamp: new Date(t).toISOString(),
      temperature: +(22 + Math.sin(t / 60000) * 3 + Math.random() * 1.5).toFixed(1),
      humidity: +(55 + Math.cos(t / 80000) * 8 + Math.random() * 3).toFixed(1),
      vibration: +(2.4 + Math.sin(t / 40000) * 1.2 + Math.random() * 0.6).toFixed(2),
      load: +(320 + Math.sin(t / 50000) * 40 + Math.random() * 20).toFixed(1),
      accelX: +(0.02 + Math.random() * 0.05).toFixed(3),
      accelY: +(0.01 + Math.random() * 0.04).toFixed(3),
      accelZ: +(9.78 + Math.random() * 0.1).toFixed(3),
    };
  },

  /** Generate time-series history for charts */
  generateHistory(points = 24) {
    const labels = [];
    const temp = [], hum = [], vib = [], load = [], health = [];
    let hScore = 92;
    for (let i = 0; i < points; i++) {
      const time = new Date(this.baseTime + i * (3600 * 1000 / points));
      labels.push(time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
      temp.push(+(21 + Math.sin(i / 3) * 3 + Math.random() * 2).toFixed(1));
      hum.push(+(54 + Math.cos(i / 4) * 10 + Math.random() * 4).toFixed(1));
      vib.push(+(2.5 + Math.sin(i / 5) * 1.3 + Math.random() * 0.8).toFixed(2));
      load.push(+(315 + Math.sin(i / 6) * 45 + Math.random() * 25).toFixed(1));
      hScore = Math.max(60, Math.min(99, hScore + (Math.random() - 0.45) * 2));
      health.push(+hScore.toFixed(1));
    }
    return { labels, temp, hum, vib, load, health };
  },

  /** Generate anomaly list */
  generateAnomalies() {
    return [
      {
        id: "AN-001",
        type: "Vibration Spike",
        sensor: "Vibration Sensor VS-02",
        timestamp: "2026-09-18 09:42:11",
        severity: "high",
        action: "Inspect bearing assembly and tighten loose bolts on span 2.",
      },
      {
        id: "AN-002",
        type: "Temperature Deviation",
        sensor: "Temperature Sensor TS-01",
        timestamp: "2026-09-18 08:15:33",
        severity: "medium",
        action: "Verify sensor calibration and check ambient weather conditions.",
      },
      {
        id: "AN-003",
        type: "Load Variation",
        sensor: "Load Cell LC-03",
        timestamp: "2026-09-17 22:03:50",
        severity: "medium",
        action: "Review traffic logs and confirm load cell mounting integrity.",
      },
      {
        id: "AN-004",
        type: "Humidity Rise",
        sensor: "Humidity Sensor HS-01",
        timestamp: "2026-09-17 14:28:09",
        severity: "low",
        action: "Monitor for corrosion risk; no immediate action required.",
      },
    ];
  },

  /** Generate alerts list */
  generateAlerts() {
    const types = ["Vibration", "Temperature", "Load", "Humidity", "Acceleration"];
    const sensors = ["VS-02", "TS-01", "LC-03", "HS-01", "AS-01"];
    const severities = ["low", "medium", "high"];
    const statuses = ["active", "acknowledged", "resolved"];
    const list = [];
    for (let i = 1; i <= 14; i++) {
      const sev = severities[Math.floor(Math.random() * severities.length)];
      list.push({
        id: "ALT-" + String(1000 + i),
        sensor: sensors[i % sensors.length],
        type: types[i % types.length],
        severity: sev,
        value: (Math.random() * 100).toFixed(2),
        timestamp: new Date(Date.now() - i * 3600 * 1000 * 2).toLocaleString("en-US"),
        status: statuses[Math.floor(Math.random() * statuses.length)],
      });
    }
    return list;
  },
};
