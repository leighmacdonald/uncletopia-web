begin;

create table steam_profile
(
    steam_id bigint not null
        constraint player_pk
            primary key
        constraint steam_profile_person_steam_id_fk
            references person
            on update restrict,
    communityvisibilitystate integer default 0 not null,
    profilestate integer not null,
    personaname text not null,
    profileurl text not null,
    avatar text not null,
    avatarmedium text not null,
    avatarfull text not null,
    avatarhash text not null,
    personastate integer not null,
    realname text not null,
    timecreated integer not null,
    loccountrycode text not null,
    locstatecode text not null,
    loccityid integer not null
);

create index idx_personaname_lower on steam_profile  (lower(personaname));

commit;