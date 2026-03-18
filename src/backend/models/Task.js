/**
 * =============================================
 * MODEL CÔNG VIỆC (TASK)
 * =============================================
 * 
 * File này định nghĩa cấu trúc dữ liệu của Công việc trong MongoDB.
 * 
 * NGUYÊN LÝ HOẠT ĐỘNG:
 * - Mỗi công việc thuộc về MỘT người dùng (userId)
 * - Công việc có thể thuộc MỘT danh mục (category)
 * - Có 4 trạng thái: Cần làm, Đang làm, Hoàn thành, Đã lưu trữ
 * - Có 4 mức độ ưu tiên: Thấp, Trung bình, Cao, Khẩn cấp
 * - Hỗ trợ công việc con (subtasks) để chia nhỏ công việc lớn
 * 
 * QUAN HỆ DỮ LIỆU:
 * - Task → User: Mỗi task thuộc 1 user (quan hệ nhiều-một)
 * - Task → Category: Mỗi task có thể thuộc 1 danh mục (tùy chọn)
 */

const mongoose = require('mongoose');

// ===== SCHEMA CÔNG VIỆC CON (SUBTASK) =====
/**
 * Subtask là công việc nhỏ bên trong một task lớn
 * Ví dụ: Task "Làm đồ án" có subtasks: "Viết báo cáo", "Code frontend", "Code backend"
 */
const subtaskSchema = new mongoose.Schema({
  // Tiêu đề công việc con
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề công việc con'],
    trim: true,
    maxlength: 200,
  },
  // Trạng thái hoàn thành (true = đã xong, false = chưa xong)
  completed: {
    type: Boolean,
    default: false,
  },
  // Thời điểm hoàn thành subtask
  completedAt: {
    type: Date,
    default: null,
  },
});

// ===== SCHEMA CÔNG VIỆC CHÍNH =====
const taskSchema = new mongoose.Schema(
  {
    // ID người dùng sở hữu task này
    // ref: 'User' → liên kết đến collection "users"
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Công việc phải thuộc về một người dùng'],
    },

    // Tiêu đề công việc - bắt buộc
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề công việc'],
      trim: true,
      maxlength: [200, 'Tiêu đề không được quá 200 ký tự'],
    },

    // Mô tả chi tiết công việc - tùy chọn
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Mô tả không được quá 2000 ký tự'],
    },

    // Trạng thái công việc
    // - todo: Cần làm (mặc định)
    // - in-progress: Đang làm
    // - completed: Hoàn thành
    // - archived: Đã lưu trữ
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'completed', 'archived'],
        message: 'Trạng thái không hợp lệ',
      },
      default: 'todo',
    },

    // Mức độ ưu tiên
    // - low: Thấp
    // - medium: Trung bình (mặc định)
    // - high: Cao
    // - urgent: Khẩn cấp
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: 'Mức độ ưu tiên không hợp lệ',
      },
      default: 'medium',
    },

    // Danh mục của công việc (tùy chọn)
    // ref: 'Category' → liên kết đến collection "categories"
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },

    // Các thẻ tag để phân loại (mảng chuỗi)
    // Ví dụ: ["học tập", "quan trọng", "đồ án"]
    tags: [{
      type: String,
      trim: true,
    }],

    // Hạn hoàn thành công việc
    dueDate: {
      type: Date,
      default: null,
    },

    // Thời gian bắt đầu công việc trong thời khóa biểu
    scheduleStart: {
      type: Date,
      default: null,
    },

    // Thời gian kết thúc công việc trong thời khóa biểu
    scheduleEnd: {
      type: Date,
      default: null,
    },

    // Thời điểm hoàn thành thực tế
    completedAt: {
      type: Date,
      default: null,
    },

    // Danh sách công việc con
    subtasks: [subtaskSchema],

    // Đã lưu trữ? (khác với status='archived' — dùng để ẩn task khỏi danh sách chính)
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Tự động thêm createdAt và updatedAt
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============================================
// ĐÁNH INDEX CHO HIỆU SUẤT TRUY VẤN
// =============================================
/**
 * Index giúp MongoDB tìm kiếm nhanh hơn nhiều lần
 * Giống như mục lục trong sách - giúp tìm trang nhanh hơn đọc từ đầu
 * 
 * Compound index (index kết hợp): Tối ưu cho truy vấn có nhiều điều kiện
 * Ví dụ: Tìm tất cả task của user X có trạng thái "todo"
 */
taskSchema.index({ userId: 1, status: 1 });                          // Theo user + trạng thái
taskSchema.index({ userId: 1, priority: 1 });                        // Theo user + ưu tiên
taskSchema.index({ userId: 1, dueDate: 1 });                         // Theo user + deadline
taskSchema.index({ userId: 1, scheduleStart: 1, scheduleEnd: 1 });   // Theo user + lịch
taskSchema.index({ userId: 1, category: 1 });                        // Theo user + danh mục
taskSchema.index({ userId: 1, createdAt: -1 });                      // Theo user + ngày tạo
taskSchema.index({ tags: 1 });                                        // Theo tag
taskSchema.index({ userId: 1, status: 1, priority: -1, dueDate: 1 }); // Lọc kết hợp
// Text index cho tìm kiếm toàn văn
taskSchema.index({ title: 'text', description: 'text' }, { weights: { title: 10, description: 5 } });

// =============================================
// VIRTUALS - GIÁ TRỊ ẢO TÍNH TOÁN
// =============================================

// isOverdue: quá hạn chưa? (có deadline, chưa hoàn thành, và deadline đã qua)
taskSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate || this.status === 'completed') return false;
  return this.dueDate < new Date();
});

// completionPercentage: phần trăm hoàn thành dựa trên subtasks
taskSchema.virtual('completionPercentage').get(function () {
  if (!this.subtasks || this.subtasks.length === 0) {
    return this.status === 'completed' ? 100 : 0;
  }
  const completed = this.subtasks.filter((st) => st.completed).length;
  return Math.round((completed / this.subtasks.length) * 100);
});

// =============================================
// MIDDLEWARE - TỰ ĐỘNG CẬP NHẬT KHI HOÀN THÀNH
// =============================================
/**
 * Khi trạng thái task chuyển sang "completed":
 * - Tự động ghi lại thời điểm hoàn thành (completedAt)
 * 
 * Khi trạng thái chuyển từ "completed" sang trạng thái khác:
 * - Xóa thời điểm hoàn thành (đặt lại null)
 */
taskSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date(); // Ghi thời điểm hoàn thành
    } else if (this.status !== 'completed' && this.completedAt) {
      this.completedAt = null; // Xóa thời điểm hoàn thành
    }
  }
  next();
});

// Tạo Model từ Schema
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
