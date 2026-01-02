create table push_subscriptions (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (id)
);

create unique index push_subscriptions_endpoint_idx on push_subscriptions (endpoint);

alter table push_subscriptions enable row level security;

create policy "Users can manage their own push subscriptions" on push_subscriptions
  for all using (auth.uid() = user_id);
