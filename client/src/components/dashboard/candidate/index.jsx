import { useState, useEffect, useContext } from "react";
import "./index.css";
import notification from "../../../assets/notification.svg";
import message from "../../../assets/message.svg";
import profile from "../../../assets/profile.png";
import downarrow from "../../../assets/downarrow.svg";
import AddCandidateDialog from "./dialog.jsx";
import { AuthContext } from "../../../context/AuthContext";

export default function CandidateManagement() {
  const { isAuthenticated, user, error, candidates, addCandidate, logout, fetchCandidates } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [actionMenuOpen, setActionMenuOpen] = useState({});
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    resume: null,
    accepted: false,
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === "HR") {
      fetchCandidates();
    }
  }, [isAuthenticated, user, fetchCandidates]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCandidate((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewCandidate((prev) => ({ ...prev, resume: e.target.files[0] }));
  };

  const handleCheckboxChange = (e) => {
    setNewCandidate((prev) => ({ ...prev, accepted: e.target.checked }));
  };

  const handleAddCandidate = async () => {
    const { name, email, phone, position, experience, resume, accepted } = newCandidate;
    if (!name || !phone || !accepted) {
      alert("Name, phone, and acceptance are required");
      return;
    }

    const candidateData = { name, email, phone, position, experience, resume };
    try {
      await addCandidate(candidateData);
      setDialogOpen(false);
      setNewCandidate({
        name: "",
        email: "",
        phone: "",
        position: "",
        experience: "",
        resume: null,
        accepted: false,
      });
    } catch (err) {
      console.error("Add candidate error:", err);
    }
  };

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
    setProfileMenuOpen((prev) => !prev);
  };

  const updateStatus = (id, newStatus) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate._id === id ? { ...candidate, status: newStatus } : candidate
      )
    );
    setDropdownOpen({});
  };

  const handleDeleteCandidate = (id) => {
    setCandidates((prev) => prev.filter((candidate) => candidate._id !== id));
    setActionMenuOpen({});
  };

  const handleDownloadResume = (id) => {
    console.log(`Downloading resume for candidate ${id}`);
    setActionMenuOpen({});
  };

 

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
                  Status
                </button>
                {dropdownOpen["filterstatus"] && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item">New</div>
                    <div className="dropdown-item">Scheduled</div>
                    <div className="dropdown-item">Ongoing</div>
                    <div className="dropdown-item">Selected</div>
                    <div className="dropdown-item">Rejected</div>
                  </div>
                )}
              </div>

              <div className="filter-dropdown">
                <button onClick={() => toggleDropdown("position", "filter")} className="filter-button">
                  Position
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
              <div className="search-container">
                <input type="text" placeholder="Search" className="search-input" />
              </div>
              <button className="add-candidate-button" onClick={() => setDialogOpen(true)}>
                Add Candidate
              </button>
            </div>
          </div>
        </div>

        <div className="table-container">
          {candidates.length > 0 ? (
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
                  {candidates.map((candidate, index) => (
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
                            className={`status-button status-${candidate.status.toLowerCase()}`}
                          >
                            {candidate.status}
                            <span className="status-arrow">▼</span>
                          </button>
                          {dropdownOpen["status" + candidate._id] && (
                            <div className="dropdown-menu">
                              <div
                                onClick={() => updateStatus(candidate._id, "New")}
                                className="dropdown-item"
                              >
                                New
                              </div>
                              <div
                                onClick={() => updateStatus(candidate._id, "Selected")}
                                className="dropdown-item"
                              >
                                Selected
                              </div>
                              <div
                                onClick={() => updateStatus(candidate._id, "Rejected")}
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
                          <button
                            onClick={() => toggleActionMenu(candidate._id)}
                            className="action-button"
                          ></button>
                          {actionMenuOpen[candidate._id] && (
                            <div className="dropdown-menu action-dropdown">
                              <div
                                className="dropdown-item"
                                onClick={() => handleDownloadResume(candidate._id)}
                              >
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
              <div className="empty-state-text">No candidates found</div>
              <div className="empty-state-subtext">Add candidates to get started</div>
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
  );
}