import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import { Header } from './Header';
import { Footer } from './Footer';
import {
    BrowserRouter as Router,
    Routes,
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
import DateFnsUtils from '@date-io/date-fns';
import { Demos } from './Demos';
import { ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/lab';

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
            <LocalizationProvider dateAdapter={DateFnsUtils}>
                <Router>
                    <React.Fragment>
                        <ThemeProvider theme={tf2theme}>
                            <React.StrictMode>
                                <Container>
                                    <CssBaseline />
                                    <Header />
                                    <UserFlashCtx.Provider value={{ flashes, setFlashes }}>
                                        <Flashes flashes={flashes} />
                                    </UserFlashCtx.Provider>
                                    <Container maxWidth='lg'>
                                        <Routes>
                                            <Route path='/' element={<Home />} />
                                            <Route path='/servers' element={<Servers />} />
                                            <Route path='/maps' element={<Maps />} />
                                            <Route path='/demos' element={<Demos />} />
                                            <Route path='/rules' element={<Rules />} />
                                            <Route path='/donate' element={<Donate />} />
                                            <Route path='/discord' element={<DiscordLink />} />
                                            <Route path='/profile' element={<UserProfile />} />
                                            <Route
                                                path={'/login/success'}
                                                element={<LoginSuccess />}
                                            />
                                            <Route
                                                path={'/logout'}
                                                element={<Logout />}
                                            />
                                            <Route
                                                path={'/admin/news'}
                                                element={<AdminNews />}
                                            />
                                        </Routes>
                                        <Footer />
                                    </Container>
                                </Container>
                            </React.StrictMode>
                        </ThemeProvider>
                    </React.Fragment>
                </Router>
            </LocalizationProvider>
        </CurrentUserCtx.Provider>
    );
};