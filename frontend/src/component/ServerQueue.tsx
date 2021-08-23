// import useWebSocket, { ReadyState } from 'react-use-websocket';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import React from 'react';
import Paper from '@material-ui/core/Paper/Paper';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        padding: theme.spacing(2),
        marginBottom: theme.spacing(2)
    },
    button: {
        backgroundColor: "rgb(44,91,17)",
        width: '100%',
        height: '100%',
        '&:hover': {
            backgroundColor: "rgb(74,154,28)"
        }
    },
}))

export const ServerQueue = () => {
    const classes = useStyles();
    // const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket();
    return <Paper className={classes.root}>
        <Grid container>
            <Grid item xs={10}>
                <Typography variant={'h4'} align={'left'}>Queue</Typography>
            </Grid>
            <Grid item xs={2}>
                <Button className={classes.button} variant={'contained'}>Start Queue</Button>
            </Grid>
        </Grid>
    </Paper>;
};