"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRoutineStore } from "@/lib/stores";
import { getUserRoutines, setRoutineOverride, getRoutineOverride } from "@/lib/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateId } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay } from "date-fns";
import type { Routine, RoutineOverride } from "@/lib/types";

export default function RoutineCalendarPage() {
  const { user } = useAuth();
  const { routines, setRoutines } = useRoutineStore();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (!user) return;
    getUserRoutines(user.uid).then((r) => {
      setRoutines(r);
    }).catch((err) => {
      console.error("Calendar load error:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, [user]);

  const getRoutineForDay = (date: Date): Routine | null => {
    const dateStr = format(date, "yyyy-MM-dd");
    const overrideRoutineId = overrides[dateStr];
    if (overrideRoutineId) {
      return routines.find((r) => r.id === overrideRoutineId) || null;
    }
    const dayOfWeek = date.getDay();
    return routines.find((r) => r.activeDays.includes(dayOfWeek)) || routines.find((r) => r.isDefault) || null;
  };

  const assignOverride = async (date: Date, routineId: string) => {
    if (!user) return;
    const dateStr = format(date, "yyyy-MM-dd");
    const override: RoutineOverride = {
      id: generateId(),
      userId: user.uid,
      date: dateStr,
      routineId,
    };
    await setRoutineOverride(override);
    setOverrides((prev) => ({ ...prev, [dateStr]: routineId }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Routine Calendar</h1>
        <p className="text-muted-foreground">Assign routines to specific days.</p>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium">
          {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}
        </span>
        <Button variant="outline" size="sm" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-3">
        {days.map((day) => {
          const routine = getRoutineForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <Card
              key={day.toISOString()}
              className={`${isToday ? "ring-2 ring-primary" : ""}`}
            >
              <CardHeader className="p-3 pb-1">
                <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
                <div className={`text-lg font-bold ${isToday ? "text-primary" : ""}`}>
                  {format(day, "d")}
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                {routine ? (
                  <div className="space-y-1.5">
                    <Badge variant="default" className="text-[10px] w-full justify-center">
                      {routine.name}
                    </Badge>
                    <div className="flex gap-0.5">
                      {routine.timeBlocks.slice(0, 5).map((b) => (
                        <div
                          key={b.id}
                          className="h-1.5 flex-1 rounded-full"
                          style={{ backgroundColor: b.color }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground text-center">No routine</p>
                )}

                {/* Assign dropdown */}
                {routines.length > 0 && (
                  <select
                    className="mt-2 w-full rounded text-[10px] bg-muted border-none px-1 py-0.5 cursor-pointer"
                    value={routine?.id || ""}
                    onChange={(e) => assignOverride(day, e.target.value)}
                  >
                    <option value="">None</option>
                    {routines.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
