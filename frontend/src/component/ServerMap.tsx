import { Grid } from '@material-ui/core';
import React, { useEffect, useMemo } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
import { Marker } from 'react-leaflet';
import { Circle } from 'react-leaflet';
import { TileLayer } from 'react-leaflet';

// import { TileLayer, useMap, Circle } from 'react-leaflet/esm';
import { useMapStateCtx } from '../ctx/MapStateCtx';
import { getDistance } from '../geo';

const UserPosition = () => {
    const map = useMap();
    const { setPos } = useMapStateCtx();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(pos => {
            const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            map.setView(userPos);
            setPos(userPos);
        }, _err => {
            const defPos = { lat: 42.434719, lng: -83.985001 }
            map.setView(defPos);
            setPos(defPos);
        });
    }, []);

    return null;
};

const UserPositionMarker = () => {
    const { pos } = useMapStateCtx();
    return <>
        {pos.lat != 0 && <Marker autoPan={true} title={'You'} position={pos} />}
    </>;
};

export const UserPingRadius = () => {
    const { pos, customRange, filterByRegion, selectedServers, setCustomRange } = useMapStateCtx();
    const baseOpts = { color: 'green', opacity: 0.1, interactive: true };
    const markers = [
        { ...baseOpts, radius: 3000000, color: 'red' },
        { ...baseOpts, radius: 1500000, color: 'yellow' },
        { ...baseOpts, radius: 500000, color: 'green' }
    ];
    const c = useMemo(() => {
        return filterByRegion && <Circle center={pos} radius={customRange * 1000} color={'green'} />;
    }, [customRange, pos, filterByRegion, selectedServers, setCustomRange]);

    return <>
        {c}
        {pos.lat != 0 && markers.map(m => <Circle center={pos} key={m.radius} {...m} fillOpacity={0.1} />)}
    </>;
};

export const ServerMarkers = () => {
    const { pos, servers, customRange, selectedServers } = useMapStateCtx();
    const d = useMemo(() => servers.map((s) => {
        //const dis = getDistance(pos, { lat: s.latitude, lng: s.longitude }) / 1000;
        return <Circle center={[s.latitude, s.longitude]} radius={50000}
                       color={getDistance(pos, {
                           lat: s.latitude,
                           lng: s.longitude
                       }) < customRange * 1000 ? 'green' : 'red'}
                       key={s.server_id} />;
    }), [selectedServers, customRange, pos, servers]);
    return <>
        {servers && d}
    </>;
};

export const ServerMap = () =>
    <Grid container>
        <Grid item xs={12}>
            <MapContainer zoom={3} scrollWheelZoom={true} id={'map'} style={{ height: '500px', width: '100%' }}
                          attributionControl={false}>
                <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
                <UserPosition />
                <ServerMarkers />
                <UserPingRadius />
                <UserPositionMarker />
            </MapContainer>
        </Grid>
    </Grid>;
