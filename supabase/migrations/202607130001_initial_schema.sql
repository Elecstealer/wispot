begin;

create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  avatar_emoji text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete restrict,
  name text not null check (char_length(name) between 1 and 80),
  icon text,
  color text check (color is null or color ~ '^#[0-9A-Fa-f]{6}$'),
  invite_code text not null unique default encode(extensions.gen_random_bytes(6), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  status text not null default 'active' check (status in ('invited', 'active')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  name text not null check (char_length(name) between 1 and 160),
  category text not null check (char_length(category) between 1 and 60),
  region text,
  description text,
  image_url text,
  source_url text,
  hours_text text,
  closed_text text,
  is_open boolean,
  status text not null default 'unconfirmed' check (status in ('unconfirmed', 'confirmed')),
  address text,
  latitude numeric(9, 6) check (latitude between -90 and 90),
  longitude numeric(10, 6) check (longitude between -180 and 180),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.place_memos (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.place_likes (
  place_id uuid not null references public.places (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (place_id, user_id)
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  title text not null check (char_length(title) between 1 and 160),
  pattern text check (pattern is null or pattern in ('A', 'B', 'C', 'D')),
  plan_date date,
  area text,
  start_time time,
  end_time time,
  end_day_offset smallint not null default 0 check (end_day_offset between 0 and 1),
  status text not null default 'upcoming' check (status in ('upcoming', 'ongoing', 'done', 'cancelled')),
  fixed_place_id uuid references public.places (id) on delete set null,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plan_members (
  plan_id uuid not null references public.plans (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (plan_id, user_id)
);

create table public.plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans (id) on delete cascade,
  place_id uuid references public.places (id) on delete set null,
  position integer not null check (position >= 0),
  start_time time,
  end_time time,
  end_day_offset smallint not null default 0 check (end_day_offset between 0 and 1),
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, position)
);

create table public.plan_item_reactions (
  plan_item_id uuid not null references public.plan_items (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reaction text not null check (reaction in ('like', 'change')),
  created_at timestamptz not null default now(),
  primary key (plan_item_id, user_id, reaction)
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  title text not null check (char_length(title) between 1 and 200),
  deadline_at timestamptz,
  linked_plan_id uuid references public.plans (id) on delete set null,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vote_candidates (
  vote_id uuid not null references public.votes (id) on delete cascade,
  place_id uuid not null references public.places (id) on delete cascade,
  position integer not null check (position >= 0),
  created_at timestamptz not null default now(),
  primary key (vote_id, place_id),
  unique (vote_id, position)
);

create table public.vote_responses (
  vote_id uuid not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  place_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (vote_id, user_id),
  foreign key (vote_id, place_id)
    references public.vote_candidates (vote_id, place_id)
    on delete cascade
);

create index group_members_user_id_idx on public.group_members (user_id, group_id);
create index places_group_id_created_at_idx on public.places (group_id, created_at desc);
create index place_memos_place_id_created_at_idx on public.place_memos (place_id, created_at);
create index place_likes_user_id_idx on public.place_likes (user_id, place_id);
create index plans_group_id_plan_date_idx on public.plans (group_id, plan_date desc);
create index plan_members_user_id_idx on public.plan_members (user_id, plan_id);
create index plan_items_plan_id_position_idx on public.plan_items (plan_id, position);
create index plan_item_reactions_user_id_idx on public.plan_item_reactions (user_id, plan_item_id);
create index votes_group_id_created_at_idx on public.votes (group_id, created_at desc);
create index vote_responses_user_id_idx on public.vote_responses (user_id, vote_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger groups_set_updated_at
before update on public.groups
for each row execute function public.set_updated_at();

create trigger places_set_updated_at
before update on public.places
for each row execute function public.set_updated_at();

create trigger place_memos_set_updated_at
before update on public.place_memos
for each row execute function public.set_updated_at();

create trigger plans_set_updated_at
before update on public.plans
for each row execute function public.set_updated_at();

create trigger plan_items_set_updated_at
before update on public.plan_items
for each row execute function public.set_updated_at();

create trigger votes_set_updated_at
before update on public.votes
for each row execute function public.set_updated_at();

create trigger vote_responses_set_updated_at
before update on public.vote_responses
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, new.id::text), '@', 1)),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.add_group_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.group_members (group_id, user_id, role, status)
  values (new.id, new.owner_id, 'owner', 'active');
  return new;
end;
$$;

create trigger on_group_created
after insert on public.groups
for each row execute function public.add_group_owner_membership();

create or replace function public.protect_group_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'Use a dedicated owner-transfer operation to change group ownership';
  end if;
  return new;
end;
$$;

create trigger protect_group_owner_before_update
before update of owner_id on public.groups
for each row execute function public.protect_group_owner();

create or replace function public.protect_group_owner_membership()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.role = 'owner' and (
    new.group_id is distinct from old.group_id
    or new.user_id is distinct from old.user_id
    or new.role <> 'owner'
    or new.status <> 'active'
  ) then
    raise exception 'The group owner membership cannot be changed directly';
  end if;
  return new;
end;
$$;

create trigger protect_group_owner_membership_before_update
before update on public.group_members
for each row execute function public.protect_group_owner_membership();

create or replace function public.validate_plan_group_links()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.fixed_place_id is not null and not exists (
    select 1 from public.places p
    where p.id = new.fixed_place_id and p.group_id = new.group_id
  ) then
    raise exception 'The fixed place must belong to the plan group';
  end if;
  return new;
end;
$$;

create trigger validate_plan_group_links_before_write
before insert or update of group_id, fixed_place_id on public.plans
for each row execute function public.validate_plan_group_links();

create or replace function public.validate_plan_item_group_links()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.place_id is not null and not exists (
    select 1
    from public.plans plan
    join public.places place on place.id = new.place_id
    where plan.id = new.plan_id and place.group_id = plan.group_id
  ) then
    raise exception 'The plan item place must belong to the plan group';
  end if;
  return new;
end;
$$;

create trigger validate_plan_item_group_links_before_write
before insert or update of plan_id, place_id on public.plan_items
for each row execute function public.validate_plan_item_group_links();

create or replace function public.validate_vote_group_links()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.linked_plan_id is not null and not exists (
    select 1 from public.plans p
    where p.id = new.linked_plan_id and p.group_id = new.group_id
  ) then
    raise exception 'The linked plan must belong to the vote group';
  end if;
  return new;
end;
$$;

create trigger validate_vote_group_links_before_write
before insert or update of group_id, linked_plan_id on public.votes
for each row execute function public.validate_vote_group_links();

create or replace function public.validate_vote_candidate_group_links()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.votes v
    join public.places p on p.id = new.place_id
    where v.id = new.vote_id and p.group_id = v.group_id
  ) then
    raise exception 'The vote candidate place must belong to the vote group';
  end if;
  return new;
end;
$$;

create trigger validate_vote_candidate_group_links_before_write
before insert or update of vote_id, place_id on public.vote_candidates
for each row execute function public.validate_vote_candidate_group_links();

create or replace function public.is_group_member(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = target_group_id
      and gm.user_id = (select auth.uid())
      and gm.status = 'active'
  );
$$;

create or replace function public.is_group_admin(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.groups g
    where g.id = target_group_id
      and g.owner_id = (select auth.uid())
  ) or exists (
    select 1
    from public.group_members gm
    where gm.group_id = target_group_id
      and gm.user_id = (select auth.uid())
      and gm.status = 'active'
      and gm.role in ('owner', 'admin')
  );
$$;

create or replace function public.shares_group_with(other_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members mine
    join public.group_members theirs on theirs.group_id = mine.group_id
    where mine.user_id = (select auth.uid())
      and mine.status = 'active'
      and theirs.user_id = other_user_id
      and theirs.status = 'active'
  );
$$;

revoke all on function public.is_group_member(uuid) from public;
revoke all on function public.is_group_admin(uuid) from public;
revoke all on function public.shares_group_with(uuid) from public;
grant execute on function public.is_group_member(uuid) to authenticated;
grant execute on function public.is_group_admin(uuid) to authenticated;
grant execute on function public.shares_group_with(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.places enable row level security;
alter table public.place_memos enable row level security;
alter table public.place_likes enable row level security;
alter table public.plans enable row level security;
alter table public.plan_members enable row level security;
alter table public.plan_items enable row level security;
alter table public.plan_item_reactions enable row level security;
alter table public.votes enable row level security;
alter table public.vote_candidates enable row level security;
alter table public.vote_responses enable row level security;

create policy "profiles_select_self_or_group_member"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.shares_group_with(id));

create policy "profiles_insert_self"
on public.profiles for insert to authenticated
with check (id = (select auth.uid()));

create policy "profiles_update_self"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "groups_select_members"
on public.groups for select to authenticated
using (public.is_group_member(id));

create policy "groups_insert_owner"
on public.groups for insert to authenticated
with check (owner_id = (select auth.uid()));

create policy "groups_update_admins"
on public.groups for update to authenticated
using (public.is_group_admin(id))
with check (public.is_group_admin(id));

create policy "groups_delete_owner"
on public.groups for delete to authenticated
using (owner_id = (select auth.uid()));

create policy "group_members_select_members"
on public.group_members for select to authenticated
using (public.is_group_member(group_id));

create policy "group_members_insert_admins"
on public.group_members for insert to authenticated
with check (
  public.is_group_admin(group_id)
  and (
    role <> 'owner'
    or exists (
      select 1 from public.groups g
      where g.id = group_id and g.owner_id = user_id
    )
  )
);

create policy "group_members_update_admins"
on public.group_members for update to authenticated
using (public.is_group_admin(group_id))
with check (
  public.is_group_admin(group_id)
  and (
    not exists (
      select 1 from public.groups g
      where g.id = group_id and g.owner_id = user_id
    )
    or role = 'owner'
  )
);

create policy "group_members_delete_admin_or_self"
on public.group_members for delete to authenticated
using (
  role <> 'owner'
  and (public.is_group_admin(group_id) or user_id = (select auth.uid()))
);

create policy "places_select_members"
on public.places for select to authenticated
using (public.is_group_member(group_id));

create policy "places_insert_members"
on public.places for insert to authenticated
with check (public.is_group_member(group_id) and created_by = (select auth.uid()));

create policy "places_update_members"
on public.places for update to authenticated
using (public.is_group_member(group_id))
with check (public.is_group_member(group_id));

create policy "places_delete_creator_or_admin"
on public.places for delete to authenticated
using (created_by = (select auth.uid()) or public.is_group_admin(group_id));

create policy "place_memos_select_members"
on public.place_memos for select to authenticated
using (exists (
  select 1 from public.places p
  where p.id = place_id and public.is_group_member(p.group_id)
));

create policy "place_memos_insert_author"
on public.place_memos for insert to authenticated
with check (
  author_id = (select auth.uid())
  and exists (
    select 1 from public.places p
    where p.id = place_id and public.is_group_member(p.group_id)
  )
);

create policy "place_memos_update_author"
on public.place_memos for update to authenticated
using (
  author_id = (select auth.uid())
  and exists (
    select 1 from public.places p
    where p.id = place_id and public.is_group_member(p.group_id)
  )
)
with check (
  author_id = (select auth.uid())
  and exists (
    select 1 from public.places p
    where p.id = place_id and public.is_group_member(p.group_id)
  )
);

create policy "place_memos_delete_author_or_admin"
on public.place_memos for delete to authenticated
using (
  author_id = (select auth.uid())
  or exists (
    select 1 from public.places p
    where p.id = place_id and public.is_group_admin(p.group_id)
  )
);

create policy "place_likes_select_members"
on public.place_likes for select to authenticated
using (exists (
  select 1 from public.places p
  where p.id = place_id and public.is_group_member(p.group_id)
));

create policy "place_likes_insert_self"
on public.place_likes for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.places p
    where p.id = place_id and public.is_group_member(p.group_id)
  )
);

create policy "place_likes_delete_self"
on public.place_likes for delete to authenticated
using (user_id = (select auth.uid()));

create policy "plans_select_members"
on public.plans for select to authenticated
using (public.is_group_member(group_id));

create policy "plans_insert_members"
on public.plans for insert to authenticated
with check (public.is_group_member(group_id) and created_by = (select auth.uid()));

create policy "plans_update_members"
on public.plans for update to authenticated
using (public.is_group_member(group_id))
with check (public.is_group_member(group_id));

create policy "plans_delete_creator_or_admin"
on public.plans for delete to authenticated
using (created_by = (select auth.uid()) or public.is_group_admin(group_id));

create policy "plan_members_select_group_members"
on public.plan_members for select to authenticated
using (exists (
  select 1 from public.plans p
  where p.id = plan_id and public.is_group_member(p.group_id)
));

create policy "plan_members_insert_group_members"
on public.plan_members for insert to authenticated
with check (exists (
  select 1
  from public.plans p
  join public.group_members gm on gm.group_id = p.group_id
  where p.id = plan_id
    and public.is_group_member(p.group_id)
    and gm.user_id = user_id
    and gm.status = 'active'
));

create policy "plan_members_delete_group_members"
on public.plan_members for delete to authenticated
using (exists (
  select 1 from public.plans p
  where p.id = plan_id and public.is_group_member(p.group_id)
));

create policy "plan_items_select_members"
on public.plan_items for select to authenticated
using (exists (
  select 1 from public.plans p
  where p.id = plan_id and public.is_group_member(p.group_id)
));

create policy "plan_items_insert_members"
on public.plan_items for insert to authenticated
with check (exists (
  select 1 from public.plans p
  where p.id = plan_id and public.is_group_member(p.group_id)
));

create policy "plan_items_update_members"
on public.plan_items for update to authenticated
using (exists (
  select 1 from public.plans p
  where p.id = plan_id and public.is_group_member(p.group_id)
))
with check (exists (
  select 1 from public.plans p
  where p.id = plan_id and public.is_group_member(p.group_id)
));

create policy "plan_items_delete_members"
on public.plan_items for delete to authenticated
using (exists (
  select 1 from public.plans p
  where p.id = plan_id and public.is_group_member(p.group_id)
));

create policy "plan_item_reactions_select_members"
on public.plan_item_reactions for select to authenticated
using (exists (
  select 1
  from public.plan_items pi
  join public.plans p on p.id = pi.plan_id
  where pi.id = plan_item_id and public.is_group_member(p.group_id)
));

create policy "plan_item_reactions_insert_self"
on public.plan_item_reactions for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.plan_items pi
    join public.plans p on p.id = pi.plan_id
    where pi.id = plan_item_id and public.is_group_member(p.group_id)
  )
);

