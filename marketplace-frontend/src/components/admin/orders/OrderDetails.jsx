"use client"

import { X, User, MapPin, Calendar, AlertCircle } from "lucide-react"
import Button from "../../common/Button"

const OrderDetails = ({ order, onClose }) => {
  if (!order) return null

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-700",
      Confirmed: "bg-blue-100 text-blue-700",
      PickedUp: "bg-purple-100 text-purple-700",
      OnTheWay: "bg-indigo-100 text-indigo-700",
      Delivered: "bg-green-100 text-green-700",
      Completed: "bg-green-100 text-green-700",
      Cancelled: "bg-red-100 text-red-700",
      Disputed: "bg-red-100 text-red-700",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order #{order.orderId}</h2>
            <p className="mt-1 text-sm text-gray-600">{new Date(order.orderDate).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex gap-4">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
              {order.orderStatus}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.paymentStatus)}`}>
              Payment: {order.paymentStatus}
            </span>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 mt-1 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium text-gray-900">{order.customerName}</p>
                <p className="text-sm text-gray-600">{order.customerEmail}</p>
                <p className="text-sm text-gray-600">{order.customerPhone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 mt-1 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Delivery Address</p>
                <p className="text-gray-900">{order.deliveryAddress}</p>
                <p className="text-gray-900">
                  {order.deliveryCity}, {order.deliveryPostalCode}
                </p>
              </div>
            </div>

            {order.deliveryStaffName && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 mt-1 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Delivery Staff</p>
                  <p className="font-medium text-gray-900">{order.deliveryStaffName}</p>
                </div>
              </div>
            )}

            {order.deliveryDate && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 mt-1 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Delivery Date</p>
                  <p className="text-gray-900">{new Date(order.deliveryDate).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Order Items</h3>
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500">Product</th>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500">Seller</th>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500">Quantity</th>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500">Price</th>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.orderItems?.map((item) => (
                    <tr key={item.orderItemId}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.productImage && (
                            <img
                              src={item.productImage || "/placeholder.svg"}
                              alt={item.productName}
                              className="object-cover w-12 h-12 rounded"
                            />
                          )}
                          <span className="text-sm text-gray-900">{item.productName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.sellerShopName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Rs. {item.unitPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        Rs. {item.subtotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-gray-900">Rs. {order.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Buyer Protection Fee</span>
                <span className="text-gray-900">Rs. {order.buyerProtectionFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold border-t">
                <span className="text-gray-900">Grand Total</span>
                <span className="text-gray-900">Rs. {order.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Problem Report */}
          {order.customerReportedProblem && order.problemDescription && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Customer Reported Problem</p>
                  <p className="mt-1 text-sm text-red-700">{order.problemDescription}</p>
                </div>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {order.adminNotes && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">Admin Notes</h3>
              <p className="p-3 text-sm text-gray-600 rounded bg-gray-50">{order.adminNotes}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails
