begin;
create table if not exists public.cms_seo_sites (
 site text primary key check (site in ('securitizadora','cartas','pay')),
 draft_config jsonb not null default '{}'::jsonb,
 published_config jsonb,
 published_at timestamptz,
 updated_at timestamptz not null default now()
);
alter table public.cms_seo_sites enable row level security;
revoke all on public.cms_seo_sites from anon,authenticated;
grant select,insert,update on public.cms_seo_sites to authenticated;
drop policy if exists owner_seo on public.cms_seo_sites;
create policy owner_seo on public.cms_seo_sites for all to authenticated
using(exists(select 1 from public.cms_admins where user_id=(select auth.uid())))
with check(exists(select 1 from public.cms_admins where user_id=(select auth.uid())));
create or replace view public.cms_public_seo_sites as
select site,published_config - 'keywords' as published_config,published_at
from public.cms_seo_sites where published_config is not null;
revoke all on public.cms_public_seo_sites from authenticated,anon;
grant select on public.cms_public_seo_sites to anon,authenticated;
commit;
