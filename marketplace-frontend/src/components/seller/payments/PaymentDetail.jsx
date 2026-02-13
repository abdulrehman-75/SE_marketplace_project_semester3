"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from "lucide-react"
import sellerService from "../../../services/sellerService"

const PaymentDetail = ({ paymentId, onBack }) => {
  const [loading, setLoading] = useState(true)
  const [payment, setPayment] = useState(null)

  useEffect(() => {
    if (paymentId) {
      fetchPayment()
    }
  }, [paymentId])

  const fetchPayment = async () => {
    try {
      setLoading(true)
      const response = await sellerService.getPaymentById(paymentId)
      setPayment(response.data)
    } catch (error) {
      console.error("[v0] Error fetching payment:", error)
      alert(error.message || "Failed to load payment")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Payment not found</p>
        <button onClick={onBack} className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          Go Back
        </button>
      </div>
    )
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case "Released":
        return { icon: CheckCircle, color: "green", bgColor: "bg-green-100", textColor: "text-green-700" }
      case "Pending":
        return { icon: Clock, color: "yellow", bgColor: "bg-yellow-100", textColor: "text-yellow-700" }
      case "OnHold":
        return { icon: AlertCircle, color: "orange", bgColor: "bg-orange-100", textColor: "text-orange-700" }
      default:
        return { icon: AlertCircle, color: "gray", bgColor: "bg-gray-100", textColor: "text-gray-700" }
    }
  }

  const statusInfo = getStatusInfo(payment.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Back to Payments
        </button>
      </div>

      {/* Payment Overview */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment #{payment.id}</h2>
            <p className="text-gray-500">Created on {new Date(payment.createdAt).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className={`text-${statusInfo.color}-600`} size={24} />
              <span
                className={`px-4 py-2 text-sm font-medium rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}
              >
                {payment.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="mb-1 text-sm text-gray-600">Payment Amount</p>
            <p className="text-2xl font-bold text-gray-900">${payment.amount}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-600">Order ID</p>
            <p className="text-lg font-semibold text-gray-900">#{payment.orderId}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-600">Verification Period</p>
            <p className="text-lg font-semibold text-gray-900">{payment.verificationDays} days</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-600">Days Remaining</p>
            <p className="text-lg font-semibold text-gray-900">
              {payment.status === "Pending" ? `${payment.daysRemaining} days` : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Status Details */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Payment Status Details</h3>
        <div className="space-y-4">
          {payment.status === "Pending" && (
            <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <div className="flex items-start gap-3">
                <Clock className="mt-1 text-yellow-600" size={20} />
                <div>
                  <p className="font-medium text-yellow-900">Payment Under Verification</p>
                  <p className="mt-1 text-sm text-yellow-700">
                    This payment is currently in the verification period. It will be automatically released in{" "}
                    {payment.daysRemaining} days if no issues are reported.
                  </p>
                </div>
              </div>
            </div>
          )}

          {payment.status === "Released" && (
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-1 text-green-600" size={20} />
                <div>
                  <p className="font-medium text-green-900">Payment Released</p>
                  <p className="mt-1 text-sm text-green-700">
                    This payment has been successfully released to your account.
                    {payment.releasedAt && ` Released on ${new Date(payment.releasedAt).toLocaleString()}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {payment.status === "OnHold" && (
            <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-1 text-orange-600" size={20} />
                <div>
                  <p className="font-medium text-orange-900">Payment On Hold</p>
                  <p className="mt-1 text-sm text-orange-700">
                    This payment is currently on hold due to a reported issue. Please contact support for more
                    information.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 pt-4 border-t md:grid-cols-2">
            <div>
              <p className="mb-1 text-sm text-gray-600">Customer Name</p>
              <p className="font-medium text-gray-900">{payment.customerName}</p>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600">Payment Method</p>
              <p className="font-medium text-gray-900">{payment.paymentMethod}</p>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600">Transaction ID</p>
              <p className="font-medium text-gray-900">{payment.transactionId || "N/A"}</p>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600">Created At</p>
              <p className="font-medium text-gray-900">{new Date(payment.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {payment.timeline && payment.timeline.length > 0 && (
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Payment Timeline</h3>
          <div className="space-y-4">
            {payment.timeline.map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  </div>
                  {index < payment.timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-gray-900">{event.event}</p>
                  <p className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                  {event.note && <p className="mt-1 text-sm text-gray-600">{event.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentDetail
