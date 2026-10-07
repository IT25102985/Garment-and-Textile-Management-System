import api from '@/services/api';

export const supplierApi = {
  getAll: async () => {
    // Note: the backend uses /api/suppliers
    const { data } = await api.get('/suppliers');
    return data;
  },
  create: async (supplierData) => {
    const { data } = await api.post('/suppliers', supplierData);
    return data;
  },
  update: async ({ id, ...supplierData }) => {
    const { data } = await api.put(`/suppliers/${id}`, supplierData);
    return data;
  },
  delete: async (id) => {
    await api.delete(`/suppliers/${id}`);
  },
};
