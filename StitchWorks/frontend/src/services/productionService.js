import api from './api';

const productionService = {
    getAllOrders: async () => {
        const response = await api.get('/production/orders');
        return response.data;
    },
    getOrderById: async (id) => {
        const response = await api.get(`/production/orders/${id}`);
        return response.data;
    },
    createOrder: async (data) => {
        const response = await api.post('/production/orders', data);
        return response.data;
    },
    issueMaterials: async (id) => {
        const response = await api.put(`/production/orders/${id}/issue-materials`);
        return response.data;
    },
    completeOrder: async (id) => {
        const response = await api.post(`/production/orders/${id}/complete`);
        return response.data;
    },

    updateOrder: async (id, data) => {
        const response = await api.put(`/production/orders/${id}`, data);
        return response.data;
    },

    deleteOrder: async (id) => {
        const response = await api.delete(`/production/orders/${id}`);
        return response.data;
    },

    cancelOrder: async (id) => {
        const response = await api.post(`/production/orders/${id}/cancel`);
        return response.data;
    },

    addTask: async (orderId, taskData) => {
        const response = await api.post(`/production/orders/${orderId}/tasks`, taskData);
        return response.data;
    },

    updateTask: async (taskId, taskData) => {
        const response = await api.put(`/production/tasks/${taskId}`, taskData);
        return response.data;
    },

    addQcLog: async (taskId, qcData) => {
        const response = await api.post(`/production/tasks/${taskId}/qc`, qcData);
        return response.data;
    }
};

export default productionService;
