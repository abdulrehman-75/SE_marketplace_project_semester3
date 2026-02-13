// components/supportStaff/complaints/ComplaintsManagement.jsx
"use client"

import { useEffect, useState } from "react"
import { Search, Filter, AlertCircle, Eye, Loader2, UserCheck } from "lucide-react"
import supportStaffService from "../../../services/supportStaffService"

const ComplaintsManagement = ({ onSelectComplaint }) => {
  const [loading, setLoading] = useState(true)
  const [complaints, setComplaints] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [assignmentFilter, setAssignmentFilter] = useState("")
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchComplaints()
  }, [searchTerm, statusFilter, priorityFilter, typeFilter, assignmentFilter, pageNumber])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters = {
        PageNumber: pageNumber,
        PageSize: pageSize,
        SortBy: "DateReported",
        SortOrder: "desc"
      }

      if (searchTerm) filters.SearchTerm = searchTerm
      if (statusFilter) filters.Status = statusFilter
      if (priorityFilter) filters.Priority = priorityFilter
      if (typeFilter) filters.ComplaintType = typeFilter
      
      if (assignmentFilter === "mine") filters.AssignedToMe = true
      if (assignmentFilter === "unassigned") filters.Unassigned = true

      const response = await supportStaffService.getComplaints(filters)

      if (response.data) {
        setComplaints(response.data.items || [])
        setTotalPages(response.data.totalPages || 0)
      }
    } catch (error) {
      console.error("Error fetching complaints:", error)
      setError(error.message || "Failed to load complaints")
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelfAssign = async (complaintId, e) => {
    e.stopPropagation()
    
    if (!window.confirm("Assign this complaint to yourself?")) {
      return
    }

    try {
      await supportStaffService.selfAssignComplaint(complaintId)
      alert("Complaint assigned successfully")
      fetchComplaints()
    } catch (error) {
      console.error("Error assigning complaint:", error)
      alert(error.message || "Failed to assign complaint")
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

  if (error) {
    return (
      <div className="p-4 text-center bg-white border border-red-200 rounded-lg sm:p-6">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
        <p className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">Error Loading Complaints</p>
        <p className="mb-4 text-sm text-gray-600 sm:text-base">{error}</p>
        <button
          onClick={fetchComplaints}
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg sm:px-6 sm:text-base hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Complaints Management</h2>
        <p className="text-sm text-gray-600 sm:text-base">Handle and resolve customer complaints</p>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="relative sm:col-span-2 xl:col-span-2">
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={20} />
            <input
              type="text"
              placeholder="Search by ID, customer, order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={assignmentFilter}
            onChange={(e) => setAssignmentFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg sm:text-base focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Complaints</option>
            <option value="mine">My Complaints</option>
            <option value="unassigned">Unassigned</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg sm:text-base focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="InProgress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Escalated">Escalated</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg sm:text-base focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg sm:col-span-2 xl:col-span-1 sm:text-base focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="ProductQuality">Product Quality</option>
            <option value="PaymentDispute">Payment Dispute</option>
            <option value="DeliveryIssue">Delivery Issue</option>
            <option value="SellerIssue">Seller Issue</option>
            <option value="RefundRequest">Refund Request</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      {complaints.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase xl:px-6">
                      ID
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase xl:px-6">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase xl:px-6">
                      Order
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase xl:px-6">
                      Type
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase xl:px-6">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase xl:px-6">
                      Status
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase xl:px-6">
                      Assigned To
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase xl:px-6">
                      Date
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase xl:px-6">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 xl:px-6 whitespace-nowrap">
                        #{complaint.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 xl:px-6 whitespace-nowrap">
                        {complaint.customerName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 xl:px-6 whitespace-nowrap">
                        #{complaint.orderId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 xl:px-6 whitespace-nowrap">
                        {complaint.complaintType.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      <td className="px-4 py-3 xl:px-6 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 xl:px-6 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 xl:px-6 whitespace-nowrap">
                        {complaint.assignedStaffName ? (
                          <span className={complaint.isAssignedToMe ? "font-medium text-blue-600" : ""}>
                            {complaint.assignedStaffName}
                            {complaint.isAssignedToMe && " (You)"}
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleSelfAssign(complaint.id, e)}
                            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            <UserCheck size={14} />
                            Assign to me
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 xl:px-6 whitespace-nowrap">
                        {new Date(complaint.dateReported).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 xl:px-6 whitespace-nowrap">
                        <button
                          onClick={() => onSelectComplaint(complaint.id)}
                          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 lg:hidden">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                onClick={() => onSelectComplaint(complaint.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Complaint #{complaint.id}</p>
                    <p className="text-xs text-gray-500">Order #{complaint.orderId}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full text-center ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full text-center ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium text-gray-900">{complaint.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="text-gray-900">{complaint.complaintType.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assigned To:</span>
                    {complaint.assignedStaffName ? (
                      <span className={complaint.isAssignedToMe ? "font-medium text-blue-600" : "text-gray-900"}>
                        {complaint.assignedStaffName}
                        {complaint.isAssignedToMe && " (You)"}
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleSelfAssign(complaint.id, e)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Assign to me
                      </button>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-900">{new Date(complaint.dateReported).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectComplaint(complaint.id)}
                  className="flex items-center justify-center w-full gap-2 px-4 py-2 mt-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Eye size={16} />
                  View Details
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg sm:w-auto hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 sm:px-4 sm:py-2">
                Page {pageNumber} of {totalPages}
              </span>
              <button
                onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                disabled={pageNumber === totalPages}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg sm:w-auto hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center bg-white border border-gray-200 rounded-lg">
          <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-base font-semibold text-gray-900 sm:text-lg">No complaints found</p>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            {searchTerm || statusFilter || priorityFilter || typeFilter || assignmentFilter
              ? "Try adjusting your filters"
              : "Complaints will appear here"}
          </p>
        </div>
      )}
    </div>
  )
}

export default ComplaintsManagement