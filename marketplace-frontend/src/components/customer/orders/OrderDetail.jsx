"use client"

import { useEffect, useState } from "react"
import {
  Package,
  MapPin,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Star,
} from "lucide-react"
import customerService from "../../../services/customerService"
import Button from "../../common/Button"
import Loader from "../../common/Loader"

export default function OrderDetail({
  orderId,
  onNavigate,
  onSelectProduct,
  onSelectOrder,
}) {
  const [order, setOrder] = useState(null)
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showProblemModal, setShowProblemModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [cancellationReason, setCancellationReason] = useState("")
  const [problemDescription, setProblemDescription] = useState("")
  
  // Review state
  const [selectedReviewItem, setSelectedReviewItem] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")

  useEffect(() => {
    fetchOrderData()
  }, [orderId])

  const fetchOrderData = async () => {
    try {
      setLoading(true)
      const [orderData, trackingData] = await Promise.all([
        customerService.getOrderById(orderId),
        customerService.trackOrder(orderId),
      ])
      setOrder(orderData.data)
      setTracking(trackingData.data)
    } catch (error) {
      alert(error.message || "Failed to load order details")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (cancellationReason.trim().length < 10) {
      alert("Cancellation reason must be at least 10 characters")
      return
    }
    try {
      setActionLoading(true)
      await customerService.cancelOrder(orderId, cancellationReason)
      alert("Order cancelled successfully")
      setShowCancelModal(false)
      setCancellationReason("")
      fetchOrderData()
    } catch (error) {
      alert(error.message || "Failed to cancel order")
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmReceipt = async () => {
    try {
      setActionLoading(true)
      const response = await customerService.confirmReceipt(orderId)
      alert(response.message || "Receipt confirmed successfully")
      setShowConfirmModal(false)
      fetchOrderData()
    } catch (error) {
      alert(error.message || "Failed to confirm receipt")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReportProblem = async () => {
    if (problemDescription.trim().length < 10) {
      alert("Problem description must be at least 10 characters")
      return
    }
    try {
      setActionLoading(true)
      await customerService.reportProblem(orderId, problemDescription)
      alert("Problem reported successfully")
      setShowProblemModal(false)
      setProblemDescription("")
      fetchOrderData()
    } catch (error) {
      alert(error.message || "Failed to report problem")
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenReviewModal = (item) => {
    setSelectedReviewItem(item)
    setReviewRating(5)
    setReviewComment("")
    setShowReviewModal(true)
  }

  const handleSubmitReview = async () => {
    if (!selectedReviewItem) return
    
    if (reviewComment.trim().length < 10) {
      alert("Review comment must be at least 10 characters")
      return
    }

    try {
      setActionLoading(true)
      const response = await customerService.createReview({
        productId: selectedReviewItem.productId,
        orderId: orderId,
        rating: reviewRating,
        comment: reviewComment,
      })
      alert(response.message || "Review submitted successfully")
      setShowReviewModal(false)
      setSelectedReviewItem(null)
      setReviewRating(5)
      setReviewComment("")
    } catch (error) {
      alert(error.message || "Failed to submit review")
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const map = {
      Pending: "bg-yellow-100 text-yellow-700",
      Confirmed: "bg-blue-100 text-blue-700",
      PickedUp: "bg-purple-100 text-purple-700",
      OnTheWay: "bg-indigo-100 text-indigo-700",
      Delivered: "bg-green-100 text-green-700",
      Completed: "bg-green-100 text-green-700",
      Cancelled: "bg-red-100 text-red-700",
      Disputed: "bg-orange-100 text-orange-700",
    }
    return map[status] || "bg-gray-100 text-gray-700"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    )
  }

  if (!order || !tracking) {
    return <p className="py-12 text-center text-gray-600">Order not found</p>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <button
        onClick={() => onNavigate("orders")}
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to Orders
      </button>

      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order #{order.orderId}</h1>
          <p className="text-gray-600">{new Date(order.orderDate).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">Rs. {order.grandTotal.toLocaleString()}</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
            {order.orderStatus}
          </span>
        </div>
      </div>


{/* Order Items */}
<div className="p-6 bg-white rounded-lg shadow">
  <h2 className="mb-4 text-xl font-bold">Order Items</h2>
  <div className="space-y-4">
    {order.orderItems.map((item) => (
      <div
        key={item.orderItemId}
        className="flex gap-4 pb-4 border-b last:border-0"
      >
        <img
          src={item.productImage || "/placeholder.svg"}
          alt={item.productName}
          className="w-20 h-20 rounded-lg cursor-pointer"
          onClick={() => onSelectProduct(item.productId)}
        />
        <div className="flex-1">
          <p
            className="font-semibold cursor-pointer hover:text-blue-600"
            onClick={() => onSelectProduct(item.productId)}
          >
            {item.productName}
          </p>
          <p className="text-sm text-gray-600">Seller: {item.sellerShopName}</p>
          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
          
          {/* ✅ UPDATED: Show review button for Completed orders OR after customer confirms receipt */}
          {(order.orderStatus === "Completed" || order.customerConfirmedReceipt) && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => handleOpenReviewModal(item)}
            >
              <Star size={16} className="mr-1" />
              Write Review
            </Button>
          )}
        </div>
        <p className="font-semibold">Rs. {item.subtotal.toLocaleString()}</p>
      </div>
    ))}
  </div>
</div>

      {/* Delivery Information */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-xl font-bold">Delivery Information</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Address:</strong> {order.deliveryAddress}</p>
          <p><strong>City:</strong> {order.deliveryCity}</p>
          <p><strong>Postal Code:</strong> {order.deliveryPostalCode}</p>
          <p><strong>Phone:</strong> {order.customerPhone}</p>
        </div>
      </div>

      {/* Payment Information */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-xl font-bold">Payment Information</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>Rs. {order.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Buyer Protection Fee:</span>
            <span>Rs. {order.buyerProtectionFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-2 font-bold border-t">
            <span>Total:</span>
            <span>Rs. {order.grandTotal.toLocaleString()}</span>
          </div>
          <div className="pt-2 border-t">
            <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
            <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 p-6 bg-white rounded-lg shadow">
        {tracking.canCancel && (
          <Button
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={() => setShowCancelModal(true)}
          >
            <XCircle size={18} className="mr-2" />
            Cancel Order
          </Button>
        )}

        {tracking.canConfirmReceipt && (
          <Button onClick={() => setShowConfirmModal(true)}>
            <CheckCircle size={18} className="mr-2" />
            Confirm Receipt
          </Button>
        )}

        {tracking.canReportProblem && (
          <Button
            variant="outline"
            className="text-orange-600 border-orange-600 hover:bg-orange-50"
            onClick={() => setShowProblemModal(true)}
          >
            <AlertCircle size={18} className="mr-2" />
            Report Problem
          </Button>
        )}
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h3 className="mb-4 text-xl font-bold">Cancel Order</h3>
            <p className="mb-4 text-sm text-gray-600">
              Please provide a reason for cancellation (minimum 10 characters):
            </p>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              rows="4"
              placeholder="Enter cancellation reason..."
            />
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelModal(false)
                  setCancellationReason("")
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCancelOrder}
                disabled={actionLoading || cancellationReason.trim().length < 10}
                className="bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? <Loader /> : "Confirm Cancellation"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Receipt Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h3 className="mb-4 text-xl font-bold">Confirm Receipt</h3>
            <p className="mb-6 text-sm text-gray-600">
              By confirming receipt, you acknowledge that you have received the order
              in good condition. Payment will be released to the seller.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmReceipt}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader /> : "Confirm Receipt"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Report Problem Modal */}
      {showProblemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h3 className="mb-4 text-xl font-bold">Report Problem</h3>
            <p className="mb-4 text-sm text-gray-600">
              Describe the issue with your order (minimum 10 characters):
            </p>
            <textarea
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              rows="4"
              placeholder="Describe the problem..."
            />
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowProblemModal(false)
                  setProblemDescription("")
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReportProblem}
                disabled={actionLoading || problemDescription.trim().length < 10}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {actionLoading ? <Loader /> : "Submit Report"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedReviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h3 className="mb-4 text-xl font-bold">Write Review</h3>
            <div className="mb-4">
              <img
                src={selectedReviewItem.productImage || "/placeholder.svg"}
                alt={selectedReviewItem.productName}
                className="w-20 h-20 mb-2 rounded-lg"
              />
              <p className="font-semibold">{selectedReviewItem.productName}</p>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={
                        star <= reviewRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">
                Review Comment (minimum 10 characters)
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows="4"
                placeholder="Share your experience with this product..."
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewModal(false)
                  setSelectedReviewItem(null)
                  setReviewRating(5)
                  setReviewComment("")
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={actionLoading || reviewComment.trim().length < 10}
              >
                {actionLoading ? <Loader /> : "Submit Review"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}