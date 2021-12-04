// How to alias this?
import { Link as LinkMUI } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Badge from '@material-ui/core/Badge';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { forwardRef, useMemo, useState } from 'react';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import AnnouncementIcon from '@material-ui/icons/Announcement';
import SettingsIcon from '@material-ui/icons/Settings';
import MoreIcon from '@material-ui/icons/More';
import { Link } from 'react-router-dom';
import { useCurrentUserCtx } from '../ctx/CurrentUserCtx';
// @ts-ignore
import SteamLogo from '../images/steam_login_sm.png';
import { PermissionLevel } from '../api';

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

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex'
    },
    offset: theme.mixins.toolbar,
    grow: {
        flexGrow: 1
    },
    sectionDesktop: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'flex'
        }
    },
    sectionMobile: {
        display: 'flex',
        [theme.breakpoints.up('md')]: {
            display: 'none'
        }
    },
    toolbar: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper
    },
    buttons: {
        // fontFamily: theme.typography.fontFamily,
        color: '#fde1c7'
    }
}));

//
// export const withRouter = (Component: any) => {
//     const Wrapper = (props: any) => {
//         const history = useHistory();
//
//         return (
//             <Component
//                 history={history}
//                 {...props}
//             />
//         );
//     };
//
//     return Wrapper;
// };

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

interface GLinkProps {
    icon?: string | JSX.Element;
    primary: string;
    to: string;
}

export const GLink = ({ primary, to }: GLinkProps): JSX.Element => {
    const classes = useStyles();
    const CustomLink = useMemo(() => {
        const f = forwardRef<HTMLAnchorElement>((linkProps, ref) => (
            <Link ref={ref} to={to} {...linkProps} />
        ));
        f.displayName = 'GLink';
        return f;
    }, [to]);
    return (
        <Button component={CustomLink} className={classes.buttons}>
            {primary}
        </Button>
    );
};

export function RenderMenuButton(link: HeaderLink) {
    return <GLink primary={link.title} to={link.url} />;
}

const TopBar = ({ history }: any): JSX.Element => {
    const classes = useStyles();
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

    const loadRoute = (route: string) => {
        history.push(route);
        handleProfileMenuClose();
        handleMobileMenuClose();
    };

    const renderLinkedMenuItem = (
        text: string,
        route: string,
        icon: JSX.Element
    ) => (
        <MenuItem onClick={() => loadRoute(route)}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={text} />
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
                <Toolbar variant={'regular'} className={classes.toolbar} disableGutters={false}>
                    <Typography variant='h3' color={'primary'} style={{ marginRight: '1rem' }}>
                        Uncletopia
                    </Typography>
                    {links.map(props => <RenderMenuButton key={`m-${props.title}`} {...props} />)}
                    <div className={classes.grow} />
                    {currentUser.steam_id && currentUser?.steam_profile &&
                    <Button
                        aria-label='account of current user'
                        aria-controls='menu-appbar'
                        aria-haspopup='true'
                        onClick={handleUserMenu}
                        className={classes.buttons}
                    >
                        <Avatar alt={currentUser?.steam_profile?.personaname} src={currentUser?.steam_profile.avatar} />
                    </Button>
                    }
                    <div className={classes.sectionDesktop}>
                        {currentUser.steam_id == '' &&
                        <LinkMUI component={Button} href={steamOIDUrl()}>
                            <img
                                src={SteamLogo}
                                alt={'Steam Login'}
                            />
                        </LinkMUI>
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
                    </div>
                    <div className={classes.sectionMobile}>
                        <IconButton
                            aria-label='show more'
                            aria-controls={mobileMenuId}
                            aria-haspopup='true'
                            onClick={handleMobileMenuOpen}
                            color='inherit'
                        >
                            <MoreIcon />
                        </IconButton>
                    </div>
                </Toolbar>
            </AppBar>
            <div className={classes.offset} />
            {renderMobileMenu}
            {renderProfileMenu}
        </>
    );
};

export const Header = () => {
    return (
        <Paper style={{ marginBottom: '2rem' }}>
            <Grid container>
                <Grid item md={12}>
                    <TopBar />
                </Grid>
            </Grid>
        </Paper>
    );
};