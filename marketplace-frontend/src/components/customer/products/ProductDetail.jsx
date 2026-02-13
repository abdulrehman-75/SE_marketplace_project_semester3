"use client"

import { useEffect, useState } from "react"
import { Star, ShoppingCart, Heart, Store, Package, Calendar, Plus, Minus, ArrowLeft, User } from "lucide-react"
import customerService from "../../../services/customerService"
import Button from "../../common/Button"
import Loader from "../../common/Loader"

export default function ProductDetail({
  productId,
  onNavigate,
  onSelectProduct,
  onSelectOrder,
  previousSection = "products",
}) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [following, setFollowing] = useState(false)
  const [updatingFollow, setUpdatingFollow] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await customerService.getProductById(productId)
      setProduct(response.data)
      setFollowing(response.data.isSellerFollowed)
    } catch (error) {
      console.error("Error fetching product:", error)
      alert("Failed to load product details")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true)
      await customerService.addToCart(product.productId, quantity)
      alert("Product added to cart!")
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert(error.message || "Failed to add to cart")
    } finally {
      setAddingToCart(false)
    }
  }

  const handleFollowToggle = async () => {
    try {
      setUpdatingFollow(true)
      if (following) {
        await customerService.unfollowSeller(product.sellerId)
      } else {
        await customerService.followSeller(product.sellerId)
      }
      setFollowing(!following)
    } catch (error) {
      console.error("Error toggling follow:", error)
      alert(error.message || "Failed to update follow status")
    } finally {
      setUpdatingFollow(false)
    }
  }

  const renderStars = (rating) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={
            star <= Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }
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

  if (!product) {
    return (
      <div className="p-12 text-center bg-white rounded-lg shadow">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          Product not found
        </h2>
        <Button onClick={() => onNavigate(previousSection)}>
          Go Back
        </Button>
      </div>
    )
  }

  const reviewsToShow = showAllReviews ? product.reviews : product.reviews.slice(0, 3)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate(previousSection)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Product Details</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 sm:gap-6">
        {/* Product Info */}
        <div className="space-y-4 lg:col-span-2 sm:space-y-6">
          {/* ✅ FIXED: Image container with max height and proper aspect ratio */}
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="relative w-full bg-gray-100" style={{ maxHeight: "500px" }}>
              <img
                src={product.productImage || "/placeholder.svg"}
                alt={product.productName}
                className="object-contain w-full h-full"
                style={{ maxHeight: "500px" }}
              />
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow sm:p-6">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">
              {product.productName}
            </h1>

            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i < Math.floor(product.averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
              <span className="text-sm text-gray-600">
                {product.averageRating.toFixed(1)} ({product.totalReviews} reviews)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                {new Date(product.dateListed).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Package size={16} />
                Stock: {product.stockQuantity}
              </span>
            </div>

            <div className="mb-4">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Description</h3>
              <p className="leading-relaxed text-gray-700">
                {product.description}
              </p>
            </div>
          </div>

          {/* Reviews Section */}
          {product.reviews && product.reviews.length > 0 && (
            <div className="p-4 bg-white rounded-lg shadow sm:p-6">
              <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Customer Reviews ({product.totalReviews})
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={
                          i < Math.floor(product.averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">
                    {product.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {reviewsToShow.map((review) => (
                  <div
                    key={review.reviewId}
                    className="pb-4 border-b last:border-0"
                  >
                    <div className="flex flex-col gap-3 mb-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-white bg-blue-600 rounded-full">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {review.customerName}
                          </p>
                          <div className="flex items-center gap-2">
                            {renderStars(review.rating)}
                            {review.isVerifiedPurchase && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 sm:text-right">
                        {new Date(review.datePosted).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm leading-relaxed text-gray-700">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {product.reviews.length > 3 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllReviews(!showAllReviews)}
                  >
                    {showAllReviews
                      ? "Show Less Reviews"
                      : `Show All ${product.totalReviews} Reviews`}
                  </Button>
                </div>
              )}
            </div>
          )}

          {(!product.reviews || product.reviews.length === 0) && (
            <div className="p-8 text-center bg-white rounded-lg shadow">
              <Star size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">
                No reviews yet. Be the first to review this product!
              </p>
            </div>
          )}
        </div>

        {/* ✅ FIXED: Sidebar with better responsiveness */}
        <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-24 h-fit">
          <div className="p-4 bg-white rounded-lg shadow sm:p-6">
            <p className="mb-4 text-2xl font-bold text-blue-600 sm:text-3xl">
              Rs. {product.price.toLocaleString()}
            </p>

            {product.stockQuantity > 0 ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = Number.parseInt(e.target.value) || 1
                      setQuantity(Math.min(product.stockQuantity, Math.max(1, val)))
                    }}
                    className="w-20 px-3 py-2 text-center border border-gray-300 rounded-lg"
                    min="1"
                    max={product.stockQuantity}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex items-center justify-center w-full gap-2 mb-3"
                >
                  {addingToCart ? <Loader /> : (
                    <>
                      <ShoppingCart size={18} />
                      Add to Cart
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onNavigate("cart")}
                >
                  View Cart
                </Button>
              </>
            ) : (
              <div className="p-4 text-center border border-red-200 rounded-lg bg-red-50">
                <p className="font-semibold text-red-600">Out of Stock</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-white rounded-lg shadow sm:p-6">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Seller Information</h3>
            
            {product.sellerShopLogo && (
              <img
                src={product.sellerShopLogo}
                alt={product.sellerShopName}
                className="object-cover w-20 h-20 mx-auto mb-4 rounded-lg"
              />
            )}
            
            <p className="mb-2 text-lg font-semibold text-center text-gray-900 sm:text-xl">
              {product.sellerShopName}
            </p>

            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < Math.floor(product.sellerOverallRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.sellerOverallRating.toFixed(1)} ({product.sellerTotalReviews} reviews)
              </span>
            </div>

            <Button
              variant="outline"
              className="w-full mb-2"
              onClick={() => onNavigate(`products?sellerId=${product.sellerId}`)}
            >
              <Store size={18} className="mr-2" />
              Visit Shop
            </Button>

            <Button
              className={`w-full flex items-center justify-center gap-2 ${
                following ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : ''
              }`}
              variant={following ? "outline" : "primary"}
              onClick={handleFollowToggle}
              disabled={updatingFollow}
            >
              {updatingFollow ? <Loader /> : (
                <>
                  <Heart size={18} className={following ? "fill-current" : ""} />
                  {following ? "Following" : "Follow Seller"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}