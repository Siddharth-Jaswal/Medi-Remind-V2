"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Activity, Sparkles } from "lucide-react";

export default function ServerWarmup() {
  const [isAwake, setIsAwake] = useState(false);
  const [show, setShow] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkHealth = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
        const res = await fetch(`${url}/health/`);
        if (res.ok) {
          setIsAwake(true);
          setTimeout(() => setShow(false), 1000); // Give it a sec to show success state before unmounting
          if (interval) clearInterval(interval);
        }
      } catch (err) {
        // Still waking up
      }
    };

    checkHealth();
    interval = setInterval(checkHealth, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-[92vw] max-w-sm"
        >
          <div className="bg-card/90 backdrop-blur-md border border-border shadow-xl rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center gap-3 sm:gap-4">
            {!isAwake ? (
              <>
                <div className="relative flex h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-primary"></span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-foreground truncate">Waking up AI Backend...</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">Render free tier cold start (~50s)</span>
                </div>
              </>
            ) : (
              <>
                <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-foreground">Backend Connected!</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
