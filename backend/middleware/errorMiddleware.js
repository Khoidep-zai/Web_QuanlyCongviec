/**
 * =============================================
 * MIDDLEWARE XỬ LÝ LỖI TẬP TRUNG
 * =============================================
 * 
 * File này xử lý tất cả lỗi phát sinh trong ứng dụng.
 * 
 * NGUYÊN LÝ HOẠT ĐỘNG:
 * - Khi một route/controller gặp lỗi, lỗi được "ném" (throw) ra
 * - Express tự động chuyển lỗi đến middleware xử lý lỗi (4 tham số)
 * - Middleware này bắt lỗi, format lại và trả về response thân thiện
 * - Giúp tránh việc phải viết try-catch ở mọi nơi
 * 
 * CÁC LOẠI LỖI ĐƯỢC XỬ LÝ:
 * 1. Lỗi validation (dữ liệu không hợp lệ)
 * 2. Lỗi trùng dữ liệu (duplicate key)
 * 3. Lỗi ID không hợp lệ (CastError)
 * 4. Lỗi không xác định (server error)
 */

/**
 * Middleware xử lý lỗi
 * 
 * @param {Error} err - Đối tượng lỗi
 * @param {Request} req - Request từ client
 * @param {Response} res - Response trả về client
 * @param {Function} next - Hàm chuyển sang middleware tiếp theo
 * 
 * LƯU Ý: Express nhận biết đây là error middleware
 * nhờ có đủ 4 tham số (err, req, res, next)
 */
const errorHandler = (err, req, res, next) => {
  // Lấy status code từ response, mặc định 500 (Server Error)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // ===== XỬ LÝ LỖI MONGODB =====

  /**
   * Lỗi CastError: ID không đúng định dạng ObjectId
   * Ví dụ: /api/tasks/abc123 (ID phải là 24 ký tự hex)
   */
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Không tìm thấy dữ liệu với ID này';
  }

  /**
   * Lỗi Duplicate Key (mã 11000): Dữ liệu trùng lặp
   * Ví dụ: Đăng ký email đã có trong hệ thống
   */
  if (err.code === 11000) {
    statusCode = 400;
    // Lấy tên trường bị trùng
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `${field} "${value}" đã tồn tại. Vui lòng sử dụng giá trị khác.`;
  }

  /**
   * Lỗi Validation: Dữ liệu không đáp ứng yêu cầu schema
   * Ví dụ: Thiếu trường bắt buộc, vượt quá maxlength,...
   */
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Gom tất cả thông báo lỗi validation thành 1 chuỗi
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join('. ');
  }

  // ===== TRẢ VỀ RESPONSE LỖI =====
  res.status(statusCode).json({
    success: false,
    message,
    // Chỉ hiện chi tiết lỗi (stack trace) trong môi trường development
    // Trong production, ẩn đi để bảo mật
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };
