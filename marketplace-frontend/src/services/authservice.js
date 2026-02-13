// authService.js
import api from "./api"

const authService = {
  // Login - Use uppercase /Auth/
  login: async (email, password) => {
    try {
      const response = await api.post("/Auth/login", { email, password })  // ✅ Changed from /auth/login
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Register Customer
  registerCustomer: async (customerData) => {
    try {
      const response = await api.post("/Auth/register/customer", customerData)  // ✅ Changed
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Register Seller
  registerSeller: async (sellerData) => {
    try {
      const response = await api.post("/Auth/register/seller", sellerData)  // ✅ Changed
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Register Delivery Staff
  registerDeliveryStaff: async (deliveryData) => {
    try {
      const response = await api.post("/Auth/register/delivery-staff", deliveryData)  // ✅ Changed
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Register Inventory Manager
  registerInventoryManager: async (inventoryData) => {
    try {
      const response = await api.post("/Auth/register/inventory-manager", inventoryData)  // ✅ Changed
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Register Support Staff
  registerSupportStaff: async (supportData) => {
    try {
      const response = await api.post("/Auth/register/support-staff", supportData)  // ✅ Changed
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Register Admin
  registerAdmin: async (adminData) => {
    try {
      const response = await api.post("/Auth/register/admin", adminData)  // ✅ Changed
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Forgot Password
  forgotPassword: async (email) => {
    try {
      const response = await api.post("/Auth/forgot-password", { email })  // ✅ Changed
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Reset Password
  resetPassword: async (email, verificationCode, newPassword, confirmPassword) => {
    try {
      const response = await api.post("/Auth/reset-password", {  // ✅ Changed
        email,
        verificationCode,
        newPassword,
        confirmPassword,
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get Current User
  getCurrentUser: async () => {
    try {
      const response = await api.get("/Auth/me")  // ✅ Changed
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await api.post("/Auth/logout")  // ✅ Changed
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export { authService }
export default authService