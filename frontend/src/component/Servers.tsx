import React, { useEffect, useMemo, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { fetchServers, Server } from '../api';
// @ts-ignore
import * as lcss from 'leaflet/dist/leaflet.css';
import { ServerMap } from './ServerMap';
import {
    Button,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Slider,
    Switch
} from '@material-ui/core';
import { includes, uniq } from 'lodash-es';
import { makeStyles } from '@material-ui/core/styles';
import Flag from 'react-world-flags';
import VideogameAssetIcon from '@material-ui/icons/VideogameAsset';
import { LatLngLiteral } from 'leaflet';
import { MapStateCtx } from '../ctx/MapStateCtx';
import { getDistance } from '../geo';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        padding: theme.spacing(2),
        marginBottom: theme.spacing(2)
    },
    item: {
        paddingBottom: 0

    },
    flag: {
        maxHeight: '36px',
        width: '80px',
        verticalAlign: 'middle',
        paddingRight: theme.spacing(2),
        display: 'inline-block'
    },
    button: {
        backgroundColor: "rgb(44,91,17)",
        width: '100%',
        height: '100%',
        '&:hover': {
            backgroundColor: "rgb(74,154,28)"
        }
    },
    h1: { textAlign: 'left', fontSize: 20, marginBottom: 0 },
    h2: { textAlign: 'center', fontSize: 16, marginBottom: 0 },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120
    },
    rowBody: {
        width: '100%',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
}));

interface ServerRowProps {
    server: Server;
}

const ServerRow = ({ server }: ServerRowProps) => {
    const classes = useStyles();
    return <Paper className={classes.root}>
        <Grid container className={classes.rowBody}>
            <Grid item xs={5} className={classes.item}>
                <Typography variant={'h1'} className={classes.h1} gutterBottom={false}>
                    <Flag code={server.cc} className={classes.flag} />{server.name_long}
                </Typography>
                {/*<Typography variant={'body1'}>Queued: 5</Typography>*/}
            </Grid>
            <Grid item xs={4} className={classes.item}>
                <Typography variant={'h2'} className={classes.h2} gutterBottom={false}>{server.state.Map}</Typography>

            </Grid>
            <Grid item xs={1} className={classes.item}>
                <Typography variant={'h2'}
                            className={classes.h2}
                            gutterBottom={false}>{server.state.PlayersCount} / {server.state.PlayersMax}</Typography>
            </Grid>
            <Grid item xs={2} className={classes.item}>
                <Button className={classes.button} color={'secondary'} onClick={() => {
                    window.open(`steam://connect/${server.host}:${server.port}`);
                }
                }><VideogameAssetIcon style={{ marginRight: '10px' }} />Connect</Button>
            </Grid>
        </Grid>
    </Paper>;
};

interface ServerGridProps {
    servers: Server[];
}

export const ServerList = ({ servers }: ServerGridProps) => {
    return <Grid container>
        <Grid item xs={12}>
            {servers.map(server => <ServerRow key={`server-${server.host}-${server.port}`} server={server} />)}
        </Grid>
    </Grid>;
};

export const Servers = () => {
    const classes = useStyles();
    const [servers, setServers] = useState<Server[]>([]);
    const [regionsToggleEnabled, setRegionsToggleEnabled] = useState<boolean>(false);
    const [pos, setPos] = useState<LatLngLiteral>({ lat: 0, lng: 0 });
    const [customRange, setCustomRange] = useState<number>(500);
    const [showOpenOnly, setShowOpenOnly] = useState<boolean>(false);
    const [selectedRegion, setSelectedRegions] = useState<string[]>(['any']);
    const regions = uniq([...['any'], ...servers.map(value => value.region)]);

    const filtered = useMemo(() => {
        let s = servers
            .filter(server => includes(selectedRegion,'any') || includes(selectedRegion, server.region));
        if (showOpenOnly) {
            s = s.filter(server => server.state.PlayersCount === server.state.PlayersMax);
        }
        if (regionsToggleEnabled && customRange) {
            s = s.filter(s => getDistance(pos, { lat: s.latitude, lng: s.longitude }) )
        }
        return s;
    }, [showOpenOnly, selectedRegion, servers, customRange]);

    useEffect(() => {
        const fn = async () => {
            try {
                const s = await fetchServers();
                setServers(s);
            } catch (e) {

            }
        };
        // noinspection JSIgnoredPromiseFromCall
        fn();
    }, []);

    const onRegionsChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const el = event.target as any;
        setSelectedRegions(el.value);
    };

    const onShowOpenOnlyChanged = (_event: any, checked: boolean) => {
        setShowOpenOnly(checked);
    };

    const onRegionsToggleEnabledChanged = (_event: any, checked: boolean) => {
        setRegionsToggleEnabled(checked);
    };

    const marks = [
        {
            value: 500,
            label: '500 km'
        },
        {
            value: 1500,
            label: '1500 km'
        },
        {
            value: 3000,
            label: '3000 km'
        },
        {
            value: 5000,
            label: '5000 km'
        }
    ];

    return <>
        <MapStateCtx.Provider value={{ servers, setServers, customRange, setCustomRange, pos, setPos }}>
            <Grid container>
                <Grid item xs={12}>
                    <ServerMap />
                </Grid>
            </Grid>
            <Paper className={classes.root}>
                <Grid container style={{
                    width: '100%',
                    flexWrap: 'nowrap',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Grid item xs={2}>
                        <Typography variant={'h4'} align={'center'}>Filters</Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <FormControlLabel
                            control={<Switch checked={showOpenOnly} onChange={onShowOpenOnlyChanged} name='checkedA' />}
                            label='Open Slots'
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <FormControl className={classes.formControl}>
                            <InputLabel id='region-selector-label'>Region</InputLabel>
                            <Select
                                disabled={regionsToggleEnabled}
                                labelId='region-selector-label'
                                id='region-selector'
                                value={selectedRegion}
                                onChange={onRegionsChange}
                            >
                                {regions.map(r => {
                                    return <MenuItem key={`region-${r}`} value={r}>{r}</MenuItem>;
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={2}>
                        <FormControlLabel
                            control={<Switch checked={regionsToggleEnabled} onChange={onRegionsToggleEnabledChanged} name='regionsEnabled' />}
                            label='Filter by Range'
                        />
                    </Grid>
                    <Grid item xs style={{paddingRight: "2rem"}}>
                        <Slider
                            style={{zIndex: 1000}}
                            disabled={!regionsToggleEnabled}
                            defaultValue={500}
                            aria-labelledby='discrete-slider-custom'
                            step={100}
                            max={5000}
                            valueLabelDisplay='auto'
                            marks={marks}
                            onChange={(_event, value) => {
                                setCustomRange(value as number);
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>
            <ServerList servers={filtered} />
        </MapStateCtx.Provider>
    </>;
};

