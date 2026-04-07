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
        <span className="navbar-logo" aria-hidden="true">✏️</span>
        <div>
          <h1 className="navbar-title">ToDo Vui</h1>
          <p className="navbar-subtitle">Mỗi ngày tốt hơn 1%</p>
        </div>
      </div>

      {/* Menu bên phải - hiển thị khi đã đăng nhập */}
      {isAuthenticated && (
        <div className="navbar-menu">
          <span className="navbar-streak">🔥 Nhịp độ tốt</span>
          <span className="navbar-user">
            Xin chào, <strong>{user?.fullName || user?.username}</strong>
            {user?.role === 'admin' ? ' (Admin)' : ''}
          </span>
          <button className="btn btn-logout" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
