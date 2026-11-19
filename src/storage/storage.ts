/**
 * WellSync - Client-side Storage Layer
 *
 * Strict Privacy & Resilience Guarantees:
 * - 100% browser-local (localStorage). Zero external network requests.
 * - Every read and write is wrapped in try/catch to survive private browsing, quotas, and empty states.
 * - Real Data Export: generates clean, unencrypted JSON download.
 * - Real Data Wipe: "Delete All Data" removes keys and resets state immediately.
 */

import { DailyRecord, UserEngineProfile } from '../engine/types';
import { DEFAULT_CONTEXT_CONFIG, UserContextConfig } from '../engine/contextModes';

export interface AppStorageState {
  profile: UserEngineProfile;
  history: DailyRecord[];
  hasCompletedOnboarding: boolean;
  quietHours: { enabled: boolean; start: string; end: string };
  textSize: 'standard' | 'large' | 'xl';
  language: 'en' | 'ar';
  rejectedHypotheses: Record<string, boolean>;
  activeRecoveryCommitment?: { text: string; selectedDate: string };
  completedRecoveryStrategies: string[];
  successfulStrategies?: string[]; // Backward compatibility alias
  contextConfig: UserContextConfig;
}

export const STORAGE_KEY = 'wellsync_app_data_v1';

export const DEFAULT_APP_STATE: AppStorageState = {
  profile: {
    userGoalSteps: 8000,
    userGoalSleepMinutes: 480, // 8 hours
  },
  history: [],
  hasCompletedOnboarding: false,
  quietHours: { enabled: true, start: '22:00', end: '07:00' },
  textSize: 'standard',
  language: 'en',
  rejectedHypotheses: {},
  completedRecoveryStrategies: [],
  successfulStrategies: [],
  contextConfig: DEFAULT_CONTEXT_CONFIG,
};

/**
 * Safe accessor for localStorage supporting both browser (window) and test (globalThis) environments.
 */
function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Reads app state from localStorage with safe fallback.
 */
export function loadAppState(): AppStorageState {
  try {
    const storage = getStorage();
    if (!storage) {
      return { ...DEFAULT_APP_STATE };
    }
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_APP_STATE };
    }
    const parsed = JSON.parse(raw);
    const legacyStrategies = Array.isArray(parsed.successfulStrategies) ? parsed.successfulStrategies : [];
    const completedRecoveryStrategies = (Array.isArray(parsed.completedRecoveryStrategies) && parsed.completedRecoveryStrategies.length > 0)
      ? parsed.completedRecoveryStrategies
      : legacyStrategies;

    return {
      ...DEFAULT_APP_STATE,
      ...parsed,
      profile: { ...DEFAULT_APP_STATE.profile, ...(parsed.profile || {}) },
      quietHours: { ...DEFAULT_APP_STATE.quietHours, ...(parsed.quietHours || {}) },
      history: Array.isArray(parsed.history) ? parsed.history : [],
      rejectedHypotheses: parsed.rejectedHypotheses && typeof parsed.rejectedHypotheses === 'object' ? parsed.rejectedHypotheses : {},
      activeRecoveryCommitment: parsed.activeRecoveryCommitment,
      completedRecoveryStrategies,
      successfulStrategies: completedRecoveryStrategies,
      contextConfig: parsed.contextConfig && typeof parsed.contextConfig === 'object'
        ? {
            ...DEFAULT_CONTEXT_CONFIG,
            ...parsed.contextConfig,
            shiftPattern: { ...DEFAULT_CONTEXT_CONFIG.shiftPattern, ...(parsed.contextConfig.shiftPattern || {}) },
            plannedPause: { ...DEFAULT_CONTEXT_CONFIG.plannedPause, ...(parsed.contextConfig.plannedPause || {}) },
          }
        : DEFAULT_CONTEXT_CONFIG,
    };
  } catch (error) {
    console.warn('[WellSync Storage] Failed to read from localStorage, using defaults:', error);
    return { ...DEFAULT_APP_STATE };
  }
}

/**
 * Writes app state to localStorage wrapped in try/catch.
 */
