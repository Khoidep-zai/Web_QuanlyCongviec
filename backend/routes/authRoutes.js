/**
 * =============================================
 * ROUTES XÁC THỰC (AUTH ROUTES)
 * =============================================
 * 
 * File này định nghĩa các đường dẫn API cho chức năng xác thực.
 * 
 * NGUYÊN LÝ HOẠT ĐỘNG CỦA ROUTES:
 * - Route là "bản đồ" ánh xạ: URL + HTTP method → Controller function
 * - Khi client gửi request đến URL, Express tìm route phù hợp
 * - Chuyển request đến controller tương ứng để xử lý
 * 
 * DANH SÁCH API:
 * ┌──────────┬────────────────────┬─────────────────────────┬───────────┐
 * │ Method   │ URL                │ Chức năng               │ Quyền     │
 * ├──────────┼────────────────────┼─────────────────────────┼───────────┤
 * │ POST     │ /api/auth/register │ Đăng ký tài khoản       │ Công khai │
 * │ POST     │ /api/auth/login    │ Đăng nhập               │ Công khai │
 * │ GET      │ /api/auth/me       │ Lấy thông tin cá nhân   │ Riêng tư  │
 * │ PUT      │ /api/auth/profile  │ Cập nhật thông tin       │ Riêng tư  │
 * └──────────┴────────────────────┴─────────────────────────┴───────────┘
 */

const express = require('express');
const router = express.Router();

// Nạp controller và middleware
const {
  register,
  login,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ===== ROUTES CÔNG KHAI (không cần đăng nhập) =====
router.post('/register', register);   // Đăng ký tài khoản mới
router.post('/login', login);         // Đăng nhập

// ===== ROUTES RIÊNG TƯ (cần đăng nhập) =====
// protect middleware sẽ kiểm tra token trước khi cho truy cập
router.get('/me', protect, getMe);              // Lấy thông tin cá nhân
router.put('/profile', protect, updateProfile); // Cập nhật thông tin

module.exports = router;
