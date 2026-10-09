create table if not exists tasks (
  id         serial primary key,
  title      text not null,
  detail     text not null default '',
  status     text not null default 'inbox'
             check (status in ('inbox', 'doing', 'done')),
  created_at timestamptz not null default now()
);

insert into tasks (title, detail, status)
select * from (values
  ('Sketch the lobby mural', 'Warm paper palette, no neon.', 'doing'),
  ('Order linen samples', 'Oat, clay, and charcoal swatches.', 'inbox'),
  ('Publish the spring menu', 'Three plates, short copy only.', 'inbox'),
  ('Hang the opening sign', 'Street side, eye level.', 'done')
) as seed(title, detail, status)
where not exists (select 1 from tasks);
