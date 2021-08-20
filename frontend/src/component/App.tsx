import CssBaseline from '@material-ui/core/CssBaseline';
import { Container, ThemeProvider } from '@material-ui/core';
import { Header } from './Header';
import Footer from './Footer';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Home } from './Home';
import { Servers } from './Servers';
import { Donate } from './Donate';
import { tf2theme } from '../Theme';
import { CurrentUserCtx, GuestProfile } from '../ctx/CurrentUserCtx';
import { UserFlashCtx } from '../ctx/UserFlashCtx';
import { Flash, Flashes } from './Flashes';
import { LoginSuccess } from './LoginSuccess';
import { getCurrentProfile, PlayerProfile } from '../api';

export const App = () => {
    const [currentUser, setCurrentUser] = useState<NonNullable<PlayerProfile>>(GuestProfile);
    const [flashes, setFlashes] = useState<Flash[]>([]);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (token != null && token != '') {
                const profile =
                    (await getCurrentProfile()) as NonNullable<PlayerProfile>;
                setCurrentUser(profile);
                alert("yippie")
            }
        };
        // noinspection JSIgnoredPromiseFromCall
        fetchProfile();
    }, [setCurrentUser]);

    return (
        <CurrentUserCtx.Provider value={{ currentUser, setCurrentUser }}>
            <Router>
                <React.Fragment>
                    <ThemeProvider theme={tf2theme}>
                        <CssBaseline />
                        <Header />
                        <UserFlashCtx.Provider value={{ flashes, setFlashes }}>
                            <Flashes flashes={flashes} />
                        </UserFlashCtx.Provider>
                        <Container maxWidth='lg'>
                            <Switch>
                                <Route exact path='/' component={Home} />
                                <Route exact path='/servers' component={Servers} />
                                <Route exact path='/donate' component={Donate} />

                                <Route
                                    exact
                                    path={'/login/success'}
                                    component={LoginSuccess}
                                />
                            </Switch>
                            <Footer />
                        </Container>
                    </ThemeProvider>
                </React.Fragment>
            </Router>
        </CurrentUserCtx.Provider>
    )
};