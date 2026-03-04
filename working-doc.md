# Productive Guy – Web App Working Document

## Project Overview

- **Framework:** Next.js (App Router) with TypeScript & Tailwind CSS
- **Backend/Services:** Firebase (v12.10.0)
- **Package Manager:** npm

---

## Change Log

### 2026-03-04 — Initial Setup

#### 1. Firebase SDK installed

- Ran `npm install firebase` to add the Firebase JS SDK.

#### 2. Next.js project scaffolded

- Used `npx create-next-app@latest` with the following options:
  - TypeScript ✅
  - Tailwind CSS ✅
  - ESLint ✅
  - App Router (`/app`) ✅
  - `src/` directory ✅
  - Import alias `@/*` ✅
- Re-installed `firebase` after scaffolding.

#### 3. Firebase configuration moved to environment variables

- **Created `.env.local`** with all Firebase config values prefixed with `NEXT_PUBLIC_` so they're available client-side in Next.js.
- **Created `src/lib/firebase.ts`** — the main Firebase initialization file:
  - Reads config from `process.env.NEXT_PUBLIC_*` instead of hardcoded strings.
  - Uses `getApps()` to prevent re-initialization during hot reload.
  - Wraps Analytics in an `isSupported()` check (Analytics only works in the browser).
- `.env.local` is already covered by the `.gitignore` pattern `.env*`, so secrets won't be committed.

---

## Current File Structure (key files)

```
web/
├── .env.local                 # Firebase secrets (git-ignored)
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── eslint.config.mjs
├── working-doc.md             # This file
├── public/
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── lib/
│       └── firebase.ts        # Firebase init (uses env vars)
```

---

## Environment Variables (`.env.local`)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Cloud Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Google Analytics measurement ID |

---

### 2026-03-04 — Full Application Build

#### 1. Dependencies Added

- `zustand` — lightweight state management
- `framer-motion` — animations & page transitions
- `recharts` — charting library for analytics
- `date-fns` — date/time utilities
- `lucide-react` — icon library
- `clsx`, `tailwind-merge` — className utilities

#### 2. Core Library Layer (`src/lib/`)

- **`types.ts`** — All data models: `UserProfile`, `UserSettings`, `Routine`, `TimeBlock`, `SubRoutine`, `PomodoroSlot`, `PomodoroSession`, `ActivityLogEntry`, `CheckInRecord`, `DaySummary`, `Streak`, `RoutineOverride`, `GamificationProfile`, `EarnedBadge`, `DailyChallenge`, `CanvasCollectible`. Constants: `CATEGORY_COLORS`, `CATEGORY_LABELS`, `DEFAULT_POMODORO_CONFIG`, `LEVEL_DEFINITIONS`, `BADGE_DEFINITIONS`, `XP_REWARDS`, `CANVAS_THEMES`.
- **`firestore.ts`** — Full Firestore CRUD for all collections: users, routines, activityLogs, checkIns, daySummaries, streaks, routineOverrides, pomodoroSessions, gamification, canvasCollectibles. Includes `addXP()` with level calculation.
- **`utils.ts`** — Helpers: `cn()`, `formatTime()`, `getMinutesBetween()`, `addMinutesToTime()`, `isTimeInRange()`, `getCurrentTimeSlot()`, `getDateString()`, `generateId()`, `calculateDayScore()`, `getLevelForXP()`, `formatDuration()`.
- **`auth-context.tsx`** — React context for Firebase Auth. Provides `signIn`, `signUp`, `signInWithGoogle`, `signOut`, `refreshProfile`. Auto-creates user profile + gamification profile on signup.
- **`stores.ts`** — 4 Zustand stores: `useRoutineStore`, `useTodayStore`, `useGamificationStore`, `useUIStore`.

#### 3. UI Component Library (`src/components/ui/`)

