import React, { useEffect } from 'react';

import { eureka } from '../misc';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';

interface Entry {
    title: string;
    date: Date;
    body: string;
    author?: string;
    icon?: string;
}

interface BlogEntryProps {
    entry: Entry;
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
        fontSize: "14px"
    },
    paper: {
        padding: theme.spacing(2),
        marginBottom: theme.spacing(2),
    }
}));


const entries: Entry[] = [
    {
        date: new Date(),
        title: 'Kendrick have a dream',
        body: `I am a sinner who's probably going to sin again. Playstation and some drank. Technology bought my soul. Got me breathing with dragons. I crack the eggs in your basket. I'm Marilyn Manson with madness, now just imagine the magic. Start up that Maserati and 'Vroom! Vroom' I'm racing. I got 25 lighters on my dresser. I can feel your energy from two planets away. I got my drink, I got my music. I would share them both today. I can feel the changes. I can feel the people around me just want to be famous. If I told you that a flower bloomed in a dark room, would you trust it? Really I'm a sober soul but I'm with the homies right now. I never was a gangbanger. I mean I was never a stranger to the folk neither. It go Halle Berry or hallelujah. Pick your poison tell me what you doing. Would you say my intelligence now is great relief? And it's safe to say our next generation maybe can sleep with dreams of being a lawyer and doctor, instead of a boy with a chopper. Pipe down on the curb when you heard that I got these words to the upper echelon, that's excellent. I am the bad, the good God, the last the hood got. The last that would try to pass a good job. If Shawn's a Beatle than I need a ten-second drum solo. See you at Woodstock.`
    },
    {
        date: new Date(),
        title: 'I\'m yo\' pusha',
        body: `This is time, this is my hour. I got a label deal under my mattress. Vultures to my culture. It's a different jingle when you hear these car keys. Your plane's missing a chef. Givenchy fitting like its gym clothes. My Audemar like Mardi Gras, that's Swiss time, that's excellence. That white frost on that pound cake so your Duncan Hines is irrelevant. Lambo, Murcielago, she go wherever I go. Wherever we go, we do it pronto. Gucci Chuck Taylor with the dragon on the side. Legend in two games like I'm Pee Wee Kirkland. Swimming through these streets looking like I'm Shamu. I'm set straight like a perm do it. My niece was 4 when she felt chinchilla. My verses heal like Curtis Mayfield's music. Rebel like Che Guevara, RC Tyco versus Carrera. Let's talk over Mai Tais, waiter top it off. You can't blame 'em, they ain't never seen Versace sofas. Success it what you make it, take it how it from. CNN said I'd be dead by 21. Still move a bird like I'm in bed with Mother Goose. The streets was yours, you're dunce cappin' and kazooin'. Everybody meet Mr. Me Too. Left the game on a high note, flow opera. Canal Streeting my style, like you Internet sharing my files. Puppets on the string like a yoyo, bouncin like a pogo, they prayin I never go solo. Yuugh.`
    },
    {
        date: new Date(),
        title: 'You are now watching the throne, don\'t let me get in my zone.',
        body: `You tellin' me people don't look at Kanye West like the glitch? I really do believe that the world can be saved through design, and everything needs to actually be 'architected.' Because I sit back and think 'Am I the only one that's not crazy? I'm a creative genius and there's no other way to word it. This one Corbusier lamp was, like, my greatest inspiration. Nobody can tell me where I can and can't go. Man, I'm the number one living and breathing rock star. I am Axl Rose; I am Jim Morrison; I am Jimi Hendrix. I'm Walt Disney. I'm like Howard Hughes. I'm like David Stern. I'm like Steve Jobs. If anything, that's a compliment to them. I'm like Michelangelo cause I'm the new version of that. You don't think that I would be one of the characters of today's modern Bible? I understand culture. I am the nucleus. It's only led me to awesome truth and awesomeness. Beauty, truth, awesomeness. That's all it is. You will believe in yourself. I'm just the espresso. I feel like a little bit, like, I'm the Braveheart of creativity. I just wanted to tell everyone I gave Sway his first TV. And he needs to remember that. I'm 10 years ahead of your mentality. But I'm a champion so I turned tragedy to triumph, make music that's fire, spit my soul through the wire.`
    },
    {
        date: new Date(),
        title: 'Allow me to reintroduce myself.',
        body: ` I invented swag. Poppin' bottles, puttin' supermodels in the cab. Yo, I'm makin' short term goals, when the weather folds. Just put away the leathers and put ice on the gold. Chilly with enough bail money to free a big Willy. High stakes, I got more at stake than Philly. Let's stick up the world and split it 50/50. Photo shoot fresh, looking like wealth, 'bout to call the papparazzi on myself. Can't leave rap alone, the game needs me. I'm outchere ballin', I know you see my sneaks. Look I'm on my grind cousin, ain't got time for frontin, sensitive thugs ya'll all need hugs. I'm not a biter, I'm a writer for myself and others. I say a B.I.G. verse I'm only bigging up my brother. I paid a grip for them jeans, plus the slippers is clean. Hova flow, the Holy Ghost, get the hell up out your seats. This ain't for iTunes, this ain't for sing-a-longs. This is black hoodie rap. Get your fatigues on, all black everything: Black cards, black cars, all black everything. So we living life like a video, where the sun is always out and you never get old and the champagne's always cold and the music's always good and the pretty girls just happen to stop by in the hood. I'm liable to go Michael, take your pick. Jackson, Tyson, Jordan, Game 6. Only god can judge me, so I'm gone. Either love me or leave me alone.`
    }
];

export const BlogEntry = ({ entry }: BlogEntryProps) => {
    const classes = useStyles();
    return <Paper className={classes.paper}>
        <Grid container>
            <Grid item>
                <Grid container>
                    <Grid item>
                        <Typography variant={'h2'} color={'primary'}>{entry.title}</Typography>
                        <Typography variant={'subtitle1'} color={'secondary'}>{entry.date.toISOString()}</Typography>
                    </Grid>
                </Grid>
                <Grid container>
                    <Grid item>
                        <Typography variant={'body1'} className={classes.body1}>{entry.body}</Typography>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    </Paper>;
};

export const Home = () => {

    useEffect(() => {
        eureka();
    }, []);

    return <Grid container>
        <Grid item xs={8}>
            {entries.map((e) => {
                return <BlogEntry entry={e} key={`entry-${e.date.toString()}-${e.title}`} />;
            })}
        </Grid>
        <Grid item xs={4}>
            <Typography variant={'h3'} color={'primary'}>Stats</Typography>
        </Grid>
    </Grid>;
};

