import React, { useState } from 'react';
import './leave.css';

const LeaveCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 8)); // September 2024
  const [selectedDates, setSelectedDates] = useState(new Set([9])); // Day 9 selected by default
  const [approvedLeaves] = useState([
    {
      id: 1,
      name: 'Cody Fisher',
      role: 'Senior Backend Develop...',
      date: '8/09/24',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    }
  ]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    const newSelectedDates = new Set(selectedDates);
    if (newSelectedDates.has(day)) {
      newSelectedDates.delete(day);
    } else {
      newSelectedDates.add(day);
    }
    setSelectedDates(newSelectedDates);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDates.has(day);
      days.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDateClick(day)}
        >
          {day}
          {isSelected && <span className="selected-indicator">1</span>}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="leave-calendar">
      <div className="calendar-header">
        <h2>Leave Calendar</h2>
      </div>
      
      <div className="calendar-navigation">
        <button className="nav-button" onClick={handlePrevMonth}>
          ‹
        </button>
        <span className="current-month">
          {monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}
        </span>
        <button className="nav-button" onClick={handleNextMonth}>
          ›
        </button>
      </div>

      <div className="calendar-grid">
        <div className="weekdays">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="weekday">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-days">
          {renderCalendarDays()}
        </div>
      </div>

      <div className="approved-leaves">
        <h3>Approved Leaves</h3>
        {approvedLeaves.map((leave) => (
          <div key={leave.id} className="leave-item">
            <img src={leave.avatar} alt={leave.name} className="avatar" />
            <div className="leave-info">
              <div className="leave-name">{leave.name}</div>
              <div className="leave-role">{leave.role}</div>
            </div>
            <div className="leave-date">{leave.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveCalendar;