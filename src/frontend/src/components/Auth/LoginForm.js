/**
 * =============================================
 * COMPONENT FORM ĐĂNG NHẬP (LOGIN FORM)
 * =============================================
 * 
 * NGUYÊN LÝ:
 * - Hiển thị form nhập email/tên đăng nhập + mật khẩu
 * - Gọi hàm login từ AuthContext
 * - Nếu thành công → chuyển đến Dashboard
 * - Nếu thất bại → hiển thị thông báo lỗi
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginForm = ({ onSwitch }) => {
  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Lấy hàm login từ AuthContext
  const { login } = useAuth();

  // Xử lý khi nhập liệu vào form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Xóa lỗi khi nhập lại
  };

  // Xử lý khi bấm nút Đăng nhập
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn form reload trang
    setLoading(true);
    setError('');

    try {
      await login(formData);
      // Đăng nhập thành công → AuthContext tự cập nhật user
      // App.js sẽ tự chuyển sang Dashboard nhờ điều kiện isAuthenticated
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>📋 Quản Lý Công Việc</h2>
          <p>Đăng nhập để tiếp tục</p>
        </div>

        {/* Hiển thị lỗi (nếu có) */}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Trường Email hoặc Username */}
          <div className="form-group">
            <label htmlFor="email">📧 Email</label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email hoặc tên đăng nhập"
              required
            />
          </div>

          {/* Trường Mật khẩu */}
          <div className="form-group">
            <label htmlFor="password">🔒 Mật khẩu</label>
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
          </div>

          {/* Nút Đăng nhập */}
          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : '🚀 Đăng nhập'}
          </button>
        </form>

        {/* Link chuyển sang trang Đăng ký */}
        <p className="auth-switch">
          Chưa có tài khoản?{' '}
          <button className="link-btn" onClick={onSwitch}>
            Đăng ký ngay
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
