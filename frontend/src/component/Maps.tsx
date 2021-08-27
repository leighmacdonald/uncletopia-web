import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import React from 'react';

interface Map {
    name: string;
    link: string;
}

interface MapSet {
    name: string;
    maps: Map[];
}

export const Maps = () => {
    const mapList: MapSet[] = [
        {
            name: 'Payload', maps: [
                { name: 'Badwater', link: 'https://wiki.teamfortress.com/wiki/Badwater_Basin' },
                { name: 'Barnblitz', link: 'https://wiki.teamfortress.com/wiki/Barnblitz' },
                { name: 'Borneo', link: 'https://wiki.teamfortress.com/wiki/Borneo' },
                { name: 'Frontier', link: 'https://wiki.teamfortress.com/wiki/Frontier' },
                { name: 'Pier', link: 'https://wiki.teamfortress.com/wiki/Pier' },
                { name: 'Snowycoast', link: 'https://wiki.teamfortress.com/wiki/Snowycoast' },
                { name: 'Swiftwater', link: 'https://wiki.teamfortress.com/wiki/Swiftwater' },
                { name: 'Thunder Mountain', link: 'https://wiki.teamfortress.com/wiki/Thunder_Mountain' },
                { name: 'Upward', link: 'https://wiki.teamfortress.com/wiki/Upward' }
            ]
        },
        {
            name: 'Control Point', maps: [
                { name: 'Metalworks', link: 'https://wiki.teamfortress.com/wiki/Metalworks' },
                { name: 'Process', link: 'https://wiki.teamfortress.com/wiki/Process' },
                { name: 'Sunshine', link: 'https://wiki.teamfortress.com/wiki/Sunshine' },
                { name: 'Snakewater', link: 'https://wiki.teamfortress.com/wiki/Snakewater' }
            ]
        },
        {
            name: 'KOTH', maps: [
                { name: 'Badlands', link: 'https://wiki.teamfortress.com/wiki/Badlands_(King_of_the_Hill)' },
                { name: 'Highpass', link: 'https://wiki.teamfortress.com/wiki/Highpass' },
                { name: 'Kong King', link: 'https://wiki.teamfortress.com/wiki/Kong_King' },
                { name: 'Lakeside', link: 'https://wiki.teamfortress.com/wiki/Lakeside' },
                { name: 'Sawmill', link: 'https://wiki.teamfortress.com/wiki/Sawmill' },
                { name: 'Suijin', link: 'https://wiki.teamfortress.com/wiki/Suijin' },
                { name: 'Viaduct', link: 'https://wiki.teamfortress.com/wiki/Viaduct' }
            ]
        },
        {
            name: 'Attack/Defend', maps: [
                { name: 'Dustbowl', link: 'https://wiki.teamfortress.com/wiki/Dustbowl' },
                { name: 'Gorge', link: 'https://wiki.teamfortress.com/wiki/Gorge' },
                { name: 'Mossrock', link: 'https://wiki.teamfortress.com/wiki/Mossrock' },
                { name: 'Mountain Lab', link: 'https://wiki.teamfortress.com/wiki/Mountain_Lab' },
                { name: 'Steel', link: 'https://wiki.teamfortress.com/wiki/Steel' }
            ]
        }
    ];
    return <>
        <Grid container spacing={3}>
            {mapList.map(m =>
                <Grid item xs={3} key={m.name}>
                    <Paper style={{ paddingTop: '1rem' }}>
                        <Typography variant={'h6'}>{m.name}</Typography>
                        <List>
                            {m.maps.map((map_info) =>
                                <ListItem key={map_info.name}>
                                    <Button component={ListItemText} primary={map_info.name} href={map_info.link}
                                            onClick={() => {
                                                window.open(map_info.link);
                                            }} />
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>
            )}
        </Grid>

    </>;
};