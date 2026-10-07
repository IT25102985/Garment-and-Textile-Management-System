import api from './api';

const purchasingService = {
    // Suppliers
    getAllSuppliers: async () => {
        const response = await api.get('/purchasing/suppliers');
        return response.data;
    },
    createSupplier: async (supplierData) => {
        const response = await api.post('/purchasing/suppliers', supplierData);
        return response.data;
    },
    updateSupplier: async (supplierId, supplierData) => {
        const response = await api.put(`/purchasing/suppliers/${supplierId}`, supplierData);
        return response.data;
    },
    deleteSupplier: async (supplierId) => {
        const response = await api.delete(`/purchasing/suppliers/${supplierId}`);
        return response.data;
    },
    getSupplierApplications: async () => {
        const response = await api.get('/purchasing/supplier-applications');
        return response.data;
    },
    approveSupplierApplication: async (applicationId) => {
        const response = await api.post(`/purchasing/supplier-applications/${applicationId}/approve`);
        return response.data;
    },

    // Raw Materials
    getAllMaterials: async () => {
        const response = await api.get('/purchasing/materials');
        return response.data;
    },
    getMaterialByCategory: async (categoryId) => {
        const response = await api.get(`/purchasing/materials/category/${categoryId}`);
        return response.data;
    },
    createMaterial: async (materialData) => {
        const response = await api.post('/purchasing/materials', materialData);
        return response.data;
    },
    updateMaterial: async (materialId, materialData) => {
        const response = await api.put(`/purchasing/materials/${materialId}`, materialData);
        return response.data;
    },
    deleteMaterial: async (materialId) => {
        const response = await api.delete(`/purchasing/materials/${materialId}`);
        return response.data;
    },

    // Categories
    getAllCategories: async () => {
        const response = await api.get('/purchasing/categories');
        return response.data;
    },
    createCategory: async (categoryData) => {
        const response = await api.post('/purchasing/categories', categoryData);
        return response.data;
    },
    updateCategory: async (categoryId, categoryData) => {
        const response = await api.put(`/purchasing/categories/${categoryId}`, categoryData);
        return response.data;
    },
    deleteCategory: async (categoryId) => {
        const response = await api.delete(`/purchasing/categories/${categoryId}`);
        return response.data;
    },

    // Purchase Orders
    getAllPurchaseOrders: async () => {
        const response = await api.get('/purchasing/purchase-orders');
        return response.data;
    },
    createPurchaseOrder: async (poData) => {
        const response = await api.post('/purchasing/purchase-orders', poData);
        return response.data;
    },
    updatePurchaseOrder: async (poId, poData) => {
        const response = await api.put(`/purchasing/purchase-orders/${poId}`, poData);
        return response.data;
    },
    getPurchaseOrderById: async (poId) => {
        const response = await api.get(`/purchasing/purchase-orders/${poId}`);
        return response.data;
    },
    receivePurchaseOrder: async (poId, receivedData) => {
        const response = await api.post(`/purchasing/purchase-orders/${poId}/receive`, receivedData);
        return response.data;
    }
};

export default purchasingService;
