import api from "./api"

const adminService = {
  // Dashboard
  getDashboard: () => api.get("/Admin/dashboard"),
  
  // Sellers
  getSellers: (params) => api.get("/Admin/sellers", { params }),
  getSellerById: (id) => api.get(`/Admin/sellers/${id}`),
  createSeller: (data) => api.post("/Admin/sellers", data),
  updateSellerStatus: (data) => api.patch("/Admin/sellers/status", data),
  deleteSeller: (id) => api.delete(`/Admin/sellers/${id}`),

  // Customers
  getCustomers: (params) => api.get("/Admin/customers", { params }),
  getCustomerById: (id) => api.get(`/Admin/customers/${id}`),

  // Orders
  getOrders: (params) => api.get("/Admin/orders", { params }),
  getOrderById: (id) => api.get(`/Admin/orders/${id}`),
  confirmOrder: (orderId, data) => api.post(`/Admin/orders/${orderId}/confirm`, data),

  // Payments
  getPayments: (params) => api.get("/Admin/payments", { params }),
  manualPaymentAction: (data) => api.post("/Admin/payments/manual-action", data),

  // Categories
  getCategories: () => api.get("/Admin/categories"),
  createCategory: (data) => api.post("/Admin/categories", data),
  updateCategory: (data) => api.put("/Admin/categories", data),
  deleteCategory: (id) => api.delete(`/Admin/categories/${id}`),
  uploadCategoryImage: (id, formData) =>
    api.post(`/Admin/categories/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Products
  getProducts: (params) => api.get("/Admin/products", { params }),
  updateProductStatus: (data) => api.patch("/Admin/products/status", data),

  // Reviews
  getReviews: (params) => api.get("/Admin/reviews", { params }),
  moderateReview: (data) => api.post("/Admin/reviews/moderate", data),

  // Staff
  getDeliveryStaff: () => api.get("/Admin/staff/delivery"),
  getSupportStaff: () => api.get("/Admin/staff/support"),
  getInventoryManagers: () => api.get("/Admin/staff/inventory"),
  updateStaffStatus: (staffType, staffId, isActive) =>
    api.patch(`/Admin/staff/${staffType}/${staffId}/status`, { isActive }),

  // Complaints
  getComplaints: (params) => api.get("/Admin/complaints", { params }),

  // Reports
  generateSalesReport: (data) => api.post("/Admin/reports/sales", data),

  // System Config
  getSystemConfig: () => api.get("/Admin/config"),
  updateSystemConfig: (data) => api.put("/Admin/config", data),
}

export default adminService