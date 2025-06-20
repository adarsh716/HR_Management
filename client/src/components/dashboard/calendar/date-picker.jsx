"use client"

import { useState, useRef, useEffect } from "react"
import { CalendarIcon } from "lucide-react"
import Calendar from "./index"
import "./date-picker.css"

export default function DatePicker({ value, onChange, placeholder = "Select date", className = "" }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null)
  const containerRef = useRef(null)

  useEffect(() => {
    // Update selectedDate when value prop changes
    if (value) {
      setSelectedDate(new Date(value))
    } else {
      setSelectedDate(null)
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleDateSelect = (date) => {
    setSelectedDate(date)

    // Format date as YYYY-MM-DD in local timezone to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const formattedDate = `${year}-${month}-${day}`

    if (onChange) {
      onChange(formattedDate)
    }
    setIsOpen(false)
  }

  const formatDisplayDate = (date) => {
    if (!date) return ""
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className={`date-picker-container ${className}`} ref={containerRef}>
      <div className="date-picker-input" onClick={() => setIsOpen(!isOpen)}>
        <span
          className={`date-picker-text ${selectedDate ? "date-picker-text-selected" : "date-picker-text-placeholder"}`}
        >
          {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
        </span>
        <CalendarIcon className="date-picker-icon" />
      </div>

      {isOpen && (
        <>
          <div className="date-picker-backdrop" onClick={() => setIsOpen(false)} />
          <div className="date-picker-dropdown">
            <Calendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />
          </div>
        </>
      )}
    </div>
  )
}
