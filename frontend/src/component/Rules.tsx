import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles((_theme) => ({
    title: {
        fontSize: "155%",
        textAlign: 'center'
    },
    body: {
        fontSize: "1 rem",
        textAlign: 'center'
    }
}));

export const Rules = () => {
    const classes = useStyles();
    const rules = [
        ['No random crits', 'No weapon can randomly crit on Uncletopia. This makes for more fair player interaction and encourages skill.'],
        ['No random bullet spread', 'No random bullet spread\n' +
        '\n' +
        'Shotguns and Scatter Guns have fixed spread patterns. This makes the damage output of these weapons consistent.'],
        ['Class limits (3)', 'Each team can only have three of one class at a time. This makes team composition more balanced.'],
        ['High Ping Limit', 'If you have more than 150 ping for more than 1 minute, you will be automatically kicked from the server. This makes it so players will not have to play against latent opponents. If there are less than 20 players on the server, this rule does not apply to help with seeding.'],
        ['Sprays disabled', 'Sprays are not able to be seen on Uncletopia. This is to prevent inappropriate images from being displayed.'],
        ['Teammate player collision disabled', 'When you bump into another teammate on Uncletopia, neither of your respective player models will be moved. This is to prevent griefing.'],
        ['Round start explosive jumping enabled', 'In Valve servers, you are unable to explosive jump at the beginning of the round. In Uncletopia, you are able to do so. This is to encourage skillful rollouts.'],
        ['Voting to change map enabled', 'RTV (rock the vote) is a sourcemod plugin that allows players to initiate server-wide vote to change the map. Type either “!rtv” or “rtv” to vote.'],
        ['Voting to scramble teams enabled (thanks HiGPS!)', 'You can type !vscramble to vote to scramble the teams after the round ends. At least 8 players need to vote in order to scramble teams.'],
        ['sv_pure 1 enabled', 'You are able to use custom first-person viewmodel animations on Uncletopia.'],
        ['No bots (except that scout running at you)', 'Uncletopia will never seed the server with player bots. Cheater bots only really join Casual Mode, so it is extremely unlikely you will encounter them in community servers. If you wish to report a player for suspicious activity, please ping an Uncletopia mod on Discord.']

    ];
    return <>
        <Grid container spacing={3}>
            <Grid item xs={12}>
                {rules.map((r, i) => <Paper key={i} style={{  marginBottom: "20px", padding: "1rem"}}>
                    <Typography className={classes.title} variant={'h6'}>{r[0]}</Typography>
                    <Typography className={classes.body} variant={'body1'}>{r[1]}</Typography>
                </Paper>)}
            </Grid>
        </Grid>
    </>;
};