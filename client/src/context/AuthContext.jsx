import React, { createContext, useState, useEffect } from "react";
import { loginUser, registerUser, getAllCandidates, createCandidate } from "../api/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      setUser(JSON.parse(localStorage.getItem("user") || null));
      fetchCandidates();
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
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setCandidates([]);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, error, candidates, login, register, addCandidate, logout, fetchCandidates }}>
      {children}
    </AuthContext.Provider>
  );
};