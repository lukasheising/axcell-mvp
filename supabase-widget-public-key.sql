begin;

alter table public.companies
add column if not exists widget_public_key text;

update public.companies
set widget_public_key = 'wpk_' || replace(gen_random_uuid()::text, '-', '')
where widget_public_key is null;

alter table public.companies
alter column widget_public_key
set default ('wpk_' || replace(gen_random_uuid()::text, '-', ''));

alter table public.companies
alter column widget_public_key set not null;

create unique index if not exists companies_widget_public_key_key
on public.companies(widget_public_key);

commit;
