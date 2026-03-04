"use client";

import { useAuth } from "@/lib/auth-context";
import { useGamificationStore } from "@/lib/stores";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LogOut, Bell, Flame } from "lucide-react";
import { useEffect } from "react";
import { getGamificationProfile } from "@/lib/firestore";

export function TopBar() {
  const { user, userProfile, signOut } = useAuth();
  const { profile, setProfile } = useGamificationStore();

  useEffect(() => {
    if (user) {
      getGamificationProfile(user.uid).then((p) => {
        if (p) setProfile(p);
      });
    }
  }, [user, setProfile]);

  const xpProgress = profile
    ? ((profile.totalXP - (getXPForCurrentLevel(profile.currentLevel))) /
        (profile.xpToNextLevel > 0 ? (getXPForNextLevel(profile.currentLevel) - getXPForCurrentLevel(profile.currentLevel)) : 1)) *
      100
    : 0;

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-medium text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* XP & Level */}
        {profile && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-xp-gold" />
              <span className="text-sm font-bold text-xp-gold">
                {profile.totalXP.toLocaleString()} XP
              </span>
            </div>
            <Badge>Lv {profile.currentLevel}</Badge>
            <div className="hidden md:block w-24">
              <Progress value={Math.max(0, Math.min(100, xpProgress))} size="sm" color="var(--xp-gold)" />
            </div>
          </div>
        )}

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4.5 w-4.5" />
        </Button>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {userProfile?.displayName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function getXPForCurrentLevel(level: number): number {
  const { LEVEL_DEFINITIONS } = require("@/lib/types");
  for (let i = LEVEL_DEFINITIONS.length - 1; i >= 0; i--) {
    if (LEVEL_DEFINITIONS[i].level <= level) return LEVEL_DEFINITIONS[i].xpRequired;
  }
  return 0;
}

function getXPForNextLevel(level: number): number {
  const { LEVEL_DEFINITIONS } = require("@/lib/types");
  for (let i = 0; i < LEVEL_DEFINITIONS.length; i++) {
    if (LEVEL_DEFINITIONS[i].level > level) return LEVEL_DEFINITIONS[i].xpRequired;
  }
  return LEVEL_DEFINITIONS[LEVEL_DEFINITIONS.length - 1].xpRequired;
}
