begin;

alter table public.places
add column google_place_id text;

alter table public.places
add constraint places_group_google_place_id_key
unique (group_id, google_place_id);

create index places_google_place_id_idx
on public.places (google_place_id)
where google_place_id is not null;

commit;
