"use client"

import { useEffect, useState } from "react"
import { Package, DollarSign, Heart, ShoppingCart, TrendingUp, Clock } from "lucide-react"
import customerService from "../../../services/customerService"
import Loader from "../../common/Loader"

export default function DashboardOverview({ onNavigate }) {
  const [profile, setProfile] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [profileData, ordersData] = await Promise.all([
        customerService.getProfile(),
        customerService.getOrders({ PageNumber: 1, PageSize: 5 }),
      ])

      setProfile(profileData.data)
      setRecentOrders(ordersData.data.items || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    )
  }

  const stats = [
    {
      label: "Total Orders",
      value: profile?.totalOrders || 0,
      icon: Package,
      color: "bg-blue-100 text-blue-600",
      route: "orders",
    },
    {
      label: "Total Spent",
      value: `Rs. ${profile?.totalSpent?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Followed Sellers",
      value: profile?.followedSellersCount || 0,
      icon: Heart,
      color: "bg-red-100 text-red-600",
      route: "followed",
    },
  ]

  const quickActions = [
    {
      label: "Browse Products",
      icon: ShoppingCart,
      route: "products",
      color: "bg-blue-600",
    },
    {
      label: "View Cart",
      icon: ShoppingCart,
      route: "cart",
      color: "bg-green-600",
    },
    {
      label: "My Orders",
      icon: Package,
      route: "orders",
      color: "bg-purple-600",
    },
    {
      label: "Followed Feed",
      icon: TrendingUp,
      route: "followed-feed",
      color: "bg-orange-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.fullName}!
        </h1>
        <p className="mt-1 text-gray-600">
          Member since {new Date(profile?.dateRegistered).toLocaleDateString()}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              onClick={() => stat.route && onNavigate(stat.route)}
              className={`bg-white rounded-lg shadow p-6 ${
                stat.route ? "cursor-pointer hover:shadow-md transition-shadow" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                onClick={() => onNavigate(action.route)}
                className={`${action.color} text-white rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:opacity-90 transition-opacity`}
              >
                <Icon size={32} />
                <span className="font-medium text-center">{action.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          <button
            onClick={() => onNavigate("orders")}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View All
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg shadow">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No orders yet</p>
            <button
              onClick={() => onNavigate("products")}
              className="mt-2 font-medium text-blue-600 hover:text-blue-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.orderId}
                onClick={() => {
                  // This will be handled by parent passing onSelectOrder
                  onNavigate(`order-detail`)
                }}
                className="p-6 transition-shadow bg-white rounded-lg shadow cursor-pointer hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <p className="font-semibold text-gray-900">
                        Order #{order.orderId}
                      </p>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.orderStatus === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : order.orderStatus === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <Clock size={14} />
                      {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {order.totalItems} item(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      Rs. {order.grandTotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}