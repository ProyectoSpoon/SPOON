# System Dependencies & Fault Analysis

## 🕸️ Dependency Graph & Fault Mapping

### Critical Dependencies
| Component | Depends On | Failure Scenario | Impact | Recovery |
| :--- | :--- | :--- | :--- | :--- |
| **Next.js (Dashboard)** | **PostgreSQL** | Database Connection Timeout / Down | **CRITICAL**: User cannot login, view dashboard, or save changes. App renders 500 pages. | Retry logic (5x), Circuit Breaker on DB client. |
| **Next.js (Dashboard)** | **Redis** | Connection Refused | **HIGH**: Session checks fail (logout), Menu caching disabled (slow loading). | Fallback to DB query for Menu. Re-login required. |

| **Ventas Service** | **PostgreSQL** | Lock Contention / Latency | **HIGH**: Orders pending processing. Potential timeouts at POS. | Async processing queue. |

---

## 🌊 Critical Data Flows

### 1. The "Menu Publication" Flow
*(From Restaurant Admin to Consumer App)*
1.  **Trigger**: Admin clicks "Publish Menu" in Next.js Dashboard.
2.  **Validations**: Next.js verifies UUIDs and business rules against `system.products`.
3.  **Persistence**: Next.js writes to `menu.daily_menus` and `menu.menu_combinations` (Postgres).
4.  **Notification**: Current implementation relies on polling. (Future: WebSockets/Server-Sent Events).
5.  **Consumption**: Mobile Apps query the API which serves data directly from PostgreSQL (or Redis cache if hot).


### 2. The "Order Placement" Flow
*(From Waiter App to Dashboard)*
1.  **Ingestion**: Waiter App POSTs to Nginx `/api/ventas/orders`.
2.  **Processing**: `ventas-service` validates stock against `menu.product_stock`.
3.  **Transaction**:
    *   `BEGIN` Transaction.
    *   Insert `sales.orders`.
    *   Update `menu.product_stock` (Decrement).
    *   `COMMIT`.
4.  **Notification**: `ventas-service` emits socket event / Redis PubSub.
5.  **Visualization**: Next.js Dashboard receives event and auto-refreshes "Active Orders" view.

---

## ⚠️ Single Points of Failure (SPOF)

### 1. PostgreSQL ( The Heart)
*   **Risk**: If Postgres goes down, **100% of the write operations stop**. The system becomes read-only (cached data) or completely unusable (Auth).
*   **Mitigation**: 
    *   Regular backups (Scripts in `root`).
    *   Replica configuration (Future scope).

### 2. Nginx Gateway
*   **Risk**: If Nginx container halts, no external traffic reaches any service.
*   **Mitigation**: Docker Compose `restart: unless-stopped` policy.

### 3. Redis (Performance SPOF)
*   **Risk**: Loss of Redis degrades performance by estimated 40-60% on high load, as every menu fetch hits Postgres directly.
*   **Mitigation**: Application-level fallback to SQL.

---

## 🛡️ Resilience Strategies
*   **Graceful Degradation**: If `bi-service` is down, the Dashboard works but "Statistics" tab shows "Data Unavailable" (Non-blocking).
*   **Async Processing**: Heavy operations should be queued to prevent blocking the UI.
