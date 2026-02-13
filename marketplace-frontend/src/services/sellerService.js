// services/sellerService.js
import api from "./api"

// ✅ FIXED: Normalize product data to match backend DTOs exactly
const normalizeProduct = (product) => {
  if (!product) return null
  
  return {
    id: product.productId,
    name: product.productName,
    description: product.description,
    price: product.price,
    stock: product.stockQuantity,
    categoryId: product.categoryId,
    categoryName: product.categoryName,
    imageUrl: product.productImage,
    isActive: product.isActive,
    createdAt: product.dateListed,
    totalSales: product.totalSales || 0,
    averageRating: product.averageRating || 0,
    totalReviews: product.totalReviews || 0,
    isLowStock: product.isLowStock || false,
    lowStockThreshold: product.lowStockThreshold || 10
  }
}

// ✅ FIXED: Normalize order data to match backend DTOs exactly
const normalizeOrder = (order) => {
  if (!order) return null
  
  return {
    id: order.orderId,
    createdAt: order.orderDate,
    status: order.orderStatus,
    paymentStatus: order.paymentStatus,
    totalAmount: order.grandTotal,
    customerId: order.customerId,
    customerName: order.customerName,
    customerEmail: order.customerEmail || "N/A",
    customerPhone: order.customerPhone,
    deliveryAddress: order.deliveryAddress,
    city: order.deliveryCity,
    state: order.deliveryState || "",
    zipCode: order.deliveryPostalCode,
    country: order.deliveryCountry || "",
    deliveryDate: order.deliveryDate,
    totalItems: order.myItemsCount,
    myOrderItems: order.myOrderItems?.map(item => ({
      id: item.orderItemId,
      productId: item.productId,
      productName: item.productName,
      productImageUrl: item.productImage,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
      sellerId: item.sellerId,
      sellerName: item.sellerShopName,
      isMine: item.isMyProduct
    })) || [],
    allOrderItems: order.allOrderItems?.map(item => ({
      id: item.orderItemId,
      productId: item.productId,
      productName: item.productName,
      productImageUrl: item.productImage,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
      sellerId: item.sellerId,
      sellerName: item.sellerShopName,
      isMine: item.isMyProduct
    })) || []
  }
}

// ✅ FIXED: Normalize category data
const normalizeCategory = (category) => {
  if (!category) return null
  
  return {
    id: category.categoryId,
    name: category.categoryName,
    description: category.description,
    parentCategoryId: category.parentCategoryId,
    parentCategoryName: category.parentCategoryName,
    isActive: category.isActive
  }
}

// ✅ FIXED: Normalize payment verification data
const normalizePayment = (payment) => {
  if (!payment) return null
  
  return {
    id: payment.verificationId,
    orderId: payment.orderId,
    amount: payment.amount,
    status: payment.status,
    daysRemaining: payment.daysRemaining,
    createdAt: payment.verificationStartDate,
    verificationEndDate: payment.verificationEndDate,
    customerAction: payment.customerAction,
    actionDate: payment.actionDate,
    releasedDate: payment.releasedDate,
    isExpired: payment.isExpired,
    orderStatus: payment.orderStatus,
    customerName: payment.customerName
  }
}

// ✅ FIXED: Normalize follower data
const normalizeFollower = (follower) => {
  if (!follower) return null
  
  return {
    id: follower.followerId,
    customerId: follower.customerId,
    name: follower.customerName,
    email: follower.customerEmail,
    followedAt: follower.dateFollowed,
    notificationsEnabled: follower.notificationsEnabled,
    totalOrders: follower.totalOrders || 0,
    totalSpent: follower.totalSpent || 0
  }
}

