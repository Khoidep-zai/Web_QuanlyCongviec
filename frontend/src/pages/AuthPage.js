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

const AuthPage = () => {
  // true = hiện form đăng nhập, false = hiện form đăng ký
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page">
      {isLogin ? (
        <LoginForm onSwitch={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onSwitch={() => setIsLogin(true)} />
      )}
    </div>
  );
};

export default AuthPage;
