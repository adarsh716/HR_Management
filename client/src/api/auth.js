import apiClient from "../service/apiclient"

export const loginUser = async ({ email, password }) => {
  try {
    const response = await apiClient.post("/api/auth/login", { email, password })
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}

export const registerUser = async ({ fullname, email, password, role }) => {
  try {
    console.log("Registration response:", { fullname, email, password, role })
    const response = await apiClient.post("/api/auth/register", { fullname, email, password, role })
    return response.data
  } catch (error) {
    console.error("Registration error:", error)
    throw error.response ? error.response.data : error.message
  }
}

export const getAllCandidates = async () => {
  try {
    const response = await apiClient.get("/api/candidate/fetch")
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}

export const createCandidate = async ({ name, email, phone, position, experience, resume }) => {
  try {
    const formData = new FormData()
    formData.append("name", name)
    formData.append("email", email)
    formData.append("phone", phone)
    formData.append("position", position)
    formData.append("experience", experience)
    if (resume) formData.append("resume", resume)

    const response = await apiClient.post("/api/candidate/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}

export const deleteCandidate = async (candidateId) => {
  try {
    const response = await apiClient.delete(`/api/candidate/delete/${candidateId}`)
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}

export const updateCandidateStatus = async (candidateId, status) => {
  try {
    const response = await apiClient.patch(`/api/candidate/updatestatus/${candidateId}`, {
      status: status,
    })
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}


export const downloadResume = async (candidateId, candidateName) => {
  try {
    const response = await apiClient.get(`/api/candidate/download-resume/${candidateId}`, {
      responseType: 'blob', 
    })

    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url

    const contentDisposition = response.headers['content-disposition']
    let filename = `${candidateName.replace(/\s+/g, "_")}_resume.pdf`
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }

    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return { success: true, message: "Resume downloaded successfully" }
  } catch (error) {
    console.error("Download error:", error)
    throw new Error("Failed to download resume: " + (error.response?.data?.message || error.message))
  }
}

export const getAllEmployees = async () => {
  try {
    const response = await apiClient.get("/api/employees")
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}

export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const response = await apiClient.put(`/api/employees/${employeeId}`, employeeData)
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}

export const deleteEmployee = async (employeeId) => {
  try {
    const response = await apiClient.delete(`/api/employees/${employeeId}`)
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}

export const getAllEmployeesWithAttendance = async () => {
  try {
    const response = await apiClient.get("/api/attendance/")
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}

export const updateAttendanceStatus = async (employeeId, status) => {
  try {
    console.log("Updating attendance for employee: 3 : ", employeeId, "with status:", status);
    const response = await apiClient.put(`/api/attendance/${employeeId}`, { status })
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}

export const getAllLeaves = async () => {
  try {
    const response = await apiClient.get("/api/leave/leaves/fetch");
    console.log("Fetched all leaves:", response.data)
    return response.data
  }
  catch (error) {
    throw error.response ? error.response.data : error.message
  }
}

export const createLeave=async({employeeId,leaveDate, reason,documents})=>{
  console.log("Creating leave request with data:", { employeeId, leaveDate, reason, documents })

  try {
    const formData = new FormData()
    formData.append("employeeId", employeeId)
    formData.append("leaveDate", leaveDate)
    formData.append("reason", reason)
    if (documents) formData.append("document", documents)

    const response = await apiClient.post("/api/leave/leaves", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }

}

export const updateLeave = async (leaveId, status) => {
  console.log("Updating leave status for leaveId:", leaveId, "with status:", status)
  try {
    const response = await apiClient.patch(`/api/leave/leaves/${leaveId}`, {
      status: status,
    })
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}

export const getLeaveStatistics = async (month, year) => {
  try {
    const response = await apiClient.get(`/api/leave/leaves/statistics?month=${month}&year=${year}`)
    console.log("Fetched leave statistics:", response.data)
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : error.message
  }
}

export const downloadDocument = async (leaveId) => {
  try {

    const response = await apiClient.get(`/api/leave/download-document/${leaveId}`, {
      responseType: 'blob', 
    })

    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url

    const contentDisposition = response.headers['content-disposition']
    let filename = `${leaveId.replace(/\s+/g, "_")}_document.pdf`

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }

    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return { success: true, message: "Document downloaded successfully" }
  } catch (error) {
    console.error("Download error:", error)
    throw new Error("Failed to download resume: " + (error.response?.data?.message || error.message))
  }
}