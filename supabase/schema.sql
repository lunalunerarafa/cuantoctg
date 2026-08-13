-- Run once in the Supabase SQL editor.
--
-- Stores every submission attempt, accepted or rejected, per CLAUDE.md's
-- "store every raw submission" rule. Rate-limit counts (see
-- lib/supabase.ts) include rejected attempts too, so a bot can't dodge the
-- cap by sending junk. origin/destination stay unconstrained text (validated
-- in app code against VALID_ROUTES) rather than a DB enum, so a garbage
-- route param lands as a clean rejected row instead of a DB error.
create table reports (
  id bigint generated always as identity primary key,
  origin text not null,
  destination text not null,
  amount_cop integer,
  ip_hash text not null,
  status text not null check (status in ('accepted', 'rejected')),
  reject_reason text,
  created_at timestamptz not null default now(),
  check (
    (status = 'accepted' and amount_cop is not null and amount_cop between 3000 and 300000)
    or status = 'rejected'
  )
);

-- Rate-limit lookups (lib/supabase.ts: countRecentSubmissions).
create index reports_ip_hash_created_at_idx on reports (ip_hash, created_at);
create index reports_ip_hash_route_created_at_idx on reports (ip_hash, origin, destination, created_at);

-- Display-range lookups (lib/supabase.ts: getUserReports).
create index reports_route_created_idx on reports (origin, destination, created_at) where status = 'accepted';

-- No policies: only the service-role key (which bypasses RLS) ever touches
-- this table. A zero-cost safety net against a future accidental
-- client-side Supabase call.
alter table reports enable row level security;
