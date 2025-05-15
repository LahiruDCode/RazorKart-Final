import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Contents = () => {
  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState([]);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    console.log('Contents component mounted');
    // In a real app, you would fetch the seller's content items here
    // For now, we'll just set some mock data
    setContents([
      { id: 1, title: 'Product Description', type: 'text', lastUpdated: '2025-05-05' },
      { id: 2, title: 'Product Banner', type: 'image', lastUpdated: '2025-05-06' },
      { id: 3, title: 'Promotion Video', type: 'video', lastUpdated: '2025-05-07' }
    ]);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Content Management</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your product descriptions, images, and promotional content here.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      <Grid container spacing={3}>
        {contents.map((content) => (
          <Grid item xs={12} sm={6} md={4} key={content.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>{content.title}</Typography>
                <Typography variant="body2" color="text.secondary">Type: {content.type}</Typography>
                <Typography variant="body2" color="text.secondary">Last Updated: {content.lastUpdated}</Typography>
              </CardContent>
              <Divider />
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button size="small" color="primary">Edit</Button>
                <Button size="small" color="error">Delete</Button>
              </Box>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            p: 3,
            bgcolor: 'rgba(255, 57, 0, 0.05)',
            border: '2px dashed rgba(255, 57, 0, 0.2)' 
          }}>
            <Typography variant="h6" align="center" gutterBottom>Add New Content</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
            >
              Create Content
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Contents; 