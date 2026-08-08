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
      const response = await fetch("http://localhost:8001/api/prescription/upload", {
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
            className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-colors cursor-pointer ${
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
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center shadow-sm">
                <UploadCloud className={`w-10 h-10 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-xl font-bold mb-2">Drag & Drop your prescription</p>
                <p className="text-muted-foreground text-sm font-medium">or click to browse from your device</p>
              </div>
              <p className="text-xs text-muted-foreground/70 mt-4 font-semibold uppercase tracking-wider">Supports JPG, PNG, JPEG</p>
            </div>
            
            {error && (
              <p className="text-destructive text-sm mt-4 font-medium bg-destructive/10 inline-block px-4 py-1.5 rounded-full">{error}</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center gap-6 mb-8">
              <div className="h-24 w-24 rounded-2xl bg-secondary overflow-hidden flex items-center justify-center shrink-0 border border-border shadow-inner">
                {file.type.startsWith("image/") ? (
                  <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <FileImage className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 truncate">
                <p className="text-lg font-bold truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {!isUploading && !result && (
                <button
                  onClick={() => setFile(null)}
                  className="p-3 hover:bg-secondary rounded-full transition-colors border border-transparent hover:border-border"
                >
                  <X className="w-6 h-6 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-medium text-sm">
                {error}
              </div>
            )}

            {!result && !isUploading && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Upload Password (Required)</label>
                <input
                  type="password"
                  placeholder="Enter the secret upload password..."
                  value={uploadPassword}
                  onChange={(e) => setUploadPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
            )}

            {!result ? (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-md"
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
