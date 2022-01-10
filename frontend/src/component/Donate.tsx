import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import { fetchServers, Person } from '../api';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import { styled } from '@mui/material/styles';
import { useCurrentUserCtx } from '../ctx/CurrentUserCtx';
import sortedUniq from 'lodash-es/sortedUniq';

export interface Donation {
    player: Person;
    amount: number;
    server_location: string;
}

const StyledDonationSelector = styled(Paper)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(6),
    padding: theme.spacing(3)
}));

const StyledDonationContainer = styled(Grid)(({ theme }) => ({
    padding: theme.spacing(3)
}));

const StyledDonationGrid = styled(Grid)(({}) => ({
    width: '100%',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center'
}));

const StyledTierRow = styled(Grid)(({ theme }) => ({
    marginBottom: theme.spacing(6),
    padding: theme.spacing(2)
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    margin: theme.spacing(1),
    minWidth: 120,
    width: '100%',
    flexWrap: 'nowrap',
    align: 'center',
    justifyContent: 'center'
}));

const StyledButton = styled(Button)(({ theme }) => ({
    width: '100%',
    flexWrap: 'nowrap',
    align: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.default
    // '&:hover': {
    //     backgroundColor: theme.palette.text.primary
    // }
}));

const StyledDonationBody = styled(Typography)(({ theme }) => ({
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
}));

export const DonationPanel = () => {
    const { currentUser } = useCurrentUserCtx();
    const [servers, setServers] = useState<string[]>(['no-preference']);
    const [selectedServer] = useState<string>('no-preference');
    //const clientId = 'KggPnKF9SidCjS4wLxRhCfbD7CGSjsry8LOu9lwDZZr1A5OCR1mDGSUOhpK4akGn';
    //const redirUrl = `${window.location.protocol}//${window.location.hostname}/patreon/callback`;
    //const state = `${localStorage.getItem('token')}----${selectedServer}`;
    //const link = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirUrl}&state=${state}`;
    //const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    //    setSelectedServer(event.target.value as string);
    //};
    useEffect(() => {
        const fn = async () => {
            try {
                const s = await fetchServers();
                setServers(sortedUniq(s.map(value => {
                    const va = value.server_name.split('-');
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
    return <StyledDonationSelector>
        <StyledDonationGrid container spacing={6}>
            <Grid item xs={6}>
                <Typography variant={'h3'} color={'secondary'}>Donate ❤️</Typography>
            </Grid>
            <Grid item xs={6}>
                <StyledDonationGrid container spacing={3}>
                    {currentUser.steam_id === '' &&
                    <Grid item xs>
                        <Typography variant={'h6'} align={'right'}>Please login before linking your patreon
                            account</Typography>
                    </Grid>}
                    {currentUser.steam_id !== '' && <Grid item xs>
                        <Grid item xs>
                            <StyledFormControl>

                                <Select
                                    labelId='donor-selected-server-label'
                                    id='donor-selected-server'
                                    value={selectedServer}
                                    //onChange={handleChange}
                                >
                                    {['no-preference', ...servers].map((v) => <MenuItem value={v} key={v}>
                                        <em>{v}</em>
                                    </MenuItem>)}
                                </Select>
                                <FormHelperText>Select your home server</FormHelperText>
                            </StyledFormControl>
                        </Grid>
                        <Grid item xs>
                            {/*<StyledButton component={Link} color={'secondary'}*/}
                            {/*        to={{ pathname: link }}*/}
                            {/*        target={'_parent'}*/}
                            {/*>Link your*/}
                            {/*    Patreon*/}
                            {/*    account</StyledButton>*/}
                        </Grid>
                    </Grid>
                    }
                </StyledDonationGrid></Grid>
        </StyledDonationGrid>
    </StyledDonationSelector>;

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
    return (
        <Paper>
            <StyledDonationContainer container>
                <Grid item xs={12}>
                    <Typography variant={'h3'} style={{ marginBottom: '1rem' }}>{tier.title}</Typography>
                    <Typography variant={'h6'} style={{ marginBottom: '1rem' }}>{tier.sub_title}</Typography>
                    <img src={tier.img} style={{ width: '100%' }} />
                    <StyledDonationBody variant={'body2'}>{tier.body}</StyledDonationBody>
                    <List component='nav' aria-label='main mailbox folders'>
                        {tier.benefits.map(value =>
                            <ListItem key={value}>
                                <ListItemIcon>
                                    <AcUnitIcon color={'secondary'} />
                                </ListItemIcon>
                                <ListItemText primary={value} />
                            </ListItem>
                        )}

                    </List>
                    <StyledButton onClick={() => {
                        window.location.replace(tier.url);
                    }}>{tier.price}</StyledButton>
                </Grid>
            </StyledDonationContainer>
        </Paper>
    );
};

export const Donate = () => {
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

        <StyledTierRow container spacing={3}>
            {tiers.map(tier => <Grid item lg={4} sm={12} md={6} key={tier.title}><DonationTier tier={tier} /></Grid>)}
        </StyledTierRow>

        <Paper>
            <Grid container>
                <Grid item xs>
                    <StyledDonationBody variant={'body1'} align={'center'}>
                        Please note that our donation system is created in a manner that offers zero in-game benefits.
                        We
                        feel that such offerings detract from the overall experience for everyone.
                    </StyledDonationBody>
                </Grid>
            </Grid>
        </Paper>
    </>;
};

