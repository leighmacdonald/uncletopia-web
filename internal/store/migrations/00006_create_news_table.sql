begin;

create table news
(
    news_id serial
        constraint news_pk
            primary key,
    title varchar not null,
    body_md varchar not null,
    created_on timestamp with time zone not null,
    updated_on timestamp with time zone not null,
    publish_on timestamp with time zone not null,
    steam_id bigint not null
        constraint news_person_steam_id_fk
            references person
            on delete restrict
);

commit;