# WellSync — 3-Minute Competition Demo Video Script
**Future Health Digital Innovation Challenge 2026 | Challenge 09: Sustaining Healthy Behaviors**

**Total Duration**: 03:00  
**Video Resolution**: 1080p / 60fps  
**Audio**: Clear spoken English voiceover with bilingual Arabic/English subtitles  

---

## Storyboard & Script Breakdown

| Timestamp | Visual Action on Screen | Spoken Voiceover Audio | Technical Highlight |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:25** | Open application on mobile/desktop viewport at `http://localhost:5173/`. 3-step rapid onboarding modal is shown. Step 1 (Goal: 8,000 steps), Step 2 (Select Shift-Work mode), Step 3 (Privacy check). User clicks "Launch WellSync". | *"Welcome to WellSync. In the UAE, healthy habits frequently collapse not from a lack of will, but when real life hits: extreme summer heat, Ramadan schedules, or rotating hospital night shifts. Traditional apps punish users with streak resets to zero. WellSync is built on a new principle: habit durability is defined by recovery, not perfection."* | Rapid 60-Second Onboarding Wizard with zero PII. |
| **0:25 - 0:50** | User clicks the `⚡ Judge Demo (90s)` button in the header. The amber persistent banner appears: `Judge Demo Mode: Tariq's Walkthrough`. Show Today screen displaying 14 consistent days established at 8,500 baseline steps. | *"To demonstrate our engine, let's look at Tariq, an Abu Dhabi nurse. In week one and two, Tariq builds a solid baseline of 8,500 steps. The engine calculates his rolling 28-day median, learning his genuine daily rhythm."* | Transparent baseline calibration; clean UI without cognitive clutter. |
| **0:50 - 1:25** | Scroll down to the activity chart and timeline showing Days 15–17. Three consecutive night shifts drop his activity to 3,200 steps. State badge shifts to `SLIPPING` then `LAPSED`. Highlight the Target Ladder Card stepping down to the 50% Minimum Rung. | *"Then comes a grueling 3-day night shift rotation. Tariq logs only 3,200 steps. In a conventional app, his 14-day streak is wiped out. In WellSync, there are no red failure states or shaming alerts. Instead, our deterministic ladder immediately steps down to the Minimum rung—50% of his baseline—making continuity feasible during disruption."* | Graded 50% Minimum Rung Step-Down; zero punitive zero-resets. |
| **1:25 - 1:55** | Click on the `Recovery Flow` tab. Show the 3-day recovery ladder with interactive micro-action commitments (e.g. '10-minute post-shift walk'). Advance to Day 21 where recovery completes: `ON_TRACK` restored, Return Count increments to 1, and Active Days are 17. | *"Tariq selects a low-friction recovery commitment. Over the next three days, he hits his adapted 4,250-step minimum. The engine celebrates his rebound: his Target is restored, all 17 active days remain intact, and his Return Count increments. We turn past disruption into measurable resilience."* | Deterministic state engine; Return Count metric; cumulative active days. |
| **1:55 - 2:30** | Click on the `Evidence` tab. Highlight the Symmetric Policy Evaluation Matrix comparing Policy 1 (Static 10k), Policy 2 (Streak Reset), Policy 3 (Moving Average), and Policy 4 (WellSync Ladder). Point out the 89.4% failure rate in static goals vs 0.0 resets in WellSync. | *"Our claims are backed by rigorous open science. In a reproducible replay across 71 participants from the LifeSnaps wearable dataset, conventional streak-reset mechanics collapsed an average of 17.9 times per person. WellSync eliminates the reset trap by architectural design and reduces failure labeling from 89% down to achievable rungs."* | LifeSnaps Zenodo 7229547 benchmark replay; symmetric denominators. |
| **2:30 - 2:50** | Click on the language toggle in the header: UI instantly flips into full Arabic RTL with mirrored layout and Arabic-Indic numerals. Switch to Settings to show the Optional Pilot Study Sync toggle. | *"WellSync is built for Abu Dhabi: full bilingual Arabic RTL support, offline Ramadan and Summer Heat modes, and local-first data privacy. Syncing to our pilot backend is completely optional, pseudonymous, and GDPR/PDPL compliant."* | Bilingual RTL support; UAE Context Engine; Local-first architecture. |
| **2:50 - 3:00** | Return to Today screen, click "Exit Demo Mode" returning to clean state. Closing title card with repository URL and competition details. | *"WellSync: Progress is not perfection. Recovery is easier than restarting. Thank you."* | 1-click reversibility; competition-ready deliverable. |

---

## Technical Fallback Plan

If live internet connectivity is lost during the presentation or judging review:
- **Zero Network Dependency**: WellSync is 100% offline-first. The entire application runs from localhost (`http://localhost:5173`) using cached browser storage and service worker.
- **Deterministic Replay Offline**: The evidence script and synthetic demo personas are self-contained in the repository; no external APIs or cloud services are invoked.
- **Local SQLite Backend**: The pilot backend runs locally via `node dist/index.js` or Docker without requiring internet access.
