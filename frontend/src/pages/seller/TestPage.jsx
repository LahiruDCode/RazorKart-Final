import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const TestPage = () => {
  console.log('TestPage component rendering');
  
  return (
    <Paper elevation={0} sx={{ p: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Test Page
      </Typography>
      <Typography variant="body1">
        This is a test page to verify routing is working correctly.
      </Typography>
    </Paper>
  );
};

export default TestPage;
