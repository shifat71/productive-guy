"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useGamificationStore } from "@/lib/stores";
import { getGamificationProfile, getUserStreaks } from "@/lib/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Flame, Zap, Trophy, Target, Clock, TrendingUp, User } from "lucide-react";
import { LEVEL_DEFINITIONS, CANVAS_THEMES, type Streak, type GamificationProfile } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const { profile, setProfile } = useGamificationStore();
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getGamificationProfile(user.uid),
      getUserStreaks(user.uid),
    ]).then(([gp, s]) => {
      if (gp) setProfile(gp);
      setStreaks(s);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const currentLevelDef = LEVEL_DEFINITIONS.find((l) => l.level === (profile?.currentLevel || 1)) || LEVEL_DEFINITIONS[0];
  const nextLevelDef = LEVEL_DEFINITIONS.find((l) => l.level > (profile?.currentLevel || 1));
  const xpIntoLevel = (profile?.totalXP || 0) - currentLevelDef.xpRequired;
  const xpForLevel = nextLevelDef ? nextLevelDef.xpRequired - currentLevelDef.xpRequired : 1;
  const levelProgress = Math.min(100, (xpIntoLevel / xpForLevel) * 100);

  const dailyStreak = streaks.find((s) => s.type === "daily");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-3xl font-bold text-primary">
                {userProfile?.displayName?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{userProfile?.displayName || "User"}</h1>
                  <Badge className="text-sm">Lv {profile?.currentLevel || 1}</Badge>
                </div>
                <p className="text-muted-foreground">{profile?.title || "Beginner"}</p>
                <div className="mt-3 flex items-center gap-3">
                  <Progress value={levelProgress} className="flex-1 max-w-xs" color="var(--xp-gold)" />
                  <span className="text-sm text-muted-foreground">
                    {profile?.totalXP?.toLocaleString() || 0} XP
                    {nextLevelDef && ` / ${nextLevelDef.xpRequired.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: Flame, label: "Daily Streak", value: dailyStreak?.currentCount || 0, color: "text-warning" },
          { icon: Target, label: "Perfect Days", value: profile?.stats.perfectDays || 0, color: "text-success" },
          { icon: Clock, label: "Focus Time", value: formatDuration(profile?.stats.totalFocusMinutes || 0), color: "text-primary" },
          { icon: Trophy, label: "Badges", value: profile?.badges.length || 0, color: "text-xp-gold" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-4 text-center">
                <stat.icon className={`h-6 w-6 mx-auto mb-1.5 ${stat.color}`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pomodoro Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pomodoro Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">{profile?.stats.totalPomodorosCompleted || 0}</p>
              <p className="text-xs text-muted-foreground">Total Completed</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{profile?.stats.longestPomodoroStreak || 0}</p>
              <p className="text-xs text-muted-foreground">Longest Streak</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{profile?.stats.canvasCollectibles || 0}</p>
              <p className="text-xs text-muted-foreground">Collectibles</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Level Roadmap</CardTitle>
          <CardDescription>Your journey from Beginner to Transcendent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {LEVEL_DEFINITIONS.map((def) => {
              const isUnlocked = (profile?.currentLevel || 1) >= def.level;
              const isCurrent = profile?.currentLevel === def.level;
              return (
                <div
                  key={def.level}
                  className={`flex items-center gap-3 rounded-lg p-2.5 ${
                    isCurrent ? "bg-primary/10 border border-primary/30" :
                    isUnlocked ? "bg-success/5" : "opacity-50"
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    isUnlocked ? "bg-success text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {def.level}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{def.title}</p>
                    <p className="text-xs text-muted-foreground">{def.xpRequired.toLocaleString()} XP</p>
                  </div>
                  {def.unlock && (
                    <Badge variant={isUnlocked ? "success" : "outline"} className="text-[10px]">
                      {isUnlocked ? "✓ " : "🔒 "}{def.unlock}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
