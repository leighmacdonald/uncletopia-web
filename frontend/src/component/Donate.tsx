import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { PlayerProfile } from '../api';
import { Button } from '@material-ui/core';
import { Link } from 'react-router-dom';

export interface Donation {
    player: PlayerProfile;
    amount: number;

}

export const Donate = () => {
    const clientId = 'KggPnKF9SidCjS4wLxRhCfbD7CGSjsry8LOu9lwDZZr1A5OCR1mDGSUOhpK4akGn';
    const redirUrl = 'https://ut.roto.su/patreon/callback';
    const state = '123';
    const link = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirUrl}&state=${state}`;
    return <>
        <Grid container>
            <Grid item xs>
                <Typography variant={'h3'} color={'primary'}>Patreon</Typography>
                <Button component={Link} to={{pathname: link}} target={"_parent"} color={'primary'}>Link your Patreon account</Button>
            </Grid>
        </Grid>
        <Grid container>
            <Grid item xs>

            </Grid>
        </Grid>
    </>;
};
