"use client"

import { useEffect, useState } from "react"
import { Package, AlertTriangle, TrendingUp, DollarSign, Layers, Users, Box, Activity } from "lucide-react"
import inventoryService from "../../../services/inventoryService"

const DashboardOverview = ({ onNavigate, onSelectProduct }) => {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const response = await inventoryService.getDashboard()
      setDashboardData(response.data)
    } catch (error) {
      console.error("Error fetching dashboard:", error)
      alert(error.message || "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  const stats = [
    {
      label: "Total Products",
      value: dashboardData?.totalProducts || 0,
      icon: Package,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      onClick: () => onNavigate("inventory"),
    },
    {
      label: "Active Products",
      value: dashboardData?.activeProducts || 0,
      icon: Activity,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Inactive Products",
      value: dashboardData?.inactiveProducts || 0,
      icon: Box,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
    },
    {
      label: "Low Stock",
      value: dashboardData?.lowStockProducts || 0,
      icon: AlertTriangle,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      onClick: () => onNavigate("alerts"),
    },
    {
      label: "Out of Stock",
      value: dashboardData?.outOfStockProducts || 0,
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      onClick: () => onNavigate("alerts"),
    },
    {
      label: "Categories",
      value: dashboardData?.totalCategories || 0,
      icon: Layers,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Active Sellers",
      value: dashboardData?.totalSellers || 0,
      icon: Users,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      label: "Total Inventory Value",
      value: `$${(dashboardData?.totalInventoryValue || 0).toFixed(2)}`,
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Inventory Dashboard</h2>
        <p className="text-gray-600">Overview of your inventory management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              onClick={stat.onClick}
              className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${
                stat.onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                  <Icon className={stat.iconColor} size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Critical Low Stock Alerts */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <AlertTriangle className="text-red-600" size={20} />
            Critical Low Stock Alerts (Top 10)
          </h3>
          <button
            onClick={() => onNavigate("alerts")}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View All
          </button>
        </div>
        {dashboardData?.criticalLowStockAlerts?.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.criticalLowStockAlerts.slice(0, 10).map((alert) => (
              <div
                key={alert.productId}
                onClick={() => onSelectProduct(alert.productId)}
                className="flex items-center justify-between p-3 transition-colors border border-red-100 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      alert.priority === "Critical"
                        ? "bg-red-100 text-red-700"
                        : alert.priority === "High"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {alert.priority}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{alert.productName}</p>
                    <p className="text-sm text-gray-500">
                      Stock: {alert.currentStock} | Seller: {alert.sellerShopName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600">{alert.stockDeficit} short</p>
                  <p className="text-xs text-gray-500">{alert.daysSinceLastRestock} days since restock</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-gray-500">No critical alerts</p>
        )}
      </div>

      {/* Recently Updated & Category Summary Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recently Updated Products */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recently Updated (Top 5)</h3>
            <button
              onClick={() => onNavigate("history")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View History
            </button>
          </div>
          {dashboardData?.recentlyUpdatedProducts?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentlyUpdatedProducts.slice(0, 5).map((product) => (
                <div
                  key={product.productId}
                  onClick={() => onSelectProduct(product.productId)}
                  className="flex items-center justify-between p-3 transition-colors rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(product.dateListed).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">Stock: {product.stockQuantity}</p>
                    <p className="text-xs text-gray-500">{product.categoryName}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-gray-500">No recent updates</p>
          )}
        </div>

        {/* Category Stock Summary */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Category Stock Summary</h3>
          {dashboardData?.categoryStockSummary?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.categoryStockSummary.map((category) => (
                <div key={category.categoryId} className="pb-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{category.categoryName}</p>
                    <p className="text-sm text-gray-600">{category.totalProducts} products</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Value:</span>
                    <span className="font-semibold text-gray-900">${category.totalValue.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Low Stock:</span>
                    <span className="font-semibold text-yellow-600">{category.lowStockProducts}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Out of Stock:</span>
                    <span className="font-semibold text-red-600">{category.outOfStockProducts}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-gray-500">No category data</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 text-white rounded-lg shadow-sm bg-gradient-to-r from-blue-500 to-blue-600">
        <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button
            onClick={() => onNavigate("inventory")}
            className="p-4 text-center transition-colors bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30"
          >
            <Package size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">Manage Inventory</span>
          </button>
          <button
            onClick={() => onNavigate("alerts")}
            className="p-4 text-center transition-colors bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30"
          >
            <AlertTriangle size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">View Alerts</span>
          </button>
          <button
            onClick={() => onNavigate("bulk-update")}
            className="p-4 text-center transition-colors bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30"
          >
            <TrendingUp size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">Bulk Update</span>
          </button>
          <button
            onClick={() => onNavigate("history")}
            className="p-4 text-center transition-colors bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30"
          >
            <Activity size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">View History</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview