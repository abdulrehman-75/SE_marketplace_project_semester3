// services/supportStaffService.js
import api from "./api"

// ============================================
// NORMALIZATION FUNCTIONS
// ============================================

const normalizeProfile = (profile) => {
  if (!profile) return null
  
  return {
    id: profile.supportStaffId,
    fullName: profile.fullName,
    email: profile.email,
    employeeCode: profile.employeeCode,
    department: profile.department,
    phone: profile.phone,
    specialization: profile.specialization,
    isActive: profile.isActive,
    dateJoined: profile.dateJoined,
    totalCasesHandled: profile.totalCasesHandled,
    activeCases: profile.activeCases
  }
}

const normalizeComplaint = (complaint) => {
  if (!complaint) return null
  
  return {
    id: complaint.complaintId,
    orderId: complaint.orderId,
    customerId: complaint.customerId,
    customerName: complaint.customerName,
    complaintType: complaint.complaintType,
    status: complaint.status,
    priority: complaint.priority,
    dateReported: complaint.dateReported,
    assignedSupportStaffId: complaint.assignedSupportStaffId,
    assignedStaffName: complaint.assignedStaffName,
    isAssignedToMe: complaint.isAssignedToMe,
    shortDescription: complaint.shortDescription
  }
}

const normalizeComplaintDetail = (complaint) => {
  if (!complaint) return null
  
  return {
    id: complaint.complaintId,
    orderId: complaint.orderId,
    complaintType: complaint.complaintType,
    description: complaint.description,
    status: complaint.status,
    priority: complaint.priority,
    dateReported: complaint.dateReported,
    resolvedDate: complaint.resolvedDate,
    resolutionNotes: complaint.resolutionNotes,
    attachedImages: complaint.attachedImages,
    customerId: complaint.customerId,
    customerName: complaint.customerName,
    customerEmail: complaint.customerEmail,
    customerPhone: complaint.customerPhone,
    assignedSupportStaffId: complaint.assignedSupportStaffId,
    assignedStaffName: complaint.assignedStaffName,
    order: complaint.order ? {
      id: complaint.order.orderId,
      orderDate: complaint.order.orderDate,
      grandTotal: complaint.order.grandTotal,
      orderStatus: complaint.order.orderStatus,
      paymentStatus: complaint.order.paymentStatus,
      deliveryDate: complaint.order.deliveryDate,
      problemDescription: complaint.order.problemDescription,
      orderItems: complaint.order.orderItems?.map(item => ({
        id: item.orderItemId,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        sellerId: item.sellerId,
        sellerShopName: item.sellerShopName
      })) || [],
      sellers: complaint.order.sellers?.map(seller => ({
        id: seller.sellerId,
        shopName: seller.shopName,
        contactEmail: seller.contactEmail,
        contactPhone: seller.contactPhone,
        overallRating: seller.overallRating
      })) || []
    } : null,
    conversation: complaint.conversation?.map(msg => ({
      id: msg.messageId,
      senderType: msg.senderType,
      senderName: msg.senderName,
      message: msg.message,
      timestamp: msg.timestamp,
      isInternal: msg.isInternal
    })) || []
  }
}

const normalizeStats = (stats) => {
  if (!stats) return null
  
  return {
    totalCasesHandled: stats.totalCasesHandled || 0,
    activeCases: stats.activeCases || 0,
    resolvedCases: stats.resolvedCases || 0,
    escalatedCases: stats.escalatedCases || 0,
    todaysCases: stats.todaysCases || 0,
    resolutionRate: stats.resolutionRate || 0,
    complaintsByStatus: {
      open: stats.complaintsByStatus?.open || 0,
      inProgress: stats.complaintsByStatus?.inProgress || 0,
      resolved: stats.complaintsByStatus?.resolved || 0,
      closed: stats.complaintsByStatus?.closed || 0,
      escalated: stats.complaintsByStatus?.escalated || 0
    },
    complaintsByPriority: {
      low: stats.complaintsByPriority?.low || 0,
      medium: stats.complaintsByPriority?.medium || 0,
      high: stats.complaintsByPriority?.high || 0,
      urgent: stats.complaintsByPriority?.urgent || 0
    }
  }
}

const normalizeCustomerOrderHistory = (history) => {
  if (!history) return null
  
  return {
    customerId: history.customerId,
    customerName: history.customerName,
    totalOrders: history.totalOrders,
    totalSpent: history.totalSpent,
    orders: history.orders?.map(order => ({
      id: order.orderId,
      orderDate: order.orderDate,
      grandTotal: order.grandTotal,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      hasComplaint: order.hasComplaint,
      totalItems: order.totalItems
    })) || []
  }
}

// ============================================
// SUPPORT STAFF SERVICE
// ============================================

