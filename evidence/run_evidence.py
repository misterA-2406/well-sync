"""
WellSync Evidence & Replay Engine (Python Standard Library Implementation)
Self-contained, deterministic simulation comparing 4 behavioral policies on identical telemetry.
Requires ZERO external packages (uses pure python standard library: math, json, random, os).
Citation: LifeSnaps Dataset (Zenodo 7229547, DOI 10.5281/zenodo.7229547, CC BY 4.0, PMC9622868)
"""

import json
import math
import os
import random
from datetime import datetime, timezone

def run_simulation():
    # Fixed seed for perfect determinism
    rng = random.Random(42)
    TOTAL_PARTICIPANTS = 71
    
    participants = []
    total_days_across_all = 0
    all_days_ge_50pct = 0
    total_abandonment_gaps = 0
    all_return_times = []
    
    p1_attained = p1_failed = p1_resets = 0
    p2_attained = p2_failed = p2_resets = 0
    p3_attained = p3_failed = p3_resets = 0
    p4_attained = p4_failed = p4_active = p4_returns = 0
    
    p1_longest = p2_longest = p3_longest = p4_longest = 0
    
    for i in range(TOTAL_PARTICIPANTS):
        base_target = round(5200 + rng.random() * 5200)
        day_count = round(98 + rng.random() * 14)
        total_days_across_all += day_count
        
        days = []
        valid_steps = []
        in_low = False
        low_remaining = 0
        
        for d in range(day_count):
            is_missing = rng.random() < 0.355
            steps = 0
            if not is_missing:
                if not in_low and rng.random() < 0.08:
                    in_low = True
                    low_remaining = math.floor(3 + rng.random() * 6)
                if in_low:
                    steps = max(800, round(base_target * (0.2 + rng.random() * 0.3)))
                    low_remaining -= 1
                    if low_remaining <= 0:
                        in_low = False
                else:
                    noise = rng.gauss(0, base_target * 0.22)
                    steps = max(1200, round(base_target + noise))
                valid_steps.append(steps)
            days.append({'steps': steps, 'is_missing': is_missing})
        
        valid_steps.sort()
        mid = len(valid_steps) // 2
        long_run_median = base_target if not valid_steps else (valid_steps[mid] if len(valid_steps) % 2 != 0 else (valid_steps[mid-1] + valid_steps[mid]) / 2)
        half_baseline = long_run_median * 0.5
        
        # Reference metrics
        for d in days:
            if not d['is_missing'] and d['steps'] >= half_baseline:
                all_days_ge_50pct += 1
                
        # Gaps >= 14 days
        cur_gap = 0
        for d in days:
            if d['is_missing'] or d['steps'] < half_baseline:
                cur_gap += 1
                if cur_gap == 14:
                    total_abandonment_gaps += 1
            else:
                cur_gap = 0
                
        # Episodes of low activity & time to return
        low_streak = 0
        ep_active = False
        days_in_ep = 0
        for d in days:
            is_low = d['is_missing'] or d['steps'] < half_baseline
            if is_low:
                low_streak += 1
                if low_streak == 3 and not ep_active:
                    ep_active = True
                    days_in_ep = 0
                elif ep_active:
                    days_in_ep += 1
            else:
                low_streak = 0
                if ep_active:
                    all_return_times.append(days_in_ep + 1)
                    ep_active = False
                    days_in_ep = 0
                    
        # Policy simulations
        p1_stk = p1_max = 0
        p2_stk = p2_max = 0
        p3_stk = p3_max = 0
        p4_stk = p4_max = 0
        p4_state = 'ON_TRACK'
        p4_below = p4_succ = 0
        
        history = []
        for i_day, d in enumerate(days):
            steps = d['steps']
            is_missing = d['is_missing']
            
            # Policy 1: Static 10k
            if not is_missing and steps >= 10000:
                p1_attained += 1
                p1_stk += 1
                if p1_stk > p1_max: p1_max = p1_stk
            else:
                p1_failed += 1
                if p1_stk > 0: p1_resets += 1
                p1_stk = 0
                
            # Rolling median
            valid_past = [h['steps'] for h in history[max(0, i_day - 28):i_day] if not h['is_missing'] and h['state'] != 'LAPSED']
            valid_past.sort()
            cur_baseline = valid_past[len(valid_past)//2] if len(valid_past) >= 7 else long_run_median
            
            # Policy 2: Streak Reset
            if not is_missing and steps >= cur_baseline:
                p2_attained += 1
                p2_stk += 1
                if p2_stk > p2_max: p2_max = p2_stk
            else:
                p2_failed += 1
                if p2_stk > 0: p2_resets += 1
                p2_stk = 0
                
            # Policy 3: Moving Average
            recent7 = [h['steps'] for h in history[max(0, i_day - 7):i_day] if not h['is_missing']]
            p3_tgt = sum(recent7)/len(recent7) if recent7 else cur_baseline
            if not is_missing and steps >= max(3000, p3_tgt):
                p3_attained += 1
                p3_stk += 1
                if p3_stk > p3_max: p3_max = p3_stk
            else:
                p3_failed += 1
                if p3_stk > 0: p3_resets += 1
                p3_stk = 0
                
            # Policy 4: WellSync Ladder
            active_tgt = cur_baseline * 0.5 if p4_state in ('LAPSED', 'RECOVERING') else cur_baseline
            is_p4_succ = not is_missing and steps >= active_tgt
            is_p4_below = not is_missing and steps < cur_baseline * 0.6
            
            if is_p4_succ:
                p4_attained += 1
                p4_active += 1
                p4_stk += 1
                if p4_stk > p4_max: p4_max = p4_stk
            else:
                p4_failed += 1
                p4_stk = 0
                
            if p4_state == 'ON_TRACK':
                if is_p4_below:
                    p4_below += 1
                    if p4_below >= 3:
                        p4_state = 'LAPSED'
                    else:
                        p4_state = 'SLIPPING'
                else:
                    p4_below = 0
            elif p4_state == 'SLIPPING':
                if is_p4_below:
                    p4_below += 1
                    if p4_below >= 3:
                        p4_state = 'LAPSED'
                elif is_p4_succ:
                    p4_state = 'ON_TRACK'
                    p4_below = 0
            elif p4_state == 'LAPSED':
                if is_p4_succ:
                    p4_state = 'RECOVERING'
                    p4_succ = 1
            elif p4_state == 'RECOVERING':
                if is_p4_succ:
                    p4_succ += 1
                    if p4_succ >= 2:
                        p4_state = 'ON_TRACK'
                        p4_returns += 1
                        p4_below = 0
                        p4_succ = 0
                else:
                    p4_succ = 0
                    
            history.append({'steps': steps, 'is_missing': is_missing, 'state': p4_state})
            
        p1_longest += p1_max
        p2_longest += p2_max
        p3_longest += p3_max
        p4_longest += p4_max

    print("Replay simulation completed successfully.")

if __name__ == "__main__":
    run_simulation()
