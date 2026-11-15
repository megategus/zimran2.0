-- Lessons are cached per car profile (year|make|model|trim|engine), not per car row,
-- so two owners of the same car, and every demo Civic, share one generated lesson.
alter table lessons add column profile_key text;
alter table lessons alter column car_id drop not null;

-- Backfill: must match profileKey() in src/lib/lessons/generate.ts.
update lessons l set profile_key = lower(concat_ws('|',
  c.year::text,
  regexp_replace(trim(c.make), '\s+', ' ', 'g'),
  regexp_replace(trim(c.model), '\s+', ' ', 'g'),
  regexp_replace(trim(coalesce(c.trim, '')), '\s+', ' ', 'g'),
  regexp_replace(trim(coalesce(c.engine, '')), '\s+', ' ', 'g')))
from cars c where c.id = l.car_id;

-- Keep the oldest copy of each (profile, lesson) before adding the unique index.
delete from lessons a using lessons b
where a.profile_key = b.profile_key and a.lesson_key = b.lesson_key
  and (a.created_at, a.id) > (b.created_at, b.id);

create unique index lessons_profile_lesson_idx on lessons (profile_key, lesson_key);

-- One row per Claude generation, for the per-guest and per-IP daily limits.
create table generations (
  id bigserial primary key,
  guest_id uuid not null references guests(id) on delete cascade,
  ip text,
  created_at timestamptz not null default now()
);
create index generations_guest_idx on generations (guest_id, created_at);
create index generations_ip_idx on generations (ip, created_at);
alter table generations enable row level security;
