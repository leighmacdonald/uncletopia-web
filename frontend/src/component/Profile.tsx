import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { Person } from '../api';
import {
    createStyles, Paper,
    Theme
} from '@material-ui/core';
import { useCurrentUserCtx } from '../ctx/CurrentUserCtx';
import { makeStyles } from '@material-ui/core/styles';

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
