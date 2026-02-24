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

import React, { useState, useEffect } from 'react';
import categoryService from '../../services/categoryService';

const Sidebar = ({ activeFilter, onFilterChange, stats, onCategoryFilter }) => {
  // State lưu danh sách danh mục
  const [categories, setCategories] = useState([]);
  // State quản lý form thêm danh mục
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#3498DB' });

  // Tải danh mục khi component mount
  useEffect(() => {
    loadCategories();
  }, []);

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
            className={`category-item ${activeFilter === 'all' && !onCategoryFilter ? 'active' : ''}`}
            onClick={() => { onFilterChange('all'); onCategoryFilter(null); }}
          >
            <span className="category-dot" style={{ backgroundColor: '#888' }}></span>
            <span>Tất cả danh mục</span>
          </li>
          {categories.map((cat) => (
            <li
              key={cat._id}
              className="category-item"
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
