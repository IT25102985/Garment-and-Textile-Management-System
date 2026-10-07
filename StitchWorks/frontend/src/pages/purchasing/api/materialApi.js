import api from '@/services/api';

export const materialApi = {
  getAll: async () => {
    const { data } = await api.get('/admin/materials');
    return data;
  },
  getByCategory: async (categoryId) => {
    const { data } = await api.get(`/admin/materials?categoryId=${categoryId}`);
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/admin/materials/${id}`);
    return data;
  },
  create: async (formData) => {
    const { data } = await api.post('/admin/materials', formData);
    return data;
  },
  update: async ({ id, formData }) => {
    const { data } = await api.post(`/admin/materials/${id}`, formData);
    return data;
  },
  delete: async (id) => {
    await api.delete(`/admin/materials/${id}`);
  },
  getSuppliers: async () => {
    const { data } = await api.get('/suppliers');
    return data;
  }
};
