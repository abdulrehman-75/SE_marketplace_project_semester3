"use client"

import { useEffect, useState } from "react"
import { Heart, Star, ChevronLeft, ChevronRight, UserMinus } from "lucide-react"
import customerService from "../../../services/customerService"
import Button from "../../common/Button"
import Loader from "../../common/Loader"

export default function FollowedSellers({
  onNavigate,
  onSelectProduct,
  onSelectOrder,
}) {
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [unfollowing, setUnfollowing] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchSellers()
  }, [currentPage])

  const fetchSellers = async () => {
    try {
      setLoading(true)
      const response = await customerService.getFollowedSellers(currentPage, 10)
      setSellers(response.data.items)
      setPagination(response.data)
    } catch (error) {
      console.error("Error fetching followed sellers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnfollow = async (e, sellerId) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to unfollow this seller?")) return

    try {
      setUnfollowing(sellerId)
      await customerService.unfollowSeller(sellerId)
      fetchSellers()
    } catch (error) {
      console.error("Error unfollowing seller:", error)
      alert(error.message || "Failed to unfollow seller")
    } finally {
      setUnfollowing(null)
    }
  }

  const renderStars = (rating) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Followed Sellers</h1>
      </div>

      {sellers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg shadow">
          <Heart size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No followed sellers</h3>
          <p className="mb-6 text-gray-600">Start following sellers to see their updates!</p>
          <Button onClick={() => onNavigate("products")}>Browse Products</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {sellers.map((seller) => (
              <div
                key={seller.sellerId}
                className="p-6 transition-shadow bg-white rounded-lg shadow hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4">
                    {seller.shopLogo && (
                      <img
                        src={seller.shopLogo}
                        alt={seller.shopName}
                        className="object-cover w-16 h-16 rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{seller.shopName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(seller.overallRating)}
                        <span className="text-xs text-gray-600">
                          {seller.overallRating.toFixed(1)} ({seller.totalReviews})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {seller.shopDescription && (
                  <p className="mb-4 text-sm text-gray-700 line-clamp-2">
                    {seller.shopDescription}
                  </p>
                )}

                <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                  <span>{seller.totalProducts} Products</span>
                  <span>Following since {new Date(seller.dateFollowed).toLocaleDateString()}</span>
                </div>

                <Button
                  variant="outline"
                  onClick={(e) => handleUnfollow(e, seller.sellerId)}
                  disabled={unfollowing === seller.sellerId}
                  className="w-full text-red-600 border-red-600 hover:bg-red-50"
                >
                  {unfollowing === seller.sellerId ? <Loader /> : (
                    <>
                      <UserMinus size={16} className="mr-2" />
                      Unfollow
                    </>
                  )}
                </Button>
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