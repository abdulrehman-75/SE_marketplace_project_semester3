// services/deliveryStaffService.js
import api from "./api"

// ============================================
// NORMALIZATION FUNCTIONS
// ============================================

const normalizeProfile = (profile) => {
  if (!profile) return null
  
  return {
    id: profile.deliveryStaffId,
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    vehicleType: profile.vehicleType,
    vehicleNumber: profile.vehicleNumber,
    licenseNumber: profile.licenseNumber,
    assignedArea: profile.assignedArea,
    currentLocation: profile.currentLocation,
    isAvailable: profile.isAvailable,
    isActive: profile.isActive,
    dateJoined: profile.dateJoined,
    totalDeliveries: profile.totalDeliveries,
    successfulDeliveries: profile.successfulDeliveries,
    successRate: profile.successRate
  }
}

const normalizeAvailableOrder = (order) => {
  if (!order) return null
  
  return {
    id: order.orderId,
    orderDate: order.orderDate,
    grandTotal: order.grandTotal,
    orderStatus: order.orderStatus,
    deliveryAddress: order.deliveryAddress,
    deliveryCity: order.deliveryCity,
    customerPhone: order.customerPhone,
    customerName: order.customerName,
    totalItems: order.totalItems,
    isCOD: order.isCOD
  }
}

const normalizeAssignedOrder = (order) => {
  if (!order) return null
  
  return {
    id: order.orderId,
    orderDate: order.orderDate,
    totalAmount: order.totalAmount,
    buyerProtectionFee: order.buyerProtectionFee,
    grandTotal: order.grandTotal,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    deliveryAddress: order.deliveryAddress,
    deliveryCity: order.deliveryCity,
    deliveryPostalCode: order.deliveryPostalCode,
    customerPhone: order.customerPhone,
    deliveryDate: order.deliveryDate,
    customerName: order.customerName,
    totalItems: order.totalItems,
    orderItems: order.orderItems?.map(item => ({
      id: item.orderItemId,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
      sellerShopName: item.sellerShopName
    })) || []
  }
}

const normalizeDeliveryHistory = (history) => {
  if (!history) return null
  
  return {
    id: history.orderId,
    orderDate: history.orderDate,
    deliveryDate: history.deliveryDate,
    grandTotal: history.grandTotal,
    orderStatus: history.orderStatus,
    deliveryAddress: history.deliveryAddress,
    deliveryCity: history.deliveryCity,
    customerName: history.customerName,
    customerPhone: history.customerPhone,
    totalItems: history.totalItems,
    wasSuccessful: history.wasSuccessful
  }
}

const normalizeStats = (stats) => {
  if (!stats) return null
  
  return {
    totalDeliveries: stats.totalDeliveries || 0,
    successfulDeliveries: stats.successfulDeliveries || 0,
    pendingDeliveries: stats.pendingDeliveries || 0,
    todaysDeliveries: stats.todaysDeliveries || 0,
    successRate: stats.successRate || 0,
    totalAmountDelivered: stats.totalAmountDelivered || 0
  }
}

// ============================================
// DELIVERY STAFF SERVICE
// ============================================

