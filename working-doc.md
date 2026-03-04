# Productive Guy – Web App Working Document

## Project Overview

- **Framework:** Next.js (App Router) with TypeScript & Tailwind CSS
- **Backend/Services:** Firebase (v12.10.0)
- **Package Manager:** npm

---

## Change Log

### 2026-03-04 — Initial Setup

#### 1. Firebase SDK installed

- Ran `npm install firebase` to add the Firebase JS SDK.

#### 2. Next.js project scaffolded

- Used `npx create-next-app@latest` with the following options:
  - TypeScript ✅
  - Tailwind CSS ✅
  - ESLint ✅
  - App Router (`/app`) ✅
  - `src/` directory ✅
  - Import alias `@/*` ✅
- Re-installed `firebase` after scaffolding.

#### 3. Firebase configuration moved to environment variables

- **Created `.env.local`** with all Firebase config values prefixed with `NEXT_PUBLIC_` so they're available client-side in Next.js.
- **Created `src/lib/firebase.ts`** — the main Firebase initialization file:
  - Reads config from `process.env.NEXT_PUBLIC_*` instead of hardcoded strings.
  - Uses `getApps()` to prevent re-initialization during hot reload.
  - Wraps Analytics in an `isSupported()` check (Analytics only works in the browser).
- `.env.local` is already covered by the `.gitignore` pattern `.env*`, so secrets won't be committed.

---

## Current File Structure (key files)

```
web/
├── .env.local                 # Firebase secrets (git-ignored)
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── eslint.config.mjs
├── working-doc.md             # This file
├── public/
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── lib/
│       └── firebase.ts        # Firebase init (uses env vars)
```

---

## Environment Variables (`.env.local`)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Cloud Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Google Analytics measurement ID |

---

## Notes for Future Sessions

- Import Firebase anywhere with: `import { app, analytics } from "@/lib/firebase";`
- Add more Firebase SDKs (Auth, Firestore, Storage, etc.) in `src/lib/firebase.ts` as needed.
- Run the dev server with: `npm run dev`
