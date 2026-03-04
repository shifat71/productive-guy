"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore, useTodayStore, useGamificationStore } from "@/lib/stores";
import { useAuth } from "@/lib/auth-context";
import { createActivityLog, updateCheckIn, addXP } from "@/lib/firestore";
import { generateId, getDateString } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";
import { Check, AlertTriangle, Coffee, XCircle } from "lucide-react";
import type { ActivityStatus } from "@/lib/types";
import { XP_REWARDS } from "@/lib/types";

export function CheckInModal() {
  const { user } = useAuth();
  const { checkInModalOpen, setCheckInModalOpen, activeCheckIn, setActiveCheckIn } = useUIStore();
  const { addActivityLog } = useTodayStore();
  const { showXPToast } = useGamificationStore();
  const [busyLabel, setBusyLabel] = useState("");
  const [step, setStep] = useState<"main" | "busy">("main");

  const handleResponse = async (status: ActivityStatus) => {
    if (!user || !activeCheckIn) return;

    if (status === "busy") {
      setStep("busy");
      return;
    }

    await submitResponse(status);
  };

  const submitResponse = async (status: ActivityStatus, label?: string) => {
    if (!user || !activeCheckIn) return;

    const now = Timestamp.now();
    const logEntry = {
      id: generateId(),
      userId: user.uid,
      date: getDateString(),
      startTime: activeCheckIn.scheduledAt,
      endTime: now,
      source: "check-in" as const,
      status,
      busyLabel: label,
      category: "personal" as const,
      isRetroactive: false,
      createdAt: now,
      updatedAt: now,
    };

    await createActivityLog(logEntry);
    addActivityLog(logEntry);

    await updateCheckIn(activeCheckIn.id, {
      respondedAt: now,
      response: status === "on-track" ? "on-track" : status === "busy" ? "busy" : status === "idle" ? "idle" : "different",
      busyLabel: label,
      activityLogEntryId: logEntry.id,
    });

    // Award XP
    let xp: number = XP_REWARDS.answerCheckIn;
    if (status === "on-track") xp = XP_REWARDS.answerCheckInOnTrack;
    if (status === "busy") xp = XP_REWARDS.answerCheckInBusy;

    await addXP(user.uid, xp);
    showXPToast(xp);

    // Reset
    setActiveCheckIn(null);
    setCheckInModalOpen(false);
    setStep("main");
    setBusyLabel("");
  };

  const handleBusySubmit = async () => {
    if (busyLabel.trim().length < 3) return;
    await submitResponse("busy", busyLabel.trim());
  };

  return (
    <Modal
      open={checkInModalOpen}
      onClose={() => {
        setCheckInModalOpen(false);
        setStep("main");
        setBusyLabel("");
      }}
      title="Check-In"
      className="max-w-sm"
    >
      {step === "main" ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            What are you doing right now?
          </p>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={() => handleResponse("on-track")}
          >
            <Check className="h-5 w-5 text-success" />
            <span>On track</span>
            <span className="ml-auto text-xs text-muted-foreground">+{XP_REWARDS.answerCheckInOnTrack} XP</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={() => handleResponse("busy")}
          >
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span>I&apos;m busy</span>
            <span className="ml-auto text-xs text-muted-foreground">+{XP_REWARDS.answerCheckInBusy} XP</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={() => handleResponse("different")}
          >
            <Coffee className="h-5 w-5 text-primary" />
            <span>Doing something else</span>
            <span className="ml-auto text-xs text-muted-foreground">+{XP_REWARDS.answerCheckIn} XP</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={() => handleResponse("idle")}
          >
            <XCircle className="h-5 w-5 text-muted-foreground" />
            <span>Not doing anything</span>
            <span className="ml-auto text-xs text-muted-foreground">+{XP_REWARDS.answerCheckIn} XP</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            What are you busy with? <span className="text-destructive">*</span>
          </p>
          <Input
            placeholder="E.g., Phone call, Meeting, Doctor..."
            value={busyLabel}
            onChange={(e) => setBusyLabel(e.target.value)}
            autoFocus
          />
          {busyLabel.trim().length > 0 && busyLabel.trim().length < 3 && (
            <p className="text-xs text-destructive">At least 3 characters required</p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("main")} className="flex-1">
              Back
            </Button>
            <Button
              onClick={handleBusySubmit}
              disabled={busyLabel.trim().length < 3}
              className="flex-1"
            >
              Log busy
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
