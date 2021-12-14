import React from 'react';
import Container from '@mui/material/Container';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';


function Copyright() {
    return (
        <Button component={Link} color='inherit' href={'https://github.com/leighmacdonald/uncletopia-web'}>
            &copy; 2020 - {new Date().getFullYear()} Uncletopia
        </Button>
    );
}

const StyledFooter = styled(Container)(({theme}) => ({
    marginTop: theme.spacing(3),
    padding: theme.spacing(6, 0)
}))

export const Footer = () => {
    return (
        <StyledFooter maxWidth='lg'>
            <Copyright />
        </StyledFooter>
    );
}
