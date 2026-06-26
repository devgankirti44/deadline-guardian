"use client";
import { useState, useEffect, useCallback } from "react";

const WELCOMED_KEY = "guardian_welcomed";

export const useNotifications = () => {
  const [permission, setPermission] = useState("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      // Only send welcome ONCE (uses localStorage flag)
      if (result === "granted" && !localStorage.getItem(WELCOMED_KEY)) {
        localStorage.setItem(WELCOMED_KEY, "true");
        new Notification("🛡️ Deadline Guardian Active", {
          body: "I'm now watching your deadlines. I'll alert you when action is needed.",
          icon: "/favicon.ico", // Use favicon (you'll need to add one)
          tag: "welcome",
          silent: false,
        });
        return true;
      }
      return result === "granted";
    } catch (error) {
      console.error("Notification permission error:", error);
      return false;
    }
  }, [isSupported]);

  // Send notification
  const sendNotification = useCallback((title, options = {}) => {
    if (permission !== "granted") return null;
    if (typeof document !== "undefined" && document.hidden === false && !options.requireInteraction) {
      // Don't spam when tab is focused unless it's critical
      console.log("📵 Tab is focused, skipping non-critical notification:", title);
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        silent: false,
        ...options,
      });

      // Auto-close after 8 seconds (unless requireInteraction)
      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 8000);
      }

      // Click handler - focus window
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error("Notification send error:", error);
      return null;
    }
  }, [permission]);

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    isEnabled: permission === "granted",
  };
};