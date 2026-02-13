// components/supportStaff/dashboard/DashboardOverview.jsx
"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle, Clock, TrendingUp, AlertTriangle, Users, Loader2 } from "lucide-react"
import supportStaffService from "../../../services/supportStaffService"

const DashboardOverview = ({ onNavigate, onSelectComplaint }) => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentComplaints, setRecentComplaints] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch statistics
      const statsResponse = await supportStaffService.getStatistics()
      if (statsResponse.data) {
        setStats(statsResponse.data)
      }

      // Fetch recent complaints
      const complaintsResponse = await supportStaffService.getComplaints({
        PageNumber: 1,
        PageSize: 5,
        SortBy: "DateReported",
        SortOrder: "desc"
      })
      
      if (complaintsResponse.data?.items) {
        setRecentComplaints(complaintsResponse.data.items)
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error)
      alert(error.message || "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const statusMap = {
      Open: "bg-yellow-100 text-yellow-700",
      InProgress: "bg-blue-100 text-blue-700",
      Resolved: "bg-green-100 text-green-700",
      Closed: "bg-gray-100 text-gray-700",
      Escalated: "bg-red-100 text-red-700"
    }
    return statusMap[status] || "bg-gray-100 text-gray-700"
  }

  const getPriorityColor = (priority) => {
    const priorityMap = {
      Low: "bg-gray-100 text-gray-700",
      Medium: "bg-blue-100 text-blue-700",
      High: "bg-orange-100 text-orange-700",
      Urgent: "bg-red-100 text-red-700"
    }
    return priorityMap[priority] || "bg-gray-100 text-gray-700"
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
        <p className="text-gray-600">Failed to load dashboard data</p>
        <button
          onClick={fetchDashboardData}
          className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  const mainStats = [
    {
      id: "total",
      label: "Total Cases",
      value: stats.totalCasesHandled,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      id: "active",
      label: "Active Cases",
      value: stats.activeCases,
      icon: Clock,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      onClick: () => onNavigate("complaints")
    },
    {
      id: "resolved",
      label: "Resolved",
      value: stats.resolvedCases,
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      id: "escalated",
      label: "Escalated",
      value: stats.escalatedCases,
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600"
    },
    {
      id: "resolution",
      label: "Resolution Rate",
      value: `${stats.resolutionRate}%`,
      icon: TrendingUp,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Welcome back! Here's your support overview</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {mainStats.map((stat) => {
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Complaints by Status */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Complaints by Status</h3>
          <div className="space-y-3">
            {Object.entries(stats.complaintsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'open' ? 'bg-yellow-500' :
                    status === 'inProgress' ? 'bg-blue-500' :
                    status === 'resolved' ? 'bg-green-500' :
                    status === 'closed' ? 'bg-gray-500' :
                    'bg-red-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {status.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Complaints by Priority */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Complaints by Priority</h3>
          <div className="space-y-3">
            {Object.entries(stats.complaintsByPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    priority === 'low' ? 'bg-gray-500' :
                    priority === 'medium' ? 'bg-blue-500' :
                    priority === 'high' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-700 capitalize">{priority}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Complaints</h3>
          <button
            onClick={() => onNavigate("complaints")}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View All
          </button>
        </div>
        {recentComplaints.length > 0 ? (
          <div className="space-y-3">
            {recentComplaints.map((complaint) => (
              <div
                key={complaint.id}
                onClick={() => onSelectComplaint(complaint.id)}
                className="flex items-center justify-between p-3 transition-colors rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">Complaint #{complaint.id}</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{complaint.customerName} - Order #{complaint.orderId}</p>
                  <p className="text-xs text-gray-500 truncate">{complaint.shortDescription}</p>
                </div>
                <div className="ml-4 text-right">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(complaint.dateReported).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-gray-500">No recent complaints</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-6 text-white rounded-lg shadow-sm bg-gradient-to-r from-blue-500 to-blue-600">
        <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <button
            onClick={() => onNavigate("complaints")}
            className="p-4 text-center transition-colors bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30"
          >
            <AlertCircle size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">View Complaints</span>
          </button>
          <button
            onClick={() => onNavigate("statistics")}
            className="p-4 text-center transition-colors bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30"
          >
            <TrendingUp size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">Statistics</span>
          </button>
          <button
            onClick={() => onNavigate("profile")}
            className="p-4 text-center transition-colors bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30"
          >
            <Users size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview