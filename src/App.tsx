/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Home,
  BookOpen,
  Mic,
  Shield,
  Trophy,
  Sun,
  Moon,
  Palette,
  Flame,
  Award,
  Sparkles,
  Menu,
  X,
  BadgeAlert
} from "lucide-react";
import { UserState, ThemeConfig, VoiceRecording } from "./types";
import { getTheme, THEMES } from "./utils/themes";
import SplashAndOnboarding from "./components/SplashAndOnboarding";
import HomeTab from "./components/HomeTab";
import LessonsTab from "./components/LessonsTab";
import VoiceRecorder from "./components/VoiceRecorder";
import ConfidenceTab from "./components/ConfidenceTab";
import DashboardTab from "./components/DashboardTab";

const LOCAL_STORAGE_KEY = "venawall_user_state_v1";

const INITIAL_USER_STATE: UserState = {
  name: "",
  gender: "male",
  joinedAt: new Date().toISOString(),
  xp: 100, // starting gift XP
  level: 1,
  streak: 1,
  lastActiveDate: new Date().toISOString().split("T")[0],
  completedLessons: [],
  favorites: [],
  completedQuizzes: {},
  completedCourageTasks: [],
  customNotes: {},
  recordingsCount: 0,
  totalSpeakingTime: 0,
  completedChallenges: [],
  levelProgress: 20,
  selectedThemeId: "emerald",
  isDarkMode: true, // Default to dark mode for luxury aesthetic
  isOnboarded: false,
};

