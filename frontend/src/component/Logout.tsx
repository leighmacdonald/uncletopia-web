import { PermissionLevel } from '../api';
import { Navigate } from 'react-router-dom';
import React from 'react';
import { GuestProfile, useCurrentUserCtx } from '../ctx/CurrentUserCtx';

export const Logout = (): JSX.Element => {
    const {setCurrentUser} = useCurrentUserCtx();
    localStorage.setItem('token', '');
    localStorage.setItem('permission_level', `${PermissionLevel.Guest}`);
    setCurrentUser(GuestProfile);
    return <Navigate to={'/'} />;
};