import api from "./api"

const customerService = {
  // Products
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value)
      }
    })
    const response = await api.get(`/Customer/products?${params.toString()}`)
    return response.data
  },

  getProductById: async (productId) => {
    const response = await api.get(`/Customer/products/${productId}`)
    return response.data
  },

  // Cart
  getCart: async () => {
    const response = await api.get("/Customer/cart")
    return response.data
  },

  addToCart: async (productId, quantity) => {
    const response = await api.post("/Customer/cart/add", {
      productId,
      quantity,
    })
    return response.data
  },

  updateCartItem: async (cartItemId, quantity) => {
    const response = await api.put(`/Customer/cart/items/${cartItemId}`, {
      quantity,
    })
    return response.data
  },

  removeCartItem: async (cartItemId) => {
    const response = await api.delete(`/Customer/cart/items/${cartItemId}`)
    return response.data
  },

  clearCart: async () => {
    const response = await api.delete("/Customer/cart/clear")
    return response.data
  },

  // Orders
  createOrder: async (orderData) => {
    const response = await api.post("/Customer/orders", orderData)
    return response.data
  },

  getOrders: async (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value)
      }
    })
    const response = await api.get(`/Customer/orders?${params.toString()}`)
    return response.data
  },

  getOrderById: async (orderId) => {
    const response = await api.get(`/Customer/orders/${orderId}`)
    return response.data
  },

  trackOrder: async (orderId) => {
    const response = await api.get(`/Customer/orders/${orderId}/track`)
    return response.data
  },

  cancelOrder: async (orderId, cancellationReason) => {
    const response = await api.post(`/Customer/orders/${orderId}/cancel`, {
      cancellationReason,
    })
    return response.data
  },

  confirmReceipt: async (orderId) => {
    const response = await api.post("/Customer/orders/confirm-receipt", {
      orderId,
    })
    return response.data
  },

  reportProblem: async (orderId, problemDescription) => {
    const response = await api.post("/Customer/orders/report-problem", {
      orderId,
      problemDescription,
    })
    return response.data
  },

  // Reviews
  canPostReview: async (productId, orderId) => {
    const response = await api.get(`/Customer/reviews/can-post?productId=${productId}&orderId=${orderId}`)
    return response.data
  },

  getReviewRateLimit: async () => {
    const response = await api.get("/Customer/reviews/rate-limit")
    return response.data
  },

  createReview: async (reviewData) => {
    const response = await api.post("/Customer/reviews", reviewData)
    return response.data
  },

  getMyReviews: async (pageNumber = 1, pageSize = 10) => {
    const response = await api.get(`/Customer/reviews?pageNumber=${pageNumber}&pageSize=${pageSize}`)
    return response.data
  },

  // Following
  followSeller: async (sellerId) => {
    const response = await api.post("/Customer/follow", { sellerId })
    return response.data
  },

  unfollowSeller: async (sellerId) => {
    const response = await api.delete(`/Customer/follow/${sellerId}`)
    return response.data
  },

  getFollowedSellers: async (pageNumber = 1, pageSize = 10) => {
    const response = await api.get(`/Customer/followed-sellers?pageNumber=${pageNumber}&pageSize=${pageSize}`)
    return response.data
  },

  getFollowedSellersProducts: async (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value)
      }
    })
    const response = await api.get(`/Customer/followed-sellers/products?${params.toString()}`)
    return response.data
  },

  checkFollowing: async (sellerId) => {
    const response = await api.get(`/Customer/follow/check/${sellerId}`)
    return response.data
  },

  // Profile
  getProfile: async () => {
    const response = await api.get("/Customer/profile")
    return response.data
  },

  updateProfile: async (profileData) => {
    const response = await api.put("/Customer/profile", profileData)
    return response.data
  },

  // ✅ NEW: Complaints/Communication
  getComplaints: async (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value)
      }
    })
    const response = await api.get(`/Customer/complaints?${params.toString()}`)
    return response.data
  },

  getComplaintDetails: async (complaintId) => {
    const response = await api.get(`/Customer/complaints/${complaintId}`)
    return response.data
  },

  createComplaint: async (complaintData) => {
    const response = await api.post("/Customer/complaints", complaintData)
    return response.data
  },

  replyToComplaint: async (complaintId, message) => {
    // ✅ FIXED: Use correct endpoint format with complaintId in URL
    const response = await api.post(`/Customer/complaints/${complaintId}/reply`, {
      complaintId,
      message,
    })
    return response.data
  },
}

export default customerService