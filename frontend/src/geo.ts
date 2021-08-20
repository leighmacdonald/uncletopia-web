import { LatLngLiteral } from 'leaflet';

const EARTH_RADIUS = 6371;

const toRadian = (degree: number) => degree * Math.PI / 180;

export const getDistance = (origin: LatLngLiteral, destination: LatLngLiteral) => {
    // return distance in meters
    const lon1 = toRadian(origin.lng),
        lat1 = toRadian(origin.lat),
        lon2 = toRadian(destination.lng),
        lat2 = toRadian(destination.lat);

    const deltaLat = lat2 - lat1;
    const deltaLon = lon2 - lon1;

    const a = Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon / 2), 2);
    const c = 2 * Math.asin(Math.sqrt(a));

    return c * EARTH_RADIUS * 1000;
};
