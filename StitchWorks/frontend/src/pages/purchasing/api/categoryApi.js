import api from '@/services/api';

export const categoryApi = {
  getAll: async () => {
    const { data } = await api.get('/admin/categories');
    return data;
  },
  create: async (formData) => {
    const { data } = await api.post('/admin/categories', formData);
    return data;
  },
  update: async ({ id, formData }) => {
    const { data } = await api.post(`/admin/categories/${id}`, formData);
    return data;
  },
  delete: async (id) => {
    await api.delete(`/admin/categories/${id}`);
  },
  getCustomFields: async (id) => {
    const { data } = await api.get(`/admin/categories/${id}/custom-fields`);
    return data;
  }
};
