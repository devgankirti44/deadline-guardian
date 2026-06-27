import { google } from "googleapis";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/api/auth/google/callback"
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("state");
  const error = searchParams.get("error");

  // User denied permission
  if (error) {
    return NextResponse.redirect(
      `http://localhost:3000/calendar?calendar=denied`
    );
  }

  if (!code || !userId) {
    return NextResponse.redirect(
      `http://localhost:3000/calendar?calendar=error`
    );
  }

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // Save tokens to Firestore
    await setDoc(
      doc(db, "googleCalendarTokens", userId),
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
        scope: tokens.scope,
        tokenType: tokens.token_type,
        connectedAt: serverTimestamp(),
        disconnected: false, // Reset disconnected flag
      },
      { merge: true }
    );

    console.log("✅ Google Calendar connected for user:", userId);

    // Redirect to CALENDAR page (not mission-control!)
    return NextResponse.redirect(
      `http://localhost:3000/calendar?calendar=connected`
    );
  } catch (err) {
    console.error("❌ OAuth callback error:", err);
    return NextResponse.redirect(
      `http://localhost:3000/calendar?calendar=error&msg=${encodeURIComponent(err.message)}`
    );
  }
}