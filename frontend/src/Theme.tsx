import createTheme from '@material-ui/core/styles/createTheme';

export const readableFonts =  {fontFamily: [
    '"Helvetica Neue"',
    'Helvetica',
    'Roboto',
    'Arial',
    'sans-serif'
].join(',')}

export const tf2theme = createTheme({
    typography: {
        fontFamily: [
            '"TF2 Build"',
            '"Helvetica Neue"',
            'Helvetica',
            'Roboto',
            'Arial',
            'sans-serif'
        ].join(','),
        h1: { textAlign: 'center', fontSize: 48, marginBottom: 12 },
        h2: { textAlign: 'center', fontSize: 36, marginBottom: 12 },
        h3: { textAlign: 'center' },
        h4: { textAlign: 'center'},
        h5: { textAlign: 'center'},
        h6: { textAlign: 'center' },
        body1: {
            ...readableFonts,
            fontWeight: 400,
            fontSize: 20
        }
    },
    spacing: 6,
    palette: {
        background: {
            paper: 'rgb(20, 13, 10)',
            default: 'rgb(38,24,18)'
        },
        primary: {
            main: 'rgb(250,158,75)'
        },
        secondary: {
            main: 'rgb(252, 198, 149)'
        },
        text: {
            primary: 'rgb(246,231,222)',
            secondary: 'rgb(218,189,171)'
        }
    }
});
