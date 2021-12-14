// import useWebSocket, { ReadyState } from 'react-use-websocket';
import React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useCurrentUserCtx } from '../ctx/CurrentUserCtx';
import { styled } from '@mui/material/styles';

const StyledQueueContainer = styled(Paper)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2)
}))

const StyledQueueButton = styled(Paper)(({ }) => ({
    backgroundColor: 'rgb(44,91,17)',
    width: '100%',
    height: '100%',
    '&:hover': {
        backgroundColor: 'rgb(74,154,28)'
    }
}))

export const ServerQueue = () => {
    const { currentUser } = useCurrentUserCtx();
    // const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket();
    if (!["76561198084134025", "76561198057999536"].includes(currentUser.steam_id)) {
        return <></>;
    }
    return <StyledQueueContainer>
        <Grid container>
            <Grid item xs={10}>
                <Typography variant={'h4'} align={'left'}>Queue</Typography>
            </Grid>
            <Grid item xs={2}>
                <StyledQueueButton>Start Queue</StyledQueueButton>
            </Grid>
        </Grid>
    </StyledQueueContainer>;
};