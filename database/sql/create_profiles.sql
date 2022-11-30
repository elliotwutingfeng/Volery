create table
    profiles (
        id uuid references auth.users not null,
        updated_at timestamp with time zone,
        username text unique,
        avatar_url text,
        website text,
        primary key (id),
        unique (username),
        constraint username_length check (char_length(username) >= 3)
    );

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for
select
    using (true);

create policy "Users can insert their own profile." on profiles for insert
with
    check (auth.uid () = id);

create policy "Users can update own profile." on profiles for
update using (auth.uid () = id);

--Realtime
begin;

drop publication if exists supabase_realtime;

create publication supabase_realtime;

commit;

alter publication supabase_realtime
add table profiles;

--Avatar
insert into
    storage.buckets (id, name)
values
    ('avatars', 'avatars') ON conflict
do nothing;

create policy "Avatar images are publicly accessible." on storage.objects for
select
    using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar." on storage.objects for insert
with
    check (bucket_id = 'avatars');

create policy "Anyone can update an avatar." on storage.objects for
update
with
    check (bucket_id = 'avatars');