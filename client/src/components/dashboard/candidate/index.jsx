import { useState, useEffect, useContext, useMemo } from "react"
import "./index.css"
import notification from "../../../assets/notification.svg"
import message from "../../../assets/message.svg"
import profile from "../../../assets/profile.png"
import downarrow from "../../../assets/downarrow.svg"
import AddCandidateDialog from "./dialog.jsx"
import { AuthContext } from "../../../context/AuthContext"

export default function CandidateManagement() {
  const {
    isAuthenticated,
    user,
    error,
    candidates,
    statusUpdateLoading,
    addCandidate,
    removeCandidate,
    updateStatus,
    handleDownloadResume,
    logout,
    fetchCandidates,
  } = useContext(AuthContext)

  const [dropdownOpen, setDropdownOpen] = useState({})
  const [actionMenuOpen, setActionMenuOpen] = useState({})
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All Status")
  const [selectedPosition, setSelectedPosition] = useState("All Positions")

  const [newCandidate, setNewCandidate] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    resume: null,
    accepted: false,
  })

  useEffect(() => {
    if (isAuthenticated && user?.role === "HR") {
      fetchCandidates()
    }
  }, [isAuthenticated, user, fetchCandidates])

  // Get unique positions from candidates for filter dropdown
  const uniquePositions = useMemo(() => {
    const positions = candidates.map((candidate) => candidate.position).filter(Boolean)
    return [...new Set(positions)]
  }, [candidates])

  // Filter candidates based on search term and selected filters
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      // Search filter - check name, email, and phone
      const matchesSearch =
        searchTerm === "" ||
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.phone.includes(searchTerm)

      // Status filter
      const matchesStatus = selectedStatus === "All Status" || candidate.status === selectedStatus

      // Position filter
      const matchesPosition = selectedPosition === "All Positions" || candidate.position === selectedPosition

      return matchesSearch && matchesStatus && matchesPosition
    })
  }, [candidates, searchTerm, selectedStatus, selectedPosition])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewCandidate((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    setNewCandidate((prev) => ({ ...prev, resume: e.target.files[0] }))
  }

  const handleCheckboxChange = (e) => {
    setNewCandidate((prev) => ({ ...prev, accepted: e.target.checked }))
  }

  const handleAddCandidate = async () => {
    const { name, email, phone, position, experience, resume, accepted } = newCandidate
    if (!name || !phone || !accepted) {
      alert("Name, phone, and acceptance are required")
      return
    }

    const candidateData = { name, email, phone, position, experience, resume }
    try {
      await addCandidate(candidateData)
      setDialogOpen(false)
      setNewCandidate({
        name: "",
        email: "",
        phone: "",
        position: "",
        experience: "",
        resume: null,
        accepted: false,
      })
    } catch (err) {
      console.error("Add candidate error:", err)
    }
  }

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

  // Updated status update function to call API
  const handleStatusUpdate = async (candidateId, newStatus) => {
    try {
      await updateStatus(candidateId, newStatus)
      setDropdownOpen({})
    } catch (err) {
      console.error("Status update error:", err)
      // Optionally show a toast notification or alert
      alert("Failed to update candidate status. Please try again.")
    }
  }

  const handleDeleteCandidate = async (id) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      try {
        await removeCandidate(id)
        setActionMenuOpen({})
      } catch (err) {
        console.error("Delete candidate error:", err)
      }
    }
  }

  const handleDownloadResumeAction = async (candidate) => {
    try {
      await handleDownloadResume(candidate._id, candidate.name, candidate.resume)
      setActionMenuOpen({})
    } catch (err) {
      console.error("Download resume error:", err)
    }
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Handle status filter selection
  const handleStatusFilter = (status) => {
    setSelectedStatus(status)
    setDropdownOpen({})
  }

  // Handle position filter selection
  const handlePositionFilter = (position) => {
    setSelectedPosition(position)
    setDropdownOpen({})
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setSelectedStatus("All Status")
    setSelectedPosition("All Positions")
  }

  return (
    <div className="candidate-management-container">
      <div className="candidate-management-card">
        <div className="candidate-header">
          <div className="header-top">
            <h1 className="candidate-title">Candidates</h1>
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
                <button onClick={() => toggleDropdown("status", "filter")} className="filter-button">
                  {selectedStatus}
                </button>
                {dropdownOpen["filterstatus"] && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item" onClick={() => handleStatusFilter("All Status")}>
                      All Status
                    </div>
                    <div className="dropdown-item" onClick={() => handleStatusFilter("New")}>
                      New
                    </div>
                    <div className="dropdown-item" onClick={() => handleStatusFilter("Scheduled")}>
                      Scheduled
                    </div>
                    <div className="dropdown-item" onClick={() => handleStatusFilter("Ongoing")}>
                      Ongoing
                    </div>
                    <div className="dropdown-item" onClick={() => handleStatusFilter("Selected")}>
                      Selected
                    </div>
                    <div className="dropdown-item" onClick={() => handleStatusFilter("Rejected")}>
                      Rejected
                    </div>
                  </div>
                )}
              </div>

              <div className="filter-dropdown">
                <button onClick={() => toggleDropdown("position", "filter")} className="filter-button">
                  {selectedPosition}
                </button>
                {dropdownOpen["filterposition"] && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item" onClick={() => handlePositionFilter("All Positions")}>
                      All Positions
                    </div>
                    {uniquePositions.map((position) => (
                      <div key={position} className="dropdown-item" onClick={() => handlePositionFilter(position)}>
                        {position}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear filters button */}
              {(searchTerm || selectedStatus !== "All Status" || selectedPosition !== "All Positions") && (
                <button className="clear-filters-button" onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
            </div>

            <div className="search-add-container">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
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
              <button className="add-candidate-button" onClick={() => setDialogOpen(true)}>
                Add Candidate
              </button>
            </div>
          </div>

          {/* Filter summary */}
          {filteredCandidates.length !== candidates.length && (
            <div className="filter-summary">
              Showing {filteredCandidates.length} of {candidates.length} candidates
              {searchTerm && <span> matching "{searchTerm}"</span>}
              {selectedStatus !== "All Status" && <span> with status "{selectedStatus}"</span>}
              {selectedPosition !== "All Positions" && <span> in position "{selectedPosition}"</span>}
            </div>
          )}
        </div>

        <div className="table-container">
          {filteredCandidates.length > 0 ? (
            <div className="table-wrapper">
              <table className="candidate-table">
                <thead>
                  <tr className="table-header">
                    <th className="col-sr-no">Sr no.</th>
                    <th className="col-name">Candidates Name</th>
                    <th className="col-email">Email Address</th>
                    <th className="col-phone">Phone Number</th>
                    <th className="col-position">Position</th>
                    <th className="col-status">Status</th>
                    <th className="col-experience">Experience</th>
                    <th className="col-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate, index) => (
                    <tr key={candidate._id} className="table-row">
                      <td className="table-cell sr-no col-sr-no">{String(index + 1).padStart(2, "0")}</td>
                      <td className="table-cell name-cell col-name">{candidate.name}</td>
                      <td className="table-cell col-email">{candidate.email}</td>
                      <td className="table-cell col-phone">{candidate.phone}</td>
                      <td className="table-cell col-position">{candidate.position}</td>
                      <td className="table-cell col-status">
                        <div className="status-dropdown">
                          <button
                            onClick={() => toggleDropdown(candidate._id, "status")}
                            className={`status-button status-${candidate.status.toLowerCase()} ${
                              statusUpdateLoading[candidate._id] ? "loading" : ""
                            }`}
                            disabled={statusUpdateLoading[candidate._id]}
                          >
                            {statusUpdateLoading[candidate._id] ? (
                              <>
                                <span className="loading-spinner"></span>
                                Updating...
                              </>
                            ) : (
                              <>
                                {candidate.status}
                                <span className="status-arrow">▼</span>
                              </>
                            )}
                          </button>
                          {dropdownOpen["status" + candidate._id] && !statusUpdateLoading[candidate._id] && (
                            <div className="dropdown-menu">
                              <div onClick={() => handleStatusUpdate(candidate._id, "New")} className="dropdown-item">
                                New
                              </div>
                              <div
                                onClick={() => handleStatusUpdate(candidate._id, "Scheduled")}
                                className="dropdown-item"
                              >
                                Scheduled
                              </div>
                              <div
                                onClick={() => handleStatusUpdate(candidate._id, "Ongoing")}
                                className="dropdown-item"
                              >
                                Ongoing
                              </div>
                              <div
                                onClick={() => handleStatusUpdate(candidate._id, "Selected")}
                                className="dropdown-item"
                              >
                                Selected
                              </div>
                              <div
                                onClick={() => handleStatusUpdate(candidate._id, "Rejected")}
                                className="dropdown-item"
                              >
                                Rejected
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="table-cell experience-cell col-experience">{candidate.experience}</td>
                      <td className="table-cell col-action">
                        <div className="action-menu">
                          <button onClick={() => toggleActionMenu(candidate._id)} className="action-button"></button>
                          {actionMenuOpen[candidate._id] && (
                            <div className="dropdown-menu action-dropdown">
                              <div className="dropdown-item" onClick={() => handleDownloadResumeAction(candidate)}>
                                Download Resume
                              </div>
                              <div
                                className="dropdown-item delete-item"
                                onClick={() => handleDeleteCandidate(candidate._id)}
                              >
                                Delete Candidate
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
                {candidates.length === 0 ? "No candidates found" : "No candidates match your filters"}
              </div>
              <div className="empty-state-subtext">
                {candidates.length === 0
                  ? "Add candidates to get started"
                  : "Try adjusting your search or filter criteria"}
              </div>
              {candidates.length > 0 && (
                <button className="clear-filters-button" onClick={clearFilters}>
                  Clear All Filters
                </button>
              )}
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
      <AddCandidateDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        newCandidate={newCandidate}
        onInputChange={handleInputChange}
        onFileChange={handleFileChange}
        onCheckboxChange={handleCheckboxChange}
        onAddCandidate={handleAddCandidate}
      />
    </div>
  )
}
