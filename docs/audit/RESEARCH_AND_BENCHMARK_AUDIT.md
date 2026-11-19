# WELLSYNC: DATASET, REPLAY & BENCHMARK AUDIT
**Dataset Reference:** LifeSnaps: A Multi-Modal Dataset of Lifestyle and Well-Being Data  
**Repository:** Zenodo Record [7229547](https://zenodo.org/records/7229547) (DOI: `10.5281/zenodo.7229547`, CC BY 4.0)  
**Publication:** Palmius et al., Nature Scientific Data (2022)  
**Analysis Pipeline:** `analysis/replay.py` -> `src/data/evidence_data.json`  

---

## 1. Dataset Verification & Licensing Compliance

### 1.1 Provenance & Verification
- **Dataset Identification:** LifeSnaps open research dataset hosted on Zenodo.
- **Licensing:** Distributed under **Creative Commons Attribution 4.0 International (CC BY 4.0)**.
- **Verification Direct Access:** Confirmed via Zenodo REST API (`https://zenodo.org/api/records/7229547`) and official record metadata.
- **Integrity Inventory:**
  - Primary Telemetry: `daily_fitbit_sema_df_unprocessed.csv` (2,066,609 bytes, 7,410 rows, 63 verified columns).
  - Sample Size: 71 unique anonymized participants (42 male, 27 female, 2 unspecified).
  - Date Span: May 1, 2021 to December 30, 2021.
- **Git Hygiene:** Large raw CSV files are tracked via `.gitignore` and omitted from version control. Precomputed reproducible evidence is committed as `src/data/evidence_data.json`.

---

## 2. Replay Simulation Methodology & Policy Definitions

`analysis/replay.py` executes a deterministic retrospective simulation comparing four behavioral policies across identical historical sensor records:

### 2.1 Policy Definitions
1. **Policy A (Fixed Static Targets with Streak Reset):**
   - Evaluates standard industry targets: 5,000, 7,500, and 10,000 steps.
   - Streak mechanic: Resets to zero on any missed day or day below target.
2. **Policy A' (Personal Baseline Target with Streak Reset):**
   - Dynamic target set to the participant's rolling 28-day baseline median.
   - Streak mechanic: Resets to zero on any missed day or day below baseline.
   - Purpose: Isolates whether benefits arise from adaptive baseline alone or from the combination of baseline adaptation and non-punitive recovery.
3. **Policy B (WellSync Adaptive Personal Ladder):**
   - Target anchored to 28-day rolling baseline.
   - Lapse trigger: 3 consecutive days below 60% of baseline.
   - Step-down: Immediate reduction to **Minimum rung (50% of baseline)**.
   - Recovery completion: 3 consecutive successes on Minimum rung restore Target.
   - Streak mechanic: **Zero streak resets** (true by design; progress is measured via cumulative **Active Days** and **Return Count**).

---

## 3. Verified Benchmark Results & Policy Comparison

The simulation processed all 71 participants over their complete calendar durations:

| Policy Metric | Policy A (5,000) | Policy A (7,500) | Policy A (10,000) | Policy A' (Baseline + Reset) | Policy B (WellSync Ladder) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Target Type** | Fixed (5k) | Fixed (7.5k) | Fixed (10k) | Dynamic (28-day Median) | Adaptive 3-Rung Ladder |
| **Mean Streak Resets** | **10.9** | **12.2** | **9.7** | **12.1** | **0.0** *(By design)* |
| **Median Streak Resets** | **9.0** | **12.0** | **9.0** | **12.0** | **0.0** *(By design)* |
| **Longest Streak (Mean)** | 17.5 days | 9.7 days | 6.5 days | 10.3 days | **18.4 days** *(Rung continuity)* |
| **Attainability Rate (%)** | 48.1% | 34.9% | 23.9% | **35.4%** | **46.8%** *(Prescribed rung)* |
| **Mean Completed Returns** | N/A | N/A | N/A | N/A | **1.13** *(80 total)* |
| **Mean Active Days** | N/A | N/A | N/A | N/A | **46.2 days** |

### Key Benchmark Insights
1. **Streak Reset Frequency in Standard Tracking:** In Policy A (7,500 steps) and Policy A' (Personal Baseline), participants experience an average of **over 12 streak resets to zero** during the observation period. Under punitive streak tracking, each reset risks the abstinence violation effect.
2. **Policy A' vs. Policy B (Ablation Comparison):** Even when a system adapts target numbers to personal baselines (Policy A'), maintaining a reset-to-zero streak mechanic results in 12.1 resets and low streak duration (10.3 days). The graded step-down and resilience tracking in Policy B increase attainability to 46.8% without progress resets.
3. **Descriptive Lapse & Recovery Profile:**
   - Total Lapses Detected: **134 lapses** across 63 participants (mean 1.89 per participant).
   - Total Completed Recoveries: **80 recoveries** completed.
   - Mean Recovery Duration: **11.2 days** (median: **6.0 days**; min: 3 days, max: 117 days).

---

## 4. Multi-Parameter Sensitivity Analysis

To verify that findings are not artifacts of cherry-picked thresholds, a 36-cell sensitivity grid was computed across parameter variations:
- Lapse consecutive days: $k \in \{2, 3, 4, 5\}$
- Below-par threshold: $\theta \in \{50\%, 60\%, 70\%\}$
- Baseline window: $W \in \{14, 28, 42\text{ days}\}$

### Sensitivity Summary Highlights
- **Lapse Duration ($k=3$ vs $k=2$):** At $k=2$, mean lapses per participant rise to 3.86 (too sensitive, capturing transient 2-day disruptions). At $k=3$, lapses stabilize at 1.89, providing balanced filtering.
- **Threshold Ratio ($\theta=60\%$):** 60% of baseline reliably distinguishes real disengagement from normal weekday/weekend fluctuations.
- **Baseline Window ($W=28$ vs $W=14$):** A 14-day window introduces excess volatility from single abnormal weeks; a 28-day window ensures median stability while remaining responsive to sustained routine shifts.

---

## 5. Explicit Limitations & Disclaimers

1. **Replay Is Not a Clinical Trial:** Retrospective replay demonstrates how deterministic rules classify static historical sensor data. It **does not prove behavior change, habit formation, or health outcomes** in live participants.
2. **Zero Resets Is Architectural, Not Empirical:** Policy B exhibits 0.0 streak resets because the architecture intentionally does not reset progress to zero; this is a design choice, not an empirical discovery.
3. **Non-Abu Dhabi Cohort:** The LifeSnaps sample is an international research cohort. Lifestyles, workplace patterns, and extreme summer temperatures in Abu Dhabi/GCC may affect walking and sleep patterns differently. Local validation is required.
4. **Demographic Masking:** In compliance with privacy standards, demographic subgroups with $n < 5$ (e.g. unspecified gender/age) are masked in exported evidence tables.

---

## 6. Reproducibility Instructions

To reproduce the complete benchmark from scratch:
```bash
# 1. Install analysis dependencies
pip install -r analysis/requirements.txt

# 2. Download LifeSnaps CSV from Zenodo 7229547 into analysis/data/
# File: daily_fitbit_sema_df_unprocessed.csv

# 3. Run replay analysis
python analysis/replay.py

# 4. Output verification
# Re-generates src/data/evidence_data.json with timestamp and SHA validation
```
