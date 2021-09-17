import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import { DemoArchive, getDemos } from '../api';
import Typography from '@material-ui/core/Typography';



export const Demos = () => {
    // const [servers, setServers] = useState<string[]>([]);
    const [demos, setDemos] = useState<DemoArchive[]>([]);

    useEffect(() => {
            const fn = async () => {
                const fetchedDemos = await getDemos();
                setDemos(fetchedDemos as DemoArchive[]);
            };
            fn();
        }, []
    );

    return <Grid container justifyContent={'center'}>
        <Grid item xs={12} lg={8} style={{minHeight: "600px"}}>
            <img src={"https://www.meme-arsenal.com/memes/7acea578d83d5900ac41663392fdf7df.jpg"}/>
            {(demos ?? []).map((_e) => {
                return <Typography variant={'h1'}>~~Demos~~</Typography>;
            })}
        </Grid>
    </Grid>;
};

