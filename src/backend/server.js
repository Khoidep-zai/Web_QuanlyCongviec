/**
 * =============================================
 * FILE KHỞI ĐỘNG SERVER CHÍNH
 * =============================================
 * 
 * Đây là file đầu tiên được chạy khi khởi động ứng dụng backend.
 * 
 * NGUYÊN LÝ HOẠT ĐỘNG:
 * 1. Đọc cấu hình từ file .env (biến môi trường)
 * 2. Kết nối đến cơ sở dữ liệu MongoDB
 * 3. Thiết lập các middleware (lớp xử lý trung gian)
 * 4. Đăng ký các routes (đường dẫn API)
 * 5. Khởi động server lắng nghe request từ client
 * 
 * LUỒNG XỬ LÝ MỘT REQUEST:
 * Client gửi request → CORS → JSON Parser → Route → Controller → Database → Response
 */

// ===== 1. NẠP CÁC THƯ VIỆN CẦN THIẾT =====
const express = require('express');    // Framework tạo web server
const cors = require('cors');          // Cho phép frontend gọi API từ domain khác
const dotenv = require('dotenv');      // Đọc biến môi trường từ file .env

// ===== 2. ĐỌC CẤU HÌNH TỪ FILE .env =====
// dotenv.config() sẽ đọc file .env và đưa các biến vào process.env
dotenv.config();

// ===== 3. NẠP CÁC MODULE TỰ TẠO =====
const connectDB = require('./config/database');           // Hàm kết nối MongoDB
const { ensureDefaultAdmin } = require('./config/database');
const authRoutes = require('./routes/authRoutes');         // Routes xác thực
const taskRoutes = require('./routes/taskRoutes');         // Routes công việc
const categoryRoutes = require('./routes/categoryRoutes'); // Routes danh mục
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler } = require('./middleware/errorMiddleware'); // Xử lý lỗi

// ===== 5. KHỞI TẠO ỨNG DỤNG EXPRESS =====
const app = express();

// ===== 6. THIẾT LẬP MIDDLEWARE =====

/**
 * CORS (Cross-Origin Resource Sharing):
 * - Cho phép frontend (chạy trên port 3000) gọi API backend (port 5000)
 * - Nếu không có CORS, trình duyệt sẽ chặn request do khác domain/port
 */
app.use(cors());

/**
 * JSON Parser:
 * - Tự động chuyển đổi body của request từ JSON string sang JavaScript object
 * - Ví dụ: '{"title": "Học bài"}' → { title: "Học bài" }
 */
app.use(express.json());

/**
 * URL Encoded Parser:
 * - Xử lý dữ liệu gửi từ form HTML
 * - extended: true cho phép gửi dữ liệu phức tạp (nested objects)
 */
app.use(express.urlencoded({ extended: true }));

// ===== 7. ĐĂNG KÝ ROUTES (ĐƯỜNG DẪN API) =====

/**
 * Mỗi nhóm route xử lý một phần chức năng khác nhau:
 * - /api/auth     → Đăng ký, đăng nhập, thông tin người dùng
 * - /api/tasks    → Tạo, đọc, sửa, xóa công việc
 * - /api/categories → Quản lý danh mục công việc
 */
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

/**
 * Route kiểm tra sức khỏe server:
 * - Truy cập GET / để kiểm tra server có đang chạy không
 * - Trả về thông báo JSON xác nhận server hoạt động
 */
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API Quản lý Công việc đang hoạt động!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      categories: '/api/categories'
    }
  });
});

// Health endpoint cho nền tảng deploy như Render
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'task-manager-backend',
    timestamp: new Date().toISOString(),
  });
});

// ===== 8. MIDDLEWARE XỬ LÝ LỖI =====
// Đặt cuối cùng để bắt tất cả lỗi từ các route phía trên
app.use(errorHandler);

// ===== 9. KHỞI ĐỘNG SERVER =====
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await ensureDefaultAdmin();

  app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════════╗
  ║  🚀 Server đang chạy tại:                    ║
  ║     http://localhost:${PORT}                    ║
  ║  📊 Môi trường: ${process.env.NODE_ENV || 'development'}              ║
  ║  📋 API Docs: http://localhost:${PORT}/          ║
  ╚══════════════════════════════════════════════╝
  `);
  });
};

startServer();
