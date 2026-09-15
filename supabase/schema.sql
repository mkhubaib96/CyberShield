-- CyberShield production workspace storage
-- Run this in the Supabase SQL editor after creating a project.

create table if not exists public.cybershield_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schema_version integer not null default 1,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cybershield_workspaces enable row level security;

drop policy if exists "Users can read their own CyberShield workspace" on public.cybershield_workspaces;
create policy "Users can read their own CyberShield workspace" on public.cybershield_workspaces for select using (auth.uid() = user_id);

drop policy if exists "Users can create their own CyberShield workspace" on public.cybershield_workspaces;
create policy "Users can create their own CyberShield workspace" on public.cybershield_workspaces for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own CyberShield workspace" on public.cybershield_workspaces;
create policy "Users can update their own CyberShield workspace" on public.cybershield_workspaces for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own CyberShield workspace" on public.cybershield_workspaces;
create policy "Users can delete their own CyberShield workspace" on public.cybershield_workspaces for delete using (auth.uid() = user_id);

create or replace function public.set_cybershield_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists cybershield_workspaces_updated_at on public.cybershield_workspaces;
create trigger cybershield_workspaces_updated_at before update on public.cybershield_workspaces for each row execute function public.set_cybershield_updated_at();

revoke all on table public.cybershield_workspaces from anon;
grant select, insert, update, delete on table public.cybershield_workspaces to authenticated;
