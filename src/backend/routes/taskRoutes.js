/**
 * =============================================
 * ROUTES CÔNG VIỆC (TASK ROUTES)
 * =============================================
 * 
 * File này định nghĩa các đường dẫn API cho chức năng Công việc.
 * Tất cả routes đều yêu cầu đăng nhập (middleware protect).
 * 
 * DANH SÁCH API:
 * ┌──────────┬─────────────────────────────────────┬────────────────────────────┐
 * │ Method   │ URL                                 │ Chức năng                  │
 * ├──────────┼─────────────────────────────────────┼────────────────────────────┤
 * │ GET      │ /api/tasks                          │ Lấy danh sách công việc    │
 * │ POST     │ /api/tasks                          │ Tạo công việc mới          │
 * │ GET      │ /api/tasks/stats/overview            │ Thống kê tổng quan         │
 * │ GET      │ /api/tasks/:id                      │ Xem chi tiết công việc     │
 * │ PUT      │ /api/tasks/:id                      │ Cập nhật công việc         │
 * │ DELETE   │ /api/tasks/:id                      │ Xóa công việc              │
 * │ PUT      │ /api/tasks/:id/subtasks/:subtaskId  │ Cập nhật công việc con     │
 * └──────────┴─────────────────────────────────────┴────────────────────────────┘
 * 
 * LƯU Ý: Route /stats/overview phải đặt TRƯỚC /:id
 * Vì Express khớp route theo thứ tự, nếu /:id đứng trước
 * thì "stats" sẽ bị hiểu nhầm là ID
 */

const express = require('express');
const router = express.Router();

const {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
  getWeeklySchedule,
  getDeadlineAlerts,
  toggleSubtask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Áp dụng middleware protect cho TẤT CẢ routes bên dưới
// → Tất cả đều yêu cầu đăng nhập
router.use(protect);

// ===== ROUTES THỐNG KÊ (đặt trước /:id) =====
router.get('/stats/overview', getTaskStats);
router.get('/schedule/week', getWeeklySchedule);
router.get('/alerts/deadlines', getDeadlineAlerts);

// ===== ROUTES CRUD CHÍNH =====
router.route('/')
  .get(getTasks)      // GET /api/tasks → Lấy danh sách
  .post(createTask);  // POST /api/tasks → Tạo mới

router.route('/:id')
  .get(getTaskById)   // GET /api/tasks/:id → Xem chi tiết
  .put(updateTask)    // PUT /api/tasks/:id → Cập nhật
  .delete(deleteTask); // DELETE /api/tasks/:id → Xóa

// ===== ROUTES CÔNG VIỆC CON =====
router.put('/:id/subtasks/:subtaskId', toggleSubtask);

module.exports = router;
