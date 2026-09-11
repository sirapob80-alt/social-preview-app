create extension if not exists pgcrypto;
create table if not exists public.messages (id uuid primary key default gen_random_uuid(),room_id text not null,sender_id text not null,sender_name text not null check(char_length(sender_name) between 1 and 30),body text not null check(char_length(body) between 1 and 5000),original_url text,preview jsonb,created_at timestamptz not null default now());
create index if not exists messages_room_created_idx on public.messages(room_id,created_at);
alter table public.messages enable row level security;
drop policy if exists "public read messages" on public.messages;
create policy "public read messages" on public.messages for select using(true);
drop policy if exists "public insert messages" on public.messages;
create policy "public insert messages" on public.messages for insert with check(true);
do $$ begin alter publication supabase_realtime add table public.messages; exception when duplicate_object then null; end $$;
