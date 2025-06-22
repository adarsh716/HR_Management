"use client"

import { useState, useContext, useEffect, useMemo } from "react"
import { ChevronDown } from "lucide-react"
import DatePicker from "../calendar/date-picker"
import { AuthContext } from "../../../context/AuthContext"
import "./index.css"
import notification from "../../../assets/notification.svg"
import message from "../../../assets/message.svg"
import profile from "../../../assets/profile.png"
import downarrow from "../../../assets/downarrow.svg"

export default function EmployeeManagement() {
  const {
    isAuthenticated,
    user,
    employees,
    employeeLoading,
    error,
    editEmployee,
    removeEmployee,
    fetchEmployees,
    logout,
  } = useContext(AuthContext)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState({})
  const [actionMenuOpen, setActionMenuOpen] = useState({})
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments")

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    hireDate: "",
  })

  useEffect(() => {
    if (isAuthenticated && user?.role === "HR") {
      fetchEmployees()
    }
  }, [isAuthenticated, user, fetchEmployees])

  // Get unique departments from employees for filter dropdown
  const uniqueDepartments = useMemo(() => {
    const departments = employees.map((employee) => employee.department).filter(Boolean)
    return [...new Set(departments)]
  }, [employees])

  // Filter employees based on search term and selected department
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      // Search filter - check name, email, and phone
      const matchesSearch =
        searchTerm === "" ||
        employee.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.userId?.phone?.includes(searchTerm)

      // Department filter
      const matchesDepartment = selectedDepartment === "All Departments" || employee.department === selectedDepartment

      return matchesSearch && matchesDepartment
    })
  }, [employees, searchTerm, selectedDepartment])

  const toggleDropdown = (id, type) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [type + id]: !prev[type + id],
    }))
  }

  const toggleActionMenu = (id) => {
    setActionMenuOpen((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const toggleProfileMenu = () => {
    setProfileMenuOpen((prev) => !prev)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewEmployee((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (date) => {
    setNewEmployee((prev) => ({ ...prev, hireDate: date }))
  }

  const openEditDialog = (employee) => {
    setNewEmployee({
      name: employee.userId?.name || "",
      email: employee.userId?.email || "",
      phone: employee.userId?.phone || "",
      position: employee.position || "",
      department: employee.department || "",
      hireDate: employee.hireDate ? employee.hireDate.split("T")[0] : "",
    })
    setEditId(employee._id)
    setDialogOpen(true)
  }

  const handleEditEmployee = async () => {
    if (!editId) return

    try {
      await editEmployee(editId, {
        department: newEmployee.department,
        position: newEmployee.position,
        hireDate: newEmployee.hireDate,
      })

      setNewEmployee({
        name: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        hireDate: "",
      })
      setEditId(null)
      setDialogOpen(false)
    } catch (err) {
      console.error("Edit employee error:", err)
      alert("Failed to update employee. Please try again.")
    }
  }

  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await removeEmployee(id)
        setActionMenuOpen((prev) => ({ ...prev, [id]: false }))
      } catch (err) {
        console.error("Delete employee error:", err)
        alert("Failed to delete employee. Please try again.")
      }
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleDepartmentFilter = (department) => {
    setSelectedDepartment(department)
    setDropdownOpen({})
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedDepartment("All Departments")
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="employee-management-container">
      <div className="employee-management-card">
        {/* Header */}
        <div className="employee-header">
          <div className="header-top">
            <h1 className="employee-title">Employees</h1>
            <div className="header-icons">
              <div className="icon-item">
                <img src={message || "/placeholder.svg"} alt="Message" className="message-icon" />
              </div>
              <div className="icon-item">
                <img src={notification || "/placeholder.svg"} alt="Notification" className="notification-icon" />
              </div>
              <div className="profile-section" onClick={toggleProfileMenu}>
                <div className="profile-avatar">
                  <img src={profile || "/placeholder.svg"} alt="Profile" className="profile-image" />
                </div>
                <img src={downarrow || "/placeholder.svg"} alt="Dropdown" className="dropdown-icon" />
                {profileMenuOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-item">Edit Profile</div>
                    <div className="dropdown-item">Change Password</div>
                    <div className="dropdown-item">Manage Notification</div>
                    <div className="dropdown-item" onClick={logout}>
                      Logout
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="header-bottom">
            <div className="filter-buttons">
              <div className="filter-dropdown">
                <button onClick={() => toggleDropdown("department", "filter")} className="filter-button">
                  {selectedDepartment}
                  {/* <ChevronDown className="filter-arrow" /> */}
                </button>
                {dropdownOpen["filterdepartment"] && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item" onClick={() => handleDepartmentFilter("All Departments")}>
                      All Departments
                    </div>
                    {uniqueDepartments.map((department) => (
                      <div
                        key={department}
                        className="dropdown-item"
                        onClick={() => handleDepartmentFilter(department)}
                      >
                        {department}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear filters button */}
              {(searchTerm || selectedDepartment !== "All Departments") && (
                <button className="clear-filters-button" onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
            </div>

            <div className="search-add-container">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="search-input"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchTerm && (
                  <button className="search-clear-button" onClick={() => setSearchTerm("")} aria-label="Clear search">
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter summary */}
          {filteredEmployees.length !== employees.length && (
            <div className="filter-summary">
              Showing {filteredEmployees.length} of {employees.length} employees
              {searchTerm && <span> matching "{searchTerm}"</span>}
              {selectedDepartment !== "All Departments" && <span> in {selectedDepartment}</span>}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="table-container">
          {employeeLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <div>Loading employees...</div>
            </div>
          ) : filteredEmployees.length > 0 ? (
            <div className="table-wrapper">
              <table className="employee-table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Profile</th>
                    <th className="table-header-cell">Employee Name</th>
                    <th className="table-header-cell">Email Address</th>
                    <th className="table-header-cell">Phone Number</th>
                    <th className="table-header-cell">Position</th>
                    <th className="table-header-cell">Department</th>
                    <th className="table-header-cell">Date of Joining</th>
                    <th className="table-header-cell">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp._id} className="table-row">
                      <td className="table-cell">
                        <img src={profile || "/placeholder.svg"} alt="Profile" className="profile-image-small" />
                      </td>
                      <td className="table-cell table-cell-name">{emp.userId?.name || "N/A"}</td>
                      <td className="table-cell">{emp.userId?.email || "N/A"}</td>
                      <td className="table-cell">{emp.userId?.phone || "N/A"}</td>
                      <td className="table-cell">{emp.position}</td>
                      <td className="table-cell">{emp.department}</td>
                      <td className="table-cell">{formatDate(emp.hireDate)}</td>
                      <td className="table-cell">
                        <div className="action-menu">
                          <button onClick={() => toggleActionMenu(emp._id)} className="action-button">
                            <span className="action-dots"></span>
                          </button>
                          {actionMenuOpen[emp._id] && (
                            <div className="action-dropdown">
                              <div className="dropdown-item" onClick={() => openEditDialog(emp)}>
                                Edit Employee
                              </div>
                              <div className="dropdown-item delete-item" onClick={() => handleDeleteEmployee(emp._id)}>
                                Delete Employee
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-text">
                {employees.length === 0 ? "No employees found" : "No employees match your filters"}
              </div>
              <div className="empty-state-subtext">
                {employees.length === 0
                  ? "Employees will appear here when candidates are marked as 'Selected'"
                  : "Try adjusting your search or filter criteria"}
              </div>
              {employees.length > 0 && (
                <button className="clear-filters-button" onClick={clearFilters}>
                  Clear All Filters
                </button>
              )}
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>

      {/* Edit Dialog */}
      {dialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog-container">
            <div className="dialog-header">
              <span className="dialog-title">Edit Employee Details</span>
              <button onClick={() => setDialogOpen(false)} className="dialog-close-button">
                ×
              </button>
            </div>

            <div className="dialog-body">
              <div className="form-grid">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name*"
                  className="dialog-input"
                  value={newEmployee.name}
                  onChange={handleInputChange}
                  disabled
                  title="Name cannot be edited from employee record"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address*"
                  className="dialog-input"
                  value={newEmployee.email}
                  onChange={handleInputChange}
                  disabled
                  title="Email cannot be edited from employee record"
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number*"
                  className="dialog-input"
                  value={newEmployee.phone}
                  onChange={handleInputChange}
                  disabled
                  title="Phone cannot be edited from employee record"
                />
                <input
                  type="text"
                  name="position"
                  placeholder="Position*"
                  className="dialog-input"
                  value={newEmployee.position}
                  onChange={handleInputChange}
                />
                <select
                  name="department"
                  className="dialog-input dialog-select"
                  value={newEmployee.department}
                  onChange={handleInputChange}
                >
                  <option value="">Select Department*</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="HR">HR</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                  <option value="Product">Product</option>
                  <option value="General">General</option>
                </select>

                <DatePicker value={newEmployee.hireDate} onChange={handleDateChange} placeholder="Date of Joining*" />
              </div>

              <button className="save-button" onClick={handleEditEmployee}>
                Update Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
