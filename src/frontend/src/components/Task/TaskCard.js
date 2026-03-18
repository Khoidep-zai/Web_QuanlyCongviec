/**
 * =============================================
 * COMPONENT THẺ CÔNG VIỆC (TASK CARD)
 * =============================================
 * 
 * NGUYÊN LÝ:
 * - Hiển thị thông tin tóm tắt của MỘT công việc
 * - Bao gồm: tiêu đề, trạng thái, ưu tiên, deadline, danh mục
 * - Nút hành động: xem chi tiết, đổi trạng thái, xóa
 * - Màu sắc thay đổi theo mức độ ưu tiên
 */

import React from 'react';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  // ===== ÁNH XẠ TRẠNG THÁI SANG TIẾNG VIỆT VÀ ICON =====
  const statusMap = {
    'todo': { label: 'Cần làm', icon: '📝', color: '#6B7280' },
    'in-progress': { label: 'Đang làm', icon: '🔄', color: '#3B82F6' },
    'completed': { label: 'Hoàn thành', icon: '✅', color: '#10B981' },
    'archived': { label: 'Lưu trữ', icon: '📦', color: '#8B5CF6' },
  };

  // ===== ÁNH XẠ MỨC ĐỘ ƯU TIÊN =====
  const priorityMap = {
    'low': { label: 'Thấp', color: '#6B7280' },
    'medium': { label: 'TB', color: '#F59E0B' },
    'high': { label: 'Cao', color: '#EF4444' },
    'urgent': { label: 'Khẩn', color: '#DC2626' },
  };

  const status = statusMap[task.status] || statusMap['todo'];
  const priority = priorityMap[task.priority] || priorityMap['medium'];

  // Kiểm tra task đã quá hạn chưa
  const isOverdue = task.dueDate && 
    new Date(task.dueDate) < new Date() && 
    task.status !== 'completed' && 
    task.status !== 'archived';

  // Format ngày tháng sang tiếng Việt
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Tính tiến độ subtask
  const subtaskProgress = task.subtasks?.length > 0
    ? `${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length}`
    : null;

  const formatSchedule = () => {
    if (!task.scheduleStart || !task.scheduleEnd) return '';
    const start = new Date(task.scheduleStart);
    const end = new Date(task.scheduleEnd);

    const date = start.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    });
    const startTime = start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    return `${date} • ${startTime} - ${endTime}`;
  };

  // Xác định trạng thái tiếp theo khi click nút chuyển trạng thái
  const getNextStatus = () => {
    const flow = { 'todo': 'in-progress', 'in-progress': 'completed', 'completed': 'todo', 'archived': 'todo' };
    return flow[task.status] || 'todo';
  };

  return (
    <div className={`task-card ${isOverdue ? 'task-overdue' : ''}`}>
      {/* Thanh màu bên trái theo mức ưu tiên */}
      <div className="task-card-accent" style={{ backgroundColor: priority.color }}></div>

      <div className="task-card-content">
        {/* HÀNG TRÊN: Trạng thái + Ưu tiên + Danh mục */}
        <div className="task-card-header">
          <span className="task-status-badge" style={{ backgroundColor: status.color }}>
            {status.icon} {status.label}
          </span>
          <span className="task-priority-badge" style={{ borderColor: priority.color, color: priority.color }}>
            {priority.label}
          </span>
          {task.category && (
            <span 
              className="task-category-badge"
              style={{ backgroundColor: task.category.color + '20', color: task.category.color }}
            >
              {task.category.name}
            </span>
          )}
        </div>

        {/* TIÊU ĐỀ */}
        <h3 className={`task-card-title ${task.status === 'completed' ? 'completed-title' : ''}`}>
          {task.title}
        </h3>

        {/* MÔ TẢ (tóm tắt) */}
        {task.description && (
          <p className="task-card-desc">{task.description.substring(0, 100)}{task.description.length > 100 ? '...' : ''}</p>
        )}

        {/* THÔNG TIN BỔ SUNG */}
        <div className="task-card-meta">
          {/* Deadline */}
          {task.dueDate && (
            <span className={`task-meta-item ${isOverdue ? 'overdue-text' : ''}`}>
              📅 {formatDate(task.dueDate)}
              {isOverdue && ' (Quá hạn!)'}
            </span>
          )}

          {task.scheduleStart && task.scheduleEnd && (
            <span className="task-meta-item">
              🗓️ {formatSchedule()}
            </span>
          )}

          {/* Tiến độ subtask */}
          {subtaskProgress && (
            <span className="task-meta-item">
              ☑️ {subtaskProgress}
            </span>
          )}

          {/* Tags */}
          {task.tags?.length > 0 && (
            <span className="task-meta-item">
              🏷️ {task.tags.slice(0, 2).join(', ')}
            </span>
          )}
        </div>

        {/* NÚT HÀNH ĐỘNG */}
        <div className="task-card-actions">
          <button
            className="btn btn-small btn-status"
            onClick={() => onStatusChange(task._id, getNextStatus())}
            title="Chuyển trạng thái"
          >
            {statusMap[getNextStatus()]?.icon} {statusMap[getNextStatus()]?.label}
          </button>
          <button
            className="btn btn-small btn-edit"
            onClick={() => onEdit(task)}
            title="Chỉnh sửa"
          >
            ✏️ Sửa
          </button>
          <button
            className="btn btn-small btn-delete"
            onClick={() => onDelete(task._id)}
            title="Xóa"
          >
            🗑️ Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
