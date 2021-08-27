import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import makeStyles from '@material-ui/core/styles/makeStyles';

function Copyright() {
    return (
        <Typography variant='body2' color='textSecondary' align='center'>
            <Link color='inherit' href='https://uncletopia.com/'>
                &copy; Copyright Uncletopia
            </Link>{' '}
            {new Date().getFullYear()}
        </Typography>
    );
}

const useStyles = makeStyles((theme) => ({
    footer: {
        marginTop: theme.spacing(3),
        padding: theme.spacing(6, 0)
    }
}));

export default function Footer() {
    const classes = useStyles();
    return (
        <footer className={classes.footer}>
            <Container maxWidth='lg'>
                <Copyright />
            </Container>
        </footer>
    );
}