const sellerService = {
  // ============================================
  // PROFILE & DASHBOARD
  // ============================================
  
  getProfile: async () => {
    try {
      const response = await api.get("/Seller/profile")
      
      if (response.data?.success && response.data?.data) {
        const profile = response.data.data
        return {
          data: {
            shopName: profile.shopName,
            description: profile.shopDescription,
            logoUrl: profile.shopLogo,
            address: profile.address,
            city: profile.city,
            state: profile.state || "",
            zipCode: profile.zipCode || "",
            country: profile.country,
            phoneNumber: profile.contactPhone,
            email: profile.contactEmail || profile.email,
            website: profile.website || "",
            totalProducts: profile.totalProducts,
            totalSales: profile.totalOrders,
            totalRevenue: profile.totalSales,
            averageRating: profile.overallRating,
            totalReviews: profile.totalReviews,
            totalFollowers: profile.totalFollowers,
            createdAt: profile.dateRegistered,
            isVerified: profile.isVerified,
            isActive: profile.isActive
          }
        }
      }
      
      return response.data
    } catch (error) {
      console.error("[SellerService] Get Profile Error:", error)
      throw error
    }
  },

  getDashboard: async () => {
    try {
      const response = await api.get("/Seller/dashboard")
      
      if (response.data?.success && response.data?.data) {
        const apiData = response.data.data
        
        return {
          data: {
            success: true,
            data: {
              totalProducts: apiData.totalProducts,
              activeProducts: apiData.activeProducts,
              lowStockProducts: apiData.lowStockProducts,
              totalOrders: apiData.totalOrders,
              pendingOrders: apiData.pendingOrders,
              completedOrders: apiData.completedOrders,
              totalRevenue: apiData.totalRevenue,
              pendingPayments: apiData.pendingPayments,
              releasedPayments: apiData.releasedPayments,
              totalFollowers: apiData.totalFollowers,
              averageRating: apiData.overallRating,
              totalReviews: apiData.totalReviews,
              recentProducts: apiData.recentProducts?.map(normalizeProduct) || [],
              recentOrders: apiData.recentOrders?.map(normalizeOrder) || [],
              pendingPayments: apiData.pendingVerifications?.map(normalizePayment) || []
            }
          }
        }
      }
      
      return response.data
    } catch (error) {
      console.error("[SellerService] Get Dashboard Error:", error)
      throw error
    }
  },

  updateProfile: async (profileData) => {
    try {
      const payload = {
        shopName: profileData.shopName,
        shopDescription: profileData.description,
        contactPhone: profileData.phoneNumber,
        contactEmail: profileData.email,
        address: profileData.address,
        city: profileData.city,
        country: profileData.country,
        website: profileData.website
      }
      
      const response = await api.put("/Seller/profile", payload)
      return response.data
    } catch (error) {
      console.error("[SellerService] Update Profile Error:", error)
      throw error
    }
  },

  // ============================================
  // PRODUCTS MANAGEMENT
  // ============================================
  
  getProducts: async (filters = {}) => {
    try {
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value
        }
        return acc
      }, {})
      
      const response = await api.get("/Seller/products", { params: cleanFilters })
      
      if (response.data?.success && response.data?.data) {
        const apiData = response.data.data
        const normalizedItems = apiData.items?.map(normalizeProduct) || []
        
        return {
          data: {
            success: true,
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
      }
      
      return response.data
    } catch (error) {
      console.error("[SellerService] Get Products Error:", error)
      throw error
    }
  },

  getProductById: async (id) => {
    try {
      if (!id) throw new Error("Product ID is required")
      const response = await api.get(`/Seller/products/${id}`)
      
      if (response.data?.success && response.data?.data) {
        const normalized = normalizeProduct(response.data.data)
        return {
          data: normalized
        }
      }
      
      return response.data
    } catch (error) {
      console.error("[SellerService] Get Product Error:", error)
      throw error
    }
  },

  // ✅ NEW: Combined method - Create product AND upload image in one operation
  createProduct: async (productData) => {
    try {
      // Step 1: Create the product first (without image)
      const payload = {
        productName: productData.name,
        description: productData.description,
        price: Number.parseFloat(productData.price),
        categoryId: Number.parseInt(productData.categoryId),
        stockQuantity: Number.parseInt(productData.stock),
        lowStockThreshold: productData.lowStockThreshold || 10
      }
      
      const createResponse = await api.post("/Seller/products", payload)
      
      if (!createResponse.data?.success || !createResponse.data?.data) {
        throw new Error("Failed to create product")
      }
      
      const createdProduct = createResponse.data.data
      const productId = createdProduct.productId
      
      // Step 2: If image file is provided, upload it immediately
      if (productData.imageFile) {
        try {
          const formData = new FormData()
          formData.append("image", productData.imageFile)
          
          await api.post(`/Seller/products/${productId}/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          
          // Fetch updated product with image URL
          const updatedResponse = await api.get(`/Seller/products/${productId}`)
          if (updatedResponse.data?.success && updatedResponse.data?.data) {
            return {
              data: normalizeProduct(updatedResponse.data.data)
            }
          }
        } catch (imageError) {
          console.error("[SellerService] Image upload failed, but product created:", imageError)
          // Product created successfully but image upload failed
          // Return the product anyway - user can upload image later
        }
      }
      
      // Return normalized product (with or without image)
      return {
        data: normalizeProduct(createdProduct)
      }
    } catch (error) {
      console.error("[SellerService] Create Product Error:", error)
      throw error
    }
  },

  updateProduct: async (id, productData) => {
    try {
      if (!id) throw new Error("Product ID is required")
      
      const payload = {
        productName: productData.name,
        description: productData.description,
        price: Number.parseFloat(productData.price),
        categoryId: Number.parseInt(productData.categoryId),
        stockQuantity: Number.parseInt(productData.stock || 0),
        lowStockThreshold: productData.lowStockThreshold || 10,
        isActive: productData.isActive !== undefined ? productData.isActive : true
      }
      
      const response = await api.put(`/Seller/products/${id}`, payload)
      return response.data
    } catch (error) {
      console.error("[SellerService] Update Product Error:", error)
      throw error
    }
  },

  deleteProduct: async (id) => {
    try {
      if (!id) throw new Error("Product ID is required")
      const response = await api.delete(`/Seller/products/${id}`)
      return response.data
    } catch (error) {
      console.error("[SellerService] Delete Product Error:", error)
      throw error
    }
  },

  updateStock: async (id, stockData) => {
    try {
      if (!id) throw new Error("Product ID is required")
      
      const payload = {
        stockQuantity: Number.parseInt(stockData.quantity),
        isActive: stockData.isActive !== undefined ? stockData.isActive : true
      }
      
      const response = await api.patch(`/Seller/products/${id}/stock`, payload)
      return response.data
    } catch (error) {
      console.error("[SellerService] Update Stock Error:", error)
      throw error
    }
  },

  uploadProductImage: async (productId, file) => {
    try {
      if (!productId) throw new Error("Product ID is required")
      if (!file) throw new Error("Image file is required")
      
      const formData = new FormData()
      formData.append("image", file)
      
      const response = await api.post(`/Seller/products/${productId}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return response.data
    } catch (error) {
      console.error("[SellerService] Upload Image Error:", error)
      throw error
    }
  },

  deleteProductImage: async (productId) => {
    try {
      if (!productId) throw new Error("Product ID is required")
      const response = await api.delete(`/Seller/products/${productId}/image`)
      return response.data
    } catch (error) {
      console.error("[SellerService] Delete Image Error:", error)
      throw error
    }
  },

  // ============================================
  // SHOP MANAGEMENT
  // ============================================
  
  uploadShopLogo: async (file) => {
    try {
      if (!file) throw new Error("Logo file is required")
      
      const formData = new FormData()
      formData.append("logo", file)
      
      const response = await api.post("/Seller/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return response.data
    } catch (error) {
      console.error("[SellerService] Upload Logo Error:", error)
      throw error
    }
  },

  deleteShopLogo: async () => {
    try {
      const response = await api.delete("/Seller/logo")
      return response.data
    } catch (error) {
      console.error("[SellerService] Delete Logo Error:", error)
      throw error
    }
  },

  // ============================================
  // ORDERS MANAGEMENT
  // ============================================
  
  getOrders: async (filters = {}) => {
    try {
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value
        }
        return acc
      }, {})
      
      const response = await api.get("/Seller/orders", { params: cleanFilters })
      
      if (response.data?.success && response.data?.data) {
        const apiData = response.data.data
        const normalizedItems = apiData.items?.map(normalizeOrder) || []
        
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
      console.error("[SellerService] Get Orders Error:", error)
      throw error
    }
  },

  getOrderById: async (id) => {
    try {
      if (!id) throw new Error("Order ID is required")
      const response = await api.get(`/Seller/orders/${id}`)
      
      if (response.data?.success && response.data?.data) {
        const normalized = normalizeOrder(response.data.data)
        return {
          data: normalized
        }
      }
      
      return response.data
    } catch (error) {
      console.error("[SellerService] Get Order Error:", error)
      throw error
    }
  },

  confirmOrder: async (orderId) => {
    try {
      if (!orderId) throw new Error("Order ID is required")
      const response = await api.post(`/Seller/orders/${orderId}/confirm`)
      return response.data
    } catch (error) {
      console.error("[SellerService] Confirm Order Error:", error)
      throw error
    }
  },

  // ============================================
  // PAYMENTS & FOLLOWERS
  // ============================================
  
  getPayments: async (filters = {}) => {
    try {
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value
        }
        return acc
      }, {})
      
      const response = await api.get("/Seller/payments", { params: cleanFilters })
      
      if (response.data?.success && response.data?.data) {
        const apiData = response.data.data
        const normalizedItems = apiData.items?.map(normalizePayment) || []
        
        return {
          data: {
            items: normalizedItems,
            totalPages: apiData.totalPages
          }
        }
      }
      
      return response.data
    } catch (error) {
      console.error("[SellerService] Get Payments Error:", error)
      throw error
    }
  },

  getPaymentById: async (id) => {
    try {
      if (!id) throw new Error("Payment ID is required")
      const response = await api.get(`/Seller/payments/${id}`)
      
      if (response.data?.success && response.data?.data) {
        return {
          data: normalizePayment(response.data.data)
        }
      }
      
      return response.data
    } catch (error) {
      console.error("[SellerService] Get Payment Error:", error)
      throw error
    }
  },

  getFollowers: async (filters = {}) => {
    try {
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value
        }
        return acc
      }, {})
      
      const response = await api.get("/Seller/followers", { params: cleanFilters })
      
      if (response.data?.success && response.data?.data) {
        const apiData = response.data.data
        const normalizedItems = apiData.items?.map(normalizeFollower) || []
        
        return {
          data: {
            items: normalizedItems,
            totalPages: apiData.totalPages
          }
        }
      }
      
      return response.data
    } catch (error) {
      console.error("[SellerService] Get Followers Error:", error)
      throw error
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get("/Seller/categories")
      
      if (response.data?.success && response.data?.data) {
        const categories = response.data.data
        return {
          data: Array.isArray(categories) ? categories.map(normalizeCategory) : []
        }
      }
      
      return response.data
    } catch (error) {
      console.error("[SellerService] Get Categories Error:", error)
      throw error
    }
  },
}

export default sellerService