"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTodayStore, useGamificationStore } from "@/lib/stores";
import { createActivityLog, addXP } from "@/lib/firestore";
import { generateId, getDateString } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Timestamp } from "firebase/firestore";
import { CATEGORY_LABELS, XP_REWARDS, type Category, type ActivityStatus } from "@/lib/types";
import { Plus, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }));
const STATUSES: { value: ActivityStatus; label: string }[] = [
  { value: "on-track", label: "On Track" },
  { value: "different", label: "Different Activity" },
  { value: "busy", label: "Busy (Unplanned)" },
  { value: "idle", label: "Idle / Nothing" },
];

export default function TodayLogPage() {
  const { user } = useAuth();
  const { addActivityLog } = useTodayStore();
  const { showXPToast } = useGamificationStore();

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState<ActivityStatus>("on-track");
  const [category, setCategory] = useState<Category>("work");
  const [freeText, setFreeText] = useState("");
  const [busyLabel, setBusyLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !startTime || !endTime) return;

    setSaving(true);
    const today = getDateString();
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);

    const startDate = new Date();
    startDate.setHours(sh, sm, 0, 0);
    const endDate = new Date();
    endDate.setHours(eh, em, 0, 0);

    const now = Timestamp.now();
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const isRetroactive = startDate < twoHoursAgo;

    const entry = {
      id: generateId(),
      userId: user.uid,
      date: today,
      startTime: Timestamp.fromDate(startDate),
      endTime: Timestamp.fromDate(endDate),
      source: "manual" as const,
      status,
      freeText: freeText || undefined,
      busyLabel: status === "busy" ? busyLabel : undefined,
      category,
      isRetroactive,
      createdAt: now,
      updatedAt: now,
    };

    await createActivityLog(entry);
    addActivityLog(entry);
    await addXP(user.uid, XP_REWARDS.answerCheckIn);
    showXPToast(XP_REWARDS.answerCheckIn);

    // Reset
    setStartTime("");
    setEndTime("");
    setFreeText("");
    setBusyLabel("");
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manual Time Log</h1>
        <p className="text-muted-foreground">Fill in gaps in your day.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="startTime"
                label="Start Time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
              <Input
                id="endTime"
                label="End Time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <Select
              id="status"
              label="What were you doing?"
              options={STATUSES}
              value={status}
              onChange={(e) => setStatus(e.target.value as ActivityStatus)}
            />

            {status === "busy" && (
              <Input
                id="busyLabel"
                label="Busy with (required)"
                placeholder="e.g., Meeting, Phone call..."
                value={busyLabel}
                onChange={(e) => setBusyLabel(e.target.value)}
                required
              />
            )}

            <Select
              id="category"
              label="Category"
              options={CATEGORIES}
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            />

            <Input
              id="freeText"
              label="Notes (optional)"
              placeholder="What specifically..."
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
            />

            <Button type="submit" className="w-full gap-2" disabled={saving}>
              {saved ? (
                <><CheckCircle className="h-4 w-4" /> Logged!</>
              ) : saving ? (
                "Saving..."
              ) : (
                <><Plus className="h-4 w-4" /> Log Activity</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
