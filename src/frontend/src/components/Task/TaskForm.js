/**
 * =============================================
 * COMPONENT FORM TẠO/SỬA CÔNG VIỆC (TASK FORM)
 * =============================================
 * 
 * NGUYÊN LÝ:
 * - Form dùng chung cho cả TẠO MỚI và CHỈNH SỬA task
 * - Nếu có prop "task" → chế độ chỉnh sửa (điền sẵn dữ liệu)
 * - Nếu không có → chế độ tạo mới (form trống)
 * - Hỗ trợ thêm/xóa subtask (công việc con)
 * - Hỗ trợ thêm tags (thẻ phân loại)
 */

import React, { useState, useEffect } from 'react';
import categoryService from '../../services/categoryService';

const TaskForm = ({ task, onSubmit, onCancel }) => {
  // ===== KHỞI TẠO STATE =====
  // Nếu đang chỉnh sửa → dùng dữ liệu task hiện tại
  // Nếu tạo mới → dùng giá trị mặc định
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    category: '',
    dueDate: '',
    scheduleDate: '',
    scheduleStartTime: '',
    scheduleEndTime: '',
    tags: [],
    subtasks: [],
  });

  const [categories, setCategories] = useState([]);  // Danh sách danh mục
  const [newTag, setNewTag] = useState('');            // Tag mới đang nhập
  const [newSubtask, setNewSubtask] = useState('');    // Subtask mới đang nhập
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Tải dữ liệu ban đầu
  useEffect(() => {
    loadCategories();

    // Nếu đang chỉnh sửa → điền dữ liệu task vào form
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        category: task.category?._id || task.category || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '', // Format YYYY-MM-DD
        scheduleDate: task.scheduleStart ? task.scheduleStart.split('T')[0] : '',
        scheduleStartTime: task.scheduleStart
          ? new Date(task.scheduleStart).toTimeString().slice(0, 5)
          : '',
        scheduleEndTime: task.scheduleEnd
          ? new Date(task.scheduleEnd).toTimeString().slice(0, 5)
          : '',
        tags: task.tags || [],
        subtasks: task.subtasks || [],
      });
    }
  }, [task]);

  // Tải danh sách danh mục
  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Lỗi tải danh mục:', error);
    }
  };

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setFormError('');
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ===== QUẢN LÝ TAGS =====
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // ===== QUẢN LÝ SUBTASK =====
  const addSubtask = () => {
    if (newSubtask.trim()) {
      setFormData({
        ...formData,
        subtasks: [...formData.subtasks, { title: newSubtask.trim(), completed: false }],
      });
      setNewSubtask('');
    }
  };

  const removeSubtask = (index) => {
    const newSubtasks = [...formData.subtasks];
    newSubtasks.splice(index, 1);
    setFormData({ ...formData, subtasks: newSubtasks });
  };

  // ===== GỬI FORM =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');

    try {
      const hasAnyScheduleField =
        formData.scheduleDate || formData.scheduleStartTime || formData.scheduleEndTime;

      if (hasAnyScheduleField) {
        if (!formData.scheduleDate || !formData.scheduleStartTime || !formData.scheduleEndTime) {
          throw new Error('Vui lòng nhập đủ ngày, giờ bắt đầu và giờ kết thúc cho thời khóa biểu');
        }

        const startDateTime = new Date(`${formData.scheduleDate}T${formData.scheduleStartTime}:00`);
        const endDateTime = new Date(`${formData.scheduleDate}T${formData.scheduleEndTime}:00`);

        if (startDateTime >= endDateTime) {
          throw new Error('Giờ kết thúc phải lớn hơn giờ bắt đầu trong cùng ngày');
        }
      }

      const scheduleStart = hasAnyScheduleField
        ? new Date(`${formData.scheduleDate}T${formData.scheduleStartTime}:00`).toISOString()
        : null;
      const scheduleEnd = hasAnyScheduleField
        ? new Date(`${formData.scheduleDate}T${formData.scheduleEndTime}:00`).toISOString()
        : null;

      // Chuẩn bị dữ liệu gửi lên
      const submitData = {
        ...formData,
        category: formData.category || null,
        dueDate: formData.dueDate || null,
        scheduleStart,
        scheduleEnd,
      };

      delete submitData.scheduleDate;
      delete submitData.scheduleStartTime;
      delete submitData.scheduleEndTime;

      await onSubmit(submitData);
    } catch (error) {
      setFormError(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? '✏️ Chỉnh sửa Công việc' : '➕ Tạo Công việc Mới'}</h2>
          <button className="btn-close" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          {formError && <div className="alert alert-error">{formError}</div>}

          {/* Tiêu đề */}
          <div className="form-group">
            <label>📌 Tiêu đề <span className="required">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Nhập tiêu đề công việc..."
              required
              autoFocus
            />
          </div>

          {/* Mô tả */}
          <div className="form-group">
            <label>📝 Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả chi tiết công việc..."
              rows="3"
            />
          </div>

          {/* Hàng 2 cột: Trạng thái + Ưu tiên */}
          <div className="form-row">
            <div className="form-group">
              <label>📊 Trạng thái</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="todo">📝 Cần làm</option>
                <option value="in-progress">🔄 Đang làm</option>
                <option value="completed">✅ Hoàn thành</option>
                <option value="archived">📦 Lưu trữ</option>
              </select>
            </div>

            <div className="form-group">
              <label>🔥 Mức độ ưu tiên</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="urgent">Khẩn cấp</option>
              </select>
            </div>
          </div>

          {/* Hàng 2 cột: Danh mục + Deadline */}
          <div className="form-row">
            <div className="form-group">
              <label>📁 Danh mục</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="">-- Không chọn --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>📅 Hạn hoàn thành</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Hàng 3 cột: Thời khóa biểu */}
          <div className="form-row form-row-3">
            <div className="form-group">
              <label>🗓️ Ngày học/làm</label>
              <input
                type="date"
                name="scheduleDate"
                value={formData.scheduleDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>⏰ Bắt đầu</label>
              <input
                type="time"
                name="scheduleStartTime"
                value={formData.scheduleStartTime}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>⏱️ Kết thúc</label>
              <input
                type="time"
                name="scheduleEndTime"
                value={formData.scheduleEndTime}
                onChange={handleChange}
              />
            </div>
          </div>
          <p className="schedule-hint">Mẹo: Chọn giờ theo cùng một ngày, ví dụ 13:30 đến 15:00.</p>

          {/* Tags */}
          <div className="form-group">
            <label>🏷️ Thẻ (Tags)</label>
            <div className="tag-input-row">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Nhập tag và bấm Enter..."
              />
              <button type="button" className="btn btn-small btn-primary" onClick={addTag}>
                Thêm
              </button>
            </div>
            <div className="tags-list">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="tag-remove">✕</button>
                </span>
              ))}
            </div>
          </div>

          {/* Subtasks */}
          <div className="form-group">
            <label>☑️ Công việc con</label>
            <div className="tag-input-row">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                placeholder="Nhập công việc con..."
              />
              <button type="button" className="btn btn-small btn-primary" onClick={addSubtask}>
                Thêm
              </button>
            </div>
            <ul className="subtask-list">
              {formData.subtasks.map((subtask, index) => (
                <li key={index} className="subtask-item">
                  <span className={subtask.completed ? 'subtask-done' : ''}>
                    {subtask.completed ? '✅' : '⬜'} {subtask.title}
                  </span>
                  <button type="button" onClick={() => removeSubtask(index)} className="btn-remove">✕</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Nút submit */}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang xử lý...' : (task ? '💾 Lưu thay đổi' : '➕ Tạo công việc')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
