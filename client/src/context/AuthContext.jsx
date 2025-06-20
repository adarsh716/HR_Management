"use client"

import { createContext, useState, useEffect, useCallback } from "react"
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
} from "../api/auth"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [employees, setEmployees] = useState([])
  const [statusUpdateLoading, setStatusUpdateLoading] = useState({})
  const [employeeLoading, setEmployeeLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const expiry = localStorage.getItem("token_expiry")
    if (token) {
      setIsAuthenticated(true)
      setUser(JSON.parse(localStorage.getItem("user") || null))
      fetchCandidates()
      fetchEmployees()
    }
    if (expiry && Date.now() > Number.parseInt(expiry)) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("token_expiry")
      setIsAuthenticated(false)
      setUser(null)
      setCandidates([])
      setEmployees([])
      setError("Session expired, please log in again.")
    }
    setLoading(false)
  }, []) // Remove fetchEmployees from dependency array

  // Add useCallback to make fetchEmployees stable
  const fetchEmployees = useCallback(async () => {
    try {
      setEmployeeLoading(true)
      const data = await getAllEmployees()
      setEmployees(data.employees || [])
      setError(null)
    } catch (err) {
      setError(err.message || "Failed to fetch employees")
    } finally {
      setEmployeeLoading(false)
    }
  }, [])

  const fetchCandidates = useCallback(async () => {
    try {
      const data = await getAllCandidates()
      setCandidates(data.candidates || [])
      setError(null)
    } catch (err) {
      setError(err.message || "Failed to fetch candidates")
    }
  }, [])

  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials)

      const expiry = Date.now() + 2 * 60 * 60 * 1000

      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("token_expiry", expiry.toString())

      setUser(response.user)
      setIsAuthenticated(true)
      fetchCandidates()
      fetchEmployees()
      setError(null)
      return response
    } catch (err) {
      setError(err.message || "Login failed")
      throw err
    }
  }

  const register = async (userData) => {
    try {
      const response = await registerUser(userData)
      setError(null)
      return response
    } catch (err) {
      setError(err.message || "Registration failed")
      throw err
    }
  }

  const addCandidate = async (candidateData) => {
    try {
      const response = await createCandidate(candidateData)
      fetchCandidates()
      setError(null)
      return response
    } catch (err) {
      setError(err.message || "Failed to add candidate")
      throw err
    }
  }

  const removeCandidate = async (candidateId) => {
    try {
      await deleteCandidate(candidateId)
      setCandidates((prev) => prev.filter((candidate) => candidate._id !== candidateId))
      setError(null)
      return { success: true, message: "Candidate deleted successfully" }
    } catch (err) {
      setError(err.message || "Failed to delete candidate")
      throw err
    }
  }

  const updateStatus = async (candidateId, newStatus, employeeData = {}) => {
    try {
      setStatusUpdateLoading((prev) => ({ ...prev, [candidateId]: true }))

      const response = await updateCandidateStatus(candidateId, newStatus, employeeData)

      setCandidates((prev) =>
        prev.map((candidate) => (candidate._id === candidateId ? { ...candidate, status: newStatus } : candidate)),
      )

      // If employee was created, refresh employees list
      if (newStatus === "Selected") {
        fetchEmployees()
      }

      setError(null)
      return response
    } catch (err) {
      setError(err.message || "Failed to update candidate status")
      throw err
    } finally {
      setStatusUpdateLoading((prev) => ({ ...prev, [candidateId]: false }))
    }
  }

  const handleDownloadResume = async (candidateId, candidateName) => {
    try {
      console.log("AuthContext - handleDownloadResume called with:", {
        candidateId,
        candidateName,
      })

      if (!candidateId) {
        throw new Error("Candidate ID is required")
      }

      await downloadResume(candidateId, candidateName)
      setError(null)
      return { success: true, message: "Resume downloaded successfully" }
    } catch (err) {
      console.error("AuthContext - Download error:", err)
      setError(err.message || "Failed to download resume")
      throw err
    }
  }

  const editEmployee = async (employeeId, employeeData) => {
    try {
      const response = await updateEmployee(employeeId, employeeData)
      setEmployees((prev) => prev.map((emp) => (emp._id === employeeId ? { ...emp, ...employeeData } : emp)))
      setError(null)
      return response
    } catch (err) {
      setError(err.message || "Failed to update employee")
      throw err
    }
  }

  const removeEmployee = async (employeeId) => {
    try {
      await deleteEmployee(employeeId)
      setEmployees((prev) => prev.filter((emp) => emp._id !== employeeId))
      setError(null)
      return { success: true, message: "Employee deleted successfully" }
    } catch (err) {
      setError(err.message || "Failed to delete employee")
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("token_expiry")
    setUser(null)
    setIsAuthenticated(false)
    setCandidates([])
    setEmployees([])
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        candidates,
        employees,
        employeeLoading,
        statusUpdateLoading,
        login,
        register,
        addCandidate,
        removeCandidate,
        updateStatus,
        handleDownloadResume,
        editEmployee,
        removeEmployee,
        fetchEmployees,
        logout,
        fetchCandidates,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
