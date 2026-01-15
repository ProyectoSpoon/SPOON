# Service Deep Dive: Ventas (Sales) Service

> ⚠️ **Architecture Note**: The Sales logic currently resides in `src/app/api/orders/` (Next.js Monolith). The `ventas-service` container referenced in `docker-compose.yml` is currently missing/stubbed.

## 🧠 Core Responsibility
Handles the transactional core of the restaurant: Order ingestion, state management (Pending -> Cooking -> Served -> Paid), and stock deduction.

## 📍 Key Endpoints (Monolith)
Located in `src/app/api/orders/`:

*   `POST /api/orders`: **Order Ingestion**.
    *   Receives `items` (Combination IDs or Product IDs).
    *   **Transaction**: Validates availability -> Creates Order -> Deducts Stock.
*   `GET /api/orders`: List active orders for Kitchen/POS view.
*   `PATCH /api/orders/{id}/status`: Transition states (e.g., `pending` -> `preparing`).

## 💾 Data Flow & Integrity
*   **Write Heavy**: High concurrency expected during lunch hours (12:00 PM - 2:00 PM).
*   **ACID Compliance**: Uses PostgreSQL Transactions (`BEGIN`...`COMMIT`) to ensure stock is never negative.
*   **Tables**:
    *   `sales.orders`: Header (Customer info, Table #, Total).
    *   `sales.order_items`: Line items (with modifiers/notes).

## 🚨 Critical Dependencies
*   **Menu Availability**: Must query `menu.menu_combinations` to validate price and availability before accepting an order.
*   **Real-time Updates**: Currently uses polling or lightweight Sockets (if implemented) to refresh the Kitchen Display System (KDS).

## 🚀 Future Roadmap
The `ventas-service` should eventually decouple to handle:
1.  Websockets for real-time Kitchen updates (replacing polling).
2.  Queue-based stock processing to handle high load.
3.  Offline-first synchronization for Mobile POS.
