# 📁 Server-Side API Routes (Reference / Earlier Version)

This folder contains the **server-side implementation** of:
- Google OAuth flow (`auth/google/`)
- Google Calendar API integration (`calendar/events/`)
- AI agent endpoints (`agents/`)

## Why It's Here

These routes were the **original implementation** when the app was 
planned for **Firebase App Hosting** (server-side, requires billing).

For the **production deployment**, we migrated to:
- **Client-side Google Identity Services** for OAuth
- **Direct Gemini API calls** for AI agents
- **Direct browser-to-Google Calendar API** for events

This allowed deployment on **Firebase Static Hosting** (free tier) 
while maintaining all features.

## When to Reactivate

If migrating back to server-side deployment (Firebase App Hosting / Cloud Run):
1. Move this folder back to `app/api/`
2. Remove the `_server_routes_reference/` prefix
3. Update OAuth callback URLs to production domain
4. Use `process.env.GOOGLE_CLIENT_SECRET` (server-side env)

## Files

- `agents/breakdown/route.js` - Server-side task breakdown agent
- `agents/crisis/route.js` - Server-side crisis detection agent
- `agents/orchestrator/route.js` - Server-side orchestrator agent
- `agents/risk/route.js` - Server-side risk prediction agent
- `agents/schedule/route.js` - Server-side schedule agent
- `auth/google/route.js` - OAuth initiation endpoint
- `auth/google/callback/route.js` - OAuth callback handler
- `calendar/events/route.js` - Calendar events CRUD operations

## Status

✅ Code is functional but **not connected** to the live app.
🔄 Can be reactivated by moving back to `app/api/` folder.
📚 Preserved as reference for future enhancements.