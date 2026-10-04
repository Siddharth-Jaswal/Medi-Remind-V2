"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Pill, ArrowRight, ShieldCheck, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (token) {
      router.push("/dashboard");
    }
  }, [token, router]);

  if (!mounted || token) return null; // Avoid hydration mismatch or flashing

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Navbar */}
      <nav className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2 font-bold text-xl sm:text-2xl tracking-tight">
          <div className="p-1.5 sm:p-2 bg-primary/10 rounded-xl">
            <Pill className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span>MediRemind</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-6">
          <ThemeToggle />
          <Link href="/login" className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
            Log in
          </Link>
          <Link href="/register" className="text-xs sm:text-sm font-semibold bg-primary text-primary-foreground px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-md hover:opacity-90 transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto w-full"
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary font-medium text-xs sm:text-sm mb-6 sm:mb-8 max-w-full truncate">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="truncate">AI-Powered Prescription Extraction</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4 sm:mb-8 text-balance">
            Never miss a dose <br className="hidden md:block" />
            <span className="text-primary">
              ever again.
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12 text-balance leading-relaxed px-2">
            Simply snap or upload a photo of your doctor's prescription. Our advanced AI instantly extracts your medicines and sets up automated Telegram reminders.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4">
            <Link 
              href="/register" 
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg w-full sm:w-auto shadow-md hover:scale-105 transition-all"
            >
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        {/* Feature grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto mt-14 sm:mt-24 w-full"
        >
          {[
            { icon: ShieldCheck, title: "100% Secure", desc: "Your medical data is encrypted and securely stored." },
            { icon: CheckCircle, title: "Smart Extraction", desc: "Understands complex medical handwriting and abbreviations." },
            { icon: Clock, title: "Telegram Alerts", desc: "Get pinged exactly when it's time to take your meds." },
          ].map((feature, i) => (
            <div key={i} className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-card border border-border text-left shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-muted-foreground text-sm">
        <p>© 2026 MediRemind AI. Designed for health.</p>
      </footer>
    </div>
  );
}
