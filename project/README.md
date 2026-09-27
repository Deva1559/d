# Bridge Infrastructure Health Monitoring Dashboard

A professional AI-powered bridge structural health monitoring dashboard built with pure HTML5, CSS3, vanilla JavaScript, and Chart.js. Designed for integration with a Spring Boot backend receiving ESP32 sensor data.

## Tech Stack
- HTML5 (semantic markup)
- CSS3 (glassmorphism, responsive grid, animations)
- Vanilla JavaScript (no frameworks)
- Chart.js 4.x (interactive graphs)
- Font Awesome 6.x (icons)

## File Structure
```
index.html          - Overview Dashboard
monitoring.html     - Live Monitoring
analytics.html      - Sensor Analytics + AI Anomaly Detection
alerts.html         - Alerts & Notifications
maintenance.html    - Predictive Maintenance
history.html        - Sensor History
settings.html       - System Settings

css/
  style.css         - Main styles
  responsive.css    - Responsive breakpoints

js/
  app.js            - Sidebar, header, shared utilities
  dashboard.js      - Overview & live monitoring logic
  charts.js         - Chart.js chart creation utilities
  api.js            - Spring Boot API integration + demo data
  alerts.js         - Alerts table, filtering, anomaly panel
  maintenance.js    - Predictive maintenance page logic

assets/
  icons/            - Icon assets folder
```

## Running
Open `index.html` in a browser, or use VS Code Live Server.

## Backend Integration
The frontend calls the Spring Boot API at `http://localhost:8081`:
- `GET /api/sensors/latest`
- `GET /api/sensors/history`
- `POST /api/sensors/readings`

When the backend is unreachable, the dashboard automatically falls back to clearly-labeled DEMO DATA and shows an Offline status. Auto-refresh runs every 5 seconds.

All API logic is isolated in `js/api.js`. No credentials are exposed in frontend files.
