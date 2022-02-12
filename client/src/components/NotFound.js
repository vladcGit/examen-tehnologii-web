import React from 'react';
import { Typography } from '@mui/material';

export default function NotFound() {
  return (
    <div className="container">
      <Typography
        component="h1"
        variant="h2"
        align="center"
        color="text.primary"
        gutterBottom
      >
        404 - Not found
      </Typography>
    </div>
  );
}
