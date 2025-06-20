"use client";

import { createContext, useState, useEffect } from "react";
import {
  loginUser,
  registerUser,
  getAllCandidates,
  createCandidate,
  deleteCandidate,
  updateCandidateStatus,
  downloadResume,
} from "../api/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
     const expiry = localStorage.getItem("token_expiry");
    if (token) {
      setIsAuthenticated(true);
      setUser(JSON.parse(localStorage.getItem("user") || null));
      fetchCandidates();
    }
    if (expiry && Date.now() > parseInt(expiry)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("token_expiry");
      setIsAuthenticated(false);
      setUser(null);
      setCandidates([]);
      setError("Session expired, please log in again.");
    }
    setLoading(false);
  }, []);

  const fetchCandidates = async () => {
    try {
      const data = await getAllCandidates();
      setCandidates(data.candidates || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch candidates");
    }
  };

  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);

      const expiry = Date.now() +  2 * 60 * 60 * 1000; 

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token_expiry", expiry.toString()); // store expiry

      setUser(response.user);
      setIsAuthenticated(true);
      fetchCandidates();
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

  const updateStatus = async (candidateId, newStatus) => {
    try {
      // Set loading state for this specific candidate
      setStatusUpdateLoading((prev) => ({ ...prev, [candidateId]: true }));

      // Call API to update status
      const response = await updateCandidateStatus(candidateId, newStatus);

      // Update local state with the response
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate._id === candidateId
            ? { ...candidate, status: newStatus }
            : candidate
        )
      );

      setError(null);
      return response;
    } catch (err) {
      setError(err.message || "Failed to update candidate status");
      throw err;
    } finally {
      // Clear loading state
      setStatusUpdateLoading((prev) => ({ ...prev, [candidateId]: false }));
    }
  };

  const handleDownloadResume = async (candidateId, candidateName) => {
    try {
      console.log("AuthContext - handleDownloadResume called with:", {
        candidateId,
        candidateName,
      }); // Debug log

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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setCandidates([]);
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
        statusUpdateLoading,
        login,
        register,
        addCandidate,
        removeCandidate,
        updateStatus,
        handleDownloadResume,
        logout,
        fetchCandidates,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
