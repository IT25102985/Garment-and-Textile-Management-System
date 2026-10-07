import api from '@/services/api';

export const purchaseOrderApi = {
  getAll: async () => {
    const { data } = await api.get('/purchase-orders');
    return data;
  },
  create: async (poData) => {
    const { data } = await api.post('/purchase-orders', poData);
    return data;
  },
  updateStatus: async ({ id, status }) => {
    const { data } = await api.put(`/purchase-orders/${id}/status`, { status });
    return data;
  },
  receiveShipment: async ({ id, receivedQuantities }) => {
    const { data } = await api.post(`/purchase-orders/${id}/receive`, receivedQuantities);
    return data;
  },
  recordPayment: async ({ id, amount }) => {
    const { data } = await api.post(`/purchase-orders/${id}/pay`, { amount });
    return data;
  }
};
