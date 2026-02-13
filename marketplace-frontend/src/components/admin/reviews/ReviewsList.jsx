"use client"

import { useEffect, useState } from "react"
import { Star, CheckCircle } from "lucide-react"
import adminService from "../../../services/adminService"
import Loader from "../../common/Loader"
import ErrorMessage from "../../common/ErrorMessage"
import Button from "../../common/Button"
import ModerateReviewModal from "./ModerateReviewModal"

const ReviewsList = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reviews, setReviews] = useState([])
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({
    PageNumber: 1,
    PageSize: 10,
  })
  const [selectedReview, setSelectedReview] = useState(null)
  const [showModerateModal, setShowModerateModal] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminService.getReviews(filters)
      if (response.data.success) {
        setReviews(response.data.data.items)
        setPagination({
          pageNumber: response.data.data.pageNumber,
          pageSize: response.data.data.pageSize,
          totalCount: response.data.data.totalCount,
          totalPages: response.data.data.totalPages,
          hasPrevious: response.data.data.hasPrevious,
          hasNext: response.data.data.hasNext,
        })
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleModerate = (review) => {
    setSelectedReview(review)
    setShowModerateModal(true)
  }

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, PageNumber: newPage })
    setTimeout(fetchReviews, 0)
  }

  if (loading) {
    return <Loader fullScreen />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reviews Moderation</h1>
        <Button onClick={fetchReviews}>Refresh</Button>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="bg-white rounded-lg shadow">
        {reviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No reviews found</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <div key={review.reviewId} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{review.productName}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          review.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {review.isApproved ? "Approved" : "Pending"}
                      </span>
                      {review.isVerifiedPurchase && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{review.rating}/5</span>
                    </div>

                    <p className="mb-3 text-gray-700">{review.comment}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>By: {review.customerName}</span>
                      <span>Posted: {new Date(review.datePosted).toLocaleDateString()}</span>
                    </div>

                    {review.moderationNotes && (
                      <div className="p-3 mt-3 text-sm rounded bg-blue-50">
                        <p className="text-gray-600">
                          <span className="font-medium">Moderation Notes:</span> {review.moderationNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button variant="outline" onClick={() => handleModerate(review)} className="ml-4">
                    Moderate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {reviews.length} of {pagination.totalCount} reviews
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.pageNumber - 1)}
                disabled={!pagination.hasPrevious}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {pagination.pageNumber} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.pageNumber + 1)}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {showModerateModal && (
        <ModerateReviewModal
          review={selectedReview}
          onClose={() => setShowModerateModal(false)}
          onSuccess={fetchReviews}
        />
      )}
    </div>
  )
}

export default ReviewsList
