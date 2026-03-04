import { Timestamp } from "firebase/firestore";

// ============================================================
// Categories
// ============================================================

export type Category =
  | "work"
  | "health"
  | "learning"
  | "leisure"
  | "personal"
  | "sleep"
  | "commute"
  | "social"
  | "creative"
  | "custom";

export const CATEGORY_COLORS: Record<Category | "idle" | "busy" | "unaccounted", string> = {
  work: "#3B82F6",
  health: "#22C55E",
  learning: "#A855F7",
  leisure: "#F97316",
  personal: "#EC4899",
  sleep: "#6366F1",
  commute: "#6B7280",
  social: "#EAB308",
  creative: "#14B8A6",
  custom: "#8B5CF6",
  idle: "#D1D5DB",
  busy: "#F59E0B",
  unaccounted: "#EF4444",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  work: "Work",
  health: "Health",
  learning: "Learning",
  leisure: "Leisure",
  personal: "Personal",
  sleep: "Sleep",
  commute: "Commute",
  social: "Social",
  creative: "Creative",
  custom: "Custom",
};

// ============================================================
// User
// ============================================================

export interface UserSettings {
  defaultCheckInInterval: number;
  gracePeriod: number;
  silentHoursStart: string;
  silentHoursEnd: string;
  dayScoreThreshold: number;
  timezone: string;
  weekStartsOn: "monday" | "sunday";
  timeSlotIncrement: number;
  weeklyReviewDay: string;
  notificationPreferences: {
    checkInPing: boolean;
    blockTransition: boolean;
    busyFollowUp: boolean;
    gapAlert: boolean;
    streakWarning: boolean;
    weeklyReview: boolean;
    morningBrief: boolean;
  };
  onboardingCompleted: boolean;
  dismissedHints: string[];
  featureNudgesShown: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  settings: UserSettings;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  defaultCheckInInterval: 30,
  gracePeriod: 5,
  silentHoursStart: "23:00",
  silentHoursEnd: "06:00",
  dayScoreThreshold: 70,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  weekStartsOn: "monday",
  timeSlotIncrement: 15,
  weeklyReviewDay: "sunday",
  notificationPreferences: {
    checkInPing: true,
    blockTransition: true,
    busyFollowUp: true,
    gapAlert: true,
    streakWarning: true,
    weeklyReview: true,
    morningBrief: true,
  },
  onboardingCompleted: false,
  dismissedHints: [],
  featureNudgesShown: [],
};

// ============================================================
// Routine
// ============================================================

