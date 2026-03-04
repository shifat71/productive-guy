# Productive Guy — Project Documentation

> **A time-accountability web app that forces you to document every moment of your day, tracks how well you follow your planned routine, and gives you brutally honest analytics about where your time actually goes.**

---

## Table of Contents

1. [Vision & Philosophy](#1-vision--philosophy)
2. [Core Concepts](#2-core-concepts)
3. [Feature Breakdown](#3-feature-breakdown)
   - 3.1 [Routine Builder](#31-routine-builder)
   - 3.2 [Active Check-In System (Pings)](#32-active-check-in-system-pings)
   - 3.3 [Time Logging & Activity Journal](#33-time-logging--activity-journal)
   - 3.4 [Analytics & Graphs](#34-analytics--graphs)
   - 3.5 [Streak & Accountability Engine](#35-streak--accountability-engine)
   - 3.6 [Pomodoro Engine & Block Canvas](#36-pomodoro-engine--block-canvas)
   - 3.7 [Gamification System](#37-gamification-system)
   - 3.8 [Weekly Review & Insights](#38-weekly-review--insights)
   - 3.9 [Notification System](#39-notification-system)
   - 3.10 [Interactive Guidance & Visual Feedback](#310-interactive-guidance--visual-feedback)
4. [Data Models](#4-data-models)
5. [Page & Route Structure](#5-page--route-structure)
6. [Tech Stack](#6-tech-stack)
7. [Build Phases](#7-build-phases)
8. [UI/UX Guidelines](#8-uiux-guidelines)
9. [Future Enhancements](#9-future-enhancements)

---

## 1. Vision & Philosophy

Most productivity apps let you _plan_ your day but never hold you accountable for _actually doing_ what you planned. They rely on your willpower to log time honestly — and willpower is exactly what you're short on when you're unproductive.

**Productive Guy** takes a different approach:

- **It interrupts you.** At configurable intervals, it sends a push notification asking: _"What are you doing right now?"_ You must respond. If you don't, it logs that slot as "Unaccounted" — a visible scar on your daily timeline.
- **It makes silence visible.** Not answering is itself an answer. The app treats every minute as spoken-for. If a time block has no log, it shows up in red.
- **It compares _planned_ vs. _actual_.** You build a routine (your ideal day). The app then shows a side-by-side of what you _intended_ to do vs. what you _actually_ did.
- **It rewards consistency, not perfection.** Streak systems and regularity scores encourage building habits over time, not having one perfect day.

The core insight: **You can't manage what you don't measure, and you won't measure what you can avoid.**

---

## 2. Core Concepts

### 2.1 Routine

A **Routine** is a named template for how a day (or part of a day) should be spent. A user can have multiple routines (e.g., "Workday", "Weekend", "Exam Prep Mode"). Each routine is a collection of **Time Blocks**.

### 2.2 Time Block

A **Time Block** is a top-level chunk of time within a routine (e.g., "Morning Routine 6:00–8:00 AM", "Deep Work 9:00 AM–12:00 PM"). Time blocks have:

- A name and color
- A start time and end time
- A category (Work, Health, Learning, Leisure, Personal, etc.)
- An ordered list of **Sub-Routines**

### 2.3 Sub-Routine

A **Sub-Routine** is a specific task or activity nested inside a time block (e.g., under "Morning Routine": Brush teeth, Exercise, Shower, Breakfast). Sub-routines have:

- A name
- An estimated duration
- An optional description/notes
- A priority level (Must Do / Should Do / Nice to Have)

### 2.4 Check-In (Ping)

A **Check-In** is a notification-triggered prompt asking the user what they are currently doing. The user selects from their active routine's time blocks/sub-routines or types a free-text response. If they don't respond within a grace period, the slot is marked as "Unaccounted".

### 2.5 Activity Log Entry

An **Activity Log Entry** is a timestamped record of what the user actually did. It can come from:

- A check-in response
- Manual logging (user opens the app and logs what they've been doing)
- Start/stop timer for a specific sub-routine

### 2.6 Day Score

A **Day Score** (0–100) is a calculated metric based on:

- How closely actual time matched the planned routine
- Percentage of check-ins answered
- Percentage of "Must Do" sub-routines completed
- Total unaccounted time
- Pomodoro completion rate (bonus multiplier)

### 2.7 Pomodoro Slot

A **Pomodoro Slot** is a small, timed work-then-break cycle nested inside a time block. Instead of treating a 2-hour "Deep Work" block as one monolithic chunk, the user splits it into a series of Pomodoro slots — e.g., four 25-min work + 5-min break cycles. Pomodoro slots have:

- A configurable **work duration** (default 25 min, customizable per slot: 15, 20, 25, 30, 45, 50 min)
- A configurable **break duration** (default 5 min, customizable: 3, 5, 10, 15 min)
- A **long break** option after every N slots (default: 15 min after every 4 slots)
- A **linked sub-routine** (optional) — which task the slot is dedicated to
- A **completion state** — not started, in progress, completed, skipped, failed (ran out of time / abandoned)

Pomodoro slots are the atomic unit of focused work. They are visually represented on a **Block Canvas** — a visual progress map rendered at the top of each time block.

### 2.8 XP & Levels

**XP (Experience Points)** is the universal gamification currency. Users earn XP for productive actions (completing Pomodoros, answering check-ins, maintaining streaks, etc.) and level up as XP accumulates. Levels unlock cosmetic rewards, titles, and canvas themes.

### 2.9 Busy State

A **Busy State** acknowledges real life. Not every moment is plannable — meetings run over, a friend calls, the plumber shows up. The app doesn't penalize you for being busy, but it **demands you document what you were busy with**. A busy log entry requires:

- A **short label** (what you're busy with — e.g., "Phone call with Mom", "Emergency work meeting", "Doctor appointment")
- A **category** (auto-suggested or manually picked)
- An **estimated or actual duration**

Busy time is tracked separately from idle/unaccounted time. It counts as "accounted" (no red marks on your timeline), but it's distinguished from "on-track" planned time so analytics can show you how much of your day was reactive (busy) vs. proactive (planned). The philosophy: **you're allowed to be busy, but you're not allowed to be vague about it.**

---

## 3. Feature Breakdown

### 3.1 Routine Builder

**Purpose:** Let users design their ideal day as a reusable template.

#### Functionality:

- **Create/Edit/Delete Routines** — A routine has a name, optional description, and an "active days" setting (e.g., Mon–Fri, weekends, custom).
- **Add Time Blocks** — Drag-and-drop or form-based. Blocks snap to 15-minute increments by default (configurable to 5, 10, 15, 30 min). Blocks cannot overlap.
- **Add Sub-Routines inside Time Blocks** — Ordered list. Estimated durations should add up to (or be less than) the parent block's duration. Visual warning if they exceed it.
- **Color Coding & Categories** — Each time block gets a category (predefined + custom). Categories have default colors that can be overridden.
- **Template Duplication** — Copy an existing routine to create a variation (e.g., duplicate "Workday" → "Work From Home Day").
- **Assign Routine to Days** — A calendar-like interface where you drag routines onto specific days of the week. Supports exceptions ("Use 'Exam Prep' routine on March 15 instead of 'Workday'").
- **Pomodoro Slot Configuration per Time Block** — Inside each time block, the user can:
  - **Enable/disable Pomodoro mode** for that block. If disabled, the block behaves as a simple time range.
  - **Set work duration** per slot (15, 20, 25, 30, 45, or 50 min). Defaults to 25 min.
  - **Set break duration** per slot (3, 5, 10, or 15 min). Defaults to 5 min.
  - **Set long break** interval and duration (e.g., 15-min break after every 4 Pomodoros).
  - **Auto-generate slots** — Click "Fill with Pomodoros" to automatically divide the block's duration into as many work+break cycles as fit. The remainder becomes a buffer/flex slot.
  - **Manually add/remove/reorder slots** — Drag individual Pomodoro slots. Assign each slot to a specific sub-routine or leave it as "General" for that block's category.
  - **Slot-level customization** — Override work/break duration on individual slots (e.g., the first slot is a 15-min warm-up, the rest are 25-min deep work).
  - **Preview on canvas** — As the user configures slots, the Block Canvas (see §3.6) updates in real-time to show a preview of the Pomodoro layout.

#### UI:

- A vertical timeline view (6 AM to 12 AM by default, scrollable beyond).
- Time blocks rendered as colored bars on the timeline.
- Click a block to expand and see/edit sub-routines and Pomodoro slots.
- **Block Canvas at the top of each expanded time block** — a visual map of all Pomodoro slots (see §3.6 for full detail).
- A sidebar/drawer showing the list of all routines with quick-switch.

---

### 3.2 Active Check-In System (Pings)

**Purpose:** Force the user to document what they're doing at regular intervals.

#### Functionality:

- **Configurable Interval** — Default every 30 minutes. User can set 15, 20, 30, 45, or 60 minutes. Can also set different intervals for different time blocks (e.g., every 15 min during "Deep Work", every 60 min during "Leisure").
- **Push Notification** — Browser push notification (via Firebase Cloud Messaging) with the prompt: _"It's [time]. What are you doing right now?"_
- **Quick Response Options:**
  - Show the current time block and its sub-routines as tap-to-select options.
  - "On track" ✅ — confirms doing what was planned. One tap. Fastest response.
  - "I'm busy" 🔶 — user is occupied with something unplanned. **Opens a mandatory quick-log form:**
    - Required: short text label describing what they're busy with (min 3 characters). Auto-complete from past busy entries.
    - Optional: pick a category (defaults to "Personal").
    - Optional: estimated duration ("Still busy? We'll check again in 15 min").
    - The app remembers recent busy labels for faster re-entry (e.g., if "Meeting" was used yesterday, it appears as a suggestion pill).
    - **Cannot dismiss without filling in the label.** The whole point: you must document even when you're busy.
  - "Doing something else" — opens a picker for other activities or free-text.
  - "Not doing anything" — honest option, logged as idle/wasted time.
- **Busy Follow-Up Ping** — If the user responds "I'm busy", the app sends a shorter follow-up ping after the estimated duration (or 15 min if none given): _"Still busy with [label]? Or back to your routine?"_ This ensures busy periods don't become black holes.
- **Grace Period** — If no response within 5 minutes (configurable), the slot is auto-logged as "Unaccounted ⚠️".
- **Snooze** — User can snooze once (delays by 5 min). No second snooze. This prevents infinite deferral.
- **Silent Hours** — Notifications paused during sleep time or custom quiet periods.

#### Edge Cases:

- If the user is already actively logging via timer, skip the ping for that interval.
- If the browser tab is open/focused, show an in-app modal instead of a push notification.

---

### 3.3 Time Logging & Activity Journal

**Purpose:** Build a complete picture of how the day was actually spent.

#### Functionality:

- **Automatic Logging from Check-Ins** — Every ping response creates a log entry.
- **Manual Logging** — User can open the app at any time and add/edit log entries for past time slots. A timeline view shows gaps that need filling.
- **Start/Stop Timer** — For real-time tracking. User clicks "Start" on a sub-routine, does the task, clicks "Stop". Duration is auto-calculated.
- **Activity Journal (Daily Notes)** — A free-text area at the bottom of each day where users can write reflections, notes, or excuses. This serves as a diary-like companion to the quantitative data.
- **Gap Detection** — The app highlights time periods with no log entries in red/orange. A banner at the top: _"You have 2.5 hours unaccounted for today. Fill them in?"_
- **Edit History** — Log entries track when they were created/edited. Entries logged more than 2 hours after the fact are tagged as "Retroactive" (less reliable data).

#### Timeline View:

- Two parallel timelines:
  - **Left:** Planned routine (from the Routine Builder).
  - **Right:** Actual activity (from logs and check-ins).
- Color-coded comparison:
  - **Green** = matched plan (on track).
  - **Yellow** = different activity but productive.
  - **Amber/Orange with 🔶** = busy (unplanned but documented — shows the busy label inline on the timeline bar).
  - **Light Gray** = idle (user admitted doing nothing).
  - **Red** = unaccounted (no response at all).
- Busy blocks on the timeline are **interactive**: click to expand and see the full busy log (label, category, duration, when it was logged). This distinguishes "I was at the dentist for 2 hours" from "2 hours vanished".

---

### 3.4 Analytics & Graphs

**Purpose:** Show the user exactly where their time goes, how regular they are, and trends over time.

#### Dashboard Graphs:

1. **Daily Pie Chart** — Breakdown of today's time by category (Work, Health, Learning, Leisure, Idle, Unaccounted).

2. **Plan vs. Actual Bar Chart** — For each time block, a grouped bar showing planned duration vs. actual duration spent. Highlights overruns and underruns.

3. **Weekly Heat Map** — A 7-column × 24-row grid (days × hours). Each cell colored by category. At a glance, you see patterns — _"I always waste time between 2–4 PM on weekdays."_

4. **Regularity Score Graph (Line Chart)** — A daily line graph of the "regularity score" (0–100) over the past 30/60/90 days. The regularity score measures how closely actual behavior matched the planned routine.

5. **Category Trend (Stacked Area Chart)** — Over time (weeks/months), how the proportion of time in each category has changed. Are you spending more time on "Learning" this month vs. last month?

6. **Check-In Response Rate** — Percentage of pings answered vs. missed, trended over time. A leading indicator of engagement.

7. **Sub-Routine Completion Rate** — For each sub-routine (e.g., "Exercise"), how many days in the past 30 was it completed? Shown as a bar or dot chart.

8. **Time Waste Tracker** — Total hours per week categorized as "Idle" or "Unaccounted". Trend line to see if it's improving.

9. **Peak Productivity Hours** — Based on logged data, identify which hours of the day the user is most often "on track" with productive activities. Shown as a radial/clock chart.

10. **Proactive vs. Reactive Ratio** — A donut chart showing what percentage of the user's day was planned (on-track) vs. reactive (busy/unplanned). Trended over weeks to see if the user is gaining more control of their time or losing it to interruptions. Busy labels are grouped to show the top sources of reactive time (e.g., "Meetings" took 40% of your busy time this week).

#### Filters:

- Date range picker (Today, This Week, This Month, Last 30 Days, Custom).
- Filter by category, routine, or specific time block.
- Compare two date ranges side-by-side.

---

### 3.5 Streak & Accountability Engine

**Purpose:** Gamify consistency to build long-term habits.

#### Functionality:

- **Daily Streak** — Consecutive days where the Day Score was above a configurable threshold (default: 70/100). Displayed prominently on the dashboard.
- **Sub-Routine Streaks** — Individual streaks per sub-routine (e.g., "Exercise: 14-day streak 🔥"). Breaking a streak shows a motivational nudge, not punishment.
- **Weekly Consistency Badge** — If 5+ out of 7 days hit the threshold, earn a badge for that week. Badges accumulate in a trophy case.
- **Accountability Partner (Future)** — Share a read-only view of your daily score/streaks with a friend. They get notified if your streak breaks.
- **Personal Bests** — Track records like "Longest streak", "Most productive week", "Best Day Score ever". Celebrate milestones.

---

### 3.6 Pomodoro Engine & Block Canvas

**Purpose:** Give every time block a visual, gamified, interactive Pomodoro system — rendered on an HTML Canvas element — so the user can see, launch, and conquer small work chunks one by one.

#### 3.6.1 The Block Canvas

At the **top of each time block** (when expanded in the Today view, Routine view, or Focus view), an HTML `<canvas>` element renders a visual map of all Pomodoro slots for that block. This is the centrepiece UI for working through a time block.

**Visual Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  DEEP WORK  9:00 AM – 12:00 PM          ⚡ 120 XP possible  │
│                                                              │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌───┐  ┌─────┐       │
│  │ 🍅  │  │ 🍅  │  │ 🍅  │  │ 🍅  │  │ ☕ │  │ 🍅  │  ...  │
│  │25min│  │25min│  │25min│  │25min│  │15m│  │25min│       │
│  │ ✅  │  │ 🔥  │  │ ⬜  │  │ ⬜  │  │   │  │ ⬜  │       │
│  │ CSS │  │ API │  │ API │  │Test │  │   │  │Debug│       │
│  └─────┘  └─────┘  └─────┘  └─────┘  └───┘  └─────┘       │
│                                                              │
│  [▶ Start Next]   Completed: 1/6   Streak: 🔥 x1            │
└──────────────────────────────────────────────────────────────┘
```

**Canvas Elements:**

- **Pomodoro Tiles** — Each work slot is a rounded rectangle ("tile") on the canvas. Tiles are arranged in a horizontal row (scrollable if they overflow). Each tile shows:
  - The slot's work duration (e.g., "25min").
  - The linked sub-routine name (abbreviated, e.g., "CSS", "API").
  - A status icon: ⬜ Not started, 🔥 In progress (animated pulse), ✅ Completed, ❌ Failed/Skipped.
  - A fill animation: as the timer runs, the tile fills from bottom to top with the block's color. A completed tile is fully filled.
- **Break Tiles** — Smaller tiles between work tiles (☕). Long breaks are slightly taller. They also fill during the break timer.
- **Progress Bar** — A thin bar below all tiles showing overall block completion (e.g., 2 of 6 Pomodoros = 33%).
- **XP Indicator** — Top-right corner shows potential XP for completing all Pomodoros in this block. Updates live as Pomodoros are completed.
- **Streak Flame** — A small fire icon with a counter showing consecutive completed Pomodoros in this session (resets if you skip/fail one).

**Canvas Interactions:**

- **Click a tile** → Start that Pomodoro (or view details if already done).
- **Hover a tile** → Tooltip with full sub-routine name, description, and duration.
- **Right-click a tile** → Context menu: Skip, Reassign to different sub-routine, Edit duration.
- **Drag tiles** → Reorder Pomodoro slots within the block.

**Canvas Themes (Unlockable via Levels):**

The canvas has visual themes that users unlock as they level up (see §3.7 Gamification):

| Theme | Unlock Level | Description |
|---|---|---|
| **Classic** | Lv 1 (default) | Clean rounded rectangles, solid colors |
| **Pixel Art** | Lv 5 | 8-bit style tiles, retro animations |
| **Neon** | Lv 10 | Glowing borders, dark background, neon fills |
| **Garden** | Lv 15 | Tiles are flower pots; completing a Pomo makes a flower bloom 🌸 |
| **Space** | Lv 20 | Tiles are planets; completion launches a rocket between them 🚀 |
| **Bonfire** | Lv 30 | Tiles are logs; completed tiles catch fire, building a campfire 🔥 |
| **Mosaic** | Lv 40 | Completed tiles reveal pieces of a daily artwork |

#### 3.6.2 Pomodoro Timer (Focus Mode)

When the user starts a Pomodoro slot (clicks ▶ or taps a tile), the app enters **Focus Mode**:

- **Full-screen timer** — Countdown of the work duration. Shows the sub-routine name, slot number (e.g., "Pomo 3 of 6"), and remaining time in large monospace font.
- **Minimal UI** — Only the timer, task name, a "Pause" button, and a "Give Up" button. No other navigation.
- **Canvas mini-view** — A compressed version of the Block Canvas is shown below the timer, so the user can see their progress across the whole block.
- **Ambient sound (optional)** — White noise, rain, lo-fi beats. Configurable in settings.
- **Auto-transition to break** — When the work timer ends: celebration animation (confetti burst on canvas, tile fills with ✅), XP awarded, then the break timer starts automatically.
- **Break screen** — Shows break timer, a motivational quote, and a preview of the next Pomodoro task. "Skip Break" button available.
- **Long break** — After every N Pomodoros (configurable), a longer break with a summary: _"You've completed 4 Pomodoros! Take a 15-minute break. You've earned 80 XP this block."_
- **Auto-advance** — After break ends, the next Pomodoro tile activates automatically (can be disabled — user must manually click "Start Next").
- **No Check-In Pings** — Pings are suppressed during active Pomodoro work sessions. The time is auto-logged.

#### 3.6.3 Pomodoro Completion Rules

| Outcome | Condition | XP Earned | Canvas Effect |
|---|---|---|---|
| ✅ **Completed** | Timer runs to zero | Full XP (e.g., 20 XP) | Tile fills completely, status icon → ✅ |
| ⚡ **Overachiever** | Completed + finished early | Full XP + 5 bonus | Gold border on tile |
| ⏸️ **Paused** | User paused >2 min | 50% XP | Tile partially filled, dashed border |
| ❌ **Abandoned** | User hit "Give Up" | 0 XP | Tile turns gray with ❌, streak resets |
| ⏭️ **Skipped** | User skipped without starting | 0 XP | Tile stays empty with ⏭️ icon |
| 🔥 **Streak Bonus** | 3+ consecutive completes | +10 XP per Pomo in streak | Flame animation on canvas |

#### 3.6.4 Block Summary (Post-Block Canvas)

When all Pomodoro slots in a time block are done (or the block's end time passes), the canvas transitions to a **summary state**:

- All tiles displayed with their final statuses.
- Total XP earned from this block.
- Completion rate (e.g., "5/6 Pomodoros completed — 83%").
- Time actually focused vs. planned.
- If using an unlockable theme: the final themed canvas becomes a "collectible" — saved in the user's gallery (see §3.7).

---

### 3.7 Gamification System

**Purpose:** Make every interaction rewarding. Turn mundane time-tracking into a game where the user's character grows, their canvas evolves, and their achievements accumulate.

#### 3.7.1 XP (Experience Points)

XP is earned for nearly every positive action:

| Action | XP Reward |
|---|---|
| Complete a Pomodoro slot | +20 XP |
| Complete all Pomodoros in a time block | +50 XP (block bonus) |
| Answer a check-in ping | +5 XP |
| Answer a check-in as "On Track" | +10 XP |
| Answer a check-in as "Busy" (with label) | +8 XP |
| Log a full day (0 unaccounted time) | +100 XP |
| Maintain daily streak (per day) | +15 XP × streak count (capped at ×30) |
| Complete a "Must Do" sub-routine | +25 XP |
| Achieve Day Score ≥ 90 | +75 XP |
| Write a journal entry | +10 XP |
| Complete weekly review | +50 XP |
| Set and achieve a weekly goal | +100 XP |
| Pomodoro streak (3+ in a row) | +10 XP per Pomo in streak |

**XP Penalties (soft):**

| Action | XP Effect |
|---|---|
| Miss a check-in ping | -0 XP (no penalty, but no gain) |
| Abandon a Pomodoro | -0 XP (streak resets, no deduction) |
| Unaccounted time > 2 hours | Disqualified from daily bonus |

_Philosophy: Never punish. Only withhold rewards. The absence of XP is punishment enough._

#### 3.7.2 Levels & Titles

| Level | XP Required | Title | Unlock |
|---|---|---|---|
| 1 | 0 | Beginner | Classic canvas theme |
| 2 | 200 | Getting Started | — |
| 3 | 500 | Apprentice | Custom Pomodoro sounds |
| 5 | 1,500 | Focused | Pixel Art canvas theme |
| 8 | 4,000 | Time Warrior | Profile badge frame |
| 10 | 7,000 | Disciplined | Neon canvas theme |
| 15 | 15,000 | Routine Master | Garden canvas theme |
| 20 | 30,000 | Zenith | Space canvas theme |
| 25 | 50,000 | Time Lord | Animated profile avatar |
| 30 | 80,000 | Unstoppable | Bonfire canvas theme |
| 40 | 150,000 | Legendary | Mosaic canvas theme |
| 50 | 300,000 | Transcendent | Custom canvas theme creator |

Levels are displayed:
- Next to the user's name everywhere (avatar + level badge).
- On the dashboard as a progress bar to next level.
- In a dedicated "Profile & Achievements" page.

#### 3.7.3 Achievements & Badges

One-time achievements for milestone events:

| Badge | Condition | XP Bonus |
|---|---|---|
| 🍅 **First Blood** | Complete your first Pomodoro | +50 XP |
| 🔥 **On Fire** | 10 Pomodoros in a single day | +100 XP |
| 🌋 **Eruption** | 50 Pomodoros in a single week | +250 XP |
| 📅 **7-Day Warrior** | 7-day daily streak | +200 XP |
| 📅 **30-Day Legend** | 30-day daily streak | +1,000 XP |
| 📅 **100-Day Titan** | 100-day daily streak | +5,000 XP |
| 🎯 **Perfect Day** | Day Score = 100 | +300 XP |
| 🎯 **Perfect Week** | All 7 days with Day Score ≥ 90 | +1,000 XP |
| 🌅 **Early Bird** | Complete a Pomodoro before 7 AM | +50 XP |
| 🦉 **Night Owl** | Complete a Pomodoro after 11 PM | +50 XP |
| 📝 **Journalist** | Write journal entries 7 days in a row | +150 XP |
| ⏰ **Check-In Champion** | 100% check-in response rate for a full week | +200 XP |
| 🧱 **Block Crusher** | Complete all Pomodoros in a time block 5 days in a row | +300 XP |
| 🎨 **Canvas Collector** | Unlock 5 canvas themes | +500 XP |
| 🏔️ **Summit** | Reach Level 25 | +2,000 XP |

Badges appear in a **Trophy Case** on the user's profile. Newly earned badges trigger a celebration animation (fireworks on the Block Canvas).

#### 3.7.4 Daily Challenges

Each day, the app generates 3 small challenges to keep things fresh:

- _"Complete 4 Pomodoros before noon"_ → +40 XP
- _"Respond to all check-ins today"_ → +30 XP
- _"Finish your Morning Routine block at 100%"_ → +50 XP

Challenges are displayed on the dashboard and in the Block Canvas header area. Completing all 3 daily challenges earns a **"Daily Triple"** bonus (+50 XP).

#### 3.7.5 Canvas Gallery

When using themed canvases (Garden, Space, Mosaic, etc.), each fully completed time block's final canvas state is saved as a **collectible snapshot**:

- Saved in a "Gallery" page.
- Shows the date, block name, completion rate, and the visual canvas.
- Garden theme: a gallery of bloomed gardens from different days.
- Mosaic theme: completed mosaics form a larger artwork over weeks.
- Users can share their gallery items as images (export/screenshot).

This transforms daily work into **digital art you earn through discipline**.

#### 3.7.6 Leaderboard (Optional / Future)

- Opt-in weekly leaderboard among friends / accountability partners.
- Ranked by total XP earned that week.
- Top 3 get a special badge for the week.

---

### 3.8 Weekly Review & Insights

**Purpose:** A structured end-of-week reflection to drive improvement.

#### Functionality:

- **Auto-Generated Report** — Every Sunday (configurable day), the app generates a weekly summary:
  - Total hours by category.
  - Day Scores for each day.
  - Streaks maintained or broken.
  - Top 3 best-utilized days and worst-utilized days.
  - Check-in response rate.
  - Unaccounted time total.
- **AI-Powered Insights (Future)** — _"You tend to lose focus after lunch on Wednesdays. Consider scheduling lighter tasks between 1–3 PM."_
- **Goal Setting for Next Week** — Based on this week's data, user can set 1–3 micro-goals (e.g., "Reduce idle time by 1 hour", "Complete Exercise sub-routine at least 5 days").
- **Comparison with Previous Week** — Side-by-side metrics.

---

### 3.9 Notification System

**Purpose:** The backbone of the accountability mechanism.

#### Types of Notifications:

| Type | Trigger | Content |
|---|---|---|
| **Check-In Ping** | Every N minutes during active hours | "What are you doing right now?" |
| **Block Transition** | When a new time block starts | "Time for [Block Name]! Ready?" |
| **Busy Follow-Up** | After busy estimated duration expires | "Still busy with [label]? Or back to your routine?" |
| **Gap Alert** | 2+ hours of unaccounted time | "You have unlogged time. Fill it in?" |
| **Streak Warning** | Day Score dropping below threshold by evening | "Your streak is at risk! Log your activities." |
| **Weekly Review** | Sunday evening | "Your weekly review is ready." |
| **Focus Break** | During focus mode, at interval | "Time for a break!" |
| **Morning Brief** | At wake-up time | "Here's your routine for today." |

#### Technical:

- **Browser Push Notifications** via Firebase Cloud Messaging (FCM).
- **In-App Notifications** when the tab is active (toast/modal).
- **Service Worker** for background notification handling.
- **Notification Preferences** — User can toggle each notification type on/off independently.

---

### 3.10 Interactive Guidance & Visual Feedback

**Purpose:** Make the app self-teaching. Every feature should explain itself through visual cues, animations, and contextual guidance — so the user never wonders "what does this button do?" or "how do I use this?"

#### 3.10.1 Onboarding Tour (First-Time User)

When a new user signs up, they're guided through a **step-by-step interactive tour** — not a wall of text, but a live walkthrough where they interact with real UI elements.

**Tour Flow:**

1. **Welcome Screen** — "Welcome to Productive Guy! Let's set up your first routine in 2 minutes." Animated character/mascot waves. "Let's go →" button with a pulsing glow.

2. **Create Your First Routine** — A spotlight highlights the "New Routine" button. Tooltip: _"A routine is your ideal day template. Start by naming it."_ User types a name. Visual feedback: the routine card animates into existence with a satisfying pop.

3. **Add a Time Block** — Spotlight moves to the timeline. Tooltip: _"Tap anywhere on the timeline to create a time block."_ User taps. A time block expands with a stretch animation. Tooltip: _"Give it a name, pick a category, set start and end times."_

4. **Add Sub-Routines** — Spotlight on the sub-routine area inside the block. Tooltip: _"Break this block into smaller tasks. These are your sub-routines."_ User adds one. The sub-routine slides in from the left with a list-item animation.

5. **Enable Pomodoro** — Spotlight on the Pomodoro toggle. Tooltip: _"Turn on Pomodoro mode to split this block into focused work chunks."_ User toggles. The Block Canvas appears with a reveal animation — tiles slide up one by one. Tooltip: _"Each tile is a Pomodoro. Click one to start working!"_

6. **Try a Check-In** — A simulated check-in notification appears. Tooltip: _"This is a check-in. We'll ask you what you're doing at regular intervals. Try responding!"_ User picks "On track". Green flash + XP toast: "+10 XP! Your first check-in."

7. **Tour Complete** — Confetti animation. "You're all set! Your routine is live. We'll start pinging you at your next time block." Shows the dashboard with their new routine visible.

**Tour Properties:**
- Skippable at any step ("Skip tour" link — always visible but de-emphasized).
- Progress dots at the bottom (Step 3 of 7).
- Can be replayed from Settings → "Replay onboarding tour".
- Each step has a **short animation** demonstrating the concept before the user interacts (e.g., a ghost cursor dragging a time block to show how it works).

#### 3.10.2 Contextual Tooltips & Hints

Beyond onboarding, the app uses **contextual tooltips** that appear based on the user's behavior:

**First-Use Tooltips:**
- First time opening a time block → tooltip explaining sub-routines and Pomodoro slots.
- First time seeing the Block Canvas → animated tooltip pointing at tiles: _"Each tile is a work session. Click ▶ to start."_
- First time on the analytics page → tooltip: _"This is your command center. Hover over any graph for details."_
- First check-in missed → gentle tooltip on the dashboard: _"You missed a check-in. Here's how to respond faster next time."_ with a link to notification settings.

**Situational Hints (Smart):**
- User has 3+ hours unaccounted → amber banner with animated pointing hand: _"Looks like you have some gaps. Tap here to fill them in."_
- User hasn't used Pomodoro yet on an enabled block → pulse animation on the ▶ button: _"Ready to focus? Start your first Pomodoro."_
- User's Day Score is below 50 by 6 PM → motivational nudge card on dashboard: _"Still time to turn today around! Complete 2 more Pomodoros to hit your streak target."_
- User created a routine but never assigned it to a day → tooltip on the calendar page: _"Your routine isn't active yet. Drag it onto a day to start using it."_
- User logged "busy" 3+ times in a day → insight card: _"Busy day! Consider adding a 'Flex' time block to your routine for days like this."_

**Tooltip Design:**
- Semi-transparent dark card with an arrow pointing to the target element.
- Subtle entrance animation (fade + slide from the arrow direction).
- "Got it" dismiss button (remembers dismissal — won't show the same tooltip again).
- Optionally, a "?" icon on complex UI elements that shows the tooltip on hover/tap.

#### 3.10.3 Visual Feedback for Every Action

Every user action produces **immediate visual feedback** — the app should feel alive and responsive. Nothing should happen silently.

| User Action | Visual Feedback |
|---|---|
| Tap "On Track" on check-in | Green flash on the screen edge. Timeline bar segment turns green in real-time. Toast: "✅ Logged! +10 XP" |
| Tap "I'm Busy" on check-in | Amber pulse. Busy label form slides up. After submission: amber bar appears on timeline with the label text. Toast: "🔶 Busy logged." |
| Tap "Not doing anything" | Subtle gray fade. Timeline bar turns light gray. No celebration — a quiet acknowledgment. Toast: "Logged as idle." |
| Miss a check-in (grace period expires) | Red pulse on the timeline at that slot. A crack/fracture animation on the unaccounted gap. Dashboard badge counter increments. |
| Complete a Pomodoro | Tile fills completely with a satisfying sweep animation. Confetti particles burst from the tile. XP counter animates upward. Streak flame grows. Sound: completion chime. |
| Abandon a Pomodoro | Tile drains (fill animation reverses). Tile turns gray. Streak flame extinguishes (puff of smoke animation). No harsh sound — just a soft thud. |
| Level up | Full-screen celebration: level number zooms in, title text appears below, unlock notification slides in from the right ("Neon theme unlocked! 🎉"). Lasts 3 seconds, auto-dismisses. |
| Earn a badge | Badge icon flies to the Trophy Case in the nav. Fireworks animation behind the badge. Toast persists for 5 seconds with the badge name and description. |
| Daily streak incremented | Streak counter on dashboard animates: old number rolls out, new number rolls in. Flame icon pulses. |
| Streak broken | Streak counter drops to 0 with a shatter animation. Brief screen shake (subtle, 200ms). Followed by a motivational message: _"Streaks restart. You don't."_ |
| Day Score calculated (end of day) | Score number counts up from 0 to the final value. Color shifts from red → amber → green as it climbs. If above threshold: star burst. If below: encouraging message. |
| Routine assigned to a day | The routine card shrinks and flies to the calendar cell with a satisfying snap. The cell glows briefly. |
| Block Canvas collectible saved | The canvas does a polaroid-style snapshot animation — white flash, image shrinks into a card that flies to the Gallery icon. |

#### 3.10.4 Micro-Interaction Patterns

Consistent animation language across the app:

- **Success** → Green flash, upward motion, particle burst, chime sound.
- **Neutral/Busy** → Amber pulse, horizontal slide, soft acknowledgment tone.
- **Warning** → Amber glow, gentle bounce, no sound (not alarming).
- **Failure/Miss** → Red pulse (brief), downward motion or drain, subtle thud. Never aggressive.
- **Progress** → Fill animations (bottom-to-top for Pomodoro tiles, left-to-right for progress bars). Always smooth easing (ease-out).
- **XP gain** → Floating "+XX XP" text that rises and fades. Consistent position (near the source of the action).
- **Navigation transitions** → Pages slide in from the right (forward) or left (back). Modals fade in with a slight scale-up.

#### 3.10.5 Empty State Guidance

Every page has a **designed empty state** that guides the user instead of showing a blank screen:

| Page | Empty State |
|---|---|
| **Dashboard** (no routine yet) | Illustration of a clock with a "+" button. "Your day is a blank canvas. Create your first routine to start tracking." Primary CTA button. |
| **Today** (no routine assigned) | Calendar illustration. "No routine assigned for today. Pick one from your library or create a new one." Two buttons: "Browse Routines" / "Create New". |
| **Analytics** (no data yet) | Graph skeleton with a friendly message: "Start logging your time and we'll build your insights here. Complete your first full day to see your first chart." |
| **Trophy Case** (no badges) | Empty shelf illustration. "Your trophies will appear here as you earn them. First up: complete a Pomodoro to earn 🍅 First Blood!" |
| **Canvas Gallery** (no collectibles) | Empty picture frames on a wall. "Complete a time block with a themed canvas to save your first collectible." |
| **History** (no past days) | Timeline illustration. "Your history will build up day by day. Come back tomorrow to see your first entry." |

#### 3.10.6 Feature Discovery Nudges

As the user matures (uses the app for days/weeks), the app progressively introduces advanced features they haven't tried:

| Trigger | Nudge |
|---|---|
| Day 3, user hasn't enabled Pomodoro on any block | Dashboard card: "💡 Tip: Try Pomodoro mode on your time blocks for focused work sprints." [Try it →] |
| Day 5, user hasn't written a journal entry | After Day Score reveal: "📝 Tip: Add a journal note to remember how today felt." [Write a note] |
| Day 7, user hasn't visited analytics | Notification: "📊 Your first week of data is ready! Check out your analytics." [View Analytics →] |
| User reaches Level 5, hasn't changed canvas theme | Profile page: "🎨 You've unlocked the Pixel Art canvas theme! Want to try it?" [Switch Theme] |
| User logs "busy" for >1 hour 3 days in a row | Insight card: "You've been busy a lot lately. Consider adding a 'Flex' or 'Buffer' time block to your routine to absorb unexpected events." [Edit Routine] |
| User has never used Focus Mode | When they click ▶ on a Pomodoro tile for the first time: "Entering Focus Mode! Here's how it works..." + brief animated overlay showing the timer UI. |

Nudges are:
- **Non-blocking** — cards or banners, never modals (except onboarding).
- **Dismissable** — "Got it" / "Don't show again" options.
- **Tracked** — once a nudge is shown and dismissed, it never returns.
- **Rate-limited** — max 1 nudge per session, so the app doesn't feel naggy.

---

## 4. Data Models

### 4.1 User

```typescript
interface User {
  uid: string;                    // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  settings: UserSettings;
}

interface UserSettings {
  defaultCheckInInterval: number;   // in minutes (15, 20, 30, 45, 60)
  graceperiod: number;              // minutes before marking unaccounted
  silentHoursStart: string;         // "23:00"
  silentHoursEnd: string;           // "06:00"
  dayScoreThreshold: number;        // for streaks (default 70)
  timezone: string;
  weekStartsOn: 'monday' | 'sunday';
  timeSlotIncrement: number;        // 5, 10, 15, 30 minutes
  weeklyReviewDay: string;          // "sunday"
  notificationPreferences: {
    checkInPing: boolean;
    blockTransition: boolean;
    busyFollowUp: boolean;
    gapAlert: boolean;
    streakWarning: boolean;
    weeklyReview: boolean;
    morningBrief: boolean;
  };
  onboardingCompleted: boolean;     // has the user finished the onboarding tour?
  dismissedHints: string[];         // IDs of contextual hints the user dismissed
  featureNudgesShown: string[];     // IDs of feature discovery nudges already shown
}
```

### 4.2 Routine

```typescript
interface Routine {
  id: string;
  userId: string;
  name: string;
  description?: string;
  activeDays: number[];             // 0=Sun, 1=Mon, ..., 6=Sat
  isDefault: boolean;               // fallback if no routine assigned
  timeBlocks: TimeBlock[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 4.3 Time Block

```typescript
interface TimeBlock {
  id: string;
  routineId: string;
  name: string;
  category: Category;
  color: string;                    // hex color
  startTime: string;                // "06:00" (HH:mm)
  endTime: string;                  // "08:00" (HH:mm)
  checkInInterval?: number;         // override per-block (minutes)
  subRoutines: SubRoutine[];
  pomodoroEnabled: boolean;         // whether this block uses Pomodoro slots
  pomodoroConfig: PomodoroConfig;   // default Pomodoro settings for this block
  pomodoroSlots: PomodoroSlot[];    // ordered list of Pomodoro slots
  order: number;                    // display order
}

interface PomodoroConfig {
  defaultWorkDuration: number;      // minutes (15, 20, 25, 30, 45, 50)
  defaultBreakDuration: number;     // minutes (3, 5, 10, 15)
  longBreakInterval: number;        // every N pomodoros (default 4)
  longBreakDuration: number;        // minutes (default 15)
  autoAdvance: boolean;             // auto-start next Pomo after break
  autoGenerateSlots: boolean;       // auto-fill block with Pomodoros
}

type Category =
  | 'work'
  | 'health'
  | 'learning'
  | 'leisure'
  | 'personal'
  | 'sleep'
  | 'commute'
  | 'social'
  | 'creative'
  | 'custom';
```

### 4.4 Sub-Routine

```typescript
interface SubRoutine {
  id: string;
  timeBlockId: string;
  name: string;
  description?: string;
  estimatedDuration: number;        // in minutes
  priority: 'must' | 'should' | 'nice';
  order: number;
}
```

### 4.5 Activity Log Entry

```typescript
interface ActivityLogEntry {
  id: string;
  userId: string;
  date: string;                     // "2026-03-04" (YYYY-MM-DD)
  startTime: Timestamp;
  endTime: Timestamp;
  source: 'check-in' | 'manual' | 'timer' | 'auto' | 'busy-followup';
  status: 'on-track' | 'different' | 'busy' | 'idle' | 'unaccounted';
  routineId?: string;               // which routine was active
  timeBlockId?: string;             // which block was planned
  subRoutineId?: string;            // which sub-routine (if applicable)
  freeText?: string;                // if "doing something else"
  busyLabel?: string;               // REQUIRED if status='busy' — what the user is busy with
  busyEstimatedDuration?: number;   // minutes — how long user expects to be busy
  category: Category;
  isRetroactive: boolean;           // logged >2 hours after the fact
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 4.6 Check-In Record

```typescript
interface CheckInRecord {
  id: string;
  userId: string;
  scheduledAt: Timestamp;           // when ping was sent
  respondedAt?: Timestamp;          // when user responded
  response: 'on-track' | 'different' | 'busy' | 'idle' | 'snoozed' | 'missed';
  busyLabel?: string;               // populated when response='busy'
  activityLogEntryId?: string;      // linked log entry
  graceDeadline: Timestamp;         // scheduledAt + gracePeriod
}
```

### 4.7 Day Summary

```typescript
interface DaySummary {
  id: string;
  userId: string;
  date: string;                     // "2026-03-04"
  routineId: string;                // which routine was used
  dayScore: number;                 // 0–100
  totalPlannedMinutes: number;
  totalLoggedMinutes: number;
  totalUnaccountedMinutes: number;
  totalIdleMinutes: number;
  totalBusyMinutes: number;         // documented but unplanned time
  checkInsSent: number;
  checkInsAnswered: number;
  checkInsMissed: number;
  mustDoCompleted: number;
  mustDoTotal: number;
  categoryBreakdown: Record<Category, number>;  // minutes per category
  journalEntry?: string;            // daily reflection text
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 4.8 Streak

```typescript
interface Streak {
  id: string;
  userId: string;
  type: 'daily' | 'sub-routine';
  subRoutineId?: string;            // if type = 'sub-routine'
  currentCount: number;
  longestCount: number;
  lastActiveDate: string;           // "2026-03-04"
  startedAt: Timestamp;
}
```

### 4.9 Routine Override

```typescript
interface RoutineOverride {
  id: string;
  userId: string;
  date: string;                     // "2026-03-15"
  routineId: string;                // use this routine instead of the default for that day
}
```

### 4.10 Pomodoro Slot

```typescript
interface PomodoroSlot {
  id: string;
  timeBlockId: string;
  type: 'work' | 'break' | 'long-break';
  workDuration: number;             // minutes (override of block default)
  breakDuration: number;            // minutes (override of block default)
  linkedSubRoutineId?: string;      // which sub-routine this slot is for
  order: number;                    // position in the slot sequence
}
```

### 4.11 Pomodoro Session (Runtime)

```typescript
interface PomodoroSession {
  id: string;
  userId: string;
  date: string;                     // "2026-03-04"
  timeBlockId: string;
  pomodoroSlotId: string;
  status: 'completed' | 'abandoned' | 'skipped' | 'paused' | 'in-progress';
  plannedDuration: number;          // minutes
  actualDuration: number;           // minutes (how long before stop/complete)
  startedAt: Timestamp;
  endedAt?: Timestamp;
  xpEarned: number;
  streakPosition: number;           // e.g., 3rd consecutive Pomo in this block
  linkedSubRoutineId?: string;
}
```

### 4.12 User Gamification Profile

```typescript
interface GamificationProfile {
  userId: string;
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  title: string;                    // e.g., "Routine Master"
  unlockedCanvasThemes: string[];   // ['classic', 'pixel-art', 'neon', ...]
  activeCanvasTheme: string;        // currently selected theme
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

interface EarnedBadge {
  badgeId: string;                  // e.g., "first-blood", "7-day-warrior"
  name: string;
  description: string;
  earnedAt: Timestamp;
  xpBonusAwarded: number;
}

interface DailyChallenge {
  id: string;
  date: string;
  description: string;              // e.g., "Complete 4 Pomodoros before noon"
  targetValue: number;
  currentValue: number;
  xpReward: number;
  completed: boolean;
}
```

### 4.13 Canvas Collectible

```typescript
interface CanvasCollectible {
  id: string;
  userId: string;
  date: string;
  timeBlockId: string;
  timeBlockName: string;
  theme: string;                    // which canvas theme was active
  completionRate: number;           // 0.0–1.0
  totalPomodoros: number;
  completedPomodoros: number;
  xpEarned: number;
  canvasSnapshot: string;           // base64 PNG or serialized canvas state
  createdAt: Timestamp;
}
```

---

## 5. Page & Route Structure

```
/                           → Landing / Dashboard (if logged in)
/login                      → Firebase Auth (Google, Email/Password)
/signup                     → Registration

/dashboard                  → Main dashboard with today's timeline, score, streaks
/dashboard/analytics        → Full analytics page with all graphs

/routines                   → List of all routines
/routines/new               → Create a new routine
/routines/[id]              → View/edit a specific routine
/routines/[id]/blocks       → Manage time blocks within a routine
/routines/calendar          → Assign routines to days of the week + overrides

/today                      → Today's detailed view (planned vs actual timeline + Block Canvases)
/today/log                  → Manual time logging interface
/today/focus/[blockId]      → Focus mode with Pomodoro timer for a specific time block

/history                    → Past days browser (calendar picker → day detail)
/history/[date]             → Specific day's full breakdown

/profile                    → User gamification profile (level, XP, title, stats)
/profile/trophies           → Trophy case with all earned badges
/profile/gallery            → Canvas collectibles gallery

/review                     → Weekly review page
/review/[week]              → Specific week's review

/settings                   → User settings & notification preferences
/settings/notifications     → Detailed notification configuration
/settings/categories        → Manage custom categories and colors
/settings/pomodoro          → Default Pomodoro durations, sounds, auto-advance
/settings/canvas            → Select active canvas theme, preview unlocked themes
```

---

## 6. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Server components, API routes, SSR |
| **Language** | TypeScript | Strict mode |
| **Styling** | Tailwind CSS 4 | Utility-first, dark mode support |
| **UI Components** | shadcn/ui (planned) | Accessible, composable components |
| **Charts** | Recharts or Chart.js | For analytics graphs |
| **Auth** | Firebase Authentication | Google, Email/Password providers |
| **Database** | Firebase Firestore | NoSQL, real-time sync |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Service worker based |
| **Hosting** | Vercel (planned) | Optimized for Next.js |
| **State Management** | React Context + useReducer | Or Zustand if complexity grows |
| **Date/Time** | date-fns or dayjs | Lightweight date manipulation |
| **Drag & Drop** | dnd-kit | For routine/block reordering |
| **Canvas Rendering** | HTML Canvas API (native) + custom renderer | Block Canvas Pomodoro visualizations |
| **Animations** | Framer Motion | Celebration effects, tile transitions |
| **Audio** | Howler.js (planned) | Pomodoro timer sounds, ambient focus audio |
| **Guided Tours** | driver.js or react-joyride | Onboarding spotlights, step-by-step walkthroughs |
| **Toasts / Feedback** | Sonner (planned) | Lightweight toast notifications for XP, actions |

---

## 7. Build Phases

### Phase 1 — Foundation (Auth + Routine Builder)

**Goal:** User can sign up, log in, and create/edit routines with time blocks and sub-routines.

- [ ] Firebase Auth integration (Google + Email/Password)
- [ ] Protected routes and auth state management
- [ ] User profile and settings page (basic)
- [ ] Routine CRUD (create, read, update, delete)
- [ ] Time Block CRUD within a routine
- [ ] Sub-Routine CRUD within a time block
- [ ] Pomodoro slot configuration per time block (enable/disable, durations)
- [ ] Auto-generate Pomodoro slots for a time block
- [ ] Manual Pomodoro slot add/remove/reorder
- [ ] Timeline visualization of a routine
- [ ] Assign routines to days of the week
- [ ] Routine override for specific dates

### Phase 2 — Time Logging, Check-Ins & Block Canvas

**Goal:** User can log their actual activities and receive check-in pings.

- [ ] Today's view with planned vs. actual timeline
- [ ] Manual activity logging (add/edit log entries)
- [ ] Start/Stop timer for sub-routines
- [ ] Block Canvas — HTML Canvas renderer for Pomodoro slot visualization
- [ ] Pomodoro timer (focus mode) with work/break/long-break cycle
- [ ] Canvas tile state management (not started → in progress → completed/failed)
- [ ] Auto-transition from work → break → next Pomodoro
- [ ] Pomodoro session logging (PomodoroSession records)
- [ ] Gap detection and unaccounted time highlighting
- [ ] Check-in notification system (in-app first)
- [ ] Push notification setup (FCM + Service Worker)
- [ ] Check-in response UI (on-track, busy, different, idle)
- [ ] Busy response form (mandatory label, optional category & duration)
- [ ] Busy follow-up ping after estimated duration
- [ ] Busy time tracking on timeline (amber bars with labels)
- [ ] Recent busy labels auto-complete / suggestion pills
- [ ] Grace period logic and auto-marking unaccounted
- [ ] Snooze functionality
- [ ] Silent hours configuration

### Phase 3 — Analytics & Dashboard

**Goal:** User can see detailed analytics about their time usage and patterns.

- [ ] Dashboard with today's summary (score, streaks, pie chart)
- [ ] Day Score calculation engine
- [ ] Daily pie chart (time by category)
- [ ] Plan vs. Actual bar chart
- [ ] Weekly heat map
- [ ] Regularity score line chart (30/60/90 days)
- [ ] Category trend stacked area chart
- [ ] Check-in response rate graph
- [ ] Sub-routine completion rate chart
- [ ] Time waste tracker
- [ ] Peak productivity hours (clock/radial chart)
- [ ] Date range filtering and comparison

### Phase 4 — Gamification & Engagement

**Goal:** Make the app addictive through XP, levels, badges, canvas themes, and daily challenges.

- [ ] XP engine — award XP for all tracked actions
- [ ] Level system with XP thresholds and titles
- [ ] Gamification profile page (level, XP bar, title, stats)
- [ ] Pomodoro streak tracking (consecutive completions within a block)
- [ ] Daily streak system
- [ ] Sub-routine streaks
- [ ] Achievement / badge system with Trophy Case page
- [ ] Badge unlock celebration animations (fireworks on canvas)
- [ ] Daily challenges — 3 auto-generated micro-goals per day
- [ ] Daily Triple bonus for completing all 3 challenges
- [ ] Canvas themes — Classic (default) + unlockable themes (Pixel Art, Neon, Garden, Space, Bonfire, Mosaic)
- [ ] Canvas collectibles — save completed block canvases as gallery items
- [ ] Canvas Gallery page
- [ ] Personal bests and milestone celebrations
- [ ] Weekly Review auto-generation
- [ ] Week-over-week comparison
- [ ] Goal setting for next week
- [ ] Activity journal / daily notes

### Phase 5 — Interactive Guidance & Polish

**Goal:** Make the app self-teaching, delightful, and production-ready.

**Interactive Guidance:**
- [ ] Onboarding tour (7-step walkthrough with spotlights & animations)
- [ ] First-use tooltips for each major feature (auto-triggered, dismissable)
- [ ] Situational smart hints (gap alerts, unused features, busy patterns)
- [ ] Visual feedback system — action → animation mapping for every interaction
- [ ] Micro-interaction animations (success, busy, warning, failure, progress, XP gain)
- [ ] Empty state designs for all pages (dashboard, analytics, trophies, gallery, history)
- [ ] Feature discovery nudges (progressive, rate-limited, trackable)
- [ ] "Replay onboarding" option in Settings

**Polish:**
- [ ] Dark mode / theme system
- [ ] Responsive mobile layout (PWA-ready)
- [ ] Keyboard shortcuts
- [ ] Data export (CSV/JSON)
- [ ] Template library (pre-built routines to start from)
- [ ] Accountability partner (share read-only view)
- [ ] Morning brief notification
- [ ] AI-powered weekly insights (stretch goal)
- [ ] Custom canvas theme creator (Level 50 unlock)
- [ ] Pomodoro ambient sound library (rain, lo-fi, white noise)
- [ ] Leaderboard (opt-in, among friends)
- [ ] Canvas sharing (export collectible as image)

---

## 8. UI/UX Guidelines

### Design Principles:

1. **Clarity over cleverness** — The user should understand their day at a glance. No hidden menus, no ambiguous icons.
2. **Guilt without shame** — Show unaccounted time honestly but don't make the user feel terrible. Use warm warnings (amber), not angry alerts (red) for first offenses.
3. **Speed of interaction** — Responding to a check-in should take < 3 seconds. Two taps maximum.
4. **Visual density** — The dashboard should be information-rich but scannable. Use progressive disclosure (summaries that expand to details).
5. **Dark mode first** — Designed for late-night reflection sessions.
6. **Gamification should feel earned, not cheap** — XP and badges reward genuine effort. No participation trophies. The difficulty curve should make high levels genuinely impressive.
7. **Canvas as the emotional anchor** — The Block Canvas is the most visually rich element. It's the first thing the user sees when they open a time block. Make it delightful — smooth animations, satisfying fill effects, celebratory moments on completion.
8. **Every action gets a reaction** — No silent state changes. Every tap, every log, every check-in response triggers a visible animation and/or sound. The app must feel alive. Feedback should be instant (<100ms perceived latency).
9. **Teach by doing, not by reading** — Never show a help page. Show a tooltip on the element. Never write a paragraph — show a 2-second animation. The UI is the documentation.
10. **Busy is valid, vague is not** — The app respects that life is unpredictable. Being busy is fine and fully supported. But "I was busy" without context is not accepted. The label is mandatory because the data is what makes analytics useful.

### Color System:

| Category | Default Color | Hex |
|---|---|---|
| Work | Blue | `#3B82F6` |
| Health | Green | `#22C55E` |
| Learning | Purple | `#A855F7` |
| Leisure | Orange | `#F97316` |
| Personal | Pink | `#EC4899` |
| Sleep | Indigo | `#6366F1` |
| Commute | Gray | `#6B7280` |
| Social | Yellow | `#EAB308` |
| Creative | Teal | `#14B8A6` |
| Idle | Light Gray | `#D1D5DB` |
| Busy (unplanned) | Amber | `#F59E0B` |
| Unaccounted | Red (muted) | `#EF4444` |

### Visual Feedback Colors:

| Feedback Type | Color | Hex | Usage |
|---|---|---|---|
| Success | Green | `#22C55E` | On-track confirmation, Pomo complete, streak increment |
| Busy Acknowledgment | Amber | `#F59E0B` | Busy check-in logged, busy timeline bars |
| Warning | Amber (light) | `#FBBF24` | Gap alerts, streak-at-risk nudges |
| Error / Miss | Red (soft) | `#F87171` | Unaccounted time, missed check-in, streak broken |
| XP Gain | Gold | `#FFD700` | Floating XP text, level-up celebrations |
| Neutral | Slate | `#94A3B8` | Idle acknowledgment, skipped Pomodoro |

### Typography:

- **Headings:** Inter or Geist Sans (bold)
- **Body:** Inter or Geist Sans (regular)
- **Monospace (timers, scores):** Geist Mono or JetBrains Mono

---

## 9. Future Enhancements

These are ideas beyond the initial build, to be considered after the core app is stable:

- **Mobile App (React Native / Expo)** — Native push notifications, always-on background pings.
- **Apple Watch / Wear OS** — Quick check-in responses from your wrist.
- **Calendar Integration** — Sync with Google Calendar. Auto-populate time blocks from calendar events.
- **Habit Tracker Module** — Track binary habits (Did I drink 8 glasses of water? Yes/No) alongside time tracking.
- **Team Mode** — For small teams/study groups. Shared accountability dashboard.
- **Public Accountability Profile** — Opt-in public page showing your streaks and scores (like GitHub contribution graph).
- **API & Webhooks** — Let power users connect to Notion, Obsidian, or automation tools.
- **Offline Support** — PWA with local storage sync when connection resumes.
- **Voice Logging** — "Hey, I was studying for the last hour" → parsed and logged automatically.
- **AI Schedule Optimizer** — Based on historical data, suggest routine changes. _"You're most productive for Deep Work between 9–11 AM, not 2–4 PM."_

---

_This document is the single source of truth for the Productive Guy project. All implementation decisions should reference this spec. Update this document as features evolve._
