import { create } from "zustand";
import type { Routine, ActivityLogEntry, CheckInRecord, DaySummary, GamificationProfile, PomodoroSession } from "./types";

// ============================================================
// Routine Store
// ============================================================

interface RoutineStore {
  routines: Routine[];
  activeRoutine: Routine | null;
  setRoutines: (routines: Routine[]) => void;
  setActiveRoutine: (routine: Routine | null) => void;
  addRoutine: (routine: Routine) => void;
  updateRoutine: (id: string, routine: Partial<Routine>) => void;
  removeRoutine: (id: string) => void;
}

export const useRoutineStore = create<RoutineStore>((set) => ({
  routines: [],
  activeRoutine: null,
  setRoutines: (routines) => set({ routines }),
  setActiveRoutine: (routine) => set({ activeRoutine: routine }),
  addRoutine: (routine) => set((s) => ({ routines: [...s.routines, routine] })),
  updateRoutine: (id, data) =>
    set((s) => ({
      routines: s.routines.map((r) => (r.id === id ? { ...r, ...data } : r)),
      activeRoutine: s.activeRoutine?.id === id ? { ...s.activeRoutine, ...data } as Routine : s.activeRoutine,
    })),
  removeRoutine: (id) =>
    set((s) => ({
      routines: s.routines.filter((r) => r.id !== id),
      activeRoutine: s.activeRoutine?.id === id ? null : s.activeRoutine,
    })),
}));

// ============================================================
// Today Store
// ============================================================

interface TodayStore {
  activityLogs: ActivityLogEntry[];
  checkIns: CheckInRecord[];
  daySummary: DaySummary | null;
  pomodoroSessions: PomodoroSession[];
  setActivityLogs: (logs: ActivityLogEntry[]) => void;
  addActivityLog: (log: ActivityLogEntry) => void;
  setCheckIns: (checkIns: CheckInRecord[]) => void;
  addCheckIn: (checkIn: CheckInRecord) => void;
  setDaySummary: (summary: DaySummary | null) => void;
  setPomodoroSessions: (sessions: PomodoroSession[]) => void;
  addPomodoroSession: (session: PomodoroSession) => void;
  updatePomodoroSession: (id: string, data: Partial<PomodoroSession>) => void;
}

export const useTodayStore = create<TodayStore>((set) => ({
  activityLogs: [],
  checkIns: [],
  daySummary: null,
  pomodoroSessions: [],
  setActivityLogs: (logs) => set({ activityLogs: logs }),
  addActivityLog: (log) => set((s) => ({ activityLogs: [...s.activityLogs, log] })),
  setCheckIns: (checkIns) => set({ checkIns }),
  addCheckIn: (checkIn) => set((s) => ({ checkIns: [...s.checkIns, checkIn] })),
  setDaySummary: (summary) => set({ daySummary: summary }),
  setPomodoroSessions: (sessions) => set({ pomodoroSessions: sessions }),
  addPomodoroSession: (session) => set((s) => ({ pomodoroSessions: [...s.pomodoroSessions, session] })),
  updatePomodoroSession: (id, data) =>
    set((s) => ({
      pomodoroSessions: s.pomodoroSessions.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),
}));

// ============================================================
// Gamification Store
// ============================================================

interface GamificationStore {
  profile: GamificationProfile | null;
  setProfile: (profile: GamificationProfile | null) => void;
  xpToast: { amount: number; id: string } | null;
  showXPToast: (amount: number) => void;
}

export const useGamificationStore = create<GamificationStore>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  xpToast: null,
  showXPToast: (amount) => {
    const id = `${Date.now()}`;
    set({ xpToast: { amount, id } });
    setTimeout(() => set({ xpToast: null }), 2000);
  },
}));

// ============================================================
// UI Store
// ============================================================

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  checkInModalOpen: boolean;
  setCheckInModalOpen: (open: boolean) => void;
  activeCheckIn: CheckInRecord | null;
  setActiveCheckIn: (checkIn: CheckInRecord | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  checkInModalOpen: false,
  setCheckInModalOpen: (open) => set({ checkInModalOpen: open }),
  activeCheckIn: null,
  setActiveCheckIn: (checkIn) => set({ activeCheckIn: checkIn }),
}));
