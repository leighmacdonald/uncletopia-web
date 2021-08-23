import { createContext, useContext } from 'react';
import { communityVisibilityState, PermissionLevel, Person } from '../api';
import { noop } from 'lodash-es';

export const GuestProfile: Person = {
    created_on: '',
    last_login: '',
    updated_on: '',
    steam_id: '',
    patreon_user_id: '',
    permission_level: PermissionLevel.Guest,
    friends: [],
    steam_profile: {
        personaname: 'Guest',
        avatar: '',
        avatarfull: '',
        avatarhash: '',
        avatarmedium: '',
        communityvisibilitystate: communityVisibilityState.Private,
        loccityid: 0,
        loccountrycode: '',
        locstatecode: '',
        personastate: 0,
        personastateflags: 0,
        primaryclanid: '',
        profilestate: 0,
        profileurl: '',
        realname: '',
        steamid: '',
        timecreated: 0
    }
};

export type CurrentUser = {
    currentUser: Person;
    setCurrentUser: (profile: Person) => void;
};

export const CurrentUserCtx = createContext<CurrentUser>({
    currentUser: GuestProfile,
    setCurrentUser: noop
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useCurrentUserCtx = () => useContext(CurrentUserCtx);