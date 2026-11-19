# WellSync Security, Privacy & Data Governance Architecture

## 1. Core Architectural Tenet: Privacy by Default

WellSync is engineered as a **local-first** application.
- All baseline calculations, ladder target calibrations, context adaptations, and state transitions execute entirely inside the client browser or device using pure deterministic arithmetic.
- The application functions with 100% feature parity when completely disconnected from the network or when the optional pilot backend is offline.

---

## 2. Pseudonymous Identifier Architecture & Zero PII Policy

The optional pilot sync layer (`/server`) enforces strict zero-PII ingress:

1. **No Personal Identifiers Permitted**:
   - The participant ingestion endpoint (`POST /v1/participants`) strictly rejects email addresses (`@`), phone numbers, or national identification numbers via input validation regex: `^[a-zA-Z0-9_\-]+$`.
   - Participants are identified exclusively through client-generated pseudonymous tokens (e.g. `pseudo_tariq_ad2026`).
2. **Explicit Informed Consent (`POST /v1/consent`)**:
   - Syncing requires active, unbundled user opt-in detailing the specific research purposes (e.g., `habit_research`, `shift_health`).
   - Consent records log version number and ISO 8601 UTC timestamps.
3. **Zero AI / Zero LLM Ingestion**:
   - No user telemetry, checkin values, sleep durations, or journal entries are ever transmitted to external commercial LLM APIs or third-party cloud analytics.

---

## 3. Data Subject Rights & Irreversible Deletion (Cascade Hard Delete)

Under UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection (PDPL) and international privacy frameworks (GDPR):

1. **Right to Data Portability (`GET /v1/export`)**:
   - Participants can export their full longitudinal dataset (consents, daily checkins, computed engine states) in machine-readable JSON at any time.
2. **Right to Erasure (`DELETE /v1/participants/:id`)**:
   - The pilot backend enforces SQLite foreign key cascade deletion (`PRAGMA foreign_keys = ON`).
   - Deleting a participant immediately and permanently purges all records across `participants`, `consents`, `checkins`, and `engine_states`.
   - Verified via automated integration tests (`server/src/__tests__/server.integration.test.ts`).

---

## 4. Cohort Privacy: k-Anonymity Guardrails

To prevent indirect re-identification through small subgroup query attacks:
- The aggregated research endpoint (`GET /v1/pilot/aggregate`) implements a strict privacy cutoff: **$n \ge 10$**.
- If active cohort size is below 10 participants, the endpoint suppresses all summary statistics and returns `{ suppressed: true, reason: "Cohort size below privacy threshold (n < 10)" }`.
- No individual-level rows or unmasked outlier microdata are ever exposed in public or aggregate endpoints.

---

## 5. Non-Functional Security Controls

- **Security Headers**: Fastify Helmet is applied to configure HTTP security headers (X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security).
- **Rate Limiting**: Built-in `@fastify/rate-limit` prevents brute-force scraping and DoS (100 requests per minute per IP).
- **CORS Restrictiveness**: Cross-Origin Resource Sharing is controlled and restricted to authorized pilot frontend origins.
- **Sanitized Logging**: Server logs record operational status codes and timestamps without dumping payload parameters or sensor telemetry.
