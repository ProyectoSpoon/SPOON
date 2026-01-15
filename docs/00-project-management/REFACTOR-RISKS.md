# Refactoring Risk Analysis

## 🚨 Critical Risk: `horario-comercial` (Legacy Debt)
*   **Size**: 554 Lines (Monolithic).
*   **State**: "In Progress" but marked as High Risk.
*   **Danger Logic**: 
    - Likely contains deeply nested "Zombie Logic" (Legacy checks) mixed with UI code.
    - **Risk of Regression**: High. Changing the schedule logic could silently break:
        1.  Restaurant "Open/Close" status.
        2.  Order acceptance validation.
*   **Mitigation Strategy**:
    1.  **Freeze**: Do not refactor until Unit Tests for "Is Open now?" logic are verified.
    2.  **Strangler Fig**: Extract logic into `useHorarios.ts` alongside existing code, switch over incrementally.

## 📱 Mobile App Synchronicity (The New SPOF)
*   **Old Architecture**: Legacy NoSQL System (Real-time Push).
*   **New Architecture**: Polling / SSE (Server-Sent Events) via Postgres.
*   **The Risk**:
    - If the "Polling" interval is too long (> 30s), a waiter might place an order for an item that just went out of stock.
    - **Impact**: Operational chaos (Waiter has to go back to table to apologize).
*   **Mitigation**:
    - Implement **Optimistic UI** in apps (Assume success, rollback on error).
    - Prioritize **WebSockets** implementation for `ventas-service` notifications.

## 📉 Debt Accumulation
If we only clean "easy" pages, the technical debt will concentrate in the complex ones (`horario-comercial`, `estadisticas`), creating "Refactoring Deserts" that no developer wants to touch.
**Rule**: For every 2 "Easy" pages refactored, 1 "Hard" page must be tackled.
