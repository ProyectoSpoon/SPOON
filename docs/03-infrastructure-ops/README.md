# Infrastructure & Operations Guide

## 🐳 The Stack (Docker Swarm / Compose)
SPOON runs entirely containerized. The orchestration is handled via `docker-compose.yml` (for Dev/Staging) or Docker Swarm (Production).

### Service Mesh
*   **Gateway**: `nginx` (Port 80/443). Terminates SSL and routes traffic.
*   **App**: `nextjs` (Port 3000).
*   **Backing Services**: `postgres:14`, `redis:6`.
*   **Observability**: `prometheus`, `grafana`, `cadvisor`, `node-exporter`.

---

## 🔭 Observability Stack

### Prometheus (Metrics Collection)
*   **Scraping Targets**:
    *   `nextjs`: `/api/metrics` (Custom business metrics).
    *   `postgres-exporter`: DB internals (connections, cache hit ratio).
    *   `redis-exporter`: Cache performance.
    *   `node-exporter`: Host hardware stats (CPU, RAM).
*   **Retention**: Configured for 30 days (`--storage.tsdb.retention.time=30d`).

### Grafana (Visualization)
*   **Port**: `3100`.
*   **Default Creds**: `admin` / (See `secrets/grafana_admin_password.txt`).
*   **Standard Dashboards**:
    *   **SPOON Health**: Request latency, Error rates (5xx), Active Users.
    *   **Database Vitality**: Lock contention, Transaction rate.

---

## 🛠️ Operational Playbooks

### 1. Database Migration
To apply new schema changes:
```bash
# Enter the Postgres container
docker exec -it spoon_postgres psql -U spoon_admin -d spoon

# Run migration file
\i /docker-entrypoint-initdb.d/migrations/001_new_feature.sql
```

### 2. Viewing Logs
Centralized logging is not yet implemented (e.g., ELK), so we rely on Docker logs:
```bash
# Tail logs for a specific service
docker-compose logs -f --tail=100 ventas-service

# Check Nginx access logs (Traffic analysis)
docker-compose logs -f nginx
```

### 3. Scaling Strategy
*   **Stateless Services** (`menu-service`, `ventas-service`): Can be scaled horizontally.
    ```bash
    docker-compose up -d --scale menu-service=3
    ```
*   **Stateful Services**:
    *   **Postgres**: Vertical scaling (increase RAM/CPU) or configured Read Replicas.
    *   **Redis**: Cluster mode (future scope).

---

## ⚠️ Infrastructure Risks (Current Audit)
Based on `docker-compose.yml` analysis:

### 1. Unbounded Resources
**Risk**: No `deploy.resources.limits` set for any container.
*   **Impact**: A memory leak in `nextjs` or a heavy query in `postgres` could consume 100% of host RAM, crashing the entire server.
*   **Mitigation**: Define strict memory/cpu limits (e.g., Next.js limit 1GB RAM).

### 2. Log Rotation
**Risk**: Default Docker logging driver is used without rotation policies.
*   **Impact**: Docker log files (`/var/lib/docker/containers/...`) can fill the disk over time, causing `No space left on device`.
*   **Mitigation**: Configure `json-file` driver with `max-size: "10m"` and `max-file: "3"`.

### 3. Postgres Tuning
**Risk**: Using default `postgres:14-alpine` config.
*   **Impact**: Default `shared_buffers` is very low (128MB). Suboptimal for production loads.
*   **Mitigation**: Mount a custom `postgresql.conf` optimized for the host hardware.
