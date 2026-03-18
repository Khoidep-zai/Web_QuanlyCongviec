import api from './api';

const adminService = {
  getOverview: async () => {
    const response = await api.get('/admin/overview');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  updateUserStatus: async (userId, isActive) => {
    const response = await api.put(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  resetUserPassword: async (userId, newPassword) => {
    const response = await api.put(`/admin/users/${userId}/reset-password`, { newPassword });
    return response.data;
  },

  getTasks: async () => {
    const response = await api.get('/admin/tasks');
    return response.data;
  },

  deleteTask: async (taskId) => {
    const response = await api.delete(`/admin/tasks/${taskId}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/admin/categories');
    return response.data;
  },

  createCategory: async (payload) => {
    const response = await api.post('/admin/categories', payload);
    return response.data;
  },

  updateCategory: async (categoryId, payload) => {
    const response = await api.put(`/admin/categories/${categoryId}`, payload);
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/admin/categories/${categoryId}`);
    return response.data;
  },
};

export default adminService;
