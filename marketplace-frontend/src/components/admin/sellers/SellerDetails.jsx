"use client"

import { X, Mail, Phone, MapPin, Calendar, DollarSign, Package, Star, Users } from "lucide-react"
import Button from "../../common/Button"

const SellerDetails = ({ seller, onClose }) => {
  if (!seller) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Seller Details</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Shop Info */}
          <div className="flex items-start gap-4">
            {seller.shopLogo && (
              <img
                src={seller.shopLogo || "/placeholder.svg"}
                alt={seller.shopName}
                className="object-cover w-20 h-20 rounded-lg"
              />
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900">{seller.shopName}</h3>
              <p className="mt-1 text-gray-600">{seller.shopDescription}</p>
              <div className="flex items-center gap-4 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    seller.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {seller.isVerified ? "Verified" : "Unverified"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    seller.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {seller.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{seller.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{seller.contactPhone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-gray-900">
                  {seller.address}, {seller.city}, {seller.country || "Pakistan"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Registered</p>
                <p className="text-gray-900">{new Date(seller.dateRegistered).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Business Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-blue-50">
              <DollarSign className="w-6 h-6 mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-xl font-bold text-gray-900">Rs. {seller.totalSales?.toLocaleString()}</p>
            </div>

            <div className="p-4 rounded-lg bg-green-50">
              <Package className="w-6 h-6 mb-2 text-green-600" />
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-xl font-bold text-gray-900">{seller.totalProducts}</p>
            </div>

            <div className="p-4 rounded-lg bg-yellow-50">
              <Star className="w-6 h-6 mb-2 text-yellow-600" />
              <p className="text-sm text-gray-600">Rating</p>
              <p className="text-xl font-bold text-gray-900">{seller.overallRating?.toFixed(1)} / 5</p>
            </div>

            <div className="p-4 rounded-lg bg-purple-50">
              <Users className="w-6 h-6 mb-2 text-purple-600" />
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-xl font-bold text-gray-900">{seller.totalOrders}</p>
            </div>
          </div>

          {/* Bank Details */}
          {seller.bankAccountName && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="mb-3 font-semibold text-gray-900">Bank Details</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500">Account Name</p>
                  <p className="text-gray-900">{seller.bankAccountName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Number</p>
                  <p className="text-gray-900">{seller.bankAccountNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bank Name</p>
                  <p className="text-gray-900">{seller.bankName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Business Registration */}
          {seller.businessRegistrationNumber && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="mb-2 font-semibold text-gray-900">Business Registration</h4>
              <p className="text-gray-900">{seller.businessRegistrationNumber}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SellerDetails
