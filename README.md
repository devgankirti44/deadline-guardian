# 🛡️ Deadline Guardian

> **AI-powered productivity companion that proactively prevents missed deadlines through 9 autonomous Gemini-powered agents.**

🏆 **Built for The Last-Minute Life Saver Hackathon by Google**

---

## 🌟 Live Demo

🚀 **Live URL:** https://last-minute-saviour.web.app

✅ **Status:** Live on Google Cloud (Firebase Hosting)
---

## 🎯 Problem Statement

Students, professionals, and entrepreneurs frequently miss deadlines, assignments, meetings, bill payments, and important commitments. Existing productivity tools rely on **passive reminders** that are easy to ignore and do little to help users actually complete their tasks.

**Deadline Guardian moves beyond reminders** — it uses 9 autonomous AI agents to proactively analyze, predict, and act on the user's behalf, preventing failures BEFORE they happen.

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

- **🧠 Personality Calibration** — 10-question behavioral assessment generates personalized AI behavior profile
- **🎙️ Voice-Enabled Assistance** — Real-time speech synthesis with cinematic narration
- **💾 Smart Caching System** — 7-day intelligent cache with 4-model fallback chain
- **📅 Google Calendar Integration** — Bi-directional OAuth sync
- **🚨 Crisis Center** — Visual command interface for at-risk missions
- **🔔 Autonomous Reminder Engine** — Behavior-aware notifications

---

## 🛠️ Technologies Used

### Google Technologies (Primary Stack)
- **Google Gemini API** (Multiple model fallback)
- **Firebase Firestore** — Real-time database & cache layer
- **Firebase Authentication** — Google Sign-In
- **Firebase App Hosting** — Deployment on Google Cloud
- **Google Calendar API** — Calendar synchronization
- **Google AI Studio** — Development & testing

### Framework
- **Next.js 14** — React framework with App Router
- **React 18** — UI library
- **Tailwind CSS** — Styling

### Open Source Libraries (Credited)
- **@google/generative-ai** — Apache 2.0 License — Gemini SDK
- **Firebase** — Apache 2.0 License — Backend services
- **Lucide React** — ISC License — Icons
- **React Hot Toast** — MIT License — Notifications

---

## 🏗️ Architecture

User Interface (Next.js 14)
        ↓
9 AI Agents (Gemini API)
        ↓
Smart Cache Layer (Firestore)
        ↓
Model Fallback Chain (4 models)

---

## 📊 Agentic Depth

Every AI agent operates as an independent intelligence with:

- **Specialized System Prompts** — Each agent has a unique role and personality
- **Context Awareness** — Receives task state, user behavior, time-of-day, completion history
- **Inter-Agent Coordination** — Risk Agent's output feeds Crisis Agent → Recovery Agent
- **Smart Caching** — Task-specific cache keys prevent redundant API calls
- **4-Model Fallback Chain** — Automatically tries 4 models if quota exceeds
- **Stale Cache Recovery** — Returns cached data if all API attempts fail

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project with Firestore enabled
- Gemini API key from Google AI Studio

### Setup

Clone the repository, install dependencies with npm install, copy environment template to .env.local, add your API keys, then run npm run dev.

Open http://localhost:3000 in your browser.

---

## 🔐 Environment Variables

Create a .env.local file with the following variables (see .env.example for template):

- NEXT_PUBLIC_GEMINI_API_KEY
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID

---

## 🏆 Innovation Highlights

- **🎯 Proactive, not Reactive** — Predicts failures BEFORE deadlines pass
- **🧠 Personality-Driven** — AI behavior adapts to user psychology profile
- **🎙️ Voice-First UX** — Audio narration creates immersive "AI commander" experience
- **🤖 Multi-Agent Orchestration** — 9 specialized agents vs single-prompt approach
- **🛡️ Production Reliability** — Smart caching + model fallback prevents demo failures

---

## 👤 Author

**Kirti Devgan**

📧 devgankirti44@gmail.com

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

- **Google** for the Gemini API and hackathon opportunity
- **Firebase** team for the robust backend infrastructure
- **Open source community** for amazing libraries

---

**Built with ❤️ for The Last-Minute Life Saver Hackathon 2025**