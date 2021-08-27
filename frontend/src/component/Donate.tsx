import React, { useEffect, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import AcUnitIcon from '@material-ui/icons/AcUnit';
import { fetchServers, Person } from '../api';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import { createStyles, Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useCurrentUserCtx } from '../ctx/CurrentUserCtx';
import makeStyles from '@material-ui/core/styles/makeStyles';
import sortedUniq from 'lodash-es/sortedUniq';

export interface Donation {
    player: Person;
    amount: number;
    server_location: string;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            padding: theme.spacing(2)
        },
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
            width: '100%',
            flexWrap: 'nowrap',
            align: 'center',
            justifyContent: 'center'
        },
        selectEmpty: {
            marginTop: theme.spacing(2)
        },
        button: {
            width: '100%',
            flexWrap: 'nowrap',
            align: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.background.default
            // '&:hover': {
            //     backgroundColor: theme.palette.text.primary
            // }
        },
        tierRow: {
            marginBottom: theme.spacing(6),
            padding: theme.spacing(2)
        },
        rowBody: {
            width: '100%',
            flexWrap: 'nowrap',
            alignItems: 'center',
            justifyContent: 'center'
        },
        donation_container: {
            padding: theme.spacing(3)
        },
        donation_selector: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(6),
            padding: theme.spacing(3)
        },
        donation_body: {
            padding: theme.spacing(3),
            textAlign: 'justify',
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
            fontFamily: [
                '"Helvetica Neue"',
                'Helvetica',
                'Roboto',
                'Arial',
                'sans-serif'
            ].join(',')
        }
    })
);

