import React, { useEffect, useState } from 'react';
import parseISO from 'date-fns/esm/parseISO';
import { eureka } from '../misc';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { getNews, News } from '../api';
import format from 'date-fns/esm/format';
import { styled } from '@mui/material/styles';

interface BlogEntryProps {
    entry: News;
}

const StyledBlogContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2)
}));

export const BlogEntry = ({ entry }: BlogEntryProps) => {
    const d = parseISO(entry.created_on);
    return <StyledBlogContainer>
        <Grid container>
            <Grid item>
                <Grid container>
                    <Grid item>
                        <Typography variant={'h2'}>{entry.title}</Typography>
                        <Typography variant={'subtitle1'}>{format(d, 'yyyy-MM-dd')}</Typography>
                    </Grid>
                </Grid>
                <Grid container>
                    <Grid item>
                        <div style={{
                            fontFamily: [
                                '"Helvetica Neue"',
                                'Helvetica',
                                'Roboto',
                                'Arial',
                                'sans-serif'
                            ].join(','),
                            fontSize: '14px'
                        }} dangerouslySetInnerHTML={{ __html: entry.body_html }} />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    </StyledBlogContainer>;
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

    return <Grid container justifyContent={'center'}>
        <Grid item xs={12} lg={8}>
            {(news ?? []).map((e) => {
                return <BlogEntry entry={e} key={`entry-${e.news_id}`} />;
            })}
        </Grid>
    </Grid>;
};

