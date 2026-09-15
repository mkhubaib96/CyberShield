# CyberShield Deployment Checklist

## Local verification

```bash
npm install
npm run check
npm run lint
npm test
npm run build
npm run dev
```

## Vercel + Supabase

1. Create the Supabase project.
2. Run `supabase/schema.sql`.
3. Configure email authentication and redirect URLs for the deployed origin.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Vercel project environment variables.
5. Deploy the repository as a Vite project.
6. Test sign-up/sign-in, session refresh, workspace persistence and sign-out.
7. In Settings, verify the status reads `Cloud secure` and `Sync now` succeeds.

## Pre-release checks

- Never commit `.env`, service-role keys, passwords or real child data.
- Confirm RLS denies cross-user workspace reads/writes.
- Test a fresh account on a clean browser profile.
- Test logout and re-login persistence.
- Test error boundary recovery.
- Test export before sharing the JSON because exports can contain incident text.
