import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const TestComponent = () => {
  return (
    <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Test Component
      </Typography>
      <Typography variant="body1">
        This is a simple test component to check if rendering works correctly.
      </Typography>
      <Box sx={{ height: '200px', backgroundColor: '#f0f0f0', mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6">Content Area</Typography>
      </Box>
    </Paper>
  );
};

export default TestComponent;
