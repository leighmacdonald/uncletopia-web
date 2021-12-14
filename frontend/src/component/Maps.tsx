import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import React from 'react';
import Link from '@mui/material/Link';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import ACUnitIcon from '@mui/icons-material/AcUnit';
import Masonry from '@mui/lab/Masonry';

interface Map {
    name: string;
    link: string;
    icon: 'none' | 'new' | 'smissmas';
}

interface MapSet {
    name: string;
    maps: Map[];
}

export const Maps = () => {
    const mapList: MapSet[] = [
        {
            name: 'Payload', maps: [
                { name: 'Badwater', link: 'https://wiki.teamfortress.com/wiki/Badwater_Basin', icon: 'none' },
                { name: 'Barnblitz', link: 'https://wiki.teamfortress.com/wiki/Barnblitz', icon: 'none' },
                { name: 'Breadspace', link: 'https://wiki.teamfortress.com/wiki/Breadspace', icon: 'smissmas' },
                { name: 'Borneo', link: 'https://wiki.teamfortress.com/wiki/Borneo', icon: 'none' },
                { name: 'Chilly', link: 'https://wiki.teamfortress.com/wiki/Chilly', icon: 'smissmas' },
                { name: 'Frontier', link: 'https://wiki.teamfortress.com/wiki/Frontier', icon: 'none' },
                { name: 'Gold Rush', link: 'https://wiki.teamfortress.com/wiki/Gold_Rush', icon: 'new' },
                { name: 'Pier', link: 'https://wiki.teamfortress.com/wiki/Pier', icon: 'none' },
                { name: 'Polar', link: 'https://wiki.teamfortress.com/wiki/Polar', icon: 'smissmas' },
                { name: 'Snowycoast', link: 'https://wiki.teamfortress.com/wiki/Snowycoast', icon: 'none' },
                { name: 'SnowVille', link: 'https://wiki.teamfortress.com/wiki/SnowVille', icon: 'smissmas' },
                { name: 'Swiftwater', link: 'https://wiki.teamfortress.com/wiki/Swiftwater', icon: 'none' },
                { name: 'Thunder Mountain', link: 'https://wiki.teamfortress.com/wiki/Thunder_Mountain', icon: 'none' },
                { name: 'Upward', link: 'https://wiki.teamfortress.com/wiki/Upward', icon: 'none' },
                { name: 'Wutville', link: 'https://wiki.teamfortress.com/wiki/Wutville', icon: 'smissmas' }
            ]
        },
        {
            name: 'Control Point', maps: [
                { name: 'Foundry', link: 'https://wiki.teamfortress.com/wiki/Foundry_(Control_Point)', icon: 'new' },
                { name: 'Granary', link: 'https://wiki.teamfortress.com/wiki/Granary_(Control_Point)', icon: 'new' },
                { name: 'Gullywash', link: 'https://wiki.teamfortress.com/wiki/Gullywash', icon: 'new' },
                { name: 'Metalworks', link: 'https://wiki.teamfortress.com/wiki/Metalworks', icon: 'none' },
                { name: 'Powerhouse', link: 'https://wiki.teamfortress.com/wiki/Powerhouse', icon: 'new' },
                { name: 'Process', link: 'https://wiki.teamfortress.com/wiki/Process', icon: 'none' },
                { name: 'Snakewater', link: 'https://wiki.teamfortress.com/wiki/Snakewater', icon: 'none' },
                { name: 'Sunshine', link: 'https://wiki.teamfortress.com/wiki/Sunshine', icon: 'none' }
            ]
        },
        {
            name: 'KOTH', maps: [
                {
                    name: 'Badlands',
                    link: 'https://wiki.teamfortress.com/wiki/Badlands_(King_of_the_Hill)',
                    icon: 'none'
                },
                { name: 'Brazil', link: 'https://wiki.teamfortress.com/wiki/Brazil', icon: 'new' },
                { name: 'Cascade', link: 'https://wiki.teamfortress.com/wiki/Cascade', icon: 'smissmas' },
                { name: 'Highpass', link: 'https://wiki.teamfortress.com/wiki/Highpass', icon: 'none' },
                { name: 'Kong King', link: 'https://wiki.teamfortress.com/wiki/Kong_King', icon: 'none' },
                { name: 'Lakeside', link: 'https://wiki.teamfortress.com/wiki/Lakeside', icon: 'none' },
                { name: 'Lazarus', link: 'https://wiki.teamfortress.com/wiki/Lazarus', icon: 'new' },
                { name: 'Sawmill', link: 'https://wiki.teamfortress.com/wiki/Sawmill', icon: 'none' },
                { name: 'Suijin', link: 'https://wiki.teamfortress.com/wiki/Suijin', icon: 'none' },
                { name: 'Viaduct', link: 'https://wiki.teamfortress.com/wiki/Viaduct', icon: 'none' }
            ]
        },
        {
            name: 'Attack/Defend', maps: [
                { name: 'Altitude', link: 'https://wiki.teamfortress.com/wiki/Altitude', icon: 'smissmas' },
                { name: 'Dustbowl', link: 'https://wiki.teamfortress.com/wiki/Dustbowl', icon: 'none' },
                { name: 'Gorge', link: 'https://wiki.teamfortress.com/wiki/Gorge', icon: 'none' },
                { name: 'Gravel Pit', link: 'https://wiki.teamfortress.com/wiki/Gravel_Pit', icon: 'new' },
                { name: 'Mossrock', link: 'https://wiki.teamfortress.com/wiki/Mossrock', icon: 'none' },
                { name: 'Mountain Lab', link: 'https://wiki.teamfortress.com/wiki/Mountain_Lab', icon: 'none' },
                { name: 'Steel', link: 'https://wiki.teamfortress.com/wiki/Steel', icon: 'none' },
                { name: 'Mercenary Park', link: 'https://wiki.teamfortress.com/wiki/Mercenary_Park', icon: 'new' }
            ]
        },
        {
            name: 'CTF', maps: [
                { name: 'Doublefrost', link: 'https://wiki.teamfortress.com/wiki/Doublefrost', icon: 'smissmas' },
                { name: 'Landfall', link: 'https://wiki.teamfortress.com/wiki/Landfall', icon: 'new' },
                { name: 'Snowfall', link: 'https://wiki.teamfortress.com/wiki/Snowfall', icon: 'smissmas' }
            ]
        }
    ];
    return <>
        <Grid container spacing={3} style={{ paddingTop: '1rem' }}>
            <Masonry columns={3} spacing={3}>
                {mapList.map(m =>
                    <Paper style={{ paddingTop: '1rem' }} key={m.name}>
                        <Typography variant={'h6'}>{m.name}</Typography>
                        <List>
                            {m.maps.map((map_info) =>
                                <ListItem key={map_info.name}>
                                    <Link component={Button} fullWidth href={map_info.link}
                                          style={{ textDecoration: 'none' }}>
                                        {map_info.name}
                                        {map_info.icon == 'new' &&
                                        <FiberNewIcon style={{ color: 'orange', paddingLeft: '4px' }} />}
                                        {map_info.icon == 'smissmas' &&
                                        <ACUnitIcon style={{ color: 'rgba(127,195,255,0.66)', paddingLeft: '4px' }} />}
                                    </Link>
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                )}

            </Masonry>
        </Grid>
    </>;
};