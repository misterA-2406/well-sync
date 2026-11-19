# WellSync Limitations & Risk Analysis

## 1. Project & Team Status
- **Competition Context**: Prototype engineered for the **Future Health Digital Innovation Challenge 2026 (Abu Dhabi)**, Challenge 09: *Sustaining Healthy Behaviors*.
- **Student Status & Authors**: Developed entirely by undergraduate university students **Ayesha Sutana** and **B. Alence**. Student prototype, not affiliated with any commercial product named WellSync. Developed with no institutional clinical partner, no healthcare provider backing, and zero commercial affiliations.
- **Zero Human Clinical Testing**: The application has undergone **zero clinical trials, zero formal user testing, and zero randomized controlled evaluations**. All performance data presented is derived exclusively from retrospective algorithmic replays on an open-access dataset.

---

## 2. Scope & Behavioral Restrictions
- **Behaviors Supported**: The system is strictly restricted to **daily steps (count)** and **sleep duration (hours/minutes)**. No nutritional logging, heart-rate variability diagnostics, caloric expenditure claims, or medication adherence tracking are included.
- **Rule-Based Engine Only**: WellSync explicitly disclaims any use of artificial intelligence, deep learning, or large language models at runtime. The engine executes 100% deterministic, inspectable rules.

---

## 3. Dataset & Demographic Limitations
- **LifeSnaps Cohort Scope**: The retrospective replay utilizes data from the open-access LifeSnaps dataset (Zenodo 7229547).
- **Non-Abu Dhabi Cohort**: The LifeSnaps cohort consists of a multi-national research sample and **is not an Abu Dhabi or UAE sample**.
- **Generalizability Warning**: Behavioral rhythms, climate adaptations (e.g., extreme summer heat affecting outdoor walking in the GCC), cultural routines, and demographic distributions in Abu Dhabi differ fundamentally from the LifeSnaps cohort. These results **must not be assumed representative** of UAE or GCC populations without localized validation.
- **Replay vs. Proven Change**: A retrospective replay demonstrates solely how algorithmic rules classify and respond to static historical sensor traces. It **does not prove behavior change** or long-term habit formation in live participants.

---

## 4. Barrier Hypothesis Limitations
- **Strictly Non-Clinical**: Barrier hypotheses generated during recovery are limited to four mechanical patterns:
  1. *Weekday vs. Weekend Pattern*
  2. *Short Dip (1–2 day drop)*
  3. *Routine Shift (change in timing of activity)*
  4. *Self-Declared Context (user-selected tags: travel, busy, illness, weather)*
- **User Veto Rights**: Because rule-based hypotheses lack clinical context, users have the absolute right to reject any suggested barrier. Rejected hypotheses are permanently flagged and suppressed.
- **No Diagnostic Inferences**: The engine never infers medical conditions (e.g., diagnosing clinical depression from prolonged low steps, or sleep apnea from sleep fragmentation).

---

## 5. Deliberately Excluded Features & Risk Analysis

The following features were intentionally excluded from WellSync due to well-documented psychological and ethical risks:

| Excluded Feature | Psychological & Ethical Risk Identified | WellSync Design Choice |
| :--- | :--- | :--- |
| **Workplace / Employer Dashboards** | Creates workplace surveillance, coercion, and discriminatory performance evaluations based on biometric telemetry. | Zero backend, zero external reporting, zero employer/insurer export formats. |
| **Insurer Access & Premium Incentives** | Promotes penalty-based health stratification and punishes users experiencing chronic illness or socioeconomic barriers. | All data is stored strictly in the user's browser `localStorage` and never leaves the device. |
| **Public Peer Leaderboards & Streaks** | Triggers toxic social comparison, shame, anxiety, and the "what-the-hell" abandonment effect when a streak is broken. | Progress is tracked via cumulative **Active Days** and **Return Count**, with no public sharing or zero-resets. |
| **Social Competitions & Ranking** | Marginalizes individuals recovering from illness or injury; disincentivizes users who cannot compete with high-activity peers. | Focus is placed exclusively on intra-individual progress against one's own rolling baseline. |

