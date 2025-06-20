import React from "react";

import { useState } from "react";
import { Bell, MessageSquare, ChevronDown } from "lucide-react";
import DatePicker from "../calendar/date-picker";
import "./index.css";
import notification from "../../../assets/notification.svg"
import message from "../../../assets/message.svg"
import profile from "../../../assets/profile.png"
import downarrow from "../../../assets/downarrow.svg"

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "Jacob William",
      email: "jacob.william@example.com",
      phone: "(252) 555-0111",
      position: "Senior Developer",
      department: "Engineering",
      dateOfJoining: "2023-03-15",
    },
    {
      id: 2,
      name: "Guy Hawkins",
      email: "kenzi.lawson@example.com",
      phone: "(907) 555-0101",
      position: "Human Resource I...",
      department: "HR",
      dateOfJoining: "2022-11-08",
    },
    {
      id: 3,
      name: "Arlene McCoy",
      email: "arlene.mccoy@example.com",
      phone: "(302) 555-0107",
      position: "Full Time Designer",
      department: "Design",
      dateOfJoining: "2023-07-22",
    },
    {
      id: 4,
      name: "Leslie Alexander",
      email: "willie.jennings@example.com",
      phone: "(207) 555-0119",
      position: "Full Time Developer",
      department: "Engineering",
      dateOfJoining: "2024-01-10",
    },
    
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [actionMenuOpen, setActionMenuOpen] = useState({});
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [editId, setEditId] = useState(null);

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    dateOfJoining: "",
  });

  const toggleDropdown = (id, type) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [type + id]: !prev[type + id],
    }));
  };

  const toggleActionMenu = (id) => {
    setActionMenuOpen((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

   const toggleProfileMenu = () => {
    setProfileMenuOpen((prev) => !prev)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setNewEmployee((prev) => ({ ...prev, dateOfJoining: date }));
  };

  const openEditDialog = (employee) => {
    setNewEmployee(employee);
    setEditId(employee.id);
    setDialogOpen(true);
  };

  const handleAddOrEditEmployee = () => {
    if (editId) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editId ? { ...newEmployee, id: editId } : emp
        )
      );
    } else {
      setEmployees((prev) => [
        ...prev,
        {
          ...newEmployee,
          id: Math.max(...prev.map((e) => e.id), 0) + 1,
        },
      ]);
    }

    setNewEmployee({
      name: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      dateOfJoining: "",
    });
    setEditId(null);
    setDialogOpen(false);
  };

  const deleteEmployee = (id) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    setActionMenuOpen((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <div className="employee-management-container">
      <div className="employee-management-card">
        {/* Header */}
        <div className="employee-header">
          <div className="header-top">
            <h1 className="employee-title">Employees</h1>
            <div className="header-icons">
              <div className="icon-item">
                <img
                  src={message || "/placeholder.svg"}
                  alt="Message"
                  className="message-icon"
                />
              </div>
              <div className="icon-item">
                <img
                  src={notification || "/placeholder.svg"}
                  alt="Notification"
                  className="notification-icon"
                />
              </div>
              <div className="profile-section" onClick={toggleProfileMenu}>
                <div className="profile-avatar">
                  <img
                    src={profile || "/placeholder.svg"}
                    alt="Profile"
                    className="profile-image"
                  />
                </div>
                <img
                  src={downarrow || "/placeholder.svg"}
                  alt="Dropdown"
                  className="dropdown-icon"
                />
                {profileMenuOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-item">Edit Profile</div>
                    <div className="dropdown-item">Change Password</div>
                    <div className="dropdown-item">Manage Notification</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="header-bottom">
            <div className="filter-buttons">
              <div className="filter-dropdown">
                <button
                  onClick={() => toggleDropdown("position", "filter")}
                  className="filter-button"
                >
                  Position
                  <ChevronDown className="filter-arrow" />
                </button>
                {dropdownOpen["filterposition"] && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item">All Positions</div>
                    <div className="dropdown-item">Developer</div>
                    <div className="dropdown-item">Designer</div>
                    <div className="dropdown-item">HR</div>
                  </div>
                )}
              </div>
            </div>

            <div className="search-add-container">
              <input
                type="text"
                placeholder="Search"
                className="search-input"
              />
              <button
                onClick={() => setDialogOpen(true)}
                className="add-employee-button"
              >
                Add Employee
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          {employees.length > 0 ? (
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
                  {employees.map((emp) => (
                    <tr key={emp.id} className="table-row">
                      <td className="table-cell">
                        <img
                          src={profile || "/placeholder.svg"} />
                      </td>
                      <td className="table-cell table-cell-name">{emp.name}</td>
                      <td className="table-cell">{emp.email}</td>
                      <td className="table-cell">{emp.phone}</td>
                      <td className="table-cell">{emp.position}</td>
                      <td className="table-cell">{emp.department}</td>
                      <td className="table-cell">{emp.dateOfJoining}</td>
                      <td className="table-cell">
                        <div className="action-menu">
                          <button
                            onClick={() => toggleActionMenu(emp.id)}
                            className="action-button"
                          >
                            <span className="action-dots"></span>
                          </button>
                          {actionMenuOpen[emp.id] && (
                            <div className="action-dropdown">
                              <div
                                className="dropdown-item"
                                onClick={() => openEditDialog(emp)}
                              >
                                Edit Employee
                              </div>
                              <div
                                className="dropdown-item delete-item"
                                onClick={() => deleteEmployee(emp.id)}
                              >
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
              <div className="empty-state-text">No employees found</div>
              <div className="empty-state-subtext">
                Add employees to get started
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog-container">
            <div className="dialog-header">
              <span className="dialog-title">
                {editId ? "Edit Employee Details" : "Add New Employee"}
              </span>
              <button
                onClick={() => setDialogOpen(false)}
                className="dialog-close-button"
              >
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
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address*"
                  className="dialog-input"
                  value={newEmployee.email}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number*"
                  className="dialog-input"
                  value={newEmployee.phone}
                  onChange={handleInputChange}
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
                </select>

                <DatePicker
                  value={newEmployee.dateOfJoining}
                  onChange={handleDateChange}
                  placeholder="Date of Joining*"
                />
              </div>

              <button className="save-button" onClick={handleAddOrEditEmployee}>
                {editId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
