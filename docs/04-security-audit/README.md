# Security & Audit Architecture

## 🛡️ Audit Philosophy
SPOON implements **Database-Level Auditing**. Instead of relying on application logic (which can be bypassed), we use PostgreSQL Triggers to enforce immutability of audit logs.

---

## 🕵️ The Audit Schema (`audit.*`)

### 1. `audit.activity_logs`
This is the central ledger for all system changes.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique Event ID. |
| `user_id` | UUID | The actor who performed the action (from `auth.users`). |
| `action` | TEXT | `INSERT`, `UPDATE`, `DELETE`, or `LOGIN_ATTEMPT`. |
| `resource_type` | TEXT | Table name (e.g., `sales.orders`, `menu.products`). |
| `resource_id` | UUID | ID of the affected record. |
| `old_values` | JSONB | Snapshot of record **BEFORE** change (for Diffing). |
| `new_values` | JSONB | Snapshot of record **AFTER** change. |
| `created_at` | TIMESTAMP | Auto-generated server time. |

### 2. Automatic Triggers
We use a PL/pgSQL function `audit_trigger_function()` attached to every critical table.

**Example Trigger Definition:**
```sql
CREATE TRIGGER audit_products_changes
AFTER INSERT OR UPDATE OR DELETE ON menu.products
FOR EACH ROW EXECUTE FUNCTION audit.audit_trigger_function();
```
**Benefit**: Even if a DBA modifies data directly via SQL console, the action is logged.

---

## 🔐 Sensitive Data Protection

### PII (Personally Identifiable Information)
*   **Users**: `email`, `phone`, `first_name` are plain text but access is restricted to `admin` roles.
*   **Passwords**: NEVER stored plain text. Hashed using `bcrypt` (Salt rounds = 10).

### RBAC (Role-Based Access Control)
Authorization is enforced at two layers:
1.  **Application Layer** (Next.js Middleware): Checks JWT `role` claim.
    *   `admin`: Full access.
    *   `manager`: Can edit Menu, view Sales. Cannot delete history.
    *   `waiter`: Can only Create Orders.
2.  **Database Layer** (Row Level Security - Future Scope): Ensuring tenant isolation so Restaurant A cannot read Restaurant B data.

---

## 🚨 Incident Response
In case of data tampering suspicion:
1.  Query the `audit.activity_logs`:
    ```sql
    SELECT * FROM audit.activity_logs 
    WHERE resource_type = 'menu.product_stock' 
    AND action = 'UPDATE' 
    ORDER BY created_at DESC;
    ```
2.  Identify the `user_id` responsible.
3.  Revert changes using `old_values` (JSONB) as the source of truth.
