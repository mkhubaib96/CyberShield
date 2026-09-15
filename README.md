# CyberShield 🛡️

**Child Online Safety Intelligence Dashboard**

CyberShield is a portfolio-grade web application concept for helping parents review digital-safety signals across a family's connected services. It combines a responsive command-center UI, explainable local threat analysis, incident triage, child profiles, platform simulations and persistent demo state.

> **Responsible-use boundary:** this repository is a functional demo. It does not secretly monitor social networks or devices. Real integrations require explicit consent, platform permissions and authorized APIs/device services. The analyzer is decision-support software, not a diagnosis or substitute for human review.

## Product highlights

- Family safety dashboard with dynamic local metrics and charts
- Child profiles with safety scores and active-incident state
- Searchable incident queue with severity, confidence, details, read and resolve actions
- Explainable Threat Analyzer with category, score, confidence, matched phrases and recommendations
- Event Simulator for demonstrating the end-to-end detection pipeline
- Simulated platform health, sync and event counters
- Persistent local state via `localStorage`
- Local-only demo authentication flow
- Responsive navigation and polished SaaS-style UI
- Unit tests for the safety engine

## Detection categories

The demo engine currently models signals for:

- No Significant Risk
- Inappropriate Language
- Cyberbullying
- Potential Grooming
- Explicit Content
- Scam / Phishing
- Location Sharing
- Privacy Risk
- Self-Harm Content
- Threat / Violence

The engine uses transparent phrase rules with severity and confidence scoring. It deliberately exposes matched signals so a reviewer can understand why a message was flagged.

## Architecture

```text
User input / simulated platform event
                │
                ▼
        Local Threat Engine
                │
      ┌─────────┼─────────┐
      ▼         ▼         ▼
   Category    Score   Confidence
      │         │         │
      └─────────┼─────────┘
                ▼
             Incident
                │
        ┌───────┴────────┐
        ▼                ▼
   Alert workflow     Dashboard
        │                │
        └───────┬────────┘
                ▼
        Parent review
```

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui + Radix UI
- Recharts
- React Router
- Vitest

## Run locally

```bash
npm install
npm run dev
```

The Vite dev server is configured for port `8080`.

### Demo login

```text
Email:    demo@cybershield.app
Password: CyberShield123!
```

You can also create a local demo account from the registration screen. No real credentials are sent to a server in the current build.

## Quality checks

```bash
npm run check
npm run lint
npm test
npm run build
```

## Suggested demo flow

1. Open **Event Simulator**.
2. Run the **Potential grooming** scenario.
3. Open **Alerts** and inspect the new incident.
4. Open **Details** to show matched indicators and recommended action.
5. Resolve the incident.
6. Return to **Overview** and demonstrate the updated safety state.

For a second pass, open **Threat Analyzer** and paste your own sample message. Benign content should show **No Significant Risk**, while known safety cues should surface an explained category and score.

## Deployment

This is a standard Vite SPA and can be deployed to Vercel, Netlify, Cloudflare Pages, GitHub Pages (with SPA routing configuration), or another static host.

For production use, replace local authentication/local storage with a secure backend such as Supabase and implement only authorized, privacy-preserving data integrations.

## Project structure

```text
src/
├── components/          # dashboard and reusable UI
├── contexts/            # local authentication state
├── lib/
│   ├── data.ts          # typed seed data
│   ├── store.tsx        # persistent app state + workflow mutations
│   ├── threat-engine.ts # explainable local risk engine
│   └── utils.ts
├── pages/               # application screens
└── test/                # threat-engine tests
```

## Status

**Current stage:** CyberShield V2.4 — portfolio-grade, local-first workspace with optional Supabase Auth + cloud persistence.

## V2.4 production jump

- Optional Supabase Auth for real sign-in/sign-out and session refresh.
- User-scoped workspace persistence with Supabase Row Level Security (RLS).
- Local-first fallback remains available when cloud environment variables are absent.
- Local registration stores a PBKDF2 password verifier instead of plaintext passwords.
- Workspace state is versioned (`schema_version`) for future migrations.
- Debounced cloud synchronization plus manual **Sync now** control.
- Cloud workspace deletion and local-cache clearing are separate controls.
- Global React error boundary prevents blank-screen failures and exposes recovery details.
- Vercel security headers for MIME sniffing, framing, referrer leakage and browser permissions.
- Security documentation and Supabase SQL bootstrap included in `SECURITY.md` and `supabase/schema.sql`.

## Enabling cloud mode

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. In project authentication settings, configure your preferred email confirmation policy.
4. Copy `.env.example` to `.env` and fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Restart Vite. The Settings page will show **Cloud secure** and provide a manual **Sync now** control.

Do not put a Supabase service-role key in the frontend. The browser only needs the public anon key; RLS is responsible for tenant isolation.

## Demo mode

Leave the Supabase variables blank to run entirely in the browser. The demo account remains `demo@cybershield.app` / `CyberShield123!`. Local registration is for demonstrations only and is not a replacement for server-side production authentication.

