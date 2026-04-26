# 🗳️ Journey of Elections — चुनाव का सफर

### Experience India's Democracy — One Vote at a Time

> An interactive election simulation game where you run for
> Lok Sabha and learn the entire Indian election process,
> guided by AI campaign manager **Star** at every step.

![React](https://img.shields.io/badge/React-18-blue)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)
![Gemini API](https://img.shields.io/badge/Gemini-AI_Powered-purple)
![Coverage](https://img.shields.io/badge/Coverage-90%25+-green)
![WCAG](https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📚 What You'll Learn

- **Scene 1** — Nomination filing with the Returning Officer
- **Scene 2** — EPIC card and voter registration process
- **Scene 3** — ECI's ₹70 lakh campaign expenditure limit
- **Scene 4** — Model Code of Conduct rules & rally management
- **Scene 5** — Phase-wise voting across India & silence period
- **Scene 6** — Live EVM counting and VVPAT verification
- **Scene 7** — Result certification and Form 20

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Framer Motion |
| Styling | Vanilla CSS (dark mode, WCAG 2.1 AA) |
| AI Guide | Google Gemini API (via Express proxy) |
| Database | Firebase Firestore |
| Auth | Firebase Anonymous Auth |
| Analytics | Google Analytics 4 |
| Charts | Google Charts |
| Fonts | Google Fonts (Playfair Display, DM Sans, Tiro Devanagari Hindi) |
| Icons | Google Material Icons |
| Testing | Vitest, React Testing Library, jest-axe |
| Server | Express.js (secure API proxy) |

---

## ⚡ Setup

```bash
git clone <repo-url>
cd Journey_of_Elections
npm install

cp .env.example .env
# Fill in your API keys in .env (see .env.example for all required keys)
```

### Terminal 1 — Start proxy server

```bash
npm run server
# Proxy starts at http://localhost:3001
```

### Terminal 2 — Start React app

```bash
npm run dev
# App starts at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗️ Architecture

```
User → React App (port 5173)
         │
         ├── Express Proxy (port 3001) → Gemini API
         ├── Firebase (Firestore + Anonymous Auth)
         ├── Google Analytics 4
         └── Google Charts (Scene 6 live vote counting)
```

---

## 🔐 Security

- **Gemini API key is server-side only** — never exposed to the browser
- Express proxy with **rate limiting** (20 requests/min per IP)
- **Input sanitization** on all user data (HTML stripping, 500-char cap)
- **Content Security Policy** headers via Helmet.js
- **No sensitive data** stored in localStorage or client-side
- Payload size limit: 2kb — rejects oversized requests
- Generic error responses — no stack traces exposed to clients

---

## ♿ Accessibility

- **WCAG 2.1 AA** compliant across all 7 scenes
- Full **keyboard navigation** (Tab, Enter, Space, Arrow keys)
- Screen reader tested with **ARIA live regions** on dynamic content
- Focus management — focus moves to `<h1>` on every scene transition
- Visible **saffron focus ring** (`outline: 3px solid #FF6B00`) on all interactive elements
- Respects **prefers-reduced-motion** — all animations disabled when set
- Skip-to-content link as first element in DOM
- Tested with **jest-axe** on all 7 scene components + ReportCard + CampaignManager

---

## 🧪 Testing

```bash
# Run all tests
npx vitest run

# Run with coverage report
npx vitest run --coverage
# Target: 90%+ line coverage (current: ~92.8%)

# Run a specific suite
npx vitest run src/tests/engine/GameEngine.test.js
```

### Coverage by module

| Module | Lines | Branches | Functions |
|---|---|---|---|
| Scenes (7) | 95% | 82% | 92% |
| Engine | 97% | 78% | 86% |
| UI Components | 92% | 78% | 92% |
| Hooks | 93% | 75% | 100% |
| Services | 92% | 83% | 88% |

---

## 🌐 Google Services Used

| Service | Usage |
|---|---|
| **Google Fonts** | Playfair Display (headings), DM Sans (body), Tiro Devanagari Hindi (Hindi text) |
| **Google Analytics 4** | Scene completion, decision tracking, game outcome events |
| **Firebase Firestore** | Game sessions, live leaderboard |
| **Firebase Auth** | Anonymous session management |
| **Google Charts** | Animated live vote counting bar chart (Scene 6) |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── scenes/          # Scene1–Scene7 game scenes
│   └── ui/              # CampaignManager, DecisionCard, ReportCard, ProgressBar
├── engine/              # GameEngine, VoteCalculator, ScandalEngine, ScoreTracker
├── hooks/               # useGameState, useAnalytics
├── services/            # geminiAPI, firebaseService, analyticsService
├── constants/           # candidateData, electionFacts
├── utils/               # sanitizer, cache
└── tests/               # All test suites mirror src/ structure

server/
└── proxy.js             # Express API proxy — keeps GEMINI_API_KEY server-side
```

---

## 🎮 How to Play

1. **Enter your name** and choose your constituency
2. **Pick a party** (BJP / INC / AAP / Independent)
3. **Navigate 7 scenes** — each representing a phase of the Indian election
4. **Make decisions** — each choice affects your approval rating and budget
5. **Ask Star** — your AI campaign manager explains every real Indian election law
6. **Win or lose** — see your final civic score and report card on Election Day

---

## 📝 Environment Variables

See [`.env.example`](./.env.example) for all required keys.

| Variable | Where Used | Notes |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Frontend | Firebase project API key |
| `VITE_FIREBASE_PROJECT_ID` | Frontend | Firebase project ID |
| `VITE_FIREBASE_AUTH_DOMAIN` | Frontend | Firebase auth domain |
| `VITE_FIREBASE_STORAGE_BUCKET` | Frontend | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Frontend | Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | Frontend | Firebase app ID |
| `VITE_GA_MEASUREMENT_ID` | Frontend | Google Analytics 4 measurement ID |
| `GEMINI_API_KEY` | **Server only** | Never prefix with VITE_ |
| `CLIENT_URL` | Server | Deployed frontend URL (for CORS in production) |
| `PORT` | Server | Proxy port (default: 3001) |

---

## 📜 License

MIT © 2026 Journey of Elections
