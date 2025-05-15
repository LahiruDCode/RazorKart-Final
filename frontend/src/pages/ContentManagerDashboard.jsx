import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Button,
  Typography,
  Container,
  Paper,
  Grid,
  TextField,
  MenuItem,
  styled
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

// Styled components
const StyledAppBar = styled(AppBar)({
  backgroundColor: '#FF6600',
});

const StyledButton = styled(Button)({
  color: '#FFFFFF',
  margin: '0 10px',
  '&:hover': {
    backgroundColor: '#FF3900',
  },
});

// Options for audience selector
const audienceOptions = [
  { value: 'buyers', label: 'Buyers' },
  { value: 'sellers', label: 'Sellers' }
];

const ContentManagerDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('create-banner');
  
  // Banner form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: '',
    startDate: '',
    endDate: '',
    bannerImage: null
  });
  
  const [preview, setPreview] = useState(null);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFormData({
      ...formData,
      bannerImage: file
    });
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // API call would go here
  };
  
  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'create-banner':
        return (
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
              Create Promotional Banner
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    variant="outlined"
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    variant="outlined"
                    multiline
                    rows={4}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Target Audience"
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleChange}
                    variant="outlined"
                    required
                  >
                    {audienceOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    sx={{ height: '100%', width: '100%' }}
                  >
                    Upload Banner Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      hidden
                    />
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                
                {preview && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Preview:
                    </Typography>
                    <Box
                      component="img"
                      src={preview}
                      alt="Banner Preview"
                      sx={{
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'contain',
                        borderRadius: 1,
                        border: '1px solid #ddd'
                      }}
                    />
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                  >
                    Create Banner
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        );
      
      case 'ongoing-ads':
        return (
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
              Ongoing Advertisements
            </Typography>
            <Typography variant="body1" align="center" sx={{ mt: 4 }}>
              No ongoing advertisements found.
            </Typography>
          </Paper>
        );
        
      case 'seller-ads':
        return (
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
              Seller Advertisements
            </Typography>
            <Typography variant="body1" align="center" sx={{ mt: 4 }}>
              No seller advertisement requests pending.
            </Typography>
          </Paper>
        );
        
      default:
        return (
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
              Welcome to Content Manager Dashboard
            </Typography>
            <Typography variant="body1" align="center">
              Select an option from the navigation bar above.
            </Typography>
          </Paper>
        );
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledAppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Content Manager Dashboard
          </Typography>
          <StyledButton onClick={() => setActiveSection('create-banner')}>
            CREATE BANNER
          </StyledButton>
          <StyledButton onClick={() => setActiveSection('ongoing-ads')}>
            ONGOING ADS
          </StyledButton>
          <StyledButton onClick={() => setActiveSection('seller-ads')}>
            SELLER ADS
          </StyledButton>
          <StyledButton onClick={() => navigate('/')}>
            HOME
          </StyledButton>
        </Toolbar>
      </StyledAppBar>
      <Container maxWidth="lg">
        {renderContent()}
      </Container>
    </Box>
  );
};

export default ContentManagerDashboard;
