create table if not exists
    profiles_arch_official (
        profile_id uuid,
        volery_id bigint,
        primary key (profile_id, volery_id),
        constraint fk_profile_id foreign key (profile_id) references profiles (id),
        constraint fk_volery_id foreign key (volery_id) references arch_official (volery_id)
    );

alter table profiles_arch_official enable row level security;

create policy "Users can insert into own list of favorite arch_official repos" on profiles_arch_official for insert
with
    check (auth.uid () = profile_id);

create policy "Users can update own list of favorite arch_official repos" on profiles_arch_official for
update using (auth.uid () = profile_id);

create policy "Users can delete from own list of favorite arch_official repos" on profiles_arch_official for delete using (auth.uid () = profile_id);