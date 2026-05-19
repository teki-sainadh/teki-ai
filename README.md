<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🤖 Teki AI

**A blazing-fast, minimalist AI chat app — built with React, powered by Groq & Gemini.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-tekicodes.tech-blue?style=for-the-badge&logo=firebase)](https://tekicodes.tech)
[![TypeScript](https://img.shields.io/badge/TypeScript-91%25-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Hosted-Firebase-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

</div>

---

## ✨ Features

- 🚀 **Ultra-fast responses** via [Groq's LPU architecture](https://groq.com) — LLaMA 3.3-70b model (79% faster than traditional GPU inference)
- 🖼️ **Image analysis** powered by Google Gemini 1.5 Flash
- 💬 **Persistent chat history** stored in Supabase/PostgreSQL
- 🔍 **Chat search** — find any past conversation instantly
- 🎭 **Personality modes** — Reasoning, Coding, Love Mode, Roast Mode
- 🌙 **Dark / Light mode** with pure `#ffffff` / `#000000` text contrast
- 🔐 **Google OAuth** via Firebase Authentication
- ⚡ **Streaming responses** with smooth animations
- 📱 **PWA-ready** with service worker support

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| Auth | Firebase Authentication (Google OAuth) |
| Hosting | Firebase Hosting |
| Database | Supabase (PostgreSQL) |
| AI — Text | Groq API (LLaMA 3.3-70b-versatile) |
| AI — Vision | Google Gemini 1.5 Flash |
| Image Upload | ImgBB API |

---

## 🚀 Run Locally

**Prerequisites:** Node.js 18+

### 1. Clone the repo

```bash
git clone https://github.com/teki-sainadh/teki-ai.git
cd teki-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

```env
VITE_GROQ_API_KEY=your_groq_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_IMGBB_API_KEY=your_imgbb_api_key
```

> Get your keys from: [Groq Console](https://console.groq.com) · [Google AI Studio](https://aistudio.google.com) · [ImgBB](https://api.imgbb.com)

### 4. Run the dev server

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

---

## 📁 Project Structure

```
teki-ai/
├── src/
│   ├── App.tsx                  # Root component
│   ├── Onboarding.tsx           # Auth / onboarding flow
│   ├── firebase.ts              # Firebase config
│   ├── constants.ts             # API endpoints, model names
│   ├── types.ts                 # TypeScript interfaces
│   └── components/
│       ├── MessageItem.tsx      # Chat message renderer
│       ├── CodeBlock.tsx        # Syntax-highlighted code
│       ├── LoadingAnimation.tsx # Streaming animation
│       └── SettingsPage.tsx     # User settings
├── public/
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # Service worker
├── firebase.json                # Firebase Hosting config
├── firestore.rules              # Firestore security rules
└── vite.config.ts               # Vite build config
```

---

## 🔒 Security

- Firestore rules restrict all reads/writes to authenticated owners only
- No admin role escalation possible (shadow field injection blocked)
- Timestamp spoofing prevented via `request.time` validation
- All API keys are client-side env vars — **never commit your `.env` file**

See [`security_spec.md`](./security_spec.md) for the full threat model.

---

## 🌐 Live App

> **[tekicodes.tech](https://tekicodes.tech)** — hosted on Firebase, custom domain via name.com

---

## 👤 Author

**Sainadh** — B.Tech IT, Hyderabad  
Building fast, shipping faster.

[![GitHub](https://img.shields.io/badge/GitHub-teki--sainadh-181717?style=flat&logo=github)](https://github.com/teki-sainadh)

---

<div align="center">
  <sub>Built with ☕ and way too many API keys.</sub>
</div>
