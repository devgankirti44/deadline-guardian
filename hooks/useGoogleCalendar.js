"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import toast from "react-hot-toast";

// Google Calendar API scopes
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly";

export const useGoogleCalendar = (userId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const tokenClientRef = useRef(null);
  const accessTokenRef = useRef(null);

  // ─── Load Google Identity Services script ───
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Check if script already loaded
    if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  // ─── Check stored connection in Firestore ───
  useEffect(() => {
    if (!userId) {
      setCheckingConnection(false);
      return;
    }

    const unsub = onSnapshot(
      doc(db, "googleCalendarTokens", userId),
      (docSnap) => {
        if (docSnap.exists() && !docSnap.data().disconnected) {
          const data = docSnap.data();
          // Check if token still valid (1 hour expiry)
          const tokenAge = Date.now() - (data.savedAt || 0);
          if (data.accessToken && tokenAge < 3500000) { // ~58 minutes
            accessTokenRef.current = data.accessToken;
            setIsConnected(true);
          } else {
            // Token expired, need to reconnect
            setIsConnected(false);
            accessTokenRef.current = null;
          }
        } else {
          setIsConnected(false);
          accessTokenRef.current = null;
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

  // ─── Initialize token client when needed ───
  const initTokenClient = useCallback(() => {
    if (typeof window === "undefined" || !window.google?.accounts?.oauth2) {
      console.error("Google Identity Services not loaded yet");
      return null;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      console.error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      toast.error("Calendar setup error: Missing Client ID");
      return null;
    }

    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: CALENDAR_SCOPE,
      callback: async (response) => {
        if (response.error) {
          toast.error("Calendar connection denied");
          console.error("OAuth error:", response);
          return;
        }

        accessTokenRef.current = response.access_token;

        // Save to Firestore
        if (userId) {
          try {
            await setDoc(doc(db, "googleCalendarTokens", userId), {
              userId,
              accessToken: response.access_token,
              savedAt: Date.now(),
              disconnected: false,
            });
            setIsConnected(true);
            toast.success("🎉 Google Calendar connected!");
            // Auto-fetch events
            setTimeout(() => fetchEventsInternal(7), 500);
          } catch (err) {
            console.error("Failed to save token:", err);
            toast.error("Failed to save connection");
          }
        }
      },
    });

    return tokenClientRef.current;
  }, [userId]);

  // ─── Connect to Google Calendar ───
  const connect = useCallback(() => {
    if (!userId) {
      toast.error("Please sign in first");
      return;
    }

    if (typeof window === "undefined" || !window.google?.accounts?.oauth2) {
      toast.error("Google services still loading... Please try again in a moment");
      return;
    }

    const client = initTokenClient();
    if (client) {
      client.requestAccessToken({ prompt: "consent" });
    }
  }, [userId, initTokenClient]);

  // ─── Disconnect ───
  const disconnect = useCallback(async () => {
    if (!userId) return;
    try {
      // Revoke token if we have one
      if (accessTokenRef.current && window.google?.accounts?.oauth2) {
        window.google.accounts.oauth2.revoke(accessTokenRef.current, () => {
          console.log("Token revoked");
        });
      }

      // Mark as disconnected in Firestore
      await setDoc(doc(db, "googleCalendarTokens", userId), {
        userId,
        disconnected: true,
        disconnectedAt: Date.now(),
      });

      accessTokenRef.current = null;
      setIsConnected(false);
      setEvents([]);
      toast.success("Calendar disconnected");
    } catch (err) {
      console.error("Disconnect error:", err);
      toast.error("Failed to disconnect");
    }
  }, [userId]);

  // ─── Internal fetch events (uses ref to avoid stale closures) ───
  const fetchEventsInternal = useCallback(async (daysAhead = 7) => {
    if (!accessTokenRef.current) {
      console.log("No access token, skipping fetch");
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + daysAhead);

      const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
      url.searchParams.append("timeMin", now.toISOString());
      url.searchParams.append("timeMax", futureDate.toISOString());
      url.searchParams.append("singleEvents", "true");
      url.searchParams.append("orderBy", "startTime");
      url.searchParams.append("maxResults", "50");

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessTokenRef.current}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Token expired
          toast.error("Calendar session expired. Please reconnect.");
          setIsConnected(false);
          accessTokenRef.current = null;
          return;
        }
        throw new Error(`Calendar API error: ${res.status}`);
      }

      const data = await res.json();

      const formattedEvents = (data.items || []).map((event) => ({
        id: event.id,
        title: event.summary || "Untitled Event",
        description: event.description || "",
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        isAllDay: !event.start?.dateTime,
        location: event.location || "",
        attendees: event.attendees || [],
        meetingLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || "",
        htmlLink: event.htmlLink || "",
        organizer: event.organizer?.email || "",
      }));

      setEvents(formattedEvents);
      console.log(`✅ Loaded ${formattedEvents.length} calendar events`);
    } catch (err) {
      console.error("Fetch events error:", err);
      toast.error("Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Public fetch events function ───
  const fetchEvents = useCallback(
    async (daysAhead = 7) => {
      if (!isConnected) {
        toast.error("Connect Google Calendar first");
        return;
      }
      return fetchEventsInternal(daysAhead);
    },
    [isConnected, fetchEventsInternal]
  );

  // ─── Auto-fetch events when connected ───
  useEffect(() => {
    if (isConnected && accessTokenRef.current) {
      fetchEventsInternal(7);
    }
  }, [isConnected, fetchEventsInternal]);

  // ─── Create event from task ───
  const createEventFromTask = useCallback(
    async (task) => {
      if (!accessTokenRef.current) {
        toast.error("Connect Google Calendar first");
        return null;
      }

      try {
        // Calculate event time (1 hour before deadline by default)
        const deadline = new Date(task.deadline);
        const startTime = new Date(deadline.getTime() - 60 * 60 * 1000); // 1 hour before
        const endTime = deadline;

        const event = {
          summary: `📌 ${task.title}`,
          description: task.description || `Task deadline from Deadline Guardian`,
          start: {
            dateTime: startTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: "popup", minutes: 60 },
              { method: "popup", minutes: 15 },
            ],
          },
        };

        const res = await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessTokenRef.current}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(event),
          }
        );

        if (!res.ok) {
          if (res.status === 401) {
            toast.error("Calendar session expired. Please reconnect.");
            setIsConnected(false);
            return null;
          }
          throw new Error(`Failed to create event: ${res.status}`);
        }

        const data = await res.json();
        toast.success("📅 Added to Google Calendar!");
        
        // Refresh events
        fetchEventsInternal(7);
        
        return { success: true, event: data };
      } catch (err) {
        console.error("Create event error:", err);
        toast.error("Failed to create event");
        return null;
      }
    },
    [fetchEventsInternal]
  );

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