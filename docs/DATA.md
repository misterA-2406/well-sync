# WellSync Dataset Documentation & Verified Schema

## 1. Dataset Origin & Licensing Confirmation
- **Source**: LifeSnaps: A 4-month multi-modal dataset capturing unobtrusive snapshots of our lives in the wild.
- **Repository**: Zenodo ([Record 7229547](https://zenodo.org/records/7229547), DOI: `10.5281/zenodo.7229547`, concept DOI: `10.5281/zenodo.6826682`).
- **Academic Citation**: Sofia Yfantidou, Christina Karagianni, Stefanos Efstathiou, Athena Vakali, João Palotti, Dimitrios Panteleimon Giakatos, Thomas Marchioro, Andrei Kazlouski, Elena Ferrari, and Šarūnas Girdzijauskas. *LifeSnaps, a 4-month multi-modal dataset capturing unobtrusive snapshots of our lives in the wild*. **Scientific Data** 9, 669 (2022). DOI: [10.1038/s41597-022-01764-x](https://doi.org/10.1038/s41597-022-01764-x). PMCID: [PMC9622868](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9622868/).
- **Licensing Compliance (On the Record)**: The LifeSnaps dataset is distributed under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** license. We formally confirm on the record that our usage complies fully with CC BY 4.0 terms: academic non-commercial research, appropriate attribution given, license indicated, and modifications transparently described.

### 1.1 How to Verify the CC BY 4.0 License on Zenodo Directly
Anyone can independently verify the license of the LifeSnaps dataset through any of the following three official channels:
1. **Web Browser Verification**:
   - Navigate to the official Zenodo record: [https://zenodo.org/records/7229547](https://zenodo.org/records/7229547).
   - On the right-hand metadata sidebar under the heading **"License"**, locate the license badge: `Creative Commons Attribution 4.0 International` linking directly to `https://creativecommons.org/licenses/by/4.0/legalcode`.
2. **Zenodo REST API Verification**:
   - Query Zenodo's JSON API endpoint: `https://zenodo.org/api/records/7229547`.
   - Inspect the `metadata.license.id` JSON property: `"cc-by-4.0"`.
3. **Peer-Reviewed Publication Verification**:
   - Consult the open-access Nature Scientific Data paper: Yfantidou et al. (2022), DOI: `10.1038/s41597-022-01764-x` (PMC9622868).
   - Under the **"Data Records"** and article footer sections, the authors explicitly state that the dataset hosted on Zenodo is made available under the Creative Commons Attribution 4.0 International license.

---

## 2. Verified Local Files & Download Instructions

### 2.1 Download Instructions (Raw Data Not Committed to Repository)
In compliance with open science repository hygiene and competition rules, raw large CSV files are **not committed to git** (`.gitignore` excludes `analysis/data/*.csv`). To run the Python replay script or reproduce findings locally:

1. Visit Zenodo record `7229547` at [https://zenodo.org/records/7229547](https://zenodo.org/records/7229547).
2. Download `daily_fitbit_sema_df_unprocessed.csv` (required for `analysis/replay.py`) or the full dataset archive.
3. Save the downloaded CSV files into the `analysis/data/` directory.
4. Verify file sizes and row counts against Table 2.2 below.
5. Execute the deterministic replay:
   ```bash
   pip install -r analysis/requirements.txt
   python analysis/replay.py
   ```
   This generates `src/data/evidence_data.json` with full data provenance.

### 2.2 Verified File Inventory in `analysis/data/`

| File Name | Size (Bytes) | Row Count | Column Count | Description |
| :--- | :--- | :--- | :--- | :--- |
| `daily_fitbit_sema_df_unprocessed.csv` | 2,066,609 | 7,410 | 63 | Daily aggregated Fitbit wearable metrics and ecological momentary assessments (EMA) across 71 participants. |
| `hourly_fitbit_sema_df_unprocessed.csv` | 21,137,596 | 159,508 | 39 | Hourly breakdown of physical activity, calories, temperature, and heart rate. |
| `breq.csv` | 8,831 | 92 | 10 | Behavioral Regulation in Exercise Questionnaire responses. |
| `panas.csv` | 13,741 | 268 | 6 | Positive and Negative Affect Schedule responses. |
| `personality.csv` | 5,456 | 50 | 15 | Big Five personality inventory scores. |
| `stai.csv` | 17,027 | 279 | 6 | State-Trait Anxiety Inventory scores. |
| `ttm.csv` | 17,464 | 94 | 15 | Transtheoretical Model stages of change assessment. |

---

## 3. Verified Schema: `daily_fitbit_sema_df_unprocessed.csv`
Direct inspection of `daily_fitbit_sema_df_unprocessed.csv` confirms the following columns, verified data types, and physical units:

### 3.1 Primary Behavioral Fields Used in WellSync
1. `id`: **string** (object)
   - *Description*: Unique anonymized participant identifier (24-character hex string).
   - *Unique Count*: 71 distinct participants.
2. `date`: **string** (object, formatted `YYYY-MM-DD`)
   - *Description*: Calendar date of recorded sensor telemetry.
   - *Range*: 2021-05-01 to 2021-12-30.
   - *Null Count*: 0 (100% complete).
3. `steps`: **float64**
   - *Description*: Daily step count recorded by the participant's wrist-worn Fitbit tracker.
   - *Unit*: Step count (discrete steps).
   - *Summary*: Min = 0, 25% = 4,461, Median = 7,420, Mean = 8,261.6, 75% = 11,046, Max = 43,112.
   - *Null Count*: 2,633 of 7,410 rows (35.5% missing sensor sync days, treated as missing/below-par per protocol).
4. `minutesAsleep`: **float64**
   - *Description*: Total time classified by Fitbit sleep algorithm as asleep.
   - *Unit*: Minutes.
   - *Summary*: Min = 0, Median = 401.0 min (~6.68 hrs), Mean = 393.1 min (~6.55 hrs), Max = 1,094.0 min.
   - *Null Count*: 3,859 of 7,410 rows (52.1% non-wear or missing sleep tracking).
5. `sleep_duration`: **float64**
   - *Description*: Total duration of the sleep event recorded.
   - *Unit*: Milliseconds (ms).
   - *Conversion*: $\text{Minutes} = \frac{\text{sleep\_duration}}{60,000}$.
   - *Summary*: Median = $2.748 \times 10^7$ ms (458.0 minutes / 7.63 hours).
6. `gender`: **string** (categorical)
   - *Values*: `MALE` (42 participants, 4,178 rows), `FEMALE` (27 participants, 2,862 rows), `NaN` / Unknown (2 participants, 370 rows).
7. `age`: **string** (categorical)
   - *Values*: `<30` (37 participants, 3,642 rows), `>=30` (31 participants, 3,154 rows), `NaN` / Unknown (3 participants, 614 rows).

### 3.2 Full Column Inventory (63 Columns Verified)
```
Unnamed: 0, id, date, nightly_temperature, nremhr, rmssd, spo2, full_sleep_breathing_rate,
stress_score, sleep_points_percentage, exertion_points_percentage, responsiveness_points_percentage,
daily_temperature_variation, badgeType, calories, filteredDemographicVO2Max, distance,
activityType, bpm, lightly_active_minutes, moderately_active_minutes, very_active_minutes,
sedentary_minutes, mindfulness_session, scl_avg, resting_hr, sleep_duration, minutesToFallAsleep,
minutesAsleep, minutesAwake, minutesAfterWakeup, sleep_efficiency, sleep_deep_ratio,
sleep_wake_ratio, sleep_light_ratio, sleep_rem_ratio, steps, minutes_in_default_zone_1,
minutes_below_default_zone_1, minutes_in_default_zone_2, minutes_in_default_zone_3, age,
gender, bmi, step_goal, min_goal, max_goal, step_goal_label, ALERT, HAPPY, NEUTRAL,
RESTED/RELAXED, SAD, TENSE/ANXIOUS, TIRED, ENTERTAINMENT, GYM, HOME, HOME_OFFICE,
OTHER, OUTDOORS, TRANSIT, WORK/SCHOOL
```

---

## 4. Assessment of Required Fields
- **Required Behaviors**: Daily steps and sleep duration.
- **Verification**: Both `steps` (step count) and `minutesAsleep` / `sleep_duration` (minutes and milliseconds) are present with valid numeric distributions.
- **Missing Required Fields**: **None**. All necessary telemetry and demographic metadata required by the engine and replay specification exist in `daily_fitbit_sema_df_unprocessed.csv`.
- **Note on `step_goal`**: While `step_goal` exists in the dataset, it is missing in 74.2% of rows (5,497 nulls). Therefore, per approved specification (Change #5), each participant's target is determined by their individual baseline rather than unpopulated self-declared goals.

---

## 5. Privacy & Data Handling
- **No Individual Identifiers in App**: The frontend application imports strictly aggregate summary metrics from `src/data/evidence_data.json`.
- **Subgroup Masking**: Any demographic cell with $n < 5$ participants (e.g., participants with unverified gender or age) is explicitly suppressed with a visible `[Data suppressed: n < 5]` label to prevent re-identification.
