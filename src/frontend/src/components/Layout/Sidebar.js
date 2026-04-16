/**
 * =============================================
 * COMPONENT THANH BÊN (SIDEBAR)
 * =============================================
 * 
 * NGUYÊN LÝ: Thanh điều hướng bên trái chứa:
 * - Các bộ lọc nhanh (tất cả, cần làm, đang làm, hoàn thành)
 * - Thống kê số lượng task
 * - Quản lý danh mục
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import categoryService from '../../services/categoryService';
import { getVietnamHolidayLookupInRange, toDateKey } from '../../utils/vietnamHolidays';

const MINI_DAY_LABELS = ['Cn', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isSameDate = (a, b) => (
  a.getFullYear() === b.getFullYear()
  && a.getMonth() === b.getMonth()
  && a.getDate() === b.getDate()
);

const Sidebar = ({
  activeFilter,
  categoryFilter,
  onFilterChange,
  stats,
  onCategoryFilter,
  onQuickCreate,
  focusDate,
  onFocusDateChange,
}) => {
  // State lưu danh sách danh mục
  const [categories, setCategories] = useState([]);
  // State quản lý form thêm danh mục
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#3498DB' });
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [miniCalendarMonth, setMiniCalendarMonth] = useState(() => {
    const seed = normalizeDate(focusDate || new Date());
    seed.setDate(1);
    return seed;
  });
  const createMenuRef = useRef(null);

  // Tải danh mục khi component mount
  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!createMenuRef.current?.contains(event.target)) {
        setShowCreateMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!focusDate) return;
    const next = normalizeDate(focusDate);
    next.setDate(1);
    setMiniCalendarMonth(next);
  }, [focusDate]);

  // Hàm tải danh sách danh mục từ API
  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Lỗi tải danh mục:', error);
    }
  };

  // Hàm thêm danh mục mới
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    try {
      await categoryService.createCategory(newCategory);
      setNewCategory({ name: '', color: '#3498DB' });
      setShowCategoryForm(false);
      loadCategories(); // Tải lại danh sách
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi tạo danh mục');
    }
  };

  // Hàm xóa danh mục
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    
    try {
      await categoryService.deleteCategory(categoryId);
      loadCategories();
      onFilterChange('all'); // Về trang tất cả
    } catch (error) {
      alert('Lỗi xóa danh mục');
    }
  };

  const triggerQuickCreate = (mode) => {
    setShowCreateMenu(false);
    onQuickCreate?.(mode);
  };

  const selectedDate = normalizeDate(focusDate || new Date());
  const todayDate = normalizeDate(new Date());

  const monthTitle = miniCalendarMonth.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });

  const miniCalendarDays = useMemo(() => {
    const year = miniCalendarMonth.getFullYear();
    const month = miniCalendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const gridStart = new Date(year, month, 1 - startOffset);
    gridStart.setHours(0, 0, 0, 0);

    const gridEnd = new Date(gridStart);
    gridEnd.setDate(gridStart.getDate() + 41);
    const holidayLookup = getVietnamHolidayLookupInRange(gridStart, gridEnd);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      date.setHours(0, 0, 0, 0);
      const key = toDateKey(date);

      return {
        date,
        key,
        isCurrentMonth: date.getMonth() === month,
        holidayName: holidayLookup.get(key) || '',
      };
    });
  }, [miniCalendarMonth]);

  const shiftMiniCalendarMonth = (offset) => {
    setMiniCalendarMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + offset);
      next.setDate(1);
      return next;
    });
  };

  const handleMiniCalendarPick = (date) => {
    onFocusDateChange?.(new Date(date));
  };

  // Danh sách bộ lọc theo trạng thái
  const filters = [
    { key: 'all', label: '📋 Tất cả', count: stats?.total || 0 },
    { key: 'todo', label: '📝 Cần làm', count: stats?.byStatus?.todo || 0 },
    { key: 'in-progress', label: '🔄 Đang làm', count: stats?.byStatus?.['in-progress'] || 0 },
    { key: 'completed', label: '✅ Hoàn thành', count: stats?.byStatus?.completed || 0 },
    { key: 'archived', label: '📦 Lưu trữ', count: stats?.byStatus?.archived || 0 },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-section sidebar-create-section" ref={createMenuRef}>
        <button
          className="create-task-btn"
          onClick={() => setShowCreateMenu((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={showCreateMenu}
        >
          <span aria-hidden="true">＋</span>
          <span>Tạo</span>
          <span className="create-task-caret" aria-hidden="true">▾</span>
        </button>

        {showCreateMenu && (
          <div className="create-task-dropdown" role="menu" aria-label="Tạo nhanh">
            <button
              type="button"
              className="create-task-item"
              role="menuitem"
              onClick={() => triggerQuickCreate('event')}
            >
              <span className="create-task-icon" aria-hidden="true">📅</span>
              <span>Sự kiện</span>
            </button>
            <button
              type="button"
              className="create-task-item"
              role="menuitem"
              onClick={() => triggerQuickCreate('todo')}
            >
              <span className="create-task-icon" aria-hidden="true">📝</span>
              <span>Việc cần làm</span>
            </button>
            <button
              type="button"
              className="create-task-item"
              role="menuitem"
              onClick={() => triggerQuickCreate('appointment')}
            >
              <span className="create-task-icon" aria-hidden="true">🤝</span>
              <span>Lên lịch hẹn</span>
            </button>
          </div>
        )}
      </div>

      <div className="sidebar-section mini-calendar-section">
        <div className="mini-calendar-header">
          <h3 className="sidebar-title mini-calendar-title">{monthTitle}</h3>
          <div className="mini-calendar-actions">
            <button
              type="button"
              className="mini-calendar-nav"
              onClick={() => shiftMiniCalendarMonth(-1)}
              aria-label="Tháng trước"
            >
              ◀
            </button>
            <button
              type="button"
              className="mini-calendar-nav"
              onClick={() => shiftMiniCalendarMonth(1)}
              aria-label="Tháng sau"
            >
              ▶
            </button>
          </div>
        </div>

        <div className="mini-calendar-grid mini-calendar-weekdays">
          {MINI_DAY_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="mini-calendar-grid mini-calendar-days">
          {miniCalendarDays.map((day) => (
            <button
              key={day.key}
              type="button"
              className={[
                'mini-calendar-day',
                day.isCurrentMonth ? '' : 'is-outside-month',
                isSameDate(day.date, selectedDate) ? 'is-selected' : '',
                isSameDate(day.date, todayDate) ? 'is-today' : '',
                day.holidayName ? 'is-holiday' : '',
              ].join(' ').trim()}
              onClick={() => handleMiniCalendarPick(day.date)}
              title={day.holidayName || day.date.toLocaleDateString('vi-VN')}
            >
              <span>{day.date.getDate()}</span>
              {day.holidayName && <em className="mini-calendar-holiday-dot" aria-hidden="true"></em>}
            </button>
          ))}
        </div>
      </div>

      {/* ===== BỘ LỌC TRẠNG THÁI ===== */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">Trạng thái</h3>
        <ul className="filter-list">
          {filters.map((filter) => (
            <li
              key={filter.key}
              className={`filter-item ${activeFilter === filter.key ? 'active' : ''}`}
              onClick={() => onFilterChange(filter.key)}
            >
              <span>{filter.label}</span>
              <span className="filter-count">{filter.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ===== THỐNG KÊ NHANH ===== */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">Thống kê</h3>
        <div className="stats-mini">
          <div className="stat-item overdue">
            <span>⚠️ Quá hạn</span>
            <span className="stat-count">{stats?.overdue || 0}</span>
          </div>
          <div className="stat-item today">
            <span>🎯 Hoàn thành hôm nay</span>
            <span className="stat-count">{stats?.completedToday || 0}</span>
          </div>
        </div>
      </div>

      {/* ===== DANH MỤC ===== */}
      <div className="sidebar-section">
        <div className="sidebar-title-row">
          <h3 className="sidebar-title">Danh mục</h3>
          <button
            className="btn-add-category"
            onClick={() => setShowCategoryForm(!showCategoryForm)}
            title="Thêm danh mục"
          >
            {showCategoryForm ? '✕' : '＋'}
          </button>
        </div>

        {/* Form thêm danh mục mới */}
        {showCategoryForm && (
          <form className="category-form" onSubmit={handleAddCategory}>
            <input
              type="text"
              placeholder="Tên danh mục..."
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="input-small"
            />
            <input
              type="color"
              value={newCategory.color}
              onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
              className="input-color"
            />
            <button type="submit" className="btn btn-small btn-primary">Thêm</button>
          </form>
        )}

        {/* Danh sách danh mục */}
        <ul className="category-list">
          <li
            className={`category-item ${activeFilter === 'all' && !categoryFilter ? 'active' : ''}`}
            onClick={() => { onFilterChange('all'); onCategoryFilter(null); }}
          >
            <span className="category-dot" style={{ backgroundColor: '#888' }}></span>
            <span>Tất cả danh mục</span>
          </li>
          {categories.map((cat) => (
            <li
              key={cat._id}
              className={`category-item ${categoryFilter === cat._id ? 'active' : ''}`}
              onClick={() => onCategoryFilter(cat._id)}
            >
              <span className="category-dot" style={{ backgroundColor: cat.color }}></span>
              <span className="category-name">{cat.name}</span>
              <button
                className="btn-delete-category"
                onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat._id); }}
                title="Xóa danh mục"
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
