import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, GlobalStyles, Typography, Paper } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Dashboard from './pages/seller/Dashboard';
import SellerLayout from './layouts/SellerLayout';
import AddProduct from './components/AddProduct';
import Orders from './pages/seller/Orders';
import Performance from './pages/seller/Performance';
import Payments from './pages/seller/Payments';
import Sales from './pages/seller/Sales';
import Contents from './pages/seller/Contents';
import Inquiry from './pages/seller/Inquiry';
import StoreSettings from './pages/seller/StoreSettings';
import Listing from './pages/seller/Listing';
import TestPage from './pages/seller/TestPage';
import MyProducts from './components/seller/MyProducts';

// Authentication Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Profile from './components/user/Profile';
import AccountSettings from './components/user/AccountSettings';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import ManageUsers from './components/admin/ManageUsers';
import RoleRequests from './components/admin/RoleRequests';
import AdminProfile from './components/admin/Profile';

// Inquiry Management Components
import InquiryForm from './components/inquiry/InquiryForm/InquiryForm';
import ViewInquiries from './components/inquiry/ViewInquiries/ViewInquiries';
import InquiryDetails from './components/inquiry/InquiryDetails/InquiryDetails';
import InquiryDashboard from './components/inquiry/InquiryManager/InquiryDashboard';
import TemplateManagement from './components/inquiry/TemplateManagement/TemplateManagement';

// Content Manager Components
import ContentManagerDashboard from './pages/ContentManagerDashboard';
import ContentManagerLayout from './components/contentManager/ContentManagerLayout';
import CreateBanner from './components/contentManager/CreateBanner';
import OngoingAds from './components/contentManager/OngoingAds';
import SellerAds from './components/contentManager/SellerAds';
import TestComponent from './components/contentManager/TestComponent';

// Context and Loaders
import { LoadingProvider, useLoading } from './context/LoadingContext';
import { AuthProvider } from './context/AuthContext';
import PageTransitionLoader from './components/common/PageTransitionLoader';

import theme from './theme';
import './styles/theme.css';
import './styles/inquiry.css';

const globalStyles = {
  '*': {
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
  },
  body: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    color: '#333',
    backgroundColor: '#f5f5f5',
  },
  a: {
    textDecoration: 'none',
    color: 'inherit',
  }
};

