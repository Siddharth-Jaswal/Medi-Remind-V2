"use client";

import { Pill, LogOut, User } from "lucide-react";
import DragDropZone from "@/components/upload/DragDropZone";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Pill className="w-10 h-10 text-primary" />
          <p className="text-muted-foreground font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 font-bold text-lg sm:text-xl tracking-tight">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Pill className="text-primary w-5 h-5" />
            </div>
            <span className="hidden xs:inline">MediRemind</span>
          </Link>
          <div className="flex items-center gap-2.5 sm:gap-6">
            <Link href="/dashboard" className="text-xs sm:text-sm font-semibold text-primary px-2 py-1 bg-primary/10 rounded-lg">Upload</Link>
            <Link href="/dashboard/history" className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1">Dashboard</Link>
            
            <div className="h-4 sm:h-6 w-px bg-border mx-0.5 sm:mx-1"></div>
            
            <div className="flex items-center gap-1 sm:gap-3">
              <ThemeToggle />
              <div className="hidden sm:flex items-center gap-2 text-sm text-foreground font-medium bg-secondary px-3 py-1.5 rounded-full border border-border">
                <User className="w-4 h-4 text-muted-foreground" />
                {user?.name?.split(' ')[0]}
              </div>
              <button 
                onClick={logout}
                className="p-1.5 sm:p-2 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-6 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-10 text-center px-2">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4 tracking-tight">Upload Prescription</h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">Upload or take a photo of your medical prescription. Our AI will automatically extract medicines and setup intelligent reminders.</p>
          </div>

          <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-3 sm:p-8 shadow-sm">
            <DragDropZone />
          </div>
        </div>
      </main>
    </div>
  );
}
