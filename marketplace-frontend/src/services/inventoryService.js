// services/inventoryService.js
import api from "./api"

// Utility function to transform backend PascalCase to frontend camelCase
const toCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1)
      result[camelKey] = toCamelCase(obj[key])
      return result
    }, {})
  }
  return obj
}

// Helper to extract data from API response
const extractData = (response) => {
  // Handle different response structures
  if (response.data) {
    // If response.data.data exists (nested ApiResponse structure)
    if (response.data.data !== undefined) {
      return toCamelCase(response.data.data)
    }
    // Otherwise use response.data directly
    return toCamelCase(response.data)
  }
  return null
}

const inventoryService = {
  // Profile & Dashboard
  getProfile: async () => {
    try {
      const response = await api.get("/InventoryManager/profile")
      return {
        ...response,
        data: extractData(response)
      }
    } catch (error) {
      console.error("Service error - getProfile:", error)
      throw error
    }
  },

  getDashboard: async () => {
    try {
      const response = await api.get("/InventoryManager/dashboard")
      return {
        ...response,
        data: extractData(response)
      }
    } catch (error) {
      console.error("Service error - getDashboard:", error)
      throw error
    }
  },

  // Products Inventory
  getProducts: async (filters) => {
    try {
      const backendFilters = filters ? {
        SearchTerm: filters.SearchTerm,
        CategoryId: filters.CategoryId,
        SellerId: filters.SellerId,
        IsLowStock: filters.IsLowStock,
        IsOutOfStock: filters.IsOutOfStock,
        IsActive: filters.IsActive,
        MinPrice: filters.MinPrice,
        MaxPrice: filters.MaxPrice,
        PageNumber: filters.PageNumber,
        PageSize: filters.PageSize,
        SortBy: filters.SortBy,
        SortOrder: filters.SortOrder
      } : {}
      
      const response = await api.get("/InventoryManager/products", { params: backendFilters })
      return {
        ...response,
        data: extractData(response)
      }
    } catch (error) {
      console.error("Service error - getProducts:", error)
      throw error
    }
  },

  getProductById: async (id) => {
    try {
      const response = await api.get(`/InventoryManager/products/${id}`)
      console.log("Raw API response for product:", response)
      return {
        ...response,
        data: extractData(response)
      }
    } catch (error) {
      console.error("Service error - getProductById:", error)
      throw error
    }
  },

  updateStock: async (id, stockData) => {
    try {
      const backendData = {
        StockQuantity: stockData.quantity,
        Notes: stockData.notes
      }
      const response = await api.patch(`/InventoryManager/products/${id}/stock`, backendData)
      return {
        ...response,
        data: extractData(response)
      }
    } catch (error) {
      console.error("Service error - updateStock:", error)
      throw error
    }
  },

  bulkUpdateStock: async (bulkData) => {
    try {
      const backendData = {
        Items: bulkData.updates?.map(item => ({
          ProductId: item.productId,
          StockQuantity: item.quantity
        })) || []
      }
      const response = await api.patch("/InventoryManager/products/bulk-update", backendData)
      return {
        ...response,
        data: extractData(response)
      }
    } catch (error) {
      console.error("Service error - bulkUpdateStock:", error)
      throw error
    }
  },

  // Stock Alerts
  getLowStockAlerts: async (filters) => {
    try {
      const backendFilters = filters ? {
        SearchTerm: filters.SearchTerm,
        Priority: filters.Priority,
        PageNumber: filters.PageNumber,
        PageSize: filters.PageSize,
        SortBy: filters.SortBy,
        SortOrder: filters.SortOrder
      } : {}
      
      const response = await api.get("/InventoryManager/alerts/low-stock", { params: backendFilters })
      return {
        ...response,
        data: extractData(response)
      }
    } catch (error) {
      console.error("Service error - getLowStockAlerts:", error)
      throw error
    }
  },

  getCriticalAlerts: async () => {
    try {
      const response = await api.get("/InventoryManager/alerts/critical")
      return {
        ...response,
        data: extractData(response)
      }
    } catch (error) {
      console.error("Service error - getCriticalAlerts:", error)
      throw error
    }
  },

  // Stock History
  getStockHistory: async (filters) => {
    try {
      const backendFilters = filters ? {
        SearchTerm: filters.SearchTerm,
        AdjustmentType: filters.AdjustmentType,
        StartDate: filters.StartDate,
        EndDate: filters.EndDate,
        IsAutomated: filters.IsAutomated,
        ProductId: filters.ProductId,
        InventoryManagerId: filters.InventoryManagerId,
        PageNumber: filters.PageNumber,
        PageSize: filters.PageSize,
        SortBy: filters.SortBy,
        SortOrder: filters.SortOrder
      } : {}
      
      const response = await api.get("/InventoryManager/stock-history", { params: backendFilters })
      return {
        ...response,
        data: extractData(response)
      }
    } catch (error) {
      console.error("Service error - getStockHistory:", error)
      throw error
    }
  },

  getProductHistory: async (id, filters) => {
    try {
      const backendFilters = filters ? {
        FromDate: filters.FromDate,
        ToDate: filters.ToDate,
        PageNumber: filters.PageNumber,
        PageSize: filters.PageSize
      } : {}
      
      const response = await api.get(`/InventoryManager/products/${id}/history`, { params: backendFilters })
      console.log("Raw API response for product history:", response)
      return {
        ...response,
        data: extractData(response)
      }
    } catch (error) {
      console.error("Service error - getProductHistory:", error)
      throw error
    }
  },

  getStockHistoryStats: async (filters) => {
    try {
      const backendFilters = filters ? {
        StartDate: filters.StartDate,
        EndDate: filters.EndDate
      } : {}
      
      const response = await api.get("/InventoryManager/stock-history/stats", { params: backendFilters })
      return {
        ...response,
        data: extractData(response)
      }
    } catch (error) {
      console.error("Service error - getStockHistoryStats:", error)
      throw error
    }
  },

  // Categories
  getCategories: async () => {
    try {
      const response = await api.get("/InventoryManager/categories")
      return {
        ...response,
        data: extractData(response)
      }
    } catch (error) {
      console.error("Service error - getCategories:", error)
      throw error
    }
  },
}

export default inventoryService