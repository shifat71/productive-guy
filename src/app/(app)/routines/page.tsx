"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRoutineStore } from "@/lib/stores";
import { getUserRoutines, deleteRoutine as deleteRoutineFromDB } from "@/lib/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Copy, ListChecks, Clock } from "lucide-react";
import Link from "next/link";
import { formatTime, formatDuration, getMinutesBetween } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/types";

export default function RoutinesPage() {
  const { user } = useAuth();
  const { routines, setRoutines, removeRoutine } = useRoutineStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserRoutines(user.uid).then((r) => {
      setRoutines(r);
    }).catch((err) => {
      console.error("Routines load error:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this routine?")) return;
    await deleteRoutineFromDB(id);
    removeRoutine(id);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Routines</h1>
          <p className="text-muted-foreground">Design your ideal days.</p>
        </div>
        <Link href="/routines/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Routine
          </Button>
        </Link>
      </div>

      {routines.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-64 text-center"
        >
          <ListChecks className="h-12 w-12 text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold mb-1">No routines yet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first routine to start planning your ideal day.
          </p>
          <Link href="/routines/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Routine
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {routines.map((routine, i) => {
              const totalMinutes = routine.timeBlocks.reduce(
                (sum, b) => sum + getMinutesBetween(b.startTime, b.endTime),
                0
              );
              return (
                <motion.div
                  key={routine.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="group hover:border-primary/30 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{routine.name}</h3>
                          {routine.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {routine.description}
                            </p>
                          )}
                        </div>
                        {routine.isDefault && <Badge variant="success">Default</Badge>}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDuration(totalMinutes)}
                        </span>
                        <span>{routine.timeBlocks.length} blocks</span>
                        <span>
                          {routine.activeDays.length === 7
                            ? "Every day"
                            : routine.activeDays
                                .map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d])
                                .join(", ")}
                        </span>
                      </div>

                      {/* Time blocks preview */}
                      <div className="flex gap-1 mb-4">
                        {routine.timeBlocks.slice(0, 8).map((block) => (
                          <div
                            key={block.id}
                            className="h-2 flex-1 rounded-full"
                            style={{ backgroundColor: block.color }}
                            title={block.name}
                          />
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link href={`/routines/${routine.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full gap-1.5">
                            <Edit className="h-3.5 w-3.5" /> Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(routine.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
