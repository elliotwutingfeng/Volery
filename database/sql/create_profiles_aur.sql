create table if not exists
    profiles_aur (
        profile_id uuid,
        volery_id bigint,
        primary key (profile_id, volery_id),
        constraint fk_profile_id foreign key (profile_id) references profiles (id),
        constraint fk_volery_id foreign key (volery_id) references aur (volery_id)
    );

alter table profiles_aur enable row level security;

create policy "Users can insert into own list of favorite aur repos" on profiles_aur for insert
with
    check (auth.uid () = profile_id);

create policy "Users can update own list of favorite aur repos" on profiles_aur for
update using (auth.uid () = profile_id);

create policy "Users can delete from own list of favorite aur repos" on profiles_aur for delete using (auth.uid () = profile_id);