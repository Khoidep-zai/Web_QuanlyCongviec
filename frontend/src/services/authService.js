/**
 * =============================================
 * SERVICE XÁC THỰC (AUTH SERVICE)
 * =============================================
 * 
 * File này chứa các hàm gọi API xác thực:
 * - Đăng ký
 * - Đăng nhập
 * - Lấy thông tin cá nhân
 * - Cập nhật profile
 * 
 * NGUYÊN LÝ:
 * - Mỗi hàm gọi đến endpoint tương ứng trên backend
 * - Sử dụng Axios instance đã cấu hình sẵn token
 * - Trả về dữ liệu từ response.data
 */

import api from './api';

const authService = {
  /**
   * Đăng ký tài khoản mới
   * @param {Object} userData - { username, email, password, fullName }
   * @returns {Object} - Thông tin user + token
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Đăng nhập
   * @param {Object} credentials - { email, password }
   * @returns {Object} - Thông tin user + token
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Lấy thông tin người dùng hiện tại
   * @returns {Object} - Thông tin user
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Cập nhật thông tin cá nhân
   * @param {Object} profileData - { fullName, username, password }
   * @returns {Object} - Thông tin user đã cập nhật
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
};

export default authService;
