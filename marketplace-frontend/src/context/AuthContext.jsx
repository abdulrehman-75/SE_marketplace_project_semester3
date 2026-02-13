"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { ROLE_ROUTES } from "../utils/constants"
import authService from "../services/authService"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    console.log("🔄 AuthContext useEffect RUNNING");
    const storedToken = localStorage.getItem("token")
    
    // ✅ CHANGE 1: Check BOTH storage keys (your key first for backwards compatibility)
    let storedUserInfo = localStorage.getItem("userInfo")
    if (!storedUserInfo) {
      storedUserInfo = localStorage.getItem("user")
    }
    
    console.log("📦 Token:", storedToken ? "EXISTS" : "NULL");
    console.log("📦 UserInfo:", storedUserInfo ? "EXISTS" : "NULL");

    if (storedToken && storedUserInfo) {
      setToken(storedToken)
      setUser(JSON.parse(storedUserInfo))
    }
    setLoading(false)
    console.log("✅ AuthContext useEffect COMPLETE");
  }, [])

  // Login
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)

      if (response.success && response.token && response.userInfo) {
        // ✅ CHANGE 2: Store in BOTH keys for compatibility
        localStorage.setItem("token", response.token)
        localStorage.setItem("userInfo", JSON.stringify(response.userInfo))
        localStorage.setItem("user", JSON.stringify(response.userInfo)) // NEW: For v0 compatibility

        setToken(response.token)
        setUser(response.userInfo)

        return {
          success: true,
          redirectTo: ROLE_ROUTES[response.userInfo.role] || "/",
        }
      } else {
        throw new Error(response.message || "Login failed")
      }
    } catch (error) {
      throw error
    }
  }

  // Logout
  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // ✅ CHANGE 3: Clear BOTH keys
      localStorage.removeItem("token")
      localStorage.removeItem("userInfo")
      localStorage.removeItem("user") // NEW: Clear v0's key too
      setToken(null)
      setUser(null)
    }
  }

  // ✅ Already correct: boolean value, NOT a function
  const isAuthenticated = !!token && !!user

  // Get user role
  const getUserRole = () => {
    return user?.role || null
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated,  // ✅ Already a boolean, perfect!
    login,
    logout,
    getUserRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export default AuthContext