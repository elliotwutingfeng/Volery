create table if not exists
    profiles_arch_official (
        profile_id uuid,
        volery_id bigint,
        constraint fk_profile_id foreign key (profile_id) references profiles (id),
        constraint fk_volery_id foreign key (volery_id) references arch_official (volery_id)
    );