---

## 6. Translation Limitations
- **Arabic Localization**: WellSync provides complete English and Arabic interfaces with bidirectional right-to-left (RTL) layout.
- **Unreviewed Status**: The Arabic translation was drafted by the student engineering team and has **not yet been reviewed by an accredited native Arabic linguist or behavioral clinician**. A prominent, persistent disclaimer is rendered on all Arabic views to transparently inform users.


---

## 7. Testing & Verification Disclosures: Exactly What Was Tested vs. What Was Not

To maintain the highest standard of academic honesty and competition transparency, we explicitly declare the precise boundaries of our testing:

### 7.1 What Was Tested & Verified
1. **Deterministic Rule Engine (97.57% statement coverage, 20 dedicated unit tests)**:
   - 28-day rolling median baseline computation.
   - Cold-start fallback to declared goal when valid days $< 14$.
   - Contamination guard: strict exclusion of `LAPSED` days from baseline calculations.
   - 3 consecutive below-par days ($< 60\%$ of baseline) trigger `LAPSED` state.
   - Minimum rung step-down ($50\%$ of baseline).
   - Recovery completion: 3 consecutive successes on Minimum restore `ON_TRACK` and step ladder up to Target.
   - Slipping detection: 7-day rolling mean $< 80\%$ of baseline.
   - 4 non-medical barrier heuristics and user veto toggle.
2. **Storage Resilience & Data Sovereignty (89.28% statement coverage, 11 dedicated unit tests)**:
   - Empty/absent `localStorage` fallback to defaults.
   - JSON data export schema containing complete profile, history, preferences, and zero user identifiers.
   - Complete permanent deletion (`clearAllUserData`) wiping keys and resetting state.
   - Corrupted JSON recovery: handles truncated or malformed JSON strings without crashing.
   - Blocked storage resilience: handles `SecurityError` (strict privacy/cookie blocking) without throwing.
   - Full storage quota resilience: catches `QuotaExceededError` on write without throwing.
3. **Screen Rendering & Demo Journeys (19 smoke tests)**:
   - All 7 client screens (`TodayScreen`, `RecoveryScreen`, `HistoryScreen`, `EvidenceScreen`, `SettingsScreen`, `AboutScreen`, `OnboardingModal`) render cleanly in both English (`en`) and Arabic (`ar`).
   - Synthetic demo personas (*Tariq*, healthcare shift worker; *Sarah*, working parent) evaluate cleanly through baseline, lapse, step-down, and recovery without errors.
4. **Automated Accessibility Heuristics (7 tests via `axe-core`)**:
   - Automated scan across all 7 screens confirming 0 critical WCAG violations for form controls, labels, and document structure.
5. **Zero Outgoing Network Telemetry**:
   - Production bundle in `dist/` verified to contain zero `fetch`, `XMLHttpRequest`, or `sendBeacon` calls. System fonts only.

### 7.2 What Was NOT Tested & Explicit Disclaimers
1. **Zero Clinical Testing**: The application has never been evaluated in clinical environments or validated for medical efficacy.
2. **Zero Human User Testing**: No live user testing, focus groups, or field pilots have been conducted.
3. **No Formal WCAG Certification**: Automated `axe-core` tests check only a subset of programmatic accessibility rules. We make no claim of formal WCAG 2.1 AA compliance; full audit with real screen readers (NVDA, JAWS, VoiceOver) on physical hardware by certified auditors has not occurred.
4. **Replay Is Not Proven Behavior Change**: The LifeSnaps retrospective replay shows how deterministic rules categorize past sensor data; it does not constitute clinical evidence that participants adopted or sustained healthier habits.
5. **No Local UAE Generalizability**: Data reflects an international sample and cannot be assumed representative of Abu Dhabi lifestyle or climate realities.
