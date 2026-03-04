"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getUserCanvasCollectibles } from "@/lib/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { type CanvasCollectible } from "@/lib/types";

export default function GalleryPage() {
  const { user } = useAuth();
  const [collectibles, setCollectibles] = useState<CanvasCollectible[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserCanvasCollectibles(user.uid).then((c) => {
      setCollectibles(c);
    }).catch((err) => {
      console.error("Gallery load error:", err);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Canvas Gallery</h1>
        <p className="text-muted-foreground">Your completed block canvases.</p>
      </div>

      {collectibles.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-64 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold mb-1">No collectibles yet</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Complete a time block with a themed canvas to save your first collectible.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collectibles.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="text-4xl opacity-50">🎨</span>
                </div>
                <CardContent className="p-4">
                  <p className="font-medium text-sm">{item.timeBlockName}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px]">{item.theme}</Badge>
                    <Badge variant="success" className="text-[10px]">
                      {item.completedPomodoros}/{item.totalPomodoros} 🍅
                    </Badge>
                    <span className="text-[10px] text-xp-gold ml-auto">+{item.xpEarned} XP</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
