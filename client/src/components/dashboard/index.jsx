import React, { useState } from "react";
import { Sidebar } from "./sideBar";
import CandidateManagement from "./candidate";
import EmployeeManagement from "./employee";
import "./dashboard.css"; 
import LeaveManagement from "./leave";

const Dashboard = () => {
  const [activeItem, setActiveItem] = useState("Candidates"); 

  return (
    <div className="dashboard-container">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="main-content">
        {activeItem === "Candidates" && <CandidateManagement />}
        {activeItem === "Employees" && <EmployeeManagement />}
         {/* {activeItem === "Attendance" && <LeaveManagement/> } */}
        {activeItem === "Leaves" && <LeaveManagement/>} 
      </div>
    </div>
  );
};

export default Dashboard;