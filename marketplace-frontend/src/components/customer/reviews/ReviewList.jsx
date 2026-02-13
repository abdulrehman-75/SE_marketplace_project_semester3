"use client"

import { useEffect, useState } from "react"
import { Star, Package, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import customerService from "../../../services/customerService"
import Button from "../../common/Button"
import Loader from "../../common/Loader"

export default function ReviewList({ onNavigate, onSelectProduct }) {
  const [reviews, setReviews] = useState([])
  const [rateLimit, setRateLimit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchData()
  }, [currentPage])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [reviewsData, rateLimitData] = await Promise.all([
        customerService.getMyReviews(currentPage, 10),
        customerService.getReviewRateLimit(),
      ])
      setReviews(reviewsData.data.items)
      setPagination(reviewsData.data)
      setRateLimit(rateLimitData.data)
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} size={16} className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
      ))}
    </div>
  )

  const handleProductClick = (productId) => {
    onSelectProduct(productId)
    onNavigate("product-detail")
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
      </div>

      {rateLimit && (
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <p className="text-sm text-blue-700">
            <Clock size={16} className="inline mr-1" />
            You have written {rateLimit.totalReviewsToday} review(s) today. {rateLimit.reviewsRemaining} remaining
            (Daily limit: {rateLimit.dailyLimit})
          </p>
          {rateLimit.isLimited && <p className="mt-1 text-sm text-blue-700">Next reset: {new Date(rateLimit.nextResetTime).toLocaleString()}</p>}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg shadow">
          <Package size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No reviews yet</h3>
          <p className="mb-6 text-gray-600">Complete orders to write product reviews!</p>
          <Button onClick={() => onNavigate("orders")}>View Orders</Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map(review => (
              <div 
                key={review.reviewId} 
                className="p-6 transition-shadow bg-white rounded-lg shadow cursor-pointer hover:shadow-lg" 
                onClick={() => handleProductClick(review.productId)}
              >
                <p className="mb-2 font-semibold text-gray-900">{review.productName}</p>
                <div className="flex items-center gap-3 mt-2">
                  {renderStars(review.rating)}
                  {review.isVerifiedPurchase && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      Verified Purchase
                    </span>
                  )}
                </div>
                {review.comment && <p className="mt-3 text-sm text-gray-700">{review.comment}</p>}
                <p className="mt-3 text-xs text-gray-500">Posted on {new Date(review.datePosted).toLocaleDateString()}</p>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(currentPage - 1)} 
                disabled={!pagination.hasPrevious}
              >
                <ChevronLeft size={18} /> Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(currentPage + 1)} 
                disabled={!pagination.hasNext}
              >
                Next <ChevronRight size={18} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}