export default function App() {
  const [userState, setUserState] = useState<UserState | null>(null);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Theme selector dropdown visibility
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // Voice recording state
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);

  // Hydrate state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: UserState = JSON.parse(saved);

        // Check streak update
        const todayStr = new Date().toISOString().split("T")[0];
        if (parsed.lastActiveDate !== todayStr) {
          const lastActive = new Date(parsed.lastActiveDate);
          const today = new Date(todayStr);
          const diffTime = Math.abs(today.getTime() - lastActive.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            parsed.streak += 1;
          } else if (diffDays > 1) {
            parsed.streak = 1; // reset streak if gap exists
          }
          parsed.lastActiveDate = todayStr;
        }

        setUserState(parsed);
      } else {
        setUserState(INITIAL_USER_STATE);
      }
    } catch (err) {
      console.error("Local storage hydration error", err);
      setUserState(INITIAL_USER_STATE);
    }

    // Hydrate recordings titles list
    try {
      const savedRecs = localStorage.getItem("venawall_recordings_meta");
      if (savedRecs) {
        setRecordings(JSON.parse(savedRecs));
      }
    } catch (err) {
      console.error("Hydrating recordings meta error", err);
    }
  }, []);

  // Serialize state to localStorage on modification
  useEffect(() => {
    if (userState) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userState));
    }
  }, [userState]);

  // Handle local META registrations for practices history
  const handleAddRecording = (rec: VoiceRecording) => {
    const updated = [rec, ...recordings];
    setRecordings(updated);
    localStorage.setItem("venawall_recordings_meta", JSON.stringify(updated));

    if (userState) {
      setUserState({
        ...userState,
        recordingsCount: (userState.recordingsCount || 0) + 1,
        totalSpeakingTime: (userState.totalSpeakingTime || 0) + rec.duration,
      });
    }
  };

  const handleDeleteRecording = (id: string) => {
    const filtered = recordings.filter((r) => r.id !== id);
    setRecordings(filtered);
    localStorage.setItem("venawall_recordings_meta", JSON.stringify(filtered));

    if (userState) {
      setUserState({
        ...userState,
        recordingsCount: Math.max(0, (userState.recordingsCount || 1) - 1),
      });
    }
  };

  // Onboarding Complete Handler
  const handleOnboardingComplete = (name: string, gender: "male" | "female" | "other", goals: string[]) => {
    if (userState) {
      setUserState({
        ...userState,
        name,
        gender,
        isOnboarded: true,
        xp: userState.xp + 50, // bonus for completing onboarding
      });
    }
  };

  // Gamification: add XP and level calculation engine
  const handleAddXp = (amount: number) => {
    if (!userState) return;

    const newXp = userState.xp + amount;
    // Calculate new level. Levels cost level * 500 XP
    let currentLevel = userState.level;
    let threshold = currentLevel * 500;

    while (newXp >= threshold) {
      currentLevel += 1;
      threshold = currentLevel * 500;
    }

    // Level progress percentage
    const prevThreshold = (currentLevel - 1) * 500;
    const progress = Math.min(
      100,
      Math.max(0, Math.round(((newXp - prevThreshold) / (threshold - prevThreshold)) * 100))
    );

    setUserState({
      ...userState,
      xp: newXp,
      level: currentLevel,
      levelProgress: progress,
    });
  };

  // Favorites Toggles
  const handleToggleFavorite = (lessonId: string) => {
    if (!userState) return;

    const isFav = userState.favorites.includes(lessonId);
    let updated: string[];

    if (isFav) {
      updated = userState.favorites.filter((id) => id !== lessonId);
    } else {
      updated = [...userState.favorites, lessonId];
    }

    setUserState({
      ...userState,
      favorites: updated,
    });
  };

  // Lesson Completers
  const handleMarkLessonComplete = (lessonId: string) => {
    if (!userState) return;
    if (userState.completedLessons.includes(lessonId)) return;

    setUserState({
      ...userState,
      completedLessons: [...userState.completedLessons, lessonId],
    });
  };

  // Notes synchronization
  const handleSaveLessonNote = (lessonId: string, text: string) => {
    if (!userState) return;

    setUserState({
      ...userState,
      customNotes: {
        ...userState.customNotes,
        [lessonId]: text,
      },
    });
  };

  // Quizzes Completers
  const handleQuizComplete = (lessonId: string, scorePercent: number) => {
    if (!userState) return;

    const prevBest = userState.completedQuizzes[lessonId] || 0;
    const newBest = Math.max(prevBest, scorePercent);

    setUserState({
      ...userState,
      completedQuizzes: {
        ...userState.completedQuizzes,
        [lessonId]: newBest,
      },
    });
  };

  // Courage Task Completers
  const handleCompleteCourageTask = (taskId: string, xpReward: number) => {
    if (!userState) return;
    if (userState.completedCourageTasks.includes(taskId)) return;

    setUserState({
      ...userState,
      completedCourageTasks: [...userState.completedCourageTasks, taskId],
    });
    handleAddXp(xpReward);
  };

  // Toggles themes and modes
  const handleSelectTheme = (themeId: string) => {
    if (!userState) return;
    setUserState({
      ...userState,
      selectedThemeId: themeId,
    });
    setShowThemeSelector(false);
  };

  const handleToggleDarkMode = () => {
    if (!userState) return;
    setUserState({
      ...userState,
      isDarkMode: !userState.isDarkMode,
    });
  };

  // Early loaders
  if (!userState) {
    return (
      <div className="fixed inset-0 bg-[#07140e] flex items-center justify-center text-white font-mono text-sm leading-relaxed text-center">
        بارګیري پیل شوه... مهرباني وکړئ صبر وکړئ
      </div>
    );
  }

  // Active theme configuration helper
  const activeTheme = getTheme(userState.selectedThemeId);

  // If Onboarding step is still due, enforce launcher flow
  if (!userState.isOnboarded) {
    return (
      <SplashAndOnboarding
        onComplete={handleOnboardingComplete}
        theme={activeTheme}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${userState.isDarkMode ? activeTheme.bgDark + " text-white" : activeTheme.bgLight + " text-zinc-900"} duration-300 transition-colors relative overflow-x-hidden`} style={{ fontFamily: "'Vazirmatn', sans-serif" }} dir="rtl">
      {/* Visual Ambient backgrounds */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navbar */}
      <header className={`sticky top-0 z-30 transition-all duration-300 p-4 border-b backdrop-blur-md ${userState.isDarkMode ? "bg-zinc-950/80 border-zinc-800/60" : "bg-white/80 border-zinc-200/60"}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-emerald-600 to-teal-700 p-2.5 rounded-xl text-white shadow shadow-emerald-500/10">
              <Mic className="w-5 h-5 shrink-0" />
            </div>

            <div className="flex flex-col text-right">
              <h1 className="text-xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                ویناوال
              </h1>
              <span className="text-[10px] text-zinc-400 font-mono">v e a n w a l &bull; p u b l i c s p e a k i n g</span>
            </div>
          </div>

          {/* Core Controls: Theme selector, dark toggle, stats counter */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Theme dropdown toggle trigger */}
            <div className="relative">
              <button
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className="p-2 ml-1 rounded-xl transition hover:bg-zinc-150 dark:hover:bg-zinc-800 text-zinc-500 hover:text-emerald-500"
                title="لوکس پوښ بدلون (لس ډوله)"
              >
                <Palette className="w-4.5 h-4.5" />
              </button>

              {showThemeSelector && (
                <div className={`absolute left-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 shadow-2xl w-48 overflow-y-auto max-h-60 z-50 text-right`}>
                  <div className="text-[10px] font-bold text-zinc-400 px-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/80 mb-1 leading-normal uppercase text-center">
                    د کور لوکس لس خوندور رنګونه
                  </div>
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`w-full p-2 text-xs font-bold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between gap-2 text-zinc-800 dark:text-zinc-200 transition ${
                        userState.selectedThemeId === theme.id ? "bg-emerald-500/10 text-emerald-500" : ""
                      }`}
                    >
                      <span>{theme.name}</span>
                      <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${theme.gradientFrom} ${theme.gradientTo}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark/Light trigger button */}
            <button
              onClick={handleToggleDarkMode}
              className="p-2 ml-1 rounded-xl transition hover:bg-zinc-150 dark:hover:bg-zinc-800 text-zinc-500 hover:text-amber-500"
            >
              {userState.isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* General XP summary indicator */}
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-extrabold flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 fill-current" />
              <span className="font-mono">{userState.xp} XP</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Tab View wrapper panel */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8 pb-32">
        {activeTab === "home" && (
          <HomeTab
            theme={activeTheme}
            userState={userState}
            onNavigateToTab={setActiveTab}
            onSetActiveLessonId={setActiveLessonId}
            onAddXp={handleAddXp}
          />
        )}
        {activeTab === "lessons" && (
          <LessonsTab
            theme={activeTheme}
            completedLessons={userState.completedLessons}
            favorites={userState.favorites}
            customNotes={userState.customNotes}
            onToggleFavorite={handleToggleFavorite}
            onMarkComplete={handleMarkLessonComplete}
            onSaveNote={handleSaveLessonNote}
            onAddXp={handleAddXp}
            completedQuizzes={userState.completedQuizzes}
            onQuizComplete={handleQuizComplete}
            activeLessonId={activeLessonId}
            setActiveLessonId={setActiveLessonId}
          />
        )}
        {activeTab === "practice" && (
          <VoiceRecorder
            theme={activeTheme}
            recordings={recordings}
            onAddRecording={handleAddRecording}
            onDeleteRecording={handleDeleteRecording}
            xpPoints={userState.xp}
            onAddXp={handleAddXp}
          />
        )}
        {activeTab === "confidence" && (
          <ConfidenceTab
            theme={activeTheme}
            completedTasks={userState.completedCourageTasks}
            onCompleteTask={handleCompleteCourageTask}
            streakCount={userState.streak}
          />
        )}
        {activeTab === "dashboard" && (
          <DashboardTab
            theme={activeTheme}
            userState={userState}
            onAddXp={handleAddXp}
          />
        )}
      </main>

      {/* Bottom Sticky Unified App bar Navigation */}
      <nav className={`fixed bottom-0 inset-x-0 z-30 p-4 border-t backdrop-blur-md ${userState.isDarkMode ? "bg-zinc-950/90 border-zinc-850" : "bg-white/90 border-zinc-200"}`}>
        <div className="max-w-xl mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === "home" ? "text-emerald-500 font-bold" : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">کور پاڼه</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("lessons");
              // reset active lesson if clicked directly
              setActiveLessonId(null);
            }}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === "lessons" || activeLessonId !== null ? "text-emerald-500 font-bold" : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px]">درسونه</span>
          </button>

          <button
            onClick={() => setActiveTab("practice")}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === "practice" ? "text-emerald-500 font-bold" : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            <Mic className="w-5 h-5" />
            <span className="text-[10px]">سخر تمرین</span>
          </button>

          <button
            onClick={() => setActiveTab("confidence")}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === "confidence" ? "text-emerald-500 font-bold" : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px]">د جرئت لاره</span>
          </button>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === "dashboard" ? "text-emerald-500 font-bold" : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px]">نمرې او لاسته</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