- **`button.tsx`** — 6 variants (default, outline, ghost, secondary, destructive, link), 4 sizes
- **`input.tsx`** — With label, error state, full Tailwind styling
- **`card.tsx`** — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **`badge.tsx`** — 5 variants (default, success, warning, destructive, outline)
- **`modal.tsx`** — Animated overlay modal with Framer Motion
- **`select.tsx`** — Styled select with label
- **`progress.tsx`** — 3 sizes (sm, md, lg), custom color support
- **`toast.tsx`** — XP toast notification with slide-in animation

#### 4. Layout & Navigation (`src/components/`)

- **`app-shell.tsx`** — Protected layout wrapper: redirects to `/login` if unauthenticated, renders Sidebar + TopBar + content + XPToast + CheckInModal
- **`sidebar.tsx`** — 13 navigation items with icons, collapsible, active state highlighting
- **`top-bar.tsx`** — Date display, XP/level/progress bar, notification bell, user avatar, logout
- **`check-in-modal.tsx`** — Full check-in flow: On Track / Busy / Different / Idle responses, mandatory busy label form, XP awards

#### 5. Authentication Pages

- **`src/app/login/page.tsx`** — Email/password login + Google sign-in
- **`src/app/signup/page.tsx`** — Registration with display name, email, password, confirm password, Google sign-in

#### 6. App Layout & Providers

- **`src/app/providers.tsx`** — Client component wrapping `<AuthProvider>`
- **`src/app/layout.tsx`** — Updated root layout with fonts, metadata, dark mode
- **`src/app/page.tsx`** — Landing page with hero section, feature grid, login/signup CTAs; redirects to `/dashboard` if authenticated
- **`src/app/(app)/layout.tsx`** — AppShell wrapper for all authenticated routes

#### 7. Dashboard (`src/app/(app)/dashboard/`)

- **`page.tsx`** — Stats grid (Day Score, Streak, Check-In Rate, Unaccounted), PieChart category breakdown, Today's Routine blocks, Gamification row (Level, Pomodoros, Badges). Has empty state.
- **`analytics/page.tsx`** — Day Score trend line chart, Category pie chart, Check-In response rate bar chart, Time Waste tracker area chart. Date range filtering (7d / 30d / 90d).

#### 8. Routines (`src/app/(app)/routines/`)

- **`page.tsx`** — Routine list with cards showing stats, color bars, delete/edit actions
- **`new/page.tsx`** — Create routine form with name, description, active days toggle grid
- **`[id]/page.tsx`** — Full routine editor: add/edit/delete time blocks via modal, expandable blocks with sub-routines, Pomodoro slot configuration with "Fill with Pomodoros" auto-generate
- **`calendar/page.tsx`** — Weekly calendar view, assign routines per day, overrides

#### 9. Today View (`src/app/(app)/today/`)

- **`page.tsx`** — Dual timeline (Planned vs Actual), unaccounted time alert banner, color-coded activity logs, Focus Mode buttons for Pomodoro-enabled blocks
- **`log/page.tsx`** — Manual time log form (start/end time, status, category, busy label, notes)
- **`focus/[blockId]/page.tsx`** — Full Pomodoro focus mode: Block Canvas tile grid, countdown timer (work/break/long-break phases), pause/resume/abandon controls, streak tracking, XP awards, auto-transitions, block completion summary

#### 10. Profile & Gamification (`src/app/(app)/profile/`)

- **`page.tsx`** — Gamification profile: avatar, level badge, XP progress bar, stats grid (streak, perfect days, focus time, badges), Pomodoro stats, full level roadmap with unlock indicators
- **`trophies/page.tsx`** — Trophy Case displaying all 15 badges from `BADGE_DEFINITIONS` with earned/locked states
- **`gallery/page.tsx`** — Canvas collectibles gallery with theme badges and completion rates

#### 11. Settings (`src/app/(app)/settings/`)

- **`page.tsx`** — Full settings page: profile editing, check-in interval/grace period/silent hours, general preferences (day score threshold, week start, time slot increment, weekly review day), notification toggles (7 toggle switches)

