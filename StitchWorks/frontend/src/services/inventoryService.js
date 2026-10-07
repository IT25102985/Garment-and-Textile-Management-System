import api from './api';

const inventoryService = {
    getRawMaterialStock: async () => {
        const response = await api.get('/inventory/raw-materials');
        return response.data;
    },
    getFinishedGoodsStock: async () => {
        const response = await api.get('/inventory/finished-goods');
        return response.data;
    },
    getLowStockMaterials: async () => {
        const response = await api.get('/inventory/low-stock');
        return response.data;
    },
    getTransactionHistory: async (materialId, productId) => {
        const params = new URLSearchParams();
        if (materialId) params.append('materialId', materialId);
        if (productId) params.append('productId', productId);
        const res = await api.get(`/inventory/transactions?${params.toString()}`);
        return res.data;
    },

    // Storage Locations APIs
    getAllLocations: async () => {
        const res = await api.get('/inventory/locations');
        return res.data;
    },
    createLocation: async (data) => {
        const res = await api.post('/inventory/locations', data);
        return res.data;
    },
    updateLocation: async (id, data) => {
        const res = await api.put(`/inventory/locations/${id}`, data);
        return res.data;
    },
    deleteLocation: async (id) => {
        const res = await api.delete(`/inventory/locations/${id}`);
        return res.data;
    }
};

export default inventoryService;
