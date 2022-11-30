create table if not exists
  public.arch_official (
    volery_last_synced timestamptz DEFAULT current_timestamp,
    -- repository fields
    primary key (pkgname, repo, arch),
    -- do not use CONSTRAINT pkgname_repo_arch unique(pkgname, repo, arch),
    pkgname text,
    pkgbase text,
    repo text,
    arch text,
    pkgver text,
    pkgrel text,
    epoch bigint,
    pkgdesc text,
    url text,
    filename text,
    compressed_size bigint,
    installed_size bigint,
    build_date timestamptz,
    last_update timestamptz,
    flag_date timestamptz,
    maintainers text[],
    packager text,
    groups text[],
    licenses text[],
    conflicts text[],
    provides text[],
    replaces text[],
    depends text[],
    optdepends text[],
    makedepends text[],
    checkdepends text[],
    volery_id bigserial UNIQUE
  );

alter table public.arch_official enable row level security;

create policy "Enable read access for all users" on public.arch_official for
select
  using (true);