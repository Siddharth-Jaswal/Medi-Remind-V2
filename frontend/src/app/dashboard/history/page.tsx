"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Pill, Clock, Calendar, CheckCircle, FileText, Loader2, ArrowLeft, Trash2, Plus, AlertCircle, Settings } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

export default function HistoryPage() {
  const { token, user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"reminders" | "prescriptions" | "settings">("reminders");
  
  // State for Add Reminder inline form
  const [addingForMed, setAddingForMed] = useState<string | null>(null);
  const [newTime, setNewTime] = useState("");

  // Deletion modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001").replace(/\/$/, "")}/api/prescription/history`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Failed to load history");
      
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const toggleReminder = async (reminderId: string) => {
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001").replace(/\/$/, "")}/api/reminders/${reminderId}/toggle`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteReminder = async (reminderId: string) => {
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001").replace(/\/$/, "")}/api/reminders/${reminderId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReminder = async (medicineId: string) => {
    if (!newTime) return;
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001").replace(/\/$/, "")}/api/reminders/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ medicine_id: medicineId, reminder_time: newTime })
      });
      if (res.ok) {
        setAddingForMed(null);
        setNewTime("");
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeletePrescription = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001").replace(/\/$/, "")}/api/prescription/${deletingId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Prescription deleted successfully");
        setDeletingId(null);
        fetchHistory();
      } else {
        toast.error("Failed to delete prescription");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const allReminders = history.flatMap(p => 
    p.medicines.flatMap((m: any) => 
      m.reminders.map((r: any) => ({
        ...r,
        medicineName: m.name,
        dosage: m.dosage,
        food: m.food_relation
      }))
    )
  ).sort((a, b) => a.time.localeCompare(b.time));

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
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Upload</Link>
            <Link href="/dashboard/history" className="text-sm font-medium text-primary">Dashboard</Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 bg-secondary hover:bg-secondary/80 rounded-full transition-colors border border-border">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome back, {user?.name}. Here are your prescriptions and reminders.</p>
              </div>
            </div>
          </div>

          {/* Pill Tabs */}
          <div className="flex items-center p-1 bg-secondary rounded-2xl w-full md:w-fit mb-8 border border-border">
            <button
              onClick={() => setActiveTab("reminders")}
              className={`relative flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                activeTab === "reminders" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeTab === "reminders" && (
                <motion.div layoutId="pillTab" className="absolute inset-0 bg-primary rounded-xl shadow-md" />
              )}
              <Clock className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Reminders</span>
            </button>
            <button
              onClick={() => setActiveTab("prescriptions")}
              className={`relative flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                activeTab === "prescriptions" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeTab === "prescriptions" && (
                <motion.div layoutId="pillTab" className="absolute inset-0 bg-primary rounded-xl shadow-md" />
              )}
              <FileText className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Prescriptions</span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`relative flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                activeTab === "settings" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeTab === "settings" && (
                <motion.div layoutId="pillTab" className="absolute inset-0 bg-primary rounded-xl shadow-md" />
              )}
              <Settings className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Settings</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === "reminders" ? (
                <motion.div 
                  key="reminders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {allReminders.length === 0 ? (
                    <div className="bg-card border border-border rounded-3xl p-16 text-center shadow-sm">
                      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-xl font-semibold mb-2">No active reminders</p>
                      <p className="text-muted-foreground mb-8 max-w-sm mx-auto">You don't have any reminders scheduled yet. Add one from your past prescriptions.</p>
                      <button onClick={() => setActiveTab("prescriptions")} className="px-6 py-3 bg-secondary text-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors border border-border shadow-sm">
                        View Prescriptions
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allReminders.map((r, idx) => (
                        <motion.div 
                          key={r.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`flex items-center justify-between p-5 rounded-2xl border shadow-sm transition-all ${
                            r.active ? "bg-card border-border hover:shadow-md" : "bg-secondary/50 border-transparent opacity-60 grayscale-[0.5]"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`font-bold text-xl px-4 py-3 rounded-xl ${
                              r.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            }`}>
                              {r.time}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground leading-tight">{r.medicineName}</p>
                              <p className="text-sm text-muted-foreground mt-1">{r.dosage} • {r.food}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => toggleReminder(r.id)}
                              className={`w-12 h-7 rounded-full flex items-center p-1 transition-colors ${
                                r.active ? "bg-primary" : "bg-muted-foreground/30"
                              }`}
                            >
                              <div className={`w-5 h-5 bg-white dark:bg-zinc-100 rounded-full shadow-md transform transition-transform ${
                                r.active ? "translate-x-5" : "translate-x-0"
                              }`} />
                            </button>
                            <button 
                              onClick={() => deleteReminder(r.id)}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors ml-2"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : activeTab === "prescriptions" ? (
                <motion.div 
                  key="prescriptions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {history.length === 0 ? (
                    <div className="bg-card border border-border rounded-3xl p-16 text-center shadow-sm">
                      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-xl font-semibold mb-2">No prescriptions yet</p>
                      <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Upload a prescription to start tracking your medicines and get automated reminders.</p>
                      <Link href="/dashboard" className="inline-block px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-md">
                        Upload Prescription
                      </Link>
                    </div>
                  ) : (
                    history.map((prescription, pIdx) => (
                      <motion.div 
                        key={prescription._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: pIdx * 0.1 }}
                        className="bg-card border border-border rounded-3xl p-6 md:p-8 overflow-hidden shadow-sm"
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4 border-b border-border pb-6">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-bold text-primary uppercase tracking-wider">Prescription Record</p>
                              <div className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Processed
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Added on {new Date(prescription.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                          <button 
                            onClick={() => setDeletingId(prescription._id)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors border border-transparent hover:border-destructive/20 shadow-sm hover:shadow"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="text-muted-foreground border-b border-border">
                                <th className="pb-3 font-medium min-w-[150px]">Medicine</th>
                                <th className="pb-3 font-medium">Dosage</th>
                                <th className="pb-3 font-medium">Timing</th>
                                <th className="pb-3 font-medium">Reminders</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {prescription.medicines.map((m: any) => (
                                <tr key={m._id} className="hover:bg-secondary/30 transition-colors">
                                  <td className="py-4 font-semibold text-foreground">{m.name}</td>
                                  <td className="py-4 text-muted-foreground">{m.dosage}</td>
                                  <td className="py-4 text-muted-foreground">{m.food_relation}</td>
                                  <td className="py-4">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {m.reminders.map((r: any) => (
                                        <span key={r.id} className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                                          r.active ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary text-muted-foreground border-transparent"
                                        }`}>
                                          {r.time}
                                        </span>
                                      ))}
                                      
                                      {/* Add Reminder Inline */}
                                      {addingForMed === m._id ? (
                                        <div className="flex items-center gap-1 bg-secondary border border-border p-1 rounded-lg">
                                          <input 
                                            type="time" 
                                            value={newTime}
                                            onChange={(e) => setNewTime(e.target.value)}
                                            className="bg-transparent text-foreground text-xs outline-none border-none px-2 font-medium"
                                            autoFocus
                                          />
                                          <button 
                                            onClick={() => handleAddReminder(m._id)}
                                            className="p-1 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity shadow-sm"
                                          >
                                            <CheckCircle className="w-3.5 h-3.5" />
                                          </button>
                                          <button 
                                            onClick={() => setAddingForMed(null)}
                                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      ) : (
                                        <button 
                                          onClick={() => {
                                            setAddingForMed(m._id);
                                            setNewTime("08:00");
                                          }}
                                          className="p-1.5 border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 rounded-lg flex items-center transition-all"
                                          title="Add new reminder time"
                                        >
                                          <Plus className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm max-w-2xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" /> Profile Settings
                    </h2>
                    <div className="mb-6">
                      <p className="text-sm text-muted-foreground mb-1">Name</p>
                      <p className="font-semibold text-foreground">{user?.name}</p>
                    </div>
                    <div className="mb-6">
                      <p className="text-sm text-muted-foreground mb-1">Email</p>
                      <p className="font-semibold text-foreground">{user?.email}</p>
                    </div>
                    
                    <hr className="border-border my-6" />
                    
                    <h3 className="font-bold mb-4">Telegram Notifications</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Update your Telegram Chat ID to change where your medicine reminders are sent. 
                      A verification message will be sent to confirm the change.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end max-w-md">
                      <div className="w-full">
                        <label className="block text-sm font-medium text-foreground mb-1.5">Chat ID</label>
                        <input 
                          type="text" 
                          id="chatIdInput"
                          defaultValue={user?.telegram_chat_id || ""}
                          placeholder="e.g. 123456789"
                          className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                      <button 
                        onClick={async () => {
                          const input = document.getElementById("chatIdInput") as HTMLInputElement;
                          if (!input.value) return;
                          const btn = document.getElementById("saveChatIdBtn");
                          if (btn) btn.innerHTML = "Verifying...";
                          try {
                            const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001").replace(/\/$/, "")}/api/telegram/connect`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                              body: JSON.stringify({ chat_id: input.value })
                            });
                            if (res.ok) {
                              toast.success("Telegram Chat ID updated and verified!");
                            } else {
                              const err = await res.json();
                              toast.error(err.detail || "Verification failed");
                            }
                          } catch (err) {
                            toast.error("Failed to connect to server");
                          } finally {
                            if (btn) btn.innerHTML = "Update Chat ID";
                          }
                        }}
                        id="saveChatIdBtn"
                        className="w-full sm:w-auto py-3 px-6 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
                      >
                        Update Chat ID
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-lg"
            >
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-foreground">Delete Prescription?</h2>
              <p className="text-muted-foreground mb-8 text-sm">
                This action cannot be undone. All associated medicines and active reminders will be permanently removed.
              </p>
              
              <div className="flex items-center gap-3 w-full">
                <button 
                  onClick={() => setDeletingId(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeletePrescription}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 bg-destructive text-destructive-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
