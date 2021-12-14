import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreIcon from '@mui/icons-material/More';
import { useCurrentUserCtx } from '../ctx/CurrentUserCtx';
import { Link as RouterLink } from 'react-router-dom';
// @ts-ignore
import SteamLogo from '../images/steam_login_sm.png';
import { PermissionLevel } from '../api';
import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

export interface HeaderLink {
    title: string;
    url: string;
    submenu?: HeaderLink[];
}

const links: HeaderLink[] = [
    { title: 'Home', url: '/' },
    { title: 'Servers', url: '/servers' },
    { title: 'Demos', url: '/demos' },
    { title: 'Maps', url: '/maps' },
    { title: 'Rules', url: '/rules' },
    { title: 'Donate', url: '/donate' },
    { title: 'Discord', url: '/discord' }
];

export const steamOIDUrl = (): string => {
    // noinspection HttpUrlsUsage
    return `https://steamcommunity.com/openid/login?openid.ns=` + encodeURIComponent('http://specs.openid.net/auth/2.0') +
        '&openid.mode=checkid_setup' +
        '&openid.return_to=' + encodeURIComponent(`${window.location.protocol}//${window.location.hostname}/auth/callback?return_url=${window.location.pathname}`) +
        `&openid.realm=` + encodeURIComponent(`${window.location.protocol}//${window.location.hostname}`) +
        '&openid.ns.sreg=' + encodeURIComponent('http://openid.net/extensions/sreg/1.1') +
        '&openid.claimed_id=' + encodeURIComponent('http://specs.openid.net/auth/2.0/identifier_select') +
        '&openid.identity=' + encodeURIComponent('http://specs.openid.net/auth/2.0/identifier_select');
};

const StyledButton = styled(Button)(({}) => ({
    color: '#fde1c7'
}))

const StyledToolbar = styled(Toolbar)(({theme}) => ({
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper
}))

export function RenderMenuButton(link: HeaderLink) {
    return <Button component={RouterLink} to={link.url} color={'primary'}>{link.title}</Button>;
}

const Grow = () => <div style={{flexGrow: 1}} />

export interface ChildrenProps {
    children: React.ReactNode
}

const Desktop = ({children}: ChildrenProps) =>
    <div style={{
        display: 'none',
        // [theme.breakpoints.up('md')]: {
        //     display: 'flex'
        // }
    }}>{children}</div>

const Mobile = ({children}: ChildrenProps) =>
    <div style={{
        display: 'flex',
        // [theme.breakpoints.up('md')]: {
        //     display: 'none'
        // }
    }}>{children}</div>

const TopBar = (): JSX.Element => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [anchorProfileMenuEl, setAnchorProfileMenuEl] =
        useState<Element | null>(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
        useState<Element | null>(null);

    const isProfileMenuOpen = Boolean(anchorProfileMenuEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
    const { currentUser } = useCurrentUserCtx();

    const handleProfileMenuOpen = (event: React.MouseEvent) => {
        setAnchorProfileMenuEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleProfileMenuClose = () => {
        setAnchorProfileMenuEl(null);
        handleMobileMenuClose();
    };

    const handleMobileMenuOpen = (event: React.MouseEvent) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };

    const open = Boolean(anchorEl);

    const onMenuClick = () => {
        handleProfileMenuClose();
        handleMobileMenuClose();
    };

    const renderLinkedMenuItem = (
        text: string,
        route: string,
        icon: JSX.Element
    ) => (
        <MenuItem onClick={onMenuClick}>
            <Button component={RouterLink} to={route}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
            </Button>
        </MenuItem>
    );
    const handleUserMenu = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    const menuId = 'primary-menu';

    const renderProfileMenu = (
        <Menu
            anchorEl={anchorProfileMenuEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={menuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isProfileMenuOpen}
            onClose={handleProfileMenuClose}
        >
            {renderLinkedMenuItem('Profile', '/profile', <AccountCircleIcon />)}
            {renderLinkedMenuItem('Settings', '/settings', <SettingsIcon />)}

            <Divider light />
            {renderLinkedMenuItem('Logout', '/logout', <ExitToAppIcon />)}
        </Menu>
    );
    //const perms = parseInt(localStorage.getItem('permission_level') || '1');
    const mobileMenuId = 'primary-menu-mobile';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
        >
            <MenuItem>
                <IconButton
                    aria-label='show 0 new notifications'
                    color='inherit'
                >
                    <Badge badgeContent={0} color='secondary'>
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
                <p>Notifications</p>
            </MenuItem>
            <MenuItem onClick={handleProfileMenuOpen}>
                <IconButton
                    aria-label='account of current user'
                    aria-controls='primary-menu'
                    aria-haspopup='true'
                    color='inherit'
                >
                    <AccountCircleIcon />
                </IconButton>
                <p>Profile</p>
            </MenuItem>
        </Menu>
    );

    return (
        <>
            <AppBar position='fixed'>
                <StyledToolbar variant={'regular'}  disableGutters={false}>
                    <Typography variant='h3' color={'primary'} style={{ marginRight: '1rem' }}>
                        Uncletopia
                    </Typography>
                    {links.map(props => <RenderMenuButton key={`m-${props.title}`} {...props} />)}
                    <Grow />
                    {currentUser.steam_id && currentUser?.steam_profile &&
                    <StyledButton
                        aria-label='account of current user'
                        aria-controls='menu-appbar'
                        aria-haspopup='true'
                        onClick={handleUserMenu}
                    >
                        <Avatar alt={currentUser?.steam_profile?.personaname} src={currentUser?.steam_profile.avatar} />
                    </StyledButton>
                    }
                    <Desktop>
                        {currentUser.steam_id == '' &&
                        <Link component={Button} href={steamOIDUrl()}>
                            <img
                                src={SteamLogo}
                                alt={'Steam Login'}
                            />
                        </Link>
                        }
                        {currentUser.steam_id !== '' && (
                            <Menu
                                id='menu-appbar'
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right'
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right'
                                }}
                                open={open}
                                onClose={handleUserMenuClose}
                                title={currentUser?.steam_profile?.personaname || 'Guest'}
                            >
                                {renderLinkedMenuItem('Profile', '/profile', <AccountCircleIcon color={'secondary'} />)}
                                {currentUser?.steam_profile?.steamid != '' &&
                                currentUser.permission_level >= PermissionLevel.Admin &&
                                renderLinkedMenuItem('News', '/admin/news',
                                    <AnnouncementIcon color={'secondary'} />)}
                                {renderLinkedMenuItem('Logout', '/logout', <ExitToAppIcon color={'secondary'} />)}
                            </Menu>)}
                    </Desktop>
                    <Mobile>
                        <IconButton
                            aria-label='show more'
                            aria-controls={mobileMenuId}
                            aria-haspopup='true'
                            onClick={handleMobileMenuOpen}
                            color='inherit'
                        >
                            <MoreIcon />
                        </IconButton>
                    </Mobile>
                </StyledToolbar>
            </AppBar>
            {renderMobileMenu}
            {renderProfileMenu}
        </>
    );
};

export const Header = () => {
    return (
        <Paper style={{ marginBottom: '6rem' }}>
            <Grid container>
                <Grid item md={12}>
                    <TopBar />
                </Grid>
            </Grid>
        </Paper>
    );
};