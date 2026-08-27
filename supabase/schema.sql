-- Cannasseur schema. Run once in the Supabase SQL editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).

create table profiles (
  id   uuid primary key references auth.users(id) on delete cascade,
  name text,
  tags text[] not null default '{}'
);

create table logs (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  strain    text not null,
  type      text not null check (type in ('Flower', 'Concentrate')),

  happy     smallint not null default 0,
  creative  smallint not null default 0,
  active    smallint not null default 0,
  relaxed   smallint not null default 0,
  sleepy    smallint not null default 0,

  anxiety    smallint not null default 0,
  migraines  smallint not null default 0,
  depression smallint not null default 0,
  pain       smallint not null default 0,
  insomnia   smallint not null default 0,

  tags         text[] not null default '{}',
  final_rating smallint not null,
  notes        text,
  created_at   timestamptz not null default now(),

  -- Mirrors Firebase's date-as-key, and makes the data import idempotent.
  unique (user_id, logged_at)
);

create index logs_user_logged_at_idx on logs (user_id, logged_at desc);

alter table profiles enable row level security;
alter table logs     enable row level security;

create policy "own profile" on profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "own logs" on logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Create the profile row automatically on signup, pulling `name` out of the
-- metadata passed to supabase.auth.signUp({ options: { data: { name } } }).
create function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Lets a signed-in user delete their own account from the client (the
-- anon key can't touch auth.users directly, and the service_role key
-- must never ship in the app). Deleting the auth.users row cascades to
-- profiles and logs via their foreign keys above.
create function delete_user() returns void as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer;

grant execute on function delete_user() to authenticated;
