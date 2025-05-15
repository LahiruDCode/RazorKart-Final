import api from '../config/api';

export const productService = {
    // Get all products with filters
    getAllProducts: async (filters = {}) => {
        try {
            const { search, category, sort, page = 1, limit = 12 } = filters;
            const response = await api.get('/products', {
                params: {
                    search,
                    category,
                    sort,
                    page,
                    limit
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get single product details
    getProductById: async (id) => {
        try {
            // Get the product with expanded seller and store information
            const response = await api.get(`/products/${id}?expand=seller,store`);
            
            // Add logging to debug the seller/store information
            console.log('Full product details with seller info:', response.data.product);
            
            // Make sure we have seller information
            if (response.data.product && !response.data.product.seller) {
                console.log('No seller info found, will use default if available');
            }
            
            return response.data;
        } catch (error) {
            console.error('Error fetching product details:', error);
            throw error.response?.data || error.message;
        }
    },

    // Get products by category
    getProductsByCategory: async (category) => {
        try {
            const response = await api.get('/products', {
                params: { category }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get featured products
    getFeaturedProducts: async () => {
        try {
            const response = await api.get('/products', {
                params: { featured: true, limit: 6 }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create new product
    createProduct: async (productData) => {
        try {
            // Validate required fields
            const requiredFields = ['name', 'description', 'price', 'category', 'stock', 'images'];
            for (const field of requiredFields) {
                if (!productData[field]) {
                    throw new Error(`${field} is required`);
                }
            }

            // Validate price and stock
            if (productData.price <= 0) {
                throw new Error('Price must be greater than 0');
            }
            if (productData.stock < 0) {
                throw new Error('Stock cannot be negative');
            }

            const response = await api.post('/products', productData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update product
    updateProduct: async (id, productData) => {
        try {
            // Validate id
            if (!id) {
                throw new Error('Product ID is required');
            }

            // Validate price and stock if provided
            if (productData.price !== undefined && productData.price <= 0) {
                throw new Error('Price must be greater than 0');
            }
            if (productData.stock !== undefined && productData.stock < 0) {
                throw new Error('Stock cannot be negative');
            }

            const response = await api.put(`/products/${id}`, productData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete product
    deleteProduct: async (id) => {
        try {
            if (!id) {
                throw new Error('Product ID is required');
            }
            const response = await api.delete(`/products/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
