import React, { useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { fetchServers, Server } from '../api';
// @ts-ignore
//import * as x from 'leaflet/dist/leaflet.css';
import { ServerMap } from './ServerMap';
import { LatLngLiteral } from 'leaflet';
import { MapStateCtx, useMapStateCtx } from '../ctx/MapStateCtx';
import { ServerQueue } from './ServerQueue';
import { ServerFilters } from './ServerFilters';
import CheckIcon from '@mui/icons-material/Check';
import { Flag } from './Flag';
import ButtonGroup from '@mui/material/ButtonGroup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
import sum from 'lodash-es/sum';
import Box from '@mui/material/Box';
import { getDistance } from '../geo';
import Link from '@mui/material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';

interface ServerRowProps {
    server: Server;
    onClick: () => void;
    showDetails: boolean;
}

const StyledServerRow = styled(Paper)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingRight: theme.spacing(0),
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0
}));

const StyledServerRowGrid = styled(Grid)(({}) => ({
    width: '100%',
    height: '24px',
    flexWrap: 'nowrap',
    alignItems: 'center'
}));

const StyledServerGridCol = styled(Grid)(({}) => ({}));

const StyledServerNameText = styled(Typography)(({}) => ({
    textAlign: 'left',
    fontSize: 20,
    marginBottom: 0,
    display: 'inline-block',
    paddingLeft: '10px'
}));

const StyledServerDetailText = styled(Typography)(({}) => ({
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 0
}));

// const StyledServerLink = styled(Button, {})(({}) => ({
//     backgroundColor: 'rgb(44,91,17)',
//     width: '100%',
//     height: '100%',
//     '&:hover': {
//         backgroundColor: 'rgb(74,154,28)'
//     }
// }));

const ServerRow = ({ server }: ServerRowProps) => {
    const [copied, setCopied] = useState<boolean>(false);
    const players = server?.players.length || 0;
    const maxPlayers = server?.players_max || 32;
    const [showPlayers, setShowPlayers] = useState<boolean>(false);
    return <StyledServerRow onClick={() => {
        setShowPlayers(!showPlayers);
    }}>
        <StyledServerRowGrid container>
            {/*<Grid item md={1} sm={false} className={classes.item}>*/}
            {/*    <Flag countryCode={server.cc} />*/}
            {/*</Grid>*/}
            <StyledServerGridCol item md={5} sm={12}>
                <Flag countryCode={server.cc} />
                <StyledServerNameText variant={'h1'} gutterBottom={false}>
                    {server.server_name_long}
                </StyledServerNameText>
                {/*<Button onClick={onClick}>Players</Button>*/}
            </StyledServerGridCol>
            <StyledServerGridCol item md={2}>
                <StyledServerDetailText variant={'h2'}
                                        gutterBottom={false}>{server.current_map || ''}</StyledServerDetailText>
            </StyledServerGridCol>
            <StyledServerGridCol item md={2}>
                <StyledServerDetailText variant={'h2'}
                                        gutterBottom={false}>{Math.min(players, maxPlayers)} / {maxPlayers}</StyledServerDetailText>
            </StyledServerGridCol>
            <StyledServerGridCol item md={3}>
                <ButtonGroup fullWidth>
                    <IconButton component={'span'} title={'Copy to clipboard'} onClick={() => {
                        navigator.clipboard.writeText(`connect ${server.address}:${server.port}`).then(() => {
                                setCopied(true), () => setCopied(false);
                            }
                        );
                    }
                    }>
                        {copied ? <CheckIcon /> : <ContentCopyIcon />}
                    </IconButton>
                    <Button
                        component={Link}
                        href={`steam://connect/${server.address}:${server.port}`}
                        color={'primary'}
                        variant='contained'
                        style={{ textDecoration: 'none' }}
                    >Connect</Button>
                </ButtonGroup>

            </StyledServerGridCol>
            {/*{showDetails && <Grid item xs={12}>*/}
            {/*    <Typography variant={'h2'}>Selected</Typography>*/}
            {/*</Grid>}*/}
        </StyledServerRowGrid>
    </StyledServerRow>;
};

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
    return (
        <Box display='flex' alignItems='center'>
            <Box width='100%' mr={1}>
                <LinearProgress variant='determinate' {...props} />
            </Box>
            <Box minWidth={35}>
                <Typography variant='body2' color='textSecondary'>{`${Math.round(props.value)}%`}</Typography>
            </Box>
        </Box>
    );
}

const StatsText = styled(Typography)(({}) => ({
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 0
}));

