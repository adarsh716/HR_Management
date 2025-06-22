import { useState } from "react";
import { ChevronDown,FileText } from "lucide-react";
import DatePicker from "../calendar/date-picker";
// import "./index.css"
import notification from "../../../assets/notification.svg";
import message from "../../../assets/message.svg";
import profile from "../../../assets/profile.png";
import downarrow from "../../../assets/downarrow.svg";
import Calendar from "../calendar";
import LeaveCalendar from "./LeaveCalendar";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useEffect } from "react";

export default function LeaveManagement() {

  const { leaves, addLeave, setLeaves, employees, fetchLeaves, updateLeaveStatus,handleDownloadDocument } = useContext(AuthContext);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({});

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);

  const [newLeave, setNewLeave] = useState({
    name: "",
    leaveDate: "",
    status: "Pending",
    designation: "",
    reason: "",
    documents: null,
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const toggleDropdown = (id, type) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [type + id]: !prev[type + id],
    }));
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen((prev) => !prev);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLeave((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setNewLeave((prev) => ({ ...prev, leaveDate: date }));
  };

  const handleEmployeeSelect = (employee) => {
    setNewLeave((prev) => ({
      ...prev,
      name: employee?.userId?.name,
      designation: employee.position
    }));
    setEmployeeSearchTerm(employee.userId?.name);
    setEmployeeDropdownOpen(false);
  };

  const handleEmployeeSearchChange = (e) => {
    const value = e.target.value;
    setEmployeeSearchTerm(value);
    setNewLeave((prev) => ({ ...prev, name: value }));
    setEmployeeDropdownOpen(true);
  };

  const clearEmployeeSelection = () => {
    setEmployeeSearchTerm("");
    setNewLeave((prev) => ({ ...prev, name: "", designation: "" }));
    setEmployeeDropdownOpen(false);
  };

  const filteredEmployees = employees.filter(employee =>
    employee?.userId?.name?.toLowerCase()?.includes(employeeSearchTerm?.toLowerCase())
  );

  const updateStatus = async (id, newStatus) => {
    await updateLeaveStatus(id, newStatus);
    setDropdownOpen({});
  };

  const openEditDialog = (leave) => {
    setNewLeave(leave);
    setEmployeeSearchTerm(leave.name);
    setEditId(leave.id);
    setDialogOpen(true);
  };

  const handleAddOrEditLeave = () => {
    if (editId) {
      setLeaves((prev) =>
        prev.map((leave) =>
          leave.id === editId ? { ...newLeave, id: editId } : leave
        )
      );
    } else {
      setLeaves((prev) => [
        ...prev,
        {
          ...newLeave,
          id: Math.max(...prev.map((e) => e.id), 0) + 1,
        },
      ]);
    }

    console.log({
      leaveDate: newLeave.leaveDate,
      documents: newLeave.documents,
      reason: newLeave.reason,
      employeeId: employees.find(e => e?.userId?.name === newLeave.name)?._id || null,
    })


    addLeave({
      leaveDate: newLeave.leaveDate,
      documents: newLeave.documents,
      reason: newLeave.reason,
      employeeId: employees.find(e => e?.userId?.name === newLeave.name)?._id || null,
    });

    setNewLeave({
      name: "",
      leaveDate: "",
      status: "Pending",
      designation: "",
      reason: "",
      documents: null,
    });
    setEmployeeSearchTerm("");
    setEditId(null);
    setDialogOpen(false);
  };

  function formatMongoDate(dateInput) {
    const date = new Date(dateInput);

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }



  const resetDialog = () => {
    setNewLeave({
      name: "",
      leaveDate: "",
      status: "Pending",
      designation: "",
      reason: "",
      documents: null,
    });
    setEmployeeSearchTerm("");
    setEditId(null);
    setDialogOpen(false);
    setEmployeeDropdownOpen(false);
  };

  return (
    <div className="employee-management-container">
      <div className="employee-management-card">
        {/* Header */}
        <div className="employee-header">
          <div className="header-top">
            <h1 className="employee-title">Leaves</h1>

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
                  onClick={() => toggleDropdown("status", "filter")}
                  className="filter-button"
                >
                  Status
                  <ChevronDown className="filter-arrow" />
                </button>
                {dropdownOpen["filterstatus"] && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item">Pending</div>
                    <div className="dropdown-item">Approved</div>
                    <div className="dropdown-item">Rejected</div>
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
                Add Leave
              </button>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div className="table-container" style={{ width: '70%' }}>
            {leaves.length > 0 ? (
              <div className="table-wrapper" >
                <table className="employee-table">
                  <thead className="table-header">
                    <tr>
                      <th
                        colSpan="5"
                        className="table-header-title"
                        style={{ fontSize: "20px" }}
                      >
                        Applied Leaves
                      </th>
                    </tr>
                    <tr>
                      <th className="table-header-cell">Profile</th>
                      <th className="table-header-cell">Name</th>
                      <th className="table-header-cell">Date</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Docs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => (
                      <tr key={leave?._id} className="table-row">
                        <td className="table-cell">
                          <img
                            src={profile || "/placeholder.svg"}
                            alt="Profile" 
                          />
                        </td>
                        <td className="table-cell table-cell-name">
                          {leave.employeeId.name}
                        </td>
                        <td className="table-cell">{formatMongoDate(leave.leaveDate)}</td>
                        <td className="table-cell col-status">
                          <div className="status-dropdown">
                            <button
                              onClick={() => toggleDropdown(leave._id, "status")}
                              className={`status-button status-${leave.status.toLowerCase()}`}
                            >
                              {leave.status}
                              <span className="status-arrow">▼</span>
                            </button>
                            {dropdownOpen["status" + leave._id] && (
                              <div className="dropdown-menu">
                                <div
                                  onClick={() =>
                                    updateStatus(leave._id, "Pending")
                                  }
                                  className="dropdown-item"
                                >
                                  Pending
                                </div>
                                <div
                                  onClick={() =>
                                    updateStatus(leave._id, "Approved")
                                  }
                                  className="dropdown-item"
                                >
                                  Approved
                                </div>
                                <div
                                  onClick={() =>
                                    updateStatus(leave._id, "Rejected")
                                  }
                                  className="dropdown-item"
                                >
                                  Rejected
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div >
                            <button
                              onClick={() => handleDownloadDocument(leave._id)}
                              style={{border: 'none', background: 'none', cursor: 'pointer'}}
                            >
                              <FileText size={18} />
                            </button>
                            
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-text">No leaves found</div>
                <div className="empty-state-subtext">
                  Add leaves to get started
                </div>
              </div>
            )}
          </div>
          <div style={{ width: '30%' }}>
            <LeaveCalendar />
          </div>
        </div>
      </div>

      {dialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog-container">
            <div className="dialog-header">
              <span className="dialog-title">
                {editId ? "Edit Leave Details" : "Add New Leave"}
              </span>
              <button
                onClick={resetDialog}
                className="dialog-close-button"
              >
                ×
              </button>
            </div>

            <div className="dialog-body">
              <div className="form-grid">
                {/* Employee Search Dropdown */}
                <div className="employee-search-container">
                  <input
                    type="text"
                    placeholder="Search Employee Name"
                    className="dialog-input employee-search-input"
                    value={employeeSearchTerm}
                    onChange={handleEmployeeSearchChange}
                    onFocus={() => setEmployeeDropdownOpen(true)}
                  />
                  {employeeSearchTerm && (
                    <button
                      type="button"
                      className="clear-employee-button"
                      onClick={clearEmployeeSelection}
                    >
                      ×
                    </button>
                  )}
                  {employeeDropdownOpen && filteredEmployees.length > 0 && (
                    <div className="employee-dropdown">
                      {filteredEmployees.map((employee) => (
                        <div
                          key={employee.id}
                          className="employee-dropdown-item"
                          onClick={() => handleEmployeeSelect(employee)}
                        >
                          {employee.userId?.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Designation Field */}
                <input
                  type="text"
                  name="designation"
                  placeholder="Designation*"
                  className="dialog-input"
                  value={newLeave.designation}
                  onChange={handleInputChange}
                />

                {/* Date Picker */}
                <DatePicker
                  value={newLeave.leaveDate}
                  onChange={handleDateChange}
                  placeholder="Leave Date*"
                />

                {/* Documents Upload */}
                <div className="documents-upload-container">
                  <input
                    type="file"
                    id="documents"
                    className="documents-input"
                    onChange={(e) => setNewLeave(prev => ({ ...prev, documents: e.target.files[0] }))}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="documents" className="documents-label">
                    <span>Documents</span>
                    <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                  </label>
                </div>

                {/* Reason Field */}
                <input
                  type="text"
                  name="reason"
                  placeholder="Reason*"
                  className="dialog-input reason-input"
                  value={newLeave.reason}
                  onChange={handleInputChange}
                />
              </div>

              <button className="save-button" onClick={handleAddOrEditLeave}>
                {editId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}