"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGamificationStore } from "@/lib/stores";

export function XPToast() {
  const xpToast = useGamificationStore((s) => s.xpToast);

  return (
    <AnimatePresence>
      {xpToast && (
        <motion.div
          key={xpToast.id}
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -30, x: "-50%" }}
          className="fixed bottom-8 left-1/2 z-[100] rounded-full bg-xp-gold/20 border border-xp-gold/40 px-4 py-2 text-sm font-bold text-xp-gold shadow-lg backdrop-blur-sm pointer-events-none"
        >
          +{xpToast.amount} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}
