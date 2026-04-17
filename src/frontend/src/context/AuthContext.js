/**
 * =============================================
 * CONTEXT XÁC THỰC (AUTH CONTEXT)
 * =============================================
 * 
 * File này quản lý trạng thái đăng nhập/đăng xuất trong toàn bộ ứng dụng.
 * 
 * NGUYÊN LÝ HOẠT ĐỘNG CỦA CONTEXT:
 * - Context là cách React chia sẻ dữ liệu giữa các component
 *   mà KHÔNG cần truyền props qua từng cấp (prop drilling)
 * - AuthContext lưu trữ: user info, token, trạng thái đăng nhập
 * - Bất kỳ component nào cũng có thể truy cập thông tin đăng nhập
 * 
 * LUỒNG XÁC THỰC:
 * 1. User đăng nhập → API trả về token + user info
 * 2. Lưu token vào localStorage (để giữ đăng nhập khi reload)
 * 3. Lưu user info vào Context state
 * 4. Các component đọc user từ Context để hiển thị/phân quyền
 * 5. Đăng xuất → Xóa token + user → Chuyển về trang đăng nhập
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const isNetlifyHost =
  typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');

const normalizeAuthErrorMessage = (err, fallback) => {
  const statusCode = err?.response?.status;
  const responseType = err?.response?.headers?.['content-type'] || '';

  if (statusCode === 404) {
    if (responseType.includes('text/html')) {
      if (isNetlifyHost) {
        return 'API đăng nhập không tồn tại ở domain hiện tại. Trên Netlify, hãy cấu hình REACT_APP_API_URL trỏ tới backend của bạn rồi deploy lại.';
      }
      return 'API đăng nhập không tồn tại ở domain hiện tại. Hãy kiểm tra lại cấu hình proxy /api hoặc REACT_APP_API_URL.';
    }
    return 'Không tìm thấy endpoint xác thực. Hãy kiểm tra lại REACT_APP_API_URL có đúng dạng https://<backend>/api hay chưa.';
  }

  if (err?.response?.data?.message) {
    return err.response.data.message;
  }

  if (err?.message && err.message !== 'Network Error') {
    return err.message;
  }

  if (err?.message === 'Network Error') {
    return 'Không kết nối được API. Hãy kiểm tra backend đang chạy và biến REACT_APP_API_URL đã cấu hình đúng chưa.';
  }

  return fallback;
};

const extractAuthPayload = (response, actionName) => {
  const isAxiosResponseLike =
    !!response &&
    typeof response === 'object' &&
    Object.prototype.hasOwnProperty.call(response, 'data') &&
    Object.prototype.hasOwnProperty.call(response, 'status') &&
    Object.prototype.hasOwnProperty.call(response, 'headers');

  const payload = isAxiosResponseLike ? response.data : response;

  if (!payload || typeof payload !== 'object') {
    throw new Error(
      `${actionName} thất bại: API trả về dữ liệu không hợp lệ. Kiểm tra REACT_APP_API_URL hoặc cấu hình proxy /api.`
    );
  }

  return payload;
};

const extractAuthData = (payload, actionName) => {
  if (payload?.data && typeof payload.data === 'object') {
    return payload.data;
  }

  if (payload?.token) {
    return payload;
  }

  throw new Error(
    `${actionName} không nhận được token. Hãy kiểm tra lại API auth hoặc cấu hình REACT_APP_API_URL/proxy /api.`
  );
};

const extractUserProfile = (payload) => {
  if (payload?.data && typeof payload.data === 'object') {
    return payload.data;
  }

  if (payload?._id || payload?.email || payload?.username) {
    return payload;
  }

  return null;
};

const persistAuthSession = (authData, setUser) => {
  localStorage.setItem('token', authData.token);
  localStorage.setItem('user', JSON.stringify(authData));
  setUser(authData);
};

// ===== TẠO CONTEXT =====
// Context là "kho chứa" dữ liệu dùng chung
const AuthContext = createContext(null);

// ===== PROVIDER COMPONENT =====
/**
 * AuthProvider bao bọc toàn bộ ứng dụng, cung cấp dữ liệu xác thực
 * cho tất cả component con.
 * 
 * Đặt ở App.js: <AuthProvider> <App /> </AuthProvider>
 */
export const AuthProvider = ({ children }) => {
  // ===== STATE (TRẠNG THÁI) =====
  const [user, setUser] = useState(null);           // Thông tin user đang đăng nhập
  const [loading, setLoading] = useState(true);      // Đang tải dữ liệu
  const [error, setError] = useState(null);          // Thông báo lỗi

  // ===== KIỂM TRA ĐĂNG NHẬP KHI MỞ ỨNG DỤNG =====
  /**
   * useEffect chạy MỘT LẦN khi component mount (ứng dụng khởi động)
   * 
   * NGUYÊN LÝ:
   * - Kiểm tra localStorage có token không
   * - Nếu có → gọi API lấy thông tin user (xác minh token còn hợp lệ)
   * - Nếu không → user chưa đăng nhập
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Gọi API kiểm tra token còn hợp lệ không
          const response = await authService.getMe();
          const payload = extractAuthPayload(response, 'Xác thực phiên');
          setUser(extractUserProfile(payload));
        } catch (err) {
          // Token hết hạn hoặc không hợp lệ → xóa
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      
      setLoading(false); // Đã kiểm tra xong
    };

    checkAuth();

    const handleUnauthorized = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []); // [] = chỉ chạy 1 lần khi mount

  // ===== HÀM ĐĂNG KÝ =====
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      const payload = extractAuthPayload(response, 'Đăng ký');
      const authData = extractAuthData(payload, 'Đăng ký');
      persistAuthSession(authData, setUser);
      
      return payload;
    } catch (err) {
      const message = normalizeAuthErrorMessage(err, 'Đăng ký thất bại');
      setError(message);
      throw new Error(message);
    }
  };

  // ===== HÀM ĐĂNG NHẬP =====
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authService.login(credentials);
      const payload = extractAuthPayload(response, 'Đăng nhập');
      const authData = extractAuthData(payload, 'Đăng nhập');

      persistAuthSession(authData, setUser);
      
      return response;
    } catch (err) {
      const message = normalizeAuthErrorMessage(err, 'Đăng nhập thất bại');
      setError(message);
      throw new Error(message);
    }
  };

  // ===== HÀM ĐĂNG XUẤT =====
  const logout = () => {
    // Xóa token và user khỏi localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Xóa state
    setUser(null);
  };

  // ===== GIÁ TRỊ CUNG CẤP CHO CÁC COMPONENT =====
  const value = {
    user,           // Thông tin user (null nếu chưa đăng nhập)
    loading,        // true khi đang kiểm tra đăng nhập
    error,          // Thông báo lỗi (nếu có)
    register,       // Hàm đăng ký
    login,          // Hàm đăng nhập
    logout,         // Hàm đăng xuất
    isAuthenticated: !!user, // true nếu đã đăng nhập
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ===== CUSTOM HOOK =====
/**
 * Hook tùy chỉnh để sử dụng AuthContext dễ dàng hơn
 * 
 * Cách dùng trong component:
 * const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};

export default AuthContext;
