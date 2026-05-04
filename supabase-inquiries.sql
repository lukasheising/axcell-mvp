begin;

create extension if not exists pgcrypto;

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid nullable references public.companies(id) on delete set null,
  customer_name text not null,
  customer_phone text,
  category text not null check (
    category in ('new_lead', 'reschedule', 'cancellation', 'other')
  ),
  subject text not null,
  summary text,
  transcript text,
  status text not null default 'new' check (
    status in ('new', 'in_progress', 'handled')
  ),
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inquiries_company_received_at_idx
on public.inquiries(company_id, received_at desc);

alter table public.inquiries enable row level security;

drop policy if exists "Users can read company inquiries" on public.inquiries;

create policy "Users can read company inquiries"
on public.inquiries
for select
to authenticated
using (
  exists (
    select 1
    from public.companies
    where companies.id = inquiries.company_id
      and companies.user_id = auth.uid()
  )
);

create or replace function public.set_inquiries_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_inquiries_updated_at on public.inquiries;

create trigger set_inquiries_updated_at
before update on public.inquiries
for each row
execute function public.set_inquiries_updated_at();

with target_company as (
  select id
  from public.companies
  limit 1
)
insert into public.inquiries (
  company_id,
  customer_name,
  customer_phone,
  category,
  subject,
  summary,
  transcript,
  status,
  received_at
)
select
  target_company.id,
  seed.customer_name,
  seed.customer_phone,
  seed.category,
  seed.subject,
  seed.summary,
  seed.transcript,
  seed.status,
  seed.received_at
from target_company
cross join (
  values
    (
      'Rasmus Jensen',
      '22 45 67 89',
      'reschedule',
      'Flytning af tid',
      'Rasmus ønsker at flytte sin tid fra den 29. juni til en dato i starten af juli.',
      'AI: Hej, du taler med Axcell. Hvordan kan jeg hjælpe?
Rasmus: Hej, jeg vil gerne flytte min tid.
AI: Hvilken dato har du tid nu?
Rasmus: Den 29. juni.
AI: Hvornår ønsker du i stedet?
Rasmus: Gerne i starten af juli.',
      'new',
      '2026-05-04 10:42:00+02'::timestamptz
    ),
    (
      'Maria Holm',
      '30 12 44 88',
      'new_lead',
      'Nyt lead',
      'Maria vil gerne kontaktes om et tilbud på fast vinduespudsning hver fjerde uge.',
      'AI: Hej, du taler med Axcell. Hvordan kan jeg hjælpe?
Maria: Jeg vil gerne høre om fast vinduespudsning.
AI: Hvad er dit telefonnummer?
Maria: Det er 30 12 44 88.
AI: Tak, vi vender tilbage med et tilbud.',
      'new',
      '2026-05-04 11:08:00+02'::timestamptz
    ),
    (
      'Peter Larsen',
      '28 91 10 33',
      'cancellation',
      'Aflysning',
      'Peter ønsker at aflyse sin kommende tid og beder om en bekræftelse på SMS.',
      'AI: Hej, du taler med Axcell. Hvordan kan jeg hjælpe?
Peter: Jeg skal aflyse min tid.
AI: Det hjælper jeg med. Hvad er dit telefonnummer?
Peter: 28 91 10 33.
AI: Tak, vi sender en bekræftelse.',
      'in_progress',
      '2026-05-04 11:31:00+02'::timestamptz
    ),
    (
      'Line Madsen',
      '24 60 18 72',
      'other',
      'Andet',
      'Line spørger, om Axcell kan pudse indvendige glaspartier i en mindre butik.',
      'AI: Hej, du taler med Axcell. Hvordan kan jeg hjælpe?
Line: Jeg har et spørgsmål om indvendige glaspartier.
AI: Fortæl endelig lidt mere.
Line: Det er til en butik, og jeg vil gerne vide, om I tilbyder det.',
      'handled',
      '2026-05-04 12:04:00+02'::timestamptz
    )
) as seed (
  customer_name,
  customer_phone,
  category,
  subject,
  summary,
  transcript,
  status,
  received_at
)
where not exists (
  select 1
  from public.inquiries existing
  where existing.company_id = target_company.id
    and existing.customer_phone = seed.customer_phone
    and existing.received_at = seed.received_at
);

commit;
