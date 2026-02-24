/**
 * =============================================
 * COMPONENT DANH SÁCH CÔNG VIỆC (TASK LIST)
 * =============================================
 * 
 * NGUYÊN LÝ:
 * - Hiển thị danh sách các TaskCard
 * - Tích hợp thanh tìm kiếm và sắp xếp
 * - Xử lý phân trang
 * - Quản lý tạo/sửa/xóa task thông qua TaskForm
 * 
 * LUỒNG DỮ LIỆU:
 * Dashboard → TaskList → TaskCard (hiển thị)
 *                      → TaskForm (tạo/sửa)
 */

import React, { useState, useEffect, useCallback } from 'react';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import taskService from '../../services/taskService';

const TaskList = ({ filter, categoryFilter, onStatsChange }) => {
  // ===== STATE =====
  const [tasks, setTasks] = useState([]);           // Danh sách task
  const [loading, setLoading] = useState(true);     // Đang tải
  const [showForm, setShowForm] = useState(false);   // Hiện form tạo/sửa
  const [editingTask, setEditingTask] = useState(null); // Task đang sửa
  const [search, setSearch] = useState('');           // Từ khóa tìm kiếm
  const [sortBy, setSortBy] = useState('createdAt'); // Sắp xếp theo
  const [order, setOrder] = useState('desc');         // Thứ tự sắp xếp
  const [pagination, setPagination] = useState({});   // Thông tin phân trang

  // ===== TẢI DANH SÁCH TASK =====
  /**
   * useCallback giúp tránh tạo lại hàm mỗi lần render
   * useEffect gọi loadTasks khi filter/search/sort thay đổi
   */
  const loadTasks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      // Xây dựng tham số truy vấn
      const params = {
        page,
        limit: 12,
        sortBy,
        order,
      };

      // Thêm bộ lọc trạng thái (nếu không phải "all")
      if (filter && filter !== 'all') {
        params.status = filter;
      }

      // Thêm bộ lọc danh mục (nếu có)
      if (categoryFilter) {
        params.category = categoryFilter;
      }

      // Thêm từ khóa tìm kiếm (nếu có)
      if (search.trim()) {
        params.search = search.trim();
      }

      // Gọi API
      const response = await taskService.getTasks(params);
      setTasks(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Lỗi tải danh sách task:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, categoryFilter, search, sortBy, order]);

  // Tải lại khi filter/sort thay đổi
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Tải lại thống kê
  const refreshStats = async () => {
    try {
      const response = await taskService.getStats();
      onStatsChange(response.data);
    } catch (error) {
      console.error('Lỗi tải thống kê:', error);
    }
  };

  // ===== TẠO TASK MỚI =====
  const handleCreate = async (taskData) => {
    await taskService.createTask(taskData);
    setShowForm(false);
    loadTasks();     // Tải lại danh sách
    refreshStats();  // Cập nhật thống kê
  };

  // ===== CẬP NHẬT TASK =====
  const handleUpdate = async (taskData) => {
    await taskService.updateTask(editingTask._id, taskData);
    setShowForm(false);
    setEditingTask(null);
    loadTasks();
    refreshStats();
  };

  // ===== XÓA TASK =====
  const handleDelete = async (taskId) => {
    if (!window.confirm('Bạn có chắc muốn xóa công việc này?')) return;

    try {
      await taskService.deleteTask(taskId);
      loadTasks();
      refreshStats();
    } catch (error) {
      alert('Lỗi khi xóa công việc');
    }
  };

  // ===== ĐỔI TRẠNG THÁI NHANH =====
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      loadTasks();
      refreshStats();
    } catch (error) {
      alert('Lỗi khi đổi trạng thái');
    }
  };

  // ===== MỞ FORM CHỈNH SỬA =====
  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  return (
    <div className="task-list-container">
      {/* ===== THANH CÔNG CỤ ===== */}
      <div className="task-toolbar">
        {/* Nút tạo mới */}
        <button
          className="btn btn-primary"
          onClick={() => { setEditingTask(null); setShowForm(true); }}
        >
          ➕ Tạo công việc mới
        </button>

        {/* Ô tìm kiếm */}
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm công việc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Sắp xếp */}
        <div className="sort-controls">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">Ngày tạo</option>
            <option value="dueDate">Deadline</option>
            <option value="priority">Ưu tiên</option>
            <option value="title">Tiêu đề</option>
          </select>
          <button
            className="btn btn-small btn-secondary"
            onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
            title={order === 'asc' ? 'Tăng dần' : 'Giảm dần'}
          >
            {order === 'asc' ? '⬆️' : '⬇️'}
          </button>
        </div>
      </div>

      {/* ===== DANH SÁCH TASK ===== */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải công việc...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Chưa có công việc nào</h3>
          <p>Bấm "Tạo công việc mới" để bắt đầu!</p>
        </div>
      ) : (
        <>
          <div className="task-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>

          {/* ===== PHÂN TRANG ===== */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-small"
                disabled={pagination.currentPage <= 1}
                onClick={() => loadTasks(pagination.currentPage - 1)}
              >
                ◀ Trước
              </button>
              <span className="pagination-info">
                Trang {pagination.currentPage} / {pagination.totalPages} 
                ({pagination.totalTasks} công việc)
              </span>
              <button
                className="btn btn-small"
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => loadTasks(pagination.currentPage + 1)}
              >
                Sau ▶
              </button>
            </div>
          )}
        </>
      )}

      {/* ===== FORM TẠO/SỬA (MODAL) ===== */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
};

export default TaskList;
