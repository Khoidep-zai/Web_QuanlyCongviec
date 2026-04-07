/**
 * =============================================
 * CẤU HÌNH GỌI API (API SERVICE)
 * =============================================
 * 
 * File này cấu hình Axios để gọi API backend.
 * 
 * NGUYÊN LÝ HOẠT ĐỘNG:
 * - Axios là thư viện giúp gọi HTTP request (GET, POST, PUT, DELETE)
 * - Tạo một instance Axios với cấu hình sẵn (baseURL, headers)
 * - Mỗi request tự động gắn JWT token (nếu đã đăng nhập)
 * - Interceptor xử lý lỗi chung (ví dụ: token hết hạn)
 * 
 * LUỒNG REQUEST:
 * Component → API Service → Axios Instance → Backend API → Response → Component
 */

import axios from 'axios';

const defaultApiBaseUrl =
  process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

// ===== TẠO AXIOS INSTANCE =====
/**
 * Tạo instance Axios với cấu hình mặc định:
 * - baseURL: Đường dẫn gốc của API backend
 * - headers: Kiểu dữ liệu gửi/nhận là JSON
 */
const api = axios.create({
  // Development: gọi thẳng localhost:5000 (CRA proxy package.json)
  // Docker/Production: dùng /api → nginx proxy chuyển sang backend container
  baseURL: process.env.REACT_APP_API_URL || defaultApiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== REQUEST INTERCEPTOR =====
/**
 * Interceptor chạy TRƯỚC mỗi request gửi đi.
 * 
 * NGUYÊN LÝ:
 * - Kiểm tra LocalStorage có token không
 * - Nếu có → tự động gắn token vào header "Authorization"
 * - Backend sẽ đọc token này để xác minh người dùng
 */
api.interceptors.request.use(
  (config) => {
    // Lấy token từ LocalStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      // Gắn token vào header dạng: "Bearer <token>"
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== RESPONSE INTERCEPTOR =====
/**
 * Interceptor chạy SAU khi nhận response.
 * 
 * NGUYÊN LÝ:
 * - Nếu response thành công → trả về bình thường
 * - Nếu lỗi 401 (Unauthorized) → token hết hạn → đăng xuất
 * - Nếu lỗi khác → trả về lỗi cho component xử lý
 */
api.interceptors.response.use(
  (response) => response, // Thành công → trả về response
  (error) => {
    const requestUrl = error?.config?.url || '';
    const isAuthRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register');

    // Lỗi 401 ở route bảo vệ: token không hợp lệ hoặc hết hạn
    if (error.response && error.response.status === 401 && !isAuthRequest) {
      // Xóa token cũ
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Phát sự kiện để AuthContext cập nhật UI, không reload trang
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    
    return Promise.reject(error);
  }
);

export default api;
