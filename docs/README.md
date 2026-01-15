# SPOON Engineering Documentation

Welcome to the SPOON technical documentation hub. This documentation is organized following the [Diátaxis](https://diataxis.fr/) framework.

> 📊 **Refactoring Progress**: 4.3% Complete | **Goal**: 70% Code Reduction
> **Recent Success**: `menu-dia` page reduced by 79%.

## 📚 Navigation Guide

### [01. Core Architecture](/docs/01-core-architecture)
**"Understanding the System"**
*   [System Overview](/docs/01-core-architecture/SYSTEM-OVERVIEW.md): Next.js Monolith + Microservices Hybrid.
*   [Dependencies & Faults](/docs/01-core-architecture/DEPENDENCIES.md): How data flows and what happens when things break.
*   [Database Structure](/docs/01-core-architecture/estructuraSQL.md): The PostgreSQL Schema blueprint.

### [02. Services Deep Dive](/docs/02-services-deep-dive)
**"Component Reference"**
*   [Menu Service](/docs/02-services-deep-dive/menu-service): Product catalog & Daily menu logic.
*   [Ventas Service](/docs/02-services-deep-dive/ventas-service): Order processing transactions.
*   [BI Service](/docs/02-services-deep-dive/bi-service): Analytics and reporting.

### [03. Infrastructure & Ops](/docs/03-infrastructure-ops)
**"Running the System"**
*   [Stack Overview](/docs/03-infrastructure-ops/README.md): Docker, Nginx, Prometheus, Grafana.
*   [Docker Analysis](/docs/03-infrastructure-ops/docker-compose-analysis.md): Deep dive into container orchestration.

### [04. Security Audit](/docs/04-security-audit)
**"Protecting Data"**
*   [Audit Protocols](/docs/04-security-audit/README.md): How we track changes (PII & Transactions).


