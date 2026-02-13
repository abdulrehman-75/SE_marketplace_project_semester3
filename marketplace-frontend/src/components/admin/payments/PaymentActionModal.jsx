"use client"

import { useState } from "react"
import { X } from "lucide-react"
import Button from "../../common/Button"
import ErrorMessage from "../../common/ErrorMessage"
import adminService from "../../../services/adminService"

const PaymentActionModal = ({ payment, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [action, setAction] = useState("Release")
  const [reason, setReason] = useState("")
  const [notifySeller, setNotifySeller] = useState(true)
  const [notifyCustomer, setNotifyCustomer] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError("Please provide a reason for this action")
      return
    }

    if (!confirm(`Are you sure you want to ${action.toLowerCase()} this payment?`)) return

    try {
      setLoading(true)
      setError(null)
      const response = await adminService.manualPaymentAction({
        verificationId: payment.verificationId,
        action,
        reason,
        notifySeller,
        notifyCustomer,
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
          <h2 className="text-xl font-bold text-gray-900">Manual Payment Action</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <ErrorMessage message={error} />}

          <div>
            <p className="mb-2 text-sm text-gray-600">
              Payment ID: <span className="font-medium text-gray-900">{payment.verificationId}</span>
            </p>
            <p className="mb-2 text-sm text-gray-600">
              Amount: <span className="font-medium text-gray-900">Rs. {payment.amount.toLocaleString()}</span>
            </p>
            <p className="text-sm text-gray-600">
              Seller: <span className="font-medium text-gray-900">{payment.sellerShopName}</span>
            </p>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Release">Release Payment</option>
              <option value="Hold">Hold Payment</option>
              <option value="Dispute">Mark as Disputed</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Reason *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Provide a reason for this action..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notifySeller}
                onChange={(e) => setNotifySeller(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Notify Seller</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notifyCustomer}
                onChange={(e) => setNotifyCustomer(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Notify Customer</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} variant={action === "Release" ? "success" : "danger"}>
              {loading ? "Processing..." : `${action} Payment`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentActionModal
