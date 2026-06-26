"use client";
import { useState, useEffect } from "react";
import { onAuthChange } from "@/lib/firebase";
import Onboarding from "./Onboarding";

export default function OnboardingWrapper() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      if (u) {
        setUser(u);
        // Check if user has seen onboarding
        const onboarded = localStorage.getItem("onboarded");
        if (!onboarded) {
          setShowOnboarding(true);
        }
      }
    });
    return () => unsub();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!showOnboarding) return;

    const handleKey = (e) => {
      if (e.key === "Escape") {
        localStorage.setItem("onboarded", "true");
        setShowOnboarding(false);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showOnboarding]);

  if (!showOnboarding || !user) return null;

  return <Onboarding onComplete={() => setShowOnboarding(false)} />;
}