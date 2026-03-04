"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getGamificationProfile } from "@/lib/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { BADGE_DEFINITIONS, type GamificationProfile, type EarnedBadge } from "@/lib/types";

export default function TrophiesPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getGamificationProfile(user.uid).then((p) => {
      setProfile(p);
    }).catch((err) => {
      console.error("Trophies load error:", err);
    }).finally(() => {
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

  const earnedIds = new Set(profile?.badges.map((b) => b.badgeId) || []);

  if (!profile || profile.badges.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Trophy Case</h1>
          <p className="text-muted-foreground">Your badges and achievements.</p>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-64 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold mb-1">Your trophies will appear here</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Complete a Pomodoro to earn 🍅 First Blood!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trophy Case</h1>
        <p className="text-muted-foreground">{profile.badges.length} badges earned</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BADGE_DEFINITIONS.map((badge, i) => {
          const earned = earnedIds.has(badge.id);
          const earnedData = profile.badges.find((b) => b.badgeId === badge.id);

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className={earned ? "border-xp-gold/30" : "opacity-50"}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
                      earned ? "bg-xp-gold/10" : "bg-muted"
                    }`}>
                      {badge.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                      <p className="text-xs text-xp-gold mt-0.5">+{badge.xpBonus} XP</p>
                    </div>
                    {earned && (
                      <span className="text-success text-sm">✓</span>
                    )}
                  </div>
                  {earned && earnedData && (
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Earned {earnedData.earnedAt.toDate().toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
