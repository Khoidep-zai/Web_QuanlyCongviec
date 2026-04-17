/**
 * =============================================
 * TRANG XÁC THỰC (AUTH PAGE)
 * =============================================
 * 
 * NGUYÊN LÝ:
 * - Quản lý hiển thị form Đăng nhập hoặc Đăng ký
 * - Dùng state "isLogin" để chuyển đổi giữa 2 form
 */

import React, { useState } from 'react';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';
import { useTheme } from '../context/ThemeContext';

const AuthPage = () => {
  // true = hiện form đăng nhập, false = hiện form đăng ký
  const [isLogin, setIsLogin] = useState(true);
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="auth-page">
      <button
        type="button"
        className="theme-toggle-btn auth-theme-toggle"
        onClick={toggleTheme}
        aria-label={isDarkMode ? 'Chuyen sang giao dien sang' : 'Chuyen sang giao dien toi'}
        title={isDarkMode ? 'Che do sang' : 'Che do toi'}
      >
        <span aria-hidden="true">{isDarkMode ? '☀️' : '🌙'}</span>
        <span>{isDarkMode ? 'Sang' : 'Toi'}</span>
      </button>

      <section className="auth-welcome" aria-label="Giới thiệu ứng dụng">
        <div className="auth-hero-badge">DUO STYLE TODO</div>
        <h1>Biến công việc thành chuỗi bước nhỏ dễ hoàn thành</h1>
        <p>
          Giao diện tươi sáng, chữ rõ ràng, nút lớn dễ thao tác giúp mọi lứa tuổi đều dùng thoải mái.
        </p>
        <ul className="auth-benefits">
          <li>Nhìn nhanh việc cần làm trong ngày</li>
          <li>Chia nhỏ nhiệm vụ để đỡ quá tải</li>
          <li>Theo dõi tiến độ bằng lịch tuần trực quan</li>
        </ul>
      </section>

      <section className="auth-form-area" aria-label="Biểu mẫu xác thực">
        {isLogin ? (
          <LoginForm onSwitch={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitch={() => setIsLogin(true)} />
        )}
      </section>
    </div>
  );
};

export default AuthPage;
