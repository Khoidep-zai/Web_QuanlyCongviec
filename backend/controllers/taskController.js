/**
 * =============================================
 * CONTROLLER CÔNG VIỆC (TASK CONTROLLER)
 * =============================================
 * 
 * File này xử lý tất cả logic liên quan đến Công việc (Task):
 * - Lấy danh sách công việc (có lọc, sắp xếp, phân trang)
 * - Tạo công việc mới
 * - Xem chi tiết một công việc
 * - Cập nhật công việc
 * - Xóa công việc
 * - Thống kê công việc
 * - Quản lý công việc con (subtasks)
 * 
 * NGUYÊN LÝ HOẠT ĐỘNG:
 * - Mỗi hàm xử lý một hành động CRUD
 * - Tất cả đều yêu cầu đăng nhập (middleware protect)
 * - User chỉ có thể thao tác với task CỦA MÌNH (lọc theo userId)
 * - Hỗ trợ lọc, sắp xếp, tìm kiếm và phân trang
 */

const Task = require('../models/Task');

// =============================================
// LẤY DANH SÁCH CÔNG VIỆC
// =============================================
/**
 * @route   GET /api/tasks
 * @desc    Lấy danh sách công việc của user đang đăng nhập
 * @access  Riêng tư
 * 
 * QUERY PARAMETERS (tham số truyền qua URL):
 * - status: Lọc theo trạng thái (todo, in-progress, completed, archived)
 * - priority: Lọc theo ưu tiên (low, medium, high, urgent)
 * - category: Lọc theo danh mục (categoryId)
 * - search: Tìm kiếm theo tiêu đề
 * - sortBy: Sắp xếp theo trường (createdAt, dueDate, priority)
 * - order: Thứ tự sắp xếp (asc = tăng dần, desc = giảm dần)
 * - page: Trang hiện tại (mặc định: 1)
 * - limit: Số task mỗi trang (mặc định: 10)
 * 
 * VÍ DỤ: GET /api/tasks?status=todo&priority=high&page=1&limit=10
 */
const getTasks = async (req, res) => {
  try {
    // ===== XÂY DỰNG BỘ LỌC =====
    // Bắt đầu với điều kiện: chỉ lấy task của user hiện tại
    const filter = { userId: req.user._id };

    // Lọc theo trạng thái (nếu có)
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Lọc theo mức độ ưu tiên (nếu có)
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    // Lọc theo danh mục (nếu có)
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Tìm kiếm theo tiêu đề (nếu có)
    // $regex: tìm kiếm gần đúng (không cần nhập chính xác)
    // $options: 'i' → không phân biệt chữ hoa/thường
    if (req.query.search) {
      filter.title = {
        $regex: req.query.search,
        $options: 'i',
      };
    }

    // ===== PHÂN TRANG =====
    // parseInt() chuyển chuỗi thành số nguyên
    const page = parseInt(req.query.page) || 1;    // Trang hiện tại
    const limit = parseInt(req.query.limit) || 10;  // Số task mỗi trang
    const skip = (page - 1) * limit;               // Số task cần bỏ qua

    // ===== SẮP XẾP =====
    const sortBy = req.query.sortBy || 'createdAt'; // Mặc định: ngày tạo
    const order = req.query.order === 'asc' ? 1 : -1; // 1 = tăng, -1 = giảm
    const sort = { [sortBy]: order };

    // ===== THỰC HIỆN TRUY VẤN =====
    // Đếm tổng số task (để tính số trang)
    const total = await Task.countDocuments(filter);

    // Lấy danh sách task
    // .populate('category') → thay thế categoryId bằng thông tin category đầy đủ
    // .sort() → sắp xếp kết quả
    // .skip() → bỏ qua N task đầu (phân trang)
    // .limit() → giới hạn số kết quả
    const tasks = await Task.find(filter)
      .populate('category', 'name color') // Lấy tên và màu của category
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // ===== TRẢ VỀ KẾT QUẢ =====
    res.json({
      success: true,
      data: tasks,
      pagination: {
        currentPage: page,        // Trang hiện tại
        totalPages: Math.ceil(total / limit), // Tổng số trang
        totalTasks: total,        // Tổng số task
        limit,                    // Số task mỗi trang
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách công việc: ' + error.message,
    });
  }
};

// =============================================
// TẠO CÔNG VIỆC MỚI
// =============================================
/**
 * @route   POST /api/tasks
 * @desc    Tạo một công việc mới
 * @access  Riêng tư
 * 
 * BODY: { title, description, status, priority, category, tags, dueDate, subtasks }
 */
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, category, tags, dueDate, subtasks } = req.body;

    // Tạo task mới với userId từ token đăng nhập
    const task = await Task.create({
      userId: req.user._id,  // Lấy từ middleware protect
      title,
      description,
      status,
      priority,
      category: category || null,
      tags: tags || [],
      dueDate: dueDate || null,
      subtasks: subtasks || [],
    });

    // Populate category trước khi trả về
    await task.populate('category', 'name color');

    res.status(201).json({
      success: true,
      message: 'Tạo công việc thành công!',
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo công việc: ' + error.message,
    });
  }
};

// =============================================
// XEM CHI TIẾT MỘT CÔNG VIỆC
// =============================================
/**
 * @route   GET /api/tasks/:id
 * @desc    Lấy thông tin chi tiết một task theo ID
 * @access  Riêng tư
 * 
 * NGUYÊN LÝ:
 * - Lấy task ID từ URL parameter (req.params.id)
 * - Kiểm tra task tồn tại VÀ thuộc về user hiện tại
 * - Trả về thông tin đầy đủ
 */
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id, // Chỉ lấy task của user hiện tại
    }).populate('category', 'name color');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc',
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết công việc: ' + error.message,
    });
  }
};