export interface Routine {
  id: string;
  userId: string;
  name: string;
  description?: string;
  activeDays: number[];
  isDefault: boolean;
  timeBlocks: TimeBlock[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================
// Time Block
// ============================================================

export interface PomodoroConfig {
  defaultWorkDuration: number;
  defaultBreakDuration: number;
  longBreakInterval: number;
  longBreakDuration: number;
  autoAdvance: boolean;
  autoGenerateSlots: boolean;
}

export const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  defaultWorkDuration: 25,
  defaultBreakDuration: 5,
  longBreakInterval: 4,
  longBreakDuration: 15,
  autoAdvance: true,
  autoGenerateSlots: true,
};

export interface TimeBlock {
  id: string;
  routineId: string;
  name: string;
  category: Category;
  color: string;
  startTime: string;
  endTime: string;
  checkInInterval?: number;
  subRoutines: SubRoutine[];
  pomodoroEnabled: boolean;
  pomodoroConfig: PomodoroConfig;
  pomodoroSlots: PomodoroSlot[];
  order: number;
}

// ============================================================
// Sub-Routine
// ============================================================

export interface SubRoutine {
  id: string;
  timeBlockId: string;
  name: string;
  description?: string;
  estimatedDuration: number;
  priority: "must" | "should" | "nice";
  order: number;
}

// ============================================================
// Pomodoro Slot
// ============================================================

export interface PomodoroSlot {
  id: string;
  timeBlockId: string;
  type: "work" | "break" | "long-break";
  workDuration: number;
  breakDuration: number;
  linkedSubRoutineId?: string;
  order: number;
}

// ============================================================
// Pomodoro Session (Runtime)
// ============================================================

export type PomodoroStatus =
  | "completed"
  | "abandoned"
  | "skipped"
  | "paused"
  | "in-progress"
  | "not-started";

export interface PomodoroSession {
  id: string;
  userId: string;
  date: string;
  timeBlockId: string;
  pomodoroSlotId: string;
  status: PomodoroStatus;
  plannedDuration: number;
  actualDuration: number;
  startedAt: Timestamp;
  endedAt?: Timestamp;
  xpEarned: number;
  streakPosition: number;
  linkedSubRoutineId?: string;
}

// ============================================================
// Activity Log Entry
// ============================================================

export type ActivityStatus =
  | "on-track"
  | "different"
  | "busy"
  | "idle"
  | "unaccounted";

export type ActivitySource =
  | "check-in"
  | "manual"
  | "timer"
  | "auto"
  | "busy-followup";

export interface ActivityLogEntry {
  id: string;
  userId: string;
  date: string;
  startTime: Timestamp;
  endTime: Timestamp;
  source: ActivitySource;
  status: ActivityStatus;
  routineId?: string;
  timeBlockId?: string;
  subRoutineId?: string;
  freeText?: string;
  busyLabel?: string;
  busyEstimatedDuration?: number;
  category: Category;
  isRetroactive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================
// Check-In Record
// ============================================================

export type CheckInResponse =
  | "on-track"
  | "different"
  | "busy"
  | "idle"
  | "snoozed"
  | "missed";

export interface CheckInRecord {
  id: string;
  userId: string;
  scheduledAt: Timestamp;
  respondedAt?: Timestamp;
  response: CheckInResponse;
  busyLabel?: string;
  activityLogEntryId?: string;
  graceDeadline: Timestamp;
}

// ============================================================
// Day Summary
// ============================================================

export interface DaySummary {
  id: string;
  userId: string;
  date: string;
  routineId: string;
  dayScore: number;
  totalPlannedMinutes: number;
  totalLoggedMinutes: number;
  totalUnaccountedMinutes: number;
  totalIdleMinutes: number;
  totalBusyMinutes: number;
  checkInsSent: number;
  checkInsAnswered: number;
  checkInsMissed: number;
  mustDoCompleted: number;
  mustDoTotal: number;
  categoryBreakdown: Record<string, number>;
  journalEntry?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================
// Streak
// ============================================================

export interface Streak {
  id: string;
  userId: string;
  type: "daily" | "sub-routine";
  subRoutineId?: string;
  currentCount: number;
  longestCount: number;
  lastActiveDate: string;
  startedAt: Timestamp;
}

// ============================================================
// Routine Override
// ============================================================

export interface RoutineOverride {
  id: string;
  userId: string;
  date: string;
  routineId: string;
}

// ============================================================
// Gamification
// ============================================================

export interface EarnedBadge {
  badgeId: string;
  name: string;
  description: string;
  earnedAt: Timestamp;
  xpBonusAwarded: number;
}

export interface DailyChallenge {
  id: string;
  date: string;
  description: string;
  targetValue: number;
  currentValue: number;
  xpReward: number;
  completed: boolean;
}

export interface GamificationProfile {
  userId: string;
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  title: string;
  unlockedCanvasThemes: string[];
  activeCanvasTheme: string;
  badges: EarnedBadge[];
  dailyChallenges: DailyChallenge[];
  stats: {
    totalPomodorosCompleted: number;
    longestPomodoroStreak: number;
    totalFocusMinutes: number;
    perfectDays: number;
    canvasCollectibles: number;
  };
}

export interface CanvasCollectible {
  id: string;
  userId: string;
  date: string;
  timeBlockId: string;
  timeBlockName: string;
  theme: string;
  completionRate: number;
  totalPomodoros: number;
  completedPomodoros: number;
  xpEarned: number;
  canvasSnapshot: string;
  createdAt: Timestamp;
}

// ============================================================
// Level System
// ============================================================

export interface LevelDefinition {
  level: number;
  xpRequired: number;
  title: string;
  unlock?: string;
}

export const LEVEL_DEFINITIONS: LevelDefinition[] = [
  { level: 1, xpRequired: 0, title: "Beginner", unlock: "Classic canvas theme" },
  { level: 2, xpRequired: 200, title: "Getting Started" },
  { level: 3, xpRequired: 500, title: "Apprentice", unlock: "Custom Pomodoro sounds" },
  { level: 5, xpRequired: 1500, title: "Focused", unlock: "Pixel Art canvas theme" },
  { level: 8, xpRequired: 4000, title: "Time Warrior", unlock: "Profile badge frame" },
  { level: 10, xpRequired: 7000, title: "Disciplined", unlock: "Neon canvas theme" },
  { level: 15, xpRequired: 15000, title: "Routine Master", unlock: "Garden canvas theme" },
  { level: 20, xpRequired: 30000, title: "Zenith", unlock: "Space canvas theme" },
  { level: 25, xpRequired: 50000, title: "Time Lord", unlock: "Animated profile avatar" },
  { level: 30, xpRequired: 80000, title: "Unstoppable", unlock: "Bonfire canvas theme" },
  { level: 40, xpRequired: 150000, title: "Legendary", unlock: "Mosaic canvas theme" },
  { level: 50, xpRequired: 300000, title: "Transcendent", unlock: "Custom canvas theme creator" },
];

// ============================================================
// Badge Definitions
// ============================================================

export interface BadgeDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
  xpBonus: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: "first-blood", name: "First Blood", emoji: "🍅", description: "Complete your first Pomodoro", xpBonus: 50 },
  { id: "on-fire", name: "On Fire", emoji: "🔥", description: "10 Pomodoros in a single day", xpBonus: 100 },
  { id: "eruption", name: "Eruption", emoji: "🌋", description: "50 Pomodoros in a single week", xpBonus: 250 },
  { id: "7-day-warrior", name: "7-Day Warrior", emoji: "📅", description: "7-day daily streak", xpBonus: 200 },
  { id: "30-day-legend", name: "30-Day Legend", emoji: "📅", description: "30-day daily streak", xpBonus: 1000 },
  { id: "100-day-titan", name: "100-Day Titan", emoji: "📅", description: "100-day daily streak", xpBonus: 5000 },
  { id: "perfect-day", name: "Perfect Day", emoji: "🎯", description: "Day Score = 100", xpBonus: 300 },
  { id: "perfect-week", name: "Perfect Week", emoji: "🎯", description: "All 7 days with Day Score ≥ 90", xpBonus: 1000 },
  { id: "early-bird", name: "Early Bird", emoji: "🌅", description: "Complete a Pomodoro before 7 AM", xpBonus: 50 },
  { id: "night-owl", name: "Night Owl", emoji: "🦉", description: "Complete a Pomodoro after 11 PM", xpBonus: 50 },
  { id: "journalist", name: "Journalist", emoji: "📝", description: "Write journal entries 7 days in a row", xpBonus: 150 },
  { id: "check-in-champion", name: "Check-In Champion", emoji: "⏰", description: "100% check-in response rate for a full week", xpBonus: 200 },
  { id: "block-crusher", name: "Block Crusher", emoji: "🧱", description: "Complete all Pomodoros in a time block 5 days in a row", xpBonus: 300 },
  { id: "canvas-collector", name: "Canvas Collector", emoji: "🎨", description: "Unlock 5 canvas themes", xpBonus: 500 },
  { id: "summit", name: "Summit", emoji: "🏔️", description: "Reach Level 25", xpBonus: 2000 },
];

// ============================================================
// XP Rewards
// ============================================================

export const XP_REWARDS = {
  completePomo: 20,
  completeAllPomosInBlock: 50,
  answerCheckIn: 5,
  answerCheckInOnTrack: 10,
  answerCheckInBusy: 8,
  logFullDay: 100,
  dailyStreakPerDay: 15,
  dailyStreakMultiplierCap: 30,
  completeMustDo: 25,
  dayScore90Plus: 75,
  writeJournal: 10,
  completeWeeklyReview: 50,
  achieveWeeklyGoal: 100,
  pomoStreakBonus: 10,
} as const;

// ============================================================
// Canvas Themes
// ============================================================

export const CANVAS_THEMES = [
  { id: "classic", name: "Classic", unlockLevel: 1, description: "Clean rounded rectangles, solid colors" },
  { id: "pixel-art", name: "Pixel Art", unlockLevel: 5, description: "8-bit style tiles, retro animations" },
  { id: "neon", name: "Neon", unlockLevel: 10, description: "Glowing borders, dark background, neon fills" },
  { id: "garden", name: "Garden", unlockLevel: 15, description: "Tiles are flower pots; completing a Pomo makes a flower bloom 🌸" },
  { id: "space", name: "Space", unlockLevel: 20, description: "Tiles are planets; completion launches a rocket 🚀" },
  { id: "bonfire", name: "Bonfire", unlockLevel: 30, description: "Tiles are logs; completed tiles catch fire 🔥" },
  { id: "mosaic", name: "Mosaic", unlockLevel: 40, description: "Completed tiles reveal pieces of a daily artwork" },
] as const;
