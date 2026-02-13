"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Filter, X, ChevronLeft, ChevronRight, AlertCircle, Clock } from "lucide-react"
import customerService from "../../../services/customerService"
import Button from "../../common/Button"
import Loader from "../../common/Loader"

export default function ComplaintsList({ onNavigate, onSelectComplaint }) {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const [status, setStatus] = useState("")
  const [complaintType, setComplaintType] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  useEffect(() => {
    fetchComplaints()
  }, [currentPage])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const filters = {
        Status: status,
        ComplaintType: complaintType,
        FromDate: fromDate,
        ToDate: toDate,
        PageNumber: currentPage,
        PageSize: 10,
      }

      const response = await customerService.getComplaints(filters)
      setComplaints(response.data.items)
      setPagination(response.data)
    } catch (error) {
      console.error("Error fetching complaints:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    setCurrentPage(1)
    fetchComplaints()
    setShowFilters(false)
  }

  const clearFilters = () => {
    setStatus("")
    setComplaintType("")
    setFromDate("")
    setToDate("")
    setCurrentPage(1)
    fetchComplaints()
  }

  const getStatusColor = (status) => {
    const colors = {
      Open: "bg-blue-100 text-blue-700",
      InProgress: "bg-yellow-100 text-yellow-700",
      Resolved: "bg-green-100 text-green-700",
      Closed: "bg-gray-100 text-gray-700",
      Escalated: "bg-red-100 text-red-700",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  const getPriorityColor = (priority) => {
    const colors = {
      Low: "bg-green-100 text-green-700",
      Medium: "bg-yellow-100 text-yellow-700",
      High: "bg-orange-100 text-orange-700",
      Critical: "bg-red-100 text-red-700",
    }
    return colors[priority] || "bg-gray-100 text-gray-700"
  }

  if (loading && complaints.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Complaints</h1>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2"
        >
          <Filter size={18} />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="p-4 bg-white rounded-lg shadow sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            <button onClick={() => setShowFilters(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="InProgress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
                <option value="Escalated">Escalated</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Type</label>
              <select
                value={complaintType}
                onChange={(e) => setComplaintType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Types</option>
                <option value="ProductQuality">Product Quality</option>
                <option value="PaymentDispute">Payment Dispute</option>
                <option value="DeliveryIssue">Delivery Issue</option>
                <option value="SellerIssue">Seller Issue</option>
                <option value="RefundRequest">Refund Request</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4 sm:flex-row">
            <Button onClick={applyFilters} className="flex-1">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={clearFilters} className="flex-1">
              Clear
            </Button>
          </div>
        </div>
      )}

      {complaints.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow sm:p-12">
          <MessageSquare size={48} className="mx-auto mb-4 text-gray-400 sm:w-16 sm:h-16" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No complaints found</h3>
          <p className="mb-6 text-gray-600">You haven't filed any complaints yet.</p>
          <Button onClick={() => onNavigate("orders")}>View Orders</Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div
                key={complaint.complaintId}
                onClick={() => onSelectComplaint(complaint.complaintId)}
                className="p-4 transition-shadow bg-white rounded-lg shadow cursor-pointer hover:shadow-lg sm:p-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:items-center">
                      <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                        Complaint #{complaint.complaintId} - Order #{complaint.orderId}
                      </h3>
                      {complaint.unreadMessagesCount > 0 && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-600 rounded-full w-fit">
                          {complaint.unreadMessagesCount} new message{complaint.unreadMessagesCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority} Priority
                      </span>
                      <span className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                        {complaint.complaintType}
                      </span>
                    </div>

                    <p className="mb-2 text-sm text-gray-700 line-clamp-2">
                      {complaint.shortDescription}
                    </p>

                    <div className="flex flex-col gap-2 text-xs text-gray-600 sm:flex-row sm:items-center sm:gap-4">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(complaint.dateReported).toLocaleString()}
                      </span>
                      {complaint.isAssigned && (
                        <span className="flex items-center gap-1">
                          <AlertCircle size={14} />
                          Assigned to: {complaint.assignedStaffName}
                        </span>
                      )}
                      {complaint.resolvedDate && (
                        <span className="text-green-600">
                          Resolved: {new Date(complaint.resolvedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col items-center gap-2 mt-6 sm:flex-row sm:justify-center">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrevious}
                size="sm"
              >
                <ChevronLeft size={18} /> Previous
              </Button>

              <span className="text-sm text-gray-700">
                Page {currentPage} of {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNext}
                size="sm"
              >
                Next <ChevronRight size={18} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}