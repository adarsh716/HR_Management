"use client";

import { createContext, useState, useEffect, useCallback } from "react";
import {
  loginUser,
  registerUser,
  getAllCandidates,
  createCandidate,
  deleteCandidate,
  updateCandidateStatus,
  downloadResume,
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
  getAllEmployeesWithAttendance,
  updateAttendanceStatus,
  createLeave,
  getAllLeaves,
  updateLeave,
  downloadDocument
} from "../api/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState({});
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const expiry = localStorage.getItem("token_expiry");
    if (token) {
      setIsAuthenticated(true);
      setUser(JSON.parse(localStorage.getItem("user") || null));
      fetchCandidates();
      fetchEmployees();
      fetchAttendanceData();
    }
    if (expiry && Date.now() > Number.parseInt(expiry)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("token_expiry");
      setIsAuthenticated(false);
      setUser(null);
      setCandidates([]);
      setEmployees([]);
      setAttendanceData([]);
      setError("Session expired, please log in again.");
    }
    setLoading(false);
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      setEmployeeLoading(true);
      const data = await getAllEmployees();
      setEmployees(data.employees || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch employees");
    } finally {
      setEmployeeLoading(false);
    }
  }, []);

  const fetchLeaves= useCallback(async () => {
    try {
      const data = await getAllLeaves();
      console.log("Fetched leaves:", data);
      setLeaves(data.leaves || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch leaves");
    }
  },[]);

  const fetchCandidates = useCallback(async () => {
    try {
      const data = await getAllCandidates();
      setCandidates(data.candidates || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch candidates");
    }
  }, []);

  const fetchAttendanceData = useCallback(async () => {
    try {
      setAttendanceLoading(true);
      const data = await getAllEmployeesWithAttendance();

      if (Array.isArray(data)) {
        setAttendanceData(data);
      } else if (data && Array.isArray(data.employees)) {
        setAttendanceData(data.employees);
      } else if (data && Array.isArray(data.data)) {
        setAttendanceData(data.data);
      } else {
        console.warn("Attendance data is not in expected format:", data);
        setAttendanceData([]);
      }

      setError(null);
    } catch (err) {
      console.error("Fetch attendance error:", err);
      setError(err.message || "Failed to fetch attendance data");
      setAttendanceData([]); // Set to empty array on error
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);

      const expiry = Date.now() + 2 * 60 * 60 * 1000;

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token_expiry", expiry.toString());

      setUser(response.user);
      setIsAuthenticated(true);
      fetchCandidates();
      fetchEmployees();
      fetchAttendanceData();
      fetchLeaves();
      setError(null);
      return response;
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const response = await registerUser(userData);
      setError(null);
      return response;
    } catch (err) {
      setError(err.message || "Registration failed");
      throw err;
    }
  };

  const addCandidate = async (candidateData) => {
    try {
      const response = await createCandidate(candidateData);
      fetchCandidates();
      setError(null);
      return response;
    } catch (err) {
      setError(err.message || "Failed to add candidate");
      throw err;
    }
  };

  const addLeave=async(data)=>{
    console.log("Adding leave request with data:", data);
    try {
      const response = await createLeave(data);
      fetchLeaves();
      setError(null);
      return response;
    } catch (err) {
      setError(err.message || "Failed to add leave request");
      throw err;
    }
  }

  const updateLeaveStatus = async (leaveId, status) => {
    try {
      await updateLeave(leaveId, status);
      setLeaves((prev) =>
        prev.map((leave) =>
          leave._id === leaveId ? { ...leave, status: status } : leave
        )
      );
      setError(null);
    }
    catch (err) {
      setError(err.message || "Failed to update leave status");
      throw err;
    }
  }

  const removeCandidate = async (candidateId) => {
    try {
      await deleteCandidate(candidateId);
      setCandidates((prev) =>
        prev.filter((candidate) => candidate._id !== candidateId)
      );
      setError(null);
      return { success: true, message: "Candidate deleted successfully" };
    } catch (err) {
      setError(err.message || "Failed to delete candidate");
      throw err;
    }
  };

  const updateStatus = async (candidateId, newStatus, employeeData = {}) => {
    try {
      setStatusUpdateLoading((prev) => ({ ...prev, [candidateId]: true }));

      const response = await updateCandidateStatus(
        candidateId,
        newStatus,
        employeeData
      );

      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate._id === candidateId
            ? { ...candidate, status: newStatus }
            : candidate
        )
      );

      if (newStatus === "Selected") {
        fetchEmployees();
        fetchAttendanceData();
      }

      setError(null);
      return response;
    } catch (err) {
      setError(err.message || "Failed to update candidate status");
      throw err;
    } finally {
      setStatusUpdateLoading((prev) => ({ ...prev, [candidateId]: false }));
    }
  };

  const handleDownloadResume = async (candidateId, candidateName) => {
    try {
      console.log("AuthContext - handleDownloadResume called with:", {
        candidateId,
        candidateName,
      });

      if (!candidateId) {
        throw new Error("Candidate ID is required");
      }

      await downloadResume(candidateId, candidateName);
      setError(null);
      return { success: true, message: "Resume downloaded successfully" };
    } catch (err) {
      console.error("AuthContext - Download error:", err);
      setError(err.message || "Failed to download resume");
      throw err;
    }
  };

  const editEmployee = async (employeeId, employeeData) => {
    try {
      const response = await updateEmployee(employeeId, employeeData);
      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === employeeId ? { ...emp, ...employeeData } : emp
        )
      );
      setError(null);
      return response;
    } catch (err) {
      setError(err.message || "Failed to update employee");
      throw err;
    }
  };

  const removeEmployee = async (employeeId) => {
    try {
      await deleteEmployee(employeeId);
      setEmployees((prev) => prev.filter((emp) => emp._id !== employeeId));
      setError(null);
      return { success: true, message: "Employee deleted successfully" };
    } catch (err) {
      setError(err.message || "Failed to delete employee");
      throw err;
    }
  };

  const updateAttendance = async (employeeId, status) => {
    try {
      setStatusUpdateLoading((prev) => ({ ...prev, [employeeId]: true }));

      console.log(
        "Updating attendance for employee: 2 : ",
        employeeId,
        "with status:",
        status
      );
      const response = await updateAttendanceStatus(employeeId, status);

      setAttendanceData((prev) =>
        prev.map((emp) =>
          emp._id === employeeId
            ? { ...emp, status: status}
            : emp
        )
      );

      setError(null);
      return response;
    } catch (err) {
      console.error("Update attendance error:", err);
      setError(err.message || "Failed to update attendance");
      throw err;
    } finally {
      setStatusUpdateLoading((prev) => ({ ...prev, [employeeId]: false }));
    }
  };

  const handleDownloadDocument=async(leaveId)=>{
    try {
      console.log("AuthContext - handleDownloadResume called with:", {
        leaveId,
      });

      if (!leaveId) {
        throw new Error("Candidate ID is required");
      }

      await downloadDocument(leaveId);
      setError(null);
      return { success: true, message: "Resume downloaded successfully" };
    } catch (err) {
      console.error("AuthContext - Download error:", err);
      setError(err.message || "Failed to download resume");
      throw err;
    }
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("token_expiry");
    setUser(null);
    setIsAuthenticated(false);
    setCandidates([]);
    setEmployees([]);
    setAttendanceData([]);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        candidates,
        employees,
        attendanceData,
        employeeLoading,
        attendanceLoading,
        statusUpdateLoading,
        login,
        register,
        addCandidate,
        removeCandidate,
        updateStatus,
        handleDownloadResume,
        editEmployee,
        removeEmployee,
        updateAttendance,
        fetchEmployees,
        fetchAttendanceData,
        logout,
        fetchCandidates,
        addLeave,
        fetchLeaves,
        leaves,
        setLeaves,
        updateLeaveStatus,
        handleDownloadDocument
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
