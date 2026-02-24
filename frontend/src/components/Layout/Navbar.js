/**
 * =============================================
 * COMPONENT THANH ĐIỀU HƯỚNG (NAVBAR)
 * =============================================
 * 
 * NGUYÊN LÝ: Hiển thị thanh điều hướng phía trên cùng
 * - Logo + tên ứng dụng
 * - Nút đăng xuất (nếu đã đăng nhập)
 * - Tên user đang đăng nhập
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      {/* Logo và tên ứng dụng */}
      <div className="navbar-brand">
        <span className="navbar-logo">📋</span>
        <h1 className="navbar-title">Quản Lý Công Việc</h1>
      </div>

      {/* Menu bên phải - hiển thị khi đã đăng nhập */}
      {isAuthenticated && (
        <div className="navbar-menu">
          <span className="navbar-user">
            👤 Xin chào, <strong>{user?.fullName || user?.username}</strong>
          </span>
          <button className="btn btn-logout" onClick={logout}>
            🚪 Đăng xuất
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
