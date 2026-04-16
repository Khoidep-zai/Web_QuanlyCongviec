import React, { useEffect, useMemo, useRef, useState } from 'react';
import taskService from '../../services/taskService';
import { getVietnamHolidaysInRange, toDateKey } from '../../utils/vietnamHolidays';

const DAY_NAMES = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const MONTH_GRID_DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const START_HOUR = 0;
const END_HOUR = 24;

const VIEW_MODE_OPTIONS = [
  { key: 'day', label: 'Ngày' },
  { key: 'week', label: 'Tuần' },
  { key: '4day', label: '4 ngày' },
  { key: 'month', label: 'Tháng' },
  { key: 'year', label: 'Năm' },
];

const TIME_WINDOW_OPTIONS = [
  { key: 'full', label: '24 giờ', start: 0, end: 24 },
  { key: 'work', label: 'Giờ làm việc', start: 7, end: 19 },
  { key: 'evening', label: 'Buổi tối', start: 18, end: 24 },
];

const FILTER_DEFAULTS = {
  viewMode: 'week',
  timeWindow: 'full',
  showWeekends: true,
  showCompleted: true,
  showHolidays: true,
  onlyRunning: false,
};

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getDayLabel = (date) => {
  const day = date.getDay();
  return DAY_NAMES[day === 0 ? 6 : day - 1];
};

const isSameDate = (a, b) => (
  a.getFullYear() === b.getFullYear()
  && a.getMonth() === b.getMonth()
  && a.getDate() === b.getDate()
);

const getMonthRange = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const getYearRange = (date) => {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const TimetableBoard = ({ focusDate, onFocusDateChange }) => {
  const [weekStart, setWeekStart] = useState(null);
  const [weekTasks, setWeekTasks] = useState([]);
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [filters, setFilters] = useState(FILTER_DEFAULTS);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const filterMenuRef = useRef(null);

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
      const response = await taskService.getWeeklySchedule(
        formatLocalDate(monday),
        new Date().getTimezoneOffset()
      );
      const payload = response?.data || response;
      setWeekStart(monday);
      setWeekTasks(payload?.tasks || []);
    } catch (error) {
      console.error('Lỗi tải thời khóa biểu:', error);
    }
  };

  const loadScheduledTasks = async () => {
    try {
      const allTasks = [];
      let page = 1;
      let totalPages = 1;

      do {
        const response = await taskService.getTasks({
          hasSchedule: 'true',
          sortBy: 'scheduleStart',
          order: 'asc',
          page,
          limit: 100,
        });

        allTasks.push(...(response?.data || []));
        totalPages = response?.pagination?.totalPages || 1;
        page += 1;
      } while (page <= totalPages && page <= 10);

      setScheduledTasks(allTasks);
    } catch (error) {
      console.error('Lỗi tải dữ liệu lịch theo phạm vi:', error);
    }
  };

  useEffect(() => {
    const seedDate = focusDate ? new Date(focusDate) : new Date();
    loadWeek(seedDate);
  }, [focusDate]);

  useEffect(() => {
    loadScheduledTasks();
  }, []);

  useEffect(() => {
    const timerId = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!filterMenuRef.current?.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const weekDates = useMemo(() => {
    if (!weekStart) return [];
    return Array.from({ length: 7 }, (_, index) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + index);
      return d;
    });
  }, [weekStart]);

  const selectedDate = useMemo(() => normalizeDate(focusDate || new Date()), [focusDate]);

  const visibleDates = useMemo(() => {
    if (!weekDates.length) return [];

    if (filters.viewMode === 'month' || filters.viewMode === 'year') {
      return [];
    }

    const baseDates = filters.showWeekends
      ? [...weekDates]
      : weekDates.filter((date) => {
        const day = date.getDay();
        return day !== 0 && day !== 6;
      });

    const safeDates = baseDates.length ? baseDates : [...weekDates];
    const selectedKey = toDateKey(selectedDate);
    const selectedIndex = safeDates.findIndex((date) => toDateKey(date) === selectedKey);
    const startIndex = selectedIndex >= 0 ? selectedIndex : 0;

    if (filters.viewMode === 'day') {
      return safeDates.slice(startIndex, startIndex + 1);
    }

    if (filters.viewMode === '4day') {
      const maxStart = Math.max(0, safeDates.length - 4);
      const clampedStart = Math.min(startIndex, maxStart);
      return safeDates.slice(clampedStart, clampedStart + 4);
    }

    return safeDates;
  }, [weekDates, filters.showWeekends, filters.viewMode, selectedDate]);

  const activeRange = useMemo(() => {
    if (filters.viewMode === 'month') {
      return getMonthRange(selectedDate);
    }

    if (filters.viewMode === 'year') {
      return getYearRange(selectedDate);
    }

    if (visibleDates.length) {
      const start = new Date(visibleDates[0]);
      const end = new Date(visibleDates[visibleDates.length - 1]);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (weekDates.length) {
      const start = new Date(weekDates[0]);
      const end = new Date(weekDates[weekDates.length - 1]);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    return getMonthRange(selectedDate);
  }, [filters.viewMode, selectedDate, visibleDates, weekDates]);

  const activeTaskPool = useMemo(() => {
    const sourceTasks = (filters.viewMode === 'month' || filters.viewMode === 'year')
      ? scheduledTasks
      : weekTasks;

    return sourceTasks.filter((task) => {
      if (!task.scheduleStart || !task.scheduleEnd) return false;
      const start = new Date(task.scheduleStart);
      const end = new Date(task.scheduleEnd);
      return start <= activeRange.end && end >= activeRange.start;
    });
  }, [filters.viewMode, scheduledTasks, weekTasks, activeRange]);

  const holidayEntries = useMemo(() => {
    if (!filters.showHolidays) return [];

    return getVietnamHolidaysInRange(activeRange.start, activeRange.end).map((holiday) => {
      const start = new Date(holiday.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(holiday.date);
      end.setHours(23, 59, 59, 999);

      return {
        _id: `holiday-${holiday.key}`,
        title: holiday.name,
        status: 'holiday',
        scheduleStart: start.toISOString(),
        scheduleEnd: end.toISOString(),
        isHoliday: true,
        category: {
          name: 'Ngày lễ Việt Nam',
          color: '#188038',
        },
      };
    });
  }, [activeRange, filters.showHolidays]);

  const calendarEntries = useMemo(() => {
    const taskEntries = activeTaskPool.filter((task) => {
      if (!filters.showCompleted && task.status === 'completed') return false;

      if (filters.onlyRunning) {
        if (!task.scheduleStart || !task.scheduleEnd) return false;
        const start = new Date(task.scheduleStart);
        const end = new Date(task.scheduleEnd);
        return start <= now && end > now;
      }

      return true;
    });

    if (filters.onlyRunning) {
      return [...taskEntries, ...holidayEntries.filter((entry) => {
        const start = new Date(entry.scheduleStart);
        const end = new Date(entry.scheduleEnd);
        return start <= now && end > now;
      })];
    }

    return [...taskEntries, ...holidayEntries];
  }, [activeTaskPool, holidayEntries, filters.showCompleted, filters.onlyRunning, now]);

  const timeSlots = useMemo(() => {
    const pickedWindow = TIME_WINDOW_OPTIONS.find((option) => option.key === filters.timeWindow)
      || TIME_WINDOW_OPTIONS[0];

    const slots = [];
    const startHour = Math.max(START_HOUR, pickedWindow.start);
    const endHour = Math.min(END_HOUR, pickedWindow.end);

    for (let hour = startHour; hour < endHour; hour += 1) {
      slots.push(hour);
    }

    return slots;
  }, [filters.timeWindow]);

  const findEntriesAtCell = (date, hour) => {
    const cellStart = new Date(date);
    cellStart.setHours(hour, 0, 0, 0);

    const cellEnd = new Date(date);
    cellEnd.setHours(hour + 1, 0, 0, 0);

    return calendarEntries.filter((entry) => {
      if (!entry.scheduleStart || !entry.scheduleEnd) return false;
      const entryStart = new Date(entry.scheduleStart);
      return entryStart >= cellStart && entryStart < cellEnd;
    });
  };

  const conflictCount = useMemo(() => {
    const rangedTasks = activeTaskPool.filter((task) => !task.isHoliday);
    let overlaps = 0;

    for (let i = 0; i < rangedTasks.length; i += 1) {
      const a = rangedTasks[i];
      const aStart = new Date(a.scheduleStart);
      const aEnd = new Date(a.scheduleEnd);

      for (let j = i + 1; j < rangedTasks.length; j += 1) {
        const b = rangedTasks[j];
        const bStart = new Date(b.scheduleStart);
        const bEnd = new Date(b.scheduleEnd);

        if (toDateKey(aStart) !== toDateKey(bStart)) continue;
        if (aStart < bEnd && bStart < aEnd) {
          overlaps += 1;
        }
      }
    }

    return overlaps;
  }, [activeTaskPool]);

  const movePeriod = (offset) => {
    const next = normalizeDate(focusDate || weekStart || new Date());

    if (filters.viewMode === 'month') {
      next.setMonth(next.getMonth() + offset);
    } else if (filters.viewMode === 'year') {
      next.setFullYear(next.getFullYear() + offset);
    } else {
      const unit = filters.viewMode === 'day' ? 1 : (filters.viewMode === '4day' ? 4 : 7);
      next.setDate(next.getDate() + offset * unit);
    }

    if (onFocusDateChange) {
      onFocusDateChange(next);
      return;
    }

    loadWeek(next);
  };

  const jumpToToday = () => {
    const today = normalizeDate(new Date());
    if (onFocusDateChange) {
      onFocusDateChange(today);
      return;
    }
    loadWeek(today);
  };

  const updateFilter = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const entriesByDate = useMemo(() => {
    const map = new Map();
    calendarEntries.forEach((entry) => {
      const key = toDateKey(new Date(entry.scheduleStart));
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(entry);
    });

    map.forEach((entries) => {
      entries.sort((a, b) => new Date(a.scheduleStart) - new Date(b.scheduleStart));
    });

    return map;
  }, [calendarEntries]);

  const monthGridDays = useMemo(() => {
    if (filters.viewMode !== 'month') return [];

    const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - firstDay.getDay());
    gridStart.setHours(0, 0, 0, 0);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [filters.viewMode, selectedDate]);

  const yearMonths = useMemo(() => {
    if (filters.viewMode !== 'year') return [];

    const year = selectedDate.getFullYear();

    return Array.from({ length: 12 }, (_, month) => {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const entries = calendarEntries.filter((entry) => {
        const start = new Date(entry.scheduleStart);
        return start >= monthStart && start <= monthEnd;
      });

      const holidayCount = entries.filter((entry) => entry.isHoliday).length;
      const taskCount = entries.length - holidayCount;

      return {
        month,
        monthLabel: monthStart.toLocaleDateString('vi-VN', { month: 'long' }),
        date: monthStart,
        total: entries.length,
        taskCount,
        holidayCount,
      };
    });
  }, [filters.viewMode, selectedDate, calendarEntries]);

  const visibleStart = visibleDates[0] || weekDates[0];
  const visibleEnd = visibleDates[visibleDates.length - 1] || weekDates[6];
  const liveHourDeg = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5;
  const liveMinuteDeg = now.getMinutes() * 6 + now.getSeconds() * 0.1;
  const liveSecondDeg = now.getSeconds() * 6;
  const rangeLabel = useMemo(() => {
    if (filters.viewMode === 'month') {
      return selectedDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
    }

    if (filters.viewMode === 'year') {
      return `Năm ${selectedDate.getFullYear()}`;
    }

    if (filters.viewMode === 'day') {
      return selectedDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }

    if (visibleStart && visibleEnd) {
      return `${visibleStart.toLocaleDateString('vi-VN')} - ${visibleEnd.toLocaleDateString('vi-VN')}`;
    }

    return selectedDate.toLocaleDateString('vi-VN');
  }, [filters.viewMode, selectedDate, visibleStart, visibleEnd]);

  const handleMonthCellClick = (date) => {
    onFocusDateChange?.(new Date(date));
  };

  const handleYearMonthClick = (monthDate) => {
    onFocusDateChange?.(new Date(monthDate));
    updateFilter({ viewMode: 'month' });
  };

  return (
    <section className="timetable-board">
      <div className="calendar-live-panel">
        <div className="calendar-live-clock" aria-label="Đồng hồ realtime">
          <div className="clock-face">
            <span className="clock-mark mark-top"></span>
            <span className="clock-mark mark-right"></span>
            <span className="clock-mark mark-bottom"></span>
            <span className="clock-mark mark-left"></span>
            <span className="clock-hand hand-hour" style={{ transform: `rotate(${liveHourDeg}deg)` }}></span>
            <span className="clock-hand hand-minute" style={{ transform: `rotate(${liveMinuteDeg}deg)` }}></span>
            <span className="clock-hand hand-second" style={{ transform: `rotate(${liveSecondDeg}deg)` }}></span>
            <span className="clock-center-dot"></span>
          </div>
        </div>

        <div className="calendar-live-meta">
          <strong>
            {now.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            })}
          </strong>
          <span>
            {now.toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="calendar-live-badges">
          <span className="calendar-live-badge">Trùng giờ: {conflictCount}</span>
          <span className="calendar-live-badge">Mục hiển thị: {calendarEntries.length}</span>
        </div>
      </div>

      <div className="timetable-header timetable-header-calendar">
        <div>
          <h3>📅 Lịch tuần công việc</h3>
          <p className="timetable-subtitle">
            Bộ lọc cho phép kiểm tra nhanh theo khung giờ, chế độ xem và trạng thái lịch.
          </p>
        </div>
        <div className="timetable-actions">
          <button className="btn btn-small btn-secondary" onClick={jumpToToday}>
            Hôm nay
          </button>
          <button className="btn btn-small btn-secondary" onClick={() => movePeriod(-1)}>
            ◀
          </button>
          <span className="timetable-week-range">
            {rangeLabel}
          </span>
          <button className="btn btn-small btn-secondary" onClick={() => movePeriod(1)}>
            ▶
          </button>

          <div className="calendar-filter-wrapper" ref={filterMenuRef}>
            <button
              type="button"
              className="btn btn-small btn-secondary"
              onClick={() => setShowFilterMenu((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={showFilterMenu}
            >
              Bộ lọc ▾
            </button>

            {showFilterMenu && (
              <div className="calendar-filter-menu" role="menu" aria-label="Bộ lọc lịch">
                <p className="calendar-filter-title">Chế độ xem</p>
                <div className="calendar-filter-chips">
                  {VIEW_MODE_OPTIONS.map((mode) => (
                    <button
                      key={mode.key}
                      type="button"
                      className={`calendar-filter-chip ${filters.viewMode === mode.key ? 'active' : ''}`}
                      onClick={() => updateFilter({ viewMode: mode.key })}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                <p className="calendar-filter-title">Khung giờ kiểm tra</p>
                <div className="calendar-filter-chips">
                  {TIME_WINDOW_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      className={`calendar-filter-chip ${filters.timeWindow === option.key ? 'active' : ''}`}
                      onClick={() => updateFilter({ timeWindow: option.key })}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <label className="calendar-filter-check">
                  <input
                    type="checkbox"
                    checked={filters.showWeekends}
                    onChange={(e) => updateFilter({ showWeekends: e.target.checked })}
                  />
                  <span>Hiển thị cuối tuần</span>
                </label>

                <label className="calendar-filter-check">
                  <input
                    type="checkbox"
                    checked={filters.showCompleted}
                    onChange={(e) => updateFilter({ showCompleted: e.target.checked })}
                  />
                  <span>Hiển thị việc đã hoàn thành</span>
                </label>

                <label className="calendar-filter-check">
                  <input
                    type="checkbox"
                    checked={filters.showHolidays}
                    onChange={(e) => updateFilter({ showHolidays: e.target.checked })}
                  />
                  <span>Hiển thị ngày lễ Việt Nam</span>
                </label>

                <label className="calendar-filter-check">
                  <input
                    type="checkbox"
                    checked={filters.onlyRunning}
                    onChange={(e) => updateFilter({ onlyRunning: e.target.checked })}
                  />
                  <span>Chỉ mục đang diễn ra</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {filters.viewMode === 'month' && (
        <section className="month-view-wrap">
          <div className="month-view-weekdays">
            {MONTH_GRID_DAY_NAMES.map((dayName) => (
              <span key={dayName}>{dayName}</span>
            ))}
          </div>

          <div className="month-view-grid">
            {monthGridDays.map((date) => {
              const dateKey = toDateKey(date);
              const entries = entriesByDate.get(dateKey) || [];
              const isOutsideMonth = date.getMonth() !== selectedDate.getMonth();

              return (
                <button
                  type="button"
                  key={dateKey}
                  className={[
                    'month-day-cell',
                    isOutsideMonth ? 'is-outside' : '',
                    isSameDate(date, selectedDate) ? 'is-selected' : '',
                    isSameDate(date, now) ? 'is-today' : '',
                  ].join(' ').trim()}
                  onClick={() => handleMonthCellClick(date)}
                >
                  <div className="month-day-head">
                    <span className="month-day-number">{date.getDate()}</span>
                    {entries.length > 0 && <span className="month-day-count">{entries.length}</span>}
                  </div>

                  <div className="month-day-events">
                    {entries.slice(0, 2).map((entry) => (
                      <span
                        key={`${entry._id}-${dateKey}`}
                        className={`month-event-pill ${entry.isHoliday ? 'holiday' : ''}`}
                        title={entry.title}
                      >
                        {entry.isHoliday ? `🎉 ${entry.title}` : entry.title}
                      </span>
                    ))}
                    {entries.length > 2 && <span className="month-day-more">+{entries.length - 2} thêm</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {filters.viewMode === 'year' && (
        <section className="year-view-wrap">
          <div className="year-view-grid">
            {yearMonths.map((monthCard) => (
              <button
                type="button"
                key={monthCard.month}
                className={`year-month-card ${monthCard.total > 0 ? 'has-data' : ''}`}
                onClick={() => handleYearMonthClick(monthCard.date)}
              >
                <h4>{monthCard.monthLabel}</h4>
                <p>{monthCard.total} mục lịch</p>
                <div className="year-month-meta">
                  <span>Công việc: {monthCard.taskCount}</span>
                  <span>Ngày lễ: {monthCard.holidayCount}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {(filters.viewMode === 'day' || filters.viewMode === '4day' || filters.viewMode === 'week') && (
        <div className="timetable-scroll">
          <table className="timetable-grid">
            <thead>
              <tr>
                <th className="time-header-cell">Giờ</th>
                {visibleDates.map((date) => (
                  <th
                    key={toDateKey(date)}
                    className={`day-header-cell ${isSameDate(date, new Date()) ? 'is-today' : ''}`}
                  >
                    <span>{getDayLabel(date)}</span>
                    <div>{date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((hour) => (
                <tr key={hour} className={hour === now.getHours() ? 'time-row-current' : ''}>
                  <td className="time-slot-label">{`${String(hour).padStart(2, '0')}:00`}</td>
                  {visibleDates.map((date) => {
                    const cellEntries = findEntriesAtCell(date, hour);
                    const isCurrentSlot = isSameDate(date, now) && hour === now.getHours();

                    return (
                      <td
                        key={`${toDateKey(date)}-${hour}`}
                        className={`timetable-cell ${isCurrentSlot ? 'is-current-slot' : ''}`}
                      >
                        {cellEntries.map((task) => (
                          <div
                            key={`${task._id}-${hour}`}
                            className={`timetable-task-chip ${task.isHoliday ? 'holiday-chip' : ''}`}
                            style={task.category?.color ? { borderLeftColor: task.category.color } : undefined}
                          >
                            <strong>{task.isHoliday ? `🎉 ${task.title}` : task.title}</strong>
                            <small>
                              {task.isHoliday ? (
                                'Cả ngày'
                              ) : (
                                <>
                                  {new Date(task.scheduleStart).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false,
                                  })}
                                  {' - '}
                                  {new Date(task.scheduleEnd).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false,
                                  })}
                                </>
                              )}
                            </small>
                            {task.category?.name && (
                              <small className="timetable-task-category">{task.category.name}</small>
                            )}
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
      )}
    </section>
  );
};

export default TimetableBoard;