create policy "plan_item_reactions_delete_self"
on public.plan_item_reactions for delete to authenticated
using (user_id = (select auth.uid()));

create policy "votes_select_members"
on public.votes for select to authenticated
using (public.is_group_member(group_id));

create policy "votes_insert_members"
on public.votes for insert to authenticated
with check (public.is_group_member(group_id) and created_by = (select auth.uid()));

create policy "votes_update_creator_or_admin"
on public.votes for update to authenticated
using (created_by = (select auth.uid()) or public.is_group_admin(group_id))
with check (public.is_group_member(group_id));

create policy "votes_delete_creator_or_admin"
on public.votes for delete to authenticated
using (created_by = (select auth.uid()) or public.is_group_admin(group_id));

create policy "vote_candidates_select_members"
on public.vote_candidates for select to authenticated
using (exists (
  select 1 from public.votes v
  where v.id = vote_id and public.is_group_member(v.group_id)
));

create policy "vote_candidates_insert_members"
on public.vote_candidates for insert to authenticated
with check (exists (
  select 1 from public.votes v
  where v.id = vote_id and public.is_group_member(v.group_id)
));

create policy "vote_candidates_update_members"
on public.vote_candidates for update to authenticated
using (exists (
  select 1 from public.votes v
  where v.id = vote_id and public.is_group_member(v.group_id)
))
with check (exists (
  select 1 from public.votes v
  where v.id = vote_id and public.is_group_member(v.group_id)
));

