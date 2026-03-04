"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRoutineStore, useTodayStore } from "@/lib/stores";
import {
  getUserRoutines, getActivityLogsForDate, getDaySummary,
  getRoutineOverride, getPomodoroSessionsForDate,
} from "@/lib/firestore";
import { getDateString, formatTime, getMinutesBetween, formatDuration } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Clock, Play, AlertTriangle, CheckCircle, ArrowRight, Timer,
} from "lucide-react";
import Link from "next/link";
import { CATEGORY_COLORS, CATEGORY_LABELS, type ActivityStatus } from "@/lib/types";
import type { Routine, TimeBlock, ActivityLogEntry } from "@/lib/types";

const STATUS_COLORS: Record<ActivityStatus, { bg: string; text: string; label: string }> = {
  "on-track": { bg: "bg-success/10", text: "text-success", label: "On Track" },
  "different": { bg: "bg-primary/10", text: "text-primary", label: "Different Activity" },
  "busy": { bg: "bg-warning/10", text: "text-warning", label: "Busy" },
  "idle": { bg: "bg-muted", text: "text-muted-foreground", label: "Idle" },
  "unaccounted": { bg: "bg-destructive/10", text: "text-destructive", label: "Unaccounted" },
};

export default function TodayPage() {
  const { user } = useAuth();
  const { routines, setRoutines, activeRoutine, setActiveRoutine } = useRoutineStore();
  const { activityLogs, setActivityLogs, daySummary, setDaySummary, pomodoroSessions, setPomodoroSessions } = useTodayStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const today = getDateString();
    const dayOfWeek = new Date().getDay();

    Promise.all([
      getUserRoutines(user.uid),
      getActivityLogsForDate(user.uid, today),
      getDaySummary(user.uid, today),
      getRoutineOverride(user.uid, today),
      getPomodoroSessionsForDate(user.uid, today),
    ]).then(([r, logs, summary, override, sessions]) => {
      setRoutines(r);
      setActivityLogs(logs);
      setDaySummary(summary);
      setPomodoroSessions(sessions);

      // Determine active routine
      let active: Routine | null = null;
      if (override) {
        active = r.find((rt) => rt.id === override.routineId) || null;
      }
      if (!active) {
        active = r.find((rt) => rt.activeDays.includes(dayOfWeek)) || r.find((rt) => rt.isDefault) || r[0] || null;
      }
      setActiveRoutine(active);
    }).catch((err) => {
      console.error("Today load error:", err);
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

  if (!activeRoutine) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-96 text-center">
        <Clock className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No routine for today</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Pick one from your library or create a new one.
        </p>
        <div className="flex gap-3">
          <Link href="/routines"><Button variant="outline">Browse Routines</Button></Link>
          <Link href="/routines/new"><Button>Create New</Button></Link>
        </div>
      </motion.div>
    );
  }

  const totalPlanned = activeRoutine.timeBlocks.reduce(
    (sum, b) => sum + getMinutesBetween(b.startTime, b.endTime), 0
  );
  const totalLogged = activityLogs.reduce((sum, l) => {
    const start = l.startTime.toDate();
    const end = l.endTime.toDate();
    return sum + (end.getTime() - start.getTime()) / 60000;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Today</h1>
          <p className="text-muted-foreground">
            {activeRoutine.name} · {formatDuration(totalPlanned)} planned · {formatDuration(Math.round(totalLogged))} logged
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/today/log">
            <Button variant="outline" className="gap-2">
              <AlertTriangle className="h-4 w-4" /> Fill Gaps
            </Button>
          </Link>
        </div>
      </div>

      {/* Unaccounted Alert */}
      {daySummary && daySummary.totalUnaccountedMinutes > 30 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  You have {formatDuration(daySummary.totalUnaccountedMinutes)} unaccounted for today.
                </p>
                <p className="text-xs text-muted-foreground">Fill them in to improve your day score.</p>
              </div>
              <Link href="/today/log">
                <Button size="sm" variant="outline">Fill in</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Dual Timeline: Planned vs Actual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Planned Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Planned</CardTitle>
            <CardDescription>Your routine for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeRoutine.timeBlocks.map((block, i) => {
              const duration = getMinutesBetween(block.startTime, block.endTime);
              const heightPx = Math.max(48, Math.min(200, duration * 0.8));

              return (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex gap-3"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-muted-foreground w-12 text-right shrink-0">
                      {formatTime(block.startTime)}
                    </span>
                    <div
                      className="w-3 rounded-full mt-1"
                      style={{ backgroundColor: block.color, height: `${heightPx}px` }}
                    />
                    <span className="text-[10px] text-muted-foreground w-12 text-right shrink-0 mt-1">
                      {formatTime(block.endTime)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{block.name}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {CATEGORY_LABELS[block.category]}
                      </Badge>
                    </div>
                    {block.subRoutines.length > 0 && (
                      <div className="mt-1.5 space-y-0.5">
                        {block.subRoutines.map((sub) => (
                          <p key={sub.id} className="text-xs text-muted-foreground">
                            • {sub.name} ({sub.estimatedDuration}m)
                          </p>
                        ))}
                      </div>
                    )}
                    {block.pomodoroEnabled && (
                      <Link href={`/today/focus/${block.id}`}>
                        <Button size="sm" variant="outline" className="mt-2 gap-1.5 h-7 text-xs">
                          <Play className="h-3 w-3" /> Focus Mode
                        </Button>
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        {/* Actual Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actual</CardTitle>
            <CardDescription>What really happened</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {activityLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No activity logged yet. Answer check-ins or log manually.
                </p>
                <Link href="/today/log">
                  <Button size="sm" className="mt-3">Log Activity</Button>
                </Link>
              </div>
            ) : (
              activityLogs.map((log, i) => {
                const start = log.startTime.toDate();
                const end = log.endTime.toDate();
                const duration = Math.round((end.getTime() - start.getTime()) / 60000);
                const style = STATUS_COLORS[log.status];

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${style.bg}`}
                  >
                    <div className="shrink-0">
                      {log.status === "on-track" && <CheckCircle className="h-4 w-4 text-success" />}
                      {log.status === "busy" && <AlertTriangle className="h-4 w-4 text-warning" />}
                      {log.status === "unaccounted" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                      {log.status === "idle" && <Clock className="h-4 w-4 text-muted-foreground" />}
                      {log.status === "different" && <ArrowRight className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${style.text}`}>
                        {log.busyLabel || log.freeText || style.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                        {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {duration}m
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{style.label}</Badge>
                  </motion.div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
