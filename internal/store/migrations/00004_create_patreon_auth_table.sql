begin;

create table patreon_auth
(
    steam_id int8 not null,
    access_token varchar not null,
    refresh_token varchar not null,
    expires_in int4 not null,
    scope varchar not null,
    token_type varchar not null,
    created_on timestamptz not null,
    updated_on timestamptz not null,
    constraint patreon_auth_person__fk
        foreign key (steam_id) references person (steam_id)
);

create unique index patreon_auth_access_token_uindex
    on patreon_auth (access_token);

create unique index patreon_auth_steam_id_uindex
    on patreon_auth (steam_id);

create unique index patreon_auth_refresh_token_uindex
    on patreon_auth (refresh_token);

commit;