import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SetupSellerProducts from './SetupSellerProducts';
import {
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert,
  Snackbar,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CardActions,
  InputAdornment,
  TextField as MuiTextField,
  Pagination,
  Stack,
  Chip,
  Tooltip,
  Fade,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Modal,
  Rating
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Image as ImageIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { setProducts, setLoading, setError, addProduct, removeProduct, updateProduct } from '../../redux/slices/productSlice';

const resizeImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 800;
        const size = Math.min(maxSize, Math.max(img.width, img.height));
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        
        let dx = 0, dy = 0, dWidth = size, dHeight = size;
        const aspectRatio = img.width / img.height;
        
        if (aspectRatio > 1) {
          dHeight = size / aspectRatio;
          dy = (size - dHeight) / 2;
        } else if (aspectRatio < 1) {
          dWidth = size * aspectRatio;
          dx = (size - dWidth) / 2;
        }
        
        ctx.drawImage(img, dx, dy, dWidth, dHeight);
        const resizedImage = canvas.toDataURL('image/jpeg', 0.7);
        resolve(resizedImage);
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const ITEMS_PER_PAGE = 8;

const categories = [
  'Electronics',
  'Clothing',
  'Books',
  'Home & Garden',
  'Sports',
  'Toys',
  'Beauty',
  'Food'
];

const sortOptions = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'price_asc', label: 'Price (Low-High)' },
  { value: 'price_desc', label: 'Price (High-Low)' },
  { value: 'stock_asc', label: 'Stock (Low-High)' },
  { value: 'stock_desc', label: 'Stock (High-Low)' }
];

const initialProductState = {
  name: '',
  description: '',
  price: '',
  category: '',
  stock: '',
  images: []
};

// Initial state for preview modal
const initialPreviewState = {
  open: false,
  product: null,
  currentImageIndex: 0
};

