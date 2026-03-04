"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getDaySummariesForRange } from "@/lib/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths, getDay, isSameMonth, isToday } from "date-fns";
import { useRouter } from "next/navigation";
import { getDateString } from "@/lib/utils";
import type { DaySummary } from "@/lib/types";

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [summaries, setSummaries] = useState<Record<string, DaySummary>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    getDaySummariesForRange(user.uid, start, end).then((s) => {
      const map: Record<string, DaySummary> = {};
      s.forEach((sum) => (map[sum.date] = sum));
      setSummaries(map);
    }).catch((err) => {
      console.error("History load error:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, [user, currentMonth]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start
  const startPad = getDay(monthStart);
  const paddedDays: (Date | null)[] = [
    ...Array.from({ length: startPad }, () => null),
    ...days,
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-success";
    if (score >= 70) return "bg-primary";
    if (score >= 40) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-muted-foreground">Review past days.</p>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-xs text-muted-foreground py-2 font-medium">{d}</div>
            ))}
            {paddedDays.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} />;
              const dateStr = format(day, "yyyy-MM-dd");
              const summary = summaries[dateStr];
              const today = isToday(day);

              return (
                <motion.button
                  key={dateStr}
                  className={`relative rounded-lg p-2 text-left transition-colors hover:bg-accent ${
                    today ? "ring-1 ring-primary" : ""
                  } ${summary ? "cursor-pointer" : "opacity-50 cursor-default"}`}
                  onClick={() => summary && router.push(`/history/${dateStr}`)}
                  whileHover={summary ? { scale: 1.05 } : undefined}
                >
                  <div className="text-xs mb-1">{format(day, "d")}</div>
                  {summary && (
                    <div className={`h-1.5 w-full rounded-full ${getScoreColor(summary.dayScore)}`} />
                  )}
                  {summary && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">{summary.dayScore}</div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        {[
          { label: "90+", color: "bg-success" },
          { label: "70-89", color: "bg-primary" },
          { label: "40-69", color: "bg-warning" },
          { label: "<40", color: "bg-destructive" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <div className={`h-2.5 w-2.5 rounded-full ${l.color}`} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
