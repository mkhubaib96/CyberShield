# CyberShield 🛡️

## Child Online Safety Intelligence Dashboard

CyberShield is a portfolio-grade child online-safety intelligence dashboard designed to help parents review digital-safety signals across a family's connected services.

It combines a modern security-console interface with explainable threat analysis, incident triage, child profiles, platform simulations, persistent workspace state, authentication, and optional cloud persistence.

> **Responsible-use boundary:** CyberShield is a functional demonstration and decision-support application. It does not secretly monitor social networks, devices, or users. Real integrations require explicit consent, authorized APIs, platform permissions, and appropriate device services. Threat analysis should support human review rather than replace it.

---

## 🚀 Live Demo

**Production deployment:**

https://cyber-shield-psi-topaz.vercel.app/

The application is deployed using Vercel and can be used as an interactive demonstration of the CyberShield workflow.

---

## ✨ Features

### 🏠 Security Command Center
- Family-wide safety posture
- Active incident overview
- Risk and response metrics
- Platform/service health
- Recent security activity
- Responsive security-console interface

### 👨‍👩‍👧 Child Profiles
- Individual child profiles
- Safety scores
- Active incident state
- Age-aware profile information
- Per-child risk visibility

### 🚨 Incident & Alert Management
- Searchable incident queue
- Severity classification
- Confidence levels
- Explainable indicators
- Incident details
- Read and resolve workflow
- Audit trail for important actions

### 🧠 Explainable Threat Analyzer
CyberShield uses a deterministic, transparent threat-analysis engine.

It can identify signals associated with:

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

The analyzer provides:

- Risk score
- Severity
- Confidence
- Category
- Matched indicators
- Explanation
- Recommended response

### 🧪 Event Simulator
The Event Simulator demonstrates the detection pipeline without requiring access to real social platforms or devices.

It can simulate safety events and show how they move through the CyberShield workflow.

### 📊 Intelligence Center
- Family safety posture
- Incident analytics
- Threat-category distribution
- Confidence distribution
- Risk by child
- Service telemetry
- Audit trail
- Workspace export

### 🔐 Authentication
CyberShield supports:

- Supabase Authentication
- Email/password registration
- Email/password login
- Session persistence
- Secure sign-out
- Local demo authentication fallback

### ☁️ Cloud Workspace
When Supabase is configured:

- User-scoped workspace persistence
- Supabase Auth
- PostgreSQL-backed workspace storage
- Row Level Security (RLS)
- Automatic workspace synchronization

### 💾 Local-First Architecture
Without Supabase, CyberShield can operate locally using:

- Browser localStorage
- User-scoped state
- Local demo authentication
- Persistent workspace data

### ⚙️ Workspace Controls
- Export workspace
- Export audit trail
- Reset demo data
- Clear local cache
- Cloud synchronization
- Privacy/data controls

### 🛡️ Security
- Supabase Row Level Security
- User-scoped cloud workspace
- No service-role key in frontend
- Security headers through Vercel
- Environment variables for deployment secrets/configuration
- Error boundary for graceful application failures

---

## 🧰 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Radix UI
- React Router
- Recharts

### Authentication & Cloud
- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security

### Testing & Quality
- Vitest
- ESLint
- TypeScript
- Vite production build

### Deployment
- Vercel
- GitHub

---

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │      CyberShield     │
                    │   React + TypeScript │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
       Threat Engine      Workspace Store    Auth Layer
       Rule-based &       Local / Cloud      Supabase /
       Explainable           State           Local Demo
             │                 │                 │
             └─────────────────┼─────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Supabase        │
                    │ Auth + PostgreSQL    │
                    │       + RLS          │
                    └──────────────────────┘
