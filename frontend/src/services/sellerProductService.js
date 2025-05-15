import api from '../api';

export const sellerProductService = {
    // Get all products for the current logged in seller
    getMyProducts: async () => {
        try {
            const response = await api.get('/seller-products/my-products');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Setup to associate existing products with a specific seller
    setupSellerProducts: async (email) => {
        try {
            const response = await api.post('/seller-products/setup-seller-products', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default sellerProductService;
