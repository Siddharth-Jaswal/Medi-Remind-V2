import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediRemind AI - Smart Prescription & Medicine Reminder",
  description: "Upload your prescription image to extract medicines automatically and receive automated dose alerts via Telegram.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

import { AuthProvider } from "@/context/AuthContext";

import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import ServerWarmup from "@/components/ServerWarmup";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
        <AuthProvider>
          <ThemeProvider>
            <ServerWarmup />
            {children}
            <Toaster position="top-right" richColors theme="system" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
