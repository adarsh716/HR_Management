import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import userAdd from "../../assets/user-add.svg";
import logoutIcon from "../../assets/log-out.svg";
import search from "../../assets/search.svg";
import purpleuserAdd from "../../assets/purple-user-add.svg";
import groupuser from "../../assets/groupuser.svg";
import attendance from "../../assets/attendance.svg";
import leaves from "../../assets/leaves.svg";
import "./sidebar.css";

export const Sidebar = ({ activeItem, setActiveItem }) => {
  const { logout } = useContext(AuthContext); // Access logout function from AuthContext
  const navigate = useNavigate(); // For redirecting after logout
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const menuItems = [
    { category: "Recruitment", items: [{ name: "Candidates", icon: userAdd, activeicon: purpleuserAdd }] },
    { category: "Organization", items: [{ name: "Employees", icon: groupuser }] },
    {
      category: null,
      items: [
        { name: "Attendance", icon: attendance },
        { name: "Leaves", icon: leaves },
      ],
    },
    { category: "Others", items: [] }, // Placeholder for future items
  ];

  const handleLogout = () => {
    logout(); // Call logout from AuthContext to clear token and state
    setShowLogoutDialog(false); // Close dialog
    navigate("/login"); // Redirect to login page
  };

  return (
    <>
      {/* Hamburger Icon for Mobile */}
      <div className="hamburger" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        <span className="ham-span"></span>
        <span className="ham-span"></span>
        <span className="ham-span"></span>
      </div>

      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-circle"></div>
          <span className="logo-text">LOGO</span>
        </div>

        <div className="sidebar-search">
          <img src={search} alt="Search Icon" className="search-icon" height={20} width={20} />
          <input type="text" placeholder="Search" style={{ borderRadius: "20px" }} />
        </div>

        <div className="sidebar-menu">
          {menuItems.map((categoryItem, index) => (
            <div key={index}>
              {categoryItem.category && (
                <div className="sidebar-subheading">{categoryItem.category}</div>
              )}
              {categoryItem.items.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveItem(item.name);
                    if (window.innerWidth <= 768) setIsSidebarOpen(false); // Close sidebar on mobile after click
                  }}
                  className={`sidebar-item ${activeItem === item.name ? "active" : ""}`}
                >
                  {activeItem === item.name ? (
                    <img src={item.activeicon || item.icon} alt={item.name} className="sidebar-icon" />
                  ) : (
                    <img src={item.icon} alt={item.name} className="sidebar-icon" />
                  )}
                  {item.name}
                </button>
              ))}
            </div>
          ))}
          <button className="sidebar-item logout" onClick={() => setShowLogoutDialog(true)}>
            <img src={logoutIcon} alt="Logout" className="sidebar-icon" />
            Logout
          </button>
        </div>
      </div>
      {showLogoutDialog && (
        <div className="logout-dialog-overlay">
          <div className="logout-dialog">
            <div className="logout-dialog-header">Log Out</div>
            <div className="logout-dialog-body">
              Are you sure you want to log out?
              <div className="logout-dialog-actions">
                <button className="cancel-btn" onClick={() => setShowLogoutDialog(false)}>
                  Cancel
                </button>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};