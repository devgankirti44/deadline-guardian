import { google } from "googleapis";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Helper: Get authenticated calendar client for a user
async function getCalendarClient(userId) {
  const tokenDoc = await getDoc(doc(db, "googleCalendarTokens", userId));
  
  if (!tokenDoc.exists()) {
    throw new Error("User not connected to Google Calendar");
  }

  const tokens = tokenDoc.data();
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:3000/api/auth/google/callback"
  );

  oauth2Client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expiry_date: tokens.expiryDate,
  });

  // Auto-refresh tokens if expired
  oauth2Client.on("tokens", async (newTokens) => {
    if (newTokens.refresh_token) {
      await setDoc(
        doc(db, "googleCalendarTokens", userId),
        { refreshToken: newTokens.refresh_token },
        { merge: true }
      );
    }
    if (newTokens.access_token) {
      await setDoc(
        doc(db, "googleCalendarTokens", userId),
        {
          accessToken: newTokens.access_token,
          expiryDate: newTokens.expiry_date,
        },
        { merge: true }
      );
    }
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

// ─── GET: Fetch user's calendar events ───
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const daysAhead = parseInt(searchParams.get("days") || "7");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const calendar = await getCalendarClient(userId);
    
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin,
      timeMax,
      maxResults: 50,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items.map((event) => ({
      id: event.id,
      title: event.summary || "Untitled Event",
      description: event.description || "",
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      location: event.location || "",
      attendees: event.attendees?.map((a) => a.email) || [],
      meetingLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || null,
      htmlLink: event.htmlLink,
      isAllDay: !event.start.dateTime,
    }));

    return NextResponse.json({ events, count: events.length });
  } catch (err) {
    console.error("❌ Fetch events error:", err);
    return NextResponse.json(
      { error: err.message, events: [] },
      { status: 500 }
    );
  }
}

// ─── POST: Create new calendar event from task ───
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, task } = body;

    if (!userId || !task) {
      return NextResponse.json({ error: "Missing userId or task" }, { status: 400 });
    }

    const calendar = await getCalendarClient(userId);

    // Calculate event time (use deadline or default 1 hour from now)
    const startTime = task.deadline ? new Date(task.deadline) : new Date(Date.now() + 60 * 60 * 1000);
    const estimatedHours = task.estimatedHours || 1;
    const endTime = new Date(startTime.getTime() + estimatedHours * 60 * 60 * 1000);

    // Subtract estimated hours from deadline to get start time
    if (task.deadline) {
      startTime.setHours(startTime.getHours() - estimatedHours);
    }

    const event = {
      summary: `🎯 ${task.title}`,
      description: `${task.description || ""}\n\n📌 Created by Deadline Guardian AI\n⚡ Priority: ${task.priority || "medium"}\n⏱ Estimated: ${estimatedHours}h`,
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
          { method: "popup", minutes: 10 },
        ],
      },
      colorId: task.riskLevel === "critical" ? "11" : task.riskLevel === "high" ? "5" : "9",
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    return NextResponse.json({
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
    });
  } catch (err) {
    console.error("❌ Create event error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── DELETE: Disconnect Google Calendar ───
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    await setDoc(
      doc(db, "googleCalendarTokens", userId),
      { disconnected: true, disconnectedAt: new Date() },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}