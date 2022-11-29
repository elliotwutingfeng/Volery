-- drop table
--   if exists test_aur;
set statement_timeout to 900000;
-- 900 seconds timeout
set http.timeout_msec to 900000;
create table if not exists test_aur (
  volery_last_synced timestamptz DEFAULT current_timestamp,
  -- repository fields
  primary key ("ID", "Name"),
  -- do not use CONSTRAINT ID_Name unique("ID", "Name"),
  "ID" bigint,
  "Name" text,
  "PackageBaseID" bigint,
  "PackageBase" text,
  "Version" text,
  "Description" text,
  "URL" text,
  "NumVotes" bigint,
  "Popularity" float,
  "OutOfDate" bigint,
  -- timestamp in unix seconds
  "Maintainer" text,
  "Submitter" text,
  "FirstSubmitted" bigint,
  -- timestamp in unix seconds
  "LastModified" bigint,
  -- timestamp in unix seconds
  "URLPath" text,
  "Depends" text [],
  "MakeDepends" text [],
  "License" text [],
  "Keywords" text [],
  "Conflicts" text [],
  "Provides" text [],
  "OptDepends" text [],
  "CheckDepends" text [],
  "Replaces" text [],
  "Groups" text []
);
DO $$
declare api_endpoint text := 'https://aur.archlinux.org/packages-meta-ext-v1.json.gz';
BEGIN
insert into test_aur (
    "ID",
    "Name",
    "PackageBaseID",
    "PackageBase",
    "Version",
    "Description",
    "URL",
    "NumVotes",
    "Popularity",
    "OutOfDate",
    "Maintainer",
    "Submitter",
    "FirstSubmitted",
    "LastModified",
    "URLPath",
    "Depends",
    "MakeDepends",
    "License",
    "Keywords",
    "Conflicts",
    "Provides",
    "OptDepends",
    "CheckDepends",
    "Replaces",
    "Groups"
  )
select *
from jsonb_to_recordset(
    (
      select content::jsonb
      from http_get(api_endpoint)
    )
  ) as data(
    "ID" bigint,
    "Name" text,
    "PackageBaseID" bigint,
    "PackageBase" text,
    "Version" text,
    "Description" text,
    "URL" text,
    "NumVotes" bigint,
    "Popularity" float,
    "OutOfDate" bigint,
    -- timestamp in unix seconds
    "Maintainer" text,
    "Submitter" text,
    "FirstSubmitted" bigint,
    -- timestamp in unix seconds
    "LastModified" bigint,
    -- timestamp in unix seconds
    "URLPath" text,
    "Depends" text [],
    "MakeDepends" text [],
    "License" text [],
    "Keywords" text [],
    "Conflicts" text [],
    "Provides" text [],
    "OptDepends" text [],
    "CheckDepends" text [],
    "Replaces" text [],
    "Groups" text []
  ) on conflict on constraint test_ID_Name_PackageBaseID do
update
set PackageBase = excluded.PackageBase,
  Version = excluded.Version,
  Description = excluded.Description,
  URL = excluded.URL,
  NumVotes = excluded.NumVotes,
  Popularity = excluded.Popularity,
  OutOfDate = excluded.OutOfDate,
  Maintainer = excluded.Maintainer,
  Submitter = excluded.Submitter,
  FirstSubmitted = excluded.FirstSubmitted,
  LastModified = excluded.LastModified,
  URLPath = excluded.URLPath,
  Depends = excluded.Depends,
  MakeDepends = excluded.MakeDepends,
  License = excluded.License,
  Keywords = excluded.Keywords,
  Conflicts = excluded.Conflicts,
  Provides = excluded.Provides,
  OptDepends = excluded.OptDepends,
  CheckDepends = excluded.CheckDepends,
  Replaces = excluded.Replaces,
  Groups = excluded.Groups,
  volery_last_synced = now();
END $$;