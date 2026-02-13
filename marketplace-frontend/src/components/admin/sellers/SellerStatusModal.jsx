"use client"

import { useState } from "react"
import { X, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Button from "../../common/Button"
import ErrorMessage from "../../common/ErrorMessage"
import adminService from "../../../services/adminService"

const SellerStatusModal = ({ seller, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isActive, setIsActive] = useState(seller.isActive)
  const [isVerified, setIsVerified] = useState(seller.isVerified)

  if (!seller) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check if anything changed
    if (isActive === seller.isActive && isVerified === seller.isVerified) {
      setError("No changes detected. Please modify at least one status.")
      return
    }

    const changes = []
    if (isActive !== seller.isActive) {
      changes.push(`${isActive ? "activate" : "deactivate"}`)
    }
    if (isVerified !== seller.isVerified) {
      changes.push(`${isVerified ? "verify" : "unverify"}`)
    }

    const confirmMessage = `Are you sure you want to ${changes.join(" and ")} this seller?\n\nSeller: ${seller.shopName}`
    
    if (!confirm(confirmMessage)) return

    try {
      setLoading(true)
      setError(null)

      const response = await adminService.updateSellerStatus({
        sellerId: seller.sellerId,
        isActive,
        isVerified,
      })

      if (response.data.success) {
        onSuccess()
        onClose()
      } else {
        setError(response.data.message || "Failed to update seller status")
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update seller status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-lg w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header - Sticky */}
        <div className="sticky top-0 flex items-center justify-between p-6 bg-white border-b border-gray-200 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-900">Update Seller Status</h2>
          <button 
            onClick={onClose} 
            className="p-2 transition-colors rounded-lg hover:bg-gray-100"
            type="button"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 space-y-6">
            {error && <ErrorMessage message={error} />}

            {/* Seller Info */}
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                {seller.shopLogo && (
                  <img
                    src={seller.shopLogo}
                    alt={seller.shopName}
                    className="flex-shrink-0 object-cover w-12 h-12 rounded-full"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{seller.shopName}</p>
                  <p className="text-sm text-gray-600 truncate">{seller.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    seller.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {seller.isVerified ? "Verified" : "Unverified"}
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    seller.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {seller.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Verification Status */}
            <div>
              <label className="block mb-3 text-sm font-medium text-gray-700">Verification Status</label>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  isVerified === true ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    checked={isVerified === true}
                    onChange={() => setIsVerified(true)}
                    className="flex-shrink-0 w-4 h-4 text-blue-600"
                  />
                  <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <span className="block font-medium text-gray-900">Verified</span>
                    <p className="text-xs text-gray-600">Seller is verified and trusted</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  isVerified === false ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    checked={isVerified === false}
                    onChange={() => setIsVerified(false)}
                    className="flex-shrink-0 w-4 h-4 text-blue-600"
                  />
                  <AlertCircle className="flex-shrink-0 w-5 h-5 text-yellow-600" />
                  <div className="flex-1 min-w-0">
                    <span className="block font-medium text-gray-900">Unverified</span>
                    <p className="text-xs text-gray-600">Seller needs verification</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Active Status */}
            <div>
              <label className="block mb-3 text-sm font-medium text-gray-700">Account Status</label>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  isActive === true ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    checked={isActive === true}
                    onChange={() => setIsActive(true)}
                    className="flex-shrink-0 w-4 h-4 text-blue-600"
                  />
                  <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <span className="block font-medium text-gray-900">Active</span>
                    <p className="text-xs text-gray-600">Seller can operate normally</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  isActive === false ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    checked={isActive === false}
                    onChange={() => setIsActive(false)}
                    className="flex-shrink-0 w-4 h-4 text-blue-600"
                  />
                  <XCircle className="flex-shrink-0 w-5 h-5 text-red-600" />
                  <div className="flex-1 min-w-0">
                    <span className="block font-medium text-gray-900">Inactive</span>
                    <p className="text-xs text-gray-600">Seller account is suspended</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Warning Note */}
            {(!isActive || !isVerified) && (
              <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0 text-sm text-yellow-800">
                    <p className="mb-1 font-medium">Important Notice:</p>
                    {!isActive && <p className="mb-1">• Inactive sellers cannot access their dashboard or manage products</p>}
                    {!isVerified && <p>• Unverified sellers may have limited visibility to customers</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Sticky */}
          <div className="sticky bottom-0 flex justify-end gap-3 p-6 bg-white border-t border-gray-200 rounded-b-lg">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SellerStatusModal