#### 12. History (`src/app/(app)/history/`)

- **`page.tsx`** — Month calendar with score-colored day indicators, month navigation, click-to-drill-in
- **`[date]/page.tsx`** — Day detail view: stats grid, category breakdown with progress bars, activity log timeline, journal entry

#### 13. Weekly Review (`src/app/(app)/review/`)

- **`page.tsx`** — Weekly review: week navigation, aggregate stats (avg score, total logged, unaccounted, check-ins), daily score bar chart, category pie chart, day-by-day progress overview

#### 14. Theming & Styling

- **`globals.css`** — Complete dark-mode-first CSS variable system, custom animations (`fade-in`, `slide-in-right`, `scale-in`, `float-up`, `pulse-glow`), custom scrollbar, all color tokens

---

## Current File Structure

```
productive-guy/
├── .env.local                          # Firebase secrets (git-ignored)
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── eslint.config.mjs
├── working-doc.md
├── project-documentation.md
├── pages-documentation.md
├── public/
├── src/
│   ├── app/
│   │   ├── globals.css                 # Dark theme, animations, tokens
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Landing page
│   │   ├── providers.tsx               # AuthProvider wrapper
│   │   ├── login/page.tsx              # Login
│   │   ├── signup/page.tsx             # Signup
│   │   └── (app)/                      # Authenticated route group
│   │       ├── layout.tsx              # AppShell wrapper
│   │       ├── dashboard/
│   │       │   ├── page.tsx            # Dashboard
│   │       │   └── analytics/page.tsx  # Analytics charts
│   │       ├── routines/
│   │       │   ├── page.tsx            # Routine list
│   │       │   ├── new/page.tsx        # Create routine
│   │       │   ├── [id]/page.tsx       # Edit routine
│   │       │   └── calendar/page.tsx   # Routine calendar
│   │       ├── today/
│   │       │   ├── page.tsx            # Today timeline
│   │       │   ├── log/page.tsx        # Manual logging
│   │       │   └── focus/[blockId]/page.tsx  # Pomodoro focus
│   │       ├── profile/
│   │       │   ├── page.tsx            # Gamification profile
│   │       │   ├── trophies/page.tsx   # Badge trophy case
│   │       │   └── gallery/page.tsx    # Canvas collectibles
│   │       ├── settings/page.tsx       # All settings
│   │       ├── history/
│   │       │   ├── page.tsx            # Month calendar
│   │       │   └── [date]/page.tsx     # Day detail
│   │       └── review/page.tsx         # Weekly review
│   ├── components/
│   │   ├── app-shell.tsx               # Auth-guarded layout
│   │   ├── sidebar.tsx                 # Collapsible sidebar
│   │   ├── top-bar.tsx                 # Top navigation bar
│   │   ├── check-in-modal.tsx          # Check-in response modal
│   │   └── ui/
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── modal.tsx
│   │       ├── progress.tsx
│   │       ├── select.tsx
│   │       └── toast.tsx
│   └── lib/
│       ├── auth-context.tsx            # Firebase Auth context
│       ├── firebase.ts                 # Firebase initialization
│       ├── firestore.ts                # All Firestore CRUD
│       ├── stores.ts                   # Zustand stores
│       ├── types.ts                    # All TypeScript models
│       └── utils.ts                    # Helper functions
```

---

## Environment Variables (`.env.local`)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Cloud Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Google Analytics measurement ID |

---

## Notes for Future Sessions

- All TypeScript types compile cleanly (`npx tsc --noEmit` — zero errors)
- Build fails at static export step only because Firebase requires runtime env vars; works fine with `npm run dev`
- Import Firebase anywhere with: `import { app, auth, db } from "@/lib/firebase";`
- Run the dev server with: `npm run dev`
- All pages are client-rendered (`"use client"`) since they depend on Firebase Auth state
