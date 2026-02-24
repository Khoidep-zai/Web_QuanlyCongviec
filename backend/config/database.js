/**
 * =============================================
 * CẤU HÌNH KẾT NỐI CƠ SỞ DỮ LIỆU MONGODB
 * =============================================
 * 
 * File này chịu trách nhiệm kết nối ứng dụng với MongoDB Atlas.
 * 
 * NGUYÊN LÝ HOẠT ĐỘNG:
 * - Sử dụng thư viện Mongoose để kết nối và tương tác với MongoDB
 * - Mongoose là ODM (Object Data Modeling) giúp ánh xạ dữ liệu 
 *   từ MongoDB sang các đối tượng JavaScript dễ thao tác
 * - Khi server khởi động, hàm connectDB() được gọi để thiết lập
 *   kết nối tới MongoDB Atlas trên cloud
 * - Nếu kết nối thất bại, server sẽ dừng lại và báo lỗi
 */

const mongoose = require('mongoose');

/**
 * Hàm kết nối đến MongoDB
 * - Lấy URI (đường dẫn kết nối) từ biến môi trường
 * - Thực hiện kết nối bất đồng bộ (async/await)
 * - Tự động tạo indexes sau khi kết nối thành công
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Đã kết nối MongoDB: ${conn.connection.host}`);

    // Tự động tạo indexes cho tất cả collections
    await createIndexes();
  } catch (error) {
    console.error(`❌ Lỗi kết nối MongoDB: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Tạo indexes cho tất cả collections
 * Được gọi tự động mỗi khi server khởi động
 */
const createIndexes = async () => {
  try {
    // Import models (lazy import để tránh circular dependency)
    const User = require('../models/User');
    const Task = require('../models/Task');
    const Category = require('../models/Category');

    await Promise.all([
      User.createIndexes(),
      Task.createIndexes(),
      Category.createIndexes(),
    ]);
    console.log('📌 Indexes đã được tạo/cập nhật');
  } catch (error) {
    // Không dừng server nếu lỗi index — chỉ cảnh báo
    console.warn('⚠️  Không thể tạo indexes:', error.message);
  }
};

/**
 * Tạo danh mục mặc định cho user mới đăng ký
 * Gọi hàm này trong authController sau khi tạo user thành công
 *
 * @param {string} userId - _id của user vừa tạo
 */
const createDefaultCategories = async (userId) => {
  try {
    const Category = require('../models/Category');

    const defaults = [
      { name: 'Cá nhân',   color: '#3B82F6', icon: 'person',          isDefault: true },
      { name: 'Công việc', color: '#EF4444', icon: 'work',            isDefault: true },
      { name: 'Mua sắm',   color: '#10B981', icon: 'shopping_cart',   isDefault: true },
      { name: 'Sức khỏe',  color: '#F59E0B', icon: 'favorite',        isDefault: true },
      { name: 'Học tập',   color: '#8B5CF6', icon: 'school',          isDefault: true },
    ];

    await Category.insertMany(defaults.map((cat) => ({ ...cat, userId })));
    console.log(`📂 Đã tạo ${defaults.length} danh mục mặc định cho user mới`);
  } catch (error) {
    // Không dừng đăng ký nếu lỗi tạo danh mục
    console.warn('⚠️  Không thể tạo danh mục mặc định:', error.message);
  }
};

module.exports = connectDB;
module.exports.createDefaultCategories = createDefaultCategories;
