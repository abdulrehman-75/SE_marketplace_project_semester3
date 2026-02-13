"use client"

import { Navigate } from "react-router-dom"
import useAuth from "../hooks/useAuth"
import Loader from "../components/common/Loader"

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, getUserRole } = useAuth()
  
  console.log("🛡️ ProtectedRoute RENDER - Auth:", isAuthenticated, "Loading:", loading);

  // Show loader while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    )
  }

  // ✅ Use directly as boolean - NOT as function
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0) {
    const userRole = getUserRole()
    if (!allowedRoles.includes(userRole)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    }
  }

  return children
}

export default ProtectedRoute