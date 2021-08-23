begin;

create table _version
(
    name varchar,
    version int
);
create unique index version_uidx on _version (name) ;

insert into _version (name, version) values ('database', 0);

create extension if not exists postgis;

commit;