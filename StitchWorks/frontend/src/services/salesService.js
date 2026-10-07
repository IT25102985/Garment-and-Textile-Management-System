import api from './api';

const salesService = {
    getAllCustomers: async () => {
        const response = await api.get('/customers');
        return response.data;
    },
    createCustomer: async (data) => {
        const response = await api.post('/customers', data);
        return response.data;
    },
    updateCustomer: async (id, data) => {
        const response = await api.put(`/customers/${id}`, data);
        return response.data;
    },
    getAllOrders: async () => {
        const response = await api.get('/sales-orders');
        return response.data;
    },
    createOrder: async (data) => {
        const response = await api.post('/sales-orders', data);
        return response.data;
    },
    updateStatus: async (id, status) => {
        const response = await api.put(`/sales-orders/${id}/status?status=${status}`);
        return response.data;
    },
    deleteCustomer: async (id) => {
        const response = await api.delete(`/customers/${id}`);
        return response.data;
    },
    toggleCustomerStatus: async (id) => {
        const response = await api.put(`/customers/${id}/toggle-status`);
        return response.data;
    },
    updateTracking: async (id, trackingNumber) => {
        const response = await api.put(`/sales-orders/${id}/tracking?trackingNumber=${encodeURIComponent(trackingNumber)}`);
        return response.data;
    },
    createInvoice: async (id, dueDate) => {
        const response = await api.post(`/sales-orders/${id}/invoice?dueDate=${dueDate}`);
        return response.data;
    },
    shipOrder: async (id, trackingNumber) => {
        const response = await api.post(`/sales-orders/${id}/ship?trackingNumber=${encodeURIComponent(trackingNumber)}`);
        return response.data;
    },
    makePayment: async (invoiceId, paymentData) => {
        const response = await api.post(`/customer/invoices/${invoiceId}/pay`, paymentData);
        return response.data;
    },
    getMyOrders: async () => {
        const response = await api.get('/customer/orders');
        return response.data;
    },
    placeCustomerOrder: async (orderData) => {
        const response = await api.post('/customer/orders', orderData);
        return response.data;
    },
    getMyInvoices: async () => {
        const response = await api.get('/customer/invoices');
        return response.data;
    },
    getCustomerProfile: async () => {
        const response = await api.get('/customer/profile');
        return response.data;
    },
    updateCustomerProfile: async (data) => {
        const response = await api.put('/customer/profile', data);
        return response.data;
    },
    cancelOrder: async (id) => {
        const response = await api.post(`/sales-orders/${id}/cancel`);
        return response.data;
    },
    cancelMyOrder: async (id) => {
        const response = await api.post(`/customer/orders/${id}/cancel`);
        return response.data;
    }
};

export default salesService;
