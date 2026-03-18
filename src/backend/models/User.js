/**
 * =============================================
 * MODEL NGƯỜI DÙNG (USER)
 * =============================================
 * 
 * File này định nghĩa cấu trúc dữ liệu của Người dùng trong MongoDB.
 * 
 * NGUYÊN LÝ HOẠT ĐỘNG:
 * - Mongoose Schema định nghĩa "khuôn mẫu" cho dữ liệu người dùng
 * - Mỗi khi tạo user mới, dữ liệu phải tuân theo schema này
 * - Mật khẩu được MÃ HÓA trước khi lưu vào database (dùng bcrypt)
 * - Không ai (kể cả admin) có thể đọc được mật khẩu gốc
 * 
 * CÁC TRƯỜNG DỮ LIỆU:
 * - username: Tên đăng nhập (duy nhất)
 * - email: Email (duy nhất) 
 * - password: Mật khẩu (được mã hóa)
 * - fullName: Họ tên đầy đủ
 * - avatar: Đường dẫn ảnh đại diện
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ===== ĐỊNH NGHĨA SCHEMA (CẤU TRÚC DỮ LIỆU) =====
const userSchema = new mongoose.Schema(
  {
    // Tên đăng nhập - bắt buộc, duy nhất, 3-30 ký tự
    username: {
      type: String,
      required: [true, 'Vui lòng nhập tên đăng nhập'],
      unique: true,           // Không được trùng
      trim: true,             // Xóa khoảng trắng đầu/cuối
      minlength: [3, 'Tên đăng nhập phải có ít nhất 3 ký tự'],
      maxlength: [30, 'Tên đăng nhập không được quá 30 ký tự'],
    },

    // Email - bắt buộc, duy nhất, phải đúng định dạng
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      unique: true,
      trim: true,
      lowercase: true,        // Tự động chuyển thành chữ thường
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Vui lòng nhập email hợp lệ',
      ],
    },

    // Mật khẩu - bắt buộc, tối thiểu 6 ký tự
    // LƯU Ý: Mật khẩu sẽ được mã hóa trước khi lưu (xem middleware bên dưới)
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
      select: false, // Mặc định KHÔNG trả về password khi query
    },

    // Họ tên đầy đủ
    fullName: {
      type: String,
      trim: true,
      default: '',
    },

    // Đường dẫn ảnh đại diện
    avatar: {
      type: String,
      default: '',
    },

    // Trạng thái tài khoản (bị khóa hay không)
    isActive: {
      type: Boolean,
      default: true,
    },

    // Vai trò người dùng
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // Email đã xác minh chưa
    emailVerified: {
      type: Boolean,
      default: false,
    },

    // Thời điểm đăng nhập gần nhất
    lastLogin: {
      type: Date,
      default: null,
    },

    // Cài đặt cá nhân
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light',
      },
      defaultView: {
        type: String,
        enum: ['list', 'grid', 'kanban'],
        default: 'list',
      },
    },
  },
  {
    // ===== TÙY CHỌN SCHEMA =====
    // timestamps: true → Tự động thêm 2 trường:
    //   - createdAt: Thời điểm tạo tài khoản
    //   - updatedAt: Thời điểm cập nhật gần nhất
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index bổ sung tăng tốc tìm kiếm theo ngày tạo
// (email và username đã có index tự động nhờ unique: true)
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1 });

// Virtual: đếm số task của user (dùng khi populate)
userSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'userId',
  count: true,
});

// =============================================
// MIDDLEWARE "PRE-SAVE" - CHẠY TRƯỚC KHI LƯU
// =============================================
/**
 * NGUYÊN LÝ MÃ HÓA MẬT KHẨU:
 * 1. Khi user đăng ký hoặc đổi mật khẩu, middleware này tự động chạy
 * 2. Kiểm tra xem mật khẩu có bị thay đổi không (isModified)
 * 3. Nếu có, tạo "salt" (chuỗi ngẫu nhiên) với độ khó 10 vòng
 * 4. Kết hợp salt + mật khẩu gốc → tạo ra chuỗi mã hóa (hash)
 * 5. Lưu chuỗi hash vào database thay vì mật khẩu gốc
 * 
 * Ví dụ: "123456" → "$2a$10$X7UrE5HJ8Gn..."
 */
userSchema.pre('save', async function (next) {
  // Chỉ mã hóa khi mật khẩu mới được tạo hoặc thay đổi
  if (!this.isModified('password')) {
    return next(); // Bỏ qua nếu mật khẩu không đổi
  }

  // Tạo salt (chuỗi ngẫu nhiên) - số 12 là độ phức tạp (an toàn hơn)
  const salt = await bcrypt.genSalt(12);

  // Mã hóa mật khẩu với salt
  this.password = await bcrypt.hash(this.password, salt);

  next(); // Tiếp tục lưu vào database
});

// =============================================
// PHƯƠNG THỨC SO SÁNH MẬT KHẨU
// =============================================
/**
 * Dùng khi đăng nhập để kiểm tra mật khẩu user nhập vào
 * có khớp với mật khẩu đã mã hóa trong database không.
 * 
 * NGUYÊN LÝ:
 * - bcrypt.compare() sẽ mã hóa mật khẩu nhập vào với cùng salt
 * - So sánh kết quả với hash đã lưu trong database
 * - Trả về true nếu khớp, false nếu không khớp
 * 
 * @param {string} enteredPassword - Mật khẩu người dùng nhập khi đăng nhập
 * @returns {boolean} - true nếu mật khẩu đúng, false nếu sai
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Alias để tương thích với cả hai cách gọi
userSchema.methods.comparePassword = userSchema.methods.matchPassword;

// Tạo Model từ Schema và xuất ra
// Model là "lớp" để tương tác với collection "users" trong MongoDB
const User = mongoose.model('User', userSchema);

module.exports = User;
