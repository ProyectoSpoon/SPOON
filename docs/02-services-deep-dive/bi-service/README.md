# Service Deep Dive: BI (Business Intelligence) Service

> ⚠️ **Architecture Note**: Reporting logic is currently embedded in `src/app/api/analytics/` and `src/app/api/metrics/`. The `bi-service` container is a placeholder.

## 🧠 Core Responsibility
Aggregates raw transactional data into actionable insights for the Restaurant Owner: Sales trends, Product performance, and Peak hour analysis.

## 📍 Key Endpoints (Monolith)
Located in `src/app/api/analytics/`:

*   `GET /api/analytics/dashboard`: High-level cards (Total Sales today, Active Orders).
*   `GET /api/analytics/sales-trend`: Time-series data for charts (Hourly/Daily sales).
*   `GET /api/analytics/top-products`: Aggregation of most sold items.

## 💾 Data Access Strategy
*   **Read-Only**: This service (conceptually) never writes to the database.
*   **Heavy Queries**: Performs `GROUP BY`, `COUNT`, and `SUM` operations over the `sales` schema.
*   **Views**: Relies on optimized SQL Views (e.g., `sales_dashboard_view` defined in `structureSQL.md`) to offload complexity from the Node.js layer.

## 📊 Observability Integration
The BI layer works closely with the **Grafana** stack:
*   Operational metrics (CPU/RAM) are tracked in Grafana.
*   Business metrics (Sales $) are currently calculated via SQL on demand, but could be pushed to Prometheus (Pushgateway) for real-time dashboards in the future.