// =============================================
// CẬP NHẬT CÔNG VIỆC
// =============================================
/**
 * @route   PUT /api/tasks/:id
 * @desc    Cập nhật thông tin task
 * @access  Riêng tư
 * 
 * NGUYÊN LÝ:
 * - Tìm task theo ID + userId (bảo mật: chỉ sửa task của mình)
 * - Cập nhật các trường được gửi lên
 * - Lưu lại và trả về task đã cập nhật
 */
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc',
      });
    }

    // Cập nhật các trường (chỉ cập nhật trường được gửi lên)
    const fieldsToUpdate = ['title', 'description', 'status', 'priority', 'category', 'tags', 'dueDate', 'subtasks'];
    
    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    // Lưu vào database (middleware pre-save sẽ tự chạy)
    const updatedTask = await task.save();
    await updatedTask.populate('category', 'name color');

    res.json({
      success: true,
      message: 'Cập nhật công việc thành công!',
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật công việc: ' + error.message,
    });
  }
};

// =============================================
// XÓA CÔNG VIỆC
// =============================================
/**
 * @route   DELETE /api/tasks/:id
 * @desc    Xóa một task
 * @access  Riêng tư
 * 
 * NGUYÊN LÝ:
 * - Tìm và xóa task theo ID + userId
 * - Nếu không tìm thấy → trả lỗi 404
 * - Nếu tìm thấy → xóa khỏi database
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc',
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa công việc thành công!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa công việc: ' + error.message,
    });
  }
};

// =============================================
// THỐNG KÊ CÔNG VIỆC
// =============================================
/**
 * @route   GET /api/tasks/stats/overview
 * @desc    Lấy thống kê tổng quan về công việc
 * @access  Riêng tư
 * 
 * NGUYÊN LÝ:
 * - Sử dụng MongoDB Aggregation Pipeline
 * - Nhóm tasks theo trạng thái và đếm số lượng
 * - Tính toán các chỉ số: tổng task, hoàn thành, quá hạn,...
 */
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // ===== THỐNG KÊ THEO TRẠNG THÁI =====
    /**
     * Aggregation Pipeline:
     * 1. $match: Lọc task của user hiện tại
     * 2. $group: Nhóm theo status, đếm số lượng mỗi nhóm
     */
    const statusStats = await Task.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$status',     // Nhóm theo trạng thái
          count: { $sum: 1 }, // Đếm số lượng
        },
      },
    ]);

    // ===== THỐNG KÊ THEO MỨC ĐỘ ƯU TIÊN =====
    const priorityStats = await Task.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // ===== ĐẾM TỔNG VÀ CÁC CHỈ SỐ KHÁC =====
    const total = await Task.countDocuments({ userId });

    // Đếm task quá hạn (chưa hoàn thành + deadline đã qua)
    const overdue = await Task.countDocuments({
      userId,
      status: { $nin: ['completed', 'archived'] }, // Chưa hoàn thành
      dueDate: { $lt: new Date() },                 // Deadline đã qua
    });

    // Đếm task hoàn thành hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const completedToday = await Task.countDocuments({
      userId,
      status: 'completed',
      completedAt: { $gte: today, $lt: tomorrow },
    });

    // ===== CHUYỂN ĐỔI KẾT QUẢ =====
    // Chuyển từ mảng [{_id: 'todo', count: 5}] sang object {todo: 5}
    const byStatus = {};
    statusStats.forEach((item) => {
      byStatus[item._id] = item.count;
    });

    const byPriority = {};
    priorityStats.forEach((item) => {
      byPriority[item._id] = item.count;
    });

    res.json({
      success: true,
      data: {
        total,                                          // Tổng số task
        byStatus: {
          todo: byStatus['todo'] || 0,                  // Cần làm
          'in-progress': byStatus['in-progress'] || 0,  // Đang làm
          completed: byStatus['completed'] || 0,        // Hoàn thành
          archived: byStatus['archived'] || 0,          // Lưu trữ
        },
        byPriority: {
          low: byPriority['low'] || 0,                  // Ưu tiên thấp
          medium: byPriority['medium'] || 0,            // Ưu tiên TB
          high: byPriority['high'] || 0,                // Ưu tiên cao
          urgent: byPriority['urgent'] || 0,            // Khẩn cấp
        },
        overdue,                                        // Quá hạn
        completedToday,                                 // Hoàn thành hôm nay
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê: ' + error.message,
    });
  }
};

// =============================================
// CẬP NHẬT TRẠNG THÁI CÔNG VIỆC CON (SUBTASK)
// =============================================
/**
 * @route   PUT /api/tasks/:id/subtasks/:subtaskId
 * @desc    Đánh dấu hoàn thành/chưa hoàn thành một subtask
 * @access  Riêng tư
 */
const toggleSubtask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc',
      });
    }

    // Tìm subtask theo ID
    const subtask = task.subtasks.id(req.params.subtaskId);

    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc con',
      });
    }

    // Đảo trạng thái: true → false, false → true
    subtask.completed = !subtask.completed;

    await task.save();
    await task.populate('category', 'name color');

    res.json({
      success: true,
      message: subtask.completed ? 'Đã hoàn thành công việc con!' : 'Đã bỏ hoàn thành công việc con',
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật công việc con: ' + error.message,
    });
  }
};

// Xuất tất cả các hàm controller
module.exports = {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
  toggleSubtask,
};
