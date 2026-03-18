import React, { useEffect, useMemo, useState } from 'react';
import taskService from '../../services/taskService';

const DAY_NAMES = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const START_HOUR = 6;
const END_HOUR = 22;

const TimetableBoard = () => {
  const [weekStart, setWeekStart] = useState(null);
  const [weekTasks, setWeekTasks] = useState([]);

  const getMonday = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diffToMonday);
    return d;
  };

  const loadWeek = async (baseDate) => {
    try {
      const monday = getMonday(baseDate);
      const response = await taskService.getWeeklySchedule(monday.toISOString());
      setWeekStart(new Date(response.data.weekStart));
      setWeekTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Lỗi tải thời khóa biểu:', error);
    }
  };

  useEffect(() => {
    loadWeek(new Date());
  }, []);

  const weekDates = useMemo(() => {
    if (!weekStart) return [];
    return Array.from({ length: 7 }, (_, index) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + index);
      return d;
    });
  }, [weekStart]);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = START_HOUR; hour < END_HOUR; hour += 1) {
      slots.push(hour);
    }
    return slots;
  }, []);

  const findTasksAtCell = (date, hour) => {
    const cellStart = new Date(date);
    cellStart.setHours(hour, 0, 0, 0);
    const cellEnd = new Date(date);
    cellEnd.setHours(hour + 1, 0, 0, 0);

    return weekTasks.filter((task) => {
      if (!task.scheduleStart || !task.scheduleEnd) return false;
      const taskStart = new Date(task.scheduleStart);
      const taskEnd = new Date(task.scheduleEnd);
      return taskStart < cellEnd && taskEnd > cellStart;
    });
  };

  const shiftWeek = (offset) => {
    if (!weekStart) return;
    const next = new Date(weekStart);
    next.setDate(next.getDate() + offset * 7);
    loadWeek(next);
  };

  if (!weekStart) {
    return null;
  }

  return (
    <section className="timetable-board">
      <div className="timetable-header">
        <h3>📚 Thời khóa biểu theo công việc</h3>
        <div className="timetable-actions">
          <button className="btn btn-small btn-secondary" onClick={() => shiftWeek(-1)}>
            ◀ Tuần trước
          </button>
          <span>
            {weekDates[0]?.toLocaleDateString('vi-VN')} - {weekDates[6]?.toLocaleDateString('vi-VN')}
          </span>
          <button className="btn btn-small btn-secondary" onClick={() => shiftWeek(1)}>
            Tuần sau ▶
          </button>
        </div>
      </div>

      <div className="timetable-scroll">
        <table className="timetable-grid">
          <thead>
            <tr>
              <th>Giờ</th>
              {weekDates.map((date, index) => (
                <th key={index}>
                  {DAY_NAMES[index]}
                  <div>{date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((hour) => (
              <tr key={hour}>
                <td className="time-slot-label">{`${String(hour).padStart(2, '0')}:00`}</td>
                {weekDates.map((date, index) => {
                  const cellTasks = findTasksAtCell(date, hour);
                  return (
                    <td key={`${index}-${hour}`}>
                      {cellTasks.map((task) => (
                        <div key={task._id} className="timetable-task-chip">
                          <strong>{task.title}</strong>
                          <small>
                            {new Date(task.scheduleStart).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {' - '}
                            {new Date(task.scheduleEnd).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </small>
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TimetableBoard;
