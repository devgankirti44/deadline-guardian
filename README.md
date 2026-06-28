# 🛡️ Deadline Guardian

> **AI-powered productivity command center that proactively prevents missed deadlines through 9 autonomous Gemini agents and a revolutionary Mission Intelligence Engine.**

🏆 **Built for The Last-Minute Life Saver Hackathon by Google**

---

## 🌟 Live Demo

🚀 **Live URL:** https://last-minute-saviour.web.app

✅ **Status:** Live on Google Cloud (Firebase Hosting)

### 💻 Recommended: Desktop Chrome

For the optimal cinematic Mission Control experience with full voice narration, AI agent dashboard, and 5-stage Mission Intelligence Engine, please open on:

- **Device:** Desktop or laptop (not mobile)
- **Browser:** Google Chrome (latest version)
- **Resolution:** 1280x720 or higher
- **Audio:** Enabled for AI Commander voice narration

> Mobile users will see a guidance banner directing them to desktop for the full experience.

---

## 🎯 Problem Statement

Students, professionals, and entrepreneurs frequently miss deadlines, assignments, meetings, bill payments, and important commitments. Existing productivity tools rely on **passive reminders** that are easy to ignore and do little to help users actually complete their tasks.

**Deadline Guardian moves beyond reminders** — it uses 9 autonomous AI agents and a Mission Intelligence Engine to proactively analyze, predict, and act on the user's behalf, preventing failures BEFORE they happen.

---

## 🧠 Mission Intelligence Engine (Flagship Feature)

> *"Can this task realistically be completed by this person within this time?"*

Deadline Guardian doesn't just manage tasks — it **understands** them. Before a mission is even created, the Mission Intelligence Engine runs a 5-stage analysis:

### The 5-Stage Intelligence Flow

| Stage | What Happens |
|-------|--------------|
| 1️⃣ **Task Type Detection** | AI auto-classifies the task (course, assignment, interview prep, coding project, exam prep, work task, personal) |
| 2️⃣ **Contextual Questioning** | AI generates 3-5 dynamic questions specific to the task type |
| 3️⃣ **Effort Estimation** | Calculates total hours with breakdown — learning, practice, revision, buffer — backed by reasoning |
| 4️⃣ **Feasibility Analysis** | Returns verdict (REALISTIC / CHALLENGING / RISKY / UNREALISTIC) with Success Probability and Reality Score |
| 5️⃣ **What-If Simulator** | Visualizes 5 deadline scenarios with success probability and stress level for each |

### Why This Matters

Traditional task managers ask *"When is it due?"* — Deadline Guardian asks *"Is this even possible for YOU?"*

- ✅ **Reality Score** — Compares required effort with user's historical behavior
- ✅ **Success Probability** — Quantifies realistic completion likelihood (0-100%)
- ✅ **Personalized Warnings** — *"You plan to work 4h/day, but your historical average is 1.8h"*
- ✅ **Recovery Recommendations** — Suggests scope reduction, deadline extension, or minimum viable plan
- ✅ **Deadline Compression Engine** — Slider shows instant impact of tighter deadlines

**This is not a task manager. It's a deadline intelligence system.**

---

## ✨ Key Features

### 🤖 9 Autonomous AI Agents (Powered by Google Gemini)

| Agent | Purpose |
|-------|---------|
| 🔍 **Risk Prediction** | Calculates deadline failure probability per task |
| 🚨 **Crisis Detection** | Identifies critical missions in real-time |
| 🆘 **Recovery Planning** | Generates 3-tier recovery strategies with concrete steps |
| 🎯 **Orchestrator** | Provides mission briefings with personalized operator advice |
| ⚡ **Focus Pulse** | Analyzes cognitive state, energy, and focus score |
| 📅 **Schedule** | Creates optimized execution timelines |
| 🔪 **Task Breakdown** | Decomposes complex missions into actionable subtasks |
| ⚠️ **Conflict Detection** | Spots workload overloads and scheduling conflicts |
| 📧 **Email Drafter** | Composes professional deadline emails (3 tones) |

### 🎨 Production Features

- **🧠 Mission Intelligence Engine** — 5-stage AI analysis pipeline before task creation
- **🧠 Personality Calibration** — 10-question Big Five behavioral assessment personalizes every AI agent
- **🎙️ Voice-Enabled AI Commander** — Two-way voice with cinematic narration and speech recognition
- **💾 Smart Caching System** — 7-day Firestore cache with 4-model fallback chain
- **📅 Google Calendar Integration** — Bi-directional OAuth sync
- **🚨 Crisis Center** — Visual command interface for at-risk missions with countdown timers
- **🔔 Autonomous Reminder Engine** — Behavior-aware notifications timed to productive hours
- **🎯 Focus Mode** — Distraction-free execution with Pomodoro and cognitive monitoring
- **🆘 Recovery System** — Auto-generates 3-tier emergency plans when missions go critical
- **📝 Natural Language Quick Add** — Type "Submit report friday 5pm urgent" → structured mission
- **🔗 Smart Tool Integrations** — Context-aware quick-links: GitHub, VS Code, Vercel, Google Meet, Zoom, Calendar, YouTube, Udemy, Coursera
- **🛡️ Stale Cache Recovery** — Returns cached data if all API attempts fail (zero-downtime guarantee)

---

## 🛠️ Technologies Used

### Google Technologies (Primary Stack)
- **Google Gemini API** — Multiple model fallback (gemini-2.0-flash-exp, 2.5-flash, 1.5-flash, 1.5-pro)
- **Google AI Studio** — Prompt engineering and agent testing
- **Google Antigravity** — AI-assisted development platform
- **Firebase Firestore** — Real-time database & cache layer
- **Firebase Authentication** — Google Sign-In OAuth 2.0
- **Firebase Hosting** — Production deployment on Google Cloud
- **Google Calendar API** — Bi-directional synchronization
- **Google Cloud Platform** — Underlying infrastructure

### Framework
- **Next.js 14** — React framework with App Router
- **React 18** — UI library
- **Tailwind CSS** — Styling

### Open Source Libraries (Credited)
- **@google/generative-ai** — Apache 2.0 License — Official Gemini SDK by Google
- **firebase** — Apache 2.0 License — Backend services by Google
- **lucide-react** — ISC License — Icons
- **react-hot-toast** — MIT License — Notifications
- **date-fns** — MIT License — Date utilities
- **clsx** — MIT License — Conditional className utility

---

## 🏗️ ArchitectureUser Interface (Next.js 14 + React 18)
↓
Mission Intelligence Engine (5-Stage Pipeline)
↓
9 Autonomous AI Agents (Gemini API)
↓
Smart Cache Layer (Firestore, 7-day TTL)
↓
4-Model Fallback Chain (Gemini Flash → Pro → Lite)
↓
Stale Cache Recovery (zero-downtime fallback)
↓
Google Cloud Infrastructure (Firebase Hosting)

text


---

## 📊 Agentic Depth

Every AI agent operates as an independent intelligence with:

- **Specialized System Prompts** — Each agent has a unique role and personality
- **Context Awareness** — Receives task state, user behavior, time-of-day, completion history
- **Inter-Agent Coordination** — Risk Agent → Crisis Agent → Recovery Agent → Orchestrator
- **Multi-Stage Pipelines** — Mission Intelligence chains 5 sequential Gemini calls per mission
- **Smart Caching** — Task-specific cache keys prevent redundant API calls
- **4-Model Fallback Chain** — Automatically tries 4 models if quota exceeds
- **Stale Cache Recovery** — Returns cached data if all API attempts fail
- **Personality Calibration** — Every agent reads user's Big Five profile for personalized responses

**14 distinct AI operations per user session** = true multi-agent orchestration, not single-prompt wrapping.

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project with Firestore enabled
- Gemini API key from Google AI Studio

### Setup

```bash
# Clone the repository
git clone https://github.com/devgankirti44/deadline-guardian.git
cd deadline-guardian

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local

# Run development server
npm run dev
Open http://localhost:3000 in your browser.

🔐 Environment Variables
Create a .env.local file with the following variables:

env

NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
🏆 Innovation Highlights
🧠 Mission Intelligence Engine — Industry-first 5-stage AI pipeline predicting feasibility before task creation
🎯 Proactive, not Reactive — Predicts failures BEFORE deadlines pass
📊 Reality Score — Compares plans to actual user behavior, not just calendar math
🎚️ What-If Simulator — Instant visualization of deadline impact on success probability
🧠 Personality-Driven AI — Behavior adapts to user psychology (Big Five model)
🎙️ Voice-First UX — Two-way AI Commander creates immersive experience
🤖 Multi-Agent Orchestration — 9 specialized agents + Mission Intelligence pipeline
🔗 Smart Tool Integrations — Context-aware launchers eliminate context-switching
🛡️ Production Reliability — Smart caching + 4-model fallback prevents demo failures
🎬 Demo Scenario
User opens https://last-minute-saviour.web.app and signs in with Google
Completes 10-question Personality Calibration
Types: "Complete Node.js course" → clicks 🧠 AI Analyze
AI detects task type → asks about videos, duration, exercises
Estimates 42 hours of total effort with breakdown
User sets deadline to 7 days
AI returns: RISKY verdict, 38% success probability, 6h/day required
AI warns: "This exceeds your historical capacity of 1.8h/day"
What-If Simulator shows: 14 days = 78% success (AI RECOMMENDED)
User accepts → Mission deployed with full intelligence metadata
Crisis Center monitors continuously, Recovery Agent intervenes if needed
👤 Author
Kirti Devgan

📧 devgankirti44@gmail.com

🔗 GitHub

📄 License
MIT License — Open source and free to use.

🙏 Acknowledgments
Google for Developers — For organizing The Last-Minute Life Saver Hackathon and providing the Gemini API
Coding Ninjas — For facilitating this incredible hackathon experience
Google — For Gemini API, Firebase, AI Studio, Antigravity, Google Cloud Platform
Firebase Team — For robust backend infrastructure on Google Cloud
Vercel — For the Next.js framework
Meta — For the React library
Open Source Community — For Lucide React, React Hot Toast, Tailwind CSS, date-fns, and all libraries used with proper attribution
Built with ❤️ for The Last-Minute Life Saver Hackathon 2025 by Google