const Listing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.product);
  
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newProduct, setNewProduct] = useState(initialProductState);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');
  const [page, setPage] = useState(1);
  const [imagePreview, setImagePreview] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [previewModal, setPreviewModal] = useState({ open: false, product: null, currentImageIndex: 0 });
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [setupMessage, setSetupMessage] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setSellerEmail(user.email);
      } catch (err) {
        console.error('Error parsing user from localStorage:', err);
      }
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      console.log('Fetching seller products...');
      
      // Get current user from localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('User not authenticated');
      }
      
      const user = JSON.parse(storedUser);
      console.log(`Fetching products for seller: ${user.username} (${user._id})`);
      
      // Use the exact endpoint that was working before with direct userId parameter
      console.log(`Calling seller products API endpoint for userId: ${user._id}`);
      
      // IMPORTANT: This is the endpoint that was working before - we're returning to it
      // Adding userId explicitly to ensure proper filtering
      const response = await API.get('/products', {
        params: {
          seller: user._id  // Add the userId as a query parameter for filtering
        }
      });
      
      console.log('Response received:', response?.status, response?.data?.success);
      
      if (response?.data?.success && Array.isArray(response.data.products)) {
        const fetchedProducts = response.data.products || [];
        console.log(`Successfully fetched ${fetchedProducts.length} products for seller ${user.username}`);
        
        // No need to show setup dialog automatically
        console.log(`Products found for seller ${user.username}: ${fetchedProducts.length}`);
        
        // Validate each product
        const validProducts = fetchedProducts.filter(product => {
          if (!product || !product._id) {
            console.warn('Invalid product found:', product);
            return false;
          }
          if (!product.images || product.images.length === 0) {
            console.warn(`Product ${product._id} (${product.name}) has no images`);
          }
          return true;
        });

        console.log(`${validProducts.length} valid products after filtering`);
        dispatch(setProducts(validProducts));
      } else {
        throw new Error('Error fetching products: ' + (response?.data?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      dispatch(setError(error.message || 'Failed to fetch products'));
      
      // Show error in snackbar
      setSnackbar({
        open: true,
        message: `Error: ${error.message || 'Failed to fetch products'}`,
        severity: 'error'
      });
      
      // Initialize with empty products array
      dispatch(setProducts([]));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleOpen = (product = null) => {
    if (product) {
      setSelectedProduct(product);
      setNewProduct({
        ...product,
        images: Array.isArray(product.images) ? [...product.images] : []
      });
      setEditMode(true);
      setImagePreview(Array.isArray(product.images) ? [...product.images] : []);
    } else {
      setSelectedProduct(null);
      setNewProduct(initialProductState);
      setEditMode(false);
      setImagePreview([]);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
    setNewProduct(initialProductState);
    setEditMode(false);
    setImagePreview([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Special handling for category to ensure it's a valid value
    if (name === 'category' && !categories.includes(value)) {
      return;
    }
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      showSnackbar('Please select valid image files', 'error');
      return;
    }

    try {
      const newImages = [];
      const newPreviews = [];

      for (const file of validFiles) {
        const resizedImage = await resizeImage(file);
        newImages.push(resizedImage);
        newPreviews.push(URL.createObjectURL(file));
      }

      setNewProduct(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
      setImagePreview(prev => [...prev, ...newPreviews]);
    } catch (error) {
      console.error('Error processing images:', error);
      showSnackbar('Error processing images. Please try again.', 'error');
    }
  };

  const handleRemoveImage = (index) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      const errors = [];
      
      if (!newProduct.name?.trim()) {
        errors.push('Product name is required');
      }
      
      if (!newProduct.description?.trim()) {
        errors.push('Product description is required');
      }
      
      if (!newProduct.price || isNaN(parseFloat(newProduct.price)) || parseFloat(newProduct.price) <= 0) {
        errors.push('Please enter a valid price greater than 0');
      }
      
      if (!newProduct.category) {
        errors.push('Please select a valid category');
      }
      
      if (!newProduct.stock || isNaN(parseInt(newProduct.stock)) || parseInt(newProduct.stock) < 0) {
        errors.push('Please enter a valid stock quantity');
      }
      
      if (!newProduct.images?.length) {
        errors.push('At least one product image is required');
      }
      
      if (errors.length > 0) {
        showSnackbar(errors.join('\n'), 'error');
        return;
      }

      // Get current user from localStorage to ensure userId is associated
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        showSnackbar('User not authenticated. Please log in again.', 'error');
        return;
      }
      
      const user = JSON.parse(storedUser);
      console.log(`Creating/updating product as user: ${user.username} (${user._id})`);

      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        // Explicitly include userId as a string to ensure proper MongoDB handling
        userId: user._id.toString()
      };

      console.log('Submitting product data:', productData);

      if (editMode) {
        console.log('Updating product:', selectedProduct._id);
        const response = await API.put(`/products/${selectedProduct._id}`, productData);
        console.log('Update response:', response.data);
        
        if (response.data.success) {
          dispatch(updateProduct({ id: selectedProduct._id, product: response.data.product }));
          showSnackbar('Product updated successfully', 'success');
          handleClose();
          await fetchProducts(); // Refresh the products list
        } else {
          throw new Error(response.data.message || 'Failed to update product');
        }
      } else {
        console.log('Creating new product with data:', productData);
        const response = await API.post('/products', productData);
        console.log('Create response:', response.data);
        
        if (response.data.success) {
          dispatch(addProduct(response.data.product));
          showSnackbar('Product added successfully', 'success');
          handleClose();
          await fetchProducts(); // Refresh the products list
        } else {
          throw new Error(response.data.message || 'Failed to create product');
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save product';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setProductToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) {
      console.error('No product selected for deletion');
      return;
    }

    try {
      console.log('Attempting to delete product:', {
        id: productToDelete._id,
        name: productToDelete.name
      });
      
      const response = await API.delete(`/products/${productToDelete._id}`);
      console.log('Delete response:', response);
      
      if (response?.data?.success) {
        console.log('Product deleted successfully');
        dispatch(removeProduct(productToDelete._id));
        showSnackbar('Product deleted successfully', 'success');
        
        // Refresh the products list
        await fetchProducts();
      } else {
        throw new Error(response?.data?.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', {
        id: productToDelete._id,
        name: productToDelete.name,
        error: error.response?.data || error.message
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete product';
      showSnackbar(errorMessage, 'error');
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleViewProduct = (productId) => {
    // Find the product from the products array
    const product = products.find(p => p._id === productId);
    
    if (product) {
      // Open the preview modal with the selected product
      setPreviewModal({
        open: true, 
        product: product,
        currentImageIndex: 0
      });
    } else {
      showSnackbar('Product not found', 'error');
    }
  };
  
  // Function to handle image navigation in preview modal
  const handlePreviewImageNavigation = (direction) => {
    const { product, currentImageIndex } = previewModal;
    
    if (!product?.images?.length) return;
    
    let newIndex = currentImageIndex;
    if (direction === 'next') {
      newIndex = (currentImageIndex + 1) % product.images.length;
    } else {
      newIndex = currentImageIndex === 0 ? product.images.length - 1 : currentImageIndex - 1;
    }
    
    setPreviewModal(prev => ({
      ...prev,
      currentImageIndex: newIndex
    }));
  };
  
  // Function to close the preview modal
  const handleClosePreview = () => {
    setPreviewModal({
      open: false,
      product: null,
      currentImageIndex: 0
    });
  };

  const filteredProducts = (products || [])
    .filter(product => {
      if (!product || !product._id) {
        console.log('Invalid product found:', product);
        return false;
      }
      
      // Search filter
      const searchTerm = searchQuery.toLowerCase().trim();
      const matchesSearch = searchTerm === '' || 
        (product.name?.toLowerCase() || '').includes(searchTerm) ||
        (product.description?.toLowerCase() || '').includes(searchTerm);
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      
      switch (sortBy) {
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'price_asc':
          return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
        case 'price_desc':
          return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
        case 'stock_asc':
          return (parseInt(a.stock) || 0) - (parseInt(b.stock) || 0);
        case 'stock_desc':
          return (parseInt(b.stock) || 0) - (parseInt(a.stock) || 0);
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleSetupSellerProducts = async () => {
    try {
      if (!sellerEmail) {
        showSnackbar('Please enter your seller email', 'error');
        return;
      }
      
      dispatch(setLoading(true));
      console.log('Setting up products for seller:', sellerEmail);
      
      const response = await API.post('/seller-products/setup-seller-products', { email: sellerEmail });
      console.log('Setup result:', response.data);
      
      setSetupMessage(response.data?.message || 'Setup completed successfully');
      showSnackbar('Products have been assigned to your account', 'success');
      
      // Refresh the product list after setup
      fetchProducts();
      setSetupDialogOpen(false);
    } catch (error) {
      console.error('Setup error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to set up seller products';
      setSetupMessage('Error: ' + errorMessage);
      showSnackbar('Error setting up products: ' + errorMessage, 'error');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Product Listing
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add New Product
        </Button>
      </Box>

      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                      transition: 'transform 0.2s ease-in-out',
                    },
                    position: 'relative',
                    overflow: 'visible'
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.images?.[0] || 'https://via.placeholder.com/200?text=No+Image'}
                    alt={product.name || 'Product Image'}
                    sx={{ 
                      objectFit: 'cover',
                      backgroundColor: 'grey.100'
                    }}
                    onClick={() => handleViewProduct(product._id)}
                  />
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Typography 
                      gutterBottom 
                      variant="h6" 
                      component="h2" 
                      noWrap
                      sx={{ 
                        cursor: 'pointer',
                        fontWeight: 'medium',
                        color: 'text.primary',
                        mb: 1
                      }}
                      onClick={() => handleViewProduct(product._id)}
                    >
                      {product.name || 'Untitled Product'}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ mb: 1 }}
                    >
                      Category: {product.category || 'Uncategorized'}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color="primary" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 'bold',
                        mb: 1
                      }}
                    >
                      ${product.price?.toFixed(2) || '0.00'}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={product.stock > 0 ? 'success.main' : 'error.main'}
                      sx={{ fontWeight: 'medium' }}
                    >
                      {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                    </Typography>
                  </CardContent>
                  <CardActions 
                    sx={{ 
                      justifyContent: 'flex-start', 
                      px: 2, 
                      pb: 2,
                      gap: 1
                    }}
                  >
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProduct(product._id);
                      }}
                      sx={{
                        '&:hover': { backgroundColor: 'primary.light' }
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpen(product);
                      }}
                      sx={{
                        '&:hover': { backgroundColor: 'primary.light' }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(product);
                      }}
                      sx={{
                        '&:hover': { backgroundColor: 'error.light' }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stock"
                  name="stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required error={!newProduct.category}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={newProduct.category || ''}
                    label="Category"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="" disabled>
                      Select a category
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                  {!newProduct.category && (
                    <FormHelperText>Please select a category</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                  fullWidth
                >
                  Upload Images
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                </Button>
                {imagePreview && imagePreview.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Preview Images ({imagePreview.length})
                    </Typography>
                    <Grid container spacing={1}>
                      {imagePreview.map((preview, index) => (
                        <Grid item xs={4} key={index}>
                          <Box sx={{ position: 'relative' }}>
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                            />
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                }
                              }}
                              onClick={() => handleRemoveImage(index)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editMode ? 'Update' : 'Add'} Product
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <DeleteIcon color="error" />
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete{' '}
            <Typography component="span" fontWeight="bold" color="error">
              {productToDelete?.name}
            </Typography>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              '&:hover': {
                bgcolor: 'error.dark'
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {setupDialogOpen && (
        <Dialog
          open={setupDialogOpen}
          onClose={() => setSetupDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <SetupSellerProducts onClose={() => {
            setSetupDialogOpen(false);
            // Refresh the products list after setup
            fetchProducts();
          }} />
        </Dialog>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 7 }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
          sx={{ 
            width: '100%',
            minWidth: '300px',
            boxShadow: 3,
            '& .MuiAlert-icon': {
              fontSize: '24px'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Product Preview Modal */}
      <Dialog
        open={previewModal.open}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'visible',
            p: 0
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'primary.main',
          color: 'white',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8
        }}>
          <Typography variant="h6" component="div">
            Product Preview
          </Typography>
          <IconButton
            onClick={handleClosePreview}
            size="small"
            sx={{ color: 'white' }}
          >
            <DeleteIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {previewModal.product && (
            <Grid container spacing={0}>
              {/* Product Image Section */}
              <Grid item xs={12} md={6} sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    height: 400,
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'black',
                    borderBottomLeftRadius: { md: 8 }
                  }}
                >
                  {previewModal.product.images && previewModal.product.images.length > 0 ? (
                    <>
                      <Box
                        component="img"
                        src={previewModal.product.images[previewModal.currentImageIndex]}
                        alt={previewModal.product.name}
                        sx={{
                          maxHeight: '100%',
                          maxWidth: '100%',
                          objectFit: 'contain'
                        }}
                      />
                      {previewModal.product.images.length > 1 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            p: 1,
                            bgcolor: 'rgba(0,0,0,0.5)'
                          }}
                        >
                          {previewModal.product.images.map((_, index) => (
                            <Box
                              key={index}
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                mx: 0.5,
                                bgcolor: index === previewModal.currentImageIndex ? 'primary.main' : 'grey.500',
                                cursor: 'pointer'
                              }}
                              onClick={() => setPreviewModal(prev => ({ ...prev, currentImageIndex: index }))}
                            />
                          ))}
                        </Box>
                      )}
                      <IconButton
                        sx={{
                          position: 'absolute',
                          left: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.3)',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' }
                        }}
                        onClick={() => handlePreviewImageNavigation('prev')}
                      >
                        <Box>❮</Box>
                      </IconButton>
                      <IconButton
                        sx={{
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.3)',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' }
                        }}
                        onClick={() => handlePreviewImageNavigation('next')}
                      >
                        <Box>❯</Box>
                      </IconButton>
                    </>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 60, color: 'grey.500', mb: 2 }} />
                      <Typography variant="subtitle1" color="grey.500">
                        No images available
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              
              {/* Product Details Section */}
              <Grid item xs={12} md={6} sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {previewModal.product.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ mr: 2 }}>
                    ${Number(previewModal.product.price).toFixed(2)}
                  </Typography>
                  
                  {previewModal.product.category && (
                    <Chip 
                      label={previewModal.product.category} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  )}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {previewModal.product.description || 'No description available'}
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Stock Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        height: 10,
                        width: 10,
                        borderRadius: '50%',
                        bgcolor: previewModal.product.stock > 0 ? 'success.main' : 'error.main',
                        mr: 1
                      }}
                    />
                    <Typography variant="body2">
                      {previewModal.product.stock > 0 ? `In Stock (${previewModal.product.stock} available)` : 'Out of Stock'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 'auto' }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    startIcon={<EditIcon />}
                    onClick={() => {
                      handleClosePreview();
                      handleOpen(previewModal.product);
                    }}
                    sx={{ mb: 1, borderRadius: 2 }}
                  >
                    Edit Product
                  </Button>
                  <Button 
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      handleClosePreview();
                      setProductToDelete(previewModal.product);
                      setDeleteDialogOpen(true);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    Delete Product
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Listing;