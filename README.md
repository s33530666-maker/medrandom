# 🩺 MedRandom — Medical Active Recall Platform

An active-recall and random topic study generator designed for medical students. Inspired by *Unprompted*, specialized for human medicine.

---

## 🚀 Key Features

1. **Randomized Medical Topic Drawer**:
   - Filter by **6 Core Medical Disciplines**: Anatomy, Physiology, Pathology, Pharmacology, Microbiology, Clinical Cases.
   - Filter by **Difficulty**: Easy, Medium, Hard.
   - **No-Repeat Cycle**: Excludes already drawn topics until the entire filtered pool is exhausted.
   - Clinical prompts and focus questions included on each card.

2. **Dual-Stage Active Recall Timers**:
   - **Phase 1 — Deep Research**: Configurable countdown timer (10, 20, 30, 60 minutes) with play, pause, +1m, and sound alerts.
   - **Phase 2 — Verbal Recall**: Short countdown timer (1, 2, 3, 5 minutes) for practicing explaining the concept aloud without references.

3. **Study Notes Scratchpad**:
   - Integrated markdown/text editor to record key diagnostic criteria, mechanisms, or recall points.
   - Automatically logged and linked to each attempt.

4. **Daily Streak Tracking & History**:
   - 🔥 Daily streak counter with activity badges and completed topics count.
   - Complete historical log with search, filters, and full notes inspection modal.

5. **Curated & Data-Driven Topic Bank**:
   - **180+ High-Yield Medical Topics** pre-loaded in `data/topics.json`.
   - In-app Topic Bank explorer to search all topics and add custom topics dynamically.
   - Fully editable JSON seed bank that updates without code changes.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Canvas-Confetti, Web Audio API.
- **Backend**: Node.js, Express, TypeScript, CORS.
- **Database**: SQLite with Prisma ORM (`Topic` and `Attempt` models).

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
npm --prefix client install
```

### 2. Initialize Database & Seed Topics
```bash
npx prisma db push
npm run prisma:seed
```

### 3. Start Development Servers
Runs both Express backend (`http://localhost:3001`) and Vite frontend (`http://localhost:5173`):
```bash
npm run dev
```

### 4. Production Build & Start
```bash
npm run build
npm start
```
Open `http://localhost:3001` in your browser.

---

## 📂 Project Structure

```
├── client/                     # Vite + React + Tailwind Frontend
│   ├── src/
│   │   ├── components/         # Header, StudyStudio, TopicCard, TimerCircle, HistoryPage, TopicBankPage
│   │   ├── lib/                # API client, Web Audio sound synthesis
│   │   ├── types/              # TypeScript interfaces (Topic, Attempt, StreakStats)
│   │   ├── App.tsx             # Root layout and tab navigation
│   │   └── main.tsx            # React DOM entry
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/                     # Express Backend
│   ├── routes/
│   │   ├── topics.ts           # /api/topics (random draw with no-repeat, list, create)
│   │   └── attempts.ts         # /api/attempts (study logging, history, streak metrics)
│   ├── lib/prisma.ts           # Prisma client singleton
│   └── index.ts                # Express server setup and static client serving
├── prisma/
│   ├── schema.prisma           # SQLite schema (Topic and Attempt)
│   └── seed.ts                 # Seeder script reading data/topics.json
├── data/
│   └── topics.json             # 180+ curated medical topics across 6 disciplines
└── package.json
```

---

## 📝 Editing & Adding Topics

Topics can be added in two ways:
1. **Directly via the Web UI**: Navigate to the **Topic Bank** tab and click **"Add Custom Topic"**.
2. **Via JSON**: Edit `data/topics.json` and run:
   ```bash
   npm run prisma:seed
   ```
