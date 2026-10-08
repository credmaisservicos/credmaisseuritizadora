begin;
create table if not exists public.cms_admins (
 user_id uuid primary key references auth.users(id) on delete cascade,
 email text not null unique
);
alter table public.cms_admins enable row level security;
revoke all on public.cms_admins from anon, authenticated;
grant select on public.cms_admins to authenticated;
create policy owner_identity on public.cms_admins for select to authenticated using(user_id = (select auth.uid()));

create table public.cms_leads (
 id uuid primary key default gen_random_uuid(),
 site text not null check(site in ('securitizadora','cartas','pay')),
 request_id uuid not null,
 name text not null check(char_length(name) between 2 and 120),
 email text not null default '', phone text not null,
 company text not null default '', product text not null,
 message text not null default '', source_path text not null,
 consent boolean not null check(consent), consent_version text not null default '2026-10-08',
 status text not null default 'new' check(status in ('new','contacted','done')),
 notes text not null default '' check(char_length(notes)<=3000),
 notification_status text not null default 'pending',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(site, request_id)
);
create index cms_leads_site_date on public.cms_leads(site,created_at desc);
alter table public.cms_leads enable row level security;
revoke all on public.cms_leads from anon,authenticated;
grant select on public.cms_leads to authenticated;
grant update(status,notes) on public.cms_leads to authenticated;
create policy owner_lead_read on public.cms_leads for select to authenticated using(exists(select 1 from public.cms_admins where user_id=(select auth.uid())));
create policy owner_lead_update on public.cms_leads for update to authenticated using(exists(select 1 from public.cms_admins where user_id=(select auth.uid()))) with check(exists(select 1 from public.cms_admins where user_id=(select auth.uid())));

create table public.cms_pages (
 id text primary key,
 site text not null check(site in ('securitizadora','cartas','pay')),
 path text not null,
 draft_content jsonb not null,
 published_content jsonb,
 updated_at timestamptz not null default now(), published_at timestamptz,
 unique(site,path)
);
alter table public.cms_pages enable row level security;
revoke all on public.cms_pages from anon,authenticated;
grant select,insert,update on public.cms_pages to authenticated;
create policy owner_pages on public.cms_pages for all to authenticated using(exists(select 1 from public.cms_admins where user_id=(select auth.uid()))) with check(exists(select 1 from public.cms_admins where user_id=(select auth.uid())));
create view public.cms_public_pages as select id,site,path,published_content,published_at from public.cms_pages where published_content is not null;
revoke all on public.cms_public_pages from anon,authenticated;
grant select on public.cms_public_pages to anon,authenticated;

create table public.cms_request_limits(key text primary key, hits integer not null, expires_at timestamptz not null);
alter table public.cms_request_limits enable row level security;
revoke all on public.cms_request_limits from anon,authenticated;
create function public.cms_receive_lead(payload jsonb, rate_key text) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare existing uuid; new_id uuid; hits integer;
begin
 select id into existing from public.cms_leads where site=payload->>'site' and request_id=(payload->>'request_id')::uuid;
 if existing is not null then return jsonb_build_object('id',existing,'duplicate',true); end if;
 delete from public.cms_request_limits where expires_at<now()-interval '1 day';
 insert into public.cms_request_limits as r(key,hits,expires_at) values(rate_key,1,now()+interval '15 minutes')
 on conflict(key) do update set hits=case when r.expires_at<now() then 1 else r.hits+1 end,expires_at=case when r.expires_at<now() then now()+interval '15 minutes' else r.expires_at end
 returning r.hits into hits;
 if hits>8 then return jsonb_build_object('limited',true); end if;
 insert into public.cms_leads(site,request_id,name,email,phone,company,product,message,source_path,consent)
 values(payload->>'site',(payload->>'request_id')::uuid,payload->>'name',payload->>'email',payload->>'phone',payload->>'company',payload->>'product',payload->>'message',payload->>'source_path',true)
 on conflict(site,request_id) do nothing returning id into new_id;
 if new_id is null then select id into new_id from public.cms_leads where site=payload->>'site' and request_id=(payload->>'request_id')::uuid; return jsonb_build_object('id',new_id,'duplicate',true); end if;
 return jsonb_build_object('id',new_id,'duplicate',false);
end; $$;
revoke all on function public.cms_receive_lead(jsonb,text) from public,anon,authenticated;
grant execute on function public.cms_receive_lead(jsonb,text) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('cms-images','cms-images',true,5242880,array['image/webp','image/jpeg','image/png','image/avif']) on conflict(id) do nothing;
create policy owner_image_insert on storage.objects for insert to authenticated with check(bucket_id='cms-images' and exists(select 1 from public.cms_admins where user_id=(select auth.uid())));
create policy owner_image_update on storage.objects for update to authenticated using(bucket_id='cms-images' and exists(select 1 from public.cms_admins where user_id=(select auth.uid()))) with check(bucket_id='cms-images' and exists(select 1 from public.cms_admins where user_id=(select auth.uid())));
create policy owner_image_read on storage.objects for select to authenticated using(bucket_id='cms-images' and exists(select 1 from public.cms_admins where user_id=(select auth.uid())));
create policy owner_image_delete on storage.objects for delete to authenticated using(bucket_id='cms-images' and exists(select 1 from public.cms_admins where user_id=(select auth.uid())));
commit;
