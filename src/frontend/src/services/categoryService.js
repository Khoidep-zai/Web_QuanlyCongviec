/**
 * =============================================
 * SERVICE DANH MỤC (CATEGORY SERVICE)
 * =============================================
 * 
 * File này chứa các hàm gọi API danh mục.
 */

import api from './api';

const categoryService = {
  /** Lấy tất cả danh mục */
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  /** Tạo danh mục mới */
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  /** Cập nhật danh mục */
  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  },

  /** Xóa danh mục */
  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  },
};

export default categoryService;
