"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRoutineStore, useTodayStore, useGamificationStore } from "@/lib/stores";
import { getUserRoutines, getDaySummary, getActivityLogsForDate, getUserStreaks, getGamificationProfile, getPomodoroSessionsForDate } from "@/lib/firestore";
import { getDateString, formatTime, formatDuration } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Flame, TrendingUp, Clock, Target, AlertTriangle, CheckCircle,
  Calendar, ArrowRight, BarChart3, Trophy, Zap
} from "lucide-react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORY_COLORS, CATEGORY_LABELS, type Category } from "@/lib/types";
import type { Streak, DaySummary as DaySummaryType } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { routines, setRoutines } = useRoutineStore();
  const { daySummary, setDaySummary, activityLogs, setActivityLogs } = useTodayStore();
  const { profile, setProfile } = useGamificationStore();
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const today = getDateString();
    Promise.all([
      getUserRoutines(user.uid),
      getDaySummary(user.uid, today),
      getActivityLogsForDate(user.uid, today),
      getUserStreaks(user.uid),
      getGamificationProfile(user.uid),
    ]).then(([r, ds, logs, s, gp]) => {
      setRoutines(r);
      setDaySummary(ds);
      setActivityLogs(logs);
      setStreaks(s);
      if (gp) setProfile(gp);
    }).catch((err) => {
      console.error("Dashboard load error:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const dailyStreak = streaks.find((s) => s.type === "daily");
  const todayScore = daySummary?.dayScore ?? 0;
  const unaccountedMinutes = daySummary?.totalUnaccountedMinutes ?? 0;
  const checkInRate = daySummary && daySummary.checkInsSent > 0
    ? Math.round((daySummary.checkInsAnswered / daySummary.checkInsSent) * 100)
    : 0;

  // Category breakdown for pie chart
  const categoryData = daySummary?.categoryBreakdown
    ? Object.entries(daySummary.categoryBreakdown)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({
          name: CATEGORY_LABELS[key as Category] || key,
          value,
          color: CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS] || "#6B7280",
        }))
    : [];

  // Empty state
  if (routines.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-96 text-center"
      >
        <Clock className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your day is a blank canvas</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Create your first routine to start tracking your time and holding yourself accountable.
        </p>
        <Link href="/routines/new">
          <Button size="lg" className="gap-2">
            Create your first routine <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Here&apos;s how your day is going.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Day Score</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: todayScore >= 70 ? "var(--success)" : todayScore >= 40 ? "var(--warning)" : "var(--destructive)" }}>
                    {todayScore}
                  </p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <Progress value={todayScore} className="mt-3" color={todayScore >= 70 ? "var(--success)" : todayScore >= 40 ? "var(--warning)" : "var(--destructive)"} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Streak</p>
                  <p className="text-3xl font-bold mt-1">{dailyStreak?.currentCount ?? 0}</p>
                </div>
                <Flame className="h-8 w-8 text-warning" />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Best: {dailyStreak?.longestCount ?? 0} days
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Check-In Rate</p>
                  <p className="text-3xl font-bold mt-1">{checkInRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {daySummary?.checkInsAnswered ?? 0} / {daySummary?.checkInsSent ?? 0} answered
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unaccounted</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: unaccountedMinutes > 120 ? "var(--destructive)" : unaccountedMinutes > 30 ? "var(--warning)" : "var(--success)" }}>
                    {formatDuration(unaccountedMinutes)}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              {unaccountedMinutes > 0 && (
                <Link href="/today/log">
                  <p className="text-xs text-primary mt-3 hover:underline cursor-pointer">
                    Fill in gaps →
                  </p>
                </Link>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Category Breakdown */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Time by Category</CardTitle>
            <CardDescription>Today&apos;s breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => typeof value === "number" ? formatDuration(value) : String(value)}
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categoryData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-muted-foreground">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No data yet. Start logging your time!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Today's Routine */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Routine</CardTitle>
            <CardDescription>Your active time blocks</CardDescription>
          </CardHeader>
          <CardContent>
            {routines.length > 0 ? (
              <div className="space-y-3">
                {routines[0]?.timeBlocks?.slice(0, 6).map((block, i) => (
                  <motion.div
                    key={block.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <div
                      className="h-10 w-1 rounded-full shrink-0"
                      style={{ backgroundColor: block.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{block.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(block.startTime)} – {formatTime(block.endTime)}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {CATEGORY_LABELS[block.category]}
                    </Badge>
                  </motion.div>
                )) || (
                  <p className="text-sm text-muted-foreground">No time blocks yet. Edit your routine to add them.</p>
                )}
                <Link href="/today">
                  <Button variant="outline" className="w-full mt-2 gap-2">
                    View full timeline <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No routine for today.</p>
                <Link href="/routines/new">
                  <Button size="sm" className="mt-3">Create routine</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gamification Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Level */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Level {profile?.currentLevel ?? 1}</p>
                <p className="text-sm font-semibold">{profile?.title ?? "Beginner"}</p>
                <Progress
                  value={profile ? Math.min(100, ((profile.totalXP - getXPForLevel(profile.currentLevel)) / Math.max(1, getXPForLevel(profile.currentLevel + 1) - getXPForLevel(profile.currentLevel))) * 100) : 0}
                  size="sm"
                  className="mt-1.5"
                  color="var(--xp-gold)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pomodoros Today */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <span className="text-xl">🍅</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pomodoros Today</p>
                <p className="text-2xl font-bold">{profile?.stats.totalPomodorosCompleted ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trophies */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-xp-gold/10">
                <Trophy className="h-6 w-6 text-xp-gold" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Badges Earned</p>
                <p className="text-2xl font-bold">{profile?.badges.length ?? 0}</p>
              </div>
              <Link href="/profile/trophies">
                <Button variant="ghost" size="sm">View →</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getXPForLevel(level: number): number {
  const { LEVEL_DEFINITIONS } = require("@/lib/types");
  for (const def of LEVEL_DEFINITIONS) {
    if (def.level === level) return def.xpRequired;
  }
  return 0;
}
