"use client"

import { useEffect, useState } from "react"
import { Store, Users, ShoppingCart, DollarSign, Package, TrendingUp, Clock, AlertCircle } from "lucide-react"
import adminService from "../../../services/adminService"
import Loader from "../../common/Loader"
import ErrorMessage from "../../common/ErrorMessage"
import StatsCard from "./StatsCard"
import RecentActivities from "./RecentActivities"
import QuickActions from "./QuickActions"

const DashboardOverview = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminService.getDashboard()
      if (response.data.success) {
        setDashboardData(response.data.data)
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loader fullScreen />
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <ErrorMessage message={error} />
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  const { platformStats, revenueStats, orderStats, recentActivities } = dashboardData

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Platform Stats */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Platform Statistics</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Sellers" value={platformStats.totalSellers} icon={Store} color="blue" />
          <StatsCard title="Active Sellers" value={platformStats.activeSellers} icon={Store} color="green" />
          <StatsCard title="Total Customers" value={platformStats.totalCustomers} icon={Users} color="purple" />
          <StatsCard title="Active Products" value={platformStats.activeProducts} icon={Package} color="yellow" />
        </div>
      </div>

      {/* Revenue Stats */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Revenue Statistics</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Revenue"
            value={`Rs. ${revenueStats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="green"
          />
          <StatsCard
            title="Today's Revenue"
            value={`Rs. ${revenueStats.todayRevenue.toLocaleString()}`}
            icon={TrendingUp}
            color="blue"
          />
          <StatsCard
            title="This Month"
            value={`Rs. ${revenueStats.thisMonthRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="purple"
          />
          <StatsCard
            title="Pending Payments"
            value={`Rs. ${revenueStats.pendingPayments.toLocaleString()}`}
            icon={Clock}
            color="yellow"
          />
        </div>
      </div>

      {/* Order Stats */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Order Statistics</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Orders" value={orderStats.totalOrders} icon={ShoppingCart} color="blue" />
          <StatsCard title="Pending Orders" value={orderStats.pendingOrders} icon={Clock} color="yellow" />
          <StatsCard title="Completed Orders" value={orderStats.completedOrders} icon={ShoppingCart} color="green" />
          <StatsCard title="Disputed Orders" value={orderStats.disputedOrders} icon={AlertCircle} color="red" />
        </div>
      </div>

      {/* Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivities activities={recentActivities} />
        <QuickActions onNavigate={onNavigate} />
      </div>
    </div>
  )
}

export default DashboardOverview
