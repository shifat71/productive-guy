"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { updateUserSettings, updateUserProfile } from "@/lib/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Settings, Bell, Clock, Globe, Save, User } from "lucide-react";
import type { UserSettings } from "@/lib/types";

export default function SettingsPage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const settings = userProfile?.settings;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || "");

  // Local state derived from settings
  const [checkInInterval, setCheckInInterval] = useState(String(settings?.defaultCheckInInterval || 30));
  const [gracePeriod, setGracePeriod] = useState(String(settings?.gracePeriod || 5));
  const [silentStart, setSilentStart] = useState(settings?.silentHoursStart || "23:00");
  const [silentEnd, setSilentEnd] = useState(settings?.silentHoursEnd || "06:00");
  const [dayScoreThreshold, setDayScoreThreshold] = useState(String(settings?.dayScoreThreshold || 70));
  const [weekStartsOn, setWeekStartsOn] = useState<"monday" | "sunday">(settings?.weekStartsOn || "monday");
  const [timeSlotIncrement, setTimeSlotIncrement] = useState(String(settings?.timeSlotIncrement || 15));
  const [weeklyReviewDay, setWeeklyReviewDay] = useState(settings?.weeklyReviewDay || "sunday");

  // Notification toggles
  const [notifs, setNotifs] = useState(settings?.notificationPreferences || {
    checkInPing: true,
    blockTransition: true,
    busyFollowUp: true,
    gapAlert: true,
    streakWarning: true,
    weeklyReview: true,
    morningBrief: true,
  });

  const toggleNotif = (key: keyof typeof notifs) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const newSettings: Partial<UserSettings> = {
        defaultCheckInInterval: parseInt(checkInInterval) || 30,
        gracePeriod: parseInt(gracePeriod) || 5,
        silentHoursStart: silentStart,
        silentHoursEnd: silentEnd,
        dayScoreThreshold: parseInt(dayScoreThreshold) || 70,
        weekStartsOn,
        timeSlotIncrement: parseInt(timeSlotIncrement) || 15,
        weeklyReviewDay,
        notificationPreferences: notifs,
      };
      await updateUserSettings(user.uid, newSettings);
      if (displayName !== userProfile?.displayName) {
        await updateUserProfile(user.uid, { displayName });
      }
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return null;

  const notifLabels: Record<string, string> = {
    checkInPing: "Check-In Pings",
    blockTransition: "Block Transitions",
    busyFollowUp: "Busy Follow-Ups",
    gapAlert: "Gap Alerts",
    streakWarning: "Streak Warnings",
    weeklyReview: "Weekly Review Reminder",
    morningBrief: "Morning Brief",
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <Input label="Email" value={userProfile?.email || ""} disabled />
          </CardContent>
        </Card>
      </motion.div>

      {/* Check-In Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" /> Check-In Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Check-In Interval (mins)"
              type="number"
              value={checkInInterval}
              onChange={(e) => setCheckInInterval(e.target.value)}
            />
            <Input
              label="Grace Period (mins)"
              type="number"
              value={gracePeriod}
              onChange={(e) => setGracePeriod(e.target.value)}
            />
            <Input
              label="Silent Hours Start"
              type="time"
              value={silentStart}
              onChange={(e) => setSilentStart(e.target.value)}
            />
            <Input
              label="Silent Hours End"
              type="time"
              value={silentEnd}
              onChange={(e) => setSilentEnd(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* General Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" /> General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Day Score Threshold"
              type="number"
              value={dayScoreThreshold}
              onChange={(e) => setDayScoreThreshold(e.target.value)}
            />
            <Select
              label="Week Starts On"
              value={weekStartsOn}
              onChange={(e) => setWeekStartsOn(e.target.value as "monday" | "sunday")}
              options={[
                { label: "Monday", value: "monday" },
                { label: "Sunday", value: "sunday" },
              ]}
            />
            <Select
              label="Time Slot Increment"
              value={timeSlotIncrement}
              onChange={(e) => setTimeSlotIncrement(e.target.value)}
              options={[
                { label: "5 minutes", value: "5" },
                { label: "10 minutes", value: "10" },
                { label: "15 minutes", value: "15" },
                { label: "30 minutes", value: "30" },
              ]}
            />
            <Select
              label="Weekly Review Day"
              value={weeklyReviewDay}
              onChange={(e) => setWeeklyReviewDay(e.target.value)}
              options={["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].map((d) => ({
                label: d.charAt(0).toUpperCase() + d.slice(1),
                value: d,
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </CardTitle>
          <CardDescription>Toggle which notifications you receive.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(notifLabels).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">{label}</span>
                <button
                  type="button"
                  onClick={() => toggleNotif(key as keyof typeof notifs)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifs[key as keyof typeof notifs] ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      notifs[key as keyof typeof notifs] ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