create policy "vote_candidates_delete_members"
on public.vote_candidates for delete to authenticated
using (exists (
  select 1 from public.votes v
  where v.id = vote_id and public.is_group_member(v.group_id)
));

create policy "vote_responses_select_members"
on public.vote_responses for select to authenticated
using (exists (
  select 1 from public.votes v
  where v.id = vote_id and public.is_group_member(v.group_id)
));

create policy "vote_responses_insert_self"
on public.vote_responses for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.votes v
    where v.id = vote_id
      and v.closed_at is null
      and public.is_group_member(v.group_id)
  )
);

create policy "vote_responses_update_self"
on public.vote_responses for update to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.votes v
    where v.id = vote_id
      and v.closed_at is null
      and public.is_group_member(v.group_id)
  )
);

create policy "vote_responses_delete_self"
on public.vote_responses for delete to authenticated
using (user_id = (select auth.uid()));

revoke all on table
  public.profiles,
  public.groups,
  public.group_members,
  public.places,
  public.place_memos,
  public.place_likes,
  public.plans,
  public.plan_members,
  public.plan_items,
  public.plan_item_reactions,
  public.votes,
  public.vote_candidates,
  public.vote_responses
from anon;

grant select, insert, update, delete on table
  public.profiles,
  public.groups,
  public.group_members,
  public.places,
  public.place_memos,
  public.place_likes,
  public.plans,
  public.plan_members,
  public.plan_items,
  public.plan_item_reactions,
  public.votes,
  public.vote_candidates,
  public.vote_responses
to authenticated;

commit;
