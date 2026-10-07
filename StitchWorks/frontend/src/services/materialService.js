import api from './api';

const materialService = {
    // Suppliers
    getAllSuppliers: async () => {
        const response = await api.get('/suppliers');
        return response.data;
    },
    createSupplier: async (data) => {
        const response = await api.post('/suppliers', data);
        return response.data;
    },
    updateSupplier: async (id, data) => {
        const response = await api.put(`/suppliers/${id}`, data);
        return response.data;
    },
    deleteSupplier: async (id) => {
        const response = await api.delete(`/suppliers/${id}`);
        return response.data;
    },

    // Material Categories
    getAllCategories: async () => {
        const response = await api.get('/admin/categories');
        return response.data;
    },
    createCategory: async (data) => {
        const response = await api.post('/admin/categories', data);
        return response.data;
    },
    updateCategory: async (id, data) => {
        const response = await api.put(`/admin/categories/${id}`, data);
        return response.data;
    },
    deleteCategory: async (id) => {
        const response = await api.delete(`/admin/categories/${id}`);
        return response.data;
    },

    // Raw Materials
    getAllRawMaterials: async () => {
        const response = await api.get('/raw-materials');
        return response.data;
    },
    createRawMaterial: async (data) => {
        const response = await api.post('/raw-materials', data);
        return response.data;
    },
    updateRawMaterial: async (id, data) => {
        const response = await api.put(`/raw-materials/${id}`, data);
        return response.data;
    },
    deleteRawMaterial: async (id) => {
        const response = await api.delete(`/raw-materials/${id}`);
        return response.data;
    },

    // Purchase Orders
    getAllPurchaseOrders: async () => {
        const response = await api.get('/purchase-orders');
        return response.data;
    },
    createPurchaseOrder: async (data) => {
        const response = await api.post('/purchase-orders', data);
        return response.data;
    },
    updatePurchaseOrderStatus: async (id, status) => {
        const response = await api.put(`/purchase-orders/${id}/status`, { status });
        return response.data;
    },
    receivePurchaseOrder: async (id) => {
        const response = await api.post(`/purchase-orders/${id}/receive`);
        return response.data;
    }
};

export default materialService;
