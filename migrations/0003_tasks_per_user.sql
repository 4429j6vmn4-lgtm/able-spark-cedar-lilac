drop table if exists tasks;

create table tasks (
  id         serial primary key,
  user_id    text not null,
  title      text not null,
  detail     text not null default '',
  status     text not null default 'inbox'
             check (status in ('inbox', 'doing', 'done')),
  created_at timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on tasks (user_id);
