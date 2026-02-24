/**
 * =============================================
 * COMPONENT GỐC - APP.JS
 * =============================================
 * 
 * NGUYÊN LÝ HOẠT ĐỘNG:
 * - Đây là component gốc (root) bao bọc toàn bộ ứng dụng
 * - AuthProvider cung cấp context xác thực cho mọi component
 * - Điều hướng dựa trên trạng thái đăng nhập:
 *   + Chưa đăng nhập → hiện trang Đăng nhập/Đăng ký
 *   + Đã đăng nhập → hiện trang Dashboard
 * - loading state: hiển thị màn hình chờ khi đang kiểm tra token
 * 
 * CẤU TRÚC:
 * App
 *  └─ AuthProvider (cung cấp context)
 *      └─ AppContent (xử lý điều hướng)
 *          ├─ AuthPage (nếu chưa đăng nhập)
 *          └─ DashboardPage (nếu đã đăng nhập)
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

/**
 * AppContent: Xử lý logic điều hướng
 * - Đọc trạng thái đăng nhập từ AuthContext
 * - Hiển thị trang phù hợp
 */
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  // Đang kiểm tra token → hiển thị loading
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-large"></div>
        <p>Đang tải ứng dụng...</p>
      </div>
    );
  }

  // Điều hướng dựa trên trạng thái đăng nhập
  return isAuthenticated ? <DashboardPage /> : <AuthPage />;
};

/**
 * App: Component gốc
 * - Bọc toàn bộ ứng dụng trong AuthProvider
 */
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
