import {
  doc, collection, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, Timestamp, writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  UserProfile, UserSettings, Routine, TimeBlock, SubRoutine,
  ActivityLogEntry, CheckInRecord, DaySummary, Streak,
  RoutineOverride, PomodoroSession, GamificationProfile,
  CanvasCollectible, DailyChallenge,
} from "./types";
import { DEFAULT_USER_SETTINGS } from "./types";

// ============================================================
// Users
// ============================================================

export async function createUserProfile(uid: string, email: string, displayName: string, photoURL?: string): Promise<UserProfile> {
  const profile: UserProfile = {
    uid,
    email,
    displayName,
    photoURL,
    createdAt: Timestamp.now(),
    settings: DEFAULT_USER_SETTINGS,
  };
  await setDoc(doc(db, "users", uid), profile);
  return profile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserSettings(uid: string, settings: Partial<UserSettings>): Promise<void> {
  const ref = doc(db, "users", uid);
  const current = await getDoc(ref);
  if (current.exists()) {
    const currentSettings = (current.data() as UserProfile).settings;
    await updateDoc(ref, { settings: { ...currentSettings, ...settings } });
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, "users", uid), data as Record<string, unknown>);
}

// ============================================================
// Routines
// ============================================================

export async function createRoutine(routine: Routine): Promise<void> {
  await setDoc(doc(db, "routines", routine.id), routine);
}

export async function getRoutine(id: string): Promise<Routine | null> {
  const snap = await getDoc(doc(db, "routines", id));
  return snap.exists() ? (snap.data() as Routine) : null;
}

export async function getUserRoutines(userId: string): Promise<Routine[]> {
  const q = query(collection(db, "routines"), where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Routine);
}

export async function updateRoutine(id: string, data: Partial<Routine>): Promise<void> {
  await updateDoc(doc(db, "routines", id), { ...data, updatedAt: Timestamp.now() } as Record<string, unknown>);
}

export async function deleteRoutine(id: string): Promise<void> {
  await deleteDoc(doc(db, "routines", id));
}

// ============================================================
// Activity Logs
// ============================================================

export async function createActivityLog(entry: ActivityLogEntry): Promise<void> {
  await setDoc(doc(db, "activityLogs", entry.id), entry);
}

export async function getActivityLogsForDate(userId: string, date: string): Promise<ActivityLogEntry[]> {
  const q = query(
    collection(db, "activityLogs"),
    where("userId", "==", userId),
    where("date", "==", date),
    orderBy("startTime", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ActivityLogEntry);
}

export async function updateActivityLog(id: string, data: Partial<ActivityLogEntry>): Promise<void> {
  await updateDoc(doc(db, "activityLogs", id), { ...data, updatedAt: Timestamp.now() } as Record<string, unknown>);
}

export async function deleteActivityLog(id: string): Promise<void> {
  await deleteDoc(doc(db, "activityLogs", id));
}

// ============================================================
// Check-Ins
// ============================================================

export async function createCheckIn(record: CheckInRecord): Promise<void> {
  await setDoc(doc(db, "checkIns", record.id), record);
}

export async function getCheckInsForDate(userId: string, date: string): Promise<CheckInRecord[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, "checkIns"),
    where("userId", "==", userId),
    where("scheduledAt", ">=", Timestamp.fromDate(startOfDay)),
    where("scheduledAt", "<=", Timestamp.fromDate(endOfDay))
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as CheckInRecord);
}

export async function updateCheckIn(id: string, data: Partial<CheckInRecord>): Promise<void> {
  await updateDoc(doc(db, "checkIns", id), data as Record<string, unknown>);
}

// ============================================================
// Day Summary
// ============================================================

export async function saveDaySummary(summary: DaySummary): Promise<void> {
  await setDoc(doc(db, "daySummaries", summary.id), summary);
}

export async function getDaySummary(userId: string, date: string): Promise<DaySummary | null> {
  const q = query(
    collection(db, "daySummaries"),
    where("userId", "==", userId),
    where("date", "==", date)
  );
  const snap = await getDocs(q);
  return snap.docs.length > 0 ? (snap.docs[0].data() as DaySummary) : null;
}

