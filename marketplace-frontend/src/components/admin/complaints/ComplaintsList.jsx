"use client"

import { useEffect, useState } from "react"
import { Eye, ChevronLeft, ChevronRight } from "lucide-react"
import adminService from "../../../services/adminService"
import Loader from "../../common/Loader"
import ErrorMessage from "../../common/ErrorMessage"
import Button from "../../common/Button"
import ComplaintFilters from "./ComplaintFilters"

const ComplaintsList = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({
    ComplaintType: "",
    Status: "",
    Priority: "",
    PageNumber: 1,
    PageSize: 10,
  })

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      setError(null)
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ""))
      const response = await adminService.getComplaints(cleanFilters)
      if (response.data.success) {
        setComplaints(response.data.data.items)
        setPagination({
          pageNumber: response.data.data.pageNumber,
          pageSize: response.data.data.pageSize,
          totalCount: response.data.data.totalCount,
          totalPages: response.data.data.totalPages,
          hasPrevious: response.data.data.hasPrevious,
          hasNext: response.data.data.hasNext,
        })
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, PageNumber: newPage })
    setTimeout(fetchComplaints, 0)
  }

  const getStatusColor = (status) => {
    const colors = {
      Open: "bg-yellow-100 text-yellow-700",
      InProgress: "bg-blue-100 text-blue-700",
      Resolved: "bg-green-100 text-green-700",
      Closed: "bg-gray-100 text-gray-700",
      Escalated: "bg-red-100 text-red-700",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  const getPriorityColor = (priority) => {
    const colors = {
      Low: "bg-gray-100 text-gray-700",
      Medium: "bg-blue-100 text-blue-700",
      High: "bg-orange-100 text-orange-700",
      Critical: "bg-red-100 text-red-700",
    }
    return colors[priority] || "bg-gray-100 text-gray-700"
  }

  if (loading) {
    return <Loader fullScreen />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Complaints Management</h1>
        <Button onClick={fetchComplaints} className="w-full sm:w-auto">
          Refresh
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      <ComplaintFilters
        filters={filters}
        setFilters={setFilters}
        onApply={fetchComplaints}
        onReset={() => {
          setFilters({ ComplaintType: "", Status: "", Priority: "", PageNumber: 1, PageSize: 10 })
          setTimeout(fetchComplaints, 0)
        }}
      />

      {/* ✅ MOBILE VIEW: Card Layout */}
      <div className="block space-y-4 lg:hidden">
        {complaints.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg shadow">
            <p className="text-gray-500">No complaints found</p>
          </div>
        ) : (
          complaints.map((complaint) => (
            <div key={complaint.complaintId} className="p-4 bg-white rounded-lg shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Complaint ID</p>
                  <p className="text-lg font-bold text-gray-900">#{complaint.complaintId}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(complaint.status)}`}>
                  {complaint.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Order:</span>
                  <span className="text-sm font-medium text-gray-900">#{complaint.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Customer:</span>
                  <span className="text-sm font-medium text-gray-900">{complaint.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Type:</span>
                  <span className="text-sm text-gray-900">
                    {complaint.complaintType.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Priority:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Assigned To:</span>
                  <span className="text-sm text-gray-900">
                    {complaint.assignedStaffName || "Unassigned"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Date:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(complaint.dateReported).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-3" size="sm">
                <Eye size={16} className="mr-2" />
                View Details
              </Button>
            </div>
          ))
        )}
      </div>

      {/* ✅ DESKTOP VIEW: Table Layout */}
      <div className="hidden overflow-hidden bg-white rounded-lg shadow lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase xl:px-6">
                  ID
                </th>
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase xl:px-6">
                  Order
                </th>
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase xl:px-6">
                  Customer
                </th>
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase xl:px-6">
                  Type
                </th>
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase xl:px-6">
                  Priority
                </th>
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase xl:px-6">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase xl:px-6">
                  Assigned To
                </th>
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase xl:px-6">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No complaints found
                  </td>
                </tr>
              ) : (
                complaints.map((complaint) => (
                  <tr key={complaint.complaintId} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-900 xl:px-6 whitespace-nowrap">
                      #{complaint.complaintId}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 xl:px-6 whitespace-nowrap">
                      #{complaint.orderId}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 xl:px-6 whitespace-nowrap">
                      {complaint.customerName}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 xl:px-6 whitespace-nowrap">
                      {complaint.complaintType.replace(/([A-Z])/g, " $1").trim()}
                    </td>
                    <td className="px-4 py-4 xl:px-6 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4 xl:px-6 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 xl:px-6 whitespace-nowrap">
                      {complaint.assignedStaffName || "Unassigned"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 xl:px-6 whitespace-nowrap">
                      {new Date(complaint.dateReported).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex flex-col gap-4 px-4 py-4 border-t border-gray-200 sm:flex-row sm:items-center sm:justify-between xl:px-6">
            <p className="text-sm text-center text-gray-600 sm:text-left">
              Showing {complaints.length} of {pagination.totalCount} complaints
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.pageNumber - 1)}
                disabled={!pagination.hasPrevious}
                size="sm"
              >
                <ChevronLeft size={16} className="sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <span className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">
                Page {pagination.pageNumber} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.pageNumber + 1)}
                disabled={!pagination.hasNext}
                size="sm"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} className="sm:ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ MOBILE PAGINATION */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col gap-3 p-4 bg-white rounded-lg shadow lg:hidden">
          <p className="text-sm text-center text-gray-600">
            Showing {complaints.length} of {pagination.totalCount} complaints
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.pageNumber - 1)}
              disabled={!pagination.hasPrevious}
              size="sm"
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="px-3 py-2 text-sm text-gray-700">
              {pagination.pageNumber} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.pageNumber + 1)}
              disabled={!pagination.hasNext}
              size="sm"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComplaintsList