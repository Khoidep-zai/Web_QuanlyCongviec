import React, { useEffect, useState } from 'react';
import taskService from '../../services/taskService';

const DeadlineAlerts = () => {
  const [alerts, setAlerts] = useState([]);

  const formatRemaining = (remainingMs) => {
    const absMs = Math.abs(remainingMs);
    const totalMinutes = Math.floor(absMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    const parts = [];
    if (days > 0) parts.push(`${days} ngày`);
    if (hours > 0) parts.push(`${hours} giờ`);
    if (days === 0 && minutes > 0) parts.push(`${minutes} phút`);

    if (parts.length === 0) {
      parts.push('dưới 1 phút');
    }

    return `${remainingMs < 0 ? 'Quá hạn' : 'Còn'} ${parts.join(' ')}`;
  };

  const loadAlerts = async () => {
    try {
      const response = await taskService.getDeadlineAlerts(5);
      setAlerts(response.data || []);
    } catch (error) {
      console.error('Lỗi tải cảnh báo deadline:', error);
    }
  };

  useEffect(() => {
    loadAlerts();
    const timer = setInterval(loadAlerts, 60000);
    return () => clearInterval(timer);
  }, []);

  if (!alerts.length) {
    return null;
  }

  return (
    <section className="deadline-alerts">
      <h3>⏳ Thông báo thời hạn công việc</h3>
      <div className="deadline-alert-list">
        {alerts.map((task) => (
          <article
            key={task._id}
            className={`deadline-alert-item ${task.isOverdue ? 'overdue' : 'upcoming'}`}
          >
            <div>
              <strong>{task.title}</strong>
              <p>{new Date(task.dueDate).toLocaleString('vi-VN')}</p>
            </div>
            <span>{formatRemaining(task.remainingMs)}</span>
          </article>
        ))}
      </div>
    </section>
  );
};

export default DeadlineAlerts;
