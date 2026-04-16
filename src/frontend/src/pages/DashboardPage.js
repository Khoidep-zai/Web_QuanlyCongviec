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
  const [focusDate, setFocusDate] = useState(() => new Date());
  const [quickCreateRequest, setQuickCreateRequest] = useState({
    mode: 'todo',
    nonce: 0,
  });

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

  const summaryCards = [
    {
      key: 'all',
      label: 'Tổng công việc',
      value: stats?.total || 0,
      icon: '📚',
      tone: 'yellow',
    },
    {
      key: 'doing',
      label: 'Đang làm',
      value: stats?.byStatus?.['in-progress'] || 0,
      icon: '🚀',
      tone: 'blue',
    },
    {
      key: 'done',
      label: 'Hoàn thành',
      value: stats?.byStatus?.completed || 0,
      icon: '✅',
      tone: 'green',
    },
    {
      key: 'overdue',
      label: 'Cần chú ý',
      value: stats?.overdue || 0,
      icon: '⏰',
      tone: 'orange',
    },
  ];

  const handleQuickCreate = (mode) => {
    setQuickCreateRequest({
      mode,
      nonce: Date.now(),
    });
  };

  return (
    <div className="app-layout">
      {/* Thanh điều hướng trên cùng */}
      <Navbar />

      <div className="main-container">
        {/* Sidebar bên trái */}
        <Sidebar
          activeFilter={activeFilter}
          categoryFilter={categoryFilter}
          onFilterChange={(filter) => {
            setActiveFilter(filter);
            if (filter !== 'all') setCategoryFilter(null);
          }}
          stats={stats}
          onCategoryFilter={(catId) => {
            setCategoryFilter(catId);
            setActiveFilter('all');
          }}
          onQuickCreate={handleQuickCreate}
          focusDate={focusDate}
          onFocusDateChange={setFocusDate}
        />

        {/* Nội dung chính bên phải */}
        <main className="main-content calendar-main-content">
          <section className="calendar-hero">
            <div className="calendar-hero-copy">
              <h2>Biến công việc thành chuỗi bước nhỏ để hoàn thành</h2>
              <p>
                Trải nghiệm lịch tuần trực quan theo phong cách Google Calendar, nhưng vẫn giữ tinh thần Duolingo vui tươi.
              </p>
            </div>
            <section className="calendar-hero-cards" aria-label="Tổng quan nhanh">
              {summaryCards.map((card) => (
                <article key={card.key} className={`calendar-hero-chip tone-${card.tone}`}>
                  <span className="stat-emoji" aria-hidden="true">{card.icon}</span>
                  <div>
                    <h3>{card.label}</h3>
                    <p>{card.value}</p>
                  </div>
                </article>
              ))}
            </section>
          </section>

          <TimetableBoard
            focusDate={focusDate}
            onFocusDateChange={setFocusDate}
          />

          <section className="calendar-bottom-grid">
            <DeadlineAlerts />
            <TaskList
              filter={activeFilter}
              categoryFilter={categoryFilter}
              onStatsChange={setStats}
              quickCreateRequest={quickCreateRequest}
            />
          </section>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