const supportStaffService = {
  // ============================================
  // PROFILE MANAGEMENT
  // ============================================
  
  getProfile: async () => {
    try {
      const response = await api.get("/SupportStaff/profile")
      
      if (response.data?.success && response.data?.data) {
        return {
          data: normalizeProfile(response.data.data)
        }
      }
      
      return response.data
    } catch (error) {
      console.error("[SupportStaffService] Get Profile Error:", error)
      throw error
    }
  },

  updateProfile: async (profileData) => {
    try {
      const payload = {
        phone: profileData.phone,
        specialization: profileData.specialization
      }
      
      const response = await api.put("/SupportStaff/profile", payload)
      return response.data
    } catch (error) {
      console.error("[SupportStaffService] Update Profile Error:", error)
      throw error
    }
  },

  // ============================================
  // STATISTICS
  // ============================================
  
  getStatistics: async () => {
    try {
      const response = await api.get("/SupportStaff/statistics")
      
      if (response.data?.success && response.data?.data) {
        return {
          data: normalizeStats(response.data.data)
        }
      }
      
      return response.data
    } catch (error) {
      console.error("[SupportStaffService] Get Statistics Error:", error)
      throw error
    }
  },

  // ============================================
  // COMPLAINTS MANAGEMENT
  // ============================================
  
  getComplaints: async (filters = {}) => {
    try {
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value
        }
        return acc
      }, {})
      
      const response = await api.get("/SupportStaff/complaints", { params: cleanFilters })
      
      if (response.data?.success && response.data?.data) {
        const apiData = response.data.data
        const normalizedItems = apiData.items?.map(normalizeComplaint) || []
        
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
      console.error("[SupportStaffService] Get Complaints Error:", error)
      throw error
    }
  },

  getComplaintById: async (id) => {
    try {
      if (!id) throw new Error("Complaint ID is required")
      const response = await api.get(`/SupportStaff/complaints/${id}`)
      
      if (response.data?.success && response.data?.data) {
        return {
          data: normalizeComplaintDetail(response.data.data)
        }
      }
      
      return response.data
    } catch (error) {
      console.error("[SupportStaffService] Get Complaint Error:", error)
      throw error
    }
  },

  // ============================================
  // COMPLAINT ACTIONS
  // ============================================
  
  selfAssignComplaint: async (complaintId) => {
    try {
      if (!complaintId) throw new Error("Complaint ID is required")
      
      const payload = { complaintId }
      const response = await api.post("/SupportStaff/complaints/assign", payload)
      return response.data
    } catch (error) {
      console.error("[SupportStaffService] Self Assign Error:", error)
      throw error
    }
  },

  updateComplaintStatus: async (complaintId, newStatus) => {
    try {
      if (!complaintId) throw new Error("Complaint ID is required")
      if (!newStatus) throw new Error("Status is required")
      
      const payload = {
        complaintId,
        newStatus
      }
      
      const response = await api.put("/SupportStaff/complaints/status", payload)
      return response.data
    } catch (error) {
      console.error("[SupportStaffService] Update Status Error:", error)
      throw error
    }
  },

  updateComplaintPriority: async (complaintId, priority) => {
    try {
      if (!complaintId) throw new Error("Complaint ID is required")
      if (!priority) throw new Error("Priority is required")
      
      const payload = {
        complaintId,
        priority
      }
      
      const response = await api.put("/SupportStaff/complaints/priority", payload)
      return response.data
    } catch (error) {
      console.error("[SupportStaffService] Update Priority Error:", error)
      throw error
    }
  },

  addComplaintNote: async (complaintId, message, isInternal = false) => {
    try {
      if (!complaintId) throw new Error("Complaint ID is required")
      if (!message) throw new Error("Message is required")
      
      const payload = {
        complaintId,
        message,
        isInternal
      }
      
      const response = await api.post("/SupportStaff/complaints/notes", payload)
      return response.data
    } catch (error) {
      console.error("[SupportStaffService] Add Note Error:", error)
      throw error
    }
  },

  resolveComplaint: async (complaintId, resolutionNotes, notifyCustomer = true) => {
    try {
      if (!complaintId) throw new Error("Complaint ID is required")
      if (!resolutionNotes) throw new Error("Resolution notes are required")
      
      const payload = {
        complaintId,
        resolutionNotes,
        notifyCustomer
      }
      
      const response = await api.post("/SupportStaff/complaints/resolve", payload)
      return response.data
    } catch (error) {
      console.error("[SupportStaffService] Resolve Complaint Error:", error)
      throw error
    }
  },

  escalateToAdmin: async (complaintId, escalationReason) => {
    try {
      if (!complaintId) throw new Error("Complaint ID is required")
      if (!escalationReason) throw new Error("Escalation reason is required")
      
      const payload = {
        complaintId,
        escalationReason
      }
      
      const response = await api.post("/SupportStaff/complaints/escalate", payload)
      return response.data
    } catch (error) {
      console.error("[SupportStaffService] Escalate Error:", error)
      throw error
    }
  },

  deEscalateComplaint: async (complaintId, deEscalationNotes, reassignToMe = true) => {
    try {
      if (!complaintId) throw new Error("Complaint ID is required")
      if (!deEscalationNotes) throw new Error("De-escalation notes are required")
      
      const payload = {
        complaintId,
        deEscalationNotes,
        reassignToMe
      }
      
      const response = await api.post("/SupportStaff/complaints/deescalate", payload)
      return response.data
    } catch (error) {
      console.error("[SupportStaffService] De-escalate Error:", error)
      throw error
    }
  },

  // ============================================
  // CUSTOMER ORDER HISTORY
  // ============================================
  
  getCustomerOrderHistory: async (customerId) => {
    try {
      if (!customerId) throw new Error("Customer ID is required")
      const response = await api.get(`/SupportStaff/customers/${customerId}/orders`)
      
      if (response.data?.success && response.data?.data) {
        return {
          data: normalizeCustomerOrderHistory(response.data.data)
        }
      }
      
      return response.data
    } catch (error) {
      console.error("[SupportStaffService] Get Customer Order History Error:", error)
      throw error
    }
  }
}

export default supportStaffService