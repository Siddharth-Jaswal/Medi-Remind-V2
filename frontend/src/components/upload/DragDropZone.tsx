"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileImage, Loader2, X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import EditableMedicineTable from "./EditableMedicineTable";
import TelegramConnect from "../telegram/TelegramConnect";

export default function DragDropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTelegram, setShowTelegram] = useState(false);
  const [uploadPassword, setUploadPassword] = useState("");
  
  const { user } = useAuth();
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
    } else {
      setError("Please drop a valid image file (JPG, PNG).");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("password", uploadPassword);

    try {
      const token = localStorage.getItem("mediremind_token");
      const response = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001").replace(/\/$/, "")}/api/prescription/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to extract prescription.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`relative border-2 border-dashed rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center transition-colors cursor-pointer ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/50 hover:bg-secondary/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-secondary flex items-center justify-center shadow-sm">
                <UploadCloud className={`w-8 h-8 sm:w-10 sm:h-10 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Snap a photo or drop prescription</p>
                <p className="text-muted-foreground text-xs sm:text-sm font-medium">Tap to browse files or use camera</p>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-2 sm:mt-4 font-semibold uppercase tracking-wider">Supports JPG, PNG, JPEG</p>
            </div>
            
            {error && (
              <p className="text-destructive text-xs sm:text-sm mt-3 sm:mt-4 font-medium bg-destructive/10 inline-block px-3 sm:px-4 py-1.5 rounded-full">{error}</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-xl sm:rounded-2xl bg-secondary overflow-hidden flex items-center justify-center shrink-0 border border-border shadow-inner">
                {file.type.startsWith("image/") ? (
                  <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <FileImage className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base sm:text-lg font-bold truncate">{file.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {!isUploading && !result && (
                <button
                  onClick={() => setFile(null)}
                  className="p-2 sm:p-3 hover:bg-secondary rounded-full transition-colors border border-transparent hover:border-border shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-medium text-xs sm:text-sm">
                {error}
              </div>
            )}

            {!result && !isUploading && (
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Upload Password (Required)</label>
                <input
                  type="password"
                  placeholder="Enter secret upload password..."
                  value={uploadPassword}
                  onChange={(e) => setUploadPassword(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
            )}

            {!result ? (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-lg shadow-md"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Extracting AI Magic...
                  </>
                ) : (
                  "Process Prescription"
                )}
              </button>
            ) : showTelegram ? (
              <TelegramConnect prescriptionId={result.prescription_id} />
            ) : (
              <EditableMedicineTable 
                prescriptionId={result.prescription_id} 
                initialMedicines={result.medicines || []} 
                onComplete={() => {
                  if (user?.telegram_chat_id) {
                    router.push("/dashboard/history");
                  } else {
                    setShowTelegram(true);
                  }
                }} 
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
