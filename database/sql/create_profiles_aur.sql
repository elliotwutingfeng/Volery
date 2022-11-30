create table if not exists
    profiles_aur (
        profile_id uuid,
        volery_id bigint,
        constraint fk_profile_id foreign key (profile_id) references profiles (id),
        constraint fk_volery_id foreign key (volery_id) references aur (volery_id)
    );