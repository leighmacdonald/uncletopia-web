import React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Person } from '../api';
import { useCurrentUserCtx } from '../ctx/CurrentUserCtx';
import { styled } from '@mui/material/styles';

export interface Donation {
    player: Person;
    amount: number;
    server_location: string;
}

const StyledRowBody = styled(Grid)(({}) => ({
    width: '100%',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center'
}))

export const UserProfileHeader = () => {
    const { currentUser } = useCurrentUserCtx();

    return (
        <StyledRowBody container spacing={6} justifyContent={'center'}>
            <Grid item xs={6} >
                <Typography variant={'h3'} color={'primary'} align={'center'}>Hello, {currentUser.steam_profile.personaname}!</Typography>
            </Grid>
            <Grid item xs={6}>
                <StyledRowBody container spacing={3}>
                    <Grid item xs>

                    </Grid>
                </StyledRowBody>
            </Grid>
        </StyledRowBody>
    );
};

export const UserProfile = () => <>
    <Paper>
        <UserProfileHeader />
    </Paper>
    <Grid container>
        <Grid item xs>

        </Grid>
    </Grid>
</>
