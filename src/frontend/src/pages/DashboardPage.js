/**
 * =============================================
 * TRANG BẢNG ĐIỀU KHIỂN (DASHBOARD PAGE)
 * =============================================
 * 
 * NGUYÊN LÝ:
 * - Trang chính sau khi đăng nhập
 * - Bao gồm: Sidebar (bên trái) + TaskList (bên phải)
 * - Sidebar chứa bộ lọc và thống kê
 * - TaskList hiển thị danh sách công việc
 * - Dữ liệu thống kê được tải từ API và chia sẻ giữa Sidebar ↔ TaskList
 */

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import TaskList from '../components/Task/TaskList';
import TimetableBoard from '../components/Task/TimetableBoard';
import DeadlineAlerts from '../components/Task/DeadlineAlerts';
import taskService from '../services/taskService';

const DashboardPage = () => {
  // ===== STATE =====
  const [activeFilter, setActiveFilter] = useState('all');    // Bộ lọc trạng thái đang chọn
  const [categoryFilter, setCategoryFilter] = useState(null); // Bộ lọc danh mục đang chọn
  const [stats, setStats] = useState(null);                   // Dữ liệu thống kê

  // ===== TẢI THỐNG KÊ KHI TRANG MỞ =====
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await taskService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Lỗi tải thống kê:', error);
    }
  };

  return (
    <div className="app-layout">
      {/* Thanh điều hướng trên cùng */}
      <Navbar />

      <div className="main-container">
        {/* Sidebar bên trái */}
        <Sidebar
          activeFilter={activeFilter}
          onFilterChange={(filter) => {
            setActiveFilter(filter);
            if (filter !== 'all') setCategoryFilter(null);
          }}
          stats={stats}
          onCategoryFilter={(catId) => {
            setCategoryFilter(catId);
            setActiveFilter('all');
          }}
        />

        {/* Nội dung chính bên phải */}
        <main className="main-content">
          <DeadlineAlerts />
          <TimetableBoard />
          <TaskList
            filter={activeFilter}
            categoryFilter={categoryFilter}
            onStatsChange={setStats}
          />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
