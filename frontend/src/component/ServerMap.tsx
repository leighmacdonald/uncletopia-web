import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Circle } from 'react-leaflet';
import { useMapStateCtx } from '../ctx/MapStateCtx';
import { getDistance } from '../geo';

const UserPosition = () => {
    const map = useMap();
    const { setPos } = useMapStateCtx();
    const [hasUpdated, setHasUpdated] = useState<boolean>(false);

    useEffect(() => {
        if (!hasUpdated) {
            navigator.geolocation.getCurrentPosition(pos => {
                const userPos = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };
                map.setView(userPos);
                setHasUpdated(true);
                setPos(userPos);
            }, err => {
                console.log(`"Failed to get user location: ${err.message}`);
            });
        }
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
    const { pos, customRange } = useMapStateCtx();
    const baseOpts = { color: 'green', opacity: 0.1, interactive: true };
    const markers = [
        { ...baseOpts, radius: 3000000, color: 'red' },
        { ...baseOpts, radius: 1500000, color: 'yellow' },
        { ...baseOpts, radius: 500000, color: 'green' }
    ];

    return <>
        <Circle center={pos} radius={customRange} color={'green'} />
        {pos.lat != 0 && markers.map(m => <Circle center={pos} key={m.radius} {...m} fillOpacity={0.1} />)}
    </>;
};

export const ServerMarkers = () => {
    const { pos, servers, customRange } = useMapStateCtx();
    const d = useMemo(() => servers.map((s) => {
        const dis = getDistance(pos, { lat: s.latitude, lng: s.longitude }) / 1000;
        return <Circle center={[s.latitude, s.longitude]} radius={20000}
                       color={customRange <= dis  ? 'green' : 'red'}
                       key={s.server_id} />;
    }), [customRange, pos, servers]);
    return <>
        {servers && d}
    </>;
};

export const ServerMap = () =>
    <MapContainer zoom={3} scrollWheelZoom={true} id={'map'} style={{ height: '500px', width: '100%' }}
                  attributionControl={false}>
        <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
        <UserPosition />
        <ServerMarkers />
        <UserPingRadius />
        <UserPositionMarker />
    </MapContainer>;

