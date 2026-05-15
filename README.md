# MoodMatch

> An AI-powered mood tracking companion that detects your emotions in real time and delivers personalized recommendations to support your mental wellness.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat-square&logo=postgresql)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)

---

## Demo

[![MoodMatch Demo](https://img.shields.io/badge/Watch-Demo-red?style=flat-square&logo=youtube)](https://your-demo-link-here)

> Replace the link above with your video demo URL (YouTube, Loom, etc.)

---

## What is MoodMatch?

MoodMatch uses your webcam and pretrained ML models to detect your facial expression in real time, maps it to a mood, and then generates personalized AI recommendations for music, activities, and reflection — all in the browser. No images ever leave your device.

---

## Features

- **Webcam Mood Detection** — face-api.js captures 16 frames over 2 seconds and averages expression scores for a stable mood reading. No biometric data is transmitted.
- **Manual Mood Picker** — fallback for moods that can't be detected facially (tired, energetic) or when camera access is unavailable.
- **AI Recommendations** — Groq AI (llama-3.3-70b) generates three personalized suggestions per entry across music, activity, and reflection categories, using your last 10 journal entries as context.
- **YouTube Integration** — real YouTube videos embedded per entry via the YouTube Data API v3.
- **Mood Journal** — paginated journal with mood filter, detail view, personal notes, and delete.
- **7-Day Mood Trend Chart** — interactive Recharts line chart showing your dominant mood per day over the last week.
- **Recommendation Feedback** — like individual recommendations to inform future suggestions.
- **Account Management** — change password, export journal as JSON, delete account.
- **Email Verification** — accounts require email verification before login.
- **Light / Dark Mode** — persisted theme toggle across all pages.
- **Fully Responsive** — mobile-first layout with collapsible nav and adaptive charts.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | Component library |
| Recharts | Mood trend chart |
| face-api.js + TensorFlow.js | Browser-based facial expression detection |
| Auth.js v5 | Session management |
| Axios | HTTP client with JWT interceptor |
| next-themes | Light / dark mode |

### Backend
| Technology | Purpose |
|---|---|
| Express.js | API server |
| Prisma ORM 7.8 | Database access |
| PostgreSQL (Supabase) | Database |
| JWT | Access (15min) + refresh (7day) tokens |
| Nodemailer | Email verification |

### External APIs
| API | Purpose |
|---|---|
| Groq API (llama-3.3-70b) | AI recommendations |
| YouTube Data API v3 | Mood-matched video results |

### Deployment
| Service | Purpose |
|---|---|
| Vercel | Frontend |
| Render | Backend |
| Supabase | PostgreSQL database |

---

## Architecture

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│   Next.js (Vercel) + face-api.js        │
│   Auth.js session + Axios JWT client    │
└────────────────┬────────────────────────┘
                 │ HTTPS
┌────────────────▼────────────────────────┐
│           Application Layer             │
│   Express.js (Render) — port 5000       │
│   JWT auth · Groq AI · YouTube API      │
│   Prisma ORM                            │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│             Data Layer                  │
│   PostgreSQL via Supabase               │
│   Users · JournalEntries                │
│   Recommendations · YoutubeMedia        │
│   RefreshTokens · VerificationTokens    │
└─────────────────────────────────────────┘
```

> face-api.js runs entirely in the browser. Only the mood label string crosses into the application — no images, frames, or biometric data are ever transmitted.

---

## Local Setup

### Prerequisites

- Node.js v18+
- npm
- PostgreSQL (local or Supabase)
- Gmail account with App Password enabled
- Groq API key — [console.groq.com](https://console.groq.com)
- YouTube Data API v3 key — [Google Cloud Console](https://console.cloud.google.com)

### 1. Clone

```bash
git clone https://github.com/Adithya-Ranjit13/MoodMatch
cd MoodMatch
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/moodmatch
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=your_gmail@gmail.com
GROQ_API_KEY=your_groq_api_key
YOUTUBE_API_KEY=your_youtube_api_key
FRONTEND_URL=http://localhost:3000
```

```bash
npx prisma migrate dev
npx prisma generate
```

### 3. Frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
BACKEND_URL=http://localhost:5000
AUTH_SECRET=your_auth_secret
AUTH_URL=http://localhost:3000
```

### 4. Run

From the root folder:

```bash
npm run dev
```

Frontend runs on [http://localhost:3000](http://localhost:3000)  
Backend runs on [http://localhost:5000](http://localhost:5000)

---

## Folder Structure

```
MoodMatch/
├── frontend/
│   └── src/
│       ├── actions/          auth.ts, account.ts
│       ├── app/
│       │   ├── (app)/        dashboard, journal, scan, account
│       │   ├── (auth)/       login, signup
│       │   ├── api/auth/     [...nextauth] route
│       │   └── verify-email/
│       ├── components/       navbar, webcam-scanner, mood-chart,
│       │                     recommendations, mood-picker, ui/
│       └── lib/              auth.ts, token.ts, utils.ts
│
└── backend/
    └── src/
        ├── controllers/      authController.ts, mood.controller.ts
        ├── routes/           auth.ts, mood.ts
        ├── middleware/       auth.ts
        └── lib/              db.ts, email.ts, token.ts
```

---

## ML Pipeline

MoodMatch uses two pretrained face-api.js models served from `public/models`:

| Model | Architecture | Size | Role |
|---|---|---|---|
| Tiny Face Detector | Tiny YOLO v2 with depthwise separable convolutions | 190 KB | Detects and localizes faces in the webcam feed |
| Face Expression Recognition | Depthwise separable convolutions + DenseNet blocks | 310 KB | Classifies expression into 7 emotion categories |

**Scan pipeline:** camera polls for a face every 250ms → user clicks scan → 16 snapshots over 2 seconds → expression scores averaged → sad sensitivity boost applied → dominant expression mapped to mood label → camera stops → only the mood string is passed forward.

**Expression to mood mapping:**

| Expression | Mood |
|---|---|
| happy, surprised | happy |
| sad | sad |
| angry, fearful, disgusted | stressed |
| neutral | calm |

Tired and energetic are manual-only — not detectable from facial expressions.

---

## Limitations

- Not a mental health tool — mood labels are for personal reflection only, not clinical use
- Accuracy degrades with glasses, masks, poor lighting, or extreme camera angles
- Each scan captures a 2-second window and may not reflect overall emotional state
- AI recommendations are context-limited to the last 10 journal entries
- No offline support

---

## References

- [face-api.js](https://github.com/justadudewhohacks/face-api.js)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [DenseNet paper](https://arxiv.org/abs/1608.06993)
- [Next.js Docs](https://nextjs.org/docs)
- [Auth.js v5](https://authjs.dev)
- [Prisma ORM](https://www.prisma.io/docs)
- [Groq API](https://console.groq.com/docs)
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [shadcn/ui](https://ui.shadcn.com)
- [Recharts](https://recharts.org)

---

*Built by Adithya Ranjit — IBIL Solutions Internship Project, May 2026*
