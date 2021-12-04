import React, { useCallback, useMemo } from 'react';
import { useEffect, useState } from 'react';
import { createNews, deleteNews, getNews, NewsUpdatePayload, News, updateNews } from '../api';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Box from '@material-ui/core/Box';
import { marked } from 'marked';
import { readableFonts } from '../Theme';
import IconButton from '@material-ui/core/IconButton';
import PublicIcon from '@material-ui/icons/Public';
import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Checkbox, FormControlLabel } from '@material-ui/core';

// import { DateTimePicker } from '@material-ui/pickers/DateTimePicker';


interface TabPanelProps {
    value: number;
    index: number;
    children?: React.ReactNode;
}

const TabPanel = ({ value, index, children }: TabPanelProps) => {
    return (
        <div role={'tabpanel'}
             hidden={value !== index}
             id={`tab-panel-${index}`}
        >
            {value === index && (
                <Box p={3}>
                    {children}
                </Box>
            )}
        </div>
    );
};

const emptyNews = {
    news_id: 0, body_md: '', updated_on: '', published: false,
    body_html: '', title: '', created_on: '', steam_id: 0
};

export const AdminNews = () => {
    const [articles, setArticles] = useState<News[]>([]);
    const [current, setCurrent] = useState<News>(emptyNews);
    const [title, setTitle] = useState<string>('');
    const [publish, setPublish] = useState<boolean>(false);
    const [body, setBody] = useState<string>('');
    const [len, setLen] = useState<number>(0);
    const rendered = useMemo(() => {
        return marked(body);
    }, [body]);
    const [tab, setTab] = useState(0);

    const onDelete = useCallback(async (newsId?: number) => {
        const i = newsId ?? current.news_id;
        if (i > 0 && confirm('sure?')) {
            if (await deleteNews(i)) {
                setArticles(articles.filter(value => value.news_id !== i));
                setCurrent(emptyNews);
            }
        }
    }, []);

    const updateArticles =  async () => {
        try {
            const news = (await getNews() || []);
            setArticles(news as News[]);
        } catch (_e) {
            setArticles([]);
        }

    };
    useEffect(() => {
        updateArticles();
    }, []);

    const updateLen = () => {
        setLen(`${title}\n\n${body}`.length);
    };

    const onTitleChange = (e: any) => {
        setTitle(e.target.value);
        updateLen();
    };

    const onBodyChange = (e: any) => {
        setBody(e.target.value);
        updateLen();
    };

    const onSave = async () => {
        const updated: NewsUpdatePayload = {
            title: title,
            body_md: body,
            published: publish
        };
        if (current.news_id > 0) {
            if (await updateNews(current.news_id, updated)) {
                alert(`Updated ${current.news_id}`);
            }
        } else {
            const created = await createNews(updated);
            if (created.news_id > 0) {
                alert(`Created ${created.news_id}`);
            }
        }
        await updateArticles()
    };

    const loadArticle = (n: News) => {
        setCurrent(n);
        setTitle(n.title);
        setBody(n.body_md);
        setPublish(n.published);
    };

    const onChangePublished = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPublish(event.target.checked);
    };

    return <Grid container spacing={3}>
        <Grid item xs={8}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Paper>
                        <Tabs centered value={tab} onChange={(_e, value) => {
                            setTab(value);
                        }} aria-label='Raw / Preview toggle'>
                            <Tab label='Markdown' />
                            <Tab label='Preview' />
                        </Tabs>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper>
                        <ButtonGroup>
                            <Button style={{ color: 'green' }} onClick={onSave}>Save</Button>
                            <Button style={{ color: 'orange' }} onClick={() => {
                                for (let i = 0; i < articles.length; i++) {
                                    if (articles[i]?.news_id === current.news_id) {
                                        loadArticle(articles[i] as News);
                                    }
                                }
                            }}>Reset</Button>
                            <Button style={{ color: 'red' }} onClick={async () => {
                                await onDelete(current.news_id);
                            }}>Delete</Button>
                        </ButtonGroup>

                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper>
                        <Typography variant={'h6'}>Len: {len}/2000</Typography>
                        <Typography variant={'body1'} align={'center' }>Messages longer than 2000 cannot be posted to
                            discord because: "fuck you" - Discord.</Typography>
                    </Paper></Grid>
                <Grid item xs={12}>
                    <Paper>
                        <TabPanel index={0} value={tab}>
                            <Grid container>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={publish}
                                                onChange={onChangePublished}
                                                name='Published'
                                                color='primary'
                                            />
                                        }
                                        label='Published?'
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField label='Title' placeholder={'Dane got a pan!'}
                                               variant='filled' fullWidth
                                               onChange={onTitleChange}
                                               value={title} />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        id='standard-textarea'
                                        label='Article Body (Markdown)'
                                        placeholder='Placeholder'
                                        variant={'filled'}
                                        value={body}
                                        minRows={25}
                                        multiline
                                        onChange={onBodyChange}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </TabPanel>
                        <TabPanel index={1} value={tab}>
                            <Grid container>
                                <Grid item xs={12}>
                                    <div style={{ ...readableFonts }} dangerouslySetInnerHTML={{ __html: rendered }} />
                                </Grid>
                            </Grid>
                        </TabPanel>
                    </Paper>
                </Grid>
            </Grid>
        </Grid>
        <Grid item xs={4}>
            <Paper style={{ padding: '1rem' }}>
                <Typography variant={'h4'}>Articles</Typography>
                <ButtonGroup fullWidth>
                    <Button color={'primary'}
                            onClick={() => {
                                loadArticle(emptyNews);
                            }}>
                        <AddCircleIcon />Create New
                    </Button>
                </ButtonGroup>
            </Paper>
            <Paper style={{ marginTop: '1rem' }}>
                <List>
                    {articles.map((a) =>
                        <ListItem key={`news-${a.news_id}`}>
                            <ListItemText>{a.title}<ButtonGroup fullWidth>
                                <IconButton color={'primary'}><PublicIcon /></IconButton>
                                <IconButton color={'primary'} onClick={() => {
                                    loadArticle(a);
                                }}><EditIcon /></IconButton>
                                <IconButton color={'primary'} onClick={async () => {
                                    await onDelete(a.news_id);
                                }}><DeleteForeverIcon /></IconButton>
                            </ButtonGroup>
                            </ListItemText>
                        </ListItem>
                    )}
                </List>
            </Paper>
        </Grid>
    </Grid>;

};
