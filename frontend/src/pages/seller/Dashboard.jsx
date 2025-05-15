import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateProductsPDF } from '../../utils/productsReport';
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  LocalOffer as TagIcon,
  Category as CategoryIcon,
  Star as StarIcon,
  AttachMoney as MoneyIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF5252', '#7C4DFF', '#00BFA5'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for product data
  const [products, setProducts] = useState([]);
  const [productStats, setProductStats] = useState({
    totalProducts: 0,
    outOfStock: 0,
    lowStock: 0,
    avgRating: 0
  });
  
  // State for category distribution
  const [categoryData, setCategoryData] = useState([]);
  
  // Format the stats for products
  const stats = [
    { 
      title: 'Total Products',
      value: String(productStats.totalProducts),
      icon: <InventoryIcon />,
      color: '#2196f3'
    },
    { 
      title: 'Average Rating',
      value: productStats.avgRating.toFixed(1),
      icon: <StarIcon />,
      color: '#FF9800'
    },
    { 
      title: 'Out of Stock',
      value: String(productStats.outOfStock),
      icon: <TagIcon />,
      color: productStats.outOfStock > 5 ? '#f44336' : '#4caf50'
    },
    { 
      title: 'Categories',
      value: String(categoryData.length),
      icon: <CategoryIcon />,
      color: '#9c27b0'
    }
  ];
  
  // Function to handle PDF export
  const handleExportPDF = () => {
    generateProductsPDF(products, 'RazorKart Seller Product Inventory');
  };

  // Fetch product data when component mounts
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const baseUrl = 'http://localhost:5001'; // Explicit backend URL
        
        // Fetch seller's products
        const response = await fetch(`${baseUrl}/api/seller/my-products`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching products: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Seller products data:', data);
        
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
          
          // Calculate product statistics
          const outOfStock = data.products.filter(p => p.stock === 0).length;
          const lowStock = data.products.filter(p => p.stock > 0 && p.stock < 10).length;
          const totalRating = data.products.reduce((sum, p) => sum + (p.rating || 0), 0);
          const avgRating = data.products.length > 0 ? totalRating / data.products.length : 0;
          
          setProductStats({
            totalProducts: data.products.length,
            outOfStock,
            lowStock,
            avgRating
          });
          
          // Calculate category distribution
          const categories = {};
          data.products.forEach(product => {
            const category = product.category || 'Uncategorized';
            categories[category] = (categories[category] || 0) + 1;
          });
          
          const formattedCategories = Object.keys(categories).map(name => ({
            name,
            value: categories[name]
          }));
          
          setCategoryData(formattedCategories);
        }
      } catch (err) {
        console.error('Error fetching product data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '100%'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1, color: stat.color }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}15`,
                      color: stat.color
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Paper>
              </motion.div>
            </Grid>
          ))}

          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Category Distribution</Typography>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={handleExportPDF}
                    sx={{ 
                      bgcolor: '#FF6600', 
                      '&:hover': { bgcolor: '#FF8C00' },
                      fontSize: '0.75rem'
                    }}
                  >
                    Export PDF
                  </Button>
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Inventory Status</Typography>
                  <Chip 
                    label={`${productStats.lowStock} Low Stock`} 
                    color="warning" 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Stock</TableCell>
                        <TableCell align="right">Rating</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {products.slice(0, 5).map((product) => (
                        <TableRow key={product._id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                src={product.images && product.images[0]}
                                variant="rounded"
                                sx={{ width: 40, height: 40, mr: 2, bgcolor: COLORS[Math.floor(Math.random() * COLORS.length)] }}
                              >
                                {product.name.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                {product.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={product.stock}
                              size="small"
                              color={product.stock === 0 ? 'error' : product.stock < 10 ? 'warning' : 'success'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <StarIcon sx={{ color: '#FFB400', fontSize: 16, mr: 0.5 }} />
                              <Typography variant="body2">{product.rating ? product.rating.toFixed(1) : 'N/A'}</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {products.length > 5 && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button variant="text" onClick={() => {}} size="small">
                      View All Products
                    </Button>
                  </Box>
                )}
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Product Details</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Stock</TableCell>
                        <TableCell align="right">Rating</TableCell>
                        <TableCell align="right">Reviews</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product._id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                              {product.description}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                          <TableCell align="right">{product.stock}</TableCell>
                          <TableCell align="right">{product.rating ? product.rating.toFixed(1) : 'N/A'}</TableCell>
                          <TableCell align="right">{product.numReviews || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;