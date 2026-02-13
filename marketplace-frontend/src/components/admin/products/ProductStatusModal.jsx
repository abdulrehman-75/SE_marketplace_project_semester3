"use client"

import { useState } from "react"
import { X } from "lucide-react"
import Button from "../../common/Button"
import ErrorMessage from "../../common/ErrorMessage"
import adminService from "../../../services/adminService"

const ProductStatusModal = ({ product, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isActive, setIsActive] = useState(product.isActive)
  const [reason, setReason] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isActive && !reason.trim()) {
      setError("Please provide a reason for deactivating this product")
      return
    }

    if (!confirm(`Are you sure you want to ${isActive ? "activate" : "deactivate"} this product?`)) return

    try {
      setLoading(true)
      setError(null)
      const response = await adminService.updateProductStatus({
        productId: product.productId,
        isActive,
        reason: reason || undefined,
      })
      if (response.data.success) {
        onSuccess()
        onClose()
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Update Product Status</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <ErrorMessage message={error} />}

          <div>
            <p className="mb-2 text-sm text-gray-600">
              Product: <span className="font-medium text-gray-900">{product.productName}</span>
            </p>
            <p className="text-sm text-gray-600">
              Seller: <span className="font-medium text-gray-900">{product.sellerShopName}</span>
            </p>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Status</label>
            <select
              value={isActive ? "true" : "false"}
              onChange={(e) => setIsActive(e.target.value === "true")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {!isActive && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Reason for Deactivation *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Provide a reason for deactivating this product..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} variant={isActive ? "success" : "danger"}>
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductStatusModal
