# WELLSYNC: BEHAVIORAL ALGORITHM & STATE MACHINE AUDIT
**Module:** `src/engine/` (`baseline.ts`, `ladder.ts`, `state.ts`, `barriers.ts`, `recommendations.ts`)  
**Specification Reference:** `docs/ASSUMPTIONS.md`  
**Audit Focus:** Mathematical correctness, state transition completeness, and edge case resilience.  

---

## 1. Algorithm Overview & Core Principles

The WellSync engine is a **pure, side-effect-free deterministic state machine** that replaces punitive streak tracking with an adaptive behavioral ladder. It operates without runtime machine learning or external services, ensuring 100% explainability, instant client-side execution, and verifiable behavior.

---

## 2. Mathematical Formulations

### 2.1 Rolling Median Baseline
For any calendar day $t$, the behavioral baseline is computed over historical days strictly prior to $t$:

$$\text{Window}(t) = \big\{ v_i \in \text{History} \mid \text{date}_i \in [t - 28, t - 1], \neg\text{isMissing}_i, \text{state}_i \neq \text{LAPSED} \big\}$$

$$\text{Baseline}(t) = \begin{cases}
\text{UserDeclaredGoal} & \text{if } |\text{Window}(t)| < 14 \quad (\text{Cold Start}) \\
\text{Median}(\text{Window}(t)) & \text{if } |\text{Window}(t)| \ge 14
\end{cases}$$

- **Cold Start Rule:** When fewer than 14 valid days exist in the 28-day window, the baseline defaults to the user's declared goal.
- **Contamination Prevention Guard:** Historical days where the user was in the `LAPSED` state are strictly excluded from $\text{Window}(t)$. This prevents low activity during an illness or crisis from depressing the baseline and normalizing deterioration.

### 2.2 3-Rung Target Ladder
$$\text{LadderTargets}(t) = \begin{cases}
\text{Minimum} = \text{round}(0.50 \times \text{Baseline}(t)) \\
\text{Target} = \text{round}(1.00 \times \text{UserGoal}) \\
\text{Stretch} = \text{round}(1.10 \times \text{Target}(t))
\end{cases}$$

### 2.3 Evaluation & Success Day Definition
For day $t$, given actual recorded value $A_t$ and active rung level $L_t$:
$$\text{ActiveTarget}_t = \text{getTargetForLevel}(\text{LadderTargets}_t, L_t)$$
$$\text{isSuccessDay}_t = \neg\text{isMissing}_t \wedge (A_t \ge \text{ActiveTarget}_t)$$

- **Below-Par Evaluation:**
  - If $L_t = \text{MINIMUM}$: $\text{isBelowPar}_t = \text{isMissing}_t \vee (A_t < \text{Minimum}_t)$.
  - If $L_t \in \{\text{TARGET}, \text{STRETCH}\}$: $\text{isBelowPar}_t = \text{isMissing}_t \vee (A_t < 0.60 \times \text{Baseline}_t)$.

---

## 3. Comprehensive State Transition Table

The engine evaluates four discrete user states:
1. `ON_TRACK`: Activity is at or near baseline.
2. `SLIPPING`: 7-day rolling average drops below 80% of baseline (early warning).
3. `LAPSED`: 3 consecutive below-par days (< 60% baseline). Target steps down to Minimum (50%).
4. `RECOVERING`: User is actively rebuilding habit on the Minimum rung (3 consecutive successes required).

