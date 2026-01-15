# PostgreSQL Optimization & Shielding Plan

## 🛡️ Resource Limits (Docker Shielding)
To prevent the "Unbounded Resources" risk identified in the audit, apply these limits in `docker-compose.yml` or Swarm definitions:

### PostgreSQL Container
*   **Memory Limit**: `512MB` (Soft) / `1GB` (Hard).
    *   *Rationale*: Prevents OOM Killer from taking down the host if a bad query runs wild.
*   **CPU Limit**: `1.0` CPUS.
    *   *Rationale*: Ensures DB maintenance tasks don't starve the Node.js apps.

### Log Rotation Policy
Prevent disk saturation (`/var/lib/docker` exhaustion):
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## ⚙️ Postgres Tuning (Production)
For a standard instance (assumed 2GB-4GB RAM Host), override `postgresql.conf`:

| Parameter | Value | Reason |
| :--- | :--- | :--- |
| `shared_buffers` | `256MB` | ~25% of dedicated RAM. Default (128MB) is too low. |
| `effective_cache_size` | `768MB` | Hints the OS file cache size to the query planner. |
| `work_mem` | `4MB` | Per-operation memory. Keep low to prevent connection spikes from OOMing. |
| `maintenance_work_mem` | `64MB` | Speeds up VACUUM and index creation. |
| `wal_level` | `replica` | Required for future read-replicas or PITR backup tools (Wal-G). |

## 🚀 Connection Pooling
*   **Current State**: `pg` pool in Node.js (Size: 50).
*   **Recommendation**: Implement **PgBouncer** in front of Postgres if concurrent connections exceed 100. Node.js pools are efficient, but scale linearly with container count.
