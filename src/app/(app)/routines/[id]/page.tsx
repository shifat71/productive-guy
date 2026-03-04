"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRoutineStore } from "@/lib/stores";
import { getRoutine, updateRoutine as updateRoutineDB } from "@/lib/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, GripVertical, ChevronDown, ChevronRight, Clock, Timer,
} from "lucide-react";
import { formatTime, getMinutesBetween, generateId } from "@/lib/utils";
import {
  CATEGORY_COLORS, CATEGORY_LABELS,
  DEFAULT_POMODORO_CONFIG,
  type TimeBlock, type SubRoutine, type PomodoroSlot, type Category,
} from "@/lib/types";
import type { Routine } from "@/lib/types";

const CATEGORIES: { value: Category; label: string }[] = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({ value: value as Category, label })
);

export default function RoutineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { updateRoutine: updateStore } = useRoutineStore();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);

  // Block form state
  const [blockName, setBlockName] = useState("");
  const [blockCategory, setBlockCategory] = useState<Category>("work");
  const [blockStart, setBlockStart] = useState("09:00");
  const [blockEnd, setBlockEnd] = useState("10:00");
  const [blockPomodoroEnabled, setBlockPomodoroEnabled] = useState(false);

  useEffect(() => {
    if (!user) return;
    getRoutine(id).then((r) => {
      setRoutine(r);
      setLoading(false);
    });
  }, [user, id]);

  const save = async (updated: Routine) => {
    setRoutine(updated);
    updateStore(updated.id, updated);
    await updateRoutineDB(updated.id, { timeBlocks: updated.timeBlocks });
  };

  const openAddBlock = () => {
    setEditingBlock(null);
    setBlockName("");
    setBlockCategory("work");
    setBlockStart("09:00");
    setBlockEnd("10:00");
    setBlockPomodoroEnabled(false);
    setShowBlockModal(true);
  };

  const openEditBlock = (block: TimeBlock) => {
    setEditingBlock(block);
    setBlockName(block.name);
    setBlockCategory(block.category);
    setBlockStart(block.startTime);
    setBlockEnd(block.endTime);
    setBlockPomodoroEnabled(block.pomodoroEnabled);
    setShowBlockModal(true);
  };

  const handleSaveBlock = async () => {
    if (!routine || !blockName.trim()) return;

    const color = CATEGORY_COLORS[blockCategory] || "#3B82F6";

    if (editingBlock) {
      const updated: Routine = {
        ...routine,
        timeBlocks: routine.timeBlocks.map((b) =>
          b.id === editingBlock.id
            ? { ...b, name: blockName.trim(), category: blockCategory, startTime: blockStart, endTime: blockEnd, color, pomodoroEnabled: blockPomodoroEnabled }
            : b
        ),
      };
      await save(updated);
    } else {
      const newBlock: TimeBlock = {
        id: generateId(),
        routineId: routine.id,
        name: blockName.trim(),
        category: blockCategory,
        color,
        startTime: blockStart,
        endTime: blockEnd,
        subRoutines: [],
        pomodoroEnabled: blockPomodoroEnabled,
        pomodoroConfig: DEFAULT_POMODORO_CONFIG,
        pomodoroSlots: [],
        order: routine.timeBlocks.length,
      };
      const updated: Routine = {
        ...routine,
        timeBlocks: [...routine.timeBlocks, newBlock].sort((a, b) => a.startTime.localeCompare(b.startTime)),
      };
      await save(updated);
    }
    setShowBlockModal(false);
  };

  const deleteBlock = async (blockId: string) => {
    if (!routine || !confirm("Delete this time block?")) return;
    const updated: Routine = {
      ...routine,
      timeBlocks: routine.timeBlocks.filter((b) => b.id !== blockId),
    };
    await save(updated);
  };

  const addSubRoutine = async (blockId: string) => {
    if (!routine) return;
    const name = prompt("Sub-routine name:");
    if (!name?.trim()) return;
    const duration = parseInt(prompt("Estimated duration (minutes):", "15") || "15", 10);
    const priority = (prompt("Priority (must/should/nice):", "should") || "should") as "must" | "should" | "nice";

    const sub: SubRoutine = {
      id: generateId(),
      timeBlockId: blockId,
      name: name.trim(),
      estimatedDuration: duration,
      priority,
      order: 0,
    };

    const updated: Routine = {
      ...routine,
      timeBlocks: routine.timeBlocks.map((b) =>
        b.id === blockId
          ? { ...b, subRoutines: [...b.subRoutines, { ...sub, order: b.subRoutines.length }] }
          : b
      ),
    };
    await save(updated);
  };

  const deleteSubRoutine = async (blockId: string, subId: string) => {
    if (!routine) return;
    const updated: Routine = {
      ...routine,
      timeBlocks: routine.timeBlocks.map((b) =>
        b.id === blockId
          ? { ...b, subRoutines: b.subRoutines.filter((s) => s.id !== subId) }
          : b
      ),
    };
    await save(updated);
  };

  const autoGeneratePomodoros = async (block: TimeBlock) => {
    if (!routine) return;
    const totalMinutes = getMinutesBetween(block.startTime, block.endTime);
    const config = block.pomodoroConfig;
    const slots: PomodoroSlot[] = [];
    let remaining = totalMinutes;
    let count = 0;

    while (remaining >= config.defaultWorkDuration) {
      count++;
      slots.push({
        id: generateId(),
        timeBlockId: block.id,
        type: "work",
        workDuration: config.defaultWorkDuration,
        breakDuration: config.defaultBreakDuration,
        order: slots.length,
      });
      remaining -= config.defaultWorkDuration;

      if (remaining <= 0) break;

      // Long break or short break
      if (count % config.longBreakInterval === 0 && remaining >= config.longBreakDuration) {
        slots.push({
          id: generateId(),
          timeBlockId: block.id,
          type: "long-break",
          workDuration: 0,
          breakDuration: config.longBreakDuration,
          order: slots.length,
        });
        remaining -= config.longBreakDuration;
      } else if (remaining >= config.defaultBreakDuration) {
        slots.push({
          id: generateId(),
          timeBlockId: block.id,
          type: "break",
          workDuration: 0,
          breakDuration: config.defaultBreakDuration,
          order: slots.length,
        });
        remaining -= config.defaultBreakDuration;
      }
    }

    const updated: Routine = {
      ...routine,
      timeBlocks: routine.timeBlocks.map((b) =>
        b.id === block.id ? { ...b, pomodoroSlots: slots } : b
      ),
    };
    await save(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Routine not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{routine.name}</h1>
          {routine.description && (
            <p className="text-muted-foreground text-sm">{routine.description}</p>
          )}
        </div>
        <Button onClick={openAddBlock} className="gap-2">
          <Plus className="h-4 w-4" /> Add Time Block
        </Button>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        <AnimatePresence>
          {routine.timeBlocks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No time blocks yet. Add your first block to start building your routine.
                </p>
                <Button onClick={openAddBlock} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" /> Add Time Block
                </Button>
              </CardContent>
            </Card>
          ) : (
            routine.timeBlocks.map((block, i) => {
              const isExpanded = expandedBlock === block.id;
              const duration = getMinutesBetween(block.startTime, block.endTime);
              const subTotal = block.subRoutines.reduce((s, sr) => s + sr.estimatedDuration, 0);

              return (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="overflow-hidden">
                    {/* Block Header */}
                    <div
                      className="flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => setExpandedBlock(isExpanded ? null : block.id)}
                    >
                      <div
                        className="h-8 w-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: block.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{block.name}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {CATEGORY_LABELS[block.category]}
                          </Badge>
                          {block.pomodoroEnabled && (
                            <Badge className="text-[10px]">🍅 Pomodoro</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatTime(block.startTime)} – {formatTime(block.endTime)} · {duration} min ·{" "}
                          {block.subRoutines.length} sub-routines
                          {subTotal > duration && (
                            <span className="text-warning ml-1">⚠ exceeds by {subTotal - duration}min</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); openEditBlock(block); }}
                        >
                          <Clock className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border overflow-hidden"
                        >
                          <div className="p-4 space-y-4">
                            {/* Pomodoro Slots Preview */}
                            {block.pomodoroEnabled && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium">Pomodoro Slots</h4>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => autoGeneratePomodoros(block)}
                                  >
                                    <Timer className="h-3.5 w-3.5 mr-1.5" />
                                    Fill with Pomodoros
                                  </Button>
                                </div>
                                {block.pomodoroSlots.length > 0 ? (
                                  <div className="flex gap-1.5 flex-wrap">
                                    {block.pomodoroSlots.map((slot) => (
                                      <div
                                        key={slot.id}
                                        className={`flex items-center justify-center rounded-lg border text-xs font-medium ${
                                          slot.type === "work"
                                            ? "border-primary/30 bg-primary/10 text-primary px-3 py-1.5"
                                            : slot.type === "long-break"
                                            ? "border-warning/30 bg-warning/10 text-warning px-2 py-1.5"
                                            : "border-border bg-muted text-muted-foreground px-2 py-1.5"
                                        }`}
                                      >
                                        {slot.type === "work" ? `🍅 ${slot.workDuration}m` : `☕ ${slot.breakDuration}m`}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground">
                                    No Pomodoro slots yet. Click &quot;Fill with Pomodoros&quot; to auto-generate.
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Sub-Routines */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">Sub-Routines</h4>
                                <Button variant="outline" size="sm" onClick={() => addSubRoutine(block.id)}>
                                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add
                                </Button>
                              </div>
                              {block.subRoutines.length === 0 ? (
                                <p className="text-xs text-muted-foreground">
                                  No sub-routines yet. Break this block into smaller tasks.
                                </p>
                              ) : (
                                <div className="space-y-1.5">
                                  {block.subRoutines.map((sub) => (
                                    <div
                                      key={sub.id}
                                      className="flex items-center gap-3 rounded-lg border border-border p-2.5"
                                    >
                                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{sub.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {sub.estimatedDuration} min ·{" "}
                                          <span className={
                                            sub.priority === "must" ? "text-destructive" :
                                            sub.priority === "should" ? "text-warning" : "text-muted-foreground"
                                          }>
                                            {sub.priority === "must" ? "Must Do" : sub.priority === "should" ? "Should Do" : "Nice to Have"}
                                          </span>
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                        onClick={() => deleteSubRoutine(block.id, sub.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Add/Edit Block Modal */}
      <Modal
        open={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        title={editingBlock ? "Edit Time Block" : "Add Time Block"}
      >
        <div className="space-y-4">
          <Input
            id="blockName"
            label="Block Name"
            placeholder="e.g., Morning Routine, Deep Work"
            value={blockName}
            onChange={(e) => setBlockName(e.target.value)}
          />

          <Select
            id="blockCategory"
            label="Category"
            options={CATEGORIES}
            value={blockCategory}
            onChange={(e) => setBlockCategory(e.target.value as Category)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="blockStart"
              label="Start Time"
              type="time"
              value={blockStart}
              onChange={(e) => setBlockStart(e.target.value)}
            />
            <Input
              id="blockEnd"
              label="End Time"
              type="time"
              value={blockEnd}
              onChange={(e) => setBlockEnd(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="pomodoroEnabled"
              checked={blockPomodoroEnabled}
              onChange={(e) => setBlockPomodoroEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <label htmlFor="pomodoroEnabled" className="text-sm font-medium cursor-pointer">
              🍅 Enable Pomodoro Mode
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowBlockModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveBlock} disabled={!blockName.trim()} className="flex-1">
              {editingBlock ? "Update" : "Add Block"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