| Current State | Condition / Trigger | Next State | Ladder Level | Counter Updates | Behavioral Mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Any** | Valid days recorded $< 7$ | `ON_TRACK` | `TARGET` | Lapse counters suppressed | **Calibration Period:** Prevents false alarms while establishing early baseline. |
| `ON_TRACK` | 3 consecutive below-par days | `LAPSED` | `MINIMUM` | `consecutiveBelowPar = 3`, `consecutiveSuccess = 0` | **BCT 8.7 Graded tasks:** Drops target to 50% to prevent "what-the-hell" abandonment. |
| `ON_TRACK` | 7-day rolling mean $< 80\%$ baseline | `SLIPPING` | `TARGET` | Unchanged | **BCT 1.4 Action planning:** Prompts proactive scheduling before a full lapse occurs. |
| `ON_TRACK` | 3 consecutive Target successes | `ON_TRACK` | `STRETCH` | `consecutiveSuccess = 0` | **BCT 1.5 Goal review:** Unlocks optional +10% stretch rung. |
| `SLIPPING` | 3 consecutive below-par days | `LAPSED` | `MINIMUM` | `consecutiveBelowPar = 3`, `consecutiveSuccess = 0` | Steps down to Minimum rung. |
| `SLIPPING` | 7-day rolling mean $\ge 80\%$ baseline | `ON_TRACK` | `TARGET` | `consecutiveBelowPar = 0` | Momentum restored. |
| `LAPSED` | Day meets Minimum target ($A \ge \text{Min}$) | `RECOVERING` | `MINIMUM` | `consecutiveSuccess = 1`, `consecutiveBelowPar = 0` | Enters recovery protocol. |
| `LAPSED` | Day fails Minimum target ($A < \text{Min}$) | `LAPSED` | `MINIMUM` | `consecutiveBelowPar += 1`, `consecutiveSuccess = 0` | Remains in stepped-down state without penalty. |
| `RECOVERING` | Day meets Minimum target ($A \ge \text{Min}$) and `consecutiveSuccess` reaches 3 | `ON_TRACK` | `TARGET` | `returnCount += 1`, `consecutiveSuccess = 0` | **Recovery Completed:** Ladder restored to Target; Return Count incremented. |
| `RECOVERING` | Day meets Minimum target ($A \ge \text{Min}$) but `consecutiveSuccess` $< 3$ | `RECOVERING` | `MINIMUM` | `consecutiveSuccess += 1`, `consecutiveBelowPar = 0` | Progresses toward 3-day recovery milestone. |
| `RECOVERING` | Day fails Minimum ($A < \text{Min}$) but consecutive fails $< 3$ | `RECOVERING` | `MINIMUM` | `consecutiveSuccess = 0`, `consecutiveBelowPar += 1` | Recovery streak pauses; preserves stepped-down rung. |
| `RECOVERING` | 3 consecutive days below Minimum | `LAPSED` | `MINIMUM` | `consecutiveBelowPar = 3`, `consecutiveSuccess = 0` | Re-enters lapse status. |
| `STRETCH` | Day below Target rung | `ON_TRACK` | `TARGET` | `consecutiveBelowPar = 0` | Reverts smoothly to standard Target rung without penalty. |

---

## 4. Parameter Justification & Evidence Basis

| Parameter | Value | Evidence Classification | Justification |
| :--- | :--- | :--- | :--- |
| `baselineWindowDays` | **28 days** | Empirical / Behavioral | Captures four full weekday/weekend cycles, balancing stability against responsiveness. |
| `minValidDaysForBaseline` | **14 days** | Statistical / Engineering | Minimum sample size required to ensure median robustness against random fluctuations. |
| `minDaysForLapseDetection` | **7 days** | Behavioral Safety | Suppresses false alarms during initial calibration ("learning your baseline"). |
| `belowParThresholdRatio` | **0.60 (60%)** | Behavioral Taxonomy | Represents a significant deviation from typical volume while tolerating minor daily noise. |
| `lapseConsecutiveDays` | **3 days** | Behavioral Science | Filters out acute 1-2 day disruptions (travel, weather, acute fatigue) from true behavioral abandonment. |
| `recoveryConsecutiveSuccessDays` | **3 days** | Habit Formation Theory | 3 consecutive successful repetitions cement habit resumption before restoring demand. |
| `ladderMinimumRatio` | **0.50 (50%)** | BCT 8.7 (*Graded tasks*) | Significantly reduces activation energy to re-establish behavioral continuity. |
| `ladderStretchRatio` | **1.10 (110%)** | Goal Setting Theory | An incremental 10% challenge fosters self-efficacy without inducing overtraining risk. |

---

## 5. Adversarial Testing & Edge Case Audit Findings

All 35 edge cases mandated by the Master Audit were verified in `src/engine/__tests__/edge_cases_audit.test.ts`:
1. **Empty History:** Returns empty evaluated results without throwing; baseline falls back to user goal.
2. **Missing & Null Telemetry:** Days marked `isMissing` or containing `null`/`undefined` are treated as below-par and contribute toward lapse detection.
3. **Negative & Out-of-Bounds Values:** Sanitized by boundary clamping: $A_t \in [0, 100000]$ for steps, $[0, 1440]$ for sleep.
4. **Time Zone Offset Resilience:** Normalized via ISO calendar date extraction (`YYYY-MM-DD`), preventing UTC date boundary drift in UAE (+4) time.
5. **Recovery Interruption Resilience:** An isolated low day during recovery resets `consecutiveSuccessDays` to 0 but keeps the user on the stepped-down Minimum rung until 3 consecutive failures occur.
6. **Cumulative Progress Non-Reset:** `activeDays` and `returnCount` monotonically increase; verified never to decrement upon entering `LAPSED`.

---

## 6. Algorithmic Recommendations Implemented

1. **Persistent Hypothesis Vetoes:** User rejections of barrier hypotheses are now stored permanently in `localStorage` (`rejectedHypotheses`), preventing repeated exposure to rejected suggestions.
2. **Recovery Strategy Memory & Conflation Guard:** Implemented decoupled tracking of recovery micro-actions. Selecting an action records `activeRecoveryCommitment`; only when a user successfully completes the 3-day recovery ladder (`previousState === 'RECOVERING' && nextState === 'ON_TRACK'`) is the strategy archived into `completedRecoveryStrategies` (with legacy backward compatibility alias). This eliminates conflation between selecting a strategy and achieving recovery.
3. **Input Sanitization:** Clamped all user inputs to physiological limits in both UI and engine processing.
