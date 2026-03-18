/**
 * =============================================
 * MODEL DANH MỤC (CATEGORY)
 * =============================================
 * 
 * File này định nghĩa cấu trúc dữ liệu Danh mục trong MongoDB.
 * 
 * NGUYÊN LÝ HOẠT ĐỘNG:
 * - Danh mục giúp người dùng phân loại công việc theo nhóm
 * - Mỗi danh mục thuộc về MỘT người dùng
 * - Mỗi danh mục có tên, màu sắc và mô tả
 * - Tên danh mục phải duy nhất TRONG PHẠM VI mỗi người dùng
 *   (2 user khác nhau có thể có danh mục cùng tên)
 * 
 * VÍ DỤ DANH MỤC:
 * - "Học tập" (màu xanh dương)
 * - "Công việc" (màu đỏ)
 * - "Cá nhân" (màu xanh lá)
 * - "Mua sắm" (màu vàng)
 */

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    // ID người dùng sở hữu danh mục này
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Danh mục phải thuộc về một người dùng'],
    },

    // Tên danh mục - bắt buộc
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên danh mục'],
      trim: true,
      maxlength: [50, 'Tên danh mục không được quá 50 ký tự'],
    },

    // Mã màu HEX để hiển thị trên giao diện
    // Ví dụ: "#FF5733" (đỏ cam), "#3498DB" (xanh dương)
    color: {
      type: String,
      default: '#3498DB', // Mặc định màu xanh dương
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Mã màu không hợp lệ'],
    },

    // Mô tả danh mục
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Mô tả không được quá 200 ký tự'],
    },

    // Icon danh mục (tên icon từ react-icons hoặc google material icons)
    icon: {
      type: String,
      default: 'folder',
    },

    // Danh mục mặc định (tự động tạo khi user đăng ký)
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============================================
// INDEX: ĐẢM BẢO TÊN DANH MỤC KHÔNG TRÙNG TRONG 1 USER
// =============================================
/**
 * Compound unique index trên (userId, name):
 * - User A có thể tạo danh mục "Học tập"
 * - User B cũng có thể tạo danh mục "Học tập"  
 * - Nhưng User A KHÔNG thể tạo 2 danh mục "Học tập"
 */
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

// Virtual: đếm số task thuộc danh mục này
categorySchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

// Tạo Model từ Schema
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
