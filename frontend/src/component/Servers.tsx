import React, { useCallback, useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { fetchServers, Server } from '../api';
// @ts-ignore
//import * as x from 'leaflet/dist/leaflet.css';
import { ServerMap } from './ServerMap';
import { LatLngLiteral } from 'leaflet';
import { MapStateCtx, useMapStateCtx } from '../ctx/MapStateCtx';
import { ServerQueue } from './ServerQueue';
import { ServerFilters } from './ServerFilters';
import Link from '@material-ui/core/Link';
import CheckIcon from '@material-ui/icons/Check';
import { Flag } from './Flag';
import { ButtonGroup, LinearProgress, LinearProgressProps } from '@material-ui/core';
import sum from 'lodash-es/sum';
import Box from '@material-ui/core/Box';
import { getDistance } from '../geo';

interface ServerRowProps {
    server: Server;
    onClick: () => void;
    showDetails: boolean;
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        padding: theme.spacing(1),
        marginBottom: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        paddingRight: theme.spacing(0)
    },
    item: {
        // paddingBottom: 0

    },
    h1: { textAlign: 'left', fontSize: 20, marginBottom: 0 },
    h2: { textAlign: 'center', fontSize: 16, marginBottom: 0 },
    flag: {
        maxHeight: '20px',
        width: '40px',
        verticalAlign: 'middle',
        paddingRight: theme.spacing(0),
        display: 'inline-block'
    },
    rowBody: {
        width: '100%',
        height: '24px',
        flexWrap: 'nowrap',
        alignItems: 'center'
        // justifyContent: 'center'
    },
    stats: {
        width: '100%',
        flexWrap: 'nowrap',
        alignItems: 'center'
        // justifyContent: 'center'
    },
    statsText: {
        textAlign: 'center', fontSize: 20, marginBottom: 0
    },
    button: {
        backgroundColor: 'rgb(44,91,17)',
        width: '100%',
        height: '100%',
        '&:hover': {
            backgroundColor: 'rgb(74,154,28)'
        }
    }
}));

const ServerRow = ({ server }: ServerRowProps) => {
    const classes = useStyles();
    const [copied, setCopied] = useState<boolean>(false);
    const players = server?.a2s?.Players || 0;
    const maxPlayers = server?.a2s?.MaxPlayers || 32;
    const [showPlayers, setShowPlayers ] = useState<boolean>(false);
    return <Paper className={classes.root} style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }} onClick={() => {
        setShowPlayers(!showPlayers)
    }}>
        <Grid container className={classes.rowBody}>
            {/*<Grid item md={1} sm={false} className={classes.item}>*/}
            {/*    <Flag countryCode={server.cc} />*/}
            {/*</Grid>*/}
            <Grid item md={5} sm={12} className={classes.item}>
                <Flag countryCode={server.cc} />
                <Typography variant={'h1'} className={classes.h1} gutterBottom={false} style={
                    {display: 'inline-block', paddingLeft: "10px"}}>
                    {server.name_long}
                </Typography>
                {/*<Button onClick={onClick}>Players</Button>*/}
            </Grid>
            <Grid item md={2} className={classes.item}>
                <Typography variant={'h2'} className={classes.h2}
                            gutterBottom={false}>{server.a2s?.Map || ''}</Typography>
            </Grid>
            <Grid item md={2} className={classes.item}>
                <Typography variant={'h2'}
                            className={classes.h2}
                            gutterBottom={false}>{Math.min(players, maxPlayers)} / {maxPlayers}</Typography>
            </Grid>
            <Grid item md={3} className={classes.item}>
                <ButtonGroup fullWidth>
                    <Button className={classes.button} onClick={() => {
                        navigator.clipboard.writeText(`connect ${server.host}:${server.port}`).then(() => {
                                setCopied(true), () => setCopied(false);
                            }
                        );
                    }
                    }>Copy {copied && <CheckIcon />}</Button>
                    <Link component={Button} href={`steam://connect/${server.host}:${server.port}`} color={'inherit'}
                          style={{ textDecoration: 'none' }}
                          className={classes.button}>Connect</Link>
                </ButtonGroup>

            </Grid>
            {/*{showDetails && <Grid item xs={12}>*/}
            {/*    <Typography variant={'h2'}>Selected</Typography>*/}
            {/*</Grid>}*/}
        </Grid>
    </Paper>;
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

export const ServerStats = () => {
    const classes = useStyles();
    const { servers } = useMapStateCtx();
    const cap = servers.length * 24;
    const use = sum(servers.map(value => value?.a2s?.Players || 0));
    const regions = servers.reduce((acc, cv) => {
        if (!acc.hasOwnProperty(cv.region)) {
            acc[cv.region] = [];
        }
        // @ts-ignore
        acc[cv.region].push(cv);
        return acc;
    }, {} as Record<string, Server[]>);
    const keys = Object.keys(regions)
    keys.sort()
    return <Paper style={{ marginBottom: '1rem', marginTop: "1rem" }}>
        <Grid container justifyContent='center' spacing={3}>
            <Grid item xs>
                <Grid container spacing={3} style={{paddingLeft: "10px"}}>
                    <Grid item xs={3}>
                        <Typography className={classes.statsText} style={{ display: 'inline' }}
                                    variant={'subtitle1'}
                                    align={'center'}>Global: {use} / {cap}</Typography>
                        <LinearProgressWithLabel value={Math.round((use / cap) * 100)} />
                    </Grid>
                    {keys.map((v) => {
                        const pSum = sum((regions.hasOwnProperty(v) && regions[v] || []).map((value => value?.a2s?.Players || 0)));
                        const pMax = sum((regions.hasOwnProperty(v) && regions[v] || []).map((value => value?.a2s?.MaxPlayers || 24)));
                        return <Grid item xs={3} key={`stat-${v}`}>
                            <Typography className={classes.statsText} style={{ display: 'inline' }}
                                        variant={'subtitle1'}
                                        align={'center'}>{v}: {pSum} / {pMax}</Typography>
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
    const [selectedRow, setSelectedRow] = useState<string>("")
    if (selectedServers.length === 0) {
        return <Grid container>
            <Grid item xs={12}>
                <Typography variant={'h1'}>No servers :'(</Typography>
            </Grid>
        </Grid>;
    }
    return <Grid container>
        <Grid item xs={12}>
            {(selectedServers || []).
            map(srv => {
                return {...srv, "distance": getDistance(pos, { lat: srv.latitude, lng: srv.longitude })}
            }).
            sort((a, b) => {
                // Sort by position if we have a non-default position.
                // otherwise sort by server name
                if (pos.lat !== 42.434719) {
                    if (a.distance > b.distance) { return 1; }
                    if (a.distance < b.distance) { return -1; }
                    return 0;
                }
                return ('' + a.name_short).localeCompare(b.name_short)
            }).
            map(server => <ServerRow showDetails={selectedRow == server.name_short} onClick={() => {
                setSelectedRow(server.name_short)
            }} key={`server-${server.host}-${server.port}`}
                                                              server={server} />)}
        </Grid>
    </Grid>;
};



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
            const s = (await fetchServers() || [])
            setServers(s);
            setSelectedServers(s);
        } catch (e) {
            console.log(`Failed to load servers: ${e}`)
        }
    }, [pos, setServers, setSelectedServers]);

    // Sort by distance once we get a position
    useEffect(() => {
        setServers(servers)
    }, [pos])

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
        </MapStateCtx.Provider>
    </>;
};

