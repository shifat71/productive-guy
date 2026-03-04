import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parse, differenceInMinutes, addMinutes, isAfter, isBefore } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: string): string {
  const date = parse(time, "HH:mm", new Date());
  return format(date, "h:mm a");
}

export function getMinutesBetween(start: string, end: string): number {
  const startDate = parse(start, "HH:mm", new Date());
  const endDate = parse(end, "HH:mm", new Date());
  return differenceInMinutes(endDate, startDate);
}

export function addMinutesToTime(time: string, minutes: number): string {
  const date = parse(time, "HH:mm", new Date());
  return format(addMinutes(date, minutes), "HH:mm");
}

export function isTimeInRange(time: string, start: string, end: string): boolean {
  const t = parse(time, "HH:mm", new Date());
  const s = parse(start, "HH:mm", new Date());
  const e = parse(end, "HH:mm", new Date());
  return (isAfter(t, s) || t.getTime() === s.getTime()) && isBefore(t, e);
}

export function getCurrentTimeSlot(): string {
  return format(new Date(), "HH:mm");
}

export function getDateString(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateDayScore(params: {
  matchedMinutes: number;
  totalPlannedMinutes: number;
  checkInsAnswered: number;
  checkInsSent: number;
  mustDoCompleted: number;
  mustDoTotal: number;
  unaccountedMinutes: number;
  totalMinutesInDay: number;
  pomodorosCompleted: number;
  pomodorosTotal: number;
}): number {
  const {
    matchedMinutes, totalPlannedMinutes,
    checkInsAnswered, checkInsSent,
    mustDoCompleted, mustDoTotal,
    unaccountedMinutes, totalMinutesInDay,
    pomodorosCompleted, pomodorosTotal,
  } = params;

  const routineMatch = totalPlannedMinutes > 0 ? (matchedMinutes / totalPlannedMinutes) * 35 : 0;
  const checkInRate = checkInsSent > 0 ? (checkInsAnswered / checkInsSent) * 25 : 25;
  const mustDoRate = mustDoTotal > 0 ? (mustDoCompleted / mustDoTotal) * 20 : 20;
  const accountedRate = totalMinutesInDay > 0
    ? Math.max(0, 1 - unaccountedMinutes / totalMinutesInDay) * 15
    : 15;
  const pomoBonus = pomodorosTotal > 0 ? (pomodorosCompleted / pomodorosTotal) * 5 : 0;

  return Math.round(Math.min(100, routineMatch + checkInRate + mustDoRate + accountedRate + pomoBonus));
}

export function getLevelForXP(totalXP: number): { level: number; title: string; xpToNext: number } {
  const { LEVEL_DEFINITIONS } = require("./types");
  let currentLevel = LEVEL_DEFINITIONS[0];
  let nextLevel = LEVEL_DEFINITIONS[1];

  for (let i = LEVEL_DEFINITIONS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_DEFINITIONS[i].xpRequired) {
      currentLevel = LEVEL_DEFINITIONS[i];
      nextLevel = LEVEL_DEFINITIONS[i + 1] || null;
      break;
    }
  }

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    xpToNext: nextLevel ? nextLevel.xpRequired - totalXP : 0,
  };
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
