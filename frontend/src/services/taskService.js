/**
 * =============================================
 * SERVICE CÔNG VIỆC (TASK SERVICE)
 * =============================================
 * 
 * File này chứa các hàm gọi API công việc:
 * - Lấy danh sách, tạo, sửa, xóa task
 * - Thống kê
 * - Quản lý subtask
 * 
 * NGUYÊN LÝ:
 * - Mỗi hàm tương ứng với một endpoint API trên backend
 * - Params (tham số URL) được truyền qua query string
 * - Token tự động được gắn bởi Axios interceptor
 */

import api from './api';

const taskService = {
  /**
   * Lấy danh sách công việc (có lọc, phân trang)
   * @param {Object} params - { status, priority, category, search, sortBy, order, page, limit }
   * @returns {Object} - { data: [tasks], pagination: {...} }
   */
  getTasks: async (params = {}) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  /**
   * Tạo công việc mới
   * @param {Object} taskData - { title, description, status, priority, category, tags, dueDate, subtasks }
   * @returns {Object} - Task vừa tạo
   */
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  /**
   * Lấy chi tiết một task
   * @param {string} taskId - ID của task
   * @returns {Object} - Chi tiết task
   */
  getTaskById: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  /**
   * Cập nhật thông tin task
   * @param {string} taskId - ID của task
   * @param {Object} taskData - Dữ liệu cập nhật
   * @returns {Object} - Task đã cập nhật
   */
  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  /**
   * Xóa task
   * @param {string} taskId - ID của task
   * @returns {Object} - Thông báo thành công
   */
  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  /**
   * Lấy thống kê tổng quan
   * @returns {Object} - Dữ liệu thống kê
   */
  getStats: async () => {
    const response = await api.get('/tasks/stats/overview');
    return response.data;
  },

  /**
   * Đảo trạng thái subtask (hoàn thành ↔ chưa hoàn thành)
   * @param {string} taskId - ID task cha
   * @param {string} subtaskId - ID subtask
   * @returns {Object} - Task đã cập nhật
   */
  toggleSubtask: async (taskId, subtaskId) => {
    const response = await api.put(`/tasks/${taskId}/subtasks/${subtaskId}`);
    return response.data;
  },
};

export default taskService;