export const ServerStats = () => {
    const { servers } = useMapStateCtx();
    const cap = servers.length * 24;
    const use = sum(servers.map(value => value?.players.length || 0));
    const regions = servers.reduce((acc, cv) => {
        if (!acc.hasOwnProperty(cv.region)) {
            acc[cv.region] = [];
        }
        // @ts-ignore
        acc[cv.region].push(cv);
        return acc;
    }, {} as Record<string, Server[]>);
    const keys = Object.keys(regions);
    keys.sort();
    return <Paper style={{ marginBottom: '1rem', marginTop: '1rem' }}>
        <Grid container justifyContent='center' spacing={3}>
            <Grid item xs>
                <Grid container spacing={3} style={{ paddingLeft: '10px' }}>
                    <Grid item xs={3}>
                        <StatsText style={{ display: 'inline' }}
                                   variant={'subtitle1'}
                                   align={'center'}>Global: {use} / {cap}</StatsText>
                        <LinearProgressWithLabel value={Math.round((use / cap) * 100)} />
                    </Grid>
                    {keys.map((v) => {
                        const pSum = sum((regions.hasOwnProperty(v) && regions[v] || []).map((value => value?.players.length || 0)));
                        const pMax = sum((regions.hasOwnProperty(v) && regions[v] || []).map((value => value?.players_max || 24)));
                        return <Grid item xs={3} key={`stat-${v}`}>
                            <StatsText style={{ display: 'inline' }}
                                       variant={'subtitle1'}
                                       align={'center'}>{v}: {pSum} / {pMax}</StatsText>
                            <LinearProgressWithLabel value={Math.round((pSum / pMax) * 100)} />
                        </Grid>;
                    })}
                </Grid>
            </Grid>
        </Grid>

    </Paper>;
};

export const ServerList = () => {
    const { selectedServers, pos } = useMapStateCtx();
    const [selectedRow, setSelectedRow] = useState<string>('');
    if (selectedServers.length === 0) {
        return <Grid container>
            <Grid item xs={12}>
                <Typography variant={'h1'}>No servers :'(</Typography>
            </Grid>
        </Grid>;
    }
    return <Grid container>
        <Grid item xs={12}>
            {(selectedServers || []).map(srv => {
                return { ...srv, 'distance': getDistance(pos, { lat: srv.latitude, lng: srv.longitude }) };
            }).sort((a, b) => {
                // Sort by position if we have a non-default position.
                // otherwise sort by server name
                if (pos.lat !== 42.434719) {
                    if (a.distance > b.distance) {
                        return 1;
                    }
                    if (a.distance < b.distance) {
                        return -1;
                    }
                    return 0;
                }
                return ('' + a.server_name).localeCompare(b.server_name);
            }).map(server => <ServerRow showDetails={selectedRow == server.server_name} onClick={() => {
                setSelectedRow(server.server_name);
            }} key={`server-${server.address}-${server.port}`}
                                        server={server} />)}
        </Grid>
    </Grid>;
};

export default function ServerNotice() {
    return (
        <Card style={{ marginBottom: '0.5rem' }}>
            <CardContent>
                <Typography color='textSecondary' variant={'h6'}>Singapore Notice</Typography>
                <Typography color='textSecondary' variant={'body1'}>
                    Singapore servers are currently experiencing on-going issues with upstream filtering. The servers
                    are in fact alive, but some users may have trouble connecting using the website or server browser.
                    You can still connect manually via console by using the copy button and pasting it into your TF2
                    console.
                </Typography>
            </CardContent>
        </Card>
    );
}

export const Servers = () => {
    const [servers, setServers] = useState<Server[]>([]);
    const [pos, setPos] = useState<LatLngLiteral>({ lat: 42.434719, lng: 42.434719 });
    const [customRange, setCustomRange] = useState<number>(500);
    const [selectedServers, setSelectedServers] = useState<Server[]>([]);
    const [filterByRegion, setFilterByRegion] = useState<boolean>(false);
    const [showOpenOnly, setShowOpenOnly] = useState<boolean>(false);
    const [selectedRegion, setSelectedRegion] = useState<string[]>(['any']);

    const loadServers = useCallback(async () => {
        try {
            const s = (await fetchServers() || []);
            setServers(s);
            setSelectedServers(s);
        } catch (e) {
            console.log(`Failed to load servers: ${e}`);
        }
    }, [pos, setServers, setSelectedServers]);

    // Sort by distance once we get a position
    useEffect(() => {
        setServers(servers);
    }, [pos]);

    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        loadServers();
        setInterval(loadServers, 10000);
    }, []);

    return <>
        <MapStateCtx.Provider value={{
            servers, setServers, customRange, setCustomRange,
            pos, setPos, selectedServers, setSelectedServers,
            filterByRegion, setFilterByRegion, showOpenOnly,
            setShowOpenOnly, selectedRegion, setSelectedRegion

        }}>
            <ServerMap />
            <ServerFilters />
            <ServerQueue />
            <ServerStats />
            <ServerList />
            <ServerNotice />
        </MapStateCtx.Provider>
    </>;
};

