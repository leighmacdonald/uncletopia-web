import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import React from 'react';
import { Link } from '@material-ui/core';
import FiberNewIcon from '@material-ui/icons/FiberNew';
interface Map {
    name: string;
    link: string;
    isNew: boolean;
}

interface MapSet {
    name: string;
    maps: Map[];
}

export const Maps = () => {
    const mapList: MapSet[] = [
        {
            name: 'Payload', maps: [
                { name: 'Badwater', link: 'https://wiki.teamfortress.com/wiki/Badwater_Basin', isNew: false },
                { name: 'Barnblitz', link: 'https://wiki.teamfortress.com/wiki/Barnblitz', isNew: false },
                { name: 'Borneo', link: 'https://wiki.teamfortress.com/wiki/Borneo', isNew: false },
                { name: 'Frontier', link: 'https://wiki.teamfortress.com/wiki/Frontier', isNew: false },
                { name: 'Gold Rush', link: 'https://wiki.teamfortress.com/wiki/Gold_Rush', isNew: true },
                { name: 'Pier', link: 'https://wiki.teamfortress.com/wiki/Pier', isNew: false },
                { name: 'Snowycoast', link: 'https://wiki.teamfortress.com/wiki/Snowycoast', isNew: false },
                { name: 'Swiftwater', link: 'https://wiki.teamfortress.com/wiki/Swiftwater', isNew: false },
                { name: 'Thunder Mountain', link: 'https://wiki.teamfortress.com/wiki/Thunder_Mountain', isNew: false },
                { name: 'Upward', link: 'https://wiki.teamfortress.com/wiki/Upward', isNew: false }
            ]
        },
        {
            name: 'Control Point', maps: [
                { name: 'Foundry', link: 'https://wiki.teamfortress.com/wiki/Foundry_(Control_Point)', isNew: true },
                { name: 'Granary', link: 'https://wiki.teamfortress.com/wiki/Granary_(Control_Point)', isNew: true },
                { name: 'Gullywash', link: 'https://wiki.teamfortress.com/wiki/Gullywash', isNew: true },
                { name: 'Metalworks', link: 'https://wiki.teamfortress.com/wiki/Metalworks', isNew: false },
                { name: 'Powerhouse', link: 'https://wiki.teamfortress.com/wiki/Powerhouse', isNew: true },
                { name: 'Process', link: 'https://wiki.teamfortress.com/wiki/Process', isNew: false },
                { name: 'Snakewater', link: 'https://wiki.teamfortress.com/wiki/Snakewater', isNew: false },
                { name: 'Sunshine', link: 'https://wiki.teamfortress.com/wiki/Sunshine', isNew: false }
            ]
        },
        {
            name: 'KOTH', maps: [
                {
                    name: 'Badlands',
                    link: 'https://wiki.teamfortress.com/wiki/Badlands_(King_of_the_Hill)',
                    isNew: false
                },
                { name: 'Brazil', link: 'https://wiki.teamfortress.com/wiki/Brazil', isNew: true },
                { name: 'Highpass', link: 'https://wiki.teamfortress.com/wiki/Highpass', isNew: false },
                { name: 'Kong King', link: 'https://wiki.teamfortress.com/wiki/Kong_King', isNew: false },
                { name: 'Lakeside', link: 'https://wiki.teamfortress.com/wiki/Lakeside', isNew: false },
                { name: 'Lazarus', link: 'https://wiki.teamfortress.com/wiki/Lazarus', isNew: true    },
                { name: 'Sawmill', link: 'https://wiki.teamfortress.com/wiki/Sawmill', isNew: false },
                { name: 'Suijin', link: 'https://wiki.teamfortress.com/wiki/Suijin', isNew: false },
                { name: 'Viaduct', link: 'https://wiki.teamfortress.com/wiki/Viaduct', isNew: false }
            ]
        },
        {
            name: 'Attack/Defend', maps: [
                { name: 'Dustbowl', link: 'https://wiki.teamfortress.com/wiki/Dustbowl', isNew: false },
                { name: 'Gorge', link: 'https://wiki.teamfortress.com/wiki/Gorge', isNew: false },
                { name: 'Gravel Pit', link: 'https://wiki.teamfortress.com/wiki/Gravel_Pit', isNew: true },
                { name: 'Mossrock', link: 'https://wiki.teamfortress.com/wiki/Mossrock', isNew: false },
                { name: 'Mountain Lab', link: 'https://wiki.teamfortress.com/wiki/Mountain_Lab', isNew: false },
                { name: 'Steel', link: 'https://wiki.teamfortress.com/wiki/Steel', isNew: false },
                { name: 'Mercenary Park', link: 'https://wiki.teamfortress.com/wiki/Mercenary_Park', isNew: true }
            ]
        },
        {
            name: 'CTF', maps: [
                { name: 'Landfall', link: 'https://wiki.teamfortress.com/wiki/Landfall', isNew: true }
            ]
        }
    ];
    return <>
        <Grid container spacing={3}>
            {mapList.map(m =>
                <Grid item xs={6} lg={3} key={m.name}>
                    <Paper style={{ paddingTop: '1rem' }}>
                        <Typography variant={'h6'}>{m.name}</Typography>
                        <List>
                            {m.maps.map((map_info) =>
                                <ListItem key={map_info.name}>
                                    <Link component={Button} fullWidth href={map_info.link} style={{ textDecoration: 'none' }}>
                                        {map_info.name}
                                        {map_info.isNew && <FiberNewIcon style={{color: "orange", paddingLeft: "4px"}} />}
                                    </Link>
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>
            )}
        </Grid>
    </>;
};