create table person
(
    steam_id bigint not null
        constraint person_pk
            primary key,
    patreon_user_id varchar default '' not null,
    permission_level integer default 0 not null,
    last_login timestamptz not null,
    created_on timestamptz not null,
    updated_on timestamptz not null
);

begin;

commit;