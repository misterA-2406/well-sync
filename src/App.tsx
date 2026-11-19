import { useState, useEffect, useMemo } from 'react';
import { Navbar, ScreenTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { TodayScreen } from './screens/TodayScreen';
import { RecoveryScreen } from './screens/RecoveryScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AboutScreen } from './screens/AboutScreen';
import { EvidenceScreen } from './screens/EvidenceScreen';
import { OnboardingModal } from './screens/OnboardingModal';
import {
  AppStorageState,
  clearAllUserData,
  downloadDataExport,
  importUserDataFromJSON,
  loadAppState,
  saveAppState,
  DEFAULT_APP_STATE,
} from './storage/storage';
import { BehaviorMetric, DailyRecord, UserEngineProfile } from './engine/types';
import { evaluateHistory } from './engine/state';
import { SyntheticPersona } from './data/syntheticPersonas';
import { queueCheckinForPilotSync } from './services/pilotSync';

export function App() {
  const [appState, setAppState] = useState<AppStorageState>(() => loadAppState());
  const [currentTab, setCurrentTab] = useState<ScreenTab>('today');
  const [activeMetric, setActiveMetric] = useState<BehaviorMetric>('steps');

  // Sync to local storage on state updates
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Set document direction for Arabic support
  useEffect(() => {
    if (appState.language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  }, [appState.language]);

  // Evaluate history dynamically through engine
  const evaluatedResults = useMemo(() => {
    const goal =
      activeMetric === 'steps'
        ? appState.profile.userGoalSteps
        : appState.profile.userGoalSleepMinutes;
    return evaluateHistory(appState.history, goal, activeMetric, undefined, appState.contextConfig);
  }, [appState.history, appState.profile, activeMetric, appState.contextConfig]);

  const latestResult = evaluatedResults.length > 0 ? evaluatedResults[evaluatedResults.length - 1] : null;

  // Automatically archive active commitment when recovery successfully completes
  useEffect(() => {
    if (
      latestResult &&
      latestResult.state === 'ON_TRACK' &&
      latestResult.previousState === 'RECOVERING' &&
      appState.activeRecoveryCommitment
    ) {
      const commitmentText = appState.activeRecoveryCommitment.text;
      setAppState((prev) => ({
        ...prev,
        activeRecoveryCommitment: undefined,
        completedRecoveryStrategies: prev.completedRecoveryStrategies.includes(commitmentText)
          ? prev.completedRecoveryStrategies
          : [commitmentText, ...prev.completedRecoveryStrategies].slice(0, 5),
      }));
    }
  }, [latestResult, appState.activeRecoveryCommitment]);

  // Handlers
  const handleCompleteOnboarding = (profile: UserEngineProfile) => {
    setAppState((prev) => ({
      ...prev,
      profile,
      hasCompletedOnboarding: true,
    }));
  };

  const handleSaveRecord = (record: DailyRecord) => {
    setAppState((prev) => {
      // If record for this date already exists, update it; otherwise append
      const existingIdx = prev.history.findIndex((r) => r.date === record.date);
      let newHistory: DailyRecord[];
      if (existingIdx >= 0) {
        newHistory = [...prev.history];
        newHistory[existingIdx] = { ...newHistory[existingIdx], ...record };
      } else {
        newHistory = [...prev.history, record];
      }
      if (record.steps != null) {
        queueCheckinForPilotSync({
          date: record.date,
          steps: record.steps,
          minutesAsleep: record.sleepMinutes != null ? record.sleepMinutes : undefined,
        });
      }
      return {
        ...prev,
        history: newHistory,
      };
    });
  };

  const handleCommitMicroAction = (commitmentText: string) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    handleSaveRecord({
      date: todayStr,
      contextNote: `Recovery Commitment: ${commitmentText}`,
    });
    // Record as selected active commitment during this recovery cycle
    setAppState((prev) => ({
      ...prev,
      activeRecoveryCommitment: { text: commitmentText, selectedDate: todayStr },
    }));
  };

  const handleToggleRejectHypothesis = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      rejectedHypotheses: {
        ...prev.rejectedHypotheses,
        [id]: !prev.rejectedHypotheses[id],
      },
    }));
  };

  const handleUpdateContextConfig = (newContextConfig: any) => {
    setAppState((prev) => ({
      ...prev,
      contextConfig: newContextConfig,
    }));
  };

  const handleImportData = (jsonStr: string): { success: boolean; error?: string } => {
    const res = importUserDataFromJSON(jsonStr);
    if (res.success && res.state) {
      setAppState(res.state);
      return { success: true };
    }
    return { success: false, error: res.error || 'Import failed' };
  };

  const handleUpdateProfile = (profile: UserEngineProfile) => {
    setAppState((prev) => ({ ...prev, profile }));
  };

  const handleUpdateQuietHours = (quietHours: { enabled: boolean; start: string; end: string }) => {
    setAppState((prev) => ({ ...prev, quietHours }));
  };

  const handleChangeTextSize = (textSize: 'standard' | 'large' | 'xl') => {
    setAppState((prev) => ({ ...prev, textSize }));
  };

  const handleToggleLanguage = () => {
    setAppState((prev) => ({
      ...prev,
      language: prev.language === 'en' ? 'ar' : 'en',
    }));
  };

  const handleLoadSyntheticPersona = (persona: SyntheticPersona) => {
    setAppState((prev) => ({
      ...prev,
      profile: persona.profile,
      history: [...persona.history],
      hasCompletedOnboarding: true,
    }));
    setCurrentTab('today');
  };

  const handleExportData = () => {
    downloadDataExport(appState);
  };

  const handleDeleteAllData = () => {
    clearAllUserData();
    setAppState({ ...DEFAULT_APP_STATE });
    setCurrentTab('today');
  };

  // Text scaling class helper
  const getTextSizeClass = () => {
    switch (appState.textSize) {
      case 'large':
        return 'text-[1.0625rem]';
      case 'xl':
        return 'text-[1.125rem]';
      default:
        return 'text-sm';
    }
  };

  return (
    <div className={`min-h-screen bg-[#F5F5EF] text-[#25332D] flex flex-col justify-between ${getTextSizeClass()}`}>
      <div>
        <Navbar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          currentState={latestResult?.state ?? 'ON_TRACK'}
          textSize={appState.textSize}
          onChangeTextSize={handleChangeTextSize}
          language={appState.language}
          onToggleLanguage={handleToggleLanguage}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8">
          {currentTab === 'today' && (
            <TodayScreen
              profile={appState.profile}
              latestResult={latestResult}
              historyResults={evaluatedResults}
              metric={activeMetric}
              language={appState.language}
              contextConfig={appState.contextConfig}
              onChangeMetric={setActiveMetric}
              onSaveRecord={handleSaveRecord}
              onNavigateToRecovery={() => setCurrentTab('recovery')}
              onUpdateContextConfig={handleUpdateContextConfig}
            />
          )}

        {currentTab === 'recovery' && (
          <RecoveryScreen
            profile={appState.profile}
            latestResult={latestResult}
            metric={activeMetric}
            language={appState.language}
            rejectedHypotheses={appState.rejectedHypotheses}
            completedRecoveryStrategies={appState.completedRecoveryStrategies}
            activeRecoveryCommitment={appState.activeRecoveryCommitment}
            onToggleRejectHypothesis={handleToggleRejectHypothesis}
            onCommitMicroAction={handleCommitMicroAction}
            onNavigateToToday={() => setCurrentTab('today')}
          />
        )}

        {currentTab === 'history' && (
          <HistoryScreen
            profile={appState.profile}
            historyResults={evaluatedResults}
            metric={activeMetric}
            language={appState.language}
            onChangeMetric={setActiveMetric}
            onNavigateToToday={() => setCurrentTab('today')}
            onNavigateToSettings={() => setCurrentTab('settings')}
          />
        )}

        {currentTab === 'evidence' && <EvidenceScreen language={appState.language} />}

        {currentTab === 'settings' && (
          <SettingsScreen
            profile={appState.profile}
            quietHours={appState.quietHours}
            textSize={appState.textSize}
            language={appState.language}
            onUpdateProfile={handleUpdateProfile}
            onUpdateQuietHours={handleUpdateQuietHours}
            onChangeTextSize={handleChangeTextSize}
            onLoadSyntheticPersona={handleLoadSyntheticPersona}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onDeleteAllData={handleDeleteAllData}
          />
        )}

        {currentTab === 'about' && <AboutScreen language={appState.language} />}
      </main>
      </div>

      <Footer language={appState.language} onSelectTab={setCurrentTab} />

      {/* First-time Onboarding Modal */}
      {!appState.hasCompletedOnboarding && (
        <OnboardingModal
          initialProfile={appState.profile}
          language={appState.language}
          onComplete={handleCompleteOnboarding}
        />
      )}
    </div>
  );
}

export default App;
