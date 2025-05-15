import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

// Create the context
const AuthContext = createContext();

// Create a custom hook for using the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from local storage
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          
          // Set auth header for all future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (err) {
        console.error('Error loading auth state:', err);
        setError('Failed to restore authentication state');
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      // Store in state
      setCurrentUser(user);
      
      // Store in local storage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      // Set auth header for all future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/users/${currentUser._id}`, userData);
      const updatedUser = response.data;
      
      // Update state and storage
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete user account
  const deleteAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/users/${currentUser._id}`);
      
      // Logout after deleting account
      logout();
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Account deletion failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return currentUser?.role?.toLowerCase() === role.toLowerCase();
  };

  // Get home route based on user role
  const getHomeRoute = () => {
    if (!currentUser) return '/';
    
    switch (currentUser.role.toLowerCase()) {
      case 'admin':
        return '/admin';
      case 'seller':
        return '/seller/dashboard';
      case 'inquiry-manager':
        return '/inquiry-management';
      case 'content-manager':
        return '/content-manager/create-banner';
      case 'buyer':
      default:
        return '/';
    }
  };

  // Filter data based on user role and permissions
  const filterDataByUserRole = (data, entityType) => {
    if (!currentUser) return data; // Return all data if not logged in
    if (!Array.isArray(data)) return data; // Return data as is if not an array
    
    // If admin, return all data
    if (hasRole('admin')) return data;

    switch (entityType) {
      case 'products':
        // Sellers only see their own products
        if (hasRole('seller')) {
          return data.filter(product => 
            product.store && 
            (product.store._id === currentUser.storeId || 
             product.store === currentUser.storeId)
          );
        }
        return data;
        
      case 'orders':
        // Sellers only see orders for their products
        if (hasRole('seller')) {
          return data.filter(order => 
            order.sellerId === currentUser._id || 
            order.storeId === currentUser.storeId
          );
        }
        // Buyers only see their own orders
        if (hasRole('buyer')) {
          return data.filter(order => order.userId === currentUser._id);
        }
        return data;
        
      case 'inquiries':
        // Inquiry managers see all inquiries
        if (hasRole('inquiry-manager')) return data;
        // Others see only their own inquiries
        return data.filter(inquiry => 
          inquiry.userId === currentUser._id || 
          inquiry.email === currentUser.email
        );
        
      default:
        return data;
    }
  };

  // Provide all auth values and functions
  const value = {
    currentUser,
    loading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    deleteAccount,
    hasRole,
    getHomeRoute,
    filterDataByUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
