-- Links calendar posts to the campaign that planned them (used by "Plan New Campaign").
-- Safe to run more than once.
alter table public.brand_calendar
  add column if not exists campaign_id uuid references public.brand_campaigns(id) on delete set null;

create index if not exists brand_calendar_campaign_id_idx on public.brand_calendar (campaign_id);
