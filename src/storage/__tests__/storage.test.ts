/**
 * WellSync Storage Layer Unit Tests
 *
 * Verifies:
 * 1. Default fallback when storage is empty or absent
 * 2. Accurate persistence and reloading of custom state
 * 3. Export contents verification: metadata, profile, history, preferences, and zero tracking IDs
 * 4. Complete deletion: true removal of stored keys, resetting to default state
 * 5. Corrupted JSON resilience: gracefully recovers from malformed/corrupted localStorage strings without throwing
 * 6. Blocked storage resilience: gracefully handles SecurityError/DOMException on access without crashing
 * 7. Storage quota exceeded resilience: gracefully handles QuotaExceededError on setItem without throwing
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearAllUserData,
  DEFAULT_APP_STATE,
  downloadDataExport,
  exportUserDataAsJSON,
  importUserDataFromJSON,
  loadAppState,
  saveAppState,
  STORAGE_KEY,
} from '../storage';

describe('WellSync Storage Layer', () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => mockStore[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStore[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStore[key];
      }),
      clear: vi.fn(() => {
        mockStore = {};
      }),
      length: 0,
      key: vi.fn(() => null),
    };
  });

  afterEach(() => {
    clearAllUserData();
    vi.restoreAllMocks();
  });

  describe('Empty and Standard Storage Operations', () => {
    it('returns default state when localStorage is completely empty', () => {
      const state = loadAppState();
      expect(state).toEqual(DEFAULT_APP_STATE);
      expect(state.history).toEqual([]);
      expect(state.profile.userGoalSteps).toBe(8000);
      expect(state.profile.userGoalSleepMinutes).toBe(480);
      expect(state.quietHours.enabled).toBe(true);
    });

    it('saves and reloads state accurately with customized preferences', () => {
      const customState = {
        ...DEFAULT_APP_STATE,
        profile: { userGoalSteps: 9000, userGoalSleepMinutes: 450 },
        history: [{ date: '2026-11-01', steps: 9200, sleepMinutes: 460 }],
        hasCompletedOnboarding: true,
        quietHours: { enabled: false, start: '23:00', end: '06:00' },
        textSize: 'large' as const,
        language: 'ar' as const,
      };

      const saved = saveAppState(customState);
      expect(saved).toBe(true);

      const reloaded = loadAppState();
      expect(reloaded.profile.userGoalSteps).toBe(9000);
      expect(reloaded.profile.userGoalSleepMinutes).toBe(450);
      expect(reloaded.history.length).toBe(1);
      expect(reloaded.history[0].steps).toBe(9200);
      expect(reloaded.hasCompletedOnboarding).toBe(true);
      expect(reloaded.quietHours.enabled).toBe(false);
      expect(reloaded.textSize).toBe('large');
      expect(reloaded.language).toBe('ar');
    });
  });

  describe('Export Verification', () => {
    it('exports complete payload containing metadata, profile, history, preferences and zero identifiers', () => {
      const state = {
        ...DEFAULT_APP_STATE,
        profile: { userGoalSteps: 10000, userGoalSleepMinutes: 490 },
        history: [
          { date: '2026-11-01', steps: 8500, sleepMinutes: 480, contextNote: 'Park walk' },
          { date: '2026-11-02', steps: 9200, sleepMinutes: 510 },
        ],
        preferences: {
          quietHours: { enabled: true, start: '22:00', end: '07:00' },
          textSize: 'standard' as const,
          language: 'en' as const,
        },
      };

      const jsonStr = exportUserDataAsJSON(state);
      const parsed = JSON.parse(jsonStr);

      // Verify metadata schema
      expect(parsed.exportMetadata).toBeDefined();
      expect(parsed.exportMetadata.application).toBe('WellSync');
      expect(parsed.exportMetadata.version).toBe('0.1.0');
      expect(parsed.exportMetadata.exportedAt).toBeDefined();
      expect(typeof parsed.exportMetadata.exportedAt).toBe('string');
      expect(parsed.exportMetadata.description).toContain('Client-side personal behavioral wellness data');

      // Verify profile and history content
      expect(parsed.profile.userGoalSteps).toBe(10000);
      expect(parsed.profile.userGoalSleepMinutes).toBe(490);
      expect(parsed.history).toHaveLength(2);
      expect(parsed.history[0].date).toBe('2026-11-01');
      expect(parsed.history[0].steps).toBe(8500);
      expect(parsed.history[0].contextNote).toBe('Park walk');

      // Verify preferences
      expect(parsed.preferences.quietHours.enabled).toBe(true);
      expect(parsed.preferences.textSize).toBe('standard');
      expect(parsed.preferences.language).toBe('en');

      // Verify no account, user ID, email, or third-party telemetry keys exist
      expect(parsed.userId).toBeUndefined();
      expect(parsed.accountId).toBeUndefined();
      expect(parsed.email).toBeUndefined();
      expect(parsed.deviceToken).toBeUndefined();
    });

    it('safely handles browser download trigger without throwing', () => {
      // Mock document.createElement and body methods in node environment
      const mockAnchor: any = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      const origCreateElement = global.document?.createElement;
      const origAppendChild = global.document?.body?.appendChild;
      const origRemoveChild = global.document?.body?.removeChild;

      global.document = {
        ...(global.document || {}),
        createElement: vi.fn(() => mockAnchor),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        } as any,
      } as any;

      global.URL = {
        ...(global.URL || {}),
        createObjectURL: vi.fn(() => 'blob:mock-url'),
        revokeObjectURL: vi.fn(),
      } as any;

      expect(() => downloadDataExport(DEFAULT_APP_STATE)).not.toThrow();

      // Clean up mock
      if (origCreateElement) global.document.createElement = origCreateElement;
      if (origAppendChild) global.document.body.appendChild = origAppendChild;
      if (origRemoveChild) global.document.body.removeChild = origRemoveChild;
    });
  });

  describe('Complete Deletion Verification', () => {
    it('truly deletes all stored data when clearAllUserData is called', () => {
      saveAppState({
        ...DEFAULT_APP_STATE,
        history: [{ date: '2026-11-01', steps: 10000 }],
      });
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

      const wiped = clearAllUserData();
      expect(wiped).toBe(true);
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

      // Reloading after wipe yields default empty state
      const afterWipe = loadAppState();
      expect(afterWipe.history).toEqual([]);
      expect(afterWipe.profile.userGoalSteps).toBe(8000);
    });

    it('returns true gracefully when clearAllUserData is called on already empty storage', () => {
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
      const wiped = clearAllUserData();
      expect(wiped).toBe(true);
    });
  });

  describe('Corrupted JSON Handling', () => {
    it('gracefully recovers from syntactically malformed JSON in localStorage', () => {
      // Intentionally write truncated / broken JSON string
      mockStore[STORAGE_KEY] = '{"profile": {"userGoalSteps": 8000, "userGoalSleepMinutes": broken...';

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const state = loadAppState();

      // Should log warning and return safe default state without crashing
      expect(warnSpy).toHaveBeenCalled();
      expect(state).toEqual(DEFAULT_APP_STATE);
      expect(state.history).toEqual([]);
      expect(state.profile.userGoalSteps).toBe(8000);

      warnSpy.mockRestore();
    });

    it('gracefully recovers when stored JSON is not an object (e.g. number or null)', () => {
      mockStore[STORAGE_KEY] = '42';
      const state = loadAppState();
      expect(state.profile.userGoalSteps).toBe(8000);
      expect(state.history).toEqual([]);
    });

    it('sanitizes history if stored history is not an array', () => {
      mockStore[STORAGE_KEY] = JSON.stringify({
        ...DEFAULT_APP_STATE,
        history: 'not-an-array',
      });
      const state = loadAppState();
      expect(Array.isArray(state.history)).toBe(true);
      expect(state.history).toEqual([]);
    });
  });

  describe('Blocked or Full Storage Handling', () => {
    it('catches QuotaExceededError on setItem, logs error, and returns false without throwing', () => {
      (global.localStorage.setItem as any).mockImplementation(() => {
        const error = new Error('The quota has been exceeded.');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = saveAppState(DEFAULT_APP_STATE);

      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });

    it('gracefully survives when localStorage access throws SecurityError (blocked storage / private browsing)', () => {
      // Simulate environment where accessing window.localStorage or globalThis.localStorage throws SecurityError
      const originalLocalStorage = global.localStorage;

      Object.defineProperty(global, 'localStorage', {
        get() {
          const err = new Error('Access is denied for this document.');
          err.name = 'SecurityError';
          throw err;
        },
        configurable: true,
      });

      // Reading should not throw and should return default state
      expect(() => {
        const state = loadAppState();
        expect(state).toEqual(DEFAULT_APP_STATE);
      }).not.toThrow();

      // Writing should not throw and should return false
      expect(() => {
        const result = saveAppState(DEFAULT_APP_STATE);
        expect(result).toBe(false);
      }).not.toThrow();

      // Restore
      Object.defineProperty(global, 'localStorage', {
        value: originalLocalStorage,
        configurable: true,
        writable: true,
      });
    });

    it('successfully imports valid exported JSON data and restores state', () => {
      const stateToExport = {
        ...DEFAULT_APP_STATE,
        profile: { userGoalSteps: 9500, userGoalSleepMinutes: 500 },
        history: [{ date: '2026-11-05', steps: 9800 }],
        rejectedHypotheses: { weekend_dip: true },
        successfulStrategies: ['Take a 10-minute walk after meal'],
      };
      const jsonStr = exportUserDataAsJSON(stateToExport);
      const importResult = importUserDataFromJSON(jsonStr);

      expect(importResult.success).toBe(true);
      expect(importResult.state?.profile.userGoalSteps).toBe(9500);
      expect(importResult.state?.history.length).toBe(1);
      expect(importResult.state?.rejectedHypotheses.weekend_dip).toBe(true);
      expect(importResult.state?.successfulStrategies[0]).toBe('Take a 10-minute walk after meal');
    });

    it('rejects invalid or corrupted JSON on import without throwing', () => {
      const invalidRes1 = importUserDataFromJSON('not valid json');
      expect(invalidRes1.success).toBe(false);
      expect(invalidRes1.error).toBeDefined();

      const invalidRes2 = importUserDataFromJSON('');
      expect(invalidRes2.success).toBe(false);
    });
  });
});
