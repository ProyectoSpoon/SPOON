# Service Deep Dive: Menu Service & Management

> ⚠️ **Architecture Note**: Currently, the logic for Menu Management operates within the Next.js Monolith (`src/app/api/menu-dia/` & `src/app/api/productos/`). The standalone `menu-service` container is provisioned as a skeletal stub for future extraction.

## 🧠 Core Responsibility
Manages the entire lifecycle of the "Menu del Día", including product definition, categorization, daily menu assembly, and publication.

> 📘 **Frontend Documentation**: See [Frontend Architecture](./FRONTEND_ARCHITECTURE.md) for UI components and state management details.

## 📍 Key Endpoints (Monolith)
These endpoints reside in the Next.js API (`src/app/api/`):

### Products & Inventory
*   `GET /api/productos`: List global product catalog.
*   `POST /api/productos`: Create new product (with stock definitions).
*   `GET /api/categorias`: Fetch taxonomy (Entradas, Principios, Proteínas, etc.).

### Daily Menu Logic
*   `GET /api/menu-dia`: Fetch current active menu structure.
*   `POST /api/menu-dia/publicar`: **CRITICAL**.
    *   **Logic**:
        1. Validates UUIDs against `system.products`.
        2. Generates Combinations (`Protein` + `Principle` + `Entry` logic).
        3. Archives previous menus (sets `is_active = false`).
        4. Writes `published` record to `menu.daily_menus`.
        5. **PENDING**: Emits a real-time notification (WebSockets) to listening apps.

## 💾 Data Model Interaction
Interacts primarily with the `menu` schema in PostgreSQL:
*   `menu.products`: Master catalog.
*   `menu.product_stock`: Real-time inventory.
*   `menu.daily_menus`: Header for daily records.
*   `menu.menu_combinations`: Flattened combinations for Sales/Waiter App consumption.

## 🚀 Migration Path to Microservice
To activate the standalone `menu-service`:
1.  Migrate `src/app/api/menu-dia` logic to `menu-service/src/controllers`.
2.  Update Nginx to route `/api/menu-service/*` to container `spoon_menu_service:3001`.
3.  Refactor `Next.js` frontend to call the internal microservice instead of local API routes.
