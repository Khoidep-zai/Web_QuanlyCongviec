/**
 * =============================================
 * CONTROLLER XÁC THỰC (AUTH CONTROLLER)
 * =============================================
 * 
 * File này xử lý logic cho các chức năng:
 * - Đăng ký tài khoản mới
 * - Đăng nhập
 * - Lấy thông tin người dùng hiện tại
 * - Cập nhật thông tin cá nhân
 * 
 * NGUYÊN LÝ HOẠT ĐỘNG:
 * 1. Route nhận request từ client → chuyển đến controller
 * 2. Controller xử lý logic nghiệp vụ (kiểm tra, tạo/đọc dữ liệu)
 * 3. Controller trả về response cho client
 * 
 * LUỒNG ĐĂNG KÝ: Nhận thông tin → Kiểm tra trùng → Tạo user → Tạo token → Trả về
 * LUỒNG ĐĂNG NHẬP: Nhận email+pass → Tìm user → So sánh pass → Tạo token → Trả về
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createDefaultCategories } = require('../config/database');

// =============================================
// HÀM TẠO JWT TOKEN
// =============================================
/**
 * Tạo JWT token chứa ID người dùng
 * 
 * NGUYÊN LÝ:
 * - jwt.sign() tạo token từ payload + secret key
 * - Payload chứa ID user (để server biết token thuộc về ai)
 * - Secret key dùng để ký và xác minh token (chỉ server biết)
 * - expiresIn: thời gian sống của token (7 ngày)
 * 
 * @param {string} id - ID người dùng từ MongoDB
 * @returns {string} - JWT token string
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// =============================================
// ĐĂNG KÝ TÀI KHOẢN MỚI
// =============================================
/**
 * @route   POST /api/auth/register
 * @desc    Đăng ký tài khoản người dùng mới
 * @access  Công khai (ai cũng truy cập được)
 * 
 * LUỒNG XỬ LÝ:
 * 1. Nhận username, email, password, fullName từ body
 * 2. Kiểm tra email/username đã tồn tại chưa
 * 3. Tạo user mới (mật khẩu tự động mã hóa nhờ middleware)
 * 4. Tạo JWT token
 * 5. Trả về thông tin user + token
 */
const register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Kiểm tra email đã được đăng ký chưa
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? 'Email này đã được đăng ký'
            : 'Tên đăng nhập đã tồn tại',
      });
    }

    // Tạo người dùng mới trong database
    // Mật khẩu sẽ tự động được mã hóa bởi middleware pre('save') trong User model
    const user = await User.create({
      username,
      email,
      password,
      fullName: fullName || '',
    });

    // Tự động tạo 5 danh mục mặc định cho user mới
    await createDefaultCategories(user._id);

    // Tạo token đăng nhập
    const token = generateToken(user._id);

    // Trả về thông tin user (KHÔNG trả về password)
    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công!',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký: ' + error.message,
    });
  }
};

// =============================================
// ĐĂNG NHẬP
// =============================================
/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập vào hệ thống
 * @access  Công khai
 * 
 * LUỒNG XỬ LÝ:
 * 1. Nhận email và password từ body
 * 2. Tìm user theo email (kèm password vì mặc định bị ẩn)
 * 3. So sánh mật khẩu nhập vào với mật khẩu mã hóa trong DB
 * 4. Nếu đúng → tạo token và trả về
 * 5. Nếu sai → trả về lỗi
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra có nhập đủ thông tin không
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu',
      });
    }

    // Tìm user theo email
    // .select('+password') vì password mặc định bị ẩn (select: false trong schema)
    const user = await User.findOne({ email }).select('+password');

    // Kiểm tra user có tồn tại không
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    // So sánh mật khẩu nhập vào với mật khẩu đã mã hóa trong DB
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    // Đăng nhập thành công → cập nhật lastLogin và tạo token
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập: ' + error.message,
    });
  }
};

// =============================================
// LẤY THÔNG TIN NGƯỜI DÙNG HIỆN TẠI
// =============================================
/**
 * @route   GET /api/auth/me
 * @desc    Lấy thông tin user đang đăng nhập
 * @access  Riêng tư (cần đăng nhập)
 * 
 * NGUYÊN LÝ:
 * - Middleware protect đã xác minh token và gắn user vào req.user
 * - Controller chỉ cần trả về req.user
 */
const getMe = async (req, res) => {
  try {
    // req.user đã được gắn bởi middleware protect
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message,
    });
  }
};

// =============================================
// CẬP NHẬT THÔNG TIN CÁ NHÂN
// =============================================
/**
 * @route   PUT /api/auth/profile
 * @desc    Cập nhật thông tin người dùng
 * @access  Riêng tư (cần đăng nhập)
 * 
 * LUỒNG XỬ LÝ:
 * 1. Lấy các trường muốn cập nhật từ body
 * 2. Tìm user theo ID (từ token)
 * 3. Cập nhật các trường được gửi lên
 * 4. Lưu và trả về thông tin mới
 */
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Cập nhật các trường nếu có gửi lên
    user.fullName = req.body.fullName || user.fullName;
    user.username = req.body.username || user.username;

    // Nếu gửi mật khẩu mới → cập nhật (sẽ tự động mã hóa nhờ middleware)
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Lưu vào database
    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công!',
      data: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message,
    });
  }
};

// Xuất các hàm controller
module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
