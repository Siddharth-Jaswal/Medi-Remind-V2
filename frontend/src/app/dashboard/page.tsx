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
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Pill className="text-primary w-5 h-5" />
            </div>
            <span>MediRemind</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-primary">Upload</Link>
            <Link href="/dashboard/history" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
            
            <div className="h-6 w-px bg-border mx-1"></div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden sm:flex items-center gap-2 text-sm text-foreground font-medium bg-secondary px-3 py-1.5 rounded-full border border-border">
                <User className="w-4 h-4 text-muted-foreground" />
                {user?.name?.split(' ')[0]}
              </div>
              <button 
                onClick={logout}
                className="p-2 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive transition-colors"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold mb-4 tracking-tight">Upload Prescription</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">Upload a clear image of your medical prescription. Our AI will automatically extract your medicines and setup intelligent reminders.</p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-2 sm:p-8 shadow-sm">
            <DragDropZone />
          </div>
        </div>
      </main>
    </div>
  );
}
