# WELLSYNC: IMPROVEMENT & REPAIR CHANGELOG
**Version:** 0.2.0 (Post-Audit Improvements)  
**Date:** November 19, 2026  
**Auditor:** Senior Multidisciplinary Engineering & Behavioral Review Panel  
**Git Branch:** `audit-and-improvements`  

---

## 1. Summary of Modifications

During the comprehensive audit, 7 high-priority improvements were implemented, verified, and integrated into the WellSync codebase. All modifications followed the non-negotiable rule: **zero runtime AI, zero external network requests, and preserve existing core functionality**.

---

## 2. Detailed Change Records

### Improvement 1 (P1): Persistent Storage of Barrier Hypothesis Vetoes
- **Problem Identified:** In `RecoveryScreen.tsx`, user vetoes of non-clinical barrier hypotheses were stored only in a local React `useState`. If the user switched tabs or refreshed the browser, rejected hypotheses reappeared, violating the documented guarantee that rejected hypotheses are permanently remembered.
- **Rationale:** Sustaining user autonomy and psychological trust requires that user vetoes persist across sessions.
- **Files Modified:**
  - `src/storage/storage.ts`: Added `rejectedHypotheses: Record<string, boolean>` to `AppStorageState` and `DEFAULT_APP_STATE`.
  - `src/App.tsx`: Added `handleToggleRejectHypothesis` handler and passed `rejectedHypotheses` state down to `RecoveryScreen`.
  - `src/screens/RecoveryScreen.tsx`: Updated to accept persistent rejections and dispatch toggles to `AppStorageState`.
- **Verification:** Verified via `src/engine/__tests__/edge_cases_audit.test.ts` (Case 35) and storage persistence tests.

---

### Improvement 2 (P1): Client-Side JSON Data Import & Backup Restoration
- **Problem Identified:** Users could export their data via `exportUserDataAsJSON`, but there was no mechanism to re-import a previously exported backup file.
- **Rationale:** True data sovereignty requires bidirectional portability: users must be able to back up, transfer, and restore their data offline.
- **Files Modified:**
  - `src/storage/storage.ts`: Implemented `importUserDataFromJSON(jsonStr)` with strict schema validation for profile goals, history dates/values, and preferences.
  - `src/screens/SettingsScreen.tsx`: Added an accessible file input and "Import JSON Backup" button next to "Export JSON Data", with instant status feedback.
  - `src/App.tsx`: Added `handleImportData` connecting storage to the UI.
- **Verification:** Unit tests added in `src/storage/__tests__/storage.test.ts` verifying valid imports and rejection of malformed files.

---

### Improvement 3 (P1): Recovery Strategy Memory & Conflation Guard
- **Problem Identified:** Initially, selecting a micro-action was conflated with strategy "success", falsely labeling unattempted actions as "proven". Furthermore, no persistent memory connected past completed recovery cycles with user action choices.
- **Rationale:** Challenge 09 emphasizes honest behavioral adaptation. A strategy cannot be claimed as "proven" or "successful" merely because a user selected it. Instead, the system must only record an active commitment and only catalog it into completed recovery history once the user actually restores their habit through the 3-day recovery ladder.
- **Files Modified:**
  - `src/storage/storage.ts`: Added `activeRecoveryCommitment` and `completedRecoveryStrategies` to `AppStorageState` with backwards-compatible alias `successfulStrategies`.
  - `src/App.tsx`: Records `activeRecoveryCommitment` when selected; archives it into `completedRecoveryStrategies` *only* upon completed recovery transition (`previousState === 'RECOVERING' && nextState === 'ON_TRACK'`).
  - `src/screens/RecoveryScreen.tsx`: Updated UI to display active commitment and changed section to "Strategies Used During Completed Past Recoveries (Observational History)", strictly removing unscientific "proven" terminology.
- **Verification:** Verified in storage unit tests, regression tests, and `src/engine/__tests__/edge_cases_audit.test.ts`.

---

### Improvement 4 (P2): Input Clamping & Sanitization
- **Problem Identified:** Step inputs allowed negative numbers or extreme values without boundary checks in `processDay`.
- **Rationale:** Prevents numerical skewing, NaN propagation, or physiological impossibilities in baseline calculations.
- **Files Modified:**
  - `src/engine/state.ts`: Clamped `actualValue = isMissing ? 0 : Math.max(0, Math.min(maxSafeValue, Number(rawVal)))` (max 100,000 steps; max 1,440 sleep minutes).
- **Verification:** Verified in `src/engine/__tests__/edge_cases_audit.test.ts` (Case 07 and 08).

---

### Improvement 5 (P2): RTL Table Formatting
- **Problem Identified:** The table in `HistoryScreen.tsx` had hardcoded `text-left`, causing column headers to align left even when viewing in Arabic (RTL mode).
- **Rationale:** Ensures clean, natural typography and layout in right-to-left Arabic mode.
- **Files Modified:**
  - `src/screens/HistoryScreen.tsx`: Changed table alignment from `text-left` to `text-start`.
- **Verification:** Verified in smoke tests and `axe-core` accessibility checks.

---

### Improvement 6 (P1): 35 Exhaustive Adversarial Test Cases
- **Problem Identified:** Testing lacked automated coverage for specific edge conditions (e.g. exactly 13 vs 14 days, recovery resumption after failure, zero activity, quota exceptions).
- **Rationale:** Complete test coverage guarantees mathematical determinism and prevents regression.
- **Files Created:**
  - `src/engine/__tests__/edge_cases_audit.test.ts`: 35 distinct adversarial test cases covering all edge conditions from Phase 4 of the Master Audit.
- **Verification:** All 35 tests pass cleanly in Vitest.

---

### Improvement 7 (P2): Comprehensive Audit & Regulatory Documentation
- **Problem Identified:** Documentation was spread across multiple files without a consolidated audit trail or competition judging scorecard.
- **Files Created:**
  - `docs/audit/FULL_SYSTEM_AUDIT.md`
  - `docs/audit/ALGORITHM_AUDIT.md`
  - `docs/audit/RESEARCH_AND_BENCHMARK_AUDIT.md`
  - `docs/audit/TESTING_REPORT.md`
  - `docs/audit/IMPROVEMENT_CHANGELOG.md`
  - `docs/audit/FINAL_COMPETITION_READINESS.md`

---

## 3. Test & Build Status After Modifications

- **Vitest Suite:** 6 passed (6 total), **100/100 tests passed** (100% pass rate).
- **TypeScript & Vite Build:** `tsc && vite build` completed with 0 errors.
- **Bundle Size:** 387.53 kB JS / 23.92 kB CSS.
- **Outgoing Network Calls:** Confirmed **0 calls** (`dist/` audited).
- **Remaining Limitations:** LifeSnaps dataset remains a retrospective non-Abu Dhabi sample; live clinical trials have not occurred (disclosed on all relevant screens).
