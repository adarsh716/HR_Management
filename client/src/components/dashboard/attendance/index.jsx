import { useState, useContext, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { AuthContext } from "../../../context/AuthContext";
import "./index.css";
import notification from "../../../assets/notification.svg";
import message from "../../../assets/message.svg";
import profile from "../../../assets/profile.png";
import downarrow from "../../../assets/downarrow.svg";

export default function AttendanceManagement() {
  const {
    isAuthenticated,
    user,
    attendanceData,
    attendanceLoading,
    statusUpdateLoading,
    error,
    updateAttendance,
    fetchAttendanceData,
    logout,
  } = useContext(AuthContext);

  const [dropdownOpen, setDropdownOpen] = useState({});
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [openStatusId, setOpenStatusId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");

  useEffect(() => {
    if (isAuthenticated && user?.role === "HR") {
      fetchAttendanceData();
    }
  }, [isAuthenticated, user, fetchAttendanceData]);

  const safeAttendanceData = useMemo(() => {
    if (Array.isArray(attendanceData)) {
      return attendanceData;
    }
    console.warn("attendanceData is not an array:", attendanceData);
    return [];
  }, [attendanceData]);

  const uniqueDepartments = useMemo(() => {
    if (!Array.isArray(safeAttendanceData)) return [];
    const departments = safeAttendanceData
      .map((employee) => employee.department)
      .filter(Boolean);
    return [...new Set(departments)];
  }, [safeAttendanceData]);

  const filteredEmployees = useMemo(() => {
    if (!Array.isArray(safeAttendanceData)) return [];

    return safeAttendanceData.filter((employee) => {
      const matchesSearch =
        searchTerm === "" ||
        employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "All Status" || employee.status === selectedStatus;

      const matchesDepartment =
        selectedDepartment === "All Departments" ||
        employee.department === selectedDepartment;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [safeAttendanceData, searchTerm, selectedStatus, selectedDepartment]);

  const toggleDropdown = (id, type) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [type + id]: !prev[type + id],
    }));
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen((prev) => !prev);
  };

  const handleStatusUpdate = async (employeeId, newStatus) => {
    try {
      console.log("Updating status for employee:", employeeId, "to", newStatus);
      await updateAttendance(employeeId, newStatus);
      setOpenStatusId(null); 
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update attendance status: " + (err.message || "Unknown error"));
      setOpenStatusId(null); 
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setDropdownOpen({});
  };

  const handleDepartmentFilter = (department) => {
    setSelectedDepartment(department);
    setDropdownOpen({});
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("All Status");
    setSelectedDepartment("All Departments");
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return "present";
      case "absent":
        return "absent";
      case "half-day":
        return "half-day";
      default:
        return "absent";
    }
  };

  useEffect(() => {
    console.log("Attendance Data:", attendanceData);
    console.log("Is Array:", Array.isArray(attendanceData));
    console.log("Safe Attendance Data:", safeAttendanceData);
    console.log("Filtered Employees:", filteredEmployees);
  }, [attendanceData, safeAttendanceData, filteredEmployees]);

  return (
    <div className="employee-management-container">
      <div className="employee-management-card">
        <div className="employee-header">
          <div className="header-top">
            <h1 className="employee-title">Attendance</h1>
            <div className="header-icons">
              <div className="icon-item">
                <img src={message || "/placeholder.svg"} alt="Message" className="message-icon" />
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
                  <img src={profile || "/placeholder.svg"} alt="Profile" className="profile-image" />
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
                <button
                  onClick={() => toggleDropdown("status", "filter")}
                  className="filter-button"
                >
                  {selectedStatus}
                  {/* <ChevronDown className="filter-arrow" /> */}
                </button>
                {dropdownOpen["filterstatus"] && (
                  <div className="dropdown-menu">
                    <div
                      className="dropdown-item"
                      onClick={() => handleStatusFilter("All Status")}
                    >
                      All Status
                    </div>
                    <div
                      className="dropdown-item"
                      onClick={() => handleStatusFilter("Present")}
                    >
                      Present
                    </div>
                    <div
                      className="dropdown-item"
                      onClick={() => handleStatusFilter("Absent")}
                    >
                      Absent
                    </div>
                    <div
                      className="dropdown-item"
                      onClick={() => handleStatusFilter("Half-Day")}
                    >
                      Half-Day
                    </div>
                  </div>
                )}
              </div>

              <div className="filter-dropdown">
                <button
                  onClick={() => toggleDropdown("department", "filter")}
                  className="filter-button"
                >
                  {selectedDepartment}
                  {/* <ChevronDown className="filter-arrow" /> */}
                </button>
                {dropdownOpen["filterdepartment"] && (
                  <div className="dropdown-menu">
                    <div
                      className="dropdown-item"
                      onClick={() => handleDepartmentFilter("All Departments")}
                    >
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

              {(searchTerm ||
                selectedStatus !== "All Status" ||
                selectedDepartment !== "All Departments") && (
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
                  <button
                    className="search-clear-button"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {filteredEmployees.length !== safeAttendanceData.length && (
            <div className="filter-summary">
              Showing {filteredEmployees.length} of {safeAttendanceData.length} employees
              {searchTerm && <span> matching "{searchTerm}"</span>}
              {selectedStatus !== "All Status" && <span> with status "{selectedStatus}"</span>}
              {selectedDepartment !== "All Departments" && (
                <span> in {selectedDepartment}</span>
              )}
            </div>
          )}
        </div>

        <div className="table-container">
          {attendanceLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <div>Loading attendance data...</div>
            </div>
          ) : filteredEmployees.length > 0 ? (
            <div className="table-wrapper">
              <table className="employee-table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Profile</th>
                    <th className="table-header-cell">Employee Name</th>
                    <th className="table-header-cell">Position</th>
                    <th className="table-header-cell">Department</th>
                    <th className="table-header-cell">Task</th>
                    <th className="table-header-cell">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp._id} className="table-row">
                      <td className="table-cell">
                        <img
                          src={profile || "/placeholder.svg"}
                          alt="Avatar"
                          className="employee-avatar"
                        />
                      </td>
                      <td className="table-cell">{emp.name || "N/A"}</td>
                      <td className="table-cell">{emp.position || "N/A"}</td>
                      <td className="table-cell">{emp.department || "N/A"}</td>
                      <td className="table-cell">{emp.task || "--"}</td>
                      <td className="table-cell">
                        <div className="custom-dropdown">
                          <div
                            className={`dropdown-pill ${getStatusClass(emp.status)} ${
                              statusUpdateLoading[emp._id] ? "loading" : ""
                            }`}
                            onClick={() =>
                              !statusUpdateLoading[emp._id] &&
                              setOpenStatusId(openStatusId === emp._id ? null : emp._id)
                            }
                          >
                            {statusUpdateLoading[emp._id] ? (
                              <>
                                <span className="loading-spinner-small"></span>
                                Updating...
                              </>
                            ) : (
                              <>
                                {emp.status || "Absent"}
                                <ChevronDown className="filter-arrow" />
                              </>
                            )}
                          </div>
                          {openStatusId === emp._id && !statusUpdateLoading[emp._id] && (
                            <div className="dropdown-menu-card">
                              {["Present", "Absent", "Half-Day"].map((status) => (
                                <div
                                  key={status}
                                  className={`dropdown-option ${getStatusClass(status)}`}
                                  onClick={() => handleStatusUpdate(emp._id, status)}
                                >
                                  {status}
                                </div>
                              ))}
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
                {safeAttendanceData.length === 0
                  ? "No employees found"
                  : "No employees match your filters"}
              </div>
              <div className="empty-state-subtext">
                {safeAttendanceData.length === 0
                  ? "Employees will appear here when they are added to the system"
                  : "Try adjusting your search or filter criteria"}
              </div>
              {safeAttendanceData.length > 0 && (
                <button className="clear-filters-button" onClick={clearFilters}>
                  Clear All Filters
                </button>
              )}
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
}