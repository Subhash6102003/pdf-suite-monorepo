# PDF Suite: Enterprise Distributed Document SaaS Monorepo

> **PDF Suite** is an enterprise-grade, distributed document processing SaaS platform built as a high-performance monorepo. It features client-side WASM processing, high-throughput asynchronous job workers, cross-platform mobile support (iOS/Android), and complete database schema orchestration.

[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-ef4444?logo=turborepo)]()
[![Next.js 15](https://img.shields.io/badge/Next.js-15%20(React%2019)-000000?logo=next.js)]()
[![Flutter](https://img.shields.io/badge/Flutter-iOS%20%26%20Android-02569B?logo=flutter)]()
[![Fastify](https://img.shields.io/badge/Fastify-5.x%20API-000000?logo=fastify)]()
[![BullMQ](https://img.shields.io/badge/BullMQ-Redis%20Queues-CC0000?logo=redis)]()
[![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?logo=prisma)]()
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)]()

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Clients [Client Layer]
        Web["Next.js 15 Web Application\n(App Router, Tailwind CSS, Client WASM)"]
        Mobile["Flutter Mobile App\n(iOS & Android, Riverpod, GoRouter, Fastlane)"]
    end

    subgraph Gateway [API Layer]
        API["Fastify High-Throughput REST Gateway\n(OpenAPI 3.0, Rate Limiting, Bearer Auth, Zod Validation)"]
    end

    subgraph Queue [Distributed Job Bus]
        Redis[("Redis Cluster / BullMQ Message Broker")]
    end

    subgraph Workers [Asynchronous Processing Engines]
        QPDFWorker["QPDF Engine\n(Lossless Split & Merge)"]
        SharpWorker["Sharp Engine\n(Lossless JPG to PDF Pipeline)"]
        PyWorker["Python / LibreOffice Worker\n(High-Fidelity PDF to Word Conversion)"]
        CleanWorker["Cleanup Cron Worker\n(TTL Retention & Orphan Purging)"]
    end

    subgraph Infrastructure [Data & Persistence]
        DB[("PostgreSQL 16\n(Prisma ORM, Entitlements, Job State)")]
        Storage[("MinIO / AWS S3 Object Storage\n(Encrypted Blobs & Signed URLs)")]
    end

    Web -->|Direct In-Browser or Upload| API
    Mobile -->|Chunked Upload / Polling| API
    API -->|Persist Job Metadata| DB
    API -->|Dispatch Job Events| Redis
    Redis -->|Process Job Queues| Workers
    Workers -->|Store Output Artifacts| Storage
    Workers -->|Update Job State| DB
```

---

## 📂 Monorepo Structure

```
money/
├── apps/
│   ├── web/                     # Next.js 15 (React 19) web application
│   │   ├── src/app/             # App router pages (Compress, Split, Merge, PDF-to-Word, JPG-to-PDF)
│   │   ├── src/components/      # Reusable upload dropzones, stage indicators, job pollers
│   │   └── src/lib/pdf/         # Client-side WASM processing engines with API fallbacks
│   └── mobile/                  # Flutter mobile client (iOS / Android)
│       ├── lib/core/            # Network interceptors, secure storage, SQLite queue, router
│       ├── lib/features/        # Domain, application, and presentation layers (Riverpod)
│       └── fastlane/            # Automated App Store & Play Store deployment pipelines
├── services/
│   ├── api/                     # Fastify 5.x REST API service
│   │   ├── src/routes/v1/       # Versioned API routes for PDF conversion, compression, streaming downloads
│   │   ├── src/plugins/         # Rate limiting, CORS, Bearer auth, multipart upload handlers
│   │   └── openapi.yaml         # Complete OpenAPI 3.0 specification
│   └── workers/                 # Distributed BullMQ processing workers
│       ├── src/workers/         # Compress, Split, Merge, PDF-to-Word, JPG-to-PDF, Cleanup
│       ├── src/processing/      # QPDF, Sharp, and Python LibreOffice bindings
│       └── docker/              # Multi-stage production container images
├── packages/
│   ├── pdf-core/                # Shared document manipulation primitives
│   └── shared-types/            # Canonical TypeScript contracts shared across Web & API
├── infra/
│   └── prisma/                  # Prisma schema, migrations, and database seed fixtures
├── turbo.json                   # Turborepo build pipeline configuration
└── pnpm-workspace.yaml          # Monorepo workspace boundaries
```

---

## ⚡ Key Features

1. **Dual Execution Engine (Client WASM + Cloud Workers)**:
   - Small files (<15 MB) can process directly in the client's browser using WebAssembly / `pdf-lib` for zero latency and zero server compute cost.
   - Heavy files and advanced conversions (e.g. PDF to Word using LibreOffice) are seamlessly dispatched to asynchronous worker queues via signed URLs.
2. **Institutional Grade Architecture**:
   - **Fault-Tolerant Worker Pipelines**: Powered by BullMQ with exponential backoff, dead-letter queues, and automatic cleanup.
   - **Enterprise Security**: Multipart chunk validation, rate-limiting plugins, tokenized one-time download URLs, and isolated ephemeral storage.
   - **Cross-Platform Parity**: Full feature parity between Next.js responsive web and Flutter native mobile applications.

---

## 🛠️ Quickstart

### Prerequisites
- Node.js >= 22.0.0
- pnpm >= 10.0.0
- Docker & Docker Compose

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Start Infrastructure (PostgreSQL, Redis, MinIO)
```bash
docker compose -f services/workers/docker/docker-compose.dev.yml up -d
```

### 4. Push Database Schema
```bash
pnpm --filter infra db:push
```

### 5. Launch Full Monorepo in Development Mode
```bash
pnpm dev
```

---

## 📜 License
MIT © [Subhash](https://github.com/Subhash6102003)
