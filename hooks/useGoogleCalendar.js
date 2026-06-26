"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import toast from "react-hot-toast";

export const useGoogleCalendar = (userId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);

  // ─── Check if user is connected ───
  useEffect(() => {
    if (!userId) {
      setCheckingConnection(false);
      return;
    }

    const unsub = onSnapshot(
      doc(db, "googleCalendarTokens", userId),
      (docSnap) => {
        if (docSnap.exists() && !docSnap.data().disconnected) {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
        setCheckingConnection(false);
      },
      (error) => {
        console.error("Connection check error:", error);
        setCheckingConnection(false);
      }
    );

    return () => unsub();
  }, [userId]);

  // ─── Connect to Google Calendar ───
  const connect = useCallback(() => {
    if (!userId) {
      toast.error("Please sign in first");
      return;
    }
    // Redirect to OAuth flow
    window.location.href = `/api/auth/google?userId=${userId}`;
  }, [userId]);

  // ─── Disconnect ───
  const disconnect = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/calendar/events?userId=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Calendar disconnected");
        setIsConnected(false);
        setEvents([]);
      }
    } catch (err) {
      toast.error("Failed to disconnect");
    }
  }, [userId]);

  // ─── Fetch events ───
  const fetchEvents = useCallback(async (daysAhead = 7) => {
    if (!userId || !isConnected) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/calendar/events?userId=${userId}&days=${daysAhead}`);
      const data = await res.json();
      
      if (data.events) {
        setEvents(data.events);
        console.log(`✅ Loaded ${data.count} calendar events`);
      }
    } catch (err) {
      console.error("Fetch events error:", err);
      toast.error("Failed to load calendar");
    } finally {
      setLoading(false);
    }
  }, [userId, isConnected]);

  // ─── Auto-fetch events when connected ───
  useEffect(() => {
    if (isConnected) {
      fetchEvents(7);
    }
  }, [isConnected, fetchEvents]);

  // ─── Create event from task ───
  const createEventFromTask = useCallback(async (task) => {
    if (!userId || !isConnected) {
      toast.error("Connect Google Calendar first");
      return null;
    }

    try {
      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, task }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success("📅 Added to Google Calendar!");
        fetchEvents(); // Refresh
        return data;
      } else {
        toast.error(data.error || "Failed to create event");
        return null;
      }
    } catch (err) {
      toast.error("Failed to create event");
      return null;
    }
  }, [userId, isConnected, fetchEvents]);

  return {
    isConnected,
    checkingConnection,
    events,
    loading,
    connect,
    disconnect,
    fetchEvents,
    createEventFromTask,
  };
};