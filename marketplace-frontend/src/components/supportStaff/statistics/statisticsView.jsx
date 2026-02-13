// components/supportStaff/statistics/StatisticsView.jsx
"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Clock, CheckCircle, AlertTriangle, Users, Award, Loader2 } from "lucide-react"
import supportStaffService from "../../../services/supportStaffService"

const StatisticsView = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const response = await supportStaffService.getStatistics()
      setStats(response.data)
    } catch (error) {
      console.error("Error fetching statistics:", error)
      alert(error.message || "Failed to load statistics")
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
      <div className="py-12 text-center">
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

  const performanceMetrics = [
    {
      id: "total",
      label: "Total Cases Handled",
      value: stats.totalCasesHandled,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      id: "active",
      label: "Currently Active",
      value: stats.activeCases,
      icon: Clock,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    {
      id: "resolved",
      label: "Successfully Resolved",
      value: stats.resolvedCases,
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      id: "escalated",
      label: "Escalated Cases",
      value: stats.escalatedCases,
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600"
    },
    {
      id: "today",
      label: "Today's Cases",
      value: stats.todaysCases,
      icon: TrendingUp,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      id: "resolution",
      label: "Resolution Rate",
      value: `${stats.resolutionRate}%`,
      icon: Award,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Performance Statistics</h2>
        <p className="text-gray-600">Your support performance metrics and analytics</p>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {performanceMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.id} className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{metric.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={`p-4 rounded-lg ${metric.iconBg}`}>
                  <Icon className={metric.iconColor} size={32} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Complaints by Status */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">Complaints by Status</h3>
          <div className="space-y-4">
            {Object.entries(stats.complaintsByStatus).map(([status, count]) => {
              const total = Object.values(stats.complaintsByStatus).reduce((a, b) => a + b, 0)
              const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0

              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-2">
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
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
                    <div
                      className={`h-full rounded-full ${
                        status === 'open' ? 'bg-yellow-500' :
                        status === 'inProgress' ? 'bg-blue-500' :
                        status === 'resolved' ? 'bg-green-500' :
                        status === 'closed' ? 'bg-gray-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Complaints by Priority */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">Complaints by Priority</h3>
          <div className="space-y-4">
            {Object.entries(stats.complaintsByPriority).map(([priority, count]) => {
              const total = Object.values(stats.complaintsByPriority).reduce((a, b) => a + b, 0)
              const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0

              return (
                <div key={priority}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        priority === 'low' ? 'bg-gray-500' :
                        priority === 'medium' ? 'bg-blue-500' :
                        priority === 'high' ? 'bg-orange-500' :
                        'bg-red-500'
                      }`} />
                      <span className="text-sm font-medium text-gray-700 capitalize">{priority}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
                    <div
                      className={`h-full rounded-full ${
                        priority === 'low' ? 'bg-gray-500' :
                        priority === 'medium' ? 'bg-blue-500' :
                        priority === 'high' ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Performance Summary</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-medium text-gray-600">Resolution Efficiency</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Cases Resolved</span>
                <span className="font-semibold text-gray-900">{stats.resolvedCases}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Total Handled</span>
                <span className="font-semibold text-gray-900">{stats.totalCasesHandled}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Resolution Rate</span>
                  <span className="text-lg font-bold text-green-600">{stats.resolutionRate}%</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-gray-600">Current Workload</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Active Cases</span>
                <span className="font-semibold text-orange-600">{stats.activeCases}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Escalated Cases</span>
                <span className="font-semibold text-red-600">{stats.escalatedCases}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Today's Cases</span>
                <span className="font-semibold text-blue-600">{stats.todaysCases}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Indicator */}
      <div className={`p-6 text-white rounded-lg shadow-sm ${
        stats.resolutionRate >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
        stats.resolutionRate >= 60 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
        'bg-gradient-to-r from-orange-500 to-orange-600'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="mb-2 text-lg font-semibold">Performance Rating</h3>
            <p className="text-sm opacity-90">
              {stats.resolutionRate >= 80 ? 'Excellent performance! Keep up the great work.' :
               stats.resolutionRate >= 60 ? 'Good performance. Room for improvement.' :
               'Focus on improving resolution rate and response times.'}
            </p>
          </div>
          <Award size={48} className="opacity-80" />
        </div>
      </div>
    </div>
  )
}

export default StatisticsView