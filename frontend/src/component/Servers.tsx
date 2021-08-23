import React, { useEffect, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { fetchServers, Server } from '../api';
// @ts-ignore
import * as x from 'leaflet/dist/leaflet.css';
import { ServerMap } from './ServerMap';
import {
    Button,
    Paper,
} from '@material-ui/core';
import Flag from 'react-world-flags';
import { LatLngLiteral } from 'leaflet';
import { MapStateCtx, useMapStateCtx } from '../ctx/MapStateCtx';
import { ServerQueue } from './ServerQueue';
import { ServerFilters } from './ServerFilters';
import { makeStyles } from '@material-ui/core/styles';


interface ServerRowProps {
    server: Server;
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        padding: theme.spacing(2),
        marginBottom: theme.spacing(2)
    },
    item: {
        paddingBottom: 0

    },
    h1: { textAlign: 'left', fontSize: 20, marginBottom: 0 },
    h2: { textAlign: 'center', fontSize: 16, marginBottom: 0 },
    flag: {
        maxHeight: '36px',
        width: '80px',
        verticalAlign: 'middle',
        paddingRight: theme.spacing(2),
        display: 'inline-block'
    },
    rowBody: {
        width: '100%',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    button: {
        backgroundColor: "rgb(44,91,17)",
        width: '100%',
        height: '100%',
        '&:hover': {
            backgroundColor: "rgb(74,154,28)"
        }
    },
}));

const ServerRow = ({ server }: ServerRowProps) => {
    const classes = useStyles();
    return <Paper className={classes.root} style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0}}>
        <Grid container className={classes.rowBody}>
            <Grid item xs={5} className={classes.item}>
                <Typography variant={'h1'} className={classes.h1} gutterBottom={false}>
                    <Flag code={server.cc} className={classes.flag} />{server.name_long}
                </Typography>
                {/*<Typography variant={'body1'}>Queued: 5</Typography>*/}
            </Grid>
            <Grid item xs={4} className={classes.item}>
                <Typography variant={'h2'} className={classes.h2} gutterBottom={false}>{server.a2s?.Map || ""}</Typography>
            </Grid>
            <Grid item xs={1} className={classes.item}>
                <Typography variant={'h2'}
                            className={classes.h2}
                            gutterBottom={false}>{server?.a2s?.Players || 0} / {server?.a2s?.MaxPlayers || 32}</Typography>
            </Grid>
            <Grid item xs={2} className={classes.item}>
                <Button className={classes.button} onClick={() => {
                    window.open(`steam://connect/${server.host}:${server.port}`);
                }
                }>Connect</Button>
            </Grid>
        </Grid>
    </Paper>;
};

export const ServerList = () => {
    const {selectedServers} = useMapStateCtx();
    return <Grid container>
        <Grid item xs={12}>
            { (selectedServers ||[]).map(server => <ServerRow key={`server-${server.host}-${server.port}`} server={server} />)}
        </Grid>
    </Grid>;
};

export const Servers = () => {
    const [servers, setServers] = useState<Server[]>([]);
    const [pos, setPos] = useState<LatLngLiteral>({ lat: 0, lng: 0 });
    const [customRange, setCustomRange] = useState<number>(500);
    const [selectedServers, setSelectedServers] = useState<Server[]>([]);
    const [filterByRegion, setFilterByRegion] = useState<boolean>(true);

    useEffect(() => {
        const fn = async () => {
            try {
                const s = await fetchServers();
                setServers(s ||[]);
                setSelectedServers(s)
            } catch (e) {

            }
        };
        // noinspection JSIgnoredPromiseFromCall
        fn();
    }, []);

    return <>
        <MapStateCtx.Provider value={{ servers, setServers, customRange, setCustomRange,
            pos, setPos, selectedServers, setSelectedServers, filterByRegion, setFilterByRegion }}>
            <ServerMap />
            <ServerFilters />
            <ServerQueue />
            <ServerList />
        </MapStateCtx.Provider>
    </>;
};