const deliveryStaffService = {
  // ============================================
  // PROFILE MANAGEMENT
  // ============================================
  
  getProfile: async () => {
    try {
      const response = await api.get("/DeliveryStaff/profile")
      
      if (response.data?.success && response.data?.data) {
        return {
          data: normalizeProfile(response.data.data)
        }
      }
      
      return response.data
    } catch (error) {
      console.error("[DeliveryStaffService] Get Profile Error:", error)
      throw error
    }
  },

  updateProfile: async (profileData) => {
    try {
      const payload = {
        phone: profileData.phone,
        vehicleType: profileData.vehicleType,
        vehicleNumber: profileData.vehicleNumber,
        licenseNumber: profileData.licenseNumber,
        currentLocation: profileData.currentLocation
      }
      
      const response = await api.put("/DeliveryStaff/profile", payload)
      return response.data
    } catch (error) {
      console.error("[DeliveryStaffService] Update Profile Error:", error)
      throw error
    }
  },

  updateAvailability: async (availabilityData) => {
    try {
      const payload = {
        isAvailable: availabilityData.isAvailable,
        currentLocation: availabilityData.currentLocation
      }
      
      const response = await api.put("/DeliveryStaff/availability", payload)
      return response.data
    } catch (error) {
      console.error("[DeliveryStaffService] Update Availability Error:", error)
      throw error
    }
  },

  // ============================================
  // STATISTICS
  // ============================================
  
  getStatistics: async () => {
    try {
      const response = await api.get("/DeliveryStaff/statistics")
      
      if (response.data?.success && response.data?.data) {
        return {
          data: normalizeStats(response.data.data)
        }
      }
      
      return response.data
    } catch (error) {
      console.error("[DeliveryStaffService] Get Statistics Error:", error)
      throw error
    }
  },

  // ============================================
  // AVAILABLE ORDERS (SELF-ASSIGNMENT)
  // ============================================
  
  getAvailableOrders: async (filters = {}) => {
    try {
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value
        }
        return acc
      }, {})
      
      // ✅ FIXED: Correct endpoint is /DeliveryStaff/orders/available
      const response = await api.get("/DeliveryStaff/orders/available", { 
        params: cleanFilters 
      })
      
      if (response.data?.success && response.data?.data) {
        const apiData = response.data.data
        const normalizedItems = apiData.items?.map(normalizeAvailableOrder) || []
        
        return {
          data: {
            items: normalizedItems,
            pageNumber: apiData.pageNumber,
            pageSize: apiData.pageSize,
            totalCount: apiData.totalCount,
            totalPages: apiData.totalPages,
            hasPrevious: apiData.hasPrevious,
            hasNext: apiData.hasNext
          }
        }
      }
      
      return response.data
    } catch (error) {
      console.error("[DeliveryStaffService] Get Available Orders Error:", error)
      throw error
    }
  },

  selfAssignOrder: async (orderId) => {
    try {
      if (!orderId) throw new Error("Order ID is required")
      
      const payload = { orderId }
      // ✅ FIXED: Correct endpoint is /DeliveryStaff/orders/assign
      const response = await api.post("/DeliveryStaff/orders/assign", payload)
      return response.data
    } catch (error) {
      console.error("[DeliveryStaffService] Self Assign Order Error:", error)
      throw error
    }
  },

  // ============================================
  // ASSIGNED ORDERS MANAGEMENT
  // ============================================
  
  getMyAssignedOrders: async (filters = {}) => {
    try {
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value
        }
        return acc
      }, {})
      
      // ✅ FIXED: Correct endpoint is /DeliveryStaff/orders/assigned
      const response = await api.get("/DeliveryStaff/orders/assigned", { 
        params: cleanFilters 
      })
      
      if (response.data?.success && response.data?.data) {
        const apiData = response.data.data
        const normalizedItems = apiData.items?.map(normalizeAssignedOrder) || []
        
        return {
          data: {
            items: normalizedItems,
            pageNumber: apiData.pageNumber,
            pageSize: apiData.pageSize,
            totalCount: apiData.totalCount,
            totalPages: apiData.totalPages
          }
        }
      }
      
      return response.data
    } catch (error) {
      console.error("[DeliveryStaffService] Get My Orders Error:", error)
      throw error
    }
  },

  getOrderDetails: async (orderId) => {
    try {
      if (!orderId) throw new Error("Order ID is required")
      
      const response = await api.get(`/DeliveryStaff/orders/${orderId}`)
      
      if (response.data?.success && response.data?.data) {
        return {
          data: normalizeAssignedOrder(response.data.data)
        }
      }
      
      return response.data
    } catch (error) {
      console.error("[DeliveryStaffService] Get Order Details Error:", error)
      throw error
    }
  },

  // ============================================
  // ORDER STATUS UPDATES
  // ============================================
  
  updateOrderStatus: async (orderId, newStatus) => {
    try {
      if (!orderId) throw new Error("Order ID is required")
      if (!newStatus) throw new Error("New status is required")
      
      const payload = {
        orderId,
        newStatus
      }
      
      // ✅ FIXED: Correct endpoint is /DeliveryStaff/orders/status
      const response = await api.put("/DeliveryStaff/orders/status", payload)
      return response.data
    } catch (error) {
      console.error("[DeliveryStaffService] Update Order Status Error:", error)
      throw error
    }
  },

  markAsDelivered: async (orderId, deliveryNotes = "") => {
    try {
      if (!orderId) throw new Error("Order ID is required")
      
      const payload = {
        orderId,
        deliveryNotes
      }
      
      // ✅ FIXED: Correct endpoint is /DeliveryStaff/orders/deliver
      const response = await api.post("/DeliveryStaff/orders/deliver", payload)
      return response.data
    } catch (error) {
      console.error("[DeliveryStaffService] Mark As Delivered Error:", error)
      throw error
    }
  },

  unassignOrder: async (orderId, unassignReason) => {
    try {
      if (!orderId) throw new Error("Order ID is required")
      if (!unassignReason) throw new Error("Unassign reason is required")
      
      const payload = {
        orderId,
        unassignReason
      }
      
      // ✅ FIXED: Correct endpoint is /DeliveryStaff/orders/unassign
      const response = await api.post("/DeliveryStaff/orders/unassign", payload)
      return response.data
    } catch (error) {
      console.error("[DeliveryStaffService] Unassign Order Error:", error)
      throw error
    }
  },

  // ============================================
  // DELIVERY HISTORY
  // ============================================
  
  getDeliveryHistory: async (filters = {}) => {
    try {
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value
        }
        return acc
      }, {})
      
      const response = await api.get("/DeliveryStaff/history", { 
        params: cleanFilters 
      })
      
      if (response.data?.success && response.data?.data) {
        const apiData = response.data.data
        const normalizedItems = apiData.items?.map(normalizeDeliveryHistory) || []
        
        return {
          data: {
            items: normalizedItems,
            pageNumber: apiData.pageNumber,
            pageSize: apiData.pageSize,
            totalCount: apiData.totalCount,
            totalPages: apiData.totalPages
          }
        }
      }
      
      return response.data
    } catch (error) {
      console.error("[DeliveryStaffService] Get Delivery History Error:", error)
      throw error
    }
  }
}

export default deliveryStaffService