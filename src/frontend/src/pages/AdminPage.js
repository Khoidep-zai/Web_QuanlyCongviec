import React, { useEffect, useState } from 'react';
import Navbar from '../components/Layout/Navbar';
import adminService from '../services/adminService';
import { useAuth } from '../context/AuthContext';

const AdminPage = () => {
  const { user: currentUser } = useAuth();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    userId: '',
    name: '',
    color: '#3498DB',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    try {
      setError('');
      setLoading(true);

      const [overviewRes, usersRes, tasksRes, categoriesRes] = await Promise.all([
        adminService.getOverview(),
        adminService.getUsers(),
        adminService.getTasks(),
        adminService.getCategories(),
      ]);

      setOverview(overviewRes.data);
      setUsers(usersRes.data || []);
      setTasks(tasksRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu quản trị');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleUser = async (userId, isActive) => {
    try {
      await adminService.updateUserStatus(userId, !isActive);
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, isActive: !isActive } : user
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật trạng thái user');
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm('Bạn chắc chắn muốn xóa công việc này?');
    if (!confirmed) return;

    try {
      await adminService.deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      setOverview((prev) =>
        prev
          ? {
              ...prev,
              totalTasks: Math.max(0, (prev.totalTasks || 0) - 1),
            }
          : prev
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa công việc');
    }
  };

  const handleResetPassword = async (userId, username) => {
    const newPassword = window.prompt(
      `Nhập mật khẩu mới cho ${username} (ít nhất 6 ký tự):`,
      '123456'
    );

    if (!newPassword) return;

    try {
      await adminService.resetUserPassword(userId, newPassword);
      window.alert(`Đã reset mật khẩu cho ${username}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể reset mật khẩu');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const created = await adminService.createCategory(newCategory);
      setCategories((prev) => [created.data, ...prev]);
      setNewCategory({ userId: '', name: '', color: '#3498DB', description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo danh mục');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const confirmed = window.confirm('Bạn chắc chắn muốn xóa danh mục này?');
    if (!confirmed) return;

    try {
      await adminService.deleteCategory(categoryId);
      setCategories((prev) => prev.filter((category) => category._id !== categoryId));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa danh mục');
    }
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <div className="empty-state">
            <div className="spinner"></div>
            <p>Đang tải bảng quản trị...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <section className="admin-header">
          <h2>Bảng điều khiển quản trị</h2>
          <button className="btn btn-secondary" onClick={loadAdminData}>
            Tải lại dữ liệu
          </button>
        </section>

        {error && <div className="alert alert-error">{error}</div>}

        <section className="admin-stats-grid">
          <article className="admin-stat-card">
            <h3>Tổng tài khoản</h3>
            <p>{overview?.totalUsers || 0}</p>
          </article>
          <article className="admin-stat-card">
            <h3>Tài khoản hoạt động</h3>
            <p>{overview?.activeUsers || 0}</p>
          </article>
          <article className="admin-stat-card">
            <h3>Admin</h3>
            <p>{overview?.adminUsers || 0}</p>
          </article>
          <article className="admin-stat-card">
            <h3>Tổng công việc</h3>
            <p>{overview?.totalTasks || 0}</p>
          </article>
          <article className="admin-stat-card">
            <h3>Tổng danh mục</h3>
            <p>{overview?.totalCategories || 0}</p>
          </article>
        </section>

        <section className="admin-table-wrapper">
          <h3>Quản lý người dùng</h3>
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên đăng nhập</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-chip role-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.isActive ? 'Đang hoạt động' : 'Đã khóa'}</td>
                    <td>
                      <button
                        className={`btn btn-small ${user.isActive ? 'btn-delete' : 'btn-primary'}`}
                        onClick={() => handleToggleUser(user._id, user.isActive)}
                        disabled={user._id === currentUser?._id}
                      >
                        {user.isActive ? 'Khóa' : 'Mở khóa'}
                      </button>
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => handleResetPassword(user._id, user.username)}
                      >
                        Reset mật khẩu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-table-wrapper">
          <h3>Task gần đây toàn hệ thống</h3>
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Người tạo</th>
                  <th>Trạng thái</th>
                  <th>Ưu tiên</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td>{task.title}</td>
                    <td>{task.userId?.fullName || task.userId?.username || 'N/A'}</td>
                    <td>{task.status}</td>
                    <td>{task.priority}</td>
                    <td>
                      <button
                        className="btn btn-small btn-delete"
                        onClick={() => handleDeleteTask(task._id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-table-wrapper">
          <h3>Quản lý danh mục toàn hệ thống</h3>

          <form className="admin-category-form" onSubmit={handleCreateCategory}>
            <select
              value={newCategory.userId}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, userId: e.target.value }))}
              required
            >
              <option value="">Chọn người dùng</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.username} ({u.email})
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Tên danh mục"
              value={newCategory.name}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <input
              type="color"
              value={newCategory.color}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, color: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Mô tả (không bắt buộc)"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory((prev) => ({ ...prev, description: e.target.value }))
              }
            />
            <button type="submit" className="btn btn-primary btn-small">
              Tạo danh mục
            </button>
          </form>

          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Người sở hữu</th>
                  <th>Màu</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td>{category.name}</td>
                    <td>{category.userId?.username || 'N/A'}</td>
                    <td>
                      <span className="category-color-preview" style={{ backgroundColor: category.color }}></span>
                      {category.color}
                    </td>
                    <td>{category.description || '-'}</td>
                    <td>
                      <button
                        className="btn btn-small btn-delete"
                        onClick={() => handleDeleteCategory(category._id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminPage;
