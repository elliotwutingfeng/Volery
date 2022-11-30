-- drop table
--   if exists test_arch_official;
set
  statement_timeout to 900000;

-- 900 seconds timeout
set
  http.timeout_msec to 900000;

create table if not exists
  test_arch_official (
    volery_last_synced timestamptz DEFAULT current_timestamp,
    -- repository fields
    primary key (pkgname, repo, arch),
    -- do not use CONSTRAINT pkgname_repo_arch unique(pkgname, repo, arch),
    pkgname text,
    pkgbase text,
    repo text,
    arch text,
    pkgver text,
    pkgrel bigint,
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
    volery_id bigserial
  );

DO $$
declare api_endpoint text := 'https://archlinux.org/packages/search/json/?page=';
declare num_pages integer;
BEGIN
SELECT content::jsonb->'num_pages' into num_pages
from http_get(concat(api_endpoint, '1'));
for counter in 1..num_pages loop
insert into test_arch_official (
    pkgname,
    pkgbase,
    repo,
    arch,
    pkgver,
    pkgrel,
    epoch,
    pkgdesc,
    url,
    filename,
    compressed_size,
    installed_size,
    build_date,
    last_update,
    flag_date,
    maintainers,
    packager,
    groups,
    licenses,
    conflicts,
    provides,
    replaces,
    depends,
    optdepends,
    makedepends,
    checkdepends,
    volery_id
  )
select *
from jsonb_to_recordset(
    (
      select content::jsonb->'results'
      from http_get(concat(api_endpoint, counter))
    )
  ) as data(
    pkgname text,
    pkgbase text,
    repo text,
    arch text,
    pkgver text,
    pkgrel bigint,
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
    volery_id bigserial
  ) on conflict on constraint test_pkgname_repo_arch do
update
set pkgbase = excluded.pkgbase,
  pkgver = excluded.pkgver,
  pkgrel = excluded.pkgrel,
  epoch = excluded.epoch,
  pkgdesc = excluded.pkgdesc,
  url = excluded.url,
  filename = excluded.filename,
  compressed_size = excluded.compressed_size,
  installed_size = excluded.installed_size,
  build_date = excluded.build_date,
  last_update = excluded.last_update,
  flag_date = excluded.flag_date,
  maintainers = excluded.maintainers,
  packager = excluded.packager,
  groups = excluded.groups,
  licenses = excluded.licenses,
  conflicts = excluded.conflicts,
  provides = excluded.provides,
  replaces = excluded.replaces,
  depends = excluded.depends,
  optdepends = excluded.optdepends,
  makedepends = excluded.makedepends,
  checkdepends = excluded.checkdepends,
  volery_id = excluded.volery_id,
  volery_last_synced = now();
end loop;
END $$;