/**
 * =============================================
 * ROUTES DANH MỤC (CATEGORY ROUTES)
 * =============================================
 * 
 * File này định nghĩa các đường dẫn API cho chức năng Danh mục.
 * Tất cả routes đều yêu cầu đăng nhập (middleware protect).
 * 
 * DANH SÁCH API:
 * ┌──────────┬────────────────────────┬─────────────────────┐
 * │ Method   │ URL                    │ Chức năng           │
 * ├──────────┼────────────────────────┼─────────────────────┤
 * │ GET      │ /api/categories        │ Lấy danh sách       │
 * │ POST     │ /api/categories        │ Tạo danh mục mới    │
 * │ PUT      │ /api/categories/:id    │ Cập nhật danh mục   │
 * │ DELETE   │ /api/categories/:id    │ Xóa danh mục        │
 * └──────────┴────────────────────────┴─────────────────────┘
 */

const express = require('express');
const router = express.Router();

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

// Áp dụng middleware protect cho tất cả routes
router.use(protect);

// ===== ROUTES CRUD =====
router.route('/')
  .get(getCategories)     // GET /api/categories → Lấy danh sách
  .post(createCategory);  // POST /api/categories → Tạo mới

router.route('/:id')
  .put(updateCategory)    // PUT /api/categories/:id → Cập nhật
  .delete(deleteCategory); // DELETE /api/categories/:id → Xóa

module.exports = router;
