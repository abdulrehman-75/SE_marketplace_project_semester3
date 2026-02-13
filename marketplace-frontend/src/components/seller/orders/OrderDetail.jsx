"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, CheckCircle, Package, MapPin, CreditCard } from "lucide-react"
import sellerService from "../../../services/sellerService"

const OrderDetail = ({ orderId, onBack }) => {
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await sellerService.getOrderById(orderId)
      setOrder(response.data)
    } catch (error) {
      console.error("[v0] Error fetching order:", error)
      alert(error.message || "Failed to load order")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!window.confirm("Are you sure you want to confirm this order?")) {
      return
    }

    try {
      setConfirming(true)
      await sellerService.confirmOrder(orderId)
      alert("Order confirmed successfully")
      fetchOrder()
    } catch (error) {
      console.error("[v0] Error confirming order:", error)
      alert(error.message || "Failed to confirm order")
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Order not found</p>
        <button onClick={onBack} className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          Go Back
        </button>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700"
      case "Pending":
        return "bg-yellow-100 text-yellow-700"
      case "Cancelled":
        return "bg-red-100 text-red-700"
      case "Delivered":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Back to Orders
        </button>
        {order.status === "Pending" && (
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle size={18} />
            {confirming ? "Confirming..." : "Confirm Order"}
          </button>
        )}
      </div>

      {/* Order Info */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order #{order.id}</h2>
            <p className="text-gray-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Customer Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package size={20} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">Customer</h3>
            </div>
            <p className="text-gray-600">{order.customerName}</p>
            <p className="text-gray-600">{order.customerEmail}</p>
            <p className="text-gray-600">{order.customerPhone}</p>
          </div>

          {/* Delivery Address */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={20} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">Delivery Address</h3>
            </div>
            <p className="text-gray-600">{order.deliveryAddress}</p>
            <p className="text-gray-600">
              {order.city}, {order.state} {order.zipCode}
            </p>
            <p className="text-gray-600">{order.country}</p>
          </div>

          {/* Payment Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={20} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">Payment</h3>
            </div>
            <p className="text-gray-600">Method: {order.paymentMethod}</p>
            <p className="text-gray-600">Status: {order.paymentStatus}</p>
            <p className="mt-2 text-xl font-bold text-gray-900">${order.totalAmount}</p>
          </div>
        </div>
      </div>

      {/* Your Items */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Your Items in This Order</h3>
        <div className="space-y-3">
          {order.myOrderItems?.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-blue-50">
              <div className="flex items-center gap-4">
                <img
                  src={item.productImageUrl || "/placeholder.svg?height=60&width=60"}
                  alt={item.productName}
                  className="object-cover w-16 h-16 rounded"
                />
                <div>
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${item.unitPrice}</p>
                <p className="text-sm text-gray-500">Total: ${(item.quantity * item.unitPrice).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Order Items (Multi-vendor) */}
      {order.allOrderItems && order.allOrderItems.length > order.myOrderItems?.length && (
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">All Order Items (Multi-vendor Order)</h3>
          <p className="mb-4 text-sm text-gray-500">This order contains items from multiple sellers</p>
          <div className="space-y-3">
            {order.allOrderItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  item.isMine ? "bg-blue-50 border-2 border-blue-200" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.productImageUrl || "/placeholder.svg?height=60&width=60"}
                    alt={item.productName}
                    className="object-cover w-16 h-16 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-500">
                      Seller: {item.sellerName} {item.isMine && "(You)"}
                    </p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${item.unitPrice}</p>
                  <p className="text-sm text-gray-500">Total: ${(item.quantity * item.unitPrice).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          {order.status === "Pending" && order.myOrderItems?.length > 0 && (
            <div className="p-4 mt-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> After you confirm your items, the order will wait for other sellers to confirm
                their items before it can be completed.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default OrderDetail
