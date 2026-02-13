import axios from "axios"
import { API_BASE_URL } from "../utils/constants"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor - Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor - Global error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("userInfo")
      localStorage.removeItem("user") // ✅ ADD THIS: Clear v0's key too
      window.location.href = "/login"
    }

    // ✅ ENHANCED: Better error message extraction
    let errorMessage = "An error occurred. Please try again."
    
    if (error.response) {
      // Try multiple paths to find error message
      errorMessage = 
        error.response.data?.message || 
        error.response.data?.errors?.[0] || 
        error.response.data?.error ||
        errorMessage
    } else if (error.request) {
      errorMessage = "No response from server. Please check your connection."
    } else {
      errorMessage = error.message || errorMessage
    }

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    })
  },
)

export default api