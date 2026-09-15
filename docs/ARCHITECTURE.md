# CyberShield Architecture

## Runtime modes

CyberShield has two intentional runtime modes:

1. **Local-first demo mode** — no Supabase environment variables. Data remains in browser storage and the local registration path is demonstration-only.
2. **Cloud mode** — Supabase URL + public anon key are present. Supabase Auth owns identity/session state and the `cybershield_workspaces` table stores a versioned workspace snapshot under Row Level Security.

## Request/data flow

```text
Browser
  │
  ├── React Router / protected UI
  │
  ├── Threat Engine (deterministic + explainable)
  │
  ├── Workspace Store
  │      ├── localStorage cache
  │      └── Supabase sync (optional)
  │
  └── Supabase Auth (cloud mode)
           │
           ▼
     Postgres + RLS
```

## Security boundary

The browser is never given a service-role key. RLS must enforce that `auth.uid()` matches the workspace owner. Future platform integrations should terminate at an authenticated server/API boundary instead of embedding provider secrets in the client.

## Threat analysis boundary

Threat analysis is assistive classification. Rule matches, risk score, confidence and recommendations are exposed for human review. Real deployments should minimize retention of children's content and use only authorized data sources.

## Scaling path

The current JSONB workspace snapshot is intentionally simple for a single-user portfolio deployment. A production multi-tenant rollout can split the snapshot into relational tables (`children`, `incidents`, `services`, `audit_events`, `settings`) while keeping the same RLS ownership model. The versioned snapshot provides a safe migration point.
