import api from '../config/api';

// Get the authenticated user ID from localStorage, or generate a temporary one if not available
const getUserId = () => {
  // Try to get the authenticated user from localStorage
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user && user._id) {
        console.log('Using authenticated user ID for cart:', user._id);
        return user._id;
      }
    } catch (err) {
      console.error('Error parsing user from localStorage:', err);
    }
  }
  
  // Fallback to temporary ID if no authenticated user
  let tempUserId = localStorage.getItem('tempUserId');
  if (!tempUserId) {
    tempUserId = 'temp-user-' + Date.now();
    localStorage.setItem('tempUserId', tempUserId);
    console.log('Created temporary user ID for cart:', tempUserId);
  }
  return tempUserId;
};

export const cartService = {
  // Test cart
  testCart: async () => {
    try {
      const userId = getUserId();
      const response = await api.get('/cart/test', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Cart test error:', error);
      throw error.response?.data || error;
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity) => {
    try {
      const userId = getUserId();
      console.log(`Adding product ${productId} to cart for user ${userId}`);
      const response = await api.post('/cart/add', { 
        productId, 
        quantity,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error.response?.data || error;
    }
  },

  // Get cart items
  getCartItems: async () => {
    try {
      const userId = getUserId();
      console.log(`Fetching cart items for user: ${userId}`);
      const response = await api.get('/cart/items', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Get cart items error:', error);
      throw error.response?.data || error;
    }
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    try {
      const userId = getUserId();
      console.log(`Removing product ${productId} from cart for user: ${userId}`);
      const response = await api.delete(`/cart/remove/${productId}`, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Remove from cart error:', error);
      throw error.response?.data || error;
    }
  },

  // Update cart item quantity
  updateCartItem: async (productId, quantity) => {
    try {
      const userId = getUserId();
      console.log(`Updating product ${productId} quantity to ${quantity} for user: ${userId}`);
      const response = await api.put(`/cart/update/${productId}`, {
        quantity,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Update cart item error:', error);
      throw error.response?.data || error;
    }
  }
};
