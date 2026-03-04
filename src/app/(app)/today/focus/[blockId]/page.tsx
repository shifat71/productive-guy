"use client";

import { useEffect, useState, useRef, useCallback, use } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRoutineStore, useTodayStore, useGamificationStore } from "@/lib/stores";
import {
  getRoutine, createPomodoroSession, updatePomodoroSession as updatePomoDB,
  addXP, getPomodoroSessionsForDate,
} from "@/lib/firestore";
import { generateId, getDateString } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, X, Coffee, Flame, Zap, ChevronLeft } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import Link from "next/link";
import { XP_REWARDS, type TimeBlock, type PomodoroSlot, type PomodoroSession, type PomodoroStatus } from "@/lib/types";

type Phase = "idle" | "work" | "break";

export default function FocusModePage({ params }: { params: Promise<{ blockId: string }> }) {
  const { blockId } = use(params);
  const { user } = useAuth();
  const { showXPToast } = useGamificationStore();
  const { addPomodoroSession, updatePomodoroSession, pomodoroSessions, setPomodoroSessions } = useTodayStore();

  const [block, setBlock] = useState<TimeBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [streak, setStreak] = useState(0);
  const [xpThisBlock, setXpThisBlock] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [completedSlots, setCompletedSlots] = useState<Set<number>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;
    // Find the block from routines
    const { routines } = useRoutineStore.getState();
    for (const routine of routines) {
      const found = routine.timeBlocks.find((b) => b.id === blockId);
      if (found) {
        setBlock(found);
        break;
      }
    }

    getPomodoroSessionsForDate(user.uid, getDateString()).then((sessions) => {
      setPomodoroSessions(sessions);
      const blockSessions = sessions.filter((s) => s.timeBlockId === blockId);
      const completed = new Set<number>();
      blockSessions.forEach((s) => {
        const slotIdx = routines
          .flatMap((r) => r.timeBlocks)
          .find((b) => b.id === blockId)
          ?.pomodoroSlots.findIndex((ps) => ps.id === s.pomodoroSlotId);
        if (slotIdx !== undefined && slotIdx >= 0 && s.status === "completed") {
          completed.add(slotIdx);
        }
      });
      setCompletedSlots(completed);
    });

    setLoading(false);
  }, [user, blockId]);

  const startPomodoro = useCallback(async (slotIndex: number) => {
    if (!block || !user) return;
    const slot = block.pomodoroSlots[slotIndex];
    if (!slot) return;

    const duration = slot.type === "work" ? slot.workDuration : slot.breakDuration;
    const totalSec = duration * 60;

    setCurrentSlotIndex(slotIndex);
    setPhase(slot.type === "work" ? "work" : "break");
    setSecondsLeft(totalSec);
    setTotalSeconds(totalSec);
    setIsPaused(false);

    if (slot.type === "work") {
      const id = generateId();
      setSessionId(id);
      const session: PomodoroSession = {
        id,
        userId: user.uid,
        date: getDateString(),
        timeBlockId: blockId,
        pomodoroSlotId: slot.id,
        status: "in-progress",
        plannedDuration: duration,
        actualDuration: 0,
        startedAt: Timestamp.now(),
        xpEarned: 0,
        streakPosition: streak + 1,
        linkedSubRoutineId: slot.linkedSubRoutineId,
      };
      await createPomodoroSession(session);
      addPomodoroSession(session);
    }
  }, [block, user, blockId, streak]);

  // Timer tick
  useEffect(() => {
    if (phase === "idle" || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, isPaused]);

  const handleTimerComplete = async () => {
    if (!block || !user) return;
    const slot = block.pomodoroSlots[currentSlotIndex];

    if (phase === "work") {
      // Complete the pomodoro
      const xp = XP_REWARDS.completePomo + (streak >= 2 ? XP_REWARDS.pomoStreakBonus : 0);
      await updatePomoDB(sessionId, {
        status: "completed",
        actualDuration: slot.workDuration,
        endedAt: Timestamp.now(),
        xpEarned: xp,
      });
      updatePomodoroSession(sessionId, { status: "completed", xpEarned: xp });
      await addXP(user.uid, xp);
      showXPToast(xp);
      setXpThisBlock((prev) => prev + xp);
      setStreak((prev) => prev + 1);
      setCompletedSlots((prev) => new Set(prev).add(currentSlotIndex));

      // Auto-transition to break
      const nextSlot = block.pomodoroSlots[currentSlotIndex + 1];
      if (nextSlot && (nextSlot.type === "break" || nextSlot.type === "long-break")) {
        startPomodoro(currentSlotIndex + 1);
      } else {
        setPhase("idle");
      }
    } else {
      // Break complete, auto-advance to next work slot
      const nextIdx = currentSlotIndex + 1;
      if (nextIdx < block.pomodoroSlots.length && block.pomodoroConfig.autoAdvance) {
        startPomodoro(nextIdx);
      } else {
        setPhase("idle");
      }
    }
  };

  const handleAbandon = async () => {
    if (!user) return;
    if (sessionId) {
      await updatePomoDB(sessionId, {
        status: "abandoned",
        actualDuration: Math.round((totalSeconds - secondsLeft) / 60),
        endedAt: Timestamp.now(),
        xpEarned: 0,
      });
      updatePomodoroSession(sessionId, { status: "abandoned" });
    }
    setPhase("idle");
    setStreak(0);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading || !block) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const workSlots = block.pomodoroSlots.filter((s) => s.type === "work");
  const completedCount = completedSlots.size;
  const totalWorkSlots = workSlots.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/today" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to Today
      </Link>

      {/* Block Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{block.name}</h1>
          <p className="text-muted-foreground text-sm">
            Focus Mode · {completedCount}/{totalWorkSlots} Pomodoros
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="gap-1"><Flame className="h-3 w-3" /> {streak}x streak</Badge>
          <Badge variant="outline" className="gap-1"><Zap className="h-3 w-3" /> {xpThisBlock} XP</Badge>
        </div>
      </div>

      {/* Block Canvas */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2 flex-wrap">
            {block.pomodoroSlots.map((slot, idx) => {
              const isActive = idx === currentSlotIndex && phase !== "idle";
              const isCompleted = completedSlots.has(idx);

              return (
                <motion.button
                  key={slot.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (phase === "idle" && !isCompleted) startPomodoro(idx);
                  }}
                  className={`relative flex flex-col items-center justify-center rounded-xl border-2 transition-all cursor-pointer ${
                    slot.type === "work"
                      ? isCompleted
                        ? "border-success bg-success/10 text-success"
                        : isActive
                        ? "border-primary bg-primary/10 text-primary animate-pulse-glow"
                        : "border-border bg-card text-foreground hover:border-primary/30"
                      : isCompleted || isActive
                      ? "border-warning/50 bg-warning/10 text-warning"
                      : "border-border bg-muted text-muted-foreground"
                  }`}
                  style={{
                    width: slot.type === "work" ? "72px" : "48px",
                    height: slot.type === "work" ? "72px" : "56px",
                  }}
                >
                  <span className="text-lg">
                    {slot.type === "work"
                      ? isCompleted ? "✅" : isActive ? "🔥" : "🍅"
                      : "☕"}
                  </span>
                  <span className="text-[10px] font-medium">
                    {slot.type === "work" ? `${slot.workDuration}m` : `${slot.breakDuration}m`}
                  </span>
                </motion.button>
              );
            })}
          </div>
          <Progress
            value={totalWorkSlots > 0 ? (completedCount / totalWorkSlots) * 100 : 0}
            className="mt-3"
            color="var(--success)"
          />
          <p className="text-xs text-muted-foreground text-center mt-1.5">
            {completedCount} of {totalWorkSlots} Pomodoros completed
          </p>
        </CardContent>
      </Card>

      {/* Timer */}
      <AnimatePresence mode="wait">
        {phase !== "idle" ? (
          <motion.div
            key="timer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className={phase === "break" ? "border-warning/30" : "border-primary/30"}>
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {phase === "work"
                    ? `Pomo ${currentSlotIndex + 1} of ${block.pomodoroSlots.length}`
                    : "Break Time"}
                </p>
                <p className="text-7xl font-mono font-bold tracking-wider mb-6">
                  {formatTimer(secondsLeft)}
                </p>

                <Progress
                  value={totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0}
                  className="mb-6 mx-auto max-w-xs"
                  color={phase === "work" ? "var(--primary)" : "var(--warning)"}
                />

                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsPaused(!isPaused)}
                    className="gap-2"
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    {isPaused ? "Resume" : "Pause"}
                  </Button>

                  {phase === "work" && (
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={handleAbandon}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" /> Give Up
                    </Button>
                  )}

                  {phase === "break" && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        const nextIdx = currentSlotIndex + 1;
                        if (nextIdx < block.pomodoroSlots.length) {
                          startPomodoro(nextIdx);
                        } else {
                          setPhase("idle");
                        }
                      }}
                      className="gap-2"
                    >
                      <SkipForward className="h-4 w-4" /> Skip Break
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card>
              <CardContent className="p-8 text-center">
                {completedCount >= totalWorkSlots && totalWorkSlots > 0 ? (
                  <>
                    <p className="text-4xl mb-3">🎉</p>
                    <h2 className="text-xl font-bold mb-2">Block Complete!</h2>
                    <p className="text-muted-foreground text-sm mb-4">
                      You completed {completedCount} Pomodoros and earned {xpThisBlock} XP.
                    </p>
                    <Link href="/today">
                      <Button>Back to Today</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Play className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h2 className="text-lg font-bold mb-1">Ready to focus?</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click a Pomodoro tile above or press start.
                    </p>
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={() => {
                        // Find first incomplete work slot
                        const nextIdx = block.pomodoroSlots.findIndex(
                          (s, i) => s.type === "work" && !completedSlots.has(i)
                        );
                        if (nextIdx >= 0) startPomodoro(nextIdx);
                      }}
                    >
                      <Play className="h-4 w-4" /> Start Next Pomodoro
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
