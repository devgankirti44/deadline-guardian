"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Deadline Guardian // Mission Control</title>
        <meta name="description" content="AI-powered deadline prevention system. Never miss a critical deadline again." />
        
        {/* ═══════════════════════════════════════════════
            🎨 FAVICONS — Multiple sizes for all devices
            ═══════════════════════════════════════════════ */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        
        {/* PWA META TAGS */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F59E0B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Deadline Guardian" />
        
        {/* VIEWPORT for mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        
        {/* Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{ backgroundColor: "#0A0A0A", minHeight: "100vh" }}
        className={inter.className}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1A1A1A",
              color: "#E5E5E5",
              border: "1px solid #2A2A2A",
              borderRadius: "2px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
            },
            success: {
              iconTheme: {
                primary: "#10B981",
                secondary: "#0D0D0D",
              },
              style: {
                borderLeft: "3px solid #10B981",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF4444",
                secondary: "#0D0D0D",
              },
              style: {
                borderLeft: "3px solid #EF4444",
              },
            },
          }}
        />
      </body>
    </html>
  );
}