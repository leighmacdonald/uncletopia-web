import { createContext, useContext } from 'react';
import { noop } from 'lodash-es';
import { LatLngLiteral } from 'leaflet';
import { Server } from '../api';

export type MapState = {
    pos: LatLngLiteral;
    setPos: (pos: LatLngLiteral) => void;

    customRange: number;
    setCustomRange: (radius: number) => void;

    servers: Server[];
    setServers: (servers: Server[]) => void;
};

export const MapStateCtx = createContext<MapState>({
    pos: { lat: 0.0, lng: 0.0 },
    setPos: noop,
    customRange: 1500,
    setCustomRange: noop,
    servers: [],
    setServers: noop
});

export const useMapStateCtx = () => useContext(MapStateCtx);