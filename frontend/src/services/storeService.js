import API from '../api'; // Use the main API instance with proper token handling

export const storeService = {
    // Get store details for the current authenticated user
    getStoreDetails: async () => {
        try {
            console.log('Fetching store details...');
            // First try the user-specific endpoint
            const response = await API.get('/stores/my-store');
            console.log('Store details successfully fetched:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching store details:', error);
            
            // Try the original endpoint if the specific one fails
            if (error.response?.status === 404) {
                try {
                    console.log('my-store endpoint failed, trying original endpoint...');
                    const fallbackResponse = await API.get('/stores');
                    console.log('Fallback store details fetched:', fallbackResponse.data);
                    return fallbackResponse.data;
                } catch (fallbackError) {
                    console.error('Fallback store endpoint also failed:', fallbackError);
                    // Return empty store template if no store exists
                    return { 
                        success: true, 
                        store: {
                            name: '',
                            description: '',
                            coverPhoto: '',
                            logo: '',
                            contactEmail: '',
                            contactPhone: '',
                            address: ''
                        }
                    };
                }
            }
            
            // Return empty store template as fallback
            return { 
                success: true, 
                store: {
                    name: '',
                    description: '',
                    coverPhoto: '',
                    logo: '',
                    contactEmail: '',
                    contactPhone: '',
                    address: ''
                }
            };
        }
    },

    // Update store details for the current authenticated user
    updateStore: async (storeData) => {
        try {
            console.log('Attempting to update store with:', storeData);
            
            // Get authentication token for debugging
            const token = localStorage.getItem('token');
            console.log('Using authentication token:', token ? 'Present' : 'Missing');
            
            // First try to update using the user-specific endpoint
            const response = await API.put('/stores/my-store', storeData);
            console.log('Store updated successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating store with my-store endpoint:', error);
            
            // If we get a 404, try the original endpoint
            if (error.response?.status === 404) {
                try {
                    console.log('Trying original update endpoint...');
                    const fallbackUpdateResponse = await API.put('/stores', storeData);
                    console.log('Store updated with fallback endpoint:', fallbackUpdateResponse.data);
                    return fallbackUpdateResponse.data;
                } catch (fallbackError) {
                    console.error('Fallback update also failed, trying to create instead:', fallbackError);
                    
                    // If update fails, try to create a new store
                    try {
                        console.log('Attempting to create new store...');
                        const createResponse = await API.post('/stores', storeData);
                        console.log('New store created successfully:', createResponse.data);
                        return createResponse.data;
                    } catch (createError) {
                        console.error('Error creating store:', createError);
                        // Format the error properly
                        const errorMessage = createError.response?.data?.message || 
                                             createError.message || 
                                             'Failed to create store';
                        throw { success: false, message: errorMessage };
                    }
                }
            }
            
            // Format the error properly
            const errorMessage = error.response?.data?.message || 
                                 error.message || 
                                 'Failed to update store';
            throw { success: false, message: errorMessage };
        }
    }
}; 