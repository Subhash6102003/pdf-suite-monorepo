# 📄 PDF Suite: Enterprise Distributed Document SaaS Monorepo

> **PDF Suite** is an enterprise-grade, distributed document processing SaaS platform built as a high-performance monorepo. It features client-side WASM processing, high-throughput asynchronous job workers, cross-platform mobile support (iOS/Android), and complete database schema orchestration.

[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-ef4444?logo=turborepo)]()
[![Next.js 15](https://img.shields.io/badge/Next.js-15%20(React%2019)-000000?logo=next.js)]()
[![Flutter](https://img.shields.io/badge/Flutter-iOS%20%26%20Android-02569B?logo=flutter)]()
[![Fastify](https://img.shields.io/badge/Fastify-5.x%20API-000000?logo=fastify)]()
[![BullMQ](https://img.shields.io/badge/BullMQ-Redis%20Queues-CC0000?logo=redis)]()
[![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?logo=prisma)]()
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## 🏛️ System Architecture Diagrams

### 1. High-Level Distributed Topology

```mermaid
flowchart TD
    subgraph Clients ["📱 Client Layer"]
        Web["Next.js 15 Web Application\n(App Router, Tailwind CSS, Client WASM)"]
        Mobile["Flutter Mobile App\n(iOS & Android, Riverpod, GoRouter, Fastlane)"]
    end

    subgraph Gateway ["🚪 Ingress & API Gateway"]
        API["Fastify High-Throughput REST Gateway\n(OpenAPI 3.0, Rate Limiting, Bearer Auth, Zod Validation)"]
    end

    subgraph Queue ["📨 Distributed Job Bus"]
        Redis[("Redis Cluster / BullMQ Message Broker")]
    end

    subgraph Workers ["⚙️ Asynchronous Processing Engines"]
        QPDFWorker["QPDF Engine\n(Lossless Split & Merge)"]
        SharpWorker["Sharp Engine\n(Lossless JPG to PDF Pipeline)"]
        PyWorker["Python / LibreOffice Worker\n(High-Fidelity PDF to Word Conversion)"]
        CleanWorker["Cleanup Cron Worker\n(TTL Retention & Orphan Purging)"]
    end

    subgraph Infrastructure ["💾 Data & Persistence Tier"]
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

### 2. End-to-End Asynchronous Job Lifecycle

This sequence diagram details how heavy conversions are orchestrated asynchronously across the Fastify gateway, BullMQ queue, distributed worker pool, and S3 object storage:

```mermaid
sequenceDiagram
    autonumber
    actor Client as Web / Mobile Client
    participant API as Fastify REST API
    participant DB as PostgreSQL (Prisma)
    participant Redis as BullMQ & Redis
    participant Worker as Processing Worker Pool
    participant S3 as S3 / MinIO Storage

    Client->>API: POST /api/v1/jobs (Upload file + conversion parameters)
    API->>DB: INSERT Job (status: QUEUED, metadata)
    API->>S3: Upload raw input blob
    API->>Redis: Enqueue conversion job to BullMQ
    API-->>Client: 202 Accepted { jobId: "uuid", status: "queued" }

    Note over Client,API: Client polls status or listens via SSE

    Redis->>Worker: Dispatch job payload to available worker node
    Worker->>DB: UPDATE Job (status: PROCESSING)
    Worker->>S3: Fetch source file buffer
    Worker->>Worker: Execute conversion (QPDF / Sharp / LibreOffice)
    Worker->>S3: Put processed output artifact
    Worker->>DB: UPDATE Job (status: COMPLETED, downloadToken, TTL: 24h)

    Client->>API: GET /api/v1/jobs/{jobId}
    API->>DB: Query job state
    DB-->>API: Status: COMPLETED, downloadToken: "jwt_token"
    API-->>Client: 200 OK { status: "completed", downloadToken }

    Client->>API: GET /api/v1/download/{downloadToken}
    API->>S3: Fetch processed file
    API-->>Client: Stream binary output file
```

---

### 3. Document Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle: User drops document

    state InBrowserDecision <<choice>>
    Idle --> InBrowserDecision: Size & Format check

    InBrowserDecision --> InBrowserWASM: Size < 15MB & PDF tools
    InBrowserDecision --> ServerUpload: Size >= 15MB or PDF-to-Word

    InBrowserWASM --> DownloadReady: Instant client-side render
    
    ServerUpload --> Queued: File accepted by Fastify API
    Queued --> Processing: Picked up by BullMQ worker
    Processing --> Completed: Conversion & verification pass
    Processing --> Failed: Retry budget exhausted (Dead-Letter Queue)

    Completed --> DownloadReady: Signed one-time download token generated
    DownloadReady --> Purged: 24-Hour TTL cleanup cron executes
    Failed --> Purged: Error retention period expires
    Purged --> [*]
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
