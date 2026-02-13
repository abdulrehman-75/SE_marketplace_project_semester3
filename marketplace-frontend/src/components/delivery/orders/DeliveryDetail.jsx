// components/delivery/orders/DeliveryDetail.jsx
"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Package, MapPin, Phone, User, DollarSign, Truck, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import deliveryStaffService from "../../../services/deliveryStaffService"

const DeliveryDetail = ({ deliveryId, onBack }) => {
  const [loading, setLoading] = useState(true)
  const [delivery, setDelivery] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [showUnassignModal, setShowUnassignModal] = useState(false)
  const [unassignReason, setUnassignReason] = useState("")
  const [showDeliverModal, setShowDeliverModal] = useState(false)
  const [deliveryNotes, setDeliveryNotes] = useState("")

  useEffect(() => {
    if (deliveryId) {
      fetchDelivery()
    }
  }, [deliveryId])

  const fetchDelivery = async () => {
    try {
      setLoading(true)
      const response = await deliveryStaffService.getOrderDetails(deliveryId)
      setDelivery(response.data)
    } catch (error) {
      console.error("Error fetching delivery:", error)
      alert(error.message || "Failed to load delivery details")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to update status to "${newStatus}"?`)) {
      return
    }

    try {
      setUpdating(true)
      await deliveryStaffService.updateOrderStatus(deliveryId, newStatus)
      alert("Status updated successfully")
      fetchDelivery()
    } catch (error) {
      console.error("Error updating status:", error)
      alert(error.message || "Failed to update status")
    } finally {
      setUpdating(false)
    }
  }

  const handleMarkAsDelivered = async () => {
    try {
      setUpdating(true)
      await deliveryStaffService.markAsDelivered(deliveryId, deliveryNotes)
      alert("Order marked as delivered successfully!")
      setShowDeliverModal(false)
      setDeliveryNotes("")
      fetchDelivery()
    } catch (error) {
      console.error("Error marking as delivered:", error)
      alert(error.message || "Failed to mark as delivered")
    } finally {
      setUpdating(false)
    }
  }

  const handleUnassign = async () => {
    if (!unassignReason.trim()) {
      alert("Please provide a reason for unassigning")
      return
    }

    try {
      setUpdating(true)
      await deliveryStaffService.unassignOrder(deliveryId, unassignReason)
      alert("Order unassigned successfully")
      setShowUnassignModal(false)
      onBack()
    } catch (error) {
      console.error("Error unassigning order:", error)
      alert(error.message || "Failed to unassign order")
    } finally {
      setUpdating(false)
    }
  }

  const getImageSrc = (imageUrl) => {
    if (imageUrl && imageUrl.startsWith('http')) {
      return imageUrl
    }
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect fill='%23e5e7eb' width='60' height='60'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='12' fill='%239ca3af'%3ENO%3C/text%3E%3C/svg%3E"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!delivery) {
    return (
      <div className="py-12 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">Delivery not found</p>
        <button onClick={onBack} className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          Go Back
        </button>
      </div>
    )
  }

  const canPickUp = delivery.orderStatus === "Confirmed"
  const canMarkOnTheWay = delivery.orderStatus === "PickedUp"
  const canDeliver = delivery.orderStatus === "OnTheWay"
  const canUnassign = ["Confirmed", "PickedUp", "OnTheWay"].includes(delivery.orderStatus)

  const getStatusColor = (status) => {
    const statusMap = {
      Confirmed: "bg-blue-100 text-blue-700",
      PickedUp: "bg-purple-100 text-purple-700",
      OnTheWay: "bg-orange-100 text-orange-700",
      Delivered: "bg-green-100 text-green-700"
    }
    return statusMap[status] || "bg-gray-100 text-gray-700"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Back to Deliveries
        </button>
        {canUnassign && (
          <button
            onClick={() => setShowUnassignModal(true)}
            disabled={updating}
            className="px-4 py-2 text-red-600 rounded-lg bg-red-50 hover:bg-red-100 disabled:opacity-50"
          >
            Unassign Order
          </button>
        )}
      </div>

      {/* Order Info */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order #{delivery.id}</h2>
            <p className="text-gray-500">Placed on {new Date(delivery.orderDate).toLocaleString()}</p>
          </div>
          <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(delivery.orderStatus)}`}>
            {delivery.orderStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Customer Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User size={20} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">Customer</h3>
            </div>
            <p className="text-gray-600">{delivery.customerName}</p>
            <div className="flex items-center gap-2 mt-2">
              <Phone size={16} className="text-gray-400" />
              <a href={`tel:${delivery.customerPhone}`} className="text-blue-600 hover:underline">
                {delivery.customerPhone}
              </a>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={20} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">Delivery Address</h3>
            </div>
            <p className="text-gray-600">{delivery.deliveryAddress}</p>
            <p className="text-gray-600">
              {delivery.deliveryCity}, {delivery.deliveryPostalCode}
            </p>
          </div>

          {/* Payment Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={20} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">Payment</h3>
            </div>
            <p className="text-gray-600">Method: {delivery.paymentMethod}</p>
            <p className="text-gray-600">Status: {delivery.paymentStatus}</p>
            <p className="mt-2 text-xl font-bold text-gray-900">${delivery.grandTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {(canPickUp || canMarkOnTheWay || canDeliver) && (
        <div className="p-6 text-white rounded-lg shadow-sm bg-gradient-to-r from-blue-500 to-blue-600">
          <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {canPickUp && (
              <button
                onClick={() => handleUpdateStatus("PickedUp")}
                disabled={updating}
                className="flex items-center justify-center gap-2 px-4 py-3 transition-colors bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50"
              >
                <Package size={20} />
                Mark as Picked Up
              </button>
            )}
            {canMarkOnTheWay && (
              <button
                onClick={() => handleUpdateStatus("OnTheWay")}
                disabled={updating}
                className="flex items-center justify-center gap-2 px-4 py-3 transition-colors bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50"
              >
                <Truck size={20} />
                Mark as On The Way
              </button>
            )}
            {canDeliver && (
              <button
                onClick={() => setShowDeliverModal(true)}
                disabled={updating}
                className="flex items-center justify-center gap-2 px-4 py-3 transition-colors bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50"
              >
                <CheckCircle size={20} />
                Mark as Delivered
              </button>
            )}
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Order Items ({delivery.totalItems})</h3>
        <div className="space-y-3">
          {delivery.orderItems?.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-4">
                <img
                  src={getImageSrc(item.productImage)}
                  alt={item.productName}
                  className="object-cover w-16 h-16 rounded"
                  loading="lazy"
                />
                <div>
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-500">Seller: {item.sellerShopName}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${item.unitPrice.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Total: ${item.subtotal.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unassign Modal */}
      {showUnassignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Unassign Order</h3>
            <p className="mb-4 text-sm text-gray-600">
              Please provide a reason for unassigning this order:
            </p>
            <textarea
              value={unassignReason}
              onChange={(e) => setUnassignReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter reason..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowUnassignModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUnassign}
                disabled={updating || !unassignReason.trim()}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {updating ? "Unassigning..." : "Unassign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deliver Modal */}
      {showDeliverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Mark as Delivered</h3>
            <p className="mb-4 text-sm text-gray-600">
              Add any delivery notes (optional):
            </p>
            <textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Delivery notes..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeliverModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsDelivered}
                disabled={updating}
                className="flex-1 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {updating ? "Processing..." : "Confirm Delivery"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeliveryDetail