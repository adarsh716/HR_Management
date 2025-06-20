"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import "./calendar.css"

export default function Calendar({ onDateSelect, selectedDate }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [internalSelectedDate, setInternalSelectedDate] = useState(selectedDate || null)

  useEffect(() => {
    setInternalSelectedDate(selectedDate || null)
  }, [selectedDate])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate)
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    clickedDate.setHours(0, 0, 0, 0)

    // Don't allow selection of past dates
    if (clickedDate >= today) {
      setInternalSelectedDate(clickedDate)
      if (onDateSelect) {
        onDateSelect(clickedDate)
      }
    }
  }

  const isDateDisabled = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    date.setHours(0, 0, 0, 0)
    return date < today
  }

  const isDateSelected = (day) => {
    if (!internalSelectedDate) return false
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return date.toDateString() === internalSelectedDate.toDateString()
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day-empty"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isDisabled = isDateDisabled(day)
      const isSelected = isDateSelected(day)

      let className = "calendar-day"
      if (isDisabled) className += " calendar-day-disabled"
      if (isSelected) className += " calendar-day-selected"

      days.push(
        <div key={day} className={className} onClick={() => handleDateClick(day)}>
          {day}
        </div>
      )
    }

    return days
  }

  return (
    <div className="calendar-wrapper-simple">
      <div className="calendar-header-simple">
        <button className="calendar-nav-button" onClick={() => navigateMonth("prev")} aria-label="Previous month">
          <ChevronLeft className="calendar-nav-icon" />
        </button>

        <h2 className="calendar-title">
          {monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}
        </h2>

        <button className="calendar-nav-button" onClick={() => navigateMonth("next")} aria-label="Next month">
          <ChevronRight className="calendar-nav-icon" />
        </button>

        <div className="calendar-icon">
          <CalendarIcon className="calendar-icon-svg" />
        </div>
      </div>

      <div className="calendar-weekdays-simple">
        {dayNames.map((day) => (
          <div key={day} className="calendar-weekday-simple">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid-simple">{renderCalendarDays()}</div>
    </div>
  )
}