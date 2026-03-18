/**
 * =============================================
 * CONTROLLER DANH MỤC (CATEGORY CONTROLLER)
 * =============================================
 * 
 * File này xử lý logic liên quan đến Danh mục (Category):
 * - Lấy danh sách danh mục
 * - Tạo danh mục mới
 * - Cập nhật danh mục
 * - Xóa danh mục
 * 
 * NGUYÊN LÝ HOẠT ĐỘNG:
 * - Danh mục giúp phân loại công việc theo nhóm
 * - Mỗi user có bộ danh mục riêng (không ảnh hưởng user khác)
 * - Khi xóa danh mục, các task thuộc danh mục đó sẽ 
 *   được gỡ liên kết (category = null)
 */

const Category = require('../models/Category');
const Task = require('../models/Task');

// =============================================
// LẤY DANH SÁCH DANH MỤC
// =============================================
/**
 * @route   GET /api/categories
 * @desc    Lấy tất cả danh mục của user hiện tại
 * @access  Riêng tư
 * 
 * NGUYÊN LÝ:
 * - Lọc theo userId để chỉ lấy danh mục của user đang đăng nhập
 * - Sắp xếp theo tên danh mục (A → Z)
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user._id })
      .sort({ name: 1 }); // Sắp xếp tên A → Z

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách danh mục: ' + error.message,
    });
  }
};

// =============================================
// TẠO DANH MỤC MỚI
// =============================================
/**
 * @route   POST /api/categories
 * @desc    Tạo danh mục mới
 * @access  Riêng tư
 * 
 * BODY: { name, color, description }
 * 
 * LUỒNG XỬ LÝ:
 * 1. Nhận thông tin danh mục từ body
 * 2. Kiểm tra tên danh mục đã tồn tại chưa (trong phạm vi user)
 * 3. Tạo danh mục mới
 * 4. Trả về danh mục đã tạo
 */
const createCategory = async (req, res) => {
  try {
    const { name, color, description } = req.body;

    // Kiểm tra tên danh mục đã tồn tại chưa (của user này)
    const existingCategory = await Category.findOne({
      userId: req.user._id,
      name: { $regex: new RegExp(`^${name}$`, 'i') }, // So sánh không phân biệt hoa/thường
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: `Danh mục "${name}" đã tồn tại`,
      });
    }

    // Tạo danh mục mới
    const category = await Category.create({
      userId: req.user._id,
      name,
      color: color || '#3498DB',
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Tạo danh mục thành công!',
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo danh mục: ' + error.message,
    });
  }
};

// =============================================
// CẬP NHẬT DANH MỤC
// =============================================
/**
 * @route   PUT /api/categories/:id
 * @desc    Cập nhật thông tin danh mục
 * @access  Riêng tư
 */
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục',
      });
    }

    // Cập nhật các trường
    category.name = req.body.name || category.name;
    category.color = req.body.color || category.color;
    category.description = req.body.description !== undefined
      ? req.body.description
      : category.description;

    const updatedCategory = await category.save();

    res.json({
      success: true,
      message: 'Cập nhật danh mục thành công!',
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật danh mục: ' + error.message,
    });
  }
};

// =============================================
// XÓA DANH MỤC
// =============================================
/**
 * @route   DELETE /api/categories/:id
 * @desc    Xóa danh mục
 * @access  Riêng tư
 * 
 * LƯU Ý QUAN TRỌNG:
 * - Khi xóa danh mục, các task thuộc danh mục này
 *   sẽ được GỠ LIÊN KẾT (category = null)
 * - Các task KHÔNG bị xóa theo
 */
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục',
      });
    }

    // Gỡ liên kết: đặt category = null cho tất cả task thuộc danh mục này
    await Task.updateMany(
      { category: req.params.id, userId: req.user._id },
      { $set: { category: null } }
    );

    // Xóa danh mục
    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Đã xóa danh mục thành công! Các công việc liên quan đã được gỡ liên kết.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa danh mục: ' + error.message,
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
