# WellSync: System Architecture & Behavioral Recovery Workflow
**Future Health Digital Innovation Challenge 2026 — Abu Dhabi**  
*Challenge 09: Sustaining Healthy Behaviors (Wellbeing Track)*  
*Engineered by: 1. Ayesha Sultana & 2. B. Alence (Student Software Engineers)*  
*GitHub: [github.com/misterA-2406/well-sync](https://github.com/misterA-2406/well-sync)*

---

## 1. High-Level Multi-Tier System Architecture

WellSync is engineered as a **100% client-side, local-first, privacy-preserving behavioral health platform**. It operates entirely within the user's browser without external cloud tracking, third-party biometrics harvesting, or black-box LLM hallucinations.

```mermaid
flowchart TD
    %% Styling Classes
    classDef hardware fill:#EBF3EF,stroke:#183C32,stroke-width:2px,color:#183C32;
    classDef context fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#92400E;
    classDef stateEngine fill:#FDF4ED,stroke:#C97A48,stroke-width:2px,color:#8C3D10;
    classDef storage fill:#EFF6FF,stroke:#2563EB,stroke-width:2px,color:#1E40AF;
    classDef presentation fill:#F3F4F6,stroke:#374151,stroke-width:2px,color:#111827;
    classDef hosting fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46;

    subgraph TIER1["1. SENSORS & TELEMETRY INGESTION TIER"]
        S1["Apple HealthKit / Google Health Connect"]:::hardware
        S2["Commercial Wearables (Fitbit, Garmin, Whoop)"]:::hardware
        S3["Nature LifeSnaps Open Wearable Telemetry Dataset"]:::hardware
        S4["Zero-Friction Manual Biometric Fallback"]:::hardware
    end

    subgraph TIER2["2. UAE CONTEXT & CLIMATE ENGINE (OFFLINE)"]
        C1["🌙 Ramadan Fasting Mode<br/>• Hijri lunar calendar math<br/>• Post-Iftar physical window<br/>• Suhoor hydration reminders"]:::context
        C2["☀️ Summer Extreme Heat Mode<br/>• Outdoor threshold (>38°C)<br/>• Air-conditioned mall walking prompts<br/>• Indoor stair climb conversion"]:::context
        C3["🏥 SEHA Shift-Work Mode<br/>• 12-hour hospital shift profile<br/>• 2-Day / 2-Night / 4-Off rhythm<br/>• Circadian rest preservation"]:::context
        C4["⏸️ Planned Pause Mode<br/>• Illness / travel freeze<br/>• Zero streak punishment"]:::context
    end

    subgraph TIER3["3. DETERMINISTIC BEHAVIORAL STATE ENGINE"]
        SM1["Deterministic 4-State Machine<br/>(ON_TRACK ➔ SLIPPING ➔ RECOVERING ➔ REESTABLISHED)"]:::stateEngine
        SM2["Resilient Minimum Target Ladder<br/>• Stretch Target (110%)<br/>• Baseline Target (100%)<br/>• Minimum Resilient Target (50% - BCT 8.7)"]:::stateEngine
        SM3["Non-Punitive Recovery Metric Engine<br/>• Cumulative Active Days (Zero Reset)<br/>• Return Count Rebound Accrual<br/>• Marlatt & Gordon Cognitive Framing"]:::stateEngine
    end

    subgraph TIER4["4. PRIVACY & LOCAL STORAGE (ZERO-PII)"]
        DB1[("IndexedDB Local Store<br/>• Encrypted Telemetry Logs<br/>• Historical Behavior Records")]:::storage
        DB2[("localStorage Configuration<br/>• Offline Context Profile<br/>• Language & Mode Flags")]:::storage
    end

    subgraph TIER5["5. PRESENTATION & EXPERIENCE TIER (React 19 + TypeScript)"]
        UI1["Today View & Adaptive Ladder Card"]:::presentation
        UI2["Telemetry Replay & LifeSnaps Benchmark"]:::presentation
        UI3["Bilingual Localization (Arabic RTL ⇄ English LTR)"]:::presentation
        UI4["⚡ 90-Second Judge Quick-Audit Mode"]:::presentation
        UI5["WCAG 2.1 AAA Accessibility & High Contrast"]:::presentation
    end

    subgraph TIER6["6. CI/CD & HOSTING ECOSYSTEM"]
        H1["GitHub Repository (misterA-2406/well-sync)"]:::hosting
        H2["GitHub Actions (deploy.yml Workflow)"]:::hosting
        H3["GitHub Pages / Vercel Global Edge CDN"]:::hosting
    end

    %% Data Flow Connections
    S1 & S2 & S3 & S4 -->|Raw Steps, Sleep, Resting HR| TIER2
    TIER2 -->|Context-Adjusted Parameters| TIER3
    TIER3 <-->|State Persistence & History| TIER4
    TIER3 -->|Reactive State, Alerts, Ladders| TIER5
    TIER5 -->|User Interactions & Overrides| TIER3
    H1 -->|Trigger on Push| H2 -->|Automated Build & Test| H3
```

---

## 2. The 4-State Behavioral Recovery Workflow

Traditional health apps use binary streaks: a missed day drops the user's progress to **0**, causing the psychological **"What-the-Hell Effect"** (*Marlatt & Gordon*), where users abandon their health interventions. 

WellSync replaces this punitive loop with an adaptive **4-State Finite State Machine (FSM)**:

```mermaid
stateDiagram-v2
    [*] --> ON_TRACK: User starts baseline routine

    state ON_TRACK {
        description: User is achieving 100%+ of baseline target.
        metric: Cumulative Active Days accrues daily.
    }

    state SLIPPING {
        description: 1-2 consecutive days below baseline target.
        intervention: Adaptive Ladder automatically offers 50% Minimum Resilient Target (BCT 8.7).
        cognitive_frame: "Normal fluctuation, not failure."
    }

    state RECOVERING {
        description: User completes the 50% Minimum Target or resumes activity.
        metric: Return Count increments (+1).
        celebration: "Rebound achieved! Habit durability strengthened."
    }

    state REESTABLISHED {
        description: 3 consecutive days meeting/exceeding baseline.
        metric: Solidified habit durability returned to full capacity.
    }

    ON_TRACK --> SLIPPING: Missed Day (Shift work, illness, heat)
    SLIPPING --> ON_TRACK: Complete baseline next day
    SLIPPING --> RECOVERING: Complete 50% Minimum Resilient Target (BCT 8.7)
    SLIPPING --> RECOVERING: Return after multiple missed days (No Reset!)
    RECOVERING --> REESTABLISHED: 3 consecutive days at baseline
    RECOVERING --> SLIPPING: Missed day during recovery phase
    REESTABLISHED --> ON_TRACK: Seamless continuity
```

### Detailed Decision Flowchart

```mermaid
flowchart TD
    Start(["🌅 Daily Evaluation Cycle Starts"]) --> FetchTelemetry["Read Daily Telemetry (Steps, Sleep, Shifts)"]
    FetchTelemetry --> CheckContext{"Active UAE Context Mode?"}
    
    CheckContext -- "🌙 Ramadan Mode" --> AdjRamadan["Adjust Target Timing: Primary window shifted post-Iftar (20:00–23:00)"]
    CheckContext -- "☀️ Extreme Heat (>38°C)" --> AdjHeat["Swap outdoor steps for indoor climate-controlled equivalents"]
    CheckContext -- "🏥 SEHA Shift-Work" --> AdjShift["Apply 60% rest target for night shifts; zero penalty on post-call days"]
    CheckContext -- "None / Standard" --> StandardTarget["Standard Baseline Target (e.g., 7,500 Steps)"]
    
    AdjRamadan & AdjHeat & AdjShift & StandardTarget --> EvaluateTarget{"Day Activity vs Target"}
    
    EvaluateTarget -- ">= 100% Baseline" --> StateOnTrack["State: ON_TRACK<br/>• Cumulative Days: +1<br/>• Reinforce Self-Efficacy"]
    EvaluateTarget -- "50% - 99% (Hit Minimum)" --> StateRecovering["State: RECOVERING<br/>• Return Count: +1<br/>• Cumulative Days: +1<br/>• Celebrate Rebound"]
    EvaluateTarget -- "< 50% (Day Missed)" --> StateSlipping["State: SLIPPING<br/>• ZERO Streak Punishment<br/>• Cumulative Days PRESERVED<br/>• Activate 50% Minimum Ladder for Tomorrow"]
    
    StateOnTrack & StateRecovering & StateSlipping --> PersistLocal["Persist State to IndexedDB"]
    PersistLocal --> UpdateUI["Render Today Dashboard with Empathetic Messaging"]
    UpdateUI --> End(["🌙 Cycle Complete"])
```

---

## 3. Daily User Journey & Context Adaptation Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Healthcare Worker (Abu Dhabi)
    participant UI as 📱 WellSync Frontend (React 19)
    participant Engine as ⚙️ UAE Context Engine
    participant FSM as 🧠 Behavioral FSM (4-State)
    participant DB as 💾 Local Encrypted Store

    Note over User, DB: Morning Circadian Check-in
    User->>UI: Opens WellSync Dashboard
    UI->>DB: Query User Profile & Historical State
    DB-->>UI: Return State: SLIPPING (Missed yesterday due to 12h emergency shift)
    UI->>Engine: Evaluate Environment (Abu Dhabi Weather + Hospital Roster)
    Engine-->>UI: Context: Extreme Heat (44°C) + Night Shift Scheduled
    
    Note over UI, FSM: Proactive Ladder Adaptation
    UI->>FSM: Request Target Recommendation
    FSM-->>UI: Serve 50% Resilient Target (3,750 steps) + Indoor Option
    UI-->>User: "Yesterday was tough. Let's aim for a gentle 50% indoor ladder today. Recovery is what counts!"

    Note over User, UI: Evening Activity Sync
    User->>UI: Completes 4,000 steps (Indoor corridor walking)
    UI->>FSM: Log Activity (4,000 steps >= 3,750 minimum)
    FSM->>FSM: Transition State: SLIPPING ➔ RECOVERING
    FSM->>DB: Increment Cumulative Days (+1) & Increment Return Count (+1)
    DB-->>FSM: Confirm Saved (Zero Resets Triggered)
    FSM-->>UI: Rebound Event: Return Count = 4
    UI-->>User: "🎉 Welcome back! You rebounded smoothly. Cumulative: 42 Active Days."
```

---

## 4. Resilient Minimum Ladder (BCT 8.7) Mathematical Model

```
   ┌────────────────────────────────────────────────────────┐
   │ ▲ STRETCH RUNG (110% = 8,250 Steps)                   │
   │   Peak days, high energy, surplus capacity             │
   ├────────────────────────────────────────────────────────┤
   │ ◼ BASELINE RUNG (100% = 7,500 Steps)                  │
   │   Standard operational target for routine days         │
   ├────────────────────────────────────────────────────────┤
   │ ▼ MINIMUM RESILIENT RUNG (50% = 3,750 Steps)          │
   │   Disruption recovery (BCT 8.7 Graded Tasks)           │
   │   Prevents "What-the-Hell Effect" & preserves habit    │
   └────────────────────────────────────────────────────────┘
```

---

## 5. Deployment & CI/CD Pipeline Architecture

```mermaid
flowchart LR
    Dev["💻 Local Development<br/>React 19 + TypeScript + Vite"] -->|git commit & push| Repo["🐙 GitHub Repository<br/>(misterA-2406/well-sync)"]
    
    subgraph GHA["GitHub Actions Automation (deploy.yml)"]
        Lint["1. Node 22 CI Setup"] --> Test["2. Vitest Suite (145 Unit & FSM Tests)"]
        Test --> Build["3. Vite Static Compilation (tsc && vite build)"]
        Build --> Bundle["4. Zero-Asset Failure Bundling (base: './')"]
    end
    
    Repo -->|Trigger master branch| GHA
    Bundle -->|Upload Artifact| Pages["🌐 GitHub Pages Production<br/>(https://misterA-2406.github.io/well-sync/)"]
    Repo -->|Instant Webhook| Vercel["⚡ Vercel Edge Network<br/>(Production & PR Preview URLs)"]
```
