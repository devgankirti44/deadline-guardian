import { google } from "googleapis";
import { NextResponse } from "next/server";

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/api/auth/google/callback"
);

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
];

export async function GET(request) {
  // Get userId from query params to pass through OAuth
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  // Generate OAuth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // Get refresh token
    scope: SCOPES,
    prompt: "consent", // Always ask (so we always get refresh_token)
    state: userId, // Pass userId through OAuth flow
  });

  // Redirect user to Google's consent page
  return NextResponse.redirect(authUrl);
}