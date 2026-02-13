// components/delivery/dashboard/DashboardOverview.jsx
"use client"

import { useEffect, useState } from "react"
import { Package, Truck, CheckCircle, TrendingUp, DollarSign, Clock, Loader2 } from "lucide-react"
import deliveryStaffService from "../../../services/deliveryStaffService"

const DashboardOverview = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const response = await deliveryStaffService.getStatistics()
      
      if (response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Error fetching statistics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-6 text-center bg-white border border-gray-200 rounded-lg">
        <p className="text-gray-600">Failed to load statistics</p>
        <button
          onClick={fetchStatistics}
          className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  const statCards = [
    {
      id: "total",
      label: "Total Deliveries",
      value: stats.totalDeliveries,
      icon: Truck,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      id: "pending",
      label: "Pending Deliveries",
      value: stats.pendingDeliveries,
      icon: Clock,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      onClick: () => onNavigate("my-deliveries"),
    },
    {
      id: "today",
      label: "Today's Deliveries",
      value: stats.todaysDeliveries,
      icon: Package,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      id: "successful",
      label: "Successful Deliveries",
      value: stats.successfulDeliveries,
      icon: CheckCircle,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      id: "rate",
      label: "Success Rate",
      value: `${stats.successRate.toFixed(1)}%`,
      icon: TrendingUp,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      id: "amount",
      label: "Total Amount Delivered",
      value: `$${stats.totalAmountDelivered.toFixed(2)}`,
      icon: DollarSign,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Welcome back! Here's your delivery overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
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

      {/* Performance Overview */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Performance Overview</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-semibold text-gray-900">{stats.successRate.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 overflow-hidden bg-gray-200 rounded-full">
              <div
                className="h-full transition-all duration-500 bg-green-500 rounded-full"
                style={{ width: `${Math.min(stats.successRate, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Completion Progress</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.successfulDeliveries} / {stats.totalDeliveries}
              </span>
            </div>
            <div className="w-full h-3 overflow-hidden bg-gray-200 rounded-full">
              <div
                className="h-full transition-all duration-500 bg-blue-500 rounded-full"
                style={{ 
                  width: `${stats.totalDeliveries > 0 ? (stats.successfulDeliveries / stats.totalDeliveries) * 100 : 0}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 text-white rounded-lg shadow-sm bg-gradient-to-r from-blue-500 to-blue-600">
        <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button
            onClick={() => onNavigate("available-orders")}
            className="p-4 text-center transition-colors bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30"
          >
            <Package size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">Find Orders</span>
          </button>
          <button
            onClick={() => onNavigate("my-deliveries")}
            className="p-4 text-center transition-colors bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30"
          >
            <Truck size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">My Deliveries</span>
          </button>
          <button
            onClick={() => onNavigate("history")}
            className="p-4 text-center transition-colors bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30"
          >
            <Clock size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">History</span>
          </button>
          <button
            onClick={() => onNavigate("profile")}
            className="p-4 text-center transition-colors bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30"
          >
            <TrendingUp size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview