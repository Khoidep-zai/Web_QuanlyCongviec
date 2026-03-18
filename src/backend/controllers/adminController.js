const User = require('../models/User');
const Task = require('../models/Task');
const Category = require('../models/Category');

const getAdminOverview = async (req, res) => {
  try {
    const [totalUsers, activeUsers, adminUsers, totalTasks, totalCategories] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
      Task.countDocuments(),
      Category.countDocuments(),
    ]);

    const latestUsers = await User.find()
      .select('username email fullName role isActive createdAt lastLogin')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        adminUsers,
        totalTasks,
        totalCategories,
        latestUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu quản trị: ' + error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('username email fullName role isActive createdAt lastLogin')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách người dùng: ' + error.message,
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái isActive phải là true hoặc false',
      });
    }

    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Không thể tự khóa tài khoản admin đang đăng nhập',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('username email fullName role isActive createdAt lastLogin');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái tài khoản thành công',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái người dùng: ' + error.message,
    });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      });
    }

    const user = await User.findById(req.params.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    user.password = newPassword;
    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: `Đã reset mật khẩu cho ${user.username}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi reset mật khẩu: ' + error.message,
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('userId', 'username email fullName')
      .populate('category', 'name color')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách công việc toàn hệ thống: ' + error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc',
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa công việc thành công',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa công việc: ' + error.message,
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('userId', 'username email fullName')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh mục toàn hệ thống: ' + error.message,
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { userId, name, color, description } = req.body;

    if (!userId || !name) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp userId và tên danh mục',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng để tạo danh mục',
      });
    }

    const category = await Category.create({
      userId,
      name,
      color: color || '#3498DB',
      description: description || '',
    });

    await category.populate('userId', 'username email fullName');

    res.status(201).json({
      success: true,
      message: 'Tạo danh mục thành công',
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo danh mục: ' + error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục',
      });
    }

    if (req.body.name !== undefined) {
      category.name = req.body.name;
    }
    if (req.body.color !== undefined) {
      category.color = req.body.color;
    }
    if (req.body.description !== undefined) {
      category.description = req.body.description;
    }

    const updatedCategory = await category.save();
    await updatedCategory.populate('userId', 'username email fullName');

    res.json({
      success: true,
      message: 'Cập nhật danh mục thành công',
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật danh mục: ' + error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục',
      });
    }

    await Task.updateMany({ category: category._id }, { $set: { category: null } });
    await Category.findByIdAndDelete(category._id);

    res.json({
      success: true,
      message: 'Đã xóa danh mục và gỡ liên kết khỏi task',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa danh mục: ' + error.message,
    });
  }
};

module.exports = {
  getAdminOverview,
  getUsers,
  updateUserStatus,
  resetUserPassword,
  getTasks,
  deleteTask,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