// Wrapper for admin routes with loading context
const AdminRoutes = () => {
  const { loading, setLoading } = useLoading();
  
  return (
    <>
      {loading && <PageTransitionLoader />}
      <Routes>
        <Route path="/" element={<AdminDashboard setLoading={setLoading} />} />
        <Route path="/users" element={<ManageUsers setLoading={setLoading} />} />
        <Route path="/role-requests" element={<RoleRequests setLoading={setLoading} />} />
        <Route path="/profile" element={<AdminProfile setLoading={setLoading} />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </>
  );
};

// Wrapper for seller routes
const SellerRoutes = () => {
  return (
    <SellerLayout>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="listing" element={<Listing />} />
        <Route path="add-product" element={<AddProduct />} />
        <Route path="performance" element={<Performance />} />
        <Route path="payments" element={<Payments />} />
        <Route path="sales" element={<Sales />} />
        <Route path="content" element={<Contents />} />
        <Route path="inquiry" element={<Inquiry />} />
        <Route path="settings" element={<StoreSettings />} />
        <Route path="*" element={<Navigate to="/seller/dashboard" replace />} />
      </Routes>
    </SellerLayout>
  );
};

// Wrapper for content manager routes
const ContentManagerRoutes = () => {
  return (
    <ContentManagerLayout>
      <Routes>
        <Route path="create-banner" element={<TestComponent />} />
        <Route path="ongoing-ads" element={<OngoingAds />} />
        <Route path="seller-ads" element={<SellerAds />} />
        <Route path="*" element={<Navigate to="/content-manager/create-banner" replace />} />
      </Routes>
    </ContentManagerLayout>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={globalStyles} />
      <AuthProvider>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            width: '100%',
            bgcolor: 'background.default'
          }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <>
                <Navbar />
                <Home />
              </>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/products" element={
              <>
                <Navbar />
                <Products />
              </>
            } />
            <Route path="/products/:id" element={
              <>
                <Navbar />
                <ProductDetails />
              </>
            } />
            
            {/* Protected User Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Navbar />
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/account-settings" element={
              <ProtectedRoute>
                <Navbar />
                <AccountSettings />
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute>
                <Navbar />
                <Cart />
              </ProtectedRoute>
            } />
            
            <Route path="/my-orders" element={
              <ProtectedRoute>
                <Navbar />
                {/* Import MyOrders component at the top of the file */}
                <React.Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><Typography>Loading...</Typography></Box>}>
                  <Box sx={{ py: 2 }}>
                    {React.createElement(React.lazy(() => import('./pages/user/MyOrders')))} 
                  </Box>
                </React.Suspense>
              </ProtectedRoute>
            } />
            
            <Route path="/my-inquiries" element={
              <ProtectedRoute>
                <Navbar />
                {/* Import MyInquiries component at the top of the file */}
                <React.Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><Typography>Loading...</Typography></Box>}>
                  <Box sx={{ py: 2 }}>
                    {React.createElement(React.lazy(() => import('./pages/user/MyInquiries')))}
                  </Box>
                </React.Suspense>
              </ProtectedRoute>
            } />
            
            <Route path="/inquiries/:inquiryId" element={
              <ProtectedRoute>
                <Navbar />
                {/* Import InquiryDetail component */}
                <React.Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><Typography>Loading...</Typography></Box>}>
                  <Box sx={{ py: 2 }}>
                    {React.createElement(React.lazy(() => import('./pages/user/InquiryDetail')))}
                  </Box>
                </React.Suspense>
              </ProtectedRoute>
            } />
            
            {/* Public Inquiry Submission */}
            <Route path="/submit-inquiry" element={
              <>
                <Navbar />
                <InquiryForm />
              </>
            } />
            
            {/* Role-Protected Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <LoadingProvider>
                  <AdminRoutes />
                </LoadingProvider>
              </ProtectedRoute>
            } />
            
            {/* Seller Routes - Direct Implementation */}
            <Route path="/seller" element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerLayout>
                  <Dashboard />
                </SellerLayout>
              </ProtectedRoute>
            } />
            <Route path="/seller/dashboard" element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerLayout>
                  <Dashboard />
                </SellerLayout>
              </ProtectedRoute>
            } />
            <Route path="/seller/listing" element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerLayout>
                  <Listing />
                </SellerLayout>
              </ProtectedRoute>
            } />
            <Route path="/seller/store-settings" element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerLayout>
                  <StoreSettings />
                </SellerLayout>
              </ProtectedRoute>
            } />
            <Route path="/seller/products" element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerLayout>
                  <MyProducts />
                </SellerLayout>
              </ProtectedRoute>
            } />
            <Route path="/seller/test" element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerLayout>
                  <TestPage />
                </SellerLayout>
              </ProtectedRoute>
            } />
            <Route path="/seller/orders" element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerLayout>
                  <Orders />
                </SellerLayout>
              </ProtectedRoute>
            } />
            <Route path="/seller/performance" element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerLayout>
                  <Performance />
                </SellerLayout>
              </ProtectedRoute>
            } />
            <Route path="/seller/payments" element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerLayout>
                  <Payments />
                </SellerLayout>
              </ProtectedRoute>
            } />
            <Route path="/seller/sales" element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerLayout>
                  <Sales />
                </SellerLayout>
              </ProtectedRoute>
            } />
            <Route path="/seller/contents" element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerLayout>
                  <Contents />
                </SellerLayout>
              </ProtectedRoute>
            } />
            <Route path="/seller/inquiry" element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerLayout>
                  <Inquiry />
                </SellerLayout>
              </ProtectedRoute>
            } />
            
            {/* Content Manager Routes */}
            <Route path="/content-manager/*" element={
              <ProtectedRoute allowedRoles={['content-manager']}>
                <ContentManagerDashboard />
              </ProtectedRoute>
            } />
            
            {/* Inquiry Management Routes */}
            <Route path="/inquiry-management" element={
              <ProtectedRoute allowedRoles={['inquiry-manager', 'admin']}>
                <Navbar />
                <InquiryDashboard />
              </ProtectedRoute>
            } />
            <Route path="/view-inquiries" element={
              <ProtectedRoute allowedRoles={['inquiry-manager', 'admin']}>
                <Navbar />
                <ViewInquiries />
              </ProtectedRoute>
            } />
            <Route path="/inquiry/:id" element={
              <ProtectedRoute allowedRoles={['inquiry-manager', 'admin']}>
                <Navbar />
                <InquiryDetails />
              </ProtectedRoute>
            } />
            <Route path="/inquiry-templates" element={
              <ProtectedRoute allowedRoles={['inquiry-manager', 'admin']}>
                <Navbar />
                <TemplateManagement />
              </ProtectedRoute>
            } />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;