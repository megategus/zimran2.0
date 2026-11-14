-- Wrenchly schema. All access goes through server routes with the service-role key.
-- RLS is on with no policies, so the anon key can read nothing.

create table guests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  is_premium boolean not null default false,
  day_offset int not null default 0,
  xp int not null default 0,
  is_demo boolean not null default false
);

create table cars (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references guests(id) on delete cascade,
  vin text,
  year int not null,
  make text not null,
  model text not null,
  trim text,
  engine text,
  specs jsonb not null default '{}',
  recalls jsonb not null default '[]',
  created_at timestamptz not null default now()
);
create index cars_guest_idx on cars (guest_id, created_at desc);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references cars(id) on delete cascade,
  lesson_key text not null,
  content jsonb not null,
  created_at timestamptz not null default now(),
  unique (car_id, lesson_key)
);

create table progress (
  guest_id uuid not null references guests(id) on delete cascade,
  lesson_key text not null,
  score int not null,
  completed_at timestamptz not null default now(),
  primary key (guest_id, lesson_key)
);

create table activity (
  guest_id uuid not null references guests(id) on delete cascade,
  day date not null,
  primary key (guest_id, day)
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references guests(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  had_image boolean not null default false,
  created_at timestamptz not null default now()
);
create index chat_guest_idx on chat_messages (guest_id, created_at);

create table notify_requests (
  guest_id uuid not null references guests(id) on delete cascade,
  course_key text not null,
  created_at timestamptz not null default now(),
  primary key (guest_id, course_key)
);

alter table guests enable row level security;
alter table cars enable row level security;
alter table lessons enable row level security;
alter table progress enable row level security;
alter table activity enable row level security;
alter table chat_messages enable row level security;
alter table notify_requests enable row level security;
