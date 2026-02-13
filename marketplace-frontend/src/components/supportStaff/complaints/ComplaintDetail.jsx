// components/supportStaff/complaints/ComplaintDetail.jsx
"use client"

import { useEffect, useState } from "react"
import { 
  ArrowLeft, AlertCircle, Package, User, Phone, Mail, MapPin, 
  MessageSquare, Send, CheckCircle, AlertTriangle, Clock, Loader2,
  TrendingUp, TrendingDown
} from "lucide-react"
import supportStaffService from "../../../services/supportStaffService"

const ComplaintDetail = ({ complaintId, onBack }) => {
  const [loading, setLoading] = useState(true)
  const [complaint, setComplaint] = useState(null)
  const [customerHistory, setCustomerHistory] = useState(null)
  const [newMessage, setNewMessage] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [showEscalateModal, setShowEscalateModal] = useState(false)
  const [showDeEscalateModal, setShowDeEscalateModal] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [escalationReason, setEscalationReason] = useState("")
  const [deEscalationNotes, setDeEscalationNotes] = useState("")
  const [reassignToMe, setReassignToMe] = useState(true)
  const [notifyCustomer, setNotifyCustomer] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (complaintId) {
      fetchComplaint()
    }
  }, [complaintId])

  const fetchComplaint = async () => {
    try {
      setLoading(true)
      const response = await supportStaffService.getComplaintById(complaintId)
      setComplaint(response.data)

      // Fetch customer order history
      if (response.data?.customerId) {
        try {
          const historyResponse = await supportStaffService.getCustomerOrderHistory(response.data.customerId)
          setCustomerHistory(historyResponse.data)
        } catch (error) {
          console.error("Error fetching customer history:", error)
        }
      }
    } catch (error) {
      console.error("Error fetching complaint:", error)
      alert(error.message || "Failed to load complaint")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Change status to ${newStatus}?`)) return

    try {
      await supportStaffService.updateComplaintStatus(complaintId, newStatus)
      alert("Status updated successfully")
      fetchComplaint()
    } catch (error) {
      console.error("Error updating status:", error)
      alert(error.message || "Failed to update status")
    }
  }

  const handlePriorityChange = async (newPriority) => {
    if (!window.confirm(`Change priority to ${newPriority}?`)) return

    try {
      await supportStaffService.updateComplaintPriority(complaintId, newPriority)
      alert("Priority updated successfully")
      fetchComplaint()
    } catch (error) {
      console.error("Error updating priority:", error)
      alert(error.message || "Failed to update priority")
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      setProcessing(true)
      await supportStaffService.addComplaintNote(complaintId, newMessage, isInternal)
      setNewMessage("")
      setIsInternal(false)
      alert("Note added successfully")
      fetchComplaint()
    } catch (error) {
      console.error("Error adding note:", error)
      alert(error.message || "Failed to add note")
    } finally {
      setProcessing(false)
    }
  }

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      alert("Please provide resolution notes")
      return
    }

    try {
      setProcessing(true)
      await supportStaffService.resolveComplaint(complaintId, resolutionNotes, notifyCustomer)
      alert("Complaint resolved successfully")
      setShowResolveModal(false)
      setResolutionNotes("")
      fetchComplaint()
    } catch (error) {
      console.error("Error resolving complaint:", error)
      alert(error.message || "Failed to resolve complaint")
    } finally {
      setProcessing(false)
    }
  }

  const handleEscalate = async () => {
    if (!escalationReason.trim()) {
      alert("Please provide escalation reason")
      return
    }

    try {
      setProcessing(true)
      await supportStaffService.escalateToAdmin(complaintId, escalationReason)
      alert("Complaint escalated to admin")
      setShowEscalateModal(false)
      setEscalationReason("")
      fetchComplaint()
    } catch (error) {
      console.error("Error escalating complaint:", error)
      alert(error.message || "Failed to escalate complaint")
    } finally {
      setProcessing(false)
    }
  }

  const handleDeEscalate = async () => {
    if (!deEscalationNotes.trim()) {
      alert("Please provide de-escalation notes")
      return
    }

    try {
      setProcessing(true)
      await supportStaffService.deEscalateComplaint(complaintId, deEscalationNotes, reassignToMe)
      alert("Complaint de-escalated successfully")
      setShowDeEscalateModal(false)
      setDeEscalationNotes("")
      fetchComplaint()
    } catch (error) {
      console.error("Error de-escalating complaint:", error)
      alert(error.message || "Failed to de-escalate complaint")
    } finally {
      setProcessing(false)
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

  if (!complaint) {
    return (
      <div className="py-12 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">Complaint not found</p>
        <button onClick={onBack} className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button onClick={onBack} className="flex items-center self-start gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          <span className="text-sm sm:text-base">Back to Complaints</span>
        </button>
        <div className="flex flex-wrap gap-2">
          {complaint.status === "Escalated" && (
            <button
              onClick={() => setShowDeEscalateModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-purple-600 rounded-lg sm:px-4 hover:bg-purple-700"
            >
              <TrendingDown size={18} />
              <span>De-escalate</span>
            </button>
          )}
          {complaint.status !== "Resolved" && complaint.status !== "Closed" && complaint.status !== "Escalated" && (
            <>
              <button
                onClick={() => setShowResolveModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-green-600 rounded-lg sm:px-4 hover:bg-green-700"
              >
                <CheckCircle size={18} />
                <span>Resolve</span>
              </button>
              <button
                onClick={() => setShowEscalateModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-lg sm:px-4 hover:bg-red-700"
              >
                <TrendingUp size={18} />
                <span>Escalate</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Complaint Overview */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Complaint #{complaint.id}</h2>
            <p className="text-sm text-gray-500 sm:text-base">{new Date(complaint.dateReported).toLocaleString()}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${getStatusColor(complaint.status)}`}>
              {complaint.status}
            </span>
            <span className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${getPriorityColor(complaint.priority)}`}>
              {complaint.priority}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-gray-600 sm:text-sm">Type</p>
            <p className="text-sm text-gray-900 sm:text-base">{complaint.complaintType.replace(/([A-Z])/g, ' $1').trim()}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 sm:text-sm">Order ID</p>
            <p className="text-sm text-gray-900 sm:text-base">#{complaint.orderId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 sm:text-sm">Assigned To</p>
            <p className="text-sm text-gray-900 sm:text-base">{complaint.assignedStaffName || "Unassigned"}</p>
          </div>
          {complaint.resolvedDate && (
            <div>
              <p className="text-xs font-medium text-gray-600 sm:text-sm">Resolved Date</p>
              <p className="text-sm text-gray-900 sm:text-base">{new Date(complaint.resolvedDate).toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-gray-600 sm:text-sm">Description</p>
          <p className="text-sm text-gray-900 sm:text-base">{complaint.description}</p>
        </div>

        {complaint.resolutionNotes && (
          <div className="p-3 mt-4 border border-green-200 rounded-lg sm:p-4 bg-green-50">
            <p className="mb-2 text-xs font-medium text-green-900 sm:text-sm">Resolution Notes</p>
            <p className="text-xs text-green-800 sm:text-sm">{complaint.resolutionNotes}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-col gap-4 pt-4 mt-4 border-t lg:flex-row">
          <div className="flex-1">
            <p className="mb-2 text-xs font-medium text-gray-600 sm:text-sm">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {["Open", "InProgress", "Resolved", "Closed"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={complaint.status === status}
                  className={`px-2 py-1 text-xs sm:px-3 sm:text-sm rounded-lg ${
                    complaint.status === status
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <p className="mb-2 text-xs font-medium text-gray-600 sm:text-sm">Update Priority</p>
            <div className="flex flex-wrap gap-2">
              {["Low", "Medium", "High", "Urgent"].map((priority) => (
                <button
                  key={priority}
                  onClick={() => handlePriorityChange(priority)}
                  disabled={complaint.priority === priority}
                  className={`px-2 py-1 text-xs sm:px-3 sm:text-sm rounded-lg ${
                    complaint.priority === priority
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer & Order Info Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Customer Info */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={20} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 sm:text-base">Customer Information</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 sm:text-sm">Name</p>
              <p className="text-sm font-medium text-gray-900 sm:text-base">{complaint.customerName}</p>
            </div>
            {complaint.customerEmail && (
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400 shrink-0" />
                <p className="text-xs text-gray-900 break-all sm:text-sm">{complaint.customerEmail}</p>
              </div>
            )}
            {complaint.customerPhone && (
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400 shrink-0" />
                <p className="text-xs text-gray-900 sm:text-sm">{complaint.customerPhone}</p>
              </div>
            )}
            {customerHistory && (
              <div className="pt-3 mt-3 border-t">
                <p className="mb-2 text-xs font-medium text-gray-600 sm:text-sm">Order History</p>
                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-600">Total Orders</p>
                    <p className="font-semibold text-gray-900">{customerHistory.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Spent</p>
                    <p className="font-semibold text-gray-900">${customerHistory.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Info */}
        {complaint.order && (
          <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package size={20} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 sm:text-base">Order Information</h3>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-600 sm:text-sm">Order Date</p>
                  <p className="text-xs font-medium text-gray-900 sm:text-sm">
                    {new Date(complaint.order.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 sm:text-sm">Total Amount</p>
                  <p className="text-xs font-medium text-gray-900 sm:text-sm">${complaint.order.grandTotal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 sm:text-sm">Order Status</p>
                  <p className="text-xs font-medium text-gray-900 sm:text-sm">{complaint.order.orderStatus}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 sm:text-sm">Payment Status</p>
                  <p className="text-xs font-medium text-gray-900 sm:text-sm">{complaint.order.paymentStatus}</p>
                </div>
              </div>
              
              {complaint.order.sellers && complaint.order.sellers.length > 0 && (
                <div className="pt-3 mt-3 border-t">
                  <p className="mb-2 text-xs font-medium text-gray-600 sm:text-sm">Involved Sellers</p>
                  {complaint.order.sellers.map((seller) => (
                    <div key={seller.id} className="p-2 mb-2 rounded-lg bg-gray-50">
                      <p className="text-xs font-medium text-gray-900 sm:text-sm">{seller.shopName}</p>
                      <div className="flex flex-col gap-1 mt-1 text-xs text-gray-600 sm:flex-row sm:gap-3">
                        {seller.contactEmail && <span className="break-all">{seller.contactEmail}</span>}
                        {seller.contactPhone && <span>{seller.contactPhone}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order Items */}
      {complaint.order?.orderItems && complaint.order.orderItems.length > 0 && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 sm:text-base">Order Items</h3>
          <div className="space-y-3">
            {complaint.order.orderItems.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 p-3 rounded-lg sm:flex-row sm:items-center bg-gray-50">
                <img
                  src={item.productImage || "/placeholder.svg?height=60&width=60"}
                  alt={item.productName}
                  className="object-cover w-16 h-16 rounded shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 sm:text-base">{item.productName}</p>
                  <p className="text-xs text-gray-600 sm:text-sm">Seller: {item.sellerShopName}</p>
                  <p className="text-xs text-gray-600 sm:text-sm">Quantity: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 sm:text-base">${item.subtotal.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversation */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={20} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 sm:text-base">Conversation History</h3>
        </div>

        <div className="mb-4 space-y-3 overflow-y-auto max-h-96">
          {complaint.conversation?.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.senderType === "System"
                  ? "bg-gray-100"
                  : msg.senderType === "SupportStaff"
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : "bg-green-50"
              } ${msg.isInternal ? "border-2 border-dashed border-orange-300" : ""}`}
            >
              <div className="flex flex-col gap-1 mb-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-medium text-gray-900 sm:text-sm">
                  {msg.senderName}
                  {msg.isInternal && <span className="ml-2 text-xs text-orange-600">(Internal Note)</span>}
                </p>
                <p className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString()}</p>
              </div>
              <p className="text-xs text-gray-700 break-words sm:text-sm">{msg.message}</p>
            </div>
          ))}
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="pt-4 mt-4 border-t">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Add a note or message..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 sm:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <div className="flex flex-col gap-3 mt-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-xs text-gray-700 sm:text-sm">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              Internal note (not visible to customer)
            </label>
            <button
              type="submit"
              disabled={!newMessage.trim() || processing}
              className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700 disabled:opacity-50"
            >
              <Send size={16} />
              {processing ? "Sending..." : "Add Note"}
            </button>
          </div>
        </form>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-4 bg-white rounded-lg sm:p-6">
            <h3 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">Resolve Complaint</h3>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Enter resolution details..."
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 sm:text-base focus:ring-2 focus:ring-blue-500"
            />
            <label className="flex items-center gap-2 mt-3 text-xs text-gray-700 sm:text-sm">
              <input
                type="checkbox"
                checked={notifyCustomer}
                onChange={(e) => setNotifyCustomer(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              Notify customer about resolution
            </label>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={!resolutionNotes.trim() || processing}
                className="flex-1 px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? "Resolving..." : "Resolve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-4 bg-white rounded-lg sm:p-6">
            <h3 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">Escalate to Admin</h3>
            <textarea
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              placeholder="Reason for escalation..."
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 sm:text-base focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowEscalateModal(false)}
                className="flex-1 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalate}
                disabled={!escalationReason.trim() || processing}
                className="flex-1 px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? "Escalating..." : "Escalate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* De-escalate Modal */}
      {showDeEscalateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-4 bg-white rounded-lg sm:p-6">
            <h3 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">De-escalate Complaint</h3>
            <textarea
              value={deEscalationNotes}
              onChange={(e) => setDeEscalationNotes(e.target.value)}
              placeholder="De-escalation notes..."
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 sm:text-base focus:ring-2 focus:ring-blue-500"
            />
            <label className="flex items-center gap-2 mt-3 text-xs text-gray-700 sm:text-sm">
              <input
                type="checkbox"
                checked={reassignToMe}
                onChange={(e) => setReassignToMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded-lg focus:ring-blue-500"
              />
              Reassign to me after de-escalation
            </label>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowDeEscalateModal(false)}
                className="flex-1 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeEscalate}
                disabled={!deEscalationNotes.trim() || processing}
                className="flex-1 px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {processing ? "De-escalating..." : "De-escalate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComplaintDetail