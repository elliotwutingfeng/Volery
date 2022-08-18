create table if not exists public.aur (
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