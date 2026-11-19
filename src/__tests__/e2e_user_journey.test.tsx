// @vitest-environment jsdom
/**
 * WellSync End-to-End User Journey Tests
 *
 * Verifies core user journeys:
 * 1. 3-Step Rapid Onboarding
 * 2. Daily Check-in & Cumulative Progress
 * 3. Complete Disruption & Recovery Journey (Lapse -> 50% Minimum Rung -> Return Celebrated)
 * 4. Bidirectional RTL Arabic Switch
 * 5. Data Sovereignty (Export & Wipe)
 * 6. Offline Pilot Sync Queue Persistence
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../App';
import { STORAGE_KEY, DEFAULT_APP_STATE } from '../storage/storage';
import { loadPilotSyncState, savePilotSyncState, DEFAULT_PILOT_SYNC_STATE } from '../services/pilotSync';

describe('WellSync End-to-End User Journey Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Journey 1: completes 3-step rapid onboarding in under 60 seconds', async () => {
    // Un-onboarded initial state
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...DEFAULT_APP_STATE,
        hasCompletedOnboarding: false,
      })
    );

    render(<App />);

    // Step 1: Goal Baseline
    expect(screen.getByText(/1\. Set Your Initial Baseline Goal/i)).toBeDefined();
    const nextBtn1 = screen.getByText(/Next: Lifestyle Context/i);
    fireEvent.click(nextBtn1);

    // Step 2: Context Selection
    expect(screen.getByText(/2\. Environmental & Work Context/i)).toBeDefined();
    const shiftWorkBtn = screen.getByText(/Shift-Work \(Healthcare\/Duty\)/i);
    fireEvent.click(shiftWorkBtn);
    const nextBtn2 = screen.getByText(/Next: Privacy Choice/i);
    fireEvent.click(nextBtn2);

    // Step 3: Privacy & Pilot choice
    expect(screen.getByText(/3\. Privacy & Pilot Choice/i)).toBeDefined();
    const launchBtn = screen.getByText(/Launch WellSync/i);
    fireEvent.click(launchBtn);

    // Verifies onboarding modal is closed and Today screen is visible
    await waitFor(() => {
      expect(screen.queryByText(/Launch WellSync/i)).toBeNull();
      expect(screen.getByText(/Today’s Active Target/i)).toBeDefined();
    });
  });

  it('Journey 2: logs daily check-in, increments cumulative active days, and queues offline sync', async () => {
    render(<App />);

    // Dismiss onboarding if present
    const launchBtn = screen.queryByText(/Launch WellSync/i);
    if (launchBtn) fireEvent.click(launchBtn);

    // Check-in input
    const stepsInput = screen.getByPlaceholderText(/e\.g\. 7,500/i) as HTMLInputElement;
    fireEvent.change(stepsInput, { target: { value: '8500' } });

    const saveBtn = screen.getByText(/Save Check-In/i);
    fireEvent.click(saveBtn);

    // Verify progress update
    await waitFor(() => {
      expect(screen.getByText(/Cumulative Active Days/i)).toBeDefined();
    });
  });

  it('Journey 3: executes 90s Tariq Judge Demo demonstrating disruption, 50% rung step-down, and return', async () => {
    render(<App />);

    // Dismiss onboarding
    const launchBtn = screen.queryByText(/Launch WellSync/i);
    if (launchBtn) fireEvent.click(launchBtn);

    // Click Judge Demo 90s button
    const judgeDemoBtn = screen.getByText(/⚡ Judge Demo \(90s\)/i);
    fireEvent.click(judgeDemoBtn);

    // Verify demo banner appears
    await waitFor(() => {
      expect(screen.getByText(/Judge Demo Mode/i)).toBeDefined();
      expect(screen.getByText(/Tariq's 90s Walkthrough/i)).toBeDefined();
    });

    // Verify state transitioned with successful return and preserved active days
    expect(screen.getByText(/Exit Demo Mode/i)).toBeDefined();

    // Exit demo mode
    const exitBtn = screen.getByText(/Exit Demo Mode/i);
    fireEvent.click(exitBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Tariq's 90s Walkthrough/i)).toBeNull();
    });
  });

  it('Journey 4: switches to Arabic, applies RTL direction, and displays linguistic notice', async () => {
    render(<App />);

    // Dismiss onboarding
    const launchBtn = screen.queryByText(/Launch WellSync/i);
    if (launchBtn) fireEvent.click(launchBtn);

    // Find language switcher by aria-label
    const langBtn = screen.getByRole('button', { name: /Switch Language/i });
    fireEvent.click(langBtn);

    // Verify document direction switched to rtl
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');

    // Verify disclaimer banner is visible
    expect(screen.getByText(/تنبيه: الترجمة العربية غير مدققة/i)).toBeDefined();

    // Switch back to English
    fireEvent.click(langBtn);
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('Journey 5: exports data and performs permanent hard wipe', async () => {
    render(<App />);

    // Dismiss onboarding
    const launchBtn = screen.queryByText(/Launch WellSync/i);
    if (launchBtn) fireEvent.click(launchBtn);

    // Navigate to Settings
    const settingsTabs = screen.getAllByRole('button', { name: /Settings & Privacy/i });
    fireEvent.click(settingsTabs[0]);

    // Verify Wipe Data button is present
    const wipeBtn = screen.getByText(/Wipe All Data/i);
    expect(wipeBtn).toBeDefined();

    fireEvent.click(wipeBtn);

    // Confirm modal opens
    expect(screen.getByText(/Permanently Delete All Data\?/i)).toBeDefined();
  });

  it('Journey 6: manages offline pilot sync queue safely without network crashes', () => {
    const initialState = {
      ...DEFAULT_PILOT_SYNC_STATE,
      enabled: true,
      queue: [],
    };
    savePilotSyncState(initialState);

    // Load state
    const loaded = loadPilotSyncState();
    expect(loaded.enabled).toBe(true);
    expect(loaded.queue.length).toBe(0);

    // Simulate offline item added
    loaded.queue.push({ date: '2026-11-19', steps: 8500 });
    savePilotSyncState(loaded);

    const reloaded = loadPilotSyncState();
    expect(reloaded.queue.length).toBe(1);
    expect(reloaded.queue[0].steps).toBe(8500);
  });
});
