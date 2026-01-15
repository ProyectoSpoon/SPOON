# Deferred Monitoring & Observability

> **Creation Date**: 2026-01-12
> **Decision**: PURGE
> **Reason**: Resource Optimization for Development

## 🛑 Status: DEFERRED

Use this document to restore the monitoring stack when the project reaches **Phase Beta (50% Completion)** or Production Readiness.
Until then, all resources are prioritized for the Core Datastore (PostgreSQL) and Logic (Node/Next.js).

## 📉 Cost Analysis at Deletion
At the time of deletion (Project Progress: 4.3%), the monitoring stack was consuming approximately **1.2GB of RAM** with zero ROI for the current development phase.

| Service | Approx RAM | Utility (Dev) |
|:---|:---:|:---:|
| **Prometheus** | ~512 MB | Low |
| **Grafana** | ~256 MB | None |
| **cAdvisor** | ~200 MB | Low |
| **Exporters** | ~150 MB | Low |
| **TOTAL SAVED** | **~1.1 GB** | **HIGH** |

## 📦 Restoration Manifest

To restore the stack, you must:
1.  Re-add the `monitoring` network to `docker-compose.yml`.
2.  Restore the `prometheus` service + `postgres-exporter`, `redis-exporter`, `node-exporter`.
3.  Restore `grafana` service.
4.  Re-create configuration folders:
    *   `./prometheus/prometheus.yml`
    *   `./prometheus/alert.rules`
    *   `./grafana/provisioning/`

**Note**: Refer to the Git history prior to 2026-01-12 for the exact configuration files.