export function saveAppState(state: AppStorageState): boolean {
  try {
    const storage = getStorage();
    if (!storage) {
      return false;
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('[WellSync Storage] Failed to write to localStorage:', error);
    return false;
  }
}

/**
 * Exports all user data as a formatted JSON string for download.
 */
export function exportUserDataAsJSON(state: AppStorageState): string {
  try {
    const exportPayload = {
      exportMetadata: {
        application: 'WellSync',
        version: '0.1.0',
        exportedAt: new Date().toISOString(),
        description: 'Client-side personal behavioral wellness data. No external server storage.',
      },
      profile: state.profile,
      history: state.history,
      rejectedHypotheses: state.rejectedHypotheses || {},
      activeRecoveryCommitment: state.activeRecoveryCommitment,
      completedRecoveryStrategies: (state.completedRecoveryStrategies && state.completedRecoveryStrategies.length > 0)
        ? state.completedRecoveryStrategies
        : (state.successfulStrategies || []),
      successfulStrategies: (state.completedRecoveryStrategies && state.completedRecoveryStrategies.length > 0)
        ? state.completedRecoveryStrategies
        : (state.successfulStrategies || []),
      preferences: {
        quietHours: state.quietHours,
        textSize: state.textSize,
        language: state.language,
      },
    };
    return JSON.stringify(exportPayload, null, 2);
  } catch (error) {
    console.error('[WellSync Storage] Failed to export JSON data:', error);
    return '{}';
  }
}

/**
 * Validates and imports user data from an exported JSON string.
 * Returns true and the parsed state upon successful validation, or error details.
 */
export function importUserDataFromJSON(jsonStr: string): {
  success: boolean;
  state?: AppStorageState;
  error?: string;
} {
  try {
    if (!jsonStr || typeof jsonStr !== 'string') {
      return { success: false, error: 'Empty or invalid file content' };
    }
    const data = JSON.parse(jsonStr);

    // Validate that either exportMetadata exists or profile exists
    const profile = data.profile || DEFAULT_APP_STATE.profile;
    if (typeof profile !== 'object' || profile === null) {
      return { success: false, error: 'Missing or malformed profile object' };
    }

    const goalSteps = Number(profile.userGoalSteps);
    const goalSleep = Number(profile.userGoalSleepMinutes);

    const validatedProfile: UserEngineProfile = {
      userGoalSteps: !isNaN(goalSteps) && goalSteps >= 1000 ? goalSteps : 8000,
      userGoalSleepMinutes: !isNaN(goalSleep) && goalSleep >= 120 ? goalSleep : 480,
    };

    // Validate history
    const historyList = Array.isArray(data.history) ? data.history : [];
    const validatedHistory: DailyRecord[] = [];

    for (const r of historyList) {
      if (r && typeof r === 'object' && typeof r.date === 'string') {
        validatedHistory.push({
          date: r.date.slice(0, 10),
          steps: typeof r.steps === 'number' && !isNaN(r.steps) ? Math.max(0, Math.min(100000, r.steps)) : null,
          sleepMinutes: typeof r.sleepMinutes === 'number' && !isNaN(r.sleepMinutes) ? Math.max(0, Math.min(1440, r.sleepMinutes)) : null,
          isMissing: Boolean(r.isMissing),
          isRestDeclared: Boolean(r.isRestDeclared),
          contextNote: typeof r.contextNote === 'string' ? r.contextNote.slice(0, 300) : undefined,
        });
      }
    }

    const preferences = data.preferences || {};
    const quietHours = preferences.quietHours || DEFAULT_APP_STATE.quietHours;
    const textSize = ['standard', 'large', 'xl'].includes(preferences.textSize) ? preferences.textSize : 'standard';
    const language = ['en', 'ar'].includes(preferences.language) ? preferences.language : 'en';

    const legacyImportStrategies = Array.isArray(data.successfulStrategies) ? data.successfulStrategies : [];
    const completedRecoveryStrategies = (Array.isArray(data.completedRecoveryStrategies) && data.completedRecoveryStrategies.length > 0)
      ? data.completedRecoveryStrategies
      : legacyImportStrategies;

    const newState: AppStorageState = {
      profile: validatedProfile,
      history: validatedHistory,
      hasCompletedOnboarding: true,
      quietHours: {
        enabled: Boolean(quietHours.enabled),
        start: typeof quietHours.start === 'string' ? quietHours.start : '22:00',
        end: typeof quietHours.end === 'string' ? quietHours.end : '07:00',
      },
      textSize,
      language,
      rejectedHypotheses: data.rejectedHypotheses && typeof data.rejectedHypotheses === 'object' ? data.rejectedHypotheses : {},
      activeRecoveryCommitment: data.activeRecoveryCommitment,
      completedRecoveryStrategies,
      successfulStrategies: completedRecoveryStrategies,
      contextConfig: data.contextConfig && typeof data.contextConfig === 'object'
        ? { ...DEFAULT_CONTEXT_CONFIG, ...data.contextConfig }
        : DEFAULT_CONTEXT_CONFIG,
    };

    saveAppState(newState);
    return { success: true, state: newState };
  } catch (error) {
    console.error('[WellSync Storage] Import failed:', error);
    return { success: false, error: 'Invalid JSON format or corrupted file' };
  }
}

/**
 * Triggers browser download of user's personal data file.
 */
export function downloadDataExport(state: AppStorageState): void {
  try {
    const jsonStr = exportUserDataAsJSON(state);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wellsync_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('[WellSync Storage] Browser download failed:', error);
  }
}

/**
 * Permanently removes all WellSync data from the browser.
 */
export function clearAllUserData(): boolean {
  try {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(STORAGE_KEY);
    }
    return true;
  } catch (error) {
    console.error('[WellSync Storage] Failed to clear localStorage:', error);
    return false;
  }
}
