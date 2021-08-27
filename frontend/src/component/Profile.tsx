import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import createStyles from '@material-ui/styles/createStyles/createStyles';
import makeStyles from '@material-ui/styles/makeStyles/makeStyles';
import { Person } from '../api';
import { useCurrentUserCtx } from '../ctx/CurrentUserCtx';
import { Theme } from '@material-ui/core';

export interface Donation {
    player: Person;
    amount: number;
    server_location: string;
}

const useStyles = makeStyles((_theme: Theme) =>
    createStyles({
        rowBody: {
            width: '100%',
            flexWrap: 'nowrap',
            alignItems: 'center',
            justifyContent: 'center'
        }
    })
);

export const UserProfileHeader = () => {
    const { currentUser } = useCurrentUserCtx();
    const classes = useStyles();

    return (
        <Grid container className={classes.rowBody} spacing={6} justifyContent={'center'}>
            <Grid item xs={6} >
                <Typography variant={'h3'} color={'primary'} align={'center'}>Hello, {currentUser.steam_profile.personaname}!</Typography>
            </Grid>
            <Grid item xs={6}>
                <Grid container className={classes.rowBody} spacing={3}>
                    <Grid item xs>

                    </Grid>
                </Grid>
            </Grid>
        </Grid>
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