export const DonationPanel = () => {
    const { currentUser } = useCurrentUserCtx();
    const [servers, setServers] = useState<string[]>(['no-preference']);
    const classes = useStyles();
    const [selectedServer, setSelectedServer] = useState<string>('no-preference');
    const clientId = 'KggPnKF9SidCjS4wLxRhCfbD7CGSjsry8LOu9lwDZZr1A5OCR1mDGSUOhpK4akGn';
    const redirUrl = 'https://ut.roto.su/patreon/callback';
    const state = `${localStorage.getItem('token')}----${selectedServer}`;
    const link = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirUrl}&state=${state}`;
    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSelectedServer(event.target.value as string);
    };
    useEffect(() => {
        const fn = async () => {
            try {
                const s = await fetchServers();
                setServers(sortedUniq(s.map(value => {
                    const va = value.name_short.split('-');
                    if (va.length > 0) {
                        return va[0] as string;
                    }
                    return '';
                }).filter(value => value != '')));
            } catch (e) {

            }
        };
        // noinspection JSIgnoredPromiseFromCall
        fn();
    }, []);
    return <Paper className={classes.donation_selector}>
        <Grid container className={classes.rowBody} spacing={6}>
            <Grid item xs={6}>
                <Typography variant={'h3'} color={'secondary'}>Donate ❤️</Typography>
            </Grid>
            <Grid item xs={6}>
                <Grid container className={classes.rowBody} spacing={3}>
                    {currentUser.steam_id === '' &&
                    <Grid item xs>
                        <Typography variant={'h6'} align={'right'}>Please login before linking your patreon
                            account</Typography>
                    </Grid>}
                    {currentUser.steam_id !== '' && <Grid item xs>
                        <Grid item xs>
                            <FormControl className={classes.formControl}>

                                <Select
                                    labelId='donor-selected-server-label'
                                    id='donor-selected-server'
                                    value={selectedServer}
                                    onChange={handleChange}
                                >
                                    {['no-preference', ...servers].map((v) => <MenuItem value={v} key={v}>
                                        <em>{v}</em>
                                    </MenuItem>)}
                                </Select>
                                <FormHelperText>Select your home server</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs>
                            <Button className={classes.button} component={Link} color={'secondary'}
                                    to={{ pathname: link }}
                                    target={'_parent'}
                            >Link your
                                Patreon
                                account</Button>
                        </Grid>
                    </Grid>
                    }
                </Grid></Grid>
        </Grid>
    </Paper>;

};

interface DonationTier {
    title: string;
    img: string;
    sub_title: string;
    price: string;
    url: string;
    body: string;
    benefits: string[];
}

interface DonationTierProps {
    tier: DonationTier;
}

export const DonationTier = ({ tier }: DonationTierProps) => {
    const classes = useStyles();
    return (
        <Paper>
            <Grid container className={classes.donation_container}>
                <Grid item xs={12}>
                    <Typography variant={'h3'} style={{ marginBottom: '1rem' }}>{tier.title}</Typography>
                    <Typography variant={'h6'} style={{ marginBottom: '1rem' }}>{tier.sub_title}</Typography>
                    <img src={tier.img} style={{ width: '100%' }} />
                    <Typography variant={'body2'} className={classes.donation_body}>{tier.body}</Typography>
                    <List component='nav' aria-label='main mailbox folders'>
                        {tier.benefits.map(value =>
                            <ListItem>
                                <ListItemIcon>
                                    <AcUnitIcon color={'secondary'}/>
                                </ListItemIcon>
                                <ListItemText primary={value} />
                            </ListItem>
                        )}

                    </List>
                    <Button className={classes.button} onClick={() => {
                        window.location.replace(tier.url);
                    }}>{tier.price}</Button>
                </Grid>
            </Grid>
        </Paper>
    );
};

export const Donate = () => {
    const classes = useStyles();
    const benefits = ['Includes Discord benefits', 'Support Uncletopia!', 'Exclusive Discord Role!'];
    const tiers: DonationTier[] = [
        {
            title: 'Level 1 Supporter',
            img: 'https://c10.patreonusercontent.com/3/eyJ3Ijo0MDB9/patreon-media/p/reward/7602063/94d9796cd6744e61935c2976cd9a3c11/1.jpg?token-time=2145916800&token-hash=D0PlE4LhDx1qFgvSqf4dkQwnlMky75T3rpMb0TtElHk%3D',
            benefits: benefits,
            price: '5.00$ USD',
            body: 'If you link your Patreon and Discord accounts, you will be given an exclusive australium-colored role in the official Uncletopia Discord server... which will let everyone else know how cool you are.',
            sub_title: 'Thanks for keeping the lights on in Uncletopia!',
            url: 'https://www.patreon.com/join/uncletopia/checkout?rid=7602063'
        },
        {
            title: 'Level 2 Supporter',
            img: 'https://c10.patreonusercontent.com/3/eyJ3Ijo0MDB9/patreon-media/p/reward/7602084/3691b4822232477a924770cbe4941529/1.jpg?token-time=2145916800&token-hash=-8RuQmCNsYC0yeQ4agfSODtOYBNmD2wA-oyYJGp84XQ%3D',
            benefits: benefits,
            price: '10.00$ USD',
            body: 'If you link your Patreon and Discord accounts, you will be given an exclusive australium-colored role in the official Uncletopia Discord server... which will let everyone else know how awesome you are.',
            sub_title: 'Thanks for keeping the lights on in Uncletopia!',
            url: 'https://www.patreon.com/join/uncletopia/checkout?rid=7602084'
        },
        {
            title: 'Level 3 Supporter',
            img: 'https://c10.patreonusercontent.com/3/eyJ3Ijo0MDB9/patreon-media/p/reward/7602086/6607c3a50c3142bfa326d244bf2e459c/1.jpg?token-time=2145916800&token-hash=ilk450JzE53RS7DzyQlQNjHoOzaYdfTcShiSDyOHaRQ%3D',
            benefits: benefits,
            price: '20.00$ USD',
            body: 'If you link your Patreon and Discord accounts, you will be given an exclusive australium-colored role in the official Uncletopia Discord server... which will let everyone else know how flipping epic you are.',
            sub_title: 'Thanks for keeping the lights on in Uncletopia!',
            url: 'https://www.patreon.com/join/uncletopia/checkout?rid=7602086'
        }
    ];
    return <>
        <DonationPanel />

        <Grid container spacing={3} className={classes.tierRow}>
            {tiers.map(tier => <Grid item lg={4} sm={12} md={6} key={tier.title}><DonationTier tier={tier} /></Grid>)}
        </Grid>

        <Paper>
            <Grid container>
                <Grid item xs>
                    <Typography variant={'body1'} align={'center'} className={classes.donation_body}>
                        Please note that our donation system is created in a manner that offers zero in-game benefits.
                        We
                        feel that such offerings detract from the overall experience for everyone.
                    </Typography>
                </Grid>
            </Grid>
        </Paper>
    </>;
};

