# CyberShield Security Notes

## Data boundary
CyberShield can run completely local-first. When Supabase environment variables are present, the workspace snapshot is synced to a per-user Supabase row protected by Row Level Security (RLS).

## Authentication
The production path uses Supabase Auth. The local fallback is intentionally demo-only. Local registration stores a PBKDF2 password verifier rather than plaintext credentials, but it is not a substitute for server-side authentication.

## Sensitive data
The threat analyzer is decision support. Do not send real children's private conversations to a demo deployment unless you have an authorized data-processing design. Production integrations must use explicit consent, authorized platform APIs/device services, access control and appropriate retention policies.

## Deployment
Never commit `.env` or service-role keys. Only the Supabase URL and public anon key belong in Vite client configuration; database access is enforced by RLS.
