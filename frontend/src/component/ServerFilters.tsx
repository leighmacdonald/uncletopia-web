import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import Slider from '@material-ui/core/Slider';
import Switch from '@material-ui/core/Switch';
import React, { useEffect } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import uniq from 'lodash-es/uniq';
import { useMapStateCtx } from '../ctx/MapStateCtx';
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
    h1: { textAlign: 'left', fontSize: 20, marginBottom: 0 },
    h2: { textAlign: 'center', fontSize: 16, marginBottom: 0 },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120
    }
}));

export const ServerFilters = () => {
    const classes = useStyles();
    const {
        setCustomRange, servers, customRange, pos, setSelectedServers,
        setFilterByRegion, setServers, filterByRegion, selectedRegion, setSelectedRegion,
        setShowOpenOnly, showOpenOnly
    } = useMapStateCtx();


    const regions = uniq(['any', ...(servers || []).map(value => value.region)]);

    const onRegionsChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const el = event.target as any;
        setSelectedRegion(el.value);
    };

    const onShowOpenOnlyChanged = (_event: any, checked: boolean) => {
        setShowOpenOnly(checked);
    };

    const onRegionsToggleEnabledChanged = (_event: any, checked: boolean) => {
        setFilterByRegion(checked);
    };

    const defaultState = {
        'showOpenOnly': false,
        'selectedRegion': ['any'],
        'filterByRegion': false,
        'customRange': 1500

    };
    useEffect(() => {
        let state = defaultState;
        try {
            const val = localStorage.getItem('filters');
            if (val) {
                state = JSON.parse(val);
            }
        } catch (e) {
            console.log(`Tried to load invalid filter state`);
            return;
        }
        setShowOpenOnly(state?.showOpenOnly || defaultState.showOpenOnly);
        setSelectedRegion((state?.selectedRegion && state.selectedRegion.length > 1)
            ? state.selectedRegion : defaultState.selectedRegion);
        setFilterByRegion(state?.filterByRegion || defaultState.filterByRegion);
        setCustomRange(state?.customRange || defaultState.customRange);
    }, []);

    const saveFilterState = () => {
        localStorage.setItem('filters', JSON.stringify({
            'showOpenOnly': showOpenOnly,
            'selectedRegion': selectedRegion,
            'filterByRegion': filterByRegion,
            'customRange': customRange
        }));
    };

    useEffect(() => {
        let s = servers;
        if (!filterByRegion && !selectedRegion.includes('any')) {
            s = s.filter(srv => selectedRegion.includes(srv.region));
        }
        if (showOpenOnly) {
            s = s.filter(srv => (srv?.a2s?.Players || 0) < (srv?.a2s?.MaxPlayers || 32));
        }
        if (filterByRegion && customRange) {
            s = s.filter(srv =>
                getDistance(pos, { lat: srv.latitude, lng: srv.longitude }) < customRange * 1000
            );
        }
        setSelectedServers(s);
        saveFilterState();

    }, [selectedRegion, showOpenOnly, filterByRegion, customRange, setServers, servers]);

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

    return <Paper className={classes.root}>
        <Grid container style={{
            width: '100%',
            flexWrap: 'nowrap',
            alignItems: 'center',
            // justifyContent: 'center'
        }}>
            <Grid item xs={2}>
                <Typography variant={'h4'} align={'center'}>Filters</Typography>
            </Grid>
            <Grid item xs>
                <FormControlLabel
                    control={<Switch checked={showOpenOnly} onChange={onShowOpenOnlyChanged} name='checkedA' />}
                    label='Open Slots'
                />
            </Grid>
            <Grid item xs>
                <FormControl className={classes.formControl}>
                    <InputLabel id='region-selector-label'>Region</InputLabel>
                    <Select
                        disabled={filterByRegion}
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
            <Grid item xs>
                <FormControlLabel
                    control={<Switch checked={filterByRegion}
                                     onChange={onRegionsToggleEnabledChanged}
                                     name='regionsEnabled' />}
                    label='By Range'
                />
            </Grid>
            <Grid item xs style={{ paddingRight: '2rem' }}>
                <Slider
                    style={{ zIndex: 1000 }}
                    disabled={!filterByRegion}
                    defaultValue={1000}
                    aria-labelledby='custom-range'
                    step={100}
                    max={5000}
                    valueLabelDisplay='auto'
                    value={customRange}
                    marks={marks}
                    onChange={(_event, value) => {
                        setCustomRange(value as number);
                    }}
                />
            </Grid>
        </Grid>
    </Paper>;
};