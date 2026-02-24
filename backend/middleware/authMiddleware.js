/**
 * =============================================
 * MIDDLEWARE XÁC THỰC NGƯỜI DÙNG (AUTH MIDDLEWARE)
 * =============================================
 * 
 * File này chứa middleware kiểm tra xem người dùng đã đăng nhập chưa.
 * 
 * NGUYÊN LÝ HOẠT ĐỘNG:
 * 1. Client gửi request kèm token trong header "Authorization"
 * 2. Middleware lấy token từ header
 * 3. Giải mã (verify) token bằng JWT secret key
 * 4. Lấy thông tin user từ database dựa trên ID trong token
 * 5. Gắn thông tin user vào request (req.user) để controller sử dụng
 * 6. Nếu không có token hoặc token không hợp lệ → từ chối request
 * 
 * JWT TOKEN LÀ GÌ?
 * - JWT (JSON Web Token) là một chuỗi mã hóa chứa thông tin user
 * - Được tạo khi đăng nhập thành công
 * - Client gửi kèm token trong mỗi request để chứng minh danh tính
 * - Server kiểm tra token hợp lệ → cho phép truy cập
 * 
 * VÍ DỤ HEADER:
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware bảo vệ route - Yêu cầu đăng nhập
 * 
 * Sử dụng: router.get('/tasks', protect, taskController.getTasks)
 * → Chỉ user đã đăng nhập mới truy cập được route này
 */
const protect = async (req, res, next) => {
  let token;

  // ===== BƯỚC 1: LẤY TOKEN TỪ HEADER =====
  /**
   * Kiểm tra header "Authorization" có tồn tại và bắt đầu bằng "Bearer" không
   * Format chuẩn: "Bearer <token>"
   * Ví dụ: "Bearer eyJhbGciOiJIUzI..."
   */
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Tách lấy phần token (bỏ chữ "Bearer " phía trước)
      // "Bearer abc123" → "abc123"
      token = req.headers.authorization.split(' ')[1];

      // ===== BƯỚC 2: GIẢI MÃ TOKEN =====
      /**
       * jwt.verify() kiểm tra:
       * 1. Token có hợp lệ không (chữ ký đúng)
       * 2. Token có hết hạn chưa
       * 3. Nếu hợp lệ → trả về payload (dữ liệu bên trong token)
       *    Payload chứa: { id: "userId...", iat: ..., exp: ... }
       */
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ===== BƯỚC 3: TÌM USER TRONG DATABASE =====
      /**
       * Tìm user theo ID từ token
       * .select('-password') → loại bỏ trường password (bảo mật)
       * Kết quả gắn vào req.user để các controller phía sau sử dụng
       */
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Người dùng không tồn tại',
        });
      }

      // ===== BƯỚC 4: CHO PHÉP TIẾP TỤC =====
      next(); // Chuyển sang middleware/controller tiếp theo
    } catch (error) {
      // Token không hợp lệ hoặc đã hết hạn
      console.error('Lỗi xác thực token:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
      });
    }
  }

  // Không có token trong header
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.',
    });
  }
};

module.exports = { protect };
