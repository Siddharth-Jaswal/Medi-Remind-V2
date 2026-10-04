"use client";

import { useState } from "react";
import { CheckCircle, Bell, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function TelegramConnect({ prescriptionId }: { prescriptionId: string }) {
  const [chatId, setChatId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleConnect = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("mediremind_token");
      await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001").replace(/\/$/, "")}/api/telegram/connect`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ chat_id: chatId }),
      });
      
      // Navigate directly to history dashboard
      router.push("/dashboard/history");
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-4 sm:py-8"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" />
      </div>
      
      <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">Medicines Saved!</h2>
      <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-10 max-w-sm mx-auto px-2">
        We've successfully extracted and saved your prescription. Time to set up Telegram alerts.
      </p>

      <div className="bg-secondary/60 border border-border p-5 sm:p-8 rounded-2xl sm:rounded-3xl text-left max-w-md mx-auto shadow-sm">
        <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 mb-3 sm:mb-4">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Connect Telegram
        </h3>
        
        <ol className="list-decimal list-inside text-xs sm:text-sm text-muted-foreground space-y-2.5 sm:space-y-3 mb-6 sm:mb-8 ml-0.5">
          <li>Open Telegram and search for <strong className="text-foreground">@userinfobot</strong></li>
          <li>Click <strong className="text-foreground">Start</strong> to get your Chat ID</li>
          <li>Copy and paste your ID below</li>
        </ol>

        <div className="flex flex-col gap-3 sm:gap-4">
          <input 
            type="text" 
            placeholder="e.g. 123456789"
            value={chatId}
            onChange={e => setChatId(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
          />
          
          <button 
            onClick={handleConnect}
            disabled={!chatId || isSaving}
            className="w-full py-3 sm:py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enable Reminders"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
