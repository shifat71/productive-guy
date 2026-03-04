"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useRoutineStore } from "@/lib/stores";
import { createRoutine } from "@/lib/firestore";
import { generateId } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Timestamp } from "firebase/firestore";
import type { Routine } from "@/lib/types";

const DAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export default function NewRoutinePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addRoutine, routines } = useRoutineStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [activeDays, setActiveDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [saving, setSaving] = useState(false);

  const toggleDay = (day: number) => {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    setSaving(true);
    const now = Timestamp.now();
    const routine: Routine = {
      id: generateId(),
      userId: user.uid,
      name: name.trim(),
      description: description.trim() || undefined,
      activeDays,
      isDefault: routines.length === 0,
      timeBlocks: [],
      createdAt: now,
      updatedAt: now,
    };

    await createRoutine(routine);
    addRoutine(routine);
    router.push(`/routines/${routine.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Routine</h1>
        <p className="text-muted-foreground">Design your ideal day template.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="name"
              label="Routine Name"
              placeholder="e.g., Workday, Weekend, Exam Prep"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description (optional)</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors resize-none"
                placeholder="Describe this routine..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Active Days</label>
              <div className="flex gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      activeDays.includes(day.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim() || saving}>
                {saving ? "Creating..." : "Create & Add Time Blocks"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
