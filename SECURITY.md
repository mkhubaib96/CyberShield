
---

#  SECURITY.md 

```markdown
# Security Policy 🛡️

## CyberShield Security Model

CyberShield is designed as a consent-first child online-safety decision-support application.

The project demonstrates security architecture and safety-analysis workflows without performing covert surveillance or unauthorized data collection.

---

## Responsible Use

CyberShield does not currently:

- secretly monitor devices
- bypass authentication
- scrape private accounts
- intercept private communications
- collect real children's information
- provide covert surveillance capabilities

Real integrations must use authorized APIs, explicit permissions, and appropriate consent.

---

## Authentication

CyberShield supports Supabase Authentication for production deployments.

Authentication is handled by Supabase Auth rather than by storing user passwords in the application database.

A local authentication fallback exists for demonstration purposes.

The local authentication mode should not be considered a replacement for a production identity provider.

---

## Database Security

Cloud workspace data is stored in Supabase PostgreSQL.

The workspace table is protected using Row Level Security (RLS).

Each workspace is associated with an authenticated Supabase user.

Expected access rule:

```text
authenticated user
        ↓
auth.uid()
        ↓
matching user_id
        ↓
workspace access
