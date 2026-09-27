/* ============================================================
   app.js - Core application: sidebar, header, shared utilities
   ============================================================ */

const App = {
  init() {
    this.initSidebar();
    this.initMobileMenu();
    this.updateTimestamp();
    setInterval(() => this.updateTimestamp(), 1000);
    this.highlightNav();
  },

  /* Sidebar collapse (desktop) */
  initSidebar() {
    const toggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    if (!toggle || !sidebar) return;
    toggle.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle("mobile-open");
        this.toggleBackdrop();
      } else {
        sidebar.classList.toggle("collapsed");
      }
    });
  },

  /* Mobile backdrop */
  toggleBackdrop() {
    let backdrop = document.querySelector(".backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "backdrop";
      document.body.appendChild(backdrop);
      backdrop.addEventListener("click", () => {
        document.getElementById("sidebar")?.classList.remove("mobile-open");
        backdrop.classList.remove("show");
      });
    }
    backdrop.classList.toggle("show");
  },

  initMobileMenu() {
    // Close sidebar on navigation (mobile)
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          const sb = document.getElementById("sidebar");
          if (sb) sb.classList.remove("mobile-open");
          document.querySelector(".backdrop")?.classList.remove("show");
        }
      });
    });
  },

  /* Highlight current page in nav */
  highlightNav() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-item").forEach((item) => {
      const href = item.getAttribute("href");
      if (href === path) item.classList.add("active");
    });
  },

  /* Online/offline status pill */
  setOnlineStatus(isOnline) {
    const pill = document.getElementById("systemStatus");
    if (!pill) return;
    if (isOnline) {
      pill.classList.remove("offline");
      pill.querySelector(".status-text").textContent = "Online";
    } else {
      pill.classList.add("offline");
      pill.querySelector(".status-text").textContent = "Offline";
    }
  },

  /* Last updated timestamp */
  updateTimestamp() {
    const el = document.getElementById("lastUpdated");
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleTimeString("en-US");
  },

  /* Toast notification */
  toast(message, type = "info") {
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.textContent = message;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 300);
    }, 3500);
  },
};

/* Shared nav injection so every page has the same sidebar + header */
const Layout = {
  navItems: [
    { href: "index.html", icon: "fa-gauge-high", label: "Overview Dashboard" },
    { href: "monitoring.html", icon: "fa-satellite-dish", label: "Live Monitoring" },
    { href: "analytics.html", icon: "fa-chart-line", label: "Sensor Analytics" },
    { href: "analytics.html#anomaly", icon: "fa-brain", label: "AI Anomaly Detection" },
    { href: "maintenance.html", icon: "fa-screwdriver-wrench", label: "Predictive Maintenance" },
    { href: "alerts.html", icon: "fa-bell", label: "Alerts & Notifications" },
    { href: "history.html", icon: "fa-clock-rotate-left", label: "Sensor History" },
    { href: "settings.html", icon: "fa-gear", label: "System Settings" },
  ],

  render(pageTitle) {
    this.renderSidebar();
    this.renderHeader(pageTitle);
    App.init();
  },

  renderSidebar() {
    const navHtml = this.navItems
      .map(
        (n) => `
      <a href="${n.href}" class="nav-item">
        <i class="fa-solid ${n.icon}"></i>
        <span class="nav-label">${n.label}</span>
      </a>`
      )
      .join("");

    const sb = document.getElementById("sidebar");
    if (sb) {
      sb.innerHTML = `
        <div class="sidebar-logo">
          <div class="logo-icon"><i class="fa-solid fa-bridge"></i></div>
          <div class="logo-text">BridgeMonitor<span>Infrastructure Health</span></div>
        </div>
        <nav class="nav-section">
          <div class="nav-section-title">Main</div>
          ${navHtml}
        </nav>`;
    }
  },

  renderHeader(title) {
    const h = document.getElementById("header");
    if (h) {
      h.innerHTML = `
        <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu">
          <i class="fa-solid fa-bars"></i>
        </button>
        <div class="header-title">${title} <span class="bridge-id">| BRG-001</span></div>
        <div class="header-spacer"></div>
        <div class="last-updated">Last updated: <span id="lastUpdated">--:--:--</span></div>
        <div class="status-pill" id="systemStatus">
          <span class="status-dot"></span>
          <span class="status-text">Offline</span>
        </div>
        <button class="header-icon-btn" aria-label="Notifications">
          <i class="fa-solid fa-bell"></i>
          <span class="badge">5</span>
        </button>
        <div class="profile">
          <div class="avatar">EN</div>
          <div>
            <div class="name">Engineer</div>
            <div class="role">Structural Analyst</div>
          </div>
        </div>`;
    }
  },
};

document.addEventListener("DOMContentLoaded", () => {
  // Layout.render is called by each page with its own title
});
