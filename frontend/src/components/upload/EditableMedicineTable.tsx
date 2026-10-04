"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Medicine {
  name: string;
  dosage: string;
  food_relation: string;
  duration_days: number;
}

export default function EditableMedicineTable({ 
  prescriptionId, 
  initialMedicines,
  onComplete 
}: { 
  prescriptionId: string;
  initialMedicines: any[];
  onComplete: () => void;
}) {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines.map(m => ({
    name: m.name || "",
    dosage: m.dosage || "",
    food_relation: m.food_relation || "After Food",
    duration_days: m.duration_days || 7
  })));
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = (idx: number, field: keyof Medicine, value: any) => {
    const newMeds = [...medicines];
    newMeds[idx] = { ...newMeds[idx], [field]: value };
    setMedicines(newMeds);
  };

  const handleRemove = (idx: number) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleAdd = () => {
    setMedicines([...medicines, { name: "", dosage: "", food_relation: "After Food", duration_days: 7 }]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("mediremind_token");
      await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001").replace(/\/$/, "")}/api/prescription/${prescriptionId}/medicines`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ medicines }),
      });
      onComplete();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-border pb-4 gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-primary" />
            Review Medicines
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Please verify the extracted details before saving.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-xl hover:bg-secondary/80 font-medium text-sm transition-colors border border-border self-start sm:self-auto w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Add Row
        </button>
      </div>

      {/* Mobile Card View (< md) */}
      <div className="block md:hidden space-y-4 mb-6">
        <AnimatePresence>
          {medicines.map((med, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-3 relative"
            >
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-xs font-bold text-primary tracking-wide uppercase">Medicine #{idx + 1}</span>
                <button 
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Remove medicine"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">Medicine Name</label>
                <input 
                  value={med.name} 
                  onChange={e => handleUpdate(idx, 'name', e.target.value)}
                  className="bg-background border border-border focus:border-primary px-3 py-2 rounded-xl w-full text-sm font-semibold text-foreground focus:outline-none transition-colors"
                  placeholder="e.g. Paracetamol"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">Dosage</label>
                  <input 
                    value={med.dosage} 
                    onChange={e => handleUpdate(idx, 'dosage', e.target.value)}
                    className="bg-background border border-border focus:border-primary px-3 py-2 rounded-xl w-full text-sm text-foreground focus:outline-none transition-colors"
                    placeholder="e.g. 500mg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">Timing</label>
                  <select 
                    value={med.food_relation}
                    onChange={e => handleUpdate(idx, 'food_relation', e.target.value)}
                    className="bg-background border border-border focus:border-primary px-3 py-2 rounded-xl w-full text-sm text-foreground focus:outline-none transition-colors"
                  >
                    <option value="Before Food">Before Food</option>
                    <option value="After Food">After Food</option>
                    <option value="With Food">With Food</option>
                  </select>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-sm">
              <th className="pb-3 font-medium px-2">Medicine Name</th>
              <th className="pb-3 font-medium px-2">Dosage</th>
              <th className="pb-3 font-medium px-2">Timing</th>
              <th className="pb-3 font-medium px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <AnimatePresence>
              {medicines.map((med, idx) => (
                <motion.tr 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="group hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-3 px-2">
                    <input 
                      value={med.name} 
                      onChange={e => handleUpdate(idx, 'name', e.target.value)}
                      className="bg-transparent border border-transparent hover:border-border focus:border-primary px-3 py-2 rounded-lg w-full text-sm font-semibold text-foreground focus:outline-none transition-colors"
                      placeholder="e.g. Paracetamol"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input 
                      value={med.dosage} 
                      onChange={e => handleUpdate(idx, 'dosage', e.target.value)}
                      className="bg-transparent border border-transparent hover:border-border focus:border-primary px-3 py-2 rounded-lg w-full text-sm text-foreground focus:outline-none transition-colors"
                      placeholder="e.g. 500mg"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <select 
                      value={med.food_relation}
                      onChange={e => handleUpdate(idx, 'food_relation', e.target.value)}
                      className="bg-transparent border border-transparent hover:border-border focus:border-primary px-3 py-2 rounded-lg w-full text-sm text-foreground focus:outline-none transition-colors appearance-none"
                    >
                      <option className="bg-background text-foreground" value="Before Food">Before Food</option>
                      <option className="bg-background text-foreground" value="After Food">After Food</option>
                      <option className="bg-background text-foreground" value="With Food">With Food</option>
                    </select>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button 
                      onClick={() => handleRemove(idx)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 text-base sm:text-lg shadow-md"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving details...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Save & Continue to Reminders
          </>
        )}
      </button>
    </div>
  );
}
