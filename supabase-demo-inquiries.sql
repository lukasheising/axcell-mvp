begin;

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
      'Mikkel Brandt',
      '26 14 82 09',
      'reschedule',
      'Flytning af tid',
      'Mikkel vil gerne flytte sin aftale på fredag til en formiddag i næste uge.',
      'AI: Hej, du taler med Fenster. Hvordan kan jeg hjælpe?
Kunde: Hej, jeg vil gerne flytte min tid på fredag.
AI: Det kan jeg notere. Hvad er dit navn?
Kunde: Mikkel Brandt.
AI: Hvornår passer det dig bedre?
Kunde: Helst en formiddag i næste uge.
AI: Det noterer jeg. Fenster vender tilbage med en ny tid.',
      'new',
      '2026-05-04 09:12:00+02'::timestamptz
    ),
    (
      'Sofie Lund',
      '31 42 77 18',
      'new_lead',
      'Tilbud på fast vinduespudsning',
      'Sofie ønsker et tilbud på udvendig vinduespudsning hver sjette uge i en villa.',
      'AI: Hej, du taler med Fenster. Hvordan kan jeg hjælpe?
Kunde: Jeg vil gerne have en pris på fast vinduespudsning.
AI: Er det til hus eller lejlighed?
Kunde: Det er en villa med to etager.
AI: Tak, vi kontakter dig med et tilbud.',
      'new',
      '2026-05-04 09:38:00+02'::timestamptz
    ),
    (
      'Thomas Egholm',
      '40 63 91 55',
      'cancellation',
      'Aflysning af aftale',
      'Thomas ønsker at aflyse sin kommende aftale, fordi facaden skal renoveres.',
      'AI: Hej, du taler med Fenster. Hvordan kan jeg hjælpe?
Kunde: Jeg bliver nødt til at aflyse vores aftale.
AI: Det noterer jeg. Hvad er årsagen?
Kunde: Vi får renoveret facaden i næste uge.
AI: Tak, vi aflyser tiden.',
      'in_progress',
      '2026-05-04 10:05:00+02'::timestamptz
    ),
    (
      'Nadia Petersen',
      '27 88 30 64',
      'other',
      'Spørgsmål om indvendig pudsning',
      'Nadia spørger, om Fenster også pudser vinduer indvendigt i en lejlighed.',
      'AI: Hej, du taler med Fenster. Hvordan kan jeg hjælpe?
Kunde: Pudser I også vinduer indvendigt?
AI: Ja, det kan vi ofte hjælpe med.
Kunde: Det er en lejlighed på tredje sal.
AI: Jeg får en kollega til at vende tilbage med mulighederne.',
      'handled',
      '2026-05-04 10:44:00+02'::timestamptz
    ),
    (
      'Lars Nygaard',
      '22 19 54 70',
      'new_lead',
      'Pris på butiksvinduer',
      'Lars ønsker en pris på ugentlig pudsning af store butiksvinduer ud mod gaden.',
      'AI: Hej, du taler med Fenster. Hvordan kan jeg hjælpe?
Kunde: Jeg har en butik og vil høre om pris.
AI: Hvor ofte ønsker du vinduerne pudset?
Kunde: Gerne en gang om ugen.
AI: Tak, vi ringer dig op med en pris.',
      'in_progress',
      '2026-05-04 11:16:00+02'::timestamptz
    ),
    (
      'Camilla Vestergaard',
      '53 21 06 44',
      'other',
      'Beder om opringning',
      'Camilla beder om at blive ringet op om en tilbagevendende aftale.',
      'AI: Hej, du taler med Fenster. Hvordan kan jeg hjælpe?
Kunde: Kan I få nogen til at ringe mig op?
AI: Selvfølgelig. Hvad drejer det sig om?
Kunde: Jeg vil gerne tale om en fast aftale.
AI: Tak, vi ringer dig op snarest.',
      'new',
      '2026-05-04 11:52:00+02'::timestamptz
    ),
    (
      'Jonas Kjær',
      '60 75 12 39',
      'reschedule',
      'Ny tid på grund af ferie',
      'Jonas ønsker at flytte sin tid, da han er bortrejst på den oprindelige dato.',
      'AI: Hej, du taler med Fenster. Hvordan kan jeg hjælpe?
Kunde: Jeg er på ferie, når I kommer næste gang.
AI: Vil du gerne flytte tiden?
Kunde: Ja, gerne til ugen efter.
AI: Det noterer jeg til planlægningen.',
      'handled',
      '2026-05-04 12:27:00+02'::timestamptz
    ),
    (
      'Emma Holm',
      '29 04 66 81',
      'new_lead',
      'Udvendig pudsning af rækkehus',
      'Emma vil gerne have et tilbud på udvendig pudsning af et rækkehus med ovenlysvinduer.',
      'AI: Hej, du taler med Fenster. Hvordan kan jeg hjælpe?
Kunde: Jeg vil gerne have pudset vinduer udvendigt.
AI: Hvilken type bolig er det?
Kunde: Et rækkehus med et par ovenlysvinduer.
AI: Tak, vi vender tilbage med et tilbud.',
      'new',
      '2026-05-04 13:03:00+02'::timestamptz
    ),
    (
      'Henrik Dahl',
      '42 50 18 23',
      'cancellation',
      'Aflysning denne måned',
      'Henrik vil springe denne måneds pudsning over og fortsætte med næste faste tid.',
      'AI: Hej, du taler med Fenster. Hvordan kan jeg hjælpe?
Kunde: Jeg vil gerne aflyse denne måneds vinduespudsning.
AI: Skal aftalen fortsætte næste gang?
Kunde: Ja, kun denne gang skal springes over.
AI: Det noterer jeg.',
      'handled',
      '2026-05-04 13:41:00+02'::timestamptz
    ),
    (
      'Freja Mortensen',
      '25 77 39 02',
      'other',
      'Spørgsmål om adgang',
      'Freja spørger, om kunden skal være hjemme, hvis Fenster kun pudser udvendigt.',
      'AI: Hej, du taler med Fenster. Hvordan kan jeg hjælpe?
Kunde: Skal jeg være hjemme, når I kommer?
AI: Er det kun udvendig pudsning?
Kunde: Ja, kun udvendigt.
AI: Så kan vi ofte klare det uden, hvis der er adgang.',
      'handled',
      '2026-05-04 14:08:00+02'::timestamptz
    ),
    (
      'Anders Skov',
      '33 90 45 11',
      'new_lead',
      'Tilbud på sommerhus',
      'Anders ønsker pris på vinduespudsning af et sommerhus før udlejning.',
      'AI: Hej, du taler med Fenster. Hvordan kan jeg hjælpe?
Kunde: Jeg skal bruge vinduespudsning til et sommerhus.
AI: Hvornår skal det helst være færdigt?
Kunde: Inden næste weekend, før vi lejer det ud.
AI: Tak, vi undersøger en tid og ringer tilbage.',
      'in_progress',
      '2026-05-04 14:36:00+02'::timestamptz
    ),
    (
      'Louise Bak',
      '28 16 73 58',
      'reschedule',
      'Ønsker senere tidspunkt',
      'Louise beder om at flytte sin aftale fra morgen til eftermiddag samme dag.',
      'AI: Hej, du taler med Fenster. Hvordan kan jeg hjælpe?
Kunde: Kan min tid rykkes til senere på dagen?
AI: Hvilken dag gælder det?
Kunde: På torsdag, gerne efter klokken 14.
AI: Det sender jeg videre til planlægningen.',
      'new',
      '2026-05-04 15:10:00+02'::timestamptz
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
