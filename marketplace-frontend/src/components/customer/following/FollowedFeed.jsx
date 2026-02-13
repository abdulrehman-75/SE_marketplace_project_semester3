"use client"

import { useEffect, useState } from "react"
import { Star, ShoppingCart, Grid, List, ChevronLeft, ChevronRight } from "lucide-react"
import customerService from "../../../services/customerService"
import Button from "../../common/Button"
import Loader from "../../common/Loader"

export default function FollowedFeed({
  onNavigate,
  onSelectProduct,
  onSelectOrder,
}) {
  const [products, setProducts] = useState([])
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("grid")
  const [selectedSeller, setSelectedSeller] = useState("")
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchSellers()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [currentPage, selectedSeller])

  const fetchSellers = async () => {
    try {
      const response = await customerService.getFollowedSellers(1, 100)
      setSellers(response.data.items)
    } catch (error) {
      console.error("Error fetching sellers:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const filters = {
        PageNumber: currentPage,
        PageSize: 20,
      }
      if (selectedSeller) {
        filters.SellerId = selectedSeller
      }

      const response = await customerService.getFollowedSellersProducts(filters)
      setProducts(response.data.items)
      setPagination(response.data)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
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

  const handleProductClick = (productId) => {
    onSelectProduct(productId)
    onNavigate("product-detail")
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Products from Followed Sellers</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* ✅ NEW: Seller Filter */}
      {sellers.length > 0 && (
        <div className="p-4 bg-white rounded-lg shadow">
          <label className="block mb-2 text-sm font-medium text-gray-700">Filter by Seller</label>
          <select
            value={selectedSeller}
            onChange={(e) => {
              setSelectedSeller(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sellers ({sellers.length})</option>
            {sellers.map((seller) => (
              <option key={seller.sellerId} value={seller.sellerId}>
                {seller.shopName}
              </option>
            ))}
          </select>
        </div>
      )}

      {products.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg shadow">
          <ShoppingCart size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No products found</h3>
          <p className="mb-4 text-gray-600">Your followed sellers haven't listed any products yet.</p>
          <Button onClick={() => onNavigate("followed")}>Manage Followed Sellers</Button>
        </div>
      ) : (
        <>
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-4"}>
            {products.map((product) => (
              <div
                key={product.productId}
                onClick={() => handleProductClick(product.productId)}
                className={`cursor-pointer bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${
                  viewMode === "list" ? "flex gap-4 p-4" : "overflow-hidden"
                }`}
              >
                <img
                  src={product.productImage || "/placeholder.svg"}
                  alt={product.productName}
                  className={viewMode === "grid" ? "w-full h-48 object-cover" : "w-32 h-32 object-cover rounded-lg"}
                />
                <div className={viewMode === "grid" ? "p-4" : "flex-1"}>
                  <h3 className="mb-2 font-semibold text-gray-900 line-clamp-2">{product.productName}</h3>
                  <p className="mb-2 text-sm text-gray-600">{product.sellerShopName}</p>
                  
                  {/* ✅ FIXED: Show product rating with number */}
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(product.sellerRating)}
                    <span className="text-xs text-gray-600">
                      {product.sellerRating?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                  
                  <p className="text-xl font-bold text-blue-600">Rs. {product.price.toLocaleString()}</p>
                  
                  {/* ✅ NEW: Stock status */}
                  {product.stockQuantity === 0 ? (
                    <p className="mt-2 text-sm font-medium text-red-600">Out of Stock</p>
                  ) : product.stockQuantity < 10 ? (
                    <p className="mt-2 text-sm text-orange-600">Only {product.stockQuantity} left</p>
                  ) : (
                    <p className="mt-2 text-sm text-green-600">In Stock</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(currentPage - 1)} 
                disabled={!pagination.hasPrevious}
              >
                <ChevronLeft size={18} className="mr-1" />
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(currentPage + 1)} 
                disabled={!pagination.hasNext}
              >
                Next
                <ChevronRight size={18} className="ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}