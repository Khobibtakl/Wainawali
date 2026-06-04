/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Lesson {
  id: string;
  title: string;
  category: string;
  readingTime: string;
  icon: string;
  content: string[]; // split into beautiful paragraphs
  audioDuration: string;
  quiz: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface DailyTip {
  id: string;
  content: string;
  author?: string;
}

export interface CourageTask {
  id: string;
  task: string;
  xpReward: number;
  completedAt?: string; // ISO string if done
}

export interface SpeechTopic {
  id: string;
  topic: string;
  difficulty: "صادق" | "متوسط" | "سخت"; // Easy/Medium/Hard in Pashto
  category: string;
}

export interface VoiceRecording {
  id: string;
  title: string;
  topicId?: string;
  duration: number; // seconds
  recordedAt: string; // ISO string
  audioDataUrl?: string; // base64 or blob URL cached locally
  notes?: string;
}

export interface LessonNote {
  lessonId: string;
  content: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpRequired: number;
  unlockedAt?: string;
}

export interface ThemeConfig {
  id: string;
  name: string; // Pashto name
  nameEnglish: string;
  primary: string; // Tailwind color class e.g., 'indigo-600'
  primaryDark: string;
  accent: string;
  bgLight: string;
  bgDark: string;
  cardLight: string;
  cardDark: string;
  textLight: string;
  textDark: string;
  gradientFrom: string;
  gradientTo: string;
  borderLight: string;
  borderDark: string;
}

export interface UserState {
  name: string;
  gender: "male" | "female" | "other";
  joinedAt: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  completedLessons: string[]; // lessonIds
  favorites: string[]; // lessonIds
  completedQuizzes: Record<string, number>; // lessonId -> max score percent
  completedCourageTasks: string[]; // taskId -> completed dates
  customNotes: Record<string, string>; // lessonId -> note text
  recordingsCount: number;
  totalSpeakingTime: number; // in seconds
  completedChallenges: string[]; // challenge IDs or duration keys e.g., '1-min'
  levelProgress: number; // 0 to 100
  selectedThemeId: string;
  isDarkMode: boolean;
  isOnboarded: boolean;
}
