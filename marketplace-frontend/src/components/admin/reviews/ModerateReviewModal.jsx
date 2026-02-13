"use client"

import { useState } from "react"
import { X, Check, XCircle } from "lucide-react"
import Button from "../../common/Button"
import ErrorMessage from "../../common/ErrorMessage"
import adminService from "../../../services/adminService"

const ModerateReviewModal = ({ review, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isApproved, setIsApproved] = useState(review.isApproved)
  const [moderationNotes, setModerationNotes] = useState(review.moderationNotes || "")

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)
      const response = await adminService.moderateReview({
        reviewId: review.reviewId,
        isApproved,
        moderationNotes: moderationNotes || undefined,
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
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Moderate Review</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <ErrorMessage message={error} />}

          {/* Review Details */}
          <div className="p-4 space-y-3 rounded-lg bg-gray-50">
            <div>
              <p className="text-sm text-gray-600">Product</p>
              <p className="font-medium text-gray-900">{review.productName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-medium text-gray-900">{review.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rating</p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < review.rating ? "text-yellow-500" : "text-gray-300"}>
                    ★
                  </span>
                ))}
                <span className="ml-2 text-gray-900">{review.rating}/5</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Comment</p>
              <p className="text-gray-900">{review.comment}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className={`${review.isVerifiedPurchase ? "text-green-600" : "text-gray-500"}`}>
                {review.isVerifiedPurchase ? "✓ Verified Purchase" : "Not Verified Purchase"}
              </span>
              <span className="text-gray-500">Posted: {new Date(review.datePosted).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Moderation Decision */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Approval Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isApproved === true}
                  onChange={() => setIsApproved(true)}
                  className="w-4 h-4"
                />
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Approve</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isApproved === false}
                  onChange={() => setIsApproved(false)}
                  className="w-4 h-4"
                />
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-gray-700">Reject</span>
              </label>
            </div>
          </div>

          {/* Moderation Notes */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Moderation Notes (Optional)</label>
            <textarea
              value={moderationNotes}
              onChange={(e) => setModerationNotes(e.target.value)}
              rows={3}
              placeholder="Add notes about this moderation decision..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} variant={isApproved ? "success" : "danger"}>
              {loading ? "Saving..." : isApproved ? "Approve Review" : "Reject Review"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModerateReviewModal
