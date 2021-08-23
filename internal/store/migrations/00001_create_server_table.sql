begin;

create table server
(
    server_id serial
        constraint server_pk
            primary key,
    name_short varchar not null,
    name_long varchar default ''::character varying not null,
    host varchar not null,
    port integer default 27015 not null,
    pass varchar default ''::character varying not null,
    region varchar not null,
    cc varchar(2) not null,
    is_enabled boolean default true not null,
    location geography(Point, 4326) not null
);

create unique index server_name_short_uindex
    on server (name_short);

commit;