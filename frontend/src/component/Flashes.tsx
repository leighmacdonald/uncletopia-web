import React from 'react';
import Alert, { AlertColor } from '@mui/lab/Alert';

export interface Flash {
    level: AlertColor;
    heading: string;
    message: string;
    closable?: boolean;
    link_to?: string;
}

export interface FlashesProps {
    flashes: Flash[];
}

export const Flashes = ({ flashes }: FlashesProps): JSX.Element => (
    <>
        {flashes.map((f, i) => {
            return (
                <Alert key={`alert-${i}`} severity={f.level}>
                    {f.message}
                </Alert>
            );
        })}
    </>
);