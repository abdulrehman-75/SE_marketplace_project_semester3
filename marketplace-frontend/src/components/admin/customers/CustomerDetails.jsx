"use client"

import { X, Mail, Phone, MapPin, Calendar, DollarSign, ShoppingCart, Star, MessageSquare } from "lucide-react"
import Button from "../../common/Button"

const CustomerDetails = ({ customer, onClose }) => {
  if (!customer) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Customer Details</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">{customer.fullName}</h3>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  customer.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {customer.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{customer.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{customer.phone || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-gray-900">{customer.city || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Registered</p>
                <p className="text-gray-900">{new Date(customer.dateRegistered).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-blue-50">
              <DollarSign className="w-6 h-6 mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-xl font-bold text-gray-900">Rs. {customer.totalSpent?.toLocaleString()}</p>
            </div>

            <div className="p-4 rounded-lg bg-green-50">
              <ShoppingCart className="w-6 h-6 mb-2 text-green-600" />
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-xl font-bold text-gray-900">{customer.totalOrders}</p>
            </div>

            <div className="p-4 rounded-lg bg-yellow-50">
              <Star className="w-6 h-6 mb-2 text-yellow-600" />
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-xl font-bold text-gray-900">{customer.totalReviews}</p>
            </div>

            <div className="p-4 rounded-lg bg-red-50">
              <MessageSquare className="w-6 h-6 mb-2 text-red-600" />
              <p className="text-sm text-gray-600">Complaints</p>
              <p className="text-xl font-bold text-gray-900">{customer.totalComplaints}</p>
            </div>
          </div>

          {/* Shipping Address */}
          {customer.shippingAddress && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="mb-3 font-semibold text-gray-900">Shipping Address</h4>
              <p className="text-gray-900">{customer.shippingAddress}</p>
              <p className="text-gray-900">
                {customer.city}, {customer.postalCode}
              </p>
              <p className="text-gray-900">{customer.country}</p>
            </div>
          )}

          {/* Recent Orders */}
          {customer.recentOrders && customer.recentOrders.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="mb-3 font-semibold text-gray-900">Recent Orders</h4>
              <div className="space-y-3">
                {customer.recentOrders.map((order) => (
                  <div key={order.orderId} className="flex items-center justify-between p-3 rounded bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.orderId}</p>
                      <p className="text-sm text-gray-600">{new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">Rs. {order.grandTotal.toLocaleString()}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.orderStatus === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
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

export default CustomerDetails
