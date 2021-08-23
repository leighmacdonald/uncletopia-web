begin;

create table patreon_user
(
    patreon_user_id varchar not null
        constraint patreon_user_pk
            primary key,
    user_data jsonb not null,
    updated_on timestamp with time zone not null
);

commit;