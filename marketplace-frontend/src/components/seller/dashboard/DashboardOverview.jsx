"use client"

import { useEffect, useState } from "react"
import { Package, ShoppingCart, DollarSign, Users, Star, TrendingUp, Clock } from "lucide-react"
import sellerService from "../../../services/sellerService"

const DashboardOverview = ({ onNavigate, onSelectProduct, onSelectOrder, onSelectPayment }) => {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const response = await sellerService.getDashboard()
      
      console.log("Dashboard API Response:", response)
      
      // ✅ FIXED: Handle normalized response
      if (response.data?.success && response.data?.data) {
        setDashboardData(response.data.data)
      } else if (response.data) {
        setDashboardData(response.data)
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error)
      alert(error.message || "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  // ✅ IMPROVED: Better placeholder image
  const getImageSrc = (imageUrl) => {
    if (imageUrl && imageUrl.startsWith('http')) {
      return imageUrl
    }
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23e5e7eb' width='40' height='40'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='12' fill='%239ca3af'%3ENO%3C/text%3E%3C/svg%3E"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="p-6 text-center bg-white border border-gray-200 rounded-lg">
        <p className="text-gray-600">Failed to load dashboard data</p>
        <button
          onClick={fetchDashboard}
          className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  const stats = [
    {
      id: "products",
      label: "Total Products",
      value: dashboardData.totalProducts || 0,
      icon: Package,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      onClick: () => onNavigate("products"),
    },
    {
      id: "orders",
      label: "Total Orders",
      value: dashboardData.totalOrders || 0,
      icon: ShoppingCart,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      onClick: () => onNavigate("orders"),
    },
    {
      id: "revenue",
      label: "Total Revenue",
      value: `$${(dashboardData.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      id: "followers",
      label: "Followers",
      value: dashboardData.totalFollowers || 0,
      icon: Users,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      onClick: () => onNavigate("followers"),
    },
    {
      id: "rating",
      label: "Average Rating",
      value: (dashboardData.averageRating || 0).toFixed(1),
      icon: Star,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Welcome back! Here's your shop overview</p>
      </div>

      {/* Stats Grid - ✅ FIXED: Added key prop */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.id}
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

      {/* Recent Products */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Products</h3>
          <button
            onClick={() => onNavigate("products")}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View All
          </button>
        </div>
        {dashboardData.recentProducts && dashboardData.recentProducts.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.recentProducts.slice(0, 5).map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product.id)}
                className="flex items-center justify-between p-3 transition-colors rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={getImageSrc(product.imageUrl)}
                    alt={product.name}
                    className="object-cover w-10 h-10 rounded"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">${product.price}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-gray-500">No products yet</p>
        )}
      </div>

      {/* Recent Orders & Pending Payments Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button
              onClick={() => onNavigate("orders")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>
          {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order.id)}
                  className="flex items-center justify-between p-3 transition-colors rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${order.totalAmount}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-gray-500">No orders yet</p>
          )}
        </div>

        {/* Pending Payments */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Payments</h3>
            <button
              onClick={() => onNavigate("payments")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>
          {dashboardData.pendingPayments && dashboardData.pendingPayments.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.pendingPayments.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  onClick={() => onSelectPayment(payment.id)}
                  className="flex items-center justify-between p-3 transition-colors rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">Payment #{payment.id}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={14} className="text-gray-400" />
                      <p className="text-sm text-gray-500">{payment.daysRemaining} days remaining</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">${payment.amount}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-gray-500">No pending payments</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 text-white rounded-lg shadow-sm bg-gradient-to-r from-blue-500 to-blue-600">
        <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button
            onClick={() => onNavigate("products")}
            className="p-4 text-center transition-colors bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30"
          >
            <Package size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">Add Product</span>
          </button>
          <button
            onClick={() => onNavigate("orders")}
            className="p-4 text-center transition-colors bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30"
          >
            <ShoppingCart size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">View Orders</span>
          </button>
          <button
            onClick={() => onNavigate("payments")}
            className="p-4 text-center transition-colors bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30"
          >
            <DollarSign size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">Payments</span>
          </button>
          <button
            onClick={() => onNavigate("profile")}
            className="p-4 text-center transition-colors bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30"
          >
            <TrendingUp size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">Shop Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview