import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import { Header } from './Header';
import { Footer } from './Footer';
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
import { getCurrentProfile, Person } from '../api';
import { UserProfile } from './Profile';
import { Logout } from './Logout';
import { Maps } from './Maps';
import { Rules } from './Rules';
import { DiscordLink } from './Discord';
import { AdminNews } from './AdminNews';
import MuiPickersUtilsProvider from '@material-ui/pickers/MuiPickersUtilsProvider';
import DateFnsUtils from '@date-io/date-fns';
import { Demos } from './Demos';


export const App = () => {
    const [currentUser, setCurrentUser] = useState<NonNullable<Person>>(GuestProfile);
    const [flashes, setFlashes] = useState<Flash[]>([]);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (token != null && token != '') {
                const profile =
                    (await getCurrentProfile()) as NonNullable<Person>;
                setCurrentUser(profile);
            }
        };
        // noinspection JSIgnoredPromiseFromCall
        fetchProfile();
    }, []);

    return (
        <CurrentUserCtx.Provider value={{ currentUser, setCurrentUser }}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Router>
                    <React.Fragment>
                        <ThemeProvider theme={tf2theme}>
                            <Container>
                                <CssBaseline />
                                <Header />
                                <UserFlashCtx.Provider value={{ flashes, setFlashes }}>
                                    <Flashes flashes={flashes} />
                                </UserFlashCtx.Provider>
                                <Container maxWidth='lg'>
                                    <Switch>
                                        <Route exact path='/' component={Home} />
                                        <Route exact path='/servers' component={Servers} />
                                        <Route exact path='/maps' component={Maps} />
                                        <Route exact path='/demos' component={Demos} />
                                        <Route exact path='/rules' component={Rules} />
                                        <Route exact path='/donate' component={Donate} />
                                        <Route exact path='/discord' component={DiscordLink} />
                                        <Route exact path='/profile' component={UserProfile} />
                                        <Route
                                            exact
                                            path={'/login/success'}
                                            component={LoginSuccess}
                                        />
                                        <Route
                                            exact
                                            path={'/logout'}
                                            component={Logout}
                                        />
                                        <Route
                                            exact
                                            path={'/admin/news'}
                                            component={AdminNews} />
                                    </Switch>
                                    <Footer />
                                </Container>
                            </Container>
                        </ThemeProvider>
                    </React.Fragment>
                </Router>
            </MuiPickersUtilsProvider>
        </CurrentUserCtx.Provider>
    );
};