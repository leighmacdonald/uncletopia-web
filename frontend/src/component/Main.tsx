import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

//import { makeStyles } from '@material-ui/core/styles';
// const useStyles = makeStyles((theme) => ({
//     markdown: {
//         ...theme.typography.body2,
//         padding: theme.spacing(3, 0),
//     },
// }));

export default function Main() {
    //const classes = useStyles();

    return (
        <Grid item xs={12} md={8}>
            <Typography variant='h6' gutterBottom>
                {'TITLEEE'}
            </Typography>
            <Divider />
        </Grid>
    );
}