export async function getDaySummariesForRange(userId: string, startDate: string, endDate: string): Promise<DaySummary[]> {
  const q = query(
    collection(db, "daySummaries"),
    where("userId", "==", userId),
    where("date", ">=", startDate),
    where("date", "<=", endDate),
    orderBy("date", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as DaySummary);
}

// ============================================================
// Streaks
// ============================================================

export async function getUserStreaks(userId: string): Promise<Streak[]> {
  const q = query(collection(db, "streaks"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Streak);
}

export async function upsertStreak(streak: Streak): Promise<void> {
  await setDoc(doc(db, "streaks", streak.id), streak);
}

// ============================================================
// Routine Overrides
// ============================================================

export async function setRoutineOverride(override: RoutineOverride): Promise<void> {
  await setDoc(doc(db, "routineOverrides", override.id), override);
}

export async function getRoutineOverride(userId: string, date: string): Promise<RoutineOverride | null> {
  const q = query(
    collection(db, "routineOverrides"),
    where("userId", "==", userId),
    where("date", "==", date)
  );
  const snap = await getDocs(q);
  return snap.docs.length > 0 ? (snap.docs[0].data() as RoutineOverride) : null;
}

// ============================================================
// Pomodoro Sessions
// ============================================================

export async function createPomodoroSession(session: PomodoroSession): Promise<void> {
  await setDoc(doc(db, "pomodoroSessions", session.id), session);
}

export async function getPomodoroSessionsForDate(userId: string, date: string): Promise<PomodoroSession[]> {
  const q = query(
    collection(db, "pomodoroSessions"),
    where("userId", "==", userId),
    where("date", "==", date),
    orderBy("startedAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as PomodoroSession);
}

export async function updatePomodoroSession(id: string, data: Partial<PomodoroSession>): Promise<void> {
  await updateDoc(doc(db, "pomodoroSessions", id), data as Record<string, unknown>);
}

// ============================================================
// Gamification Profile
// ============================================================

export async function getGamificationProfile(userId: string): Promise<GamificationProfile | null> {
  const snap = await getDoc(doc(db, "gamification", userId));
  return snap.exists() ? (snap.data() as GamificationProfile) : null;
}

export async function createGamificationProfile(userId: string): Promise<GamificationProfile> {
  const profile: GamificationProfile = {
    userId,
    totalXP: 0,
    currentLevel: 1,
    xpToNextLevel: 200,
    title: "Beginner",
    unlockedCanvasThemes: ["classic"],
    activeCanvasTheme: "classic",
    badges: [],
    dailyChallenges: [],
    stats: {
      totalPomodorosCompleted: 0,
      longestPomodoroStreak: 0,
      totalFocusMinutes: 0,
      perfectDays: 0,
      canvasCollectibles: 0,
    },
  };
  await setDoc(doc(db, "gamification", userId), profile);
  return profile;
}

export async function updateGamificationProfile(userId: string, data: Partial<GamificationProfile>): Promise<void> {
  await updateDoc(doc(db, "gamification", userId), data as Record<string, unknown>);
}

export async function addXP(userId: string, xpAmount: number): Promise<GamificationProfile> {
  const profile = await getGamificationProfile(userId);
  if (!profile) throw new Error("Gamification profile not found");

  const newTotalXP = profile.totalXP + xpAmount;
  const { getLevelForXP } = await import("./utils");
  const { level, title, xpToNext } = getLevelForXP(newTotalXP);

  const updates: Partial<GamificationProfile> = {
    totalXP: newTotalXP,
    currentLevel: level,
    xpToNextLevel: xpToNext,
    title,
  };

  await updateGamificationProfile(userId, updates);
  return { ...profile, ...updates };
}

// ============================================================
// Canvas Collectibles
// ============================================================

export async function saveCanvasCollectible(collectible: CanvasCollectible): Promise<void> {
  await setDoc(doc(db, "canvasCollectibles", collectible.id), collectible);
}

export async function getUserCanvasCollectibles(userId: string): Promise<CanvasCollectible[]> {
  const q = query(
    collection(db, "canvasCollectibles"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as CanvasCollectible);
}
