"use client"

import { useEffect, useState, useRef } from "react"
import {
  ArrowLeft,
  Send,
  User,
  Bot,
  AlertCircle,
  Package,
  Clock,
  CheckCircle,
} from "lucide-react"
import customerService from "../../../services/customerService"
import Button from "../../common/Button"
import Loader from "../../common/Loader"

export default function ComplaintDetail({ complaintId, onNavigate, onSelectProduct }) {
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [replyMessage, setReplyMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (complaintId) {
      fetchComplaint()
    }
  }, [complaintId])

  useEffect(() => {
    scrollToBottom()
  }, [complaint?.conversation])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchComplaint = async () => {
    try {
      setLoading(true)
      const response = await customerService.getComplaintDetails(complaintId)
      setComplaint(response.data)
    } catch (error) {
      console.error("Error fetching complaint:", error)
      alert("Failed to load complaint details")
    } finally {
      setLoading(false)
    }
  }

  const handleSendReply = async (e) => {
    e.preventDefault()
    if (replyMessage.trim().length < 10) {
      alert("Message must be at least 10 characters")
      return
    }

    try {
      setSending(true)
      await customerService.replyToComplaint(complaintId, replyMessage)
      setReplyMessage("")
      await fetchComplaint()
    } catch (error) {
      console.error("Error sending reply:", error)
      alert(error.message || "Failed to send message")
    } finally {
      setSending(false)
    }
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

  const getSenderIcon = (senderType) => {
    if (senderType === "Customer") return User
    if (senderType === "SupportStaff") return User
    return Bot
  }

  const getSenderColor = (senderType) => {
    if (senderType === "Customer") return "bg-blue-600"
    if (senderType === "SupportStaff") return "bg-green-600"
    return "bg-gray-600"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="p-12 text-center bg-white rounded-lg shadow">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Complaint not found</h2>
        <Button onClick={() => onNavigate("complaints")}>Back to Complaints</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate("complaints")}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Complaint #{complaint.complaintId}
          </h1>
          <p className="text-sm text-gray-600">Order #{complaint.orderId}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
          {complaint.status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 sm:gap-6">
        {/* Main Content */}
        <div className="space-y-4 lg:col-span-2 sm:space-y-6">
          {/* Complaint Info */}
          <div className="p-4 bg-white rounded-lg shadow sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900 sm:text-xl">Complaint Details</h2>
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <span className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full w-fit">
                  {complaint.complaintType}
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-gray-700">Priority:</span>
                <span className="text-sm text-gray-900">{complaint.priority}</span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-gray-700">Reported:</span>
                <span className="text-sm text-gray-900">
                  {new Date(complaint.dateReported).toLocaleString()}
                </span>
              </div>
              {complaint.isAssigned && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-gray-700">Assigned to:</span>
                  <span className="text-sm text-gray-900">{complaint.assignedStaffName}</span>
                </div>
              )}
              {complaint.resolvedDate && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-gray-700">Resolved:</span>
                  <span className="text-sm text-green-600">
                    {new Date(complaint.resolvedDate).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-gray-200">
              <h3 className="mb-2 text-sm font-medium text-gray-700">Description:</h3>
              <p className="text-sm leading-relaxed text-gray-900 whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            {complaint.resolutionNotes && (
              <div className="p-3 mt-4 border border-green-200 rounded-lg bg-green-50 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={20} className="text-green-600" />
                  <h3 className="font-medium text-green-900">Resolution Notes</h3>
                </div>
                <p className="text-sm text-green-800">{complaint.resolutionNotes}</p>
              </div>
            )}
          </div>

          {/* Conversation */}
          <div className="flex flex-col bg-white rounded-lg shadow h-[500px] sm:h-[600px]">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Conversation</h2>
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {complaint.conversation.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                complaint.conversation.map((message) => {
                  const Icon = getSenderIcon(message.senderType)
                  const isCustomer = message.senderType === "Customer"

                  return (
                    <div
                      key={message.messageId}
                      className={`flex gap-3 ${isCustomer ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getSenderColor(message.senderType)} flex items-center justify-center`}>
                        <Icon size={16} className="text-white" />
                      </div>

                      <div className={`flex-1 max-w-[75%] sm:max-w-[80%] ${isCustomer ? "items-end" : "items-start"} flex flex-col`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-900">
                            {message.senderName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <div
                          className={`rounded-lg px-3 py-2 sm:px-4 sm:py-2 ${
                            isCustomer
                              ? "bg-blue-600 text-white"
                              : message.senderType === "System"
                              ? "bg-gray-100 text-gray-700 italic"
                              : "bg-gray-200 text-gray-900"
                          }`}
                        >
                          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                            {message.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {complaint.canReply ? (
              <form onSubmit={handleSendReply} className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your message (minimum 10 characters)..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    disabled={sending || replyMessage.trim().length < 10}
                    className="self-end"
                  >
                    {sending ? <Loader /> : <Send size={18} />}
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {replyMessage.length}/10 characters minimum
                </p>
              </form>
            ) : (
              <div className="p-4 text-center border-t border-gray-200 bg-gray-50">
                <AlertCircle size={20} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  This complaint is {complaint.status.toLowerCase()}. You cannot reply anymore.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Order Info */}
        <div className="space-y-4 lg:sticky lg:top-24 h-fit sm:space-y-6">
          <div className="p-4 bg-white rounded-lg shadow sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package size={24} className="text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Order Details</h2>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-semibold text-gray-900">#{complaint.order.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(complaint.order.orderDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className="inline-block px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                  {complaint.order.orderStatus}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-lg font-bold text-gray-900">
                  Rs. {complaint.order.grandTotal.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-4 bg-white rounded-lg shadow sm:p-6">
            <h3 className="mb-4 font-bold text-gray-900">Order Items</h3>
            <div className="space-y-3">
              {complaint.order.orderItems.map((item) => (
                <div
                  key={item.orderItemId}
                  onClick={() => onSelectProduct(item.productId)}
                  className="flex gap-3 p-2 transition-colors rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <img
                    src={item.productImage || "/placeholder.svg"}
                    alt={item.productName}
                    className="object-cover w-12 h-12 rounded sm:w-16 sm:h-16"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {item.productName}
                    </p>
                    <p className="text-xs text-gray-600">{item.sellerShopName}</p>
                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}