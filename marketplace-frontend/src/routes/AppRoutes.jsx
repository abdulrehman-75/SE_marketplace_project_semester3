"use client";

import { Routes, Route, Navigate } from "react-router-dom";
import { USER_ROLES } from "../utils/constants";
import useAuth from "../hooks/useAuth";
import ProtectedRoute from "./ProtectedRoute";

// Auth Pages
import Login from "../pages/auth/login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import RegisterCustomer from "../pages/auth/RegisterCustomer";
import RegisterSeller from "../pages/auth/RegisterSeller";

// Dashboard Placeholders
import AdminDashboard from "../pages/dashboards/AdminDashboard";
import SellerDashboard from "../pages/dashboards/SellerDashboard";
import CustomerDashboard from "../pages/dashboards/CustomerDashboard";
import DeliveryDashboard from "../pages/dashboards/DeliveryDashboard";
import SupportDashboard from "../pages/dashboards/SupportDashboard";
import InventoryDashboard from "../pages/dashboards/InventoryDashboard";

const AppRoutes = () => {
  const { isAuthenticated, loading, getUserRole } = useAuth();

  console.log(
    "🔍 AppRoutes - Auth:",
    isAuthenticated,
    "Role:",
    getUserRole(),
    "Loading:",
    loading
  );

  // Show nothing while checking auth
  if (loading) {
    return null;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate
              to={`/${getUserRole()?.toLowerCase() || "customer"}`}
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/register/customer"
        element={
          isAuthenticated ? (
            <Navigate
              to={`/${getUserRole()?.toLowerCase() || "customer"}`}
              replace
            />
          ) : (
            <RegisterCustomer />
          )
        }
      />

      <Route
        path="/register/seller"
        element={
          isAuthenticated ? (
            <Navigate
              to={`/${getUserRole()?.toLowerCase() || "seller"}`}
              replace
            />
          ) : (
            <RegisterSeller />
          )
        }
      />

      {/* Protected Dashboard Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.SELLER]}>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Customer Portal - Uses Layout with nested routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Staff Routes - Note the paths */}
      <Route
        path="/deliverystaff"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.DELIVERY_STAFF]}>
            <DeliveryDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/supportstaff"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.SUPPORT_STAFF]}>
            <SupportDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventorymanager"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.INVENTORY_MANAGER]}>
            <InventoryDashboard />
          </ProtectedRoute>
        }
      />

      {/* Root Route - Redirect based on auth status */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate
              to={`/${getUserRole()?.toLowerCase() || "customer"}`}
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404 Not Found */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="mb-2 text-4xl font-bold text-gray-900">404</h1>
              <p className="text-gray-600">Page not found</p>
              <p className="mt-2 text-sm text-gray-500">
                Current role: {getUserRole() || "Not logged in"}
              </p>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;