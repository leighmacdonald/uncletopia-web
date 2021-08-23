import React, { useEffect, useState } from 'react';
import {parseISO} from 'date-fns'
import { eureka } from '../misc';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import { getNews, News } from '../api';
import { format } from 'date-fns/esm';

interface BlogEntryProps {
    entry: News;
}

const useStyles = makeStyles((theme) => ({
    body1: {
        fontFamily: [
            '"Helvetica Neue"',
            'Helvetica',
            'Roboto',
            'Arial',
            'sans-serif'
        ].join(','),
        fontSize: '14px'
    },
    paper: {
        padding: theme.spacing(2),
        marginBottom: theme.spacing(2)
    }
}));


export const BlogEntry = ({ entry }: BlogEntryProps) => {
    const classes = useStyles();
    const d = parseISO(entry.publish_on)
    return <Paper className={classes.paper}>
        <Grid container>
            <Grid item>
                <Grid container>
                    <Grid item>
                        <Typography variant={'h2'} color={'primary'}>{entry.title}</Typography>
                        <Typography variant={'subtitle1'} color={'secondary'}>{format(d, "yyyy-MM-dd")}</Typography>
                    </Grid>
                </Grid>
                <Grid container>
                    <Grid item>
                        <div className={classes.body1} dangerouslySetInnerHTML={{__html: entry.body_html }}/>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    </Paper>;
};

export const Home = () => {
    const [news, setNews] = useState<News[]>([]);
    useEffect(() => {
        eureka();
    }, []);

    useEffect(() => {
            const fn = async () => {
                const fetchedNews = await getNews();
                setNews(fetchedNews as News[]);
            };
            fn();
        }, []
    );

    return <Grid container justifyContent={"center"}>
        <Grid item xs={8}>
            {(news ?? []).map((e) => {
                return <BlogEntry entry={e} key={`entry-${e.news_id}`} />;
            })}
        </Grid>
    </Grid>;
};

