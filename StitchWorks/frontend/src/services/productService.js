import api from './api';

const productService = {
    // Categories
    getAllCategories: async () => {
        const response = await api.get('/categories');
        return response.data;
    },
    createCategory: async (data) => {
        const response = await api.post('/categories', data);
        return response.data;
    },
    updateCategory: async (id, data) => {
        const response = await api.put(`/categories/${id}`, data);
        return response.data;
    },
    deleteCategory: async (id) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    },

    // Sizes
    getAllSizes: async () => {
        try {
            const response = await api.get('/sizes');
            return response.data;
        } catch (err) {
            // If unauthorized, try public endpoint fallback
            if (err?.response?.status === 403) {
                const resp = await api.get('/public/sizes');
                return resp.data;
            }
            throw err;
        }
    },
    getSizeById: async (id) => {
        const response = await api.get(`/sizes/${id}`);
        return response.data;
    },
    createSize: async (data) => {
        const response = await api.post('/sizes', data);
        return response.data;
    },
    createSizeWithMeasurements: async (formData) => {
        const response = await api.post('/sizes/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    updateSize: async (id, data) => {
        const response = await api.put(`/sizes/${id}`, data);
        return response.data;
    },
    updateSizeWithMeasurements: async (id, formData) => {
        const response = await api.put(`/sizes/${id}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    deleteSize: async (id) => {
        const response = await api.delete(`/sizes/${id}`);
        return response.data;
    },
    downloadPatternBlock: async (filePath) => {
        if (!filePath) throw new Error('No file path provided');
        const response = await api.get(filePath, { responseType: 'blob' });
        return response.data;
    },

    // Colors
    getAllColors: async () => {
        const response = await api.get('/colors');
        return response.data;
    },
    createColor: async (data) => {
        const response = await api.post('/colors', data);
        return response.data;
    },
    updateColor: async (id, data) => {
        const response = await api.put(`/colors/${id}`, data);
        return response.data;
    },
    deleteColor: async (id) => {
        const response = await api.delete(`/colors/${id}`);
        return response.data;
    },

    // Products
    getAllProducts: async () => {
        const response = await api.get('/products');
        return response.data;
    },
    getProductById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },
    createProduct: async (data) => {
        if (data instanceof FormData) {
            const response = await api.post('/products', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        }
        const response = await api.post('/products', data);
        return response.data;
    },
    updateProduct: async (id, data) => {
        if (data instanceof FormData) {
            const response = await api.post(`/products/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        }
        const response = await api.put(`/products/${id}`, data);
        return response.data;
    },
    deleteProduct: async (id) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    // BOM
    getBomsByProduct: async (productId) => {
        const response = await api.get(`/bom/${productId}`);
        return response.data;
    },
    addBOM: async (productId, data) => {
        const response = await api.post(`/bom/${productId}`, data);
        return response.data;
    },
    removeBOM: async (bomId) => {
        const response = await api.delete(`/bom/${bomId}`);
        return response.data;
    }
};

export default productService;
