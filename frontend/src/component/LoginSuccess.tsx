import { PermissionLevel } from '../api';
import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * This is what the user gets redirected to after a successful steam openid redirect.
 */
export const LoginSuccess = (): JSX.Element => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token != null && token.length > 0) {
        localStorage.setItem('token', token);
        localStorage.setItem(
            'permission_level',
            `${
                urlParams.get('permission_level') ??
                PermissionLevel.Authenticated
            }`
        );
    }
    let next_url = urlParams.get('next_url');
    if (next_url == null || next_url == '') {
        next_url = '/';
    }
    return <Navigate to={next_url} />;
};