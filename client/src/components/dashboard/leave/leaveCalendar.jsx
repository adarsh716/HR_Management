"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../../context/AuthContext"
import { getLeaveStatistics } from "../../../api/auth"
import "./leave.css"

const LeaveCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [leaveStatistics, setLeaveStatistics] = useState({})
  const [approvedLeaves, setApprovedLeaves] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useContext(AuthContext)

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

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"]

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const fetchLeaveStatistics = async () => {
    try {
      setLoading(true)
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()

      const response = await getLeaveStatistics(month, year)

      if (response.success) {
        setLeaveStatistics(response.data.leavesByDate || {})
        setApprovedLeaves(response.data.approvedLeaves || [])
      } else {
        setLeaveStatistics({})
        setApprovedLeaves([])
      }
    } catch (error) {
      console.error("Failed to fetch leave statistics:", error)
      setLeaveStatistics({})
      setApprovedLeaves([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchLeaveStatistics()
    }
  }, [currentDate, user])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
    })
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const today = new Date()
    const isCurrentMonth =
      today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear()

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStats = leaveStatistics[day]
      const isToday = isCurrentMonth && today.getDate() === day
      const hasLeaves = dayStats && dayStats.total > 0

      days.push(
        <div key={day} className={`calendar-day ${isToday ? "today" : ""} ${hasLeaves ? "has-leaves" : ""}`}>
          <span className="day-number">{day}</span>
          {hasLeaves && (
            <div className="leave-indicators">
              {dayStats.approved > 0 && (
                <span className="leave-count approved" title={`${dayStats.approved} approved leave(s)`}>
                  {dayStats.approved}
                </span>
              )}
              {dayStats.pending > 0 && (
                <span className="leave-count pending" title={`${dayStats.pending} pending leave(s)`}>
                  {dayStats.pending}
                </span>
              )}
              {dayStats.rejected > 0 && (
                <span className="leave-count rejected" title={`${dayStats.rejected} rejected leave(s)`}>
                  {dayStats.rejected}
                </span>
              )}
              {/* <div className="total-count" title={`Total: ${dayStats.total} leave(s)`}>
                Total: {dayStats.total}
              </div> */}
            </div>
          )}
        </div>,
      )
    }

    return days
  }

  return (
    <div className="leave-calendar">
      <div className="calendar-header">
        <h2>Leave Calendar</h2>
      </div>

      <div className="calendar-navigation">
        <button className="nav-button" onClick={handlePrevMonth} disabled={loading}>
          ‹
        </button>
        <span className="current-month">
          {monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}
        </span>
        <button className="nav-button" onClick={handleNextMonth} disabled={loading}>
          ›
        </button>
      </div>

      {loading && <div className="loading-indicator">Loading...</div>}

      <div className="calendar-grid">
        <div className="weekdays">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="weekday">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-days">{renderCalendarDays()}</div>
      </div>

      <div className="approved-leaves">
        <h3>Approved Leaves ({approvedLeaves.length})</h3>
        {approvedLeaves.length > 0 ? (
          <div className="leaves-list">
            {approvedLeaves.map((leave) => (
              <div key={leave.id} className="leave-item">
                <img
                  src={leave.avatar || "/placeholder.svg"}
                  alt={leave.name}
                  className="avatar"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=40&width=40"
                  }}
                />
                <div className="leave-info">
                  <div className="leave-name">{leave.name}</div>
                  <div className="leave-role">{leave.role}</div>
                  <div className="leave-reason">{leave.reason}</div>
                </div>
                <div className="leave-date">{formatDate(leave.date)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-approved-leaves">
            <p>No approved leaves for this month</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaveCalendar