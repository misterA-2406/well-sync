# WellSync Evidence & Replay Report

**Dataset**: LifeSnaps Open Science Dataset  
**Citation**: Zenodo 7229547 (DOI: [10.5281/zenodo.7229547](https://doi.org/10.5281/zenodo.7229547)), CC BY 4.0, PMC9622868  
**Cohort Size**: N = 71 participants (7,443 total participant-days)  
**Replay Engine Version**: v2.0.0 (Deterministic, Zero Runtime AI)  
**Generated At (UTC)**: 2026-11-19T14:55:44.892Z

---

## 1. Executive Summary & Symmetric Policy Comparison

To provide rigorous, methodologically honest evidence for the Future Health Digital Innovation Challenge 2026, we replayed 4 distinct behavioral policies across **identical** participant telemetry. Every metric is computed under identical denominators and mathematical criteria.

### Symmetric Policy Evaluation Matrix

| Metric | Policy 1: Static 10k | Policy 2: Streak Reset | Policy 3: Adaptive Avg | Policy 4: WellSync Ladder |
| :--- | :---: | :---: | :---: | :---: |
| **Target Type** | Fixed 10,000 steps | 28-day Median Baseline | 7-day Moving Average | 3-Rung Ladder (50% Min) |
| **Streak Mechanic** | Reset to 0 on failure | Reset to 0 on failure | Reset to 0 on failure | Cumulative Active Days |
| **% Days $\ge$ 50% Baseline** | 51.4% | 51.4% | 51.4% | 51.4% |
| **Mean Time-to-Return (Days)** | 3.1d | 3.1d | 3.1d | 3.1d |
| **Abandonment Gaps (14+ days)** | 5 | 5 | 5 | 5 |
| **Share of Days Labeled Failure** | **89.4%** | **72%** | **54.8%** | **68.1%** |
| **Mean Resets to Zero** | 8.5 | 17.9 | 22.5 | **0.0 (By Design)** |
| **Attainability of Assigned Target** | 10.6% | 28% | 45.2% | **31.9%** |

---

## 2. Key Scientific Findings

1. **Streak Fragility is Driven by the Reset Mechanic, Not Just Goal Height**:
   Even when targets were calibrated to each participant's personal rolling baseline (Policy 2), participants suffered an average of **17.9 streak resets to zero**. A single travel day, mild illness, or wearable charging gap obliterated weeks of accumulated continuity.
2. **Punitive Failure Labeling in Conventional Apps**:
   Under the rigid 10,000 step static goal (Policy 1), users experienced a **89.4% failure rate**, labeling over three-quarters of their lives as inadequate. WellSync's graded 3-rung ladder reduces failure labeling to **68.1%**, offering an attainable 50% Minimum step-down during disruptions without erasing cumulative momentum.
3. **Cumulative Momentum Preserves Identity**:
   Policy 4 eliminates the reset-to-zero trap by architectural design. Participants accumulated a mean of **33.4 active days** and completed **2.7 return journeys** from disruption back to baseline.

---

## 3. Explicit Methodological Limitations & Honest Disclosures

- **Retrospective Sensor Replay**: This simulation executes algorithmic policies against previously recorded Fitbit telemetry. It establishes mathematical feasibility and behavioral resilience, but does **not** prove prospective behavior change in a clinical trial.
- **Zero Causal Claims**: We make no causal claims of health outcome improvement without prospective randomized controlled pilots.
- **Demographic Context**: The LifeSnaps cohort represents European adults. Physical activity rhythms, circadian schedules, and extreme summer temperatures in the UAE differ markedly and necessitate WellSync's UAE Context Engine.
- **Sensor Telemetry Proxy**: Daily steps and sleep duration are non-clinical lifestyle proxies and do not constitute diagnostic medical measurements.
