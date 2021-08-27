import createTheme from "@material-ui/core/styles/createTheme";

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
        h1: {textAlign: "center", fontSize: 48, marginBottom: 12, color: '#fde1c7'},
        h2: {textAlign: "center", fontSize: 36, marginBottom: 12, color: '#fde1c7'},
        h3: {textAlign: "center", color: '#fde1c7'},
        h4: {textAlign: "center", color: '#fde1c7'},
        h5: {textAlign: "center", color: '#fde1c7'},
        h6: {textAlign: "center", color: '#fde1c7'},
        body1: {
            fontFamily: [
                '"Helvetica Neue"',
                'Helvetica',
                'Roboto',
                'Arial',
                'sans-serif'
            ].join(','),
            fontWeight: 400,
            fontSize: 20
        }
    },
    spacing: 6,
    palette: {
        background: {
            paper: "rgb(20, 13, 10)",
            default: "#261812",
        },
        primary: {
            main: "#fa9e4b"
        },
        secondary: {
            main: "rgb(252, 198, 149)",
        },
        text: {
            primary: "rgb(252, 198, 149)",
            secondary: "rgb(255,187,126)",
        },
    